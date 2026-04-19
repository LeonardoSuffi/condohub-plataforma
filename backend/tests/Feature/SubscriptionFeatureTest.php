<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Plan;
use App\Models\Subscription;
use App\Models\Transaction;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SubscriptionFeatureTest extends TestCase
{
    use RefreshDatabase;

    // ========================================
    // View Subscription Tests
    // ========================================

    /** @test */
    public function empresa_can_view_current_subscription()
    {
        $empresa = $this->createEmpresa();

        $response = $this->actingAs($empresa)
            ->getJson('/api/subscriptions/current');

        $response->assertOk()
            ->assertJsonStructure([
                'success',
                'data' => [
                    'id',
                    'plan_id',
                    'status',
                    'starts_at',
                    'ends_at',
                    'interactions_used',
                    'plan' => [
                        'id',
                        'name',
                        'price',
                    ],
                ],
            ]);
    }

    /** @test */
    public function cliente_can_view_subscription_status()
    {
        $cliente = $this->createCliente();

        // Note: Cliente might not have subscription, but should be able to check
        $response = $this->actingAs($cliente)
            ->getJson('/api/subscriptions/current');

        // Should return null or empty since cliente doesn't have subscription
        $response->assertOk();
    }

    // ========================================
    // Change Plan Tests
    // ========================================

    /** @test */
    public function empresa_can_change_plan()
    {
        $empresa = $this->createEmpresa();
        $newPlan = Plan::where('id', '!=', $empresa->activeSubscription->plan_id)->first();

        if (!$newPlan) {
            $newPlan = Plan::factory()->create(['price' => 199]);
        }

        $response = $this->actingAs($empresa)
            ->postJson('/api/subscriptions/change-plan', [
                'plan_id' => $newPlan->id,
            ]);

        $response->assertOk()
            ->assertJsonPath('success', true);

        $empresa->refresh();
        $this->assertEquals($newPlan->id, $empresa->activeSubscription->plan_id);
    }

    /** @test */
    public function empresa_cannot_change_to_same_plan()
    {
        $empresa = $this->createEmpresa();
        $currentPlanId = $empresa->activeSubscription->plan_id;

        $response = $this->actingAs($empresa)
            ->postJson('/api/subscriptions/change-plan', [
                'plan_id' => $currentPlanId,
            ]);

        $response->assertStatus(422);
    }

    /** @test */
    public function upgrade_creates_transaction_for_price_difference()
    {
        $empresa = $this->createEmpresa();
        $currentPlan = $empresa->activeSubscription->plan;

        // Create a more expensive plan
        $expensivePlan = Plan::factory()->create([
            'price' => $currentPlan->price + 100,
            'billing_cycle' => 'mensal',
        ]);

        $initialCount = Transaction::count();

        $response = $this->actingAs($empresa)
            ->postJson('/api/subscriptions/change-plan', [
                'plan_id' => $expensivePlan->id,
            ]);

        $response->assertOk();

        // Should create upgrade transaction
        $this->assertGreaterThan($initialCount, Transaction::count());
    }

    // ========================================
    // Cancel Subscription Tests
    // ========================================

    /** @test */
    public function empresa_can_cancel_subscription()
    {
        $empresa = $this->createEmpresa();
        $subscriptionId = $empresa->activeSubscription->id;

        $response = $this->actingAs($empresa)
            ->postJson('/api/subscriptions/cancel');

        $response->assertOk()
            ->assertJsonPath('success', true);

        $subscription = Subscription::find($subscriptionId);
        $this->assertEquals('cancelada', $subscription->status);
    }

    /** @test */
    public function cancelled_subscription_still_visible_in_history()
    {
        $empresa = $this->createEmpresa();

        // Cancel subscription
        $this->actingAs($empresa)
            ->postJson('/api/subscriptions/cancel');

        // Should still appear in history
        $response = $this->actingAs($empresa)
            ->getJson('/api/subscriptions/history');

        $response->assertOk();
        $this->assertCount(1, $response->json('data'));
    }

    // ========================================
    // Middleware Protection Tests
    // ========================================

    /** @test */
    public function middleware_blocks_expired_subscription()
    {
        $empresa = $this->createEmpresa();
        $subscription = $empresa->activeSubscription;

        // Expire the subscription
        $subscription->update([
            'status' => 'ativa',
            'ends_at' => now()->subDay(),
        ]);

        // Try to access protected route
        $response = $this->actingAs($empresa)
            ->getJson('/api/empresa/services');

        // Should be blocked by HasActivePlan middleware
        $response->assertStatus(403)
            ->assertJsonPath('code', 'SUBSCRIPTION_EXPIRED');
    }

    /** @test */
    public function middleware_blocks_no_subscription()
    {
        $empresa = $this->createEmpresa();

        // Remove subscription
        Subscription::where('user_id', $empresa->id)->delete();

        $response = $this->actingAs($empresa)
            ->getJson('/api/empresa/services');

        $response->assertStatus(403)
            ->assertJsonPath('code', 'NO_SUBSCRIPTION');
    }

    /** @test */
    public function middleware_allows_active_subscription()
    {
        $empresa = $this->createEmpresa();

        // Ensure subscription is active
        $empresa->activeSubscription->update([
            'status' => 'ativa',
            'ends_at' => now()->addMonth(),
        ]);

        $response = $this->actingAs($empresa)
            ->getJson('/api/empresa/services');

        $response->assertOk();
    }

    // ========================================
    // Plan Listing Tests
    // ========================================

    /** @test */
    public function anyone_can_view_available_plans()
    {
        $response = $this->getJson('/api/plans');

        $response->assertOk()
            ->assertJsonStructure([
                'success',
                'data' => [
                    '*' => [
                        'id',
                        'name',
                        'price',
                        'billing_cycle',
                        'features',
                    ],
                ],
            ]);
    }

    /** @test */
    public function plans_ordered_by_priority()
    {
        $response = $this->getJson('/api/plans');

        $response->assertOk();

        $plans = $response->json('data');
        $previousPriority = 0;

        foreach ($plans as $plan) {
            $this->assertGreaterThanOrEqual($previousPriority, $plan['priority']);
            $previousPriority = $plan['priority'];
        }
    }

    // ========================================
    // Interaction Limit Tests
    // ========================================

    /** @test */
    public function subscription_tracks_interactions_used()
    {
        $empresa = $this->createEmpresa();
        $subscription = $empresa->activeSubscription;

        $initial = $subscription->interactions_used;

        $subscription->incrementInteractions();
        $subscription->refresh();

        $this->assertEquals($initial + 1, $subscription->interactions_used);
    }

    /** @test */
    public function api_returns_remaining_interactions()
    {
        $empresa = $this->createEmpresa();

        $response = $this->actingAs($empresa)
            ->getJson('/api/subscriptions/current');

        $response->assertOk()
            ->assertJsonStructure([
                'data' => [
                    'remaining_interactions',
                ],
            ]);
    }

    // ========================================
    // Renewal Tests
    // ========================================

    /** @test */
    public function admin_can_renew_subscription()
    {
        $admin = $this->createAdmin();
        $empresa = $this->createEmpresa();
        $subscriptionId = $empresa->activeSubscription->id;

        // Expire the subscription
        $empresa->activeSubscription->update([
            'status' => 'expirada',
            'ends_at' => now()->subDay(),
        ]);

        $response = $this->actingAs($admin)
            ->postJson("/api/admin/subscriptions/{$subscriptionId}/renew");

        $response->assertOk();

        $subscription = Subscription::find($subscriptionId);
        $this->assertEquals('ativa', $subscription->status);
        $this->assertTrue($subscription->ends_at->isFuture());
    }

    // ========================================
    // Authorization Tests
    // ========================================

    /** @test */
    public function cliente_cannot_change_empresa_subscription()
    {
        $cliente = $this->createCliente();
        $empresa = $this->createEmpresa();
        $plan = Plan::first();

        $response = $this->actingAs($cliente)
            ->postJson('/api/subscriptions/change-plan', [
                'plan_id' => $plan->id,
            ]);

        // Cliente doesn't have empresa middleware access
        $response->assertForbidden();
    }

    /** @test */
    public function unauthenticated_cannot_access_subscription()
    {
        $response = $this->getJson('/api/subscriptions/current');

        $response->assertUnauthorized();
    }
}
