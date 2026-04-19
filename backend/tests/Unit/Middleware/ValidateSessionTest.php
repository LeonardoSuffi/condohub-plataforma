<?php

namespace Tests\Unit\Middleware;

use App\Http\Middleware\ValidateSession;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\Request;
use Tests\TestCase;
use Mockery;
use Laravel\Sanctum\PersonalAccessToken;

class ValidateSessionTest extends TestCase
{
    use RefreshDatabase;

    protected ValidateSession $middleware;

    protected function setUp(): void
    {
        parent::setUp();
        $this->middleware = new ValidateSession();
    }

    protected function tearDown(): void
    {
        Mockery::close();
        parent::tearDown();
    }

    // ========================================
    // No User Tests
    // ========================================

    /** @test */
    public function allows_request_when_no_user()
    {
        $request = Request::create('/api/test', 'GET');

        $response = $this->middleware->handle($request, function () {
            return response()->json(['success' => true]);
        });

        $this->assertEquals(200, $response->getStatusCode());
    }

    // ========================================
    // Blocked User Tests
    // ========================================

    /** @test */
    public function returns_403_for_blocked_user()
    {
        $empresa = $this->createEmpresa();
        $empresa->update([
            'is_blocked' => true,
            'blocked_reason' => 'Violação dos termos',
        ]);

        // Create a mock token
        $token = $empresa->createToken('test-session');

        $request = Request::create('/api/test', 'GET');
        $request->setUserResolver(fn() => $empresa);

        // Mock the currentAccessToken to return our token
        $empresa->withAccessToken($token->accessToken);

        $response = $this->middleware->handle($request, function () {
            return response()->json(['success' => true]);
        });

        $this->assertEquals(403, $response->getStatusCode());

        $data = json_decode($response->getContent(), true);
        $this->assertEquals('ACCOUNT_BLOCKED', $data['code']);
        $this->assertStringContainsString('bloqueada', $data['message']);
    }

    /** @test */
    public function blocked_response_includes_reason()
    {
        $empresa = $this->createEmpresa();
        $empresa->update([
            'is_blocked' => true,
            'blocked_reason' => 'Comportamento inadequado',
        ]);

        $token = $empresa->createToken('test-session');

        $request = Request::create('/api/test', 'GET');
        $request->setUserResolver(fn() => $empresa);
        $empresa->withAccessToken($token->accessToken);

        $response = $this->middleware->handle($request, function () {
            return response()->json(['success' => true]);
        });

        $data = json_decode($response->getContent(), true);
        $this->assertEquals('Comportamento inadequado', $data['reason']);
    }

    // ========================================
    // Session Validation Tests
    // ========================================

    /** @test */
    public function allows_valid_session()
    {
        $empresa = $this->createEmpresa();
        $sessionId = 'session-12345';

        // Set user's current session
        $empresa->update(['current_session_id' => $sessionId]);

        // Create token with matching session ID
        $token = $empresa->createToken($sessionId);

        $request = Request::create('/api/test', 'GET');
        $request->setUserResolver(fn() => $empresa);
        $empresa->withAccessToken($token->accessToken);

        $response = $this->middleware->handle($request, function () {
            return response()->json(['success' => true]);
        });

        $this->assertEquals(200, $response->getStatusCode());
    }

    /** @test */
    public function returns_401_for_mismatched_session()
    {
        $empresa = $this->createEmpresa();

        // Set user's current session to a different value
        $empresa->update(['current_session_id' => 'current-session-xyz']);

        // Create token with old session ID
        $token = $empresa->createToken('old-session-abc');

        $request = Request::create('/api/test', 'GET');
        $request->setUserResolver(fn() => $empresa);
        $empresa->withAccessToken($token->accessToken);

        $response = $this->middleware->handle($request, function () {
            return response()->json(['success' => true]);
        });

        $this->assertEquals(401, $response->getStatusCode());

        $data = json_decode($response->getContent(), true);
        $this->assertEquals('SESSION_EXPIRED', $data['code']);
        $this->assertStringContainsString('sessao foi encerrada', $data['message']);
    }

    /** @test */
    public function allows_when_no_current_session_id_set()
    {
        $empresa = $this->createEmpresa();
        $empresa->update(['current_session_id' => null]);

        $token = $empresa->createToken('any-session');

        $request = Request::create('/api/test', 'GET');
        $request->setUserResolver(fn() => $empresa);
        $empresa->withAccessToken($token->accessToken);

        $response = $this->middleware->handle($request, function () {
            return response()->json(['success' => true]);
        });

        $this->assertEquals(200, $response->getStatusCode());
    }

    // ========================================
    // TransientToken Tests (Testing Environment)
    // ========================================

    /** @test */
    public function skips_validation_for_transient_token()
    {
        $empresa = $this->createEmpresa();
        $empresa->update(['current_session_id' => 'some-session']);

        $request = Request::create('/api/test', 'GET');
        $request->setUserResolver(fn() => $empresa);

        // actingAs creates a TransientToken which should be skipped
        $this->actingAs($empresa);

        $response = $this->middleware->handle($request, function () {
            return response()->json(['success' => true]);
        });

        // Should pass because TransientToken validation is skipped
        $this->assertEquals(200, $response->getStatusCode());
    }

    // ========================================
    // Response Format Tests
    // ========================================

    /** @test */
    public function blocked_response_has_correct_structure()
    {
        $empresa = $this->createEmpresa();
        $empresa->update([
            'is_blocked' => true,
            'blocked_reason' => 'Teste',
        ]);

        $token = $empresa->createToken('test');

        $request = Request::create('/api/test', 'GET');
        $request->setUserResolver(fn() => $empresa);
        $empresa->withAccessToken($token->accessToken);

        $response = $this->middleware->handle($request, function () {
            return response()->json(['success' => true]);
        });

        $data = json_decode($response->getContent(), true);

        $this->assertArrayHasKey('message', $data);
        $this->assertArrayHasKey('reason', $data);
        $this->assertArrayHasKey('code', $data);
    }

    /** @test */
    public function session_expired_response_has_correct_structure()
    {
        $empresa = $this->createEmpresa();
        $empresa->update(['current_session_id' => 'current']);

        $token = $empresa->createToken('old');

        $request = Request::create('/api/test', 'GET');
        $request->setUserResolver(fn() => $empresa);
        $empresa->withAccessToken($token->accessToken);

        $response = $this->middleware->handle($request, function () {
            return response()->json(['success' => true]);
        });

        $data = json_decode($response->getContent(), true);

        $this->assertArrayHasKey('message', $data);
        $this->assertArrayHasKey('code', $data);
        $this->assertEquals('SESSION_EXPIRED', $data['code']);
    }

    // ========================================
    // Edge Cases
    // ========================================

    /** @test */
    public function not_blocked_user_proceeds_normally()
    {
        $empresa = $this->createEmpresa();
        $empresa->update(['is_blocked' => false]);

        $request = Request::create('/api/test', 'GET');
        $request->setUserResolver(fn() => $empresa);

        // Using actingAs creates TransientToken which skips session validation
        $this->actingAs($empresa);

        $response = $this->middleware->handle($request, function () {
            return response()->json(['success' => true]);
        });

        $this->assertEquals(200, $response->getStatusCode());
    }

    /** @test */
    public function deleted_token_on_session_mismatch()
    {
        $empresa = $this->createEmpresa();
        $empresa->update(['current_session_id' => 'new-session']);

        $token = $empresa->createToken('old-session');
        $tokenId = $token->accessToken->id;

        $request = Request::create('/api/test', 'GET');
        $request->setUserResolver(fn() => $empresa);
        $empresa->withAccessToken($token->accessToken);

        $this->middleware->handle($request, function () {
            return response()->json(['success' => true]);
        });

        // Token should be deleted
        $this->assertNull(PersonalAccessToken::find($tokenId));
    }
}
