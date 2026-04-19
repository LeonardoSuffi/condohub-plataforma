<?php

namespace Tests\Unit\Services;

use App\Services\FinanceService;
use App\Models\User;
use App\Models\Transaction;
use App\Models\Order;
use App\Models\CompanyProfile;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class FinanceServiceTest extends TestCase
{
    use RefreshDatabase;

    protected FinanceService $financeService;

    protected function setUp(): void
    {
        parent::setUp();
        $this->financeService = new FinanceService();
    }

    // ========================================
    // calculateCommission() Tests
    // ========================================

    /** @test */
    public function calculate_commission_returns_correct_percentage()
    {
        $result = $this->financeService->calculateCommission(1000.00);

        $this->assertEquals(1000.00, $result['gross']);
        $this->assertEquals(100.00, $result['commission']);
        $this->assertEquals(900.00, $result['net']);
        $this->assertEquals(0.10, $result['rate']);
    }

    /** @test */
    public function calculate_commission_handles_zero_value()
    {
        $result = $this->financeService->calculateCommission(0);

        $this->assertEquals(0, $result['gross']);
        $this->assertEquals(0, $result['commission']);
        $this->assertEquals(0, $result['net']);
        $this->assertEquals(0.10, $result['rate']);
    }

    /** @test */
    public function calculate_commission_handles_decimal_precision()
    {
        $result = $this->financeService->calculateCommission(123.45);

        $this->assertEquals(123.45, $result['gross']);
        $this->assertEquals(12.345, $result['commission']);
        $this->assertEquals(111.105, $result['net']);
    }

    /** @test */
    public function calculate_commission_handles_large_values()
    {
        $result = $this->financeService->calculateCommission(100000.00);

        $this->assertEquals(100000.00, $result['gross']);
        $this->assertEquals(10000.00, $result['commission']);
        $this->assertEquals(90000.00, $result['net']);
    }

    /** @test */
    public function calculate_commission_handles_small_values()
    {
        $result = $this->financeService->calculateCommission(0.01);

        $this->assertEquals(0.01, $result['gross']);
        $this->assertEquals(0.001, $result['commission']);
        $this->assertEquals(0.009, $result['net']);
    }

    // ========================================
    // getUserSummary() Tests
    // ========================================

    /** @test */
    public function get_user_summary_returns_correct_structure()
    {
        $user = $this->createEmpresa();

        $result = $this->financeService->getUserSummary($user);

        $this->assertArrayHasKey('total', $result);
        $this->assertArrayHasKey('current_month', $result);
        $this->assertArrayHasKey('pending', $result);
        $this->assertArrayHasKey('received', $result['total']);
        $this->assertArrayHasKey('commissions_paid', $result['total']);
        $this->assertArrayHasKey('subscriptions_paid', $result['total']);
    }

    /** @test */
    public function get_user_summary_calculates_totals_correctly()
    {
        $user = $this->createEmpresa();

        // Create service transactions
        Transaction::create([
            'user_id' => $user->id,
            'type' => 'servico',
            'amount' => 500.00,
            'commission' => 50.00,
            'status' => 'completed',
        ]);

        Transaction::create([
            'user_id' => $user->id,
            'type' => 'servico',
            'amount' => 300.00,
            'commission' => 30.00,
            'status' => 'completed',
        ]);

        // Create commission transaction
        Transaction::create([
            'user_id' => $user->id,
            'type' => 'comissao',
            'amount' => 0,
            'commission' => 80.00,
            'status' => 'completed',
        ]);

        $result = $this->financeService->getUserSummary($user);

        $this->assertEquals(800.00, $result['total']['received']);
        $this->assertEquals(80.00, $result['total']['commissions_paid']);
    }

    /** @test */
    public function get_user_summary_separates_current_month()
    {
        $user = $this->createEmpresa();

        // Current month transaction
        Transaction::create([
            'user_id' => $user->id,
            'type' => 'servico',
            'amount' => 200.00,
            'commission' => 20.00,
            'status' => 'completed',
            'created_at' => now(),
        ]);

        // Last month transaction
        Transaction::create([
            'user_id' => $user->id,
            'type' => 'servico',
            'amount' => 500.00,
            'commission' => 50.00,
            'status' => 'completed',
            'created_at' => now()->subMonth(),
        ]);

        $result = $this->financeService->getUserSummary($user);

        $this->assertEquals(700.00, $result['total']['received']);
        $this->assertEquals(200.00, $result['current_month']['received']);
    }

    /** @test */
    public function get_user_summary_excludes_pending_from_totals()
    {
        $user = $this->createEmpresa();

        // Completed transaction
        Transaction::create([
            'user_id' => $user->id,
            'type' => 'servico',
            'amount' => 300.00,
            'commission' => 30.00,
            'status' => 'completed',
        ]);

        // Pending transaction
        Transaction::create([
            'user_id' => $user->id,
            'type' => 'servico',
            'amount' => 500.00,
            'commission' => 50.00,
            'status' => 'pending',
        ]);

        $result = $this->financeService->getUserSummary($user);

        $this->assertEquals(300.00, $result['total']['received']);
        $this->assertEquals(500.00, $result['pending']);
    }

    /** @test */
    public function get_user_summary_handles_no_transactions()
    {
        $user = $this->createEmpresa();

        $result = $this->financeService->getUserSummary($user);

        $this->assertEquals(0, $result['total']['received']);
        $this->assertEquals(0, $result['total']['commissions_paid']);
        $this->assertEquals(0, $result['current_month']['received']);
        $this->assertEquals(0, $result['pending']);
    }

    // ========================================
    // getAdminOverview() Tests
    // ========================================

    /** @test */
    public function get_admin_overview_returns_correct_structure()
    {
        $result = $this->financeService->getAdminOverview();

        $this->assertArrayHasKey('period', $result);
        $this->assertArrayHasKey('services', $result);
        $this->assertArrayHasKey('subscriptions', $result);
        $this->assertArrayHasKey('orders', $result);
        $this->assertArrayHasKey('revenue', $result);
    }

    /** @test */
    public function get_admin_overview_aggregates_all_transactions()
    {
        $user1 = $this->createEmpresa();
        $user2 = $this->createEmpresa();

        // User 1 transactions
        Transaction::create([
            'user_id' => $user1->id,
            'type' => 'servico',
            'amount' => 500.00,
            'commission' => 50.00,
            'status' => 'completed',
        ]);

        // User 2 transactions
        Transaction::create([
            'user_id' => $user2->id,
            'type' => 'servico',
            'amount' => 300.00,
            'commission' => 30.00,
            'status' => 'completed',
        ]);

        // Commission transactions
        Transaction::create([
            'user_id' => $user1->id,
            'type' => 'comissao',
            'amount' => 0,
            'commission' => 80.00,
            'status' => 'completed',
        ]);

        $result = $this->financeService->getAdminOverview();

        $this->assertEquals(800.00, $result['services']['total_value']);
        $this->assertEquals(80.00, $result['services']['commissions_earned']);
        $this->assertEquals(2, $result['services']['count']);
    }

    /** @test */
    public function get_admin_overview_filters_by_date_range()
    {
        $user = $this->createEmpresa();

        // This month
        Transaction::create([
            'user_id' => $user->id,
            'type' => 'servico',
            'amount' => 200.00,
            'commission' => 20.00,
            'status' => 'completed',
            'created_at' => now(),
        ]);

        // 2 months ago
        Transaction::create([
            'user_id' => $user->id,
            'type' => 'servico',
            'amount' => 500.00,
            'commission' => 50.00,
            'status' => 'completed',
            'created_at' => now()->subMonths(2),
        ]);

        $result = $this->financeService->getAdminOverview(
            now()->startOfMonth()->format('Y-m-d'),
            now()->endOfMonth()->format('Y-m-d')
        );

        $this->assertEquals(200.00, $result['services']['total_value']);
    }

    /** @test */
    public function get_admin_overview_counts_orders_by_status()
    {
        $empresa = $this->createEmpresa();
        $cliente = $this->createCliente();
        $category = $this->getCategory();

        // Create service
        $service = \App\Models\Service::create([
            'company_id' => $empresa->companyProfile->id,
            'category_id' => $category->id,
            'title' => 'Test Service',
            'description' => 'Test Description',
            'price_range' => 'R$ 100-500',
            'status' => 'ativo',
        ]);

        // Create deal
        $deal = \App\Models\Deal::create([
            'service_id' => $service->id,
            'client_id' => $cliente->clientProfile->id,
            'company_id' => $empresa->companyProfile->id,
            'status' => 'aceito',
        ]);

        // Create orders with different statuses
        Order::create([
            'deal_id' => $deal->id,
            'service_id' => $service->id,
            'empresa_id' => $empresa->companyProfile->id,
            'cliente_id' => $cliente->clientProfile->id,
            'status' => 'pendente',
            'total_value' => 100,
        ]);

        Order::create([
            'deal_id' => $deal->id,
            'service_id' => $service->id,
            'empresa_id' => $empresa->companyProfile->id,
            'cliente_id' => $cliente->clientProfile->id,
            'status' => 'aprovado',
            'total_value' => 200,
        ]);

        Order::create([
            'deal_id' => $deal->id,
            'service_id' => $service->id,
            'empresa_id' => $empresa->companyProfile->id,
            'cliente_id' => $cliente->clientProfile->id,
            'status' => 'concluido',
            'total_value' => 300,
        ]);

        $result = $this->financeService->getAdminOverview();

        $this->assertEquals(3, $result['orders']['total']);
        $this->assertEquals(1, $result['orders']['pending']);
        $this->assertEquals(1, $result['orders']['approved']);
        $this->assertEquals(1, $result['orders']['completed']);
    }

    /** @test */
    public function get_admin_overview_calculates_revenue()
    {
        $user = $this->createEmpresa();

        // Commission
        Transaction::create([
            'user_id' => $user->id,
            'type' => 'comissao',
            'amount' => 0,
            'commission' => 100.00,
            'status' => 'completed',
        ]);

        // Subscription
        Transaction::create([
            'user_id' => $user->id,
            'type' => 'assinatura',
            'amount' => 50.00,
            'commission' => 0,
            'status' => 'completed',
        ]);

        $result = $this->financeService->getAdminOverview();

        $this->assertEquals(150.00, $result['revenue']['total']);
        $this->assertEquals(100.00, $result['revenue']['from_commissions']);
        $this->assertEquals(50.00, $result['revenue']['from_subscriptions']);
    }

    // ========================================
    // generateReport() Tests
    // ========================================

    /** @test */
    public function generate_report_groups_by_date()
    {
        $user = $this->createEmpresa();
        $today = now()->format('Y-m-d');
        $yesterday = now()->subDay()->format('Y-m-d');

        // Today
        Transaction::create([
            'user_id' => $user->id,
            'type' => 'servico',
            'amount' => 200.00,
            'commission' => 20.00,
            'status' => 'completed',
            'created_at' => now(),
        ]);

        // Yesterday
        Transaction::create([
            'user_id' => $user->id,
            'type' => 'servico',
            'amount' => 300.00,
            'commission' => 30.00,
            'status' => 'completed',
            'created_at' => now()->subDay(),
        ]);

        $result = $this->financeService->generateReport(
            now()->subWeek()->format('Y-m-d'),
            now()->format('Y-m-d')
        );

        $this->assertArrayHasKey($today, $result);
        $this->assertArrayHasKey($yesterday, $result);
        $this->assertEquals(200.00, $result[$today]['services']);
        $this->assertEquals(300.00, $result[$yesterday]['services']);
    }

    /** @test */
    public function generate_report_filters_by_period()
    {
        $user = $this->createEmpresa();

        // Within range
        Transaction::create([
            'user_id' => $user->id,
            'type' => 'servico',
            'amount' => 200.00,
            'commission' => 20.00,
            'status' => 'completed',
            'created_at' => now(),
        ]);

        // Outside range
        Transaction::create([
            'user_id' => $user->id,
            'type' => 'servico',
            'amount' => 500.00,
            'commission' => 50.00,
            'status' => 'completed',
            'created_at' => now()->subMonths(2),
        ]);

        $result = $this->financeService->generateReport(
            now()->startOfMonth()->format('Y-m-d'),
            now()->endOfMonth()->format('Y-m-d')
        );

        // Only this month's data
        $totalServices = array_sum(array_column($result, 'services'));
        $this->assertEquals(200.00, $totalServices);
    }

    /** @test */
    public function generate_report_handles_empty_period()
    {
        $result = $this->financeService->generateReport(
            now()->subWeek()->format('Y-m-d'),
            now()->format('Y-m-d')
        );

        $this->assertIsArray($result);
        $this->assertEmpty($result);
    }

    /** @test */
    public function generate_report_separates_transaction_types()
    {
        $user = $this->createEmpresa();
        $today = now()->format('Y-m-d');

        // Service
        Transaction::create([
            'user_id' => $user->id,
            'type' => 'servico',
            'amount' => 300.00,
            'commission' => 30.00,
            'status' => 'completed',
            'created_at' => now(),
        ]);

        // Commission
        Transaction::create([
            'user_id' => $user->id,
            'type' => 'comissao',
            'amount' => 0,
            'commission' => 30.00,
            'status' => 'completed',
            'created_at' => now(),
        ]);

        // Subscription
        Transaction::create([
            'user_id' => $user->id,
            'type' => 'assinatura',
            'amount' => 99.00,
            'commission' => 0,
            'status' => 'completed',
            'created_at' => now(),
        ]);

        $result = $this->financeService->generateReport(
            now()->startOfDay()->format('Y-m-d'),
            now()->endOfDay()->format('Y-m-d')
        );

        $this->assertEquals(300.00, $result[$today]['services']);
        $this->assertEquals(30.00, $result[$today]['commissions']);
        $this->assertEquals(99.00, $result[$today]['subscriptions']);
        $this->assertEquals(3, $result[$today]['count']);
    }
}
