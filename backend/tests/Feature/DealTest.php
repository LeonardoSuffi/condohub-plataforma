<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\Service;
use App\Models\Deal;

class DealTest extends TestCase
{
    protected $empresa;
    protected $cliente;
    protected $service;

    protected function setUp(): void
    {
        parent::setUp();

        $this->empresa = $this->createEmpresa(['email' => 'dealempresa@test.com']);
        $this->cliente = $this->createCliente(['email' => 'dealcliente@test.com']);

        $this->service = Service::create([
            'company_id' => $this->empresa->companyProfile->id,
            'category_id' => $this->getCategory()->id,
            'title' => 'Deal Test Service',
            'description' => 'Test service for deals',
            'region' => 'Sao Paulo',
            'price_range' => '1000-5000',
            'status' => 'ativo',
        ]);
    }

    /** @test */
    public function cliente_can_create_deal_for_service()
    {
        $response = $this->actingAs($this->cliente)->postJson('/api/deals', [
            'service_id' => $this->service->id,
            'message' => 'Interested in this service',
        ]);

        $response->assertStatus(201)
            ->assertJsonStructure([
                'success',
                'data' => [
                    'id',
                    'status',
                    'anon_handle_a',
                    'anon_handle_b',
                ],
            ]);

        $this->assertDatabaseHas('deals', [
            'service_id' => $this->service->id,
            'client_id' => $this->cliente->clientProfile->id,
            'company_id' => $this->empresa->companyProfile->id,
        ]);
    }

    /** @test */
    public function deal_generates_anonymous_handles()
    {
        $response = $this->actingAs($this->cliente)->postJson('/api/deals', [
            'service_id' => $this->service->id,
        ]);

        $response->assertStatus(201);

        $deal = Deal::find($response->json('data.id'));
        $this->assertNotNull($deal->anon_handle_a);
        $this->assertNotNull($deal->anon_handle_b);
    }

    /** @test */
    public function cliente_cannot_create_duplicate_deal()
    {
        // First deal
        $this->actingAs($this->cliente)->postJson('/api/deals', [
            'service_id' => $this->service->id,
        ]);

        // Duplicate deal
        $response = $this->actingAs($this->cliente)->postJson('/api/deals', [
            'service_id' => $this->service->id,
        ]);

        $response->assertStatus(400);
    }

    /** @test */
    public function empresa_cannot_create_deal()
    {
        $response = $this->actingAs($this->empresa)->postJson('/api/deals', [
            'service_id' => $this->service->id,
        ]);

        $response->assertStatus(403);
    }

    /** @test */
    public function empresa_can_accept_deal()
    {
        $deal = Deal::create([
            'company_id' => $this->empresa->companyProfile->id,
            'client_id' => $this->cliente->clientProfile->id,
            'service_id' => $this->service->id,
            'status' => 'negociando',
            'anon_handle_a' => 'Empresa #123',
            'anon_handle_b' => 'Cliente #456',
        ]);

        $response = $this->actingAs($this->empresa)->patchJson("/api/deals/{$deal->id}", [
            'status' => 'aceito',
        ]);

        $response->assertStatus(200)
            ->assertJsonPath('data.status', 'aceito');

        // Check order was created
        $this->assertDatabaseHas('orders', [
            'deal_id' => $deal->id,
            'status' => 'pendente',
        ]);
    }

    /** @test */
    public function cliente_cannot_accept_deal()
    {
        $deal = Deal::create([
            'company_id' => $this->empresa->companyProfile->id,
            'client_id' => $this->cliente->clientProfile->id,
            'service_id' => $this->service->id,
            'status' => 'negociando',
            'anon_handle_a' => 'Empresa #123',
            'anon_handle_b' => 'Cliente #456',
        ]);

        $response = $this->actingAs($this->cliente)->patchJson("/api/deals/{$deal->id}", [
            'status' => 'aceito',
        ]);

        $response->assertStatus(400);
    }

    /** @test */
    public function user_can_only_see_own_deals()
    {
        $otherCliente = $this->createCliente(['email' => 'othercliente@test.com']);

        $deal = Deal::create([
            'company_id' => $this->empresa->companyProfile->id,
            'client_id' => $this->cliente->clientProfile->id,
            'service_id' => $this->service->id,
            'status' => 'negociando',
            'anon_handle_a' => 'Empresa #123',
            'anon_handle_b' => 'Cliente #456',
        ]);

        $response = $this->actingAs($otherCliente)->getJson("/api/deals/{$deal->id}");

        $response->assertStatus(403);
    }
}
