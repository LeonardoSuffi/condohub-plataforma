<?php

namespace Tests\Unit\Models;

use App\Models\Plan;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PlanTest extends TestCase
{
    use RefreshDatabase;

    // ========================================
    // isFree() Tests
    // ========================================

    /** @test */
    public function is_free_returns_true_for_zero_price()
    {
        $plan = Plan::create([
            'name' => 'Free Plan',
            'slug' => 'free-test',
            'price' => 0,
            'billing_cycle' => 'mensal',
            'features' => ['basic'],
            'max_interactions' => 5,
            'max_services' => 1,
            'ranking_enabled' => false,
            'featured_enabled' => false,
            'priority' => 0,
        ]);

        $this->assertTrue($plan->isFree());
    }

    /** @test */
    public function is_free_returns_false_for_non_zero_price()
    {
        $plan = Plan::create([
            'name' => 'Paid Plan',
            'slug' => 'paid-test',
            'price' => 99.00,
            'billing_cycle' => 'mensal',
            'features' => ['all'],
            'max_interactions' => 100,
            'max_services' => 50,
            'ranking_enabled' => true,
            'featured_enabled' => true,
            'priority' => 1,
        ]);

        $this->assertFalse($plan->isFree());
    }

    /** @test */
    public function is_free_returns_false_for_small_price()
    {
        $plan = Plan::create([
            'name' => 'Cheap Plan',
            'slug' => 'cheap-test',
            'price' => 0.01,
            'billing_cycle' => 'mensal',
            'features' => ['basic'],
            'max_interactions' => 10,
            'max_services' => 2,
            'ranking_enabled' => false,
            'featured_enabled' => false,
            'priority' => 0,
        ]);

        $this->assertFalse($plan->isFree());
    }

    // ========================================
    // isPremium() Tests
    // ========================================

    /** @test */
    public function is_premium_returns_true_for_premium_slug()
    {
        $plan = Plan::create([
            'name' => 'Premium',
            'slug' => 'premium',
            'price' => 199.00,
            'billing_cycle' => 'mensal',
            'features' => ['all', 'priority'],
            'max_interactions' => 500,
            'max_services' => 100,
            'ranking_enabled' => true,
            'featured_enabled' => true,
            'priority' => 99,
        ]);

        $this->assertTrue($plan->isPremium());
    }

    /** @test */
    public function is_premium_returns_false_for_non_premium_slug()
    {
        $plan = Plan::create([
            'name' => 'Plus',
            'slug' => 'plus',
            'price' => 99.00,
            'billing_cycle' => 'mensal',
            'features' => ['all'],
            'max_interactions' => 100,
            'max_services' => 50,
            'ranking_enabled' => true,
            'featured_enabled' => false,
            'priority' => 1,
        ]);

        $this->assertFalse($plan->isPremium());
    }

    // ========================================
    // getDurationInDays() Tests
    // ========================================

    /** @test */
    public function get_duration_returns_30_for_mensal()
    {
        $plan = Plan::create([
            'name' => 'Monthly',
            'slug' => 'monthly-test',
            'price' => 99.00,
            'billing_cycle' => 'mensal',
            'features' => ['all'],
            'max_interactions' => 100,
            'max_services' => 50,
            'ranking_enabled' => true,
            'featured_enabled' => false,
            'priority' => 1,
        ]);

        $this->assertEquals(30, $plan->getDurationInDays());
    }

    /** @test */
    public function get_duration_returns_90_for_trimestral()
    {
        $plan = Plan::create([
            'name' => 'Quarterly',
            'slug' => 'quarterly-test',
            'price' => 249.00,
            'billing_cycle' => 'trimestral',
            'features' => ['all'],
            'max_interactions' => 100,
            'max_services' => 50,
            'ranking_enabled' => true,
            'featured_enabled' => false,
            'priority' => 1,
        ]);

        $this->assertEquals(90, $plan->getDurationInDays());
    }

    /** @test */
    public function get_duration_returns_180_for_semestral()
    {
        $plan = Plan::create([
            'name' => 'Semi-Annual',
            'slug' => 'semiannual-test',
            'price' => 449.00,
            'billing_cycle' => 'semestral',
            'features' => ['all'],
            'max_interactions' => 100,
            'max_services' => 50,
            'ranking_enabled' => true,
            'featured_enabled' => false,
            'priority' => 1,
        ]);

        $this->assertEquals(180, $plan->getDurationInDays());
    }

    /** @test */
    public function get_duration_returns_365_for_anual()
    {
        $plan = Plan::create([
            'name' => 'Annual',
            'slug' => 'annual-test',
            'price' => 799.00,
            'billing_cycle' => 'anual',
            'features' => ['all'],
            'max_interactions' => 100,
            'max_services' => 50,
            'ranking_enabled' => true,
            'featured_enabled' => false,
            'priority' => 1,
        ]);

        $this->assertEquals(365, $plan->getDurationInDays());
    }

    /** @test */
    public function get_duration_returns_30_for_unknown_cycle()
    {
        $plan = Plan::create([
            'name' => 'Unknown',
            'slug' => 'unknown-test',
            'price' => 99.00,
            'billing_cycle' => 'weekly', // Not a valid cycle
            'features' => ['all'],
            'max_interactions' => 100,
            'max_services' => 50,
            'ranking_enabled' => true,
            'featured_enabled' => false,
            'priority' => 1,
        ]);

        $this->assertEquals(30, $plan->getDurationInDays());
    }

    // ========================================
    // Slug Auto-Generation Tests
    // ========================================

    /** @test */
    public function slug_auto_generated_on_create()
    {
        $plan = Plan::create([
            'name' => 'My Awesome Plan',
            // No slug provided
            'price' => 99.00,
            'billing_cycle' => 'mensal',
            'features' => ['all'],
            'max_interactions' => 100,
            'max_services' => 50,
            'ranking_enabled' => true,
            'featured_enabled' => false,
            'priority' => 1,
        ]);

        $this->assertNotEmpty($plan->slug);
        $this->assertEquals('my-awesome-plan', $plan->slug);
    }

    /** @test */
    public function slug_not_overwritten_if_provided()
    {
        $plan = Plan::create([
            'name' => 'My Plan',
            'slug' => 'custom-slug',
            'price' => 99.00,
            'billing_cycle' => 'mensal',
            'features' => ['all'],
            'max_interactions' => 100,
            'max_services' => 50,
            'ranking_enabled' => true,
            'featured_enabled' => false,
            'priority' => 1,
        ]);

        $this->assertEquals('custom-slug', $plan->slug);
    }

    /** @test */
    public function slug_handles_special_characters()
    {
        $plan = Plan::create([
            'name' => 'Plano Básico R$ 99,00',
            'price' => 99.00,
            'billing_cycle' => 'mensal',
            'features' => ['basic'],
            'max_interactions' => 10,
            'max_services' => 2,
            'ranking_enabled' => false,
            'featured_enabled' => false,
            'priority' => 0,
        ]);

        // Slug should be normalized
        $this->assertNotEmpty($plan->slug);
        $this->assertStringNotContainsString(' ', $plan->slug);
        $this->assertStringNotContainsString('$', $plan->slug);
    }

    // ========================================
    // Scopes Tests
    // ========================================

    /** @test */
    public function active_scope_returns_only_active_plans()
    {
        // Create active plan
        Plan::create([
            'name' => 'Active Plan',
            'slug' => 'active-scope-test',
            'price' => 99.00,
            'billing_cycle' => 'mensal',
            'features' => ['all'],
            'max_interactions' => 100,
            'max_services' => 50,
            'ranking_enabled' => true,
            'featured_enabled' => false,
            'priority' => 1,
            'active' => true,
        ]);

        // Create inactive plan
        Plan::create([
            'name' => 'Inactive Plan',
            'slug' => 'inactive-scope-test',
            'price' => 99.00,
            'billing_cycle' => 'mensal',
            'features' => ['all'],
            'max_interactions' => 100,
            'max_services' => 50,
            'ranking_enabled' => true,
            'featured_enabled' => false,
            'priority' => 1,
            'active' => false,
        ]);

        $activePlans = Plan::active()->get();

        $activePlans->each(function ($plan) {
            $this->assertTrue($plan->active);
        });
    }

    /** @test */
    public function ordered_scope_orders_by_priority_then_price()
    {
        // Clear existing plans
        Plan::query()->delete();

        Plan::create([
            'name' => 'High Priority Cheap',
            'slug' => 'high-cheap',
            'price' => 10.00,
            'billing_cycle' => 'mensal',
            'features' => ['all'],
            'max_interactions' => 100,
            'max_services' => 50,
            'ranking_enabled' => true,
            'featured_enabled' => false,
            'priority' => 1,
        ]);

        Plan::create([
            'name' => 'Low Priority',
            'slug' => 'low',
            'price' => 50.00,
            'billing_cycle' => 'mensal',
            'features' => ['all'],
            'max_interactions' => 100,
            'max_services' => 50,
            'ranking_enabled' => true,
            'featured_enabled' => false,
            'priority' => 0,
        ]);

        Plan::create([
            'name' => 'High Priority Expensive',
            'slug' => 'high-expensive',
            'price' => 100.00,
            'billing_cycle' => 'mensal',
            'features' => ['all'],
            'max_interactions' => 100,
            'max_services' => 50,
            'ranking_enabled' => true,
            'featured_enabled' => false,
            'priority' => 1,
        ]);

        $plans = Plan::ordered()->get();

        // First should be priority 0
        $this->assertEquals(0, $plans[0]->priority);

        // Then priority 1, ordered by price
        $this->assertEquals(1, $plans[1]->priority);
        $this->assertEquals(1, $plans[2]->priority);
        $this->assertLessThan($plans[2]->price, $plans[1]->price);
    }

    // ========================================
    // Relationships Tests
    // ========================================

    /** @test */
    public function plan_has_many_subscriptions()
    {
        $empresa = $this->createEmpresa();
        $plan = $empresa->activeSubscription->plan;

        $this->assertGreaterThan(0, $plan->subscriptions()->count());
    }

    // ========================================
    // Features Array Tests
    // ========================================

    /** @test */
    public function features_is_cast_to_array()
    {
        $plan = Plan::create([
            'name' => 'Features Test',
            'slug' => 'features-test',
            'price' => 99.00,
            'billing_cycle' => 'mensal',
            'features' => ['feature1', 'feature2', 'feature3'],
            'max_interactions' => 100,
            'max_services' => 50,
            'ranking_enabled' => true,
            'featured_enabled' => false,
            'priority' => 1,
        ]);

        $this->assertIsArray($plan->features);
        $this->assertCount(3, $plan->features);
        $this->assertContains('feature1', $plan->features);
    }
}
