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
}
