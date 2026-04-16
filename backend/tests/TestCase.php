<?php

namespace Tests;

use Illuminate\Foundation\Testing\TestCase as BaseTestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;
use App\Models\User;
use App\Models\Plan;
use App\Models\Category;

abstract class TestCase extends BaseTestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(\Database\Seeders\DatabaseSeeder::class);
    }

    /**
     * Create empresa user with profile and subscription
     */
    protected function createEmpresa(array $attrs = []): User
    {
        $user = User::factory()->create(array_merge([
            'type' => 'empresa',
            'email' => 'empresa@test.com',
        ], $attrs));

        $user->companyProfile()->create([
            'cnpj' => '12345678000199',
            'razao_social' => 'Empresa Teste LTDA',
            'nome_fantasia' => 'Empresa Teste',
            'telefone' => '11999999999',
            'cidade' => 'Sao Paulo',
            'estado' => 'SP',
        ]);

        // Create active subscription
        $plan = Plan::where('slug', 'gratuito')->first() ?? Plan::first();
        $user->subscriptions()->create([
            'plan_id' => $plan->id,
            'status' => 'ativa',
            'starts_at' => now(),
            'ends_at' => now()->addMonth(),
        ]);

        return $user->fresh(['companyProfile', 'subscriptions']);
    }

    /**
     * Create cliente user with profile
     */
    protected function createCliente(array $attrs = []): User
    {
        $user = User::factory()->create(array_merge([
            'type' => 'cliente',
            'email' => 'cliente@test.com',
        ], $attrs));

        $user->clientProfile()->create([
            'cpf' => '12345678901',
            'tipo' => 'sindico',
            'nome_condominio' => 'Condominio Teste',
            'telefone' => '11888888888',
            'cidade' => 'Sao Paulo',
            'estado' => 'SP',
        ]);

        return $user->fresh(['clientProfile']);
    }

    /**
     * Create admin user
     */
    protected function createAdmin(array $attrs = []): User
    {
        return User::factory()->create(array_merge([
            'type' => 'admin',
            'email' => 'admin@test.com',
        ], $attrs));
    }

    /**
     * Get category
     */
    protected function getCategory(): Category
    {
        return Category::first() ?? Category::create([
            'name' => 'Test Category',
            'slug' => 'test-category',
            'active' => true,
        ]);
    }
}
