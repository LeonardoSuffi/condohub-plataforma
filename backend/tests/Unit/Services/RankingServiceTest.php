<?php

namespace Tests\Unit\Services;

use App\Services\RankingService;
use App\Models\User;
use App\Models\Order;
use App\Models\Ranking;
use App\Models\Plan;
use App\Models\Subscription;
use App\Models\Deal;
use App\Models\Service;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use Carbon\Carbon;

class RankingServiceTest extends TestCase
{
    use RefreshDatabase;

    protected RankingService $rankingService;

    protected function setUp(): void
    {
        parent::setUp();
        $this->rankingService = new RankingService();
    }

    // ========================================
    // addPointsFromOrder() Tests
    // ========================================

    /** @test */
    public function add_points_from_order_calculates_correctly()
    {
        $empresa = $this->createEmpresaWithRankingPlan();
        $order = $this->createOrderForEmpresa($empresa, 1000.00);

        $this->rankingService->addPointsFromOrder($empresa, $order);

        $ranking = Ranking::where('user_id', $empresa->id)->first();

        // Points = 1000 * 0.1 + 10 bonus = 110
        $this->assertNotNull($ranking);
        $this->assertEquals(110, $ranking->score);
    }

    /** @test */
    public function add_points_skips_user_without_ranking_plan()
    {
        // Create user with free plan (no ranking)
        $empresa = $this->createEmpresa();

        // Ensure user has a plan without ranking
        $subscription = $empresa->activeSubscription;
        $subscription->plan->update(['ranking_enabled' => false]);

        $order = $this->createOrderForEmpresa($empresa, 500.00);

        $this->rankingService->addPointsFromOrder($empresa, $order);

        // No ranking should be created
        $ranking = Ranking::where('user_id', $empresa->id)->first();
        $this->assertNull($ranking);
    }

    /** @test */
    public function add_points_skips_user_without_subscription()
    {
        $empresa = $this->createEmpresa();

        // Remove subscription
        Subscription::where('user_id', $empresa->id)->delete();
        $empresa->refresh();

        $order = $this->createOrderForEmpresa($empresa, 500.00);

        $this->rankingService->addPointsFromOrder($empresa, $order);

        // No ranking should be created
        $ranking = Ranking::where('user_id', $empresa->id)->first();
        $this->assertNull($ranking);
    }

    /** @test */
    public function add_points_increments_deals_counter()
    {
        $empresa = $this->createEmpresaWithRankingPlan();
        $order1 = $this->createOrderForEmpresa($empresa, 100.00);
        $order2 = $this->createOrderForEmpresa($empresa, 200.00);

        $this->rankingService->addPointsFromOrder($empresa, $order1);
        $this->rankingService->addPointsFromOrder($empresa, $order2);

        $ranking = Ranking::where('user_id', $empresa->id)->first();

        $this->assertEquals(2, $ranking->deals_completed);
        $this->assertEquals(300.00, $ranking->total_value);
    }

    /** @test */
    public function add_points_accumulates_score()
    {
        $empresa = $this->createEmpresaWithRankingPlan();
        $order1 = $this->createOrderForEmpresa($empresa, 100.00);
        $order2 = $this->createOrderForEmpresa($empresa, 100.00);

        $this->rankingService->addPointsFromOrder($empresa, $order1);
        $this->rankingService->addPointsFromOrder($empresa, $order2);

        $ranking = Ranking::where('user_id', $empresa->id)->first();

        // Each order: 100 * 0.1 + 10 = 20 points
        // Total: 40 points
        $this->assertEquals(40, $ranking->score);
    }

    // ========================================
    // addPoints() Tests
    // ========================================

    /** @test */
    public function add_points_manually_updates_score()
    {
        $empresa = $this->createEmpresaWithRankingPlan();

        $this->rankingService->addPoints($empresa, 50, 'Bonus promocional');

        $ranking = Ranking::where('user_id', $empresa->id)->first();
        $this->assertEquals(50, $ranking->score);
    }

    /** @test */
    public function add_points_stores_reason_in_breakdown()
    {
        $empresa = $this->createEmpresaWithRankingPlan();

        $this->rankingService->addPoints($empresa, 100, 'Campanha especial');

        $ranking = Ranking::where('user_id', $empresa->id)->first();
        $this->assertNotNull($ranking->breakdown);
        $this->assertStringContainsString('Campanha especial', json_encode($ranking->breakdown));
    }

    // ========================================
    // removePoints() Tests
    // ========================================

    /** @test */
    public function remove_points_subtracts_score()
    {
        $empresa = $this->createEmpresaWithRankingPlan();

        // First add some points
        $this->rankingService->addPoints($empresa, 100, 'Initial');

        // Then remove
        $this->rankingService->removePoints($empresa, 30, 'Violation');

        $ranking = Ranking::where('user_id', $empresa->id)->first();
        $this->assertEquals(70, $ranking->score);
    }

    /** @test */
    public function remove_points_can_result_in_negative()
    {
        $empresa = $this->createEmpresaWithRankingPlan();

        // Add small amount
        $this->rankingService->addPoints($empresa, 10, 'Initial');

        // Remove more
        $this->rankingService->removePoints($empresa, 50, 'Major violation');

        $ranking = Ranking::where('user_id', $empresa->id)->first();
        $this->assertEquals(-40, $ranking->score);
    }

    // ========================================
    // resetCycle() Tests
    // ========================================

    /** @test */
    public function reset_cycle_clears_all_scores()
    {
        $empresa1 = $this->createEmpresaWithRankingPlan();
        $empresa2 = $this->createEmpresaWithRankingPlan();

        // Add points to both
        $this->rankingService->addPoints($empresa1, 100, 'Test');
        $this->rankingService->addPoints($empresa2, 200, 'Test');

        // Reset current cycle
        $this->rankingService->resetCycle();

        $rankings = Ranking::all();
        foreach ($rankings as $ranking) {
            $this->assertEquals(0, $ranking->score);
            $this->assertEquals(0, $ranking->deals_completed);
            $this->assertEquals(0, $ranking->total_value);
            $this->assertNull($ranking->position);
        }
    }

    /** @test */
    public function reset_cycle_resets_specific_cycle()
    {
        $empresa = $this->createEmpresaWithRankingPlan();
        $currentCycle = Ranking::getCurrentCycle();

        // Create ranking for current cycle
        $ranking = Ranking::create([
            'user_id' => $empresa->id,
            'cycle' => $currentCycle,
            'score' => 500,
            'deals_completed' => 10,
            'total_value' => 5000,
            'position' => 1,
        ]);

        $this->rankingService->resetCycle($currentCycle);

        $ranking->refresh();
        $this->assertEquals(0, $ranking->score);
        $this->assertEquals(0, $ranking->deals_completed);
    }

    // ========================================
    // getTopRanking() Tests
    // ========================================

    /** @test */
    public function get_top_ranking_returns_ordered_list()
    {
        $empresa1 = $this->createEmpresaWithRankingPlan();
        $empresa2 = $this->createEmpresaWithRankingPlan();
        $empresa3 = $this->createEmpresaWithRankingPlan();

        // Add different scores
        $this->rankingService->addPoints($empresa1, 100, 'Test');
        $this->rankingService->addPoints($empresa2, 300, 'Test');
        $this->rankingService->addPoints($empresa3, 200, 'Test');

        $top = $this->rankingService->getTopRanking(10);

        // Should be ordered by score descending
        $this->assertCount(3, $top);
        $this->assertEquals($empresa2->id, $top[0]['user_id']);
        $this->assertEquals($empresa3->id, $top[1]['user_id']);
        $this->assertEquals($empresa1->id, $top[2]['user_id']);
    }

    /** @test */
    public function get_top_ranking_respects_limit()
    {
        // Create 5 empresas with rankings
        for ($i = 0; $i < 5; $i++) {
            $empresa = $this->createEmpresaWithRankingPlan();
            $this->rankingService->addPoints($empresa, ($i + 1) * 10, 'Test');
        }

        $top = $this->rankingService->getTopRanking(3);

        $this->assertCount(3, $top);
    }

    /** @test */
    public function get_top_ranking_filters_by_cycle()
    {
        $empresa = $this->createEmpresaWithRankingPlan();
        $currentCycle = Ranking::getCurrentCycle();
        $pastCycle = '2023-S1';

        // Current cycle ranking
        Ranking::create([
            'user_id' => $empresa->id,
            'cycle' => $currentCycle,
            'score' => 100,
            'deals_completed' => 5,
            'total_value' => 1000,
        ]);

        // Past cycle ranking
        Ranking::create([
            'user_id' => $empresa->id + 1000, // Different user
            'cycle' => $pastCycle,
            'score' => 500,
            'deals_completed' => 20,
            'total_value' => 5000,
        ]);

        $currentTop = $this->rankingService->getTopRanking(10, $currentCycle);
        $pastTop = $this->rankingService->getTopRanking(10, $pastCycle);

        // Current cycle should only have one entry
        $this->assertCount(1, $currentTop);
        $this->assertEquals($empresa->id, $currentTop[0]['user_id']);

        // Past cycle should have one entry with different user
        $this->assertCount(1, $pastTop);
        $this->assertNotEquals($empresa->id, $pastTop[0]['user_id']);
    }

    // ========================================
    // getPreviousCycle() Tests
    // ========================================

    /** @test */
    public function get_previous_cycle_handles_semester_boundary_s1_to_s2()
    {
        // If current is S1, previous should be previous year S2
        Carbon::setTestNow(Carbon::create(2024, 3, 15)); // March = S1

        $currentCycle = Ranking::getCurrentCycle();
        $this->assertEquals('2024-S1', $currentCycle);

        // Test through reflection or public method if available
        // For now, test startNewCycle which uses getPreviousCycle internally
        $empresa = $this->createEmpresaWithRankingPlan();

        // Create ranking for 2023-S2
        Ranking::create([
            'user_id' => $empresa->id,
            'cycle' => '2023-S2',
            'score' => 100,
            'deals_completed' => 5,
            'total_value' => 1000,
        ]);

        // startNewCycle should process 2023-S2 as previous
        $newCycle = $this->rankingService->startNewCycle();
        $this->assertEquals('2024-S1', $newCycle);
    }

    /** @test */
    public function get_previous_cycle_handles_semester_boundary_s2_to_s1()
    {
        // If current is S2, previous should be same year S1
        Carbon::setTestNow(Carbon::create(2024, 8, 15)); // August = S2

        $currentCycle = Ranking::getCurrentCycle();
        $this->assertEquals('2024-S2', $currentCycle);

        $empresa = $this->createEmpresaWithRankingPlan();

        // Create ranking for 2024-S1
        Ranking::create([
            'user_id' => $empresa->id,
            'cycle' => '2024-S1',
            'score' => 200,
            'deals_completed' => 10,
            'total_value' => 2000,
        ]);

        $newCycle = $this->rankingService->startNewCycle();
        $this->assertEquals('2024-S2', $newCycle);
    }

    // ========================================
    // Helper Methods
    // ========================================

    protected function createEmpresaWithRankingPlan(): User
    {
        $empresa = $this->createEmpresa();
        $subscription = $empresa->activeSubscription;

        // Ensure ranking is enabled
        $subscription->plan->update(['ranking_enabled' => true]);

        return $empresa;
    }

    protected function createOrderForEmpresa(User $empresa, float $value): Order
    {
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
            'service_id' => $service->id,
            'client_id' => $cliente->clientProfile->id,
            'company_id' => $empresa->companyProfile->id,
            'status' => 'aceito',
        ]);

        return Order::create([
            'deal_id' => $deal->id,
            'service_id' => $service->id,
            'empresa_id' => $empresa->companyProfile->id,
            'cliente_id' => $cliente->clientProfile->id,
            'status' => 'concluido',
            'value' => $value,
            'total_value' => $value,
        ]);
    }
}
