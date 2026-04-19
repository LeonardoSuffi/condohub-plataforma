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

        // Chama FakeDataSeeder se não estiver em ambiente de teste
        // Para rodar manualmente: php artisan db:seed --class=FakeDataSeeder
    }

    /**
     * Executa com dados fake para desenvolvimento
     */
    public function runWithFakeData(): void
    {
        $this->run();
        $this->call(FakeDataSeeder::class);
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
            [
                'name' => 'Construcao e Reformas',
                'icon' => 'building',
                'description' => 'Servicos de construcao civil e reformas em geral',
                'children' => [
                    ['name' => 'Pedreiro', 'icon' => 'brick'],
                    ['name' => 'Pintura', 'icon' => 'paintbrush'],
                    ['name' => 'Gesso e Drywall', 'icon' => 'layers'],
                    ['name' => 'Impermeabilizacao', 'icon' => 'droplet'],
                    ['name' => 'Telhados e Coberturas', 'icon' => 'home'],
                    ['name' => 'Pisos e Revestimentos', 'icon' => 'grid'],
                ],
            ],
            [
                'name' => 'Instalacoes',
                'icon' => 'wrench',
                'description' => 'Servicos de instalacoes eletricas e hidraulicas',
                'children' => [
                    ['name' => 'Eletricista', 'icon' => 'zap'],
                    ['name' => 'Encanador', 'icon' => 'droplet'],
                    ['name' => 'Ar Condicionado', 'icon' => 'wind'],
                    ['name' => 'Gas', 'icon' => 'flame'],
                    ['name' => 'Aquecedor Solar', 'icon' => 'sun'],
                ],
            ],
            [
                'name' => 'Limpeza',
                'icon' => 'sparkles',
                'description' => 'Servicos de limpeza residencial e comercial',
                'children' => [
                    ['name' => 'Limpeza Residencial', 'icon' => 'home'],
                    ['name' => 'Limpeza Comercial', 'icon' => 'building'],
                    ['name' => 'Limpeza de Vidros', 'icon' => 'square'],
                    ['name' => 'Limpeza de Estofados', 'icon' => 'armchair'],
                    ['name' => 'Limpeza Pos-obra', 'icon' => 'hard-hat'],
                    ['name' => 'Dedetizacao', 'icon' => 'bug'],
                ],
            ],
            [
                'name' => 'Jardinagem e Paisagismo',
                'icon' => 'leaf',
                'description' => 'Servicos de jardinagem e manutencao de areas verdes',
                'children' => [
                    ['name' => 'Paisagismo', 'icon' => 'trees'],
                    ['name' => 'Manutencao de Jardim', 'icon' => 'flower'],
                    ['name' => 'Poda de Arvores', 'icon' => 'scissors'],
                    ['name' => 'Irrigacao', 'icon' => 'droplet'],
                    ['name' => 'Gramados', 'icon' => 'grass'],
                ],
            ],
            [
                'name' => 'Seguranca',
                'icon' => 'shield',
                'description' => 'Servicos de seguranca patrimonial e eletronica',
                'children' => [
                    ['name' => 'Portaria', 'icon' => 'door-open'],
                    ['name' => 'CFTV e Cameras', 'icon' => 'video'],
                    ['name' => 'Alarmes', 'icon' => 'bell'],
                    ['name' => 'Controle de Acesso', 'icon' => 'fingerprint'],
                    ['name' => 'Vigilancia', 'icon' => 'eye'],
                    ['name' => 'Cerca Eletrica', 'icon' => 'zap'],
                ],
            ],
            [
                'name' => 'Tecnologia',
                'icon' => 'laptop',
                'description' => 'Servicos de informatica e tecnologia',
                'children' => [
                    ['name' => 'Suporte Tecnico', 'icon' => 'headphones'],
                    ['name' => 'Redes e Cabeamento', 'icon' => 'network'],
                    ['name' => 'Desenvolvimento Web', 'icon' => 'code'],
                    ['name' => 'Desenvolvimento de Apps', 'icon' => 'smartphone'],
                    ['name' => 'Manutencao de Computadores', 'icon' => 'monitor'],
                ],
            ],
            [
                'name' => 'Servicos Administrativos',
                'icon' => 'briefcase',
                'description' => 'Servicos administrativos e consultoria',
                'children' => [
                    ['name' => 'Contabilidade', 'icon' => 'calculator'],
                    ['name' => 'Assessoria Juridica', 'icon' => 'scale'],
                    ['name' => 'Recursos Humanos', 'icon' => 'users'],
                    ['name' => 'Marketing Digital', 'icon' => 'megaphone'],
                    ['name' => 'Consultoria Empresarial', 'icon' => 'chart-bar'],
                ],
            ],
            [
                'name' => 'Eventos e Producao',
                'icon' => 'calendar',
                'description' => 'Servicos para eventos e producoes',
                'children' => [
                    ['name' => 'Buffet e Catering', 'icon' => 'utensils'],
                    ['name' => 'Decoracao', 'icon' => 'gift'],
                    ['name' => 'Fotografia', 'icon' => 'camera'],
                    ['name' => 'Som e Iluminacao', 'icon' => 'music'],
                    ['name' => 'Locacao de Equipamentos', 'icon' => 'package'],
                ],
            ],
            [
                'name' => 'Transporte e Logistica',
                'icon' => 'truck',
                'description' => 'Servicos de transporte e mudancas',
                'children' => [
                    ['name' => 'Mudancas', 'icon' => 'box'],
                    ['name' => 'Frete', 'icon' => 'truck'],
                    ['name' => 'Motoboy', 'icon' => 'bike'],
                    ['name' => 'Armazenagem', 'icon' => 'warehouse'],
                ],
            ],
            [
                'name' => 'Saude e Bem-estar',
                'icon' => 'heart',
                'description' => 'Servicos de saude e cuidados pessoais',
                'children' => [
                    ['name' => 'Cuidador de Idosos', 'icon' => 'heart-handshake'],
                    ['name' => 'Enfermagem', 'icon' => 'stethoscope'],
                    ['name' => 'Fisioterapia', 'icon' => 'activity'],
                    ['name' => 'Personal Trainer', 'icon' => 'dumbbell'],
                    ['name' => 'Nutricao', 'icon' => 'apple'],
                ],
            ],
            [
                'name' => 'Educacao e Aulas',
                'icon' => 'graduation-cap',
                'description' => 'Servicos educacionais e aulas particulares',
                'children' => [
                    ['name' => 'Aulas Particulares', 'icon' => 'book-open'],
                    ['name' => 'Idiomas', 'icon' => 'globe'],
                    ['name' => 'Musica', 'icon' => 'music'],
                    ['name' => 'Informatica', 'icon' => 'laptop'],
                    ['name' => 'Reforco Escolar', 'icon' => 'pencil'],
                ],
            ],
            [
                'name' => 'Automotivo',
                'icon' => 'car',
                'description' => 'Servicos automotivos',
                'children' => [
                    ['name' => 'Mecanica', 'icon' => 'wrench'],
                    ['name' => 'Eletrica Automotiva', 'icon' => 'zap'],
                    ['name' => 'Funilaria e Pintura', 'icon' => 'paintbrush'],
                    ['name' => 'Lavagem e Polimento', 'icon' => 'sparkles'],
                    ['name' => 'Guincho', 'icon' => 'truck'],
                ],
            ],
        ];

        $order = 0;
        foreach ($categories as $categoryData) {
            $parent = Category::create([
                'name' => $categoryData['name'],
                'icon' => $categoryData['icon'] ?? null,
                'description' => $categoryData['description'] ?? null,
                'order' => $order++,
                'active' => true,
            ]);

            $childOrder = 0;
            foreach ($categoryData['children'] as $child) {
                Category::create([
                    'name' => $child['name'],
                    'icon' => $child['icon'] ?? null,
                    'parent_id' => $parent->id,
                    'order' => $childOrder++,
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
