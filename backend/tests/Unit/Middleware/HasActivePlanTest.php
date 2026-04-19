<?php

namespace Tests\Unit\Middleware;

use App\Http\Middleware\HasActivePlan;
use App\Models\User;
use App\Models\Plan;
use App\Models\Subscription;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\Request;
use Tests\TestCase;

class HasActivePlanTest extends TestCase
{
    use RefreshDatabase;

    protected HasActivePlan $middleware;

    protected function setUp(): void
    {
        parent::setUp();
        $this->middleware = new HasActivePlan();
    }

    // ========================================
    // Authentication Tests
    // ========================================

    /** @test */
    public function returns_401_for_unauthenticated_request()
    {
        $request = Request::create('/api/protected', 'GET');

        $response = $this->middleware->handle($request, function () {
            return response()->json(['success' => true]);
        });

        $this->assertEquals(401, $response->getStatusCode());
        $this->assertStringContainsString('Não autenticado', $response->getContent());
    }

    // ========================================
    // Subscription Validation Tests
    // ========================================

    /** @test */
    public function returns_403_for_user_without_subscription()
    {
        $empresa = $this->createEmpresa();

        // Remove subscription
        Subscription::where('user_id', $empresa->id)->delete();
        $empresa->refresh();

        $request = Request::create('/api/protected', 'GET');
        $request->setUserResolver(fn() => $empresa);

        $response = $this->middleware->handle($request, function () {
            return response()->json(['success' => true]);
        });

        $this->assertEquals(403, $response->getStatusCode());

        $data = json_decode($response->getContent(), true);
        $this->assertEquals('NO_SUBSCRIPTION', $data['code']);
        $this->assertStringContainsString('assinatura ativa', $data['message']);
    }

    /** @test */
    public function returns_403_for_expired_subscription()
    {
        $empresa = $this->createEmpresa();
        $subscription = $empresa->activeSubscription;

        // Set subscription to expired status
        $subscription->update([
            'status' => 'ativa',
            'ends_at' => now()->subDay(), // Past date makes it expired
        ]);

        $empresa->refresh();

        $request = Request::create('/api/protected', 'GET');
        $request->setUserResolver(fn() => $empresa);

        $response = $this->middleware->handle($request, function () {
            return response()->json(['success' => true]);
        });

        $this->assertEquals(403, $response->getStatusCode());

        $data = json_decode($response->getContent(), true);
        $this->assertEquals('SUBSCRIPTION_EXPIRED', $data['code']);
        $this->assertStringContainsString('expirou', $data['message']);
    }

    /** @test */
    public function returns_403_for_cancelled_subscription()
    {
        $empresa = $this->createEmpresa();
        $subscription = $empresa->activeSubscription;

        // Set subscription to cancelled
        $subscription->update(['status' => 'cancelada']);
        $empresa->refresh();

        $request = Request::create('/api/protected', 'GET');
        $request->setUserResolver(fn() => $empresa);

        $response = $this->middleware->handle($request, function () {
            return response()->json(['success' => true]);
        });

        // Should fail because cancelled subscription is not active
        $this->assertEquals(403, $response->getStatusCode());
    }

    /** @test */
    public function allows_user_with_active_subscription()
    {
        $empresa = $this->createEmpresa();
        $subscription = $empresa->activeSubscription;

        // Ensure subscription is active
        $subscription->update([
            'status' => 'ativa',
            'ends_at' => now()->addMonth(),
        ]);

        $empresa->refresh();

        $request = Request::create('/api/protected', 'GET');
        $request->setUserResolver(fn() => $empresa);

        $response = $this->middleware->handle($request, function ($req) {
            return response()->json([
                'success' => true,
                'has_subscription' => $req->has('subscription'),
                'has_plan' => $req->has('plan'),
            ]);
        });

        $this->assertEquals(200, $response->getStatusCode());
    }

    /** @test */
    public function allows_user_with_null_end_date_subscription()
    {
        $empresa = $this->createEmpresa();
        $subscription = $empresa->activeSubscription;

        // Null end date means unlimited
        $subscription->update([
            'status' => 'ativa',
            'ends_at' => null,
        ]);

        $empresa->refresh();

        $request = Request::create('/api/protected', 'GET');
        $request->setUserResolver(fn() => $empresa);

        $response = $this->middleware->handle($request, function () {
            return response()->json(['success' => true]);
        });

        $this->assertEquals(200, $response->getStatusCode());
    }

    // ========================================
    // Request Enrichment Tests
    // ========================================

    /** @test */
    public function merges_subscription_into_request()
    {
        $empresa = $this->createEmpresa();
        $subscription = $empresa->activeSubscription;
        $subscription->update([
            'status' => 'ativa',
            'ends_at' => now()->addMonth(),
        ]);
        $empresa->refresh();

        $request = Request::create('/api/protected', 'GET');
        $request->setUserResolver(fn() => $empresa);

        $passedRequest = null;
        $this->middleware->handle($request, function ($req) use (&$passedRequest) {
            $passedRequest = $req;
            return response()->json(['success' => true]);
        });

        $this->assertTrue($passedRequest->has('subscription'));
        $this->assertInstanceOf(Subscription::class, $passedRequest->get('subscription'));
    }

    /** @test */
    public function merges_plan_into_request()
    {
        $empresa = $this->createEmpresa();
        $subscription = $empresa->activeSubscription;
        $subscription->update([
            'status' => 'ativa',
            'ends_at' => now()->addMonth(),
        ]);
        $empresa->refresh();

        $request = Request::create('/api/protected', 'GET');
        $request->setUserResolver(fn() => $empresa);

        $passedRequest = null;
        $this->middleware->handle($request, function ($req) use (&$passedRequest) {
            $passedRequest = $req;
            return response()->json(['success' => true]);
        });

        $this->assertTrue($passedRequest->has('plan'));
        $this->assertInstanceOf(Plan::class, $passedRequest->get('plan'));
    }

    // ========================================
    // Response Format Tests
    // ========================================

    /** @test */
    public function no_subscription_response_has_correct_structure()
    {
        $empresa = $this->createEmpresa();
        Subscription::where('user_id', $empresa->id)->delete();
        $empresa->refresh();

        $request = Request::create('/api/protected', 'GET');
        $request->setUserResolver(fn() => $empresa);

        $response = $this->middleware->handle($request, function () {
            return response()->json(['success' => true]);
        });

        $data = json_decode($response->getContent(), true);

        $this->assertFalse($data['success']);
        $this->assertArrayHasKey('message', $data);
        $this->assertArrayHasKey('code', $data);
    }

    /** @test */
    public function expired_response_has_correct_structure()
    {
        $empresa = $this->createEmpresa();
        $subscription = $empresa->activeSubscription;
        $subscription->update([
            'status' => 'ativa',
            'ends_at' => now()->subDay(),
        ]);
        $empresa->refresh();

        $request = Request::create('/api/protected', 'GET');
        $request->setUserResolver(fn() => $empresa);

        $response = $this->middleware->handle($request, function () {
            return response()->json(['success' => true]);
        });

        $data = json_decode($response->getContent(), true);

        $this->assertFalse($data['success']);
        $this->assertArrayHasKey('message', $data);
        $this->assertArrayHasKey('code', $data);
        $this->assertEquals('SUBSCRIPTION_EXPIRED', $data['code']);
    }
}
