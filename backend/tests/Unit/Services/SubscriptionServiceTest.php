<?php

namespace Tests\Unit\Services;

use App\Services\SubscriptionService;
use App\Models\User;
use App\Models\Plan;
use App\Models\Subscription;
use App\Models\Transaction;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use Carbon\Carbon;

class SubscriptionServiceTest extends TestCase
{
    use RefreshDatabase;

    protected SubscriptionService $subscriptionService;

    protected function setUp(): void
    {
        parent::setUp();
        $this->subscriptionService = new SubscriptionService();
    }

    // ========================================
    // createSubscription() Tests
    // ========================================

    /** @test */
    public function create_subscription_sets_correct_dates()
    {
        $user = $this->createEmpresa();
        $plan = Plan::where('slug', 'plus')->firstOrFail();

        Carbon::setTestNow(now());

        $subscription = $this->subscriptionService->createSubscription($user, $plan);

        $this->assertEquals($user->id, $subscription->user_id);
        $this->assertEquals($plan->id, $subscription->plan_id);
        $this->assertEquals('ativa', $subscription->status);
        $this->assertTrue($subscription->starts_at->isToday());
        $this->assertEquals(0, $subscription->interactions_used);
    }

    /** @test */
    public function create_subscription_calculates_end_date_based_on_plan_cycle()
    {
        $user = $this->createEmpresa();

        // Test with monthly plan
        $monthlyPlan = Plan::where('billing_cycle', 'mensal')->first();
        if (!$monthlyPlan) {
            $monthlyPlan = Plan::create([
                'name' => 'Test Monthly',
                'slug' => 'test-monthly',
                'price' => 99,
                'billing_cycle' => 'mensal',
                'features' => ['feature1'],
                'max_interactions' => 50,
                'max_services' => 10,
                'ranking_enabled' => true,
                'featured_enabled' => false,
                'priority' => 1,
            ]);
        }

        Carbon::setTestNow(Carbon::create(2024, 1, 15));

        $subscription = $this->subscriptionService->createSubscription($user, $monthlyPlan);

        // Monthly should be about 30 days
        $this->assertTrue($subscription->ends_at->gt($subscription->starts_at));
        $this->assertLessThanOrEqual(31, $subscription->ends_at->diffInDays($subscription->starts_at));
    }

    /** @test */
    public function create_subscription_creates_transaction_for_paid_plan()
    {
        $user = $this->createEmpresa();
        $plan = Plan::where('price', '>', 0)->first();

        $initialCount = Transaction::count();

        $subscription = $this->subscriptionService->createSubscription($user, $plan);

        $this->assertEquals($initialCount + 1, Transaction::count());

        $transaction = Transaction::where('subscription_id', $subscription->id)->first();
        $this->assertEquals('assinatura', $transaction->type);
        $this->assertEquals($plan->price, $transaction->amount);
        $this->assertEquals('pendente', $transaction->status);
    }

    /** @test */
    public function create_subscription_skips_transaction_for_free_plan()
    {
        $user = $this->createEmpresa();

        // Create or get free plan
        $freePlan = Plan::where('price', 0)->first();
        if (!$freePlan) {
            $freePlan = Plan::create([
                'name' => 'Free',
                'slug' => 'free',
                'price' => 0,
                'billing_cycle' => 'mensal',
                'features' => ['basic'],
                'max_interactions' => 5,
                'max_services' => 1,
                'ranking_enabled' => false,
                'featured_enabled' => false,
                'priority' => 0,
            ]);
        }

        $initialCount = Transaction::count();

        $subscription = $this->subscriptionService->createSubscription($user, $freePlan);

        // No transaction should be created
        $this->assertEquals($initialCount, Transaction::count());
        $this->assertNull(Transaction::where('subscription_id', $subscription->id)->first());
    }

    /** @test */
    public function create_subscription_sets_interactions_to_zero()
    {
        $user = $this->createEmpresa();
        $plan = Plan::first();

        $subscription = $this->subscriptionService->createSubscription($user, $plan);

        $this->assertEquals(0, $subscription->interactions_used);
    }

    // ========================================
    // changePlan() Tests
    // ========================================

    /** @test */
    public function change_plan_rejects_same_plan()
    {
        $empresa = $this->createEmpresa();
        $subscription = $empresa->activeSubscription;
        $currentPlan = $subscription->plan;

        $result = $this->subscriptionService->changePlan($subscription, $currentPlan);

        $this->assertFalse($result['success']);
        $this->assertStringContainsString('igual ao atual', $result['message']);
    }

    /** @test */
    public function change_plan_upgrade_creates_diff_transaction()
    {
        $empresa = $this->createEmpresa();
        $subscription = $empresa->activeSubscription;
        $currentPlan = $subscription->plan;

        // Get a more expensive plan
        $expensivePlan = Plan::where('price', '>', $currentPlan->price)->first();
        if (!$expensivePlan) {
            $expensivePlan = Plan::create([
                'name' => 'Premium Test',
                'slug' => 'premium-test',
                'price' => $currentPlan->price + 100,
                'billing_cycle' => 'mensal',
                'features' => ['all'],
                'max_interactions' => 100,
                'max_services' => 50,
                'ranking_enabled' => true,
                'featured_enabled' => true,
                'priority' => 99,
            ]);
        }

        $initialCount = Transaction::count();
        $priceDiff = $expensivePlan->price - $currentPlan->price;

        $result = $this->subscriptionService->changePlan($subscription, $expensivePlan);

        $this->assertTrue($result['success']);
        $this->assertStringContainsString('Upgrade', $result['message']);
        $this->assertEquals($initialCount + 1, Transaction::count());

        // Check transaction amount
        $transaction = Transaction::where('subscription_id', $subscription->id)
            ->where('type', 'assinatura')
            ->latest()
            ->first();
        $this->assertEquals($priceDiff, $transaction->amount);
    }

    /** @test */
    public function change_plan_downgrade_no_transaction()
    {
        $empresa = $this->createEmpresa();

        // First give them a premium plan
        $premiumPlan = Plan::where('price', '>', 0)->orderByDesc('price')->first();
        $subscription = Subscription::create([
            'user_id' => $empresa->id,
            'plan_id' => $premiumPlan->id,
            'status' => 'ativa',
            'starts_at' => now(),
            'ends_at' => now()->addMonth(),
            'interactions_used' => 0,
        ]);

        // Get a cheaper plan
        $cheaperPlan = Plan::where('price', '<', $premiumPlan->price)
            ->where('id', '!=', $premiumPlan->id)
            ->first();

        if (!$cheaperPlan) {
            $cheaperPlan = Plan::create([
                'name' => 'Basic Test',
                'slug' => 'basic-test',
                'price' => 0,
                'billing_cycle' => 'mensal',
                'features' => ['basic'],
                'max_interactions' => 5,
                'max_services' => 1,
                'ranking_enabled' => false,
                'featured_enabled' => false,
                'priority' => 0,
            ]);
        }

        $initialCount = Transaction::count();

        $result = $this->subscriptionService->changePlan($subscription, $cheaperPlan);

        $this->assertTrue($result['success']);
        $this->assertStringContainsString('Downgrade', $result['message']);
        // No new transaction for downgrade
        $this->assertEquals($initialCount, Transaction::count());
    }

    /** @test */
    public function change_plan_updates_subscription_to_new_plan()
    {
        $empresa = $this->createEmpresa();
        $subscription = $empresa->activeSubscription;
        $oldPlanId = $subscription->plan_id;

        $newPlan = Plan::where('id', '!=', $oldPlanId)->first();

        $this->subscriptionService->changePlan($subscription, $newPlan);

        $subscription->refresh();
        $this->assertEquals($newPlan->id, $subscription->plan_id);
        $this->assertEquals('ativa', $subscription->status);
    }

    /** @test */
    public function change_plan_extends_end_date()
    {
        $empresa = $this->createEmpresa();
        $subscription = $empresa->activeSubscription;
        $oldEndDate = $subscription->ends_at;

        $newPlan = Plan::where('id', '!=', $subscription->plan_id)->first();

        Carbon::setTestNow(now());
        $this->subscriptionService->changePlan($subscription, $newPlan);

        $subscription->refresh();
        // End date should be recalculated from now
        $this->assertTrue($subscription->ends_at->gte(now()));
    }

    // ========================================
    // cancelSubscription() Tests
    // ========================================

    /** @test */
    public function cancel_subscription_updates_status()
    {
        $empresa = $this->createEmpresa();
        $subscription = $empresa->activeSubscription;

        $this->assertEquals('ativa', $subscription->status);

        $this->subscriptionService->cancelSubscription($subscription);

        $subscription->refresh();
        $this->assertEquals('cancelada', $subscription->status);
    }

    /** @test */
    public function cancel_subscription_does_not_change_dates()
    {
        $empresa = $this->createEmpresa();
        $subscription = $empresa->activeSubscription;
        $originalEndsAt = $subscription->ends_at;
        $originalStartsAt = $subscription->starts_at;

        $this->subscriptionService->cancelSubscription($subscription);

        $subscription->refresh();
        $this->assertEquals($originalEndsAt->format('Y-m-d'), $subscription->ends_at->format('Y-m-d'));
        $this->assertEquals($originalStartsAt->format('Y-m-d'), $subscription->starts_at->format('Y-m-d'));
    }

    // ========================================
    // expireSubscriptions() Tests
    // ========================================

    /** @test */
    public function expire_subscriptions_updates_expired_only()
    {
        // Clear existing subscriptions
        Subscription::query()->delete();

        $user1 = $this->createEmpresa();
        $user2 = $this->createEmpresa();
        $plan = Plan::first();

        // Create expired subscription
        $expiredSub = Subscription::create([
            'user_id' => $user1->id,
            'plan_id' => $plan->id,
            'status' => 'ativa',
            'starts_at' => now()->subMonths(2),
            'ends_at' => now()->subDay(), // Ended yesterday
            'interactions_used' => 0,
        ]);

        // Create active subscription
        $activeSub = Subscription::create([
            'user_id' => $user2->id,
            'plan_id' => $plan->id,
            'status' => 'ativa',
            'starts_at' => now(),
            'ends_at' => now()->addMonth(), // Still active
            'interactions_used' => 0,
        ]);

        $count = $this->subscriptionService->expireSubscriptions();

        $this->assertEquals(1, $count);

        $expiredSub->refresh();
        $activeSub->refresh();

        $this->assertEquals('expirada', $expiredSub->status);
        $this->assertEquals('ativa', $activeSub->status);
    }

    /** @test */
    public function expire_subscriptions_ignores_already_expired()
    {
        Subscription::query()->delete();

        $user = $this->createEmpresa();
        $plan = Plan::first();

        // Already expired subscription
        Subscription::create([
            'user_id' => $user->id,
            'plan_id' => $plan->id,
            'status' => 'expirada',
            'starts_at' => now()->subMonths(2),
            'ends_at' => now()->subDay(),
            'interactions_used' => 0,
        ]);

        $count = $this->subscriptionService->expireSubscriptions();

        $this->assertEquals(0, $count);
    }

    /** @test */
    public function expire_subscriptions_ignores_cancelled()
    {
        Subscription::query()->delete();

        $user = $this->createEmpresa();
        $plan = Plan::first();

        // Cancelled subscription with past end date
        Subscription::create([
            'user_id' => $user->id,
            'plan_id' => $plan->id,
            'status' => 'cancelada',
            'starts_at' => now()->subMonths(2),
            'ends_at' => now()->subDay(),
            'interactions_used' => 0,
        ]);

        $count = $this->subscriptionService->expireSubscriptions();

        $this->assertEquals(0, $count);
    }

    // ========================================
    // renewSubscription() Tests
    // ========================================

    /** @test */
    public function renew_subscription_resets_interactions()
    {
        $empresa = $this->createEmpresa();
        $subscription = $empresa->activeSubscription;

        // Use some interactions
        $subscription->update(['interactions_used' => 25]);
        $this->assertEquals(25, $subscription->interactions_used);

        $this->subscriptionService->renewSubscription($subscription);

        $subscription->refresh();
        $this->assertEquals(0, $subscription->interactions_used);
    }

    /** @test */
    public function renew_subscription_extends_end_date()
    {
        $empresa = $this->createEmpresa();
        $subscription = $empresa->activeSubscription;
        $plan = $subscription->plan;

        // Set to expired
        $subscription->update([
            'status' => 'expirada',
            'ends_at' => now()->subDay(),
        ]);

        Carbon::setTestNow(now());

        $this->subscriptionService->renewSubscription($subscription);

        $subscription->refresh();
        $this->assertEquals('ativa', $subscription->status);
        $this->assertTrue($subscription->starts_at->isToday());
        $this->assertTrue($subscription->ends_at->gt(now()));
    }

    /** @test */
    public function renew_subscription_creates_transaction_for_paid_plan()
    {
        $empresa = $this->createEmpresa();
        $subscription = $empresa->activeSubscription;
        $plan = $subscription->plan;

        // Ensure it's a paid plan
        if ($plan->price <= 0) {
            $plan = Plan::where('price', '>', 0)->first();
            $subscription->update(['plan_id' => $plan->id]);
        }

        $initialCount = Transaction::count();

        $this->subscriptionService->renewSubscription($subscription);

        $this->assertEquals($initialCount + 1, Transaction::count());

        $transaction = Transaction::where('subscription_id', $subscription->id)
            ->where('type', 'assinatura')
            ->latest()
            ->first();

        $this->assertNotNull($transaction);
        $this->assertEquals($plan->price, $transaction->amount);
        $this->assertEquals('pendente', $transaction->status);
    }

    /** @test */
    public function renew_subscription_skips_transaction_for_free_plan()
    {
        $empresa = $this->createEmpresa();

        // Get or create free plan
        $freePlan = Plan::where('price', 0)->first();
        if (!$freePlan) {
            $freePlan = Plan::create([
                'name' => 'Free Renewal',
                'slug' => 'free-renewal',
                'price' => 0,
                'billing_cycle' => 'mensal',
                'features' => ['basic'],
                'max_interactions' => 5,
                'max_services' => 1,
                'ranking_enabled' => false,
                'featured_enabled' => false,
                'priority' => 0,
            ]);
        }

        // Create subscription with free plan
        $subscription = Subscription::create([
            'user_id' => $empresa->id,
            'plan_id' => $freePlan->id,
            'status' => 'expirada',
            'starts_at' => now()->subMonth(),
            'ends_at' => now()->subDay(),
            'interactions_used' => 5,
        ]);

        $initialCount = Transaction::count();

        $this->subscriptionService->renewSubscription($subscription);

        // No new transaction
        $this->assertEquals($initialCount, Transaction::count());

        // But subscription is renewed
        $subscription->refresh();
        $this->assertEquals('ativa', $subscription->status);
        $this->assertEquals(0, $subscription->interactions_used);
    }

    /** @test */
    public function renew_subscription_returns_updated_subscription()
    {
        $empresa = $this->createEmpresa();
        $subscription = $empresa->activeSubscription;

        $result = $this->subscriptionService->renewSubscription($subscription);

        $this->assertInstanceOf(Subscription::class, $result);
        $this->assertEquals('ativa', $result->status);
        $this->assertEquals(0, $result->interactions_used);
    }
}
