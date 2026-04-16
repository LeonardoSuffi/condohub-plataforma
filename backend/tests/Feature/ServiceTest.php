<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\Service;

class ServiceTest extends TestCase
{
    /** @test */
    public function cliente_can_list_active_services()
    {
        $empresa = $this->createEmpresa(['email' => 'empresa1@test.com']);
        $cliente = $this->createCliente(['email' => 'cliente1@test.com']);

        // Create service
        Service::create([
            'company_id' => $empresa->companyProfile->id,
            'category_id' => $this->getCategory()->id,
            'title' => 'Test Service',
            'description' => 'Test Description',
            'status' => 'ativo',
        ]);

        $response = $this->actingAs($cliente)->getJson('/api/services');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'data' => [
                    'data',
                    'meta',
                ],
            ]);
    }

    /** @test */
    public function cliente_can_filter_services_by_category()
    {
        $empresa = $this->createEmpresa(['email' => 'empresa2@test.com']);
        $cliente = $this->createCliente(['email' => 'cliente2@test.com']);
        $category = $this->getCategory();

        Service::create([
            'company_id' => $empresa->companyProfile->id,
            'category_id' => $category->id,
            'title' => 'Filtered Service',
            'description' => 'Test',
            'status' => 'ativo',
        ]);

        $response = $this->actingAs($cliente)->getJson("/api/services?category_id={$category->id}");

        $response->assertStatus(200);
    }

    /** @test */
    public function cliente_can_search_services()
    {
        $empresa = $this->createEmpresa(['email' => 'empresa3@test.com']);
        $cliente = $this->createCliente(['email' => 'cliente3@test.com']);

        Service::create([
            'company_id' => $empresa->companyProfile->id,
            'category_id' => $this->getCategory()->id,
            'title' => 'Manutencao Eletrica',
            'description' => 'Servico de eletrica',
            'status' => 'ativo',
        ]);

        $response = $this->actingAs($cliente)->getJson('/api/services?search=eletrica');

        $response->assertStatus(200);
    }

    /** @test */
    public function empresa_can_create_service()
    {
        $empresa = $this->createEmpresa(['email' => 'empresa4@test.com']);
        $category = $this->getCategory();

        $response = $this->actingAs($empresa)->postJson('/api/services', [
            'category_id' => $category->id,
            'title' => 'New Service',
            'description' => 'Service Description',
            'region' => 'Sao Paulo',
            'price_range' => '1000-5000',
        ]);

        $response->assertStatus(201)
            ->assertJsonPath('data.title', 'New Service');

        $this->assertDatabaseHas('services', [
            'title' => 'New Service',
            'company_id' => $empresa->companyProfile->id,
        ]);
    }

    /** @test */
    public function empresa_can_update_own_service()
    {
        $empresa = $this->createEmpresa(['email' => 'empresa5@test.com']);

        $service = Service::create([
            'company_id' => $empresa->companyProfile->id,
            'category_id' => $this->getCategory()->id,
            'title' => 'Original Title',
            'description' => 'Original',
            'status' => 'ativo',
        ]);

        $response = $this->actingAs($empresa)->putJson("/api/services/{$service->id}", [
            'title' => 'Updated Title',
            'description' => 'Updated Description',
        ]);

        $response->assertStatus(200)
            ->assertJsonPath('data.title', 'Updated Title');
    }

    /** @test */
    public function empresa_cannot_update_others_service()
    {
        $empresa1 = $this->createEmpresa(['email' => 'empresa6@test.com']);
        $empresa2 = $this->createEmpresa(['email' => 'empresa7@test.com']);

        $service = Service::create([
            'company_id' => $empresa1->companyProfile->id,
            'category_id' => $this->getCategory()->id,
            'title' => 'Original Title',
            'description' => 'Original',
            'status' => 'ativo',
        ]);

        $response = $this->actingAs($empresa2)->putJson("/api/services/{$service->id}", [
            'title' => 'Hacked Title',
        ]);

        $response->assertStatus(403);
    }

    /** @test */
    public function empresa_can_delete_own_service()
    {
        $empresa = $this->createEmpresa(['email' => 'empresa8@test.com']);

        $service = Service::create([
            'company_id' => $empresa->companyProfile->id,
            'category_id' => $this->getCategory()->id,
            'title' => 'To Delete',
            'description' => 'Will be deleted',
            'status' => 'ativo',
        ]);

        $response = $this->actingAs($empresa)->deleteJson("/api/services/{$service->id}");

        $response->assertStatus(200);
        $this->assertSoftDeleted('services', ['id' => $service->id]);
    }

    /** @test */
    public function cliente_cannot_create_service()
    {
        $cliente = $this->createCliente(['email' => 'cliente4@test.com']);

        $response = $this->actingAs($cliente)->postJson('/api/services', [
            'category_id' => $this->getCategory()->id,
            'title' => 'Should Fail',
            'description' => 'Test',
        ]);

        $response->assertStatus(403);
    }

    /** @test */
    public function service_view_counter_increments()
    {
        $empresa = $this->createEmpresa(['email' => 'empresa9@test.com']);
        $cliente = $this->createCliente(['email' => 'cliente5@test.com']);

        $service = Service::create([
            'company_id' => $empresa->companyProfile->id,
            'category_id' => $this->getCategory()->id,
            'title' => 'View Counter Test',
            'description' => 'Test',
            'status' => 'ativo',
            'views' => 0,
        ]);

        $this->actingAs($cliente)->getJson("/api/services/{$service->id}");

        $this->assertDatabaseHas('services', [
            'id' => $service->id,
            'views' => 1,
        ]);
    }
}
