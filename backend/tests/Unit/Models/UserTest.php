<?php

namespace Tests\Unit\Models;

use App\Models\User;
use App\Models\Plan;
use App\Models\Subscription;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class UserTest extends TestCase
{
    use RefreshDatabase;

    // ========================================
    // isAdmin() Tests
    // ========================================

    /** @test */
    public function is_admin_returns_true_for_admin_type()
    {
        $admin = $this->createAdmin();

        $this->assertTrue($admin->isAdmin());
        $this->assertFalse($admin->isEmpresa());
        $this->assertFalse($admin->isCliente());
    }

    // ========================================
    // isEmpresa() Tests
    // ========================================

    /** @test */
    public function is_empresa_returns_true_for_empresa_type()
    {
        $empresa = $this->createEmpresa();

        $this->assertTrue($empresa->isEmpresa());
        $this->assertFalse($empresa->isAdmin());
        $this->assertFalse($empresa->isCliente());
    }

    // ========================================
    // isCliente() Tests
    // ========================================

    /** @test */
    public function is_cliente_returns_true_for_cliente_type()
    {
        $cliente = $this->createCliente();

        $this->assertTrue($cliente->isCliente());
        $this->assertFalse($cliente->isAdmin());
        $this->assertFalse($cliente->isEmpresa());
    }

    // ========================================
    // hasActivePlan() Tests
    // ========================================

    /** @test */
    public function has_active_plan_returns_true_when_subscription_active()
    {
        $empresa = $this->createEmpresa();

        // Should have active subscription from createEmpresa
        $this->assertTrue($empresa->hasActivePlan());
    }

    /** @test */
    public function has_active_plan_returns_false_when_no_subscription()
    {
        $empresa = $this->createEmpresa();

        // Remove subscription
        Subscription::where('user_id', $empresa->id)->delete();
        $empresa->refresh();

        $this->assertFalse($empresa->hasActivePlan());
    }

    /** @test */
    public function has_active_plan_returns_false_when_subscription_expired()
    {
        $empresa = $this->createEmpresa();

        // Set subscription to expired
        $empresa->activeSubscription->update(['status' => 'expirada']);
        $empresa->refresh();

        $this->assertFalse($empresa->hasActivePlan());
    }

    /** @test */
    public function has_active_plan_returns_false_when_subscription_cancelled()
    {
        $empresa = $this->createEmpresa();

        // Set subscription to cancelled
        $empresa->activeSubscription->update(['status' => 'cancelada']);
        $empresa->refresh();

        $this->assertFalse($empresa->hasActivePlan());
    }

    // ========================================
    // getCurrentPlan() Tests
    // ========================================

    /** @test */
    public function get_current_plan_returns_plan_from_subscription()
    {
        $empresa = $this->createEmpresa();
        $expectedPlan = $empresa->activeSubscription->plan;

        $currentPlan = $empresa->getCurrentPlan();

        $this->assertNotNull($currentPlan);
        $this->assertEquals($expectedPlan->id, $currentPlan->id);
    }

    /** @test */
    public function get_current_plan_returns_null_when_no_subscription()
    {
        $empresa = $this->createEmpresa();

        Subscription::where('user_id', $empresa->id)->delete();
        $empresa->refresh();

        $this->assertNull($empresa->getCurrentPlan());
    }

    // ========================================
    // getProfile() Tests
    // ========================================

    /** @test */
    public function get_profile_returns_company_for_empresa()
    {
        $empresa = $this->createEmpresa();

        $profile = $empresa->getProfile();

        $this->assertNotNull($profile);
        $this->assertInstanceOf(\App\Models\CompanyProfile::class, $profile);
        $this->assertEquals($empresa->companyProfile->id, $profile->id);
    }

    /** @test */
    public function get_profile_returns_client_for_cliente()
    {
        $cliente = $this->createCliente();

        $profile = $cliente->getProfile();

        $this->assertNotNull($profile);
        $this->assertInstanceOf(\App\Models\ClientProfile::class, $profile);
        $this->assertEquals($cliente->clientProfile->id, $profile->id);
    }

    /** @test */
    public function get_profile_returns_null_for_admin()
    {
        $admin = $this->createAdmin();

        $profile = $admin->getProfile();

        $this->assertNull($profile);
    }

    // ========================================
    // Relationships Tests
    // ========================================

    /** @test */
    public function empresa_has_company_profile_relationship()
    {
        $empresa = $this->createEmpresa();

        $this->assertNotNull($empresa->companyProfile);
        $this->assertEquals($empresa->id, $empresa->companyProfile->user_id);
    }

    /** @test */
    public function cliente_has_client_profile_relationship()
    {
        $cliente = $this->createCliente();

        $this->assertNotNull($cliente->clientProfile);
        $this->assertEquals($cliente->id, $cliente->clientProfile->user_id);
    }

    /** @test */
    public function user_has_subscriptions_relationship()
    {
        $empresa = $this->createEmpresa();

        $this->assertNotNull($empresa->subscriptions);
        $this->assertGreaterThan(0, $empresa->subscriptions->count());
    }

    /** @test */
    public function active_subscription_returns_only_active()
    {
        $empresa = $this->createEmpresa();
        $plan = Plan::first();

        // Create an expired subscription
        Subscription::create([
            'user_id' => $empresa->id,
            'plan_id' => $plan->id,
            'status' => 'expirada',
            'starts_at' => now()->subMonths(2),
            'ends_at' => now()->subMonth(),
            'interactions_used' => 0,
        ]);

        $empresa->refresh();

        // activeSubscription should only return the ativa one
        $this->assertEquals('ativa', $empresa->activeSubscription->status);
    }

    // ========================================
    // Soft Delete Tests
    // ========================================

    /** @test */
    public function user_can_be_soft_deleted()
    {
        $empresa = $this->createEmpresa();
        $userId = $empresa->id;

        $empresa->delete();

        // Should not be found normally
        $this->assertNull(User::find($userId));

        // But should be found with trashed
        $this->assertNotNull(User::withTrashed()->find($userId));
    }

    /** @test */
    public function soft_deleted_user_can_be_restored()
    {
        $empresa = $this->createEmpresa();
        $userId = $empresa->id;

        $empresa->delete();
        $empresa->restore();

        $this->assertNotNull(User::find($userId));
    }

    // ========================================
    // Type Validation Tests
    // ========================================

    /** @test */
    public function user_types_are_mutually_exclusive()
    {
        $admin = $this->createAdmin();
        $empresa = $this->createEmpresa();
        $cliente = $this->createCliente();

        // Admin
        $this->assertTrue($admin->isAdmin());
        $this->assertFalse($admin->isEmpresa());
        $this->assertFalse($admin->isCliente());

        // Empresa
        $this->assertFalse($empresa->isAdmin());
        $this->assertTrue($empresa->isEmpresa());
        $this->assertFalse($empresa->isCliente());

        // Cliente
        $this->assertFalse($cliente->isAdmin());
        $this->assertFalse($cliente->isEmpresa());
        $this->assertTrue($cliente->isCliente());
    }
}
