<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Plan;
use App\Models\Category;
use App\Models\CompanyProfile;
use App\Models\ClientProfile;
use App\Models\Subscription;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // Criar planos
        $this->createPlans();

        // Criar categorias
        $this->createCategories();

        // Criar usuário admin
        $this->createAdmin();

        // Criar usuários de teste
        $this->createTestUsers();
    }

    protected function createPlans(): void
    {
        Plan::create([
            'name' => 'Gratuito',
            'slug' => 'gratuito',
            'price' => 0,
            'billing_cycle' => 'mensal',
            'features' => [
                'Acesso básico ao catálogo',
                'Até 5 serviços cadastrados',
                '10 interações por mês',
            ],
            'max_interactions' => 10,
            'max_services' => 5,
            'ranking_enabled' => false,
            'featured_enabled' => false,
            'priority' => 0,
            'active' => true,
        ]);

        Plan::create([
            'name' => 'Intermediário',
            'slug' => 'intermediario',
            'price' => 99.90,
            'billing_cycle' => 'mensal',
            'features' => [
                'Acesso completo ao catálogo',
                'Até 20 serviços cadastrados',
                '50 interações por mês',
                'Ranking ativo',
            ],
            'max_interactions' => 50,
            'max_services' => 20,
            'ranking_enabled' => true,
            'featured_enabled' => false,
            'priority' => 1,
            'active' => true,
        ]);

        Plan::create([
            'name' => 'Premium',
            'slug' => 'premium',
            'price' => 199.90,
            'billing_cycle' => 'mensal',
            'features' => [
                'Acesso completo ao catálogo',
                'Serviços ilimitados',
                'Interações ilimitadas',
                'Ranking prioritário',
                'Serviços em destaque',
                'Suporte prioritário',
            ],
            'max_interactions' => 9999,
            'max_services' => 9999,
            'ranking_enabled' => true,
            'featured_enabled' => true,
            'priority' => 2,
            'active' => true,
        ]);
    }

    protected function createCategories(): void
    {
        $categories = [
            'Manutenção Predial' => [
                'Elétrica',
                'Hidráulica',
                'Pintura',
                'Impermeabilização',
                'Reformas',
            ],
            'Limpeza' => [
                'Limpeza de Fachada',
                'Limpeza de Caixa D\'água',
                'Limpeza Pós-obra',
                'Dedetização',
            ],
            'Segurança' => [
                'Portaria',
                'CFTV',
                'Controle de Acesso',
                'Vigilância',
            ],
            'Jardinagem' => [
                'Paisagismo',
                'Manutenção de Jardim',
                'Poda de Árvores',
            ],
            'Elevadores' => [
                'Manutenção de Elevadores',
                'Modernização',
            ],
            'Administração' => [
                'Gestão Condominial',
                'Assessoria Jurídica',
                'Contabilidade',
            ],
        ];

        foreach ($categories as $parentName => $children) {
            $parent = Category::create([
                'name' => $parentName,
                'active' => true,
            ]);

            foreach ($children as $childName) {
                Category::create([
                    'name' => $childName,
                    'parent_id' => $parent->id,
                    'active' => true,
                ]);
            }
        }
    }

    protected function createAdmin(): void
    {
        User::create([
            'name' => 'Administrador',
            'email' => 'admin@condominial.com',
            'password' => Hash::make('admin123'),
            'type' => 'admin',
            'email_verified_at' => now(),
        ]);
    }

    protected function createTestUsers(): void
    {
        // Empresa de teste
        $empresaUser = User::create([
            'name' => 'Empresa Teste',
            'email' => 'empresa@teste.com',
            'password' => Hash::make('teste123'),
            'type' => 'empresa',
            'email_verified_at' => now(),
        ]);

        CompanyProfile::create([
            'user_id' => $empresaUser->id,
            'cnpj' => '12.345.678/0001-90',
            'razao_social' => 'Empresa Teste LTDA',
            'nome_fantasia' => 'Empresa Teste',
            'segmento' => 'Manutenção Predial',
            'telefone' => '(11) 99999-9999',
            'verified' => true,
        ]);

        // Assinatura para empresa
        $plan = Plan::where('slug', 'intermediario')->first();
        Subscription::create([
            'user_id' => $empresaUser->id,
            'plan_id' => $plan->id,
            'status' => 'ativa',
            'starts_at' => now(),
            'ends_at' => now()->addDays(30),
        ]);

        // Cliente de teste
        $clienteUser = User::create([
            'name' => 'Síndico Teste',
            'email' => 'sindico@teste.com',
            'password' => Hash::make('teste123'),
            'type' => 'cliente',
            'email_verified_at' => now(),
        ]);

        ClientProfile::create([
            'user_id' => $clienteUser->id,
            'cpf' => '123.456.789-00',
            'tipo' => 'sindico',
            'telefone' => '(11) 88888-8888',
            'nome_condominio' => 'Condomínio Teste',
        ]);
    }
}
