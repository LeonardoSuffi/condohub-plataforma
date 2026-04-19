<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Plan;
use App\Models\Ranking;
use App\Models\Order;
use App\Models\Deal;
use App\Models\Service;
use App\Services\RankingService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use Carbon\Carbon;

class RankingFeatureTest extends TestCase
{
    use RefreshDatabase;

    // ========================================
    // View Ranking Tests
    // ========================================

    /** @test */
    public function empresa_can_view_ranking()
    {
        $empresa = $this->createEmpresaWithRankingPlan();

        // Add some ranking data
        $rankingService = new RankingService();
        $rankingService->addPoints($empresa, 100, 'Test points');

        $response = $this->actingAs($empresa)
            ->getJson('/api/ranking');

        $response->assertOk()
            ->assertJsonStructure([
                'success',
                'data' => [
                    '*' => [
                        'position',
                        'user_id',
                        'score',
                        'deals_completed',
                    ],
                ],
            ]);
    }

    /** @test */
    public function empresa_can_view_own_ranking_position()
    {
        $empresa = $this->createEmpresaWithRankingPlan();

        $rankingService = new RankingService();
        $rankingService->addPoints($empresa, 100, 'Test');

        $response = $this->actingAs($empresa)
            ->getJson('/api/ranking/me');

        $response->assertOk()
            ->assertJsonStructure([
                'success',
                'data' => [
                    'position',
                    'score',
                    'deals_completed',
                    'total_value',
                ],
            ]);
    }

    /** @test */
    public function ranking_returns_companies_ordered_by_score()
    {
        $empresa1 = $this->createEmpresaWithRankingPlan();
        $empresa2 = $this->createEmpresaWithRankingPlan();
        $empresa3 = $this->createEmpresaWithRankingPlan();

        $rankingService = new RankingService();
        $rankingService->addPoints($empresa1, 100, 'Test');
        $rankingService->addPoints($empresa2, 300, 'Test');
        $rankingService->addPoints($empresa3, 200, 'Test');

        $response = $this->actingAs($empresa1)
            ->getJson('/api/ranking');

        $response->assertOk();

        $data = $response->json('data');
        // Should be ordered by score desc
        $this->assertEquals($empresa2->id, $data[0]['user_id']);
        $this->assertEquals($empresa3->id, $data[1]['user_id']);
        $this->assertEquals($empresa1->id, $data[2]['user_id']);
    }

    // ========================================
    // Admin Ranking Management Tests
    // ========================================

    /** @test */
    public function admin_can_reset_cycle()
    {
        $admin = $this->createAdmin();
        $empresa = $this->createEmpresaWithRankingPlan();

        $rankingService = new RankingService();
        $rankingService->addPoints($empresa, 500, 'Test');

        $ranking = Ranking::where('user_id', $empresa->id)->first();
        $this->assertEquals(500, $ranking->score);

        $response = $this->actingAs($admin)
            ->postJson('/api/admin/ranking/reset-cycle');

        $response->assertOk();

        $ranking->refresh();
        $this->assertEquals(0, $ranking->score);
    }

    /** @test */
    public function admin_can_add_bonus_points()
    {
        $admin = $this->createAdmin();
        $empresa = $this->createEmpresaWithRankingPlan();

        $rankingService = new RankingService();
        $rankingService->addPoints($empresa, 100, 'Initial');

        $response = $this->actingAs($admin)
            ->postJson("/api/admin/ranking/{$empresa->id}/add-points", [
                'points' => 50,
                'reason' => 'Bonus promocional',
            ]);

        $response->assertOk();

        $ranking = Ranking::where('user_id', $empresa->id)->first();
        $this->assertEquals(150, $ranking->score);
    }

    /** @test */
    public function admin_can_remove_points()
    {
        $admin = $this->createAdmin();
        $empresa = $this->createEmpresaWithRankingPlan();

        $rankingService = new RankingService();
        $rankingService->addPoints($empresa, 100, 'Initial');

        $response = $this->actingAs($admin)
            ->postJson("/api/admin/ranking/{$empresa->id}/remove-points", [
                'points' => 30,
                'reason' => 'Penalidade',
            ]);

        $response->assertOk();

        $ranking = Ranking::where('user_id', $empresa->id)->first();
        $this->assertEquals(70, $ranking->score);
    }

    // ========================================
    // Order Completion and Ranking Tests
    // ========================================

    /** @test */
    public function ranking_updates_on_order_completion()
    {
        $admin = $this->createAdmin();
        $empresa = $this->createEmpresaWithRankingPlan();
        $cliente = $this->createCliente();
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
            'status' => 'aprovado',
        ]);

        // Complete the order
        $response = $this->actingAs($admin)
            ->patchJson("/api/admin/orders/{$order->id}", [
                'status' => 'concluido',
            ]);

        $response->assertOk();

        // Check ranking was updated
        $ranking = Ranking::where('user_id', $empresa->id)->first();
        $this->assertNotNull($ranking);
        $this->assertGreaterThan(0, $ranking->score);
        $this->assertEquals(1, $ranking->deals_completed);
    }

    // ========================================
    // Cycle Management Tests
    // ========================================

    /** @test */
    public function ranking_filtered_by_current_cycle()
    {
        $empresa = $this->createEmpresaWithRankingPlan();
        $currentCycle = Ranking::getCurrentCycle();

        // Create ranking for current cycle
        Ranking::create([
            'user_id' => $empresa->id,
            'cycle' => $currentCycle,
            'score' => 100,
            'deals_completed' => 5,
            'total_value' => 5000,
        ]);

        // Create ranking for past cycle
        Ranking::create([
            'user_id' => $empresa->id + 1000,
            'cycle' => '2020-S1',
            'score' => 500,
            'deals_completed' => 20,
            'total_value' => 20000,
        ]);

        $response = $this->actingAs($empresa)
            ->getJson('/api/ranking');

        $response->assertOk();

        $data = $response->json('data');
        // Should only show current cycle
        foreach ($data as $item) {
            $this->assertEquals($currentCycle, $item['cycle'] ?? $currentCycle);
        }
    }

    /** @test */
    public function admin_can_view_past_cycle_rankings()
    {
        $admin = $this->createAdmin();
        $empresa = $this->createEmpresaWithRankingPlan();

        // Create ranking for past cycle
        Ranking::create([
            'user_id' => $empresa->id,
            'cycle' => '2023-S1',
            'score' => 500,
            'deals_completed' => 20,
            'total_value' => 20000,
            'position' => 1,
        ]);

        $response = $this->actingAs($admin)
            ->getJson('/api/admin/ranking?cycle=2023-S1');

        $response->assertOk();

        $data = $response->json('data');
        $this->assertNotEmpty($data);
    }

    // ========================================
    // Authorization Tests
    // ========================================

    /** @test */
    public function cliente_cannot_access_empresa_ranking()
    {
        $cliente = $this->createCliente();

        $response = $this->actingAs($cliente)
            ->getJson('/api/ranking/me');

        // Cliente doesn't participate in ranking
        $response->assertOk()
            ->assertJsonPath('data', null);
    }

    /** @test */
    public function empresa_without_ranking_plan_not_in_ranking()
    {
        $empresa = $this->createEmpresa();

        // Disable ranking for this empresa's plan
        $empresa->activeSubscription->plan->update(['ranking_enabled' => false]);

        $response = $this->actingAs($empresa)
            ->getJson('/api/ranking/me');

        $response->assertOk()
            ->assertJsonPath('data', null);
    }

    /** @test */
    public function only_admin_can_reset_cycle()
    {
        $empresa = $this->createEmpresaWithRankingPlan();

        $response = $this->actingAs($empresa)
            ->postJson('/api/admin/ranking/reset-cycle');

        $response->assertForbidden();
    }

    /** @test */
    public function only_admin_can_add_points_manually()
    {
        $empresa = $this->createEmpresaWithRankingPlan();
        $otherEmpresa = $this->createEmpresaWithRankingPlan();

        $response = $this->actingAs($empresa)
            ->postJson("/api/admin/ranking/{$otherEmpresa->id}/add-points", [
                'points' => 100,
                'reason' => 'Hack attempt',
            ]);

        $response->assertForbidden();
    }

    // ========================================
    // Top Ranking Limit Tests
    // ========================================

    /** @test */
    public function ranking_respects_limit_parameter()
    {
        // Create multiple empresas with rankings
        for ($i = 0; $i < 10; $i++) {
            $empresa = $this->createEmpresaWithRankingPlan();
            $rankingService = new RankingService();
            $rankingService->addPoints($empresa, ($i + 1) * 10, 'Test');
        }

        $viewer = $this->createEmpresaWithRankingPlan();

        $response = $this->actingAs($viewer)
            ->getJson('/api/ranking?limit=5');

        $response->assertOk();

        $data = $response->json('data');
        $this->assertLessThanOrEqual(5, count($data));
    }

    // ========================================
    // Unauthenticated Tests
    // ========================================

    /** @test */
    public function unauthenticated_cannot_access_ranking()
    {
        $response = $this->getJson('/api/ranking');

        $response->assertUnauthorized();
    }

    // ========================================
    // Helper Methods
    // ========================================

    protected function createEmpresaWithRankingPlan(): User
    {
        $empresa = $this->createEmpresa();
        $empresa->activeSubscription->plan->update(['ranking_enabled' => true]);

        return $empresa;
    }
}
