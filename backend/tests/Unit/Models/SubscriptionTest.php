<?php

namespace Tests\Unit\Models;

use App\Models\Subscription;
use App\Models\Plan;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use Carbon\Carbon;

class SubscriptionTest extends TestCase
{
    use RefreshDatabase;

    // ========================================
    // isActive() Tests
    // ========================================

    /** @test */
    public function is_active_returns_true_when_status_ativa_and_future_end()
    {
        $empresa = $this->createEmpresa();
        $subscription = $empresa->activeSubscription;

        // Ensure it ends in the future
        $subscription->update([
            'status' => 'ativa',
            'ends_at' => now()->addMonth(),
        ]);

        $this->assertTrue($subscription->isActive());
    }

    /** @test */
    public function is_active_returns_true_when_status_ativa_and_null_end()
    {
        $empresa = $this->createEmpresa();
        $subscription = $empresa->activeSubscription;

        $subscription->update([
            'status' => 'ativa',
            'ends_at' => null,
        ]);

        $this->assertTrue($subscription->isActive());
    }

    /** @test */
    public function is_active_returns_false_when_expired()
    {
        $empresa = $this->createEmpresa();
        $subscription = $empresa->activeSubscription;

        $subscription->update([
            'status' => 'ativa',
            'ends_at' => now()->subDay(), // Past date
        ]);

        $this->assertFalse($subscription->isActive());
    }

    /** @test */
    public function is_active_returns_false_when_status_not_ativa()
    {
        $empresa = $this->createEmpresa();
        $subscription = $empresa->activeSubscription;

        $subscription->update([
            'status' => 'cancelada',
            'ends_at' => now()->addMonth(),
        ]);

        $this->assertFalse($subscription->isActive());
    }

    // ========================================
    // isExpired() Tests
    // ========================================

    /** @test */
    public function is_expired_returns_true_when_status_expirada()
    {
        $empresa = $this->createEmpresa();
        $subscription = $empresa->activeSubscription;

        $subscription->update(['status' => 'expirada']);

        $this->assertTrue($subscription->isExpired());
    }

    /** @test */
    public function is_expired_returns_true_when_past_end_date()
    {
        $empresa = $this->createEmpresa();
        $subscription = $empresa->activeSubscription;

        $subscription->update([
            'status' => 'ativa',
            'ends_at' => now()->subDay(),
        ]);

        $this->assertTrue($subscription->isExpired());
    }

    /** @test */
    public function is_expired_returns_false_when_active_and_future_date()
    {
        $empresa = $this->createEmpresa();
        $subscription = $empresa->activeSubscription;

        $subscription->update([
            'status' => 'ativa',
            'ends_at' => now()->addMonth(),
        ]);

        $this->assertFalse($subscription->isExpired());
    }

    // ========================================
    // canInteract() Tests
    // ========================================

    /** @test */
    public function can_interact_returns_true_when_under_limit()
    {
        $empresa = $this->createEmpresa();
        $subscription = $empresa->activeSubscription;
        $plan = $subscription->plan;

        // Ensure active and under limit
        $subscription->update([
            'status' => 'ativa',
            'ends_at' => now()->addMonth(),
            'interactions_used' => 0,
        ]);

        $this->assertTrue($subscription->canInteract());
    }

    /** @test */
    public function can_interact_returns_false_when_at_limit()
    {
        $empresa = $this->createEmpresa();
        $subscription = $empresa->activeSubscription;
        $plan = $subscription->plan;

        $subscription->update([
            'status' => 'ativa',
            'ends_at' => now()->addMonth(),
            'interactions_used' => $plan->max_interactions, // At limit
        ]);

        $this->assertFalse($subscription->canInteract());
    }

    /** @test */
    public function can_interact_returns_false_when_over_limit()
    {
        $empresa = $this->createEmpresa();
        $subscription = $empresa->activeSubscription;
        $plan = $subscription->plan;

        $subscription->update([
            'status' => 'ativa',
            'ends_at' => now()->addMonth(),
            'interactions_used' => $plan->max_interactions + 1,
        ]);

        $this->assertFalse($subscription->canInteract());
    }

    /** @test */
    public function can_interact_returns_false_when_not_active()
    {
        $empresa = $this->createEmpresa();
        $subscription = $empresa->activeSubscription;

        $subscription->update([
            'status' => 'cancelada',
            'interactions_used' => 0,
        ]);

        $this->assertFalse($subscription->canInteract());
    }

    // ========================================
    // incrementInteractions() Tests
    // ========================================

    /** @test */
    public function increment_interactions_updates_counter()
    {
        $empresa = $this->createEmpresa();
        $subscription = $empresa->activeSubscription;

        $initialCount = $subscription->interactions_used;

        $subscription->incrementInteractions();
        $subscription->refresh();

        $this->assertEquals($initialCount + 1, $subscription->interactions_used);
    }

    /** @test */
    public function increment_interactions_multiple_times()
    {
        $empresa = $this->createEmpresa();
        $subscription = $empresa->activeSubscription;
        $subscription->update(['interactions_used' => 0]);

        $subscription->incrementInteractions();
        $subscription->incrementInteractions();
        $subscription->incrementInteractions();
        $subscription->refresh();

        $this->assertEquals(3, $subscription->interactions_used);
    }

    // ========================================
    // remainingInteractions Attribute Tests
    // ========================================

    /** @test */
    public function remaining_interactions_calculates_correctly()
    {
        $empresa = $this->createEmpresa();
        $subscription = $empresa->activeSubscription;
        $maxInteractions = $subscription->plan->max_interactions;

        $subscription->update(['interactions_used' => 5]);

        $this->assertEquals($maxInteractions - 5, $subscription->remaining_interactions);
    }

    /** @test */
    public function remaining_interactions_returns_zero_when_over_limit()
    {
        $empresa = $this->createEmpresa();
        $subscription = $empresa->activeSubscription;
        $maxInteractions = $subscription->plan->max_interactions;

        $subscription->update(['interactions_used' => $maxInteractions + 10]);

        $this->assertEquals(0, $subscription->remaining_interactions);
    }

    /** @test */
    public function remaining_interactions_returns_max_when_zero_used()
    {
        $empresa = $this->createEmpresa();
        $subscription = $empresa->activeSubscription;
        $maxInteractions = $subscription->plan->max_interactions;

        $subscription->update(['interactions_used' => 0]);

        $this->assertEquals($maxInteractions, $subscription->remaining_interactions);
    }

    // ========================================
    // daysRemaining Attribute Tests
    // ========================================

    /** @test */
    public function days_remaining_calculates_correctly()
    {
        $empresa = $this->createEmpresa();
        $subscription = $empresa->activeSubscription;

        Carbon::setTestNow(Carbon::create(2024, 1, 1));
        $subscription->update(['ends_at' => Carbon::create(2024, 1, 11)]);

        $this->assertEquals(10, $subscription->days_remaining);
    }

    /** @test */
    public function days_remaining_returns_zero_when_past()
    {
        $empresa = $this->createEmpresa();
        $subscription = $empresa->activeSubscription;

        $subscription->update(['ends_at' => now()->subDays(5)]);

        $this->assertEquals(0, $subscription->days_remaining);
    }

    /** @test */
    public function days_remaining_returns_999_when_null_end_date()
    {
        $empresa = $this->createEmpresa();
        $subscription = $empresa->activeSubscription;

        $subscription->update(['ends_at' => null]);

        $this->assertEquals(999, $subscription->days_remaining);
    }

    // ========================================
    // Scopes Tests
    // ========================================

    /** @test */
    public function active_scope_returns_only_active_subscriptions()
    {
        $empresa1 = $this->createEmpresa();
        $empresa2 = $this->createEmpresa();
        $plan = Plan::first();

        // Create expired subscription
        Subscription::create([
            'user_id' => $empresa2->id,
            'plan_id' => $plan->id,
            'status' => 'expirada',
            'starts_at' => now()->subMonths(2),
            'ends_at' => now()->subMonth(),
            'interactions_used' => 0,
        ]);

        $activeCount = Subscription::active()->count();
        $allCount = Subscription::count();

        // Active should be less than or equal to all
        $this->assertLessThanOrEqual($allCount, $activeCount);

        // All active scoped should have status = ativa
        Subscription::active()->each(function ($sub) {
            $this->assertEquals('ativa', $sub->status);
        });
    }

    /** @test */
    public function expired_scope_returns_only_expired_subscriptions()
    {
        $empresa = $this->createEmpresa();
        $plan = Plan::first();

        // Create expired subscription
        Subscription::create([
            'user_id' => $empresa->id,
            'plan_id' => $plan->id,
            'status' => 'expirada',
            'starts_at' => now()->subMonths(2),
            'ends_at' => now()->subMonth(),
            'interactions_used' => 0,
        ]);

        $expiredSubs = Subscription::expired()->get();

        $this->assertGreaterThan(0, $expiredSubs->count());
        $expiredSubs->each(function ($sub) {
            $this->assertEquals('expirada', $sub->status);
        });
    }

    // ========================================
    // Relationships Tests
    // ========================================

    /** @test */
    public function subscription_belongs_to_user()
    {
        $empresa = $this->createEmpresa();
        $subscription = $empresa->activeSubscription;

        $this->assertNotNull($subscription->user);
        $this->assertEquals($empresa->id, $subscription->user->id);
    }

    /** @test */
    public function subscription_belongs_to_plan()
    {
        $empresa = $this->createEmpresa();
        $subscription = $empresa->activeSubscription;

        $this->assertNotNull($subscription->plan);
        $this->assertInstanceOf(Plan::class, $subscription->plan);
    }
}
