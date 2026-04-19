<?php

namespace Tests\Unit\Middleware;

use App\Http\Middleware\IsAdmin;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\Request;
use Tests\TestCase;

class IsAdminTest extends TestCase
{
    use RefreshDatabase;

    protected IsAdmin $middleware;

    protected function setUp(): void
    {
        parent::setUp();
        $this->middleware = new IsAdmin();
    }

    // ========================================
    // Authentication Tests
    // ========================================

    /** @test */
    public function returns_401_for_unauthenticated_request()
    {
        $request = Request::create('/admin/test', 'GET');

        $response = $this->middleware->handle($request, function () {
            return response()->json(['success' => true]);
        });

        $this->assertEquals(401, $response->getStatusCode());
        $this->assertStringContainsString('Não autenticado', $response->getContent());
    }

    // ========================================
    // Authorization Tests
    // ========================================

    /** @test */
    public function returns_403_for_non_admin_user()
    {
        $empresa = $this->createEmpresa();
        $request = Request::create('/admin/test', 'GET');
        $request->setUserResolver(fn() => $empresa);

        $response = $this->middleware->handle($request, function () {
            return response()->json(['success' => true]);
        });

        $this->assertEquals(403, $response->getStatusCode());
        $this->assertStringContainsString('administradores', $response->getContent());
    }

    /** @test */
    public function returns_403_for_cliente_user()
    {
        $cliente = $this->createCliente();
        $request = Request::create('/admin/test', 'GET');
        $request->setUserResolver(fn() => $cliente);

        $response = $this->middleware->handle($request, function () {
            return response()->json(['success' => true]);
        });

        $this->assertEquals(403, $response->getStatusCode());
    }

    /** @test */
    public function allows_admin_user()
    {
        $admin = $this->createAdmin();
        $request = Request::create('/admin/test', 'GET');
        $request->setUserResolver(fn() => $admin);

        $response = $this->middleware->handle($request, function () {
            return response()->json(['success' => true]);
        });

        $this->assertEquals(200, $response->getStatusCode());
        $this->assertStringContainsString('success', $response->getContent());
    }

    // ========================================
    // Response Format Tests
    // ========================================

    /** @test */
    public function unauthenticated_response_has_correct_structure()
    {
        $request = Request::create('/admin/test', 'GET');

        $response = $this->middleware->handle($request, function () {
            return response()->json(['success' => true]);
        });

        $data = json_decode($response->getContent(), true);

        $this->assertFalse($data['success']);
        $this->assertArrayHasKey('message', $data);
    }

    /** @test */
    public function forbidden_response_has_correct_structure()
    {
        $empresa = $this->createEmpresa();
        $request = Request::create('/admin/test', 'GET');
        $request->setUserResolver(fn() => $empresa);

        $response = $this->middleware->handle($request, function () {
            return response()->json(['success' => true]);
        });

        $data = json_decode($response->getContent(), true);

        $this->assertFalse($data['success']);
        $this->assertArrayHasKey('message', $data);
    }
}
