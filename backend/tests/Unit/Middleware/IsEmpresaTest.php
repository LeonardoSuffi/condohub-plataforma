<?php

namespace Tests\Unit\Middleware;

use App\Http\Middleware\IsEmpresa;
use App\Models\User;
use App\Models\CompanyProfile;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\Request;
use Tests\TestCase;

class IsEmpresaTest extends TestCase
{
    use RefreshDatabase;

    protected IsEmpresa $middleware;

    protected function setUp(): void
    {
        parent::setUp();
        $this->middleware = new IsEmpresa();
    }

    // ========================================
    // Authentication Tests
    // ========================================

    /** @test */
    public function returns_401_for_unauthenticated_request()
    {
        $request = Request::create('/empresa/test', 'GET');

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
        $request = Request::create('/empresa/test', 'GET');
        $request->setUserResolver(fn() => $admin);

        $response = $this->middleware->handle($request, function () {
            return response()->json(['success' => true]);
        });

        $this->assertEquals(403, $response->getStatusCode());
        $this->assertStringContainsString('empresas', $response->getContent());
    }

    /** @test */
    public function returns_403_for_cliente_user()
    {
        $cliente = $this->createCliente();
        $request = Request::create('/empresa/test', 'GET');
        $request->setUserResolver(fn() => $cliente);

        $response = $this->middleware->handle($request, function () {
            return response()->json(['success' => true]);
        });

        $this->assertEquals(403, $response->getStatusCode());
    }

    /** @test */
    public function allows_empresa_user_with_profile()
    {
        $empresa = $this->createEmpresa();
        $request = Request::create('/empresa/test', 'GET');
        $request->setUserResolver(fn() => $empresa);

        $response = $this->middleware->handle($request, function () {
            return response()->json(['success' => true]);
        });

        $this->assertEquals(200, $response->getStatusCode());
    }

    /** @test */
    public function returns_403_for_empresa_without_profile()
    {
        // Create empresa user without company profile
        $empresa = User::factory()->create(['type' => 'empresa']);
        // Don't create companyProfile

        $request = Request::create('/empresa/test', 'GET');
        $request->setUserResolver(fn() => $empresa);

        $response = $this->middleware->handle($request, function () {
            return response()->json(['success' => true]);
        });

        $this->assertEquals(403, $response->getStatusCode());
        $this->assertStringContainsString('Perfil de empresa não encontrado', $response->getContent());
    }

    // ========================================
    // Response Format Tests
    // ========================================

    /** @test */
    public function forbidden_response_has_correct_structure()
    {
        $cliente = $this->createCliente();
        $request = Request::create('/empresa/test', 'GET');
        $request->setUserResolver(fn() => $cliente);

        $response = $this->middleware->handle($request, function () {
            return response()->json(['success' => true]);
        });

        $data = json_decode($response->getContent(), true);

        $this->assertFalse($data['success']);
        $this->assertArrayHasKey('message', $data);
    }
}
