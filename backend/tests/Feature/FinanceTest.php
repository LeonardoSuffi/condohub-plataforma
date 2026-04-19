<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Transaction;
use App\Models\Order;
use App\Models\Deal;
use App\Models\Service;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class FinanceTest extends TestCase
{
    use RefreshDatabase;

    // ========================================
    // Admin Access Tests
    // ========================================

    /** @test */
    public function admin_can_view_finance_overview()
    {
        $admin = $this->createAdmin();

        $response = $this->actingAs($admin)
            ->getJson('/api/admin/finance/overview');

        $response->assertOk()
            ->assertJsonStructure([
                'success',
                'data' => [
                    'total_revenue',
                    'total_commission',
                    'pending_transactions',
                ],
            ]);
    }

    /** @test */
    public function admin_can_view_all_transactions()
    {
        $admin = $this->createAdmin();
        $empresa = $this->createEmpresa();

        // Create some transactions
        Transaction::factory()->count(5)->create([
            'user_id' => $empresa->id,
        ]);

        $response = $this->actingAs($admin)
            ->getJson('/api/admin/finance/transactions');

        $response->assertOk()
            ->assertJsonStructure([
                'success',
                'data' => [
                    '*' => ['id', 'user_id', 'type', 'amount', 'status'],
                ],
            ]);
    }

    /** @test */
    public function admin_can_filter_transactions_by_date()
    {
        $admin = $this->createAdmin();
        $empresa = $this->createEmpresa();

        Transaction::factory()->create([
            'user_id' => $empresa->id,
            'created_at' => now()->subMonth(),
        ]);

        Transaction::factory()->create([
            'user_id' => $empresa->id,
            'created_at' => now(),
        ]);

        $response = $this->actingAs($admin)
            ->getJson('/api/admin/finance/transactions?start_date=' . now()->subWeek()->toDateString());

        $response->assertOk();
    }

    // ========================================
    // Empresa Access Tests
    // ========================================

    /** @test */
    public function empresa_can_view_own_summary()
    {
        $empresa = $this->createEmpresa();

        // Create transactions for the empresa
        Transaction::factory()->count(3)->create([
            'user_id' => $empresa->id,
            'type' => 'servico',
            'status' => 'concluida',
        ]);

        $response = $this->actingAs($empresa)
            ->getJson('/api/empresa/finance/summary');

        $response->assertOk()
            ->assertJsonStructure([
                'success',
                'data' => [
                    'total_revenue',
                    'total_commission',
                    'net_revenue',
                ],
            ]);
    }

    /** @test */
    public function empresa_can_view_own_transactions()
    {
        $empresa = $this->createEmpresa();
        $otherEmpresa = $this->createEmpresa();

        // Create transactions for our empresa
        Transaction::factory()->count(3)->create([
            'user_id' => $empresa->id,
        ]);

        // Create transactions for another empresa (should not see)
        Transaction::factory()->count(2)->create([
            'user_id' => $otherEmpresa->id,
        ]);

        $response = $this->actingAs($empresa)
            ->getJson('/api/empresa/finance/transactions');

        $response->assertOk();

        // Should only see own transactions
        $transactions = $response->json('data');
        foreach ($transactions as $transaction) {
            $this->assertEquals($empresa->id, $transaction['user_id']);
        }
    }

    /** @test */
    public function empresa_cannot_view_other_empresa_transactions()
    {
        $empresa = $this->createEmpresa();
        $otherEmpresa = $this->createEmpresa();

        Transaction::factory()->create([
            'user_id' => $otherEmpresa->id,
        ]);

        $response = $this->actingAs($empresa)
            ->getJson('/api/empresa/finance/transactions');

        $response->assertOk();

        // Should not include other empresa's transactions
        $transactions = $response->json('data');
        foreach ($transactions as $transaction) {
            $this->assertNotEquals($otherEmpresa->id, $transaction['user_id']);
        }
    }

    // ========================================
    // Cliente Access Tests
    // ========================================

    /** @test */
    public function cliente_cannot_access_finance_endpoints()
    {
        $cliente = $this->createCliente();

        $response = $this->actingAs($cliente)
            ->getJson('/api/empresa/finance/summary');

        $response->assertForbidden();
    }

    /** @test */
    public function cliente_cannot_access_admin_finance()
    {
        $cliente = $this->createCliente();

        $response = $this->actingAs($cliente)
            ->getJson('/api/admin/finance/overview');

        $response->assertForbidden();
    }

    // ========================================
    // Report Generation Tests
    // ========================================

    /** @test */
    public function admin_can_generate_report_for_date_range()
    {
        $admin = $this->createAdmin();

        $response = $this->actingAs($admin)
            ->getJson('/api/admin/finance/report?' . http_build_query([
                'start_date' => now()->subMonth()->toDateString(),
                'end_date' => now()->toDateString(),
            ]));

        $response->assertOk()
            ->assertJsonStructure([
                'success',
                'data' => [
                    'period',
                    'totals',
                ],
            ]);
    }

    /** @test */
    public function empresa_can_generate_own_report()
    {
        $empresa = $this->createEmpresa();

        Transaction::factory()->count(5)->create([
            'user_id' => $empresa->id,
            'type' => 'servico',
        ]);

        $response = $this->actingAs($empresa)
            ->getJson('/api/empresa/finance/report?' . http_build_query([
                'start_date' => now()->subMonth()->toDateString(),
                'end_date' => now()->toDateString(),
            ]));

        $response->assertOk();
    }

    // ========================================
    // Transaction Status Tests
    // ========================================

    /** @test */
    public function admin_can_update_transaction_status()
    {
        $admin = $this->createAdmin();
        $empresa = $this->createEmpresa();

        $transaction = Transaction::factory()->create([
            'user_id' => $empresa->id,
            'status' => 'pendente',
        ]);

        $response = $this->actingAs($admin)
            ->patchJson("/api/admin/finance/transactions/{$transaction->id}", [
                'status' => 'aprovado',
            ]);

        $response->assertOk();
        $this->assertEquals('aprovado', $transaction->fresh()->status);
    }

    /** @test */
    public function empresa_cannot_update_transaction_status()
    {
        $empresa = $this->createEmpresa();

        $transaction = Transaction::factory()->create([
            'user_id' => $empresa->id,
            'status' => 'pendente',
        ]);

        $response = $this->actingAs($empresa)
            ->patchJson("/api/admin/finance/transactions/{$transaction->id}", [
                'status' => 'aprovado',
            ]);

        $response->assertForbidden();
    }

    // ========================================
    // Export Tests
    // ========================================

    /** @test */
    public function admin_can_export_transactions_to_csv()
    {
        $admin = $this->createAdmin();
        $empresa = $this->createEmpresa();

        Transaction::factory()->count(5)->create([
            'user_id' => $empresa->id,
        ]);

        $response = $this->actingAs($admin)
            ->getJson('/api/admin/finance/export?format=csv');

        $response->assertOk()
            ->assertHeader('Content-Type', 'text/csv; charset=UTF-8');
    }

    // ========================================
    // Current Month Tests
    // ========================================

    /** @test */
    public function summary_separates_current_month_correctly()
    {
        $empresa = $this->createEmpresa();

        // Last month transaction
        Transaction::factory()->create([
            'user_id' => $empresa->id,
            'amount' => 1000,
            'type' => 'servico',
            'status' => 'concluida',
            'created_at' => now()->subMonth(),
        ]);

        // Current month transaction
        Transaction::factory()->create([
            'user_id' => $empresa->id,
            'amount' => 500,
            'type' => 'servico',
            'status' => 'concluida',
            'created_at' => now(),
        ]);

        $response = $this->actingAs($empresa)
            ->getJson('/api/empresa/finance/summary');

        $response->assertOk()
            ->assertJsonPath('data.current_month.revenue', 500.0);
    }

    // ========================================
    // Unauthenticated Tests
    // ========================================

    /** @test */
    public function unauthenticated_cannot_access_finance()
    {
        $response = $this->getJson('/api/admin/finance/overview');

        $response->assertUnauthorized();
    }
}
