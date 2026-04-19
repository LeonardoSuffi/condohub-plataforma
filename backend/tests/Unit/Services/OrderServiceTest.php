<?php

namespace Tests\Unit\Services;

use App\Services\OrderService;
use App\Services\FinanceService;
use App\Services\RankingService;
use App\Models\Order;
use App\Models\Deal;
use App\Models\Service;
use App\Models\Transaction;
use App\Models\Ranking;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class OrderServiceTest extends TestCase
{
    use RefreshDatabase;

    protected OrderService $orderService;

    protected function setUp(): void
    {
        parent::setUp();
        $this->orderService = new OrderService(
            new FinanceService(),
            new RankingService()
        );
    }

    // ========================================
    // Helper Methods
    // ========================================

    protected function createOrderWithDeal(): array
    {
        $empresa = $this->createEmpresa();
        $cliente = $this->createCliente();
        $admin = $this->createAdmin();
        $category = $this->getCategory();

        $service = Service::create([
            'company_id' => $empresa->companyProfile->id,
            'category_id' => $category->id,
            'title' => 'Test Service',
            'description' => 'Test',
            'price_range' => 'R$ 100-500',
            'status' => 'ativo',
        ]);

        $deal = Deal::create([
            'company_id' => $empresa->companyProfile->id,
            'client_id' => $cliente->clientProfile->id,
            'service_id' => $service->id,
            'status' => 'aceito',
        ]);

        $order = Order::create([
            'deal_id' => $deal->id,
            'value' => 1000.00,
            'status' => 'pendente',
        ]);

        return compact('empresa', 'cliente', 'admin', 'service', 'deal', 'order');
    }

    // ========================================
    // updateStatus() Transition Tests
    // ========================================

    /** @test */
    public function update_status_validates_transitions()
    {
        ['admin' => $admin, 'order' => $order] = $this->createOrderWithDeal();

        // Invalid: pendente -> concluido (must be approved first)
        $result = $this->orderService->updateStatus($order, 'concluido', $admin);

        $this->assertFalse($result['success']);
        $this->assertStringContainsString('Não é possível', $result['message']);
    }

    /** @test */
    public function update_status_allows_pendente_to_aprovado()
    {
        ['admin' => $admin, 'order' => $order] = $this->createOrderWithDeal();

        $result = $this->orderService->updateStatus($order, 'aprovado', $admin);

        $this->assertTrue($result['success']);
        $this->assertEquals('aprovado', $order->fresh()->status);
    }

    /** @test */
    public function update_status_allows_pendente_to_rejeitado()
    {
        ['admin' => $admin, 'order' => $order] = $this->createOrderWithDeal();

        $result = $this->orderService->updateStatus(
            $order,
            'rejeitado',
            $admin,
            null,
            'Valores incorretos'
        );

        $this->assertTrue($result['success']);
        $this->assertEquals('rejeitado', $order->fresh()->status);
    }

    /** @test */
    public function update_status_allows_aprovado_to_concluido()
    {
        ['admin' => $admin, 'order' => $order] = $this->createOrderWithDeal();

        // First approve
        $this->orderService->updateStatus($order, 'aprovado', $admin);

        // Then complete
        $result = $this->orderService->updateStatus($order->fresh(), 'concluido', $admin);

        $this->assertTrue($result['success']);
        $this->assertEquals('concluido', $order->fresh()->status);
    }

    /** @test */
    public function update_status_blocks_transitions_from_concluido()
    {
        ['admin' => $admin, 'order' => $order] = $this->createOrderWithDeal();

        // Approve and complete
        $this->orderService->updateStatus($order, 'aprovado', $admin);
        $this->orderService->updateStatus($order->fresh(), 'concluido', $admin);

        // Try to change status of completed order
        $result = $this->orderService->updateStatus($order->fresh(), 'rejeitado', $admin);

        $this->assertFalse($result['success']);
    }

    /** @test */
    public function update_status_blocks_transitions_from_rejeitado()
    {
        ['admin' => $admin, 'order' => $order] = $this->createOrderWithDeal();

        // Reject
        $this->orderService->updateStatus($order, 'rejeitado', $admin, null, 'Motivo');

        // Try to approve rejected order
        $result = $this->orderService->updateStatus($order->fresh(), 'aprovado', $admin);

        $this->assertFalse($result['success']);
    }

    // ========================================
    // Approval Tests
    // ========================================

    /** @test */
    public function update_status_sets_approved_by_on_approval()
    {
        ['admin' => $admin, 'order' => $order] = $this->createOrderWithDeal();

        $this->orderService->updateStatus($order, 'aprovado', $admin);

        $order->refresh();
        $this->assertEquals($admin->id, $order->approved_by);
        $this->assertNotNull($order->approved_at);
    }

    /** @test */
    public function update_status_sets_approved_at_timestamp()
    {
        ['admin' => $admin, 'order' => $order] = $this->createOrderWithDeal();

        $beforeApproval = now();

        $this->orderService->updateStatus($order, 'aprovado', $admin);

        $order->refresh();
        $this->assertTrue($order->approved_at->gte($beforeApproval));
    }

    /** @test */
    public function update_status_allows_notes_on_approval()
    {
        ['admin' => $admin, 'order' => $order] = $this->createOrderWithDeal();

        $notes = 'Aprovado após verificação';
        $this->orderService->updateStatus($order, 'aprovado', $admin, $notes);

        $order->refresh();
        $this->assertEquals($notes, $order->notes);
    }

    // ========================================
    // Rejection Tests
    // ========================================

    /** @test */
    public function update_status_sets_rejection_reason()
    {
        ['admin' => $admin, 'order' => $order] = $this->createOrderWithDeal();

        $reason = 'Documentação incompleta';
        $this->orderService->updateStatus($order, 'rejeitado', $admin, null, $reason);

        $order->refresh();
        $this->assertEquals($reason, $order->rejection_reason);
    }

    /** @test */
    public function rejected_order_reverts_deal_to_negociando()
    {
        ['admin' => $admin, 'order' => $order, 'deal' => $deal] = $this->createOrderWithDeal();

        $this->assertEquals('aceito', $deal->status);

        $this->orderService->updateStatus($order, 'rejeitado', $admin, null, 'Motivo');

        $deal->refresh();
        $this->assertEquals('negociando', $deal->status);
    }

    // ========================================
    // Completion Tests (Financial)
    // ========================================

    /** @test */
    public function completion_creates_service_transaction()
    {
        ['admin' => $admin, 'order' => $order, 'empresa' => $empresa] = $this->createOrderWithDeal();

        // Enable ranking for empresa
        $empresa->activeSubscription->plan->update(['ranking_enabled' => true]);

        // Approve and complete
        $this->orderService->updateStatus($order, 'aprovado', $admin);

        $initialCount = Transaction::where('type', 'servico')->count();

        $this->orderService->updateStatus($order->fresh(), 'concluido', $admin);

        $serviceTransactions = Transaction::where('type', 'servico')->count();
        $this->assertEquals($initialCount + 1, $serviceTransactions);

        $transaction = Transaction::where('order_id', $order->id)
            ->where('type', 'servico')
            ->first();

        $this->assertNotNull($transaction);
        $this->assertEquals(1000.00, $transaction->amount);
        $this->assertEquals(100.00, $transaction->commission); // 10%
        $this->assertEquals(900.00, $transaction->net_amount);
    }

    /** @test */
    public function completion_creates_commission_transaction()
    {
        ['admin' => $admin, 'order' => $order, 'empresa' => $empresa] = $this->createOrderWithDeal();

        // Enable ranking for empresa
        $empresa->activeSubscription->plan->update(['ranking_enabled' => true]);

        // Approve and complete
        $this->orderService->updateStatus($order, 'aprovado', $admin);

        $initialCount = Transaction::where('type', 'comissao')->count();

        $this->orderService->updateStatus($order->fresh(), 'concluido', $admin);

        $commissionTransactions = Transaction::where('type', 'comissao')->count();
        $this->assertEquals($initialCount + 1, $commissionTransactions);

        $transaction = Transaction::where('order_id', $order->id)
            ->where('type', 'comissao')
            ->first();

        $this->assertNotNull($transaction);
        $this->assertEquals(100.00, $transaction->amount); // 10% of 1000
    }

    /** @test */
    public function completion_updates_ranking()
    {
        ['admin' => $admin, 'order' => $order, 'empresa' => $empresa] = $this->createOrderWithDeal();

        // Enable ranking for empresa
        $empresa->activeSubscription->plan->update(['ranking_enabled' => true]);

        // Approve and complete
        $this->orderService->updateStatus($order, 'aprovado', $admin);
        $this->orderService->updateStatus($order->fresh(), 'concluido', $admin);

        $ranking = Ranking::where('user_id', $empresa->id)->first();

        $this->assertNotNull($ranking);
        $this->assertGreaterThan(0, $ranking->score);
    }

    /** @test */
    public function completion_updates_deal_status()
    {
        ['admin' => $admin, 'order' => $order, 'deal' => $deal, 'empresa' => $empresa] = $this->createOrderWithDeal();

        // Enable ranking
        $empresa->activeSubscription->plan->update(['ranking_enabled' => true]);

        // Approve and complete
        $this->orderService->updateStatus($order, 'aprovado', $admin);
        $this->orderService->updateStatus($order->fresh(), 'concluido', $admin);

        $deal->refresh();
        $this->assertEquals('concluido', $deal->status);
        $this->assertNotNull($deal->completed_at);
    }

    /** @test */
    public function completion_sets_completed_at()
    {
        ['admin' => $admin, 'order' => $order, 'empresa' => $empresa] = $this->createOrderWithDeal();

        // Enable ranking
        $empresa->activeSubscription->plan->update(['ranking_enabled' => true]);

        // Approve and complete
        $this->orderService->updateStatus($order, 'aprovado', $admin);

        $beforeComplete = now();

        $this->orderService->updateStatus($order->fresh(), 'concluido', $admin);

        $order->refresh();
        $this->assertNotNull($order->completed_at);
        $this->assertTrue($order->completed_at->gte($beforeComplete));
    }

    // ========================================
    // Value Update Tests
    // ========================================

    /** @test */
    public function update_status_allows_value_change()
    {
        ['admin' => $admin, 'order' => $order] = $this->createOrderWithDeal();

        $newValue = 1500.00;
        $this->orderService->updateStatus($order, 'aprovado', $admin, null, null, $newValue);

        $order->refresh();
        $this->assertEquals($newValue, $order->value);
    }

    /** @test */
    public function completion_uses_updated_value_for_transactions()
    {
        ['admin' => $admin, 'order' => $order, 'empresa' => $empresa] = $this->createOrderWithDeal();

        // Enable ranking
        $empresa->activeSubscription->plan->update(['ranking_enabled' => true]);

        $newValue = 2000.00;

        // Approve with new value
        $this->orderService->updateStatus($order, 'aprovado', $admin, null, null, $newValue);

        // Complete
        $this->orderService->updateStatus($order->fresh(), 'concluido', $admin);

        $transaction = Transaction::where('order_id', $order->id)
            ->where('type', 'servico')
            ->first();

        $this->assertEquals($newValue, $transaction->amount);
        $this->assertEquals(200.00, $transaction->commission); // 10% of 2000
    }

    // ========================================
    // Status Message Tests
    // ========================================

    /** @test */
    public function update_status_returns_correct_message_for_aprovado()
    {
        ['admin' => $admin, 'order' => $order] = $this->createOrderWithDeal();

        $result = $this->orderService->updateStatus($order, 'aprovado', $admin);

        $this->assertStringContainsString('aprovada', strtolower($result['message']));
    }

    /** @test */
    public function update_status_returns_correct_message_for_rejeitado()
    {
        ['admin' => $admin, 'order' => $order] = $this->createOrderWithDeal();

        $result = $this->orderService->updateStatus($order, 'rejeitado', $admin, null, 'Motivo');

        $this->assertStringContainsString('rejeitada', strtolower($result['message']));
    }

    /** @test */
    public function update_status_returns_correct_message_for_concluido()
    {
        ['admin' => $admin, 'order' => $order, 'empresa' => $empresa] = $this->createOrderWithDeal();

        // Enable ranking
        $empresa->activeSubscription->plan->update(['ranking_enabled' => true]);

        $this->orderService->updateStatus($order, 'aprovado', $admin);
        $result = $this->orderService->updateStatus($order->fresh(), 'concluido', $admin);

        $this->assertStringContainsString('concluída', strtolower($result['message']));
    }
}
