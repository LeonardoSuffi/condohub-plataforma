<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\Service;
use App\Models\Deal;
use App\Models\Order;

class OrderTest extends TestCase
{
    protected $empresa;
    protected $cliente;
    protected $admin;
    protected $deal;
    protected $order;

    protected function setUp(): void
    {
        parent::setUp();

        $this->empresa = $this->createEmpresa(['email' => 'orderempresa@test.com']);
        $this->cliente = $this->createCliente(['email' => 'ordercliente@test.com']);
        $this->admin = $this->createAdmin(['email' => 'orderadmin@test.com']);

        $service = Service::create([
            'company_id' => $this->empresa->companyProfile->id,
            'category_id' => $this->getCategory()->id,
            'title' => 'Order Test Service',
            'description' => 'Test',
            'region' => 'Sao Paulo',
            'price_range' => '1000-5000',
            'status' => 'ativo',
        ]);

        $this->deal = Deal::create([
            'company_id' => $this->empresa->companyProfile->id,
            'client_id' => $this->cliente->clientProfile->id,
            'service_id' => $service->id,
            'status' => 'aceito',
            'anon_handle_a' => 'Empresa #123',
            'anon_handle_b' => 'Cliente #456',
            'accepted_at' => now(),
        ]);

        $this->order = Order::create([
            'deal_id' => $this->deal->id,
            'value' => 3000.00,
            'status' => 'pendente',
        ]);
    }

    /** @test */
    public function admin_can_list_all_orders()
    {
        $response = $this->actingAs($this->admin)->getJson('/api/orders');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'data',
            ]);
    }

    /** @test */
    public function empresa_can_see_own_orders()
    {
        $response = $this->actingAs($this->empresa)->getJson('/api/orders');

        $response->assertStatus(200);
        $this->assertCount(1, $response->json('data'));
    }

    /** @test */
    public function admin_can_approve_order()
    {
        $response = $this->actingAs($this->admin)->patchJson("/api/orders/{$this->order->id}", [
            'status' => 'aprovado',
            'notes' => 'Approved for processing',
        ]);

        $response->assertStatus(200)
            ->assertJsonPath('data.status', 'aprovado');

        $this->assertDatabaseHas('orders', [
            'id' => $this->order->id,
            'status' => 'aprovado',
            'approved_by' => $this->admin->id,
        ]);
    }

    /** @test */
    public function admin_can_reject_order()
    {
        $response = $this->actingAs($this->admin)->patchJson("/api/orders/{$this->order->id}", [
            'status' => 'rejeitado',
            'rejection_reason' => 'Invalid documentation',
        ]);

        $response->assertStatus(200)
            ->assertJsonPath('data.status', 'rejeitado');
    }

    /** @test */
    public function admin_can_complete_order()
    {
        // First approve
        $this->order->update(['status' => 'aprovado', 'approved_by' => $this->admin->id]);

        $response = $this->actingAs($this->admin)->patchJson("/api/orders/{$this->order->id}", [
            'status' => 'concluido',
        ]);

        $response->assertStatus(200)
            ->assertJsonPath('data.status', 'concluido');

        // Check transactions created
        $this->assertDatabaseHas('transactions', [
            'order_id' => $this->order->id,
            'type' => 'servico',
        ]);
    }

    /** @test */
    public function order_completion_creates_commission_transaction()
    {
        $this->order->update(['status' => 'aprovado', 'approved_by' => $this->admin->id]);

        $this->actingAs($this->admin)->patchJson("/api/orders/{$this->order->id}", [
            'status' => 'concluido',
        ]);

        // 10% commission on 3000 = 300
        $this->assertDatabaseHas('transactions', [
            'order_id' => $this->order->id,
            'type' => 'comissao',
            'amount' => 300.00,
        ]);
    }

    /** @test */
    public function empresa_cannot_update_order_status()
    {
        $response = $this->actingAs($this->empresa)->patchJson("/api/orders/{$this->order->id}", [
            'status' => 'aprovado',
        ]);

        $response->assertStatus(403);
    }

    /** @test */
    public function cliente_cannot_update_order_status()
    {
        $response = $this->actingAs($this->cliente)->patchJson("/api/orders/{$this->order->id}", [
            'status' => 'aprovado',
        ]);

        $response->assertStatus(403);
    }

    /** @test */
    public function admin_can_adjust_order_value()
    {
        $response = $this->actingAs($this->admin)->patchJson("/api/orders/{$this->order->id}", [
            'status' => 'aprovado',
            'value' => 3500.00,
        ]);

        $response->assertStatus(200)
            ->assertJsonPath('data.value', '3500.00');
    }

    /** @test */
    public function other_user_cannot_see_order()
    {
        $otherCliente = $this->createCliente(['email' => 'other@test.com']);

        $response = $this->actingAs($otherCliente)->getJson("/api/orders/{$this->order->id}");

        $response->assertStatus(403);
    }
}
