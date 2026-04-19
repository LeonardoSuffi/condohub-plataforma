<?php

namespace Tests\Unit\Middleware;

use App\Http\Middleware\IsCliente;
use App\Models\User;
use App\Models\ClientProfile;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\Request;
use Tests\TestCase;

class IsClienteTest extends TestCase
{
    use RefreshDatabase;

    protected IsCliente $middleware;

    protected function setUp(): void
    {
        parent::setUp();
        $this->middleware = new IsCliente();
    }

    // ========================================
    // Authentication Tests
    // ========================================

    /** @test */
    public function returns_401_for_unauthenticated_request()
    {
        $request = Request::create('/cliente/test', 'GET');

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
    public function returns_403_for_admin_user()
    {
        $admin = $this->createAdmin();
        $request = Request::create('/cliente/test', 'GET');
        $request->setUserResolver(fn() => $admin);

        $response = $this->middleware->handle($request, function () {
            return response()->json(['success' => true]);
        });

        $this->assertEquals(403, $response->getStatusCode());
        $this->assertStringContainsString('clientes', $response->getContent());
    }

    /** @test */
    public function returns_403_for_empresa_user()
    {
        $empresa = $this->createEmpresa();
        $request = Request::create('/cliente/test', 'GET');
        $request->setUserResolver(fn() => $empresa);

        $response = $this->middleware->handle($request, function () {
            return response()->json(['success' => true]);
        });

        $this->assertEquals(403, $response->getStatusCode());
    }

    /** @test */
    public function allows_cliente_user_with_profile()
    {
        $cliente = $this->createCliente();
        $request = Request::create('/cliente/test', 'GET');
        $request->setUserResolver(fn() => $cliente);

        $response = $this->middleware->handle($request, function () {
            return response()->json(['success' => true]);
        });

        $this->assertEquals(200, $response->getStatusCode());
    }

    /** @test */
    public function returns_403_for_cliente_without_profile()
    {
        // Create cliente user without client profile
        $cliente = User::factory()->create(['type' => 'cliente']);
        // Don't create clientProfile

        $request = Request::create('/cliente/test', 'GET');
        $request->setUserResolver(fn() => $cliente);

        $response = $this->middleware->handle($request, function () {
            return response()->json(['success' => true]);
        });

        $this->assertEquals(403, $response->getStatusCode());
        $this->assertStringContainsString('Perfil de cliente não encontrado', $response->getContent());
    }

    // ========================================
    // Response Format Tests
    // ========================================

    /** @test */
    public function forbidden_response_has_correct_structure()
    {
        $empresa = $this->createEmpresa();
        $request = Request::create('/cliente/test', 'GET');
        $request->setUserResolver(fn() => $empresa);

        $response = $this->middleware->handle($request, function () {
            return response()->json(['success' => true]);
        });

        $data = json_decode($response->getContent(), true);

        $this->assertFalse($data['success']);
        $this->assertArrayHasKey('message', $data);
    }
}
