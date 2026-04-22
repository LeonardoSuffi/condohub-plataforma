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

class MoreCompaniesSeeder extends Seeder
{
    protected array $empresas = [
        // Manutencao
        [
            'name' => 'FixAll Manutencoes',
            'email' => 'contato@fixall.com.br',
            'cnpj' => '11.111.111/0001-11',
            'razao_social' => 'FixAll Manutencoes Prediais LTDA',
            'nome_fantasia' => 'FixAll',
            'segmento' => 'Manutencao Predial',
            'telefone' => '(11) 3333-1111',
            'cidade' => 'Sao Paulo',
            'estado' => 'SP',
            'descricao' => 'Solucoes completas em manutencao predial. Atendemos condominios, empresas e residencias com excelencia.',
            'plan' => 'premium',
            'verified' => true,
        ],
        [
            'name' => 'ProFix Servicos',
            'email' => 'atendimento@profix.com.br',
            'cnpj' => '11.111.222/0001-22',
            'razao_social' => 'ProFix Servicos Gerais EIRELI',
            'nome_fantasia' => 'ProFix',
            'segmento' => 'Manutencao Predial',
            'telefone' => '(11) 3333-2222',
            'cidade' => 'Guarulhos',
            'estado' => 'SP',
            'descricao' => 'Manutencao predial com foco em qualidade e agilidade. Equipe tecnica especializada.',
            'plan' => 'intermediario',
            'verified' => true,
        ],
        [
            'name' => 'TechMaint Brasil',
            'email' => 'comercial@techmaint.com.br',
            'cnpj' => '11.111.333/0001-33',
            'razao_social' => 'TechMaint Brasil Servicos LTDA',
            'nome_fantasia' => 'TechMaint',
            'segmento' => 'Manutencao Predial',
            'telefone' => '(11) 3333-3333',
            'cidade' => 'Campinas',
            'estado' => 'SP',
            'descricao' => 'Tecnologia e inovacao em manutencao predial. Sistemas inteligentes de gestao.',
            'plan' => 'premium',
            'verified' => true,
        ],

        // Eletrica
        [
            'name' => 'VoltMax Eletrica',
            'email' => 'orcamento@voltmax.com.br',
            'cnpj' => '22.222.111/0001-11',
            'razao_social' => 'VoltMax Instalacoes Eletricas LTDA',
            'nome_fantasia' => 'VoltMax',
            'segmento' => 'Eletrica',
            'telefone' => '(11) 4444-1111',
            'cidade' => 'Sao Paulo',
            'estado' => 'SP',
            'descricao' => 'Instalacoes eletricas industriais e prediais. Projetos e execucao com garantia.',
            'plan' => 'premium',
            'verified' => true,
        ],
        [
            'name' => 'PowerLine Energia',
            'email' => 'contato@powerline.com.br',
            'cnpj' => '22.222.222/0001-22',
            'razao_social' => 'PowerLine Energia e Servicos ME',
            'nome_fantasia' => 'PowerLine',
            'segmento' => 'Eletrica',
            'telefone' => '(11) 4444-2222',
            'cidade' => 'Santo Andre',
            'estado' => 'SP',
            'descricao' => 'Especialistas em energia eletrica. Automacao, geradores e paineis solares.',
            'plan' => 'intermediario',
            'verified' => true,
        ],
        [
            'name' => 'ElectroTech SP',
            'email' => 'projetos@electrotech.com.br',
            'cnpj' => '22.222.333/0001-33',
            'razao_social' => 'ElectroTech Solucoes Eletricas LTDA',
            'nome_fantasia' => 'ElectroTech',
            'segmento' => 'Eletrica',
            'telefone' => '(11) 4444-3333',
            'cidade' => 'Osasco',
            'estado' => 'SP',
            'descricao' => 'Projetos eletricos de alta complexidade. Laudos tecnicos e certificacoes.',
            'plan' => 'gratuito',
            'verified' => false,
        ],

        // Hidraulica
        [
            'name' => 'AquaFlow Hidraulica',
            'email' => 'emergencia@aquaflow.com.br',
            'cnpj' => '33.333.111/0001-11',
            'razao_social' => 'AquaFlow Servicos Hidraulicos LTDA',
            'nome_fantasia' => 'AquaFlow',
            'segmento' => 'Hidraulica',
            'telefone' => '(11) 5555-1111',
            'cidade' => 'Sao Paulo',
            'estado' => 'SP',
            'descricao' => 'Atendimento 24h para emergencias hidraulicas. Desentupimento e reparos.',
            'plan' => 'premium',
            'verified' => true,
        ],
        [
            'name' => 'HidroPro Solutions',
            'email' => 'suporte@hidropro.com.br',
            'cnpj' => '33.333.222/0001-22',
            'razao_social' => 'HidroPro Solutions Engenharia ME',
            'nome_fantasia' => 'HidroPro',
            'segmento' => 'Hidraulica',
            'telefone' => '(11) 5555-2222',
            'cidade' => 'Sao Bernardo do Campo',
            'estado' => 'SP',
            'descricao' => 'Engenharia hidraulica especializada. Projetos e manutencao de sistemas.',
            'plan' => 'intermediario',
            'verified' => true,
        ],

        // Pintura
        [
            'name' => 'ColorMax Pinturas',
            'email' => 'orcamentos@colormax.com.br',
            'cnpj' => '44.444.111/0001-11',
            'razao_social' => 'ColorMax Pinturas e Acabamentos LTDA',
            'nome_fantasia' => 'ColorMax',
            'segmento' => 'Pintura',
            'telefone' => '(11) 6666-1111',
            'cidade' => 'Sao Paulo',
            'estado' => 'SP',
            'descricao' => 'Pintura predial de alto padrao. Fachadas, interiores e texturas especiais.',
            'plan' => 'premium',
            'verified' => true,
        ],
        [
            'name' => 'MasterPaint Brasil',
            'email' => 'comercial@masterpaint.com.br',
            'cnpj' => '44.444.222/0001-22',
            'razao_social' => 'MasterPaint Brasil Servicos EIRELI',
            'nome_fantasia' => 'MasterPaint',
            'segmento' => 'Pintura',
            'telefone' => '(11) 6666-2222',
            'cidade' => 'Guarulhos',
            'estado' => 'SP',
            'descricao' => 'Pintores profissionais certificados. Garantia de 5 anos em nossos servicos.',
            'plan' => 'intermediario',
            'verified' => true,
        ],
        [
            'name' => 'ArteCor Pinturas',
            'email' => 'contato@artecor.com.br',
            'cnpj' => '44.444.333/0001-33',
            'razao_social' => 'ArteCor Pinturas Decorativas ME',
            'nome_fantasia' => 'ArteCor',
            'segmento' => 'Pintura',
            'telefone' => '(11) 6666-3333',
            'cidade' => 'Campinas',
            'estado' => 'SP',
            'descricao' => 'Pinturas decorativas e artisticas. Murais, grafites e efeitos especiais.',
            'plan' => 'gratuito',
            'verified' => false,
        ],

        // Limpeza
        [
            'name' => 'CleanPro Limpeza',
            'email' => 'servicos@cleanpro.com.br',
            'cnpj' => '55.555.111/0001-11',
            'razao_social' => 'CleanPro Servicos de Limpeza LTDA',
            'nome_fantasia' => 'CleanPro',
            'segmento' => 'Limpeza',
            'telefone' => '(11) 7777-1111',
            'cidade' => 'Sao Paulo',
            'estado' => 'SP',
            'descricao' => 'Limpeza profissional para condominios e empresas. Pos-obra e manutencao.',
            'plan' => 'premium',
            'verified' => true,
        ],
        [
            'name' => 'BrilhaMax Servicos',
            'email' => 'atendimento@brilhamax.com.br',
            'cnpj' => '55.555.222/0001-22',
            'razao_social' => 'BrilhaMax Servicos Gerais ME',
            'nome_fantasia' => 'BrilhaMax',
            'segmento' => 'Limpeza',
            'telefone' => '(11) 7777-2222',
            'cidade' => 'Santo Andre',
            'estado' => 'SP',
            'descricao' => 'Limpeza de fachadas, vidros e areas externas. Equipe com NR-35.',
            'plan' => 'intermediario',
            'verified' => true,
        ],
        [
            'name' => 'EcoClean Sustentavel',
            'email' => 'eco@ecoclean.com.br',
            'cnpj' => '55.555.333/0001-33',
            'razao_social' => 'EcoClean Solucoes Sustentaveis LTDA',
            'nome_fantasia' => 'EcoClean',
            'segmento' => 'Limpeza',
            'telefone' => '(11) 7777-3333',
            'cidade' => 'Osasco',
            'estado' => 'SP',
            'descricao' => 'Limpeza ecologica com produtos biodegradaveis. Certificacao ambiental.',
            'plan' => 'intermediario',
            'verified' => true,
        ],

        // Seguranca
        [
            'name' => 'ShieldGuard Seguranca',
            'email' => 'central@shieldguard.com.br',
            'cnpj' => '66.666.111/0001-11',
            'razao_social' => 'ShieldGuard Seguranca Patrimonial LTDA',
            'nome_fantasia' => 'ShieldGuard',
            'segmento' => 'Seguranca',
            'telefone' => '(11) 8888-1111',
            'cidade' => 'Sao Paulo',
            'estado' => 'SP',
            'descricao' => 'Seguranca patrimonial completa. Portaria, ronda e monitoramento 24h.',
            'plan' => 'premium',
            'verified' => true,
        ],
        [
            'name' => 'VigilMax Portarias',
            'email' => 'comercial@vigilmax.com.br',
            'cnpj' => '66.666.222/0001-22',
            'razao_social' => 'VigilMax Portarias e Vigilancia ME',
            'nome_fantasia' => 'VigilMax',
            'segmento' => 'Seguranca',
            'telefone' => '(11) 8888-2222',
            'cidade' => 'Guarulhos',
            'estado' => 'SP',
            'descricao' => 'Servicos de portaria e vigilancia. Profissionais treinados e uniformizados.',
            'plan' => 'intermediario',
            'verified' => true,
        ],
        [
            'name' => 'SecureTech CFTV',
            'email' => 'projetos@securetech.com.br',
            'cnpj' => '66.666.333/0001-33',
            'razao_social' => 'SecureTech Sistemas de Seguranca LTDA',
            'nome_fantasia' => 'SecureTech',
            'segmento' => 'Seguranca',
            'telefone' => '(11) 8888-3333',
            'cidade' => 'Sao Paulo',
            'estado' => 'SP',
            'descricao' => 'Sistemas de CFTV, alarmes e controle de acesso. Tecnologia de ponta.',
            'plan' => 'premium',
            'verified' => true,
        ],

        // Jardinagem
        [
            'name' => 'GreenLife Paisagismo',
            'email' => 'projetos@greenlife.com.br',
            'cnpj' => '77.777.111/0001-11',
            'razao_social' => 'GreenLife Paisagismo e Jardinagem LTDA',
            'nome_fantasia' => 'GreenLife',
            'segmento' => 'Jardinagem',
            'telefone' => '(11) 9999-1111',
            'cidade' => 'Sao Paulo',
            'estado' => 'SP',
            'descricao' => 'Projetos de paisagismo e manutencao de jardins. Design sustentavel.',
            'plan' => 'premium',
            'verified' => true,
        ],
        [
            'name' => 'NaturaPark Gardens',
            'email' => 'contato@naturapark.com.br',
            'cnpj' => '77.777.222/0001-22',
            'razao_social' => 'NaturaPark Gardens Servicos ME',
            'nome_fantasia' => 'NaturaPark',
            'segmento' => 'Jardinagem',
            'telefone' => '(11) 9999-2222',
            'cidade' => 'Campinas',
            'estado' => 'SP',
            'descricao' => 'Especialistas em jardins verticais e telhados verdes. Irrigacao automatica.',
            'plan' => 'intermediario',
            'verified' => true,
        ],

        // Elevadores
        [
            'name' => 'LiftMaster Elevadores',
            'email' => 'manutencao@liftmaster.com.br',
            'cnpj' => '88.888.111/0001-11',
            'razao_social' => 'LiftMaster Elevadores e Servicos LTDA',
            'nome_fantasia' => 'LiftMaster',
            'segmento' => 'Elevadores',
            'telefone' => '(11) 2222-1111',
            'cidade' => 'Sao Paulo',
            'estado' => 'SP',
            'descricao' => 'Manutencao de elevadores de todas as marcas. Atendimento emergencial 24h.',
            'plan' => 'premium',
            'verified' => true,
        ],
        [
            'name' => 'VerticalTech Elevadores',
            'email' => 'comercial@verticaltech.com.br',
            'cnpj' => '88.888.222/0001-22',
            'razao_social' => 'VerticalTech Modernizacao de Elevadores ME',
            'nome_fantasia' => 'VerticalTech',
            'segmento' => 'Elevadores',
            'telefone' => '(11) 2222-2222',
            'cidade' => 'Santo Andre',
            'estado' => 'SP',
            'descricao' => 'Modernizacao e retrofit de elevadores. Economia de energia garantida.',
            'plan' => 'intermediario',
            'verified' => true,
        ],

        // Impermeabilizacao
        [
            'name' => 'WaterBlock Impermeabilizacao',
            'email' => 'laudos@waterblock.com.br',
            'cnpj' => '99.999.111/0001-11',
            'razao_social' => 'WaterBlock Impermeabilizacao LTDA',
            'nome_fantasia' => 'WaterBlock',
            'segmento' => 'Impermeabilizacao',
            'telefone' => '(11) 3111-1111',
            'cidade' => 'Sao Paulo',
            'estado' => 'SP',
            'descricao' => 'Impermeabilizacao com garantia de 10 anos. Lajes, piscinas e reservatorios.',
            'plan' => 'premium',
            'verified' => true,
        ],
        [
            'name' => 'SealMax Solucoes',
            'email' => 'orcamento@sealmax.com.br',
            'cnpj' => '99.999.222/0001-22',
            'razao_social' => 'SealMax Solucoes em Impermeabilizacao ME',
            'nome_fantasia' => 'SealMax',
            'segmento' => 'Impermeabilizacao',
            'telefone' => '(11) 3111-2222',
            'cidade' => 'Guarulhos',
            'estado' => 'SP',
            'descricao' => 'Tratamento de infiltracoes e umidade. Diagnostico gratuito.',
            'plan' => 'intermediario',
            'verified' => true,
        ],

        // Administracao
        [
            'name' => 'GestaoMax Administracao',
            'email' => 'contato@gestaomax.com.br',
            'cnpj' => '10.101.111/0001-11',
            'razao_social' => 'GestaoMax Administracao de Imoveis LTDA',
            'nome_fantasia' => 'GestaoMax',
            'segmento' => 'Administracao',
            'telefone' => '(11) 3222-1111',
            'cidade' => 'Sao Paulo',
            'estado' => 'SP',
            'descricao' => 'Administracao completa para condominios. Financeiro, RH e juridico.',
            'plan' => 'premium',
            'verified' => true,
        ],
        [
            'name' => 'PrimeCond Gestao',
            'email' => 'atendimento@primecond.com.br',
            'cnpj' => '10.101.222/0001-22',
            'razao_social' => 'PrimeCond Gestao Condominial ME',
            'nome_fantasia' => 'PrimeCond',
            'segmento' => 'Administracao',
            'telefone' => '(11) 3222-2222',
            'cidade' => 'Osasco',
            'estado' => 'SP',
            'descricao' => 'Sindico profissional e gestao transparente. App exclusivo para moradores.',
            'plan' => 'intermediario',
            'verified' => true,
        ],

        // Mais empresas variadas em outras cidades
        [
            'name' => 'RioServ Manutencao',
            'email' => 'contato@rioserv.com.br',
            'cnpj' => '20.202.111/0001-11',
            'razao_social' => 'RioServ Manutencao Predial LTDA',
            'nome_fantasia' => 'RioServ',
            'segmento' => 'Manutencao Predial',
            'telefone' => '(21) 3333-1111',
            'cidade' => 'Rio de Janeiro',
            'estado' => 'RJ',
            'descricao' => 'Manutencao predial no Rio de Janeiro. Atendemos toda a regiao metropolitana.',
            'plan' => 'premium',
            'verified' => true,
        ],
        [
            'name' => 'CariocaClean',
            'email' => 'limpeza@cariocaclean.com.br',
            'cnpj' => '20.202.222/0001-22',
            'razao_social' => 'CariocaClean Servicos de Limpeza ME',
            'nome_fantasia' => 'CariocaClean',
            'segmento' => 'Limpeza',
            'telefone' => '(21) 3333-2222',
            'cidade' => 'Rio de Janeiro',
            'estado' => 'RJ',
            'descricao' => 'Limpeza profissional com equipe carioca. Pos-obra e manutencao predial.',
            'plan' => 'intermediario',
            'verified' => true,
        ],
        [
            'name' => 'MinasEletric',
            'email' => 'projetos@minaseletric.com.br',
            'cnpj' => '30.303.111/0001-11',
            'razao_social' => 'MinasEletric Instalacoes Eletricas LTDA',
            'nome_fantasia' => 'MinasEletric',
            'segmento' => 'Eletrica',
            'telefone' => '(31) 3333-1111',
            'cidade' => 'Belo Horizonte',
            'estado' => 'MG',
            'descricao' => 'Servicos eletricos em Minas Gerais. Projetos residenciais e industriais.',
            'plan' => 'intermediario',
            'verified' => true,
        ],
        [
            'name' => 'SulSecure Seguranca',
            'email' => 'central@sulsecure.com.br',
            'cnpj' => '40.404.111/0001-11',
            'razao_social' => 'SulSecure Seguranca Patrimonial LTDA',
            'nome_fantasia' => 'SulSecure',
            'segmento' => 'Seguranca',
            'telefone' => '(51) 3333-1111',
            'cidade' => 'Porto Alegre',
            'estado' => 'RS',
            'descricao' => 'Seguranca patrimonial no Sul do Brasil. Portaria e monitoramento.',
            'plan' => 'premium',
            'verified' => true,
        ],
        [
            'name' => 'CuritibaGreen Paisagismo',
            'email' => 'jardins@curitibagreen.com.br',
            'cnpj' => '50.505.111/0001-11',
            'razao_social' => 'CuritibaGreen Paisagismo e Jardinagem ME',
            'nome_fantasia' => 'CuritibaGreen',
            'segmento' => 'Jardinagem',
            'telefone' => '(41) 3333-1111',
            'cidade' => 'Curitiba',
            'estado' => 'PR',
            'descricao' => 'Paisagismo sustentavel em Curitiba. Especialistas em jardins verticais.',
            'plan' => 'intermediario',
            'verified' => true,
        ],
    ];

    protected array $servicosPorSegmento = [
        'Manutencao Predial' => [
            ['title' => 'Manutencao Preventiva Mensal', 'price' => '1500-4000'],
            ['title' => 'Reparos Emergenciais', 'price' => '200-1000'],
            ['title' => 'Manutencao de Areas Comuns', 'price' => '800-2500'],
        ],
        'Eletrica' => [
            ['title' => 'Instalacao de Quadro Eletrico', 'price' => '800-3000'],
            ['title' => 'Troca de Fiacao', 'price' => '1500-5000'],
            ['title' => 'Instalacao de Iluminacao LED', 'price' => '500-2000'],
        ],
        'Hidraulica' => [
            ['title' => 'Desentupimento Emergencial', 'price' => '150-500'],
            ['title' => 'Manutencao de Caixa D\'agua', 'price' => '300-800'],
            ['title' => 'Reparo de Vazamento', 'price' => '200-600'],
        ],
        'Pintura' => [
            ['title' => 'Pintura de Fachada Completa', 'price' => '15000-50000'],
            ['title' => 'Pintura de Apartamento', 'price' => '1500-5000'],
            ['title' => 'Pintura de Areas Comuns', 'price' => '3000-10000'],
        ],
        'Limpeza' => [
            ['title' => 'Limpeza Pos-Obra', 'price' => '500-2000'],
            ['title' => 'Limpeza de Fachada', 'price' => '3000-12000'],
            ['title' => 'Limpeza Mensal', 'price' => '1200-4000'],
        ],
        'Seguranca' => [
            ['title' => 'Portaria 24h', 'price' => '8000-15000'],
            ['title' => 'Instalacao de CFTV', 'price' => '3000-15000'],
            ['title' => 'Portaria Virtual', 'price' => '2000-5000'],
        ],
        'Jardinagem' => [
            ['title' => 'Projeto de Paisagismo', 'price' => '2000-10000'],
            ['title' => 'Manutencao de Jardim Mensal', 'price' => '500-2000'],
            ['title' => 'Poda e Corte de Arvores', 'price' => '300-1500'],
        ],
        'Elevadores' => [
            ['title' => 'Manutencao Preventiva Mensal', 'price' => '800-2000'],
            ['title' => 'Modernizacao de Cabine', 'price' => '15000-40000'],
            ['title' => 'Atendimento Emergencial 24h', 'price' => '500-1500'],
        ],
        'Impermeabilizacao' => [
            ['title' => 'Impermeabilizacao de Laje', 'price' => '5000-20000'],
            ['title' => 'Tratamento de Infiltracao', 'price' => '1000-5000'],
            ['title' => 'Impermeabilizacao de Piscina', 'price' => '3000-12000'],
        ],
        'Administracao' => [
            ['title' => 'Administracao Condominial Completa', 'price' => '1500-5000'],
            ['title' => 'Sindico Profissional', 'price' => '2000-6000'],
            ['title' => 'Assessoria Juridica', 'price' => '800-2500'],
        ],
    ];

    public function run(): void
    {
        $this->command->info('Criando empresas adicionais...');
        $empresasCreated = $this->createEmpresas();

        $this->command->info('Criando servicos para as empresas...');
        $this->createServicos($empresasCreated);

        $this->command->info('Criando avaliacoes para as empresas...');
        $this->createReviews($empresasCreated);

        $this->command->info(count($empresasCreated) . ' empresas criadas com sucesso!');
    }

    protected function createEmpresas(): array
    {
        $created = [];

        foreach ($this->empresas as $empresa) {
            // Verifica se ja existe
            if (User::where('email', $empresa['email'])->exists()) {
                $this->command->warn("Empresa {$empresa['nome_fantasia']} ja existe, pulando...");
                continue;
            }

            $user = User::create([
                'name' => $empresa['name'],
                'email' => $empresa['email'],
                'password' => Hash::make('senha123'),
                'type' => 'empresa',
                'email_verified_at' => now(),
            ]);

            $profile = CompanyProfile::create([
                'user_id' => $user->id,
                'cnpj' => $empresa['cnpj'],
                'razao_social' => $empresa['razao_social'],
                'nome_fantasia' => $empresa['nome_fantasia'],
                'segmento' => $empresa['segmento'],
                'telefone' => $empresa['telefone'],
                'cidade' => $empresa['cidade'],
                'estado' => $empresa['estado'],
                'descricao' => $empresa['descricao'],
                'verified' => $empresa['verified'] ?? false,
            ]);

            // Criar assinatura
            $plan = Plan::where('slug', $empresa['plan'])->first();
            if ($plan) {
                Subscription::create([
                    'user_id' => $user->id,
                    'plan_id' => $plan->id,
                    'status' => 'ativa',
                    'starts_at' => now()->subDays(rand(1, 60)),
                    'ends_at' => now()->addDays(rand(30, 365)),
                ]);
            }

            $created[] = [
                'user' => $user,
                'profile' => $profile,
                'segmento' => $empresa['segmento'],
            ];
        }

        return $created;
    }

    protected function createServicos(array $empresas): void
    {
        $categories = Category::whereNotNull('parent_id')->get();

        foreach ($empresas as $empresa) {
            $segmento = $empresa['segmento'];
            $profile = $empresa['profile'];

            $servicos = $this->servicosPorSegmento[$segmento] ?? [];

            // Pega categoria relacionada
            $category = $categories->first(function ($cat) use ($segmento) {
                return str_contains(strtolower($cat->name), strtolower(explode(' ', $segmento)[0]));
            });

            if (!$category) {
                $category = $categories->random();
            }

            foreach ($servicos as $servico) {
                Service::create([
                    'company_id' => $profile->id,
                    'category_id' => $category->id,
                    'title' => $servico['title'],
                    'description' => 'Servico profissional de ' . strtolower($servico['title']) . '. Entre em contato para orcamento personalizado.',
                    'region' => $profile->cidade . ', ' . $profile->estado,
                    'price_range' => $servico['price'],
                    'status' => 'ativo',
                    'views_count' => rand(50, 1000),
                    'featured' => rand(0, 1),
                ]);
            }
        }
    }

    protected function createReviews(array $empresas): void
    {
        $comentarios = [
            5 => [
                'Excelente servico! Recomendo muito.',
                'Profissionais muito competentes e pontuais.',
                'Superou todas as expectativas. Trabalho impecavel!',
                'Melhor empresa que ja contratei. Nota 10!',
                'Atendimento excepcional do inicio ao fim.',
            ],
            4 => [
                'Muito bom, apenas pequenos detalhes a melhorar.',
                'Bom servico, entregaram no prazo.',
                'Profissionais educados e trabalho bem feito.',
                'Recomendo, cumpriram o combinado.',
            ],
            3 => [
                'Servico ok, nada excepcional.',
                'Atendeu as expectativas basicas.',
                'Razoavel, poderia ser melhor em alguns pontos.',
            ],
        ];

        // Busca clientes existentes
        $clientes = \App\Models\ClientProfile::all();

        if ($clientes->isEmpty()) {
            $this->command->warn('Nenhum cliente encontrado para criar avaliacoes.');
            return;
        }

        foreach ($empresas as $empresa) {
            $numReviews = rand(2, 8);

            for ($i = 0; $i < $numReviews; $i++) {
                $rating = $this->getWeightedRating();
                $comentariosRating = $comentarios[$rating] ?? $comentarios[4];

                Review::create([
                    'company_id' => $empresa['profile']->id,
                    'client_id' => $clientes->random()->id,
                    'rating' => $rating,
                    'comment' => $comentariosRating[array_rand($comentariosRating)],
                    'status' => 'approved',
                    'is_verified' => rand(0, 1),
                    'created_at' => now()->subDays(rand(1, 180)),
                ]);
            }
        }
    }

    protected function getWeightedRating(): int
    {
        $weights = [5 => 50, 4 => 35, 3 => 15];
        $rand = rand(1, 100);
        $cumulative = 0;

        foreach ($weights as $rating => $weight) {
            $cumulative += $weight;
            if ($rand <= $cumulative) {
                return $rating;
            }
        }

        return 5;
    }
}
