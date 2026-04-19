<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\User;
use App\Models\Plan;

class AuthTest extends TestCase
{
    /** @test */
    public function empresa_can_register_with_valid_data()
    {
        $response = $this->postJson('/api/auth/register/empresa', [
            'name' => 'Test Empresa',
            'email' => 'newempresa@test.com',
            'password' => 'Password123!',
            'password_confirmation' => 'Password123!',
            'cnpj' => '12.345.678/0001-00',
            'razao_social' => 'Test Empresa LTDA',
            'nome_fantasia' => 'Test Empresa',
            'segmento' => 'Manutencao',
        ]);

        $response->assertStatus(201)
            ->assertJsonStructure([
                'success',
                'message',
                'data' => [
                    'user',
                    'token',
                ],
            ]);

        $this->assertDatabaseHas('users', [
            'email' => 'newempresa@test.com',
            'type' => 'empresa',
        ]);

        $this->assertDatabaseHas('company_profiles', [
            'cnpj' => '12.345.678/0001-00',
        ]);
    }

    /** @test */
    public function empresa_registration_creates_free_subscription()
    {
        $response = $this->postJson('/api/auth/register/empresa', [
            'name' => 'Test Empresa',
            'email' => 'empresa2@test.com',
            'password' => 'Password123!',
            'password_confirmation' => 'Password123!',
            'cnpj' => '12.345.678/0001-01',
            'razao_social' => 'Test Empresa 2 LTDA',
            'segmento' => 'Manutencao',
        ]);

        $response->assertStatus(201);

        $user = User::where('email', 'empresa2@test.com')->first();
        $freePlan = Plan::where('slug', 'gratuito')->first();

        $this->assertDatabaseHas('subscriptions', [
            'user_id' => $user->id,
            'plan_id' => $freePlan->id,
            'status' => 'ativa',
        ]);
    }

    /** @test */
    public function cliente_can_register_with_valid_data()
    {
        $response = $this->postJson('/api/auth/register/cliente', [
            'name' => 'Test Cliente',
            'email' => 'newcliente@test.com',
            'password' => 'Password123!',
            'password_confirmation' => 'Password123!',
            'cpf' => '123.456.789-01',
            'tipo' => 'sindico',
        ]);

        $response->assertStatus(201)
            ->assertJsonStructure([
                'success',
                'message',
                'data' => [
                    'user',
                    'token',
                ],
            ]);

        $this->assertDatabaseHas('users', [
            'email' => 'newcliente@test.com',
            'type' => 'cliente',
        ]);

        $this->assertDatabaseHas('client_profiles', [
            'cpf' => '123.456.789-01',
            'tipo' => 'sindico',
        ]);
    }

    /** @test */
    public function registration_fails_with_existing_email()
    {
        $existingUser = User::factory()->create(['email' => 'existing@test.com']);

        $response = $this->postJson('/api/auth/register/cliente', [
            'name' => 'Test',
            'email' => 'existing@test.com',
            'password' => 'Password123!',
            'password_confirmation' => 'Password123!',
            'cpf' => '123.456.789-02',
            'tipo' => 'sindico',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['email']);
    }

    /** @test */
    public function user_can_login_with_correct_credentials()
    {
        $user = User::factory()->create([
            'email' => 'login@test.com',
            'password' => bcrypt('Password123!'),
        ]);

        $response = $this->postJson('/api/auth/login', [
            'email' => 'login@test.com',
            'password' => 'Password123!',
        ]);

        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'data' => [
                    'user',
                    'token',
                ],
            ]);
    }

    /** @test */
    public function login_fails_with_wrong_password()
    {
        $user = User::factory()->create([
            'email' => 'wrongpass@test.com',
            'password' => bcrypt('CorrectPassword'),
        ]);

        $response = $this->postJson('/api/auth/login', [
            'email' => 'wrongpass@test.com',
            'password' => 'WrongPassword',
        ]);

        $response->assertStatus(422);
    }

    /** @test */
    public function authenticated_user_can_logout()
    {
        $user = $this->createCliente(['email' => 'logout@test.com']);

        $response = $this->actingAs($user)->postJson('/api/auth/logout');

        $response->assertStatus(200);
    }

    /** @test */
    public function authenticated_user_can_get_profile()
    {
        $user = $this->createCliente(['email' => 'profile@test.com']);

        $response = $this->actingAs($user)->getJson('/api/users/me');

        $response->assertStatus(200)
            ->assertJsonPath('data.user.email', 'profile@test.com')
            ->assertJsonPath('data.user.type', 'cliente');
    }

    /** @test */
    public function unauthenticated_user_cannot_access_protected_routes()
    {
        $response = $this->getJson('/api/users/me');

        $response->assertStatus(401);
    }

    // ==========================================
    // SECURITY TESTS - Single Session
    // ==========================================

    /** @test */
    public function login_creates_session_id()
    {
        $user = User::factory()->create([
            'email' => 'session@test.com',
            'password' => bcrypt('Password123!'),
        ]);

        $response = $this->postJson('/api/auth/login', [
            'email' => 'session@test.com',
            'password' => 'Password123!',
        ]);

        $response->assertStatus(200);

        $user->refresh();
        $this->assertNotNull($user->current_session_id);
        $this->assertNotNull($user->last_login_at);
    }

    /** @test */
    public function new_login_invalidates_previous_session()
    {
        $user = User::factory()->create([
            'email' => 'multisession@test.com',
            'password' => bcrypt('Password123!'),
        ]);

        // First login
        $response1 = $this->postJson('/api/auth/login', [
            'email' => 'multisession@test.com',
            'password' => 'Password123!',
        ]);
        $token1 = $response1->json('data.token');
        $sessionId1 = $user->fresh()->current_session_id;

        // Second login
        $response2 = $this->postJson('/api/auth/login', [
            'email' => 'multisession@test.com',
            'password' => 'Password123!',
        ]);
        $token2 = $response2->json('data.token');
        $sessionId2 = $user->fresh()->current_session_id;

        // Session IDs should be different
        $this->assertNotEquals($sessionId1, $sessionId2);

        // Old token should be deleted
        $this->assertEquals(1, $user->tokens()->count());
    }

    // ==========================================
    // SECURITY TESTS - Failed Login Attempts
    // ==========================================

    /** @test */
    public function failed_login_increments_attempt_counter()
    {
        $user = User::factory()->create([
            'email' => 'failedlogin@test.com',
            'password' => bcrypt('CorrectPassword'),
            'failed_login_attempts' => 0,
        ]);

        $this->postJson('/api/auth/login', [
            'email' => 'failedlogin@test.com',
            'password' => 'WrongPassword',
        ]);

        $user->refresh();
        $this->assertEquals(1, $user->failed_login_attempts);
        $this->assertNotNull($user->last_failed_login_at);
    }

    /** @test */
    public function successful_login_resets_failed_attempts()
    {
        $user = User::factory()->create([
            'email' => 'resetattempts@test.com',
            'password' => bcrypt('Password123!'),
            'failed_login_attempts' => 3,
            'last_failed_login_at' => now(),
        ]);

        $response = $this->postJson('/api/auth/login', [
            'email' => 'resetattempts@test.com',
            'password' => 'Password123!',
        ]);

        $response->assertStatus(200);

        $user->refresh();
        $this->assertEquals(0, $user->failed_login_attempts);
        $this->assertNull($user->last_failed_login_at);
    }

    /** @test */
    public function user_is_temporarily_blocked_after_max_attempts()
    {
        $user = User::factory()->create([
            'email' => 'blocked@test.com',
            'password' => bcrypt('CorrectPassword'),
            'failed_login_attempts' => 5, // MAX_FAILED_ATTEMPTS
            'last_failed_login_at' => now(),
        ]);

        $response = $this->postJson('/api/auth/login', [
            'email' => 'blocked@test.com',
            'password' => 'CorrectPassword',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['email']);

        $this->assertStringContainsString('Muitas tentativas', $response->json('errors.email.0'));
    }

    /** @test */
    public function blocked_account_cannot_login()
    {
        $user = User::factory()->create([
            'email' => 'permanentblock@test.com',
            'password' => bcrypt('Password123!'),
            'is_blocked' => true,
            'blocked_at' => now(),
            'blocked_reason' => 'Violacao de termos',
        ]);

        $response = $this->postJson('/api/auth/login', [
            'email' => 'permanentblock@test.com',
            'password' => 'Password123!',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['email']);

        $this->assertStringContainsString('bloqueada', $response->json('errors.email.0'));
    }

    // ==========================================
    // SECURITY TESTS - Logout All Devices
    // ==========================================

    /** @test */
    public function user_can_logout_from_all_devices()
    {
        $user = $this->createCliente(['email' => 'logoutall@test.com']);

        // Create multiple tokens
        $user->createToken('session1');
        $user->createToken('session2');
        $user->createToken('session3');

        $this->assertEquals(3, $user->tokens()->count());

        $response = $this->actingAs($user)->postJson('/api/auth/logout-all');

        $response->assertStatus(200);
        $this->assertEquals(0, $user->fresh()->tokens()->count());
        $this->assertNull($user->fresh()->current_session_id);
    }

    // ==========================================
    // SECURITY TESTS - Session Info
    // ==========================================

    /** @test */
    public function user_can_get_session_info()
    {
        $user = User::factory()->create([
            'email' => 'sessioninfo@test.com',
            'password' => bcrypt('Password123!'),
        ]);

        // Login first to set session info
        $loginResponse = $this->postJson('/api/auth/login', [
            'email' => 'sessioninfo@test.com',
            'password' => 'Password123!',
        ]);

        $token = $loginResponse->json('data.token');

        $response = $this->withHeader('Authorization', "Bearer $token")
            ->getJson('/api/auth/session');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'data' => [
                    'last_login_at',
                    'current_session_id',
                ],
            ]);
    }
}
