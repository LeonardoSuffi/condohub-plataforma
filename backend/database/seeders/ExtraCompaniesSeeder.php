<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Plan;
use App\Models\Category;
use App\Models\CompanyProfile;
use App\Models\Subscription;
use App\Models\Service;
use App\Models\Review;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class ExtraCompaniesSeeder extends Seeder
{
    protected array $nomes = [
        'Alpha', 'Beta', 'Delta', 'Omega', 'Prime', 'Max', 'Plus', 'Pro', 'Tech', 'Smart',
        'Fast', 'Super', 'Mega', 'Ultra', 'Master', 'Expert', 'Total', 'Top', 'Best', 'First',
        'Gold', 'Silver', 'Platinum', 'Diamond', 'Elite', 'Premium', 'Quality', 'Trust', 'Safe', 'Sure',
        'Multi', 'Uni', 'Global', 'Brasil', 'Nacional', 'Regional', 'Local', 'Central', 'Norte', 'Sul',
        'Leste', 'Oeste', 'Metro', 'Urban', 'City', 'Capital', 'Interior', 'Litoral', 'Serra', 'Vale'
    ];

    protected array $sufixos = [
        'Servicos', 'Solucoes', 'Sistemas', 'Manutencao', 'Obras', 'Reformas', 'Reparos',
        'Assistencia', 'Suporte', 'Engenharia', 'Construcoes', 'Instalacoes', 'Projetos',
        'Empreendimentos', 'Comercio', 'Industria', 'Tecnologia', 'Inovacao', 'Brasil', 'Group'
    ];

    protected array $segmentos = [
        'Manutencao Predial', 'Eletrica', 'Hidraulica', 'Pintura', 'Limpeza',
        'Seguranca', 'Jardinagem', 'Elevadores', 'Impermeabilizacao', 'Administracao',
        'Ar Condicionado', 'Dedetizacao', 'Vidracaria', 'Serralheria', 'Marcenaria'
    ];

    protected array $cidades = [
        ['cidade' => 'Sao Paulo', 'estado' => 'SP'],
        ['cidade' => 'Rio de Janeiro', 'estado' => 'RJ'],
        ['cidade' => 'Belo Horizonte', 'estado' => 'MG'],
        ['cidade' => 'Porto Alegre', 'estado' => 'RS'],
        ['cidade' => 'Curitiba', 'estado' => 'PR'],
        ['cidade' => 'Salvador', 'estado' => 'BA'],
        ['cidade' => 'Recife', 'estado' => 'PE'],
        ['cidade' => 'Fortaleza', 'estado' => 'CE'],
        ['cidade' => 'Brasilia', 'estado' => 'DF'],
        ['cidade' => 'Campinas', 'estado' => 'SP'],
        ['cidade' => 'Santos', 'estado' => 'SP'],
        ['cidade' => 'Guarulhos', 'estado' => 'SP'],
        ['cidade' => 'Osasco', 'estado' => 'SP'],
        ['cidade' => 'Niteroi', 'estado' => 'RJ'],
        ['cidade' => 'Goiania', 'estado' => 'GO'],
    ];

    protected array $descricoes = [
        'Empresa especializada em servicos de alta qualidade para condominios e empresas.',
        'Solucoes completas com profissionais qualificados e precos competitivos.',
        'Atendimento rapido e eficiente. Orcamento sem compromisso.',
        'Mais de 10 anos de experiencia no mercado. Confianca e qualidade garantida.',
        'Equipe tecnica especializada. Servicos com garantia.',
        'Referencia no segmento. Milhares de clientes satisfeitos.',
        'Tecnologia de ponta e profissionais certificados.',
        'Compromisso com a excelencia e satisfacao do cliente.',
        'Precos justos e servicos de primeira linha.',
        'Atendemos toda a regiao metropolitana com agilidade.',
    ];

    public function run(): void
    {
        $this->command->info('Criando 50 empresas extras...');

        $plans = Plan::all();
        $categories = Category::whereNull('parent_id')->get();

        if ($plans->isEmpty()) {
            $this->command->error('Nenhum plano encontrado. Execute PlansSeeder primeiro.');
            return;
        }

        if ($categories->isEmpty()) {
            $this->command->error('Nenhuma categoria encontrada. Execute CategoriesSeeder primeiro.');
            return;
        }

        $created = 0;

        for ($i = 1; $i <= 50; $i++) {
            $nome = $this->nomes[array_rand($this->nomes)];
            $sufixo = $this->sufixos[array_rand($this->sufixos)];
            $nomeFantasia = "{$nome} {$sufixo}";
            $email = strtolower(Str::slug($nomeFantasia, '')) . $i . '@empresa.com.br';

            // Verifica se ja existe
            if (User::where('email', $email)->exists()) {
                continue;
            }

            $cidade = $this->cidades[array_rand($this->cidades)];
            $segmento = $this->segmentos[array_rand($this->segmentos)];
            $plan = $plans->random();

            // Criar usuario
            $user = User::create([
                'name' => $nomeFantasia,
                'email' => $email,
                'password' => Hash::make('senha123'),
                'type' => 'empresa',
                'active' => true,
                'email_verified_at' => now(),
            ]);

            // Criar perfil da empresa
            $company = CompanyProfile::create([
                'user_id' => $user->id,
                'cnpj' => $this->generateCnpj(),
                'razao_social' => "{$nomeFantasia} LTDA",
                'nome_fantasia' => $nomeFantasia,
                'segmento' => $segmento,
                'telefone' => $this->generatePhone(),
                'cidade' => $cidade['cidade'],
                'estado' => $cidade['estado'],
                'cep' => $this->generateCep(),
                'endereco' => 'Rua Principal, ' . rand(1, 9999),
                'descricao' => $this->descricoes[array_rand($this->descricoes)],
                'verified' => rand(0, 100) > 30, // 70% verificadas
            ]);

            // Criar assinatura
            Subscription::create([
                'user_id' => $user->id,
                'plan_id' => $plan->id,
                'status' => 'ativa',
                'starts_at' => now(),
                'ends_at' => now()->addYear(),
            ]);

            // Criar servicos (2-5 por empresa)
            $numServices = rand(2, 5);
            $usedCategories = [];

            for ($j = 0; $j < $numServices; $j++) {
                $category = $categories->random();

                // Evita categorias duplicadas
                if (in_array($category->id, $usedCategories)) {
                    continue;
                }
                $usedCategories[] = $category->id;

                Service::create([
                    'company_id' => $company->id,
                    'category_id' => $category->id,
                    'title' => $this->generateServiceTitle($segmento, $category->name),
                    'description' => 'Servico profissional de ' . strtolower($category->name) . '. Orcamento personalizado.',
                    'region' => $cidade['cidade'] . ' e regiao',
                    'price_range' => $this->generatePriceRange(),
                    'status' => 'ativo',
                    'featured' => rand(0, 100) > 80, // 20% em destaque
                ]);
            }

            // Criar avaliacoes (0-8 por empresa)
            $numReviews = rand(0, 8);
            $clientProfiles = \App\Models\ClientProfile::inRandomOrder()->limit($numReviews)->get();

            foreach ($clientProfiles as $clientProfile) {
                // Verifica se ja existe review deste cliente para esta empresa
                $exists = Review::where('company_id', $company->id)
                    ->where('client_id', $clientProfile->id)
                    ->exists();

                if (!$exists) {
                    Review::create([
                        'company_id' => $company->id,
                        'client_id' => $clientProfile->id,
                        'rating' => rand(3, 5), // Avaliacoes de 3 a 5
                        'comment' => $this->generateReviewComment(),
                        'status' => 'approved',
                        'created_at' => now()->subDays(rand(1, 180)),
                    ]);
                }
            }

            $created++;

            if ($created % 10 === 0) {
                $this->command->info("Criadas {$created} empresas...");
            }
        }

        $this->command->info("{$created} empresas criadas com sucesso!");
    }

    private function generateCnpj(): string
    {
        return sprintf(
            '%02d.%03d.%03d/%04d-%02d',
            rand(10, 99),
            rand(100, 999),
            rand(100, 999),
            rand(1, 9999),
            rand(10, 99)
        );
    }

    private function generatePhone(): string
    {
        $ddd = ['11', '21', '31', '41', '51', '61', '71', '81', '85', '19'][array_rand(['11', '21', '31', '41', '51', '61', '71', '81', '85', '19'])];
        return "({$ddd}) 9" . rand(1000, 9999) . '-' . rand(1000, 9999);
    }

    private function generateCep(): string
    {
        return sprintf('%05d-%03d', rand(10000, 99999), rand(100, 999));
    }

    private function generateServiceTitle(string $segmento, string $categoria): string
    {
        $titulos = [
            "Servico de {$categoria}",
            "{$categoria} Profissional",
            "{$categoria} Especializada",
            "Manutencao de {$categoria}",
            "Instalacao de {$categoria}",
            "{$categoria} Residencial e Comercial",
            "{$categoria} para Condominios",
            "{$categoria} Completa",
        ];
        return $titulos[array_rand($titulos)];
    }

    private function generatePriceRange(): string
    {
        $ranges = [
            'R$ 100 - R$ 500',
            'R$ 200 - R$ 800',
            'R$ 500 - R$ 1.500',
            'R$ 1.000 - R$ 3.000',
            'R$ 2.000 - R$ 5.000',
            'A partir de R$ 150',
            'A partir de R$ 300',
            'Sob consulta',
            'Orcamento personalizado',
        ];
        return $ranges[array_rand($ranges)];
    }

    private function generateReviewComment(): string
    {
        $comments = [
            'Excelente servico! Recomendo.',
            'Profissionais muito competentes.',
            'Atendimento rapido e eficiente.',
            'Preco justo e qualidade garantida.',
            'Superou minhas expectativas!',
            'Muito satisfeito com o resultado.',
            'Empresa de confianca.',
            'Otimo custo-beneficio.',
            'Trabalho impecavel!',
            'Voltarei a contratar com certeza.',
            'Atendimento nota 10!',
            'Resolveram meu problema rapidamente.',
        ];
        return $comments[array_rand($comments)];
    }
}
