<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Plan;
use App\Models\Category;
use App\Models\CompanyProfile;
use App\Models\ClientProfile;
use App\Models\Subscription;
use App\Models\Service;
use App\Models\Deal;
use App\Models\Order;
use App\Models\Message;
use App\Models\Banner;
use App\Models\Transaction;
use App\Models\Notification;
use Illuminate\Support\Facades\Hash;

class FakeDataSeeder extends Seeder
{
    /**
     * Empresas fornecedoras fake com dados realistas
     */
    protected array $empresas = [
        [
            'name' => 'ManutenPro Serviços',
            'email' => 'contato@manutenpro.com.br',
            'cnpj' => '12.345.678/0001-01',
            'razao_social' => 'ManutenPro Serviços Prediais LTDA',
            'nome_fantasia' => 'ManutenPro',
            'segmento' => 'Manutenção Predial',
            'telefone' => '(11) 3456-7890',
            'cidade' => 'São Paulo',
            'estado' => 'SP',
            'descricao' => 'Especialistas em manutenção predial com mais de 15 anos de experiência.',
            'plan' => 'premium',
        ],
        [
            'name' => 'EletriCond',
            'email' => 'orcamento@eletricond.com.br',
            'cnpj' => '23.456.789/0001-02',
            'razao_social' => 'EletriCond Instalações Elétricas LTDA',
            'nome_fantasia' => 'EletriCond',
            'segmento' => 'Elétrica',
            'telefone' => '(11) 4567-8901',
            'cidade' => 'São Paulo',
            'estado' => 'SP',
            'descricao' => 'Serviços elétricos para condomínios: instalação, manutenção e projetos.',
            'plan' => 'intermediario',
        ],
        [
            'name' => 'HidroFix Solutions',
            'email' => 'contato@hidrofix.com.br',
            'cnpj' => '34.567.890/0001-03',
            'razao_social' => 'HidroFix Solutions Hidráulica ME',
            'nome_fantasia' => 'HidroFix',
            'segmento' => 'Hidráulica',
            'telefone' => '(11) 5678-9012',
            'cidade' => 'Guarulhos',
            'estado' => 'SP',
            'descricao' => 'Soluções completas em hidráulica predial, bombas e cisternas.',
            'plan' => 'intermediario',
        ],
        [
            'name' => 'PinturaCond Master',
            'email' => 'comercial@pinturacond.com.br',
            'cnpj' => '45.678.901/0001-04',
            'razao_social' => 'PinturaCond Master Pinturas EIRELI',
            'nome_fantasia' => 'PinturaCond',
            'segmento' => 'Pintura',
            'telefone' => '(11) 6789-0123',
            'cidade' => 'São Bernardo do Campo',
            'estado' => 'SP',
            'descricao' => 'Pintura predial interna e externa, textura e acabamentos especiais.',
            'plan' => 'gratuito',
        ],
        [
            'name' => 'LimpaFácil Serviços',
            'email' => 'atendimento@limpafacil.com.br',
            'cnpj' => '56.789.012/0001-05',
            'razao_social' => 'LimpaFácil Serviços de Limpeza LTDA',
            'nome_fantasia' => 'LimpaFácil',
            'segmento' => 'Limpeza',
            'telefone' => '(11) 7890-1234',
            'cidade' => 'Santo André',
            'estado' => 'SP',
            'descricao' => 'Limpeza profissional para condomínios, pós-obra e fachadas.',
            'plan' => 'premium',
        ],
        [
            'name' => 'SegurMax Portaria',
            'email' => 'comercial@segurmax.com.br',
            'cnpj' => '67.890.123/0001-06',
            'razao_social' => 'SegurMax Serviços de Portaria LTDA',
            'nome_fantasia' => 'SegurMax',
            'segmento' => 'Segurança',
            'telefone' => '(11) 8901-2345',
            'cidade' => 'Osasco',
            'estado' => 'SP',
            'descricao' => 'Portaria 24h, CFTV e controle de acesso para condomínios.',
            'plan' => 'premium',
        ],
        [
            'name' => 'JardimVerde Paisagismo',
            'email' => 'contato@jardimverde.com.br',
            'cnpj' => '78.901.234/0001-07',
            'razao_social' => 'JardimVerde Paisagismo e Jardinagem ME',
            'nome_fantasia' => 'JardimVerde',
            'segmento' => 'Jardinagem',
            'telefone' => '(11) 9012-3456',
            'cidade' => 'Campinas',
            'estado' => 'SP',
            'descricao' => 'Paisagismo, manutenção de jardins e áreas verdes condominiais.',
            'plan' => 'intermediario',
        ],
        [
            'name' => 'ElevaTec Brasil',
            'email' => 'suporte@elevatec.com.br',
            'cnpj' => '89.012.345/0001-08',
            'razao_social' => 'ElevaTec Brasil Elevadores LTDA',
            'nome_fantasia' => 'ElevaTec',
            'segmento' => 'Elevadores',
            'telefone' => '(11) 2345-6789',
            'cidade' => 'São Paulo',
            'estado' => 'SP',
            'descricao' => 'Manutenção preventiva e corretiva de elevadores de todas as marcas.',
            'plan' => 'premium',
        ],
        [
            'name' => 'ImperSeal Impermeabilização',
            'email' => 'orcamento@imperseal.com.br',
            'cnpj' => '90.123.456/0001-09',
            'razao_social' => 'ImperSeal Impermeabilização e Reformas LTDA',
            'nome_fantasia' => 'ImperSeal',
            'segmento' => 'Impermeabilização',
            'telefone' => '(11) 3456-7891',
            'cidade' => 'São Paulo',
            'estado' => 'SP',
            'descricao' => 'Impermeabilização de lajes, terraços, piscinas e reservatórios.',
            'plan' => 'intermediario',
        ],
        [
            'name' => 'AdminCond Gestão',
            'email' => 'contato@admincond.com.br',
            'cnpj' => '01.234.567/0001-10',
            'razao_social' => 'AdminCond Gestão Condominial LTDA',
            'nome_fantasia' => 'AdminCond',
            'segmento' => 'Administração',
            'telefone' => '(11) 4567-8902',
            'cidade' => 'São Paulo',
            'estado' => 'SP',
            'descricao' => 'Administração profissional de condomínios residenciais e comerciais.',
            'plan' => 'premium',
        ],
    ];

    /**
     * Clientes (síndicos e administradoras) fake
     */
    protected array $clientes = [
        [
            'name' => 'Carlos Roberto Silva',
            'email' => 'carlos.silva@email.com',
            'cpf' => '111.222.333-44',
            'tipo' => 'sindico',
            'telefone' => '(11) 99111-2233',
            'nome_condominio' => 'Residencial Parque das Flores',
            'cidade' => 'São Paulo',
            'estado' => 'SP',
            'num_unidades' => 120,
        ],
        [
            'name' => 'Maria Fernanda Oliveira',
            'email' => 'maria.oliveira@email.com',
            'cpf' => '222.333.444-55',
            'tipo' => 'sindico',
            'telefone' => '(11) 99222-3344',
            'nome_condominio' => 'Edifício Solar das Palmeiras',
            'cidade' => 'São Paulo',
            'estado' => 'SP',
            'num_unidades' => 80,
        ],
        [
            'name' => 'João Pedro Santos',
            'email' => 'joao.santos@email.com',
            'cpf' => '333.444.555-66',
            'tipo' => 'sindico',
            'telefone' => '(11) 99333-4455',
            'nome_condominio' => 'Condomínio Vila Verde',
            'cidade' => 'Guarulhos',
            'estado' => 'SP',
            'num_unidades' => 200,
        ],
        [
            'name' => 'Ana Paula Rodrigues',
            'email' => 'ana.rodrigues@email.com',
            'cpf' => '444.555.666-77',
            'tipo' => 'sindico',
            'telefone' => '(11) 99444-5566',
            'nome_condominio' => 'Torres do Horizonte',
            'cidade' => 'Santo André',
            'estado' => 'SP',
            'num_unidades' => 300,
        ],
        [
            'name' => 'Administradora Condovida',
            'email' => 'contato@condovida.com.br',
            'cnpj' => '11.222.333/0001-44',
            'tipo' => 'administradora',
            'telefone' => '(11) 3333-4444',
            'nome_condominio' => 'Administradora Condovida',
            'cidade' => 'São Paulo',
            'estado' => 'SP',
            'num_unidades' => 50,
        ],
        [
            'name' => 'Roberto Mendes Costa',
            'email' => 'roberto.costa@email.com',
            'cpf' => '555.666.777-88',
            'tipo' => 'sindico',
            'telefone' => '(11) 99555-6677',
            'nome_condominio' => 'Residencial Bosque Imperial',
            'cidade' => 'Osasco',
            'estado' => 'SP',
            'num_unidades' => 150,
        ],
        [
            'name' => 'Patricia Lima Souza',
            'email' => 'patricia.souza@email.com',
            'cpf' => '666.777.888-99',
            'tipo' => 'sindico',
            'telefone' => '(11) 99666-7788',
            'nome_condominio' => 'Edifício Jardim Europa',
            'cidade' => 'São Bernardo do Campo',
            'estado' => 'SP',
            'num_unidades' => 64,
        ],
        [
            'name' => 'Administradora PrimeGestão',
            'email' => 'atendimento@primegestao.com.br',
            'cnpj' => '22.333.444/0001-55',
            'tipo' => 'administradora',
            'telefone' => '(11) 4444-5555',
            'nome_condominio' => 'PrimeGestão Administradora',
            'cidade' => 'São Paulo',
            'estado' => 'SP',
            'num_unidades' => 100,
        ],
    ];

    /**
     * Banners promocionais e informativos
     */
    protected array $banners = [
        [
            'title' => 'Bem-vindo ao CondoHub!',
            'description' => 'A plataforma completa para conectar condomínios aos melhores fornecedores.',
            'position' => 'topo',
            'type' => 'admin',
            'link' => '/services',
        ],
        [
            'title' => 'Plano Premium - 30% OFF',
            'description' => 'Destaque seus serviços e aumente suas vendas! Promoção válida até o fim do mês.',
            'position' => 'topo',
            'type' => 'promocional',
            'link' => '/plans',
        ],
        [
            'title' => 'ManutenPro - Manutenção Predial',
            'description' => 'Especialistas em manutenção com 15 anos de experiência. Solicite orçamento!',
            'position' => 'lateral',
            'type' => 'comercial',
            'link' => '/services',
        ],
        [
            'title' => 'SegurMax - Portaria 24h',
            'description' => 'Segurança profissional para seu condomínio. Portaria e CFTV.',
            'position' => 'lateral',
            'type' => 'comercial',
            'link' => '/services',
        ],
        [
            'title' => 'Novidade: Chat em Tempo Real',
            'description' => 'Negocie diretamente com fornecedores pelo chat da plataforma.',
            'position' => 'modal',
            'type' => 'admin',
            'link' => '/deals',
        ],
        [
            'title' => 'ElevaTec - Elevadores',
            'description' => 'Manutenção de elevadores de todas as marcas. Contrato mensal a partir de R$ 800.',
            'position' => 'topo',
            'type' => 'comercial',
            'link' => '/services',
        ],
    ];

    /**
     * Serviços por categoria
     */
    protected array $servicosPorCategoria = [
        'Elétrica' => [
            ['title' => 'Manutenção Elétrica Preventiva', 'price' => '500-1500', 'desc' => 'Inspeção e manutenção preventiva de quadros elétricos, iluminação e tomadas.'],
            ['title' => 'Instalação de Gerador', 'price' => '5000-15000', 'desc' => 'Instalação completa de gerador de energia com quadro de transferência.'],
            ['title' => 'Modernização de Iluminação LED', 'price' => '2000-8000', 'desc' => 'Substituição de lâmpadas convencionais por LED em áreas comuns.'],
        ],
        'Hidráulica' => [
            ['title' => 'Desentupimento Profissional', 'price' => '200-800', 'desc' => 'Desentupimento de ralos, pias e tubulações com equipamento especializado.'],
            ['title' => 'Manutenção de Bombas', 'price' => '300-1200', 'desc' => 'Manutenção preventiva e corretiva de bombas d\'água e recalque.'],
            ['title' => 'Reparo de Vazamentos', 'price' => '150-600', 'desc' => 'Localização e reparo de vazamentos em tubulações e registros.'],
        ],
        'Pintura' => [
            ['title' => 'Pintura de Fachada', 'price' => '15000-50000', 'desc' => 'Pintura completa de fachada com tratamento de fissuras.'],
            ['title' => 'Pintura de Garagem', 'price' => '3000-10000', 'desc' => 'Pintura de piso e paredes de garagem com demarcação de vagas.'],
            ['title' => 'Pintura de Áreas Comuns', 'price' => '2000-8000', 'desc' => 'Pintura de halls, corredores e salões de festa.'],
        ],
        'Limpeza de Fachada' => [
            ['title' => 'Limpeza de Fachada com Hidrojato', 'price' => '3000-12000', 'desc' => 'Limpeza profissional de fachada com hidrojateamento.'],
            ['title' => 'Limpeza de Vidros em Altura', 'price' => '1500-5000', 'desc' => 'Limpeza de vidros externos com técnicos especializados.'],
        ],
        'Limpeza de Caixa D\'água' => [
            ['title' => 'Limpeza e Desinfecção de Reservatório', 'price' => '400-1500', 'desc' => 'Limpeza completa com desinfecção e laudo técnico.'],
        ],
        'Portaria' => [
            ['title' => 'Serviço de Portaria 24h', 'price' => '8000-15000', 'desc' => 'Portaria terceirizada 24 horas com profissionais treinados.'],
            ['title' => 'Portaria Virtual', 'price' => '3000-6000', 'desc' => 'Sistema de portaria remota com atendimento 24h.'],
        ],
        'CFTV' => [
            ['title' => 'Instalação de Sistema CFTV', 'price' => '5000-20000', 'desc' => 'Instalação completa de câmeras com gravador e monitoramento.'],
            ['title' => 'Manutenção de Câmeras', 'price' => '500-2000', 'desc' => 'Manutenção preventiva e corretiva de sistema de CFTV.'],
        ],
        'Manutenção de Elevadores' => [
            ['title' => 'Contrato de Manutenção Mensal', 'price' => '800-2500', 'desc' => 'Manutenção preventiva mensal com visitas programadas.'],
            ['title' => 'Modernização de Cabine', 'price' => '15000-40000', 'desc' => 'Modernização estética e funcional de cabines de elevador.'],
        ],
        'Paisagismo' => [
            ['title' => 'Projeto de Paisagismo', 'price' => '2000-8000', 'desc' => 'Projeto completo de paisagismo para áreas comuns.'],
            ['title' => 'Manutenção de Jardim Mensal', 'price' => '800-2500', 'desc' => 'Manutenção mensal de jardins, poda e adubação.'],
        ],
        'Impermeabilização' => [
            ['title' => 'Impermeabilização de Laje', 'price' => '5000-20000', 'desc' => 'Impermeabilização de laje de cobertura com garantia.'],
            ['title' => 'Impermeabilização de Piscina', 'price' => '3000-12000', 'desc' => 'Tratamento e impermeabilização de piscinas.'],
        ],
        'Gestão Condominial' => [
            ['title' => 'Administração Completa', 'price' => '1500-4000', 'desc' => 'Gestão administrativa, financeira e de pessoal do condomínio.'],
            ['title' => 'Assessoria para Assembleias', 'price' => '500-1500', 'desc' => 'Organização e condução de assembleias condominiais.'],
        ],
    ];

    public function run(): void
    {
        $this->command->info('Criando empresas fornecedoras...');
        $empresasCreated = $this->createEmpresas();

        $this->command->info('Criando clientes (síndicos e administradoras)...');
        $clientesCreated = $this->createClientes();

        $this->command->info('Criando serviços para as empresas...');
        $this->createServicos($empresasCreated);

        $this->command->info('Criando negociações e ordens de exemplo...');
        $this->createDealsAndOrders($empresasCreated, $clientesCreated);

        $this->command->info('Criando banners promocionais...');
        $this->createBanners();

        $this->command->info('Criando notificações de exemplo...');
        $this->createNotifications($empresasCreated, $clientesCreated);

        $this->command->info('Dados fake criados com sucesso!');
    }

    /**
     * Cria as empresas fornecedoras
     */
    protected function createEmpresas(): array
    {
        $created = [];

        foreach ($this->empresas as $empresa) {
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
                'cidade' => $empresa['cidade'] ?? 'São Paulo',
                'estado' => $empresa['estado'] ?? 'SP',
                'descricao' => $empresa['descricao'],
                'verified' => true,
            ]);

            // Criar assinatura
            $plan = Plan::where('slug', $empresa['plan'])->first();
            if ($plan) {
                Subscription::create([
                    'user_id' => $user->id,
                    'plan_id' => $plan->id,
                    'status' => 'ativa',
                    'starts_at' => now()->subDays(rand(1, 30)),
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

    /**
     * Cria os clientes
     */
    protected function createClientes(): array
    {
        $created = [];

        foreach ($this->clientes as $cliente) {
            $user = User::create([
                'name' => $cliente['name'],
                'email' => $cliente['email'],
                'password' => Hash::make('senha123'),
                'type' => 'cliente',
                'email_verified_at' => now(),
            ]);

            $profileData = [
                'user_id' => $user->id,
                'tipo' => $cliente['tipo'],
                'telefone' => $cliente['telefone'],
                'nome_condominio' => $cliente['nome_condominio'],
                'cidade' => $cliente['cidade'] ?? 'São Paulo',
                'estado' => $cliente['estado'] ?? 'SP',
                'num_unidades' => $cliente['num_unidades'] ?? null,
            ];

            if (isset($cliente['cpf'])) {
                $profileData['cpf'] = $cliente['cpf'];
            }
            if (isset($cliente['cnpj'])) {
                $profileData['cnpj'] = $cliente['cnpj'];
            }

            $profile = ClientProfile::create($profileData);

            $created[] = [
                'user' => $user,
                'profile' => $profile,
            ];
        }

        return $created;
    }

    /**
     * Cria serviços para as empresas baseado no segmento
     */
    protected function createServicos(array $empresas): void
    {
        $categories = Category::whereNotNull('parent_id')->get()->keyBy('name');

        foreach ($empresas as $empresa) {
            $segmento = $empresa['segmento'];
            $profile = $empresa['profile'];

            // Encontra serviços relacionados ao segmento
            foreach ($this->servicosPorCategoria as $catName => $servicos) {
                // Verifica se a categoria está relacionada ao segmento da empresa
                if ($this->isRelatedToSegmento($catName, $segmento)) {
                    $category = $categories->get($catName);
                    if (!$category) continue;

                    foreach ($servicos as $servico) {
                        Service::create([
                            'company_id' => $profile->id,
                            'category_id' => $category->id,
                            'title' => $servico['title'],
                            'description' => $servico['desc'],
                            'region' => $profile->cidade . ', ' . $profile->estado,
                            'price_range' => $servico['price'],
                            'status' => 'ativo',
                            'views_count' => rand(10, 500),
                            'featured' => $empresa['user']->activeSubscription?->plan?->featured_enabled ?? false,
                        ]);
                    }
                }
            }
        }
    }

    /**
     * Verifica se a categoria está relacionada ao segmento
     */
    protected function isRelatedToSegmento(string $categoria, string $segmento): bool
    {
        $relacoes = [
            'Manutenção Predial' => ['Elétrica', 'Hidráulica', 'Pintura', 'Impermeabilização'],
            'Elétrica' => ['Elétrica'],
            'Hidráulica' => ['Hidráulica'],
            'Pintura' => ['Pintura'],
            'Limpeza' => ['Limpeza de Fachada', 'Limpeza de Caixa D\'água'],
            'Segurança' => ['Portaria', 'CFTV'],
            'Jardinagem' => ['Paisagismo', 'Manutenção de Jardim'],
            'Elevadores' => ['Manutenção de Elevadores'],
            'Impermeabilização' => ['Impermeabilização'],
            'Administração' => ['Gestão Condominial'],
        ];

        $categoriasRelacionadas = $relacoes[$segmento] ?? [];
        return in_array($categoria, $categoriasRelacionadas);
    }

    /**
     * Cria deals e orders de exemplo
     */
    protected function createDealsAndOrders(array $empresas, array $clientes): void
    {
        $services = Service::with('company')->get();
        $statuses = ['negociando', 'aceito', 'concluido', 'rejeitado'];

        // Cria alguns deals aleatórios
        for ($i = 0; $i < 15; $i++) {
            $service = $services->random();
            $cliente = $clientes[array_rand($clientes)];

            $status = $statuses[array_rand($statuses)];

            $deal = Deal::create([
                'company_id' => $service->company_id,
                'client_id' => $cliente['profile']->id,
                'service_id' => $service->id,
                'status' => $status,
                'anon_handle_a' => 'Fornecedor #' . rand(100, 999),
                'anon_handle_b' => 'Cliente #' . rand(100, 999),
                'accepted_at' => in_array($status, ['aceito', 'concluido']) ? now()->subDays(rand(1, 10)) : null,
                'completed_at' => $status === 'concluido' ? now()->subDays(rand(1, 5)) : null,
            ]);

            // Cria mensagens para o deal
            $this->createMessages($deal, $service->company->user, $cliente['user']);

            // Se aceito ou concluído, cria uma ordem
            if (in_array($status, ['aceito', 'concluido'])) {
                $orderStatus = $status === 'concluido' ? 'concluido' : ['pendente', 'aprovado'][rand(0, 1)];
                $value = rand(500, 15000);

                Order::create([
                    'deal_id' => $deal->id,
                    'value' => $value,
                    'status' => $orderStatus,
                    'approved_by' => $orderStatus !== 'pendente' ? User::where('type', 'admin')->first()?->id : null,
                    'approved_at' => $orderStatus !== 'pendente' ? now()->subDays(rand(1, 5)) : null,
                    'completed_at' => $orderStatus === 'concluido' ? now()->subDays(rand(1, 3)) : null,
                ]);
            }
        }
    }

    /**
     * Cria mensagens exemplo para um deal
     */
    protected function createMessages(Deal $deal, User $empresa, User $cliente): void
    {
        $mensagensExemplo = [
            ['sender' => 'cliente', 'msg' => 'Olá, gostaria de um orçamento para o serviço.'],
            ['sender' => 'empresa', 'msg' => 'Olá! Claro, podemos agendar uma visita técnica para avaliação?'],
            ['sender' => 'cliente', 'msg' => 'Pode ser na próxima semana, qual dia vocês podem?'],
            ['sender' => 'empresa', 'msg' => 'Terça ou quinta estão disponíveis. Qual prefere?'],
            ['sender' => 'cliente', 'msg' => 'Terça-feira está ótimo. Obrigado!'],
        ];

        $numMsgs = rand(2, count($mensagensExemplo));

        for ($i = 0; $i < $numMsgs; $i++) {
            $msg = $mensagensExemplo[$i];
            Message::create([
                'deal_id' => $deal->id,
                'sender_id' => $msg['sender'] === 'cliente' ? $cliente->id : $empresa->id,
                'content_sanitized' => $msg['msg'],
                'content_original' => $msg['msg'],
                'created_at' => now()->subHours(rand(1, 72)),
            ]);
        }
    }

    /**
     * Cria banners promocionais e informativos
     */
    protected function createBanners(): void
    {
        $order = 1;
        foreach ($this->banners as $banner) {
            Banner::create([
                'title' => $banner['title'],
                'description' => $banner['description'],
                'image_path' => 'banners/placeholder-' . $order . '.jpg', // Placeholder
                'link' => $banner['link'],
                'position' => $banner['position'],
                'type' => $banner['type'],
                'active' => true,
                'order' => $order,
                'starts_at' => now()->subDays(rand(1, 30)),
                'ends_at' => now()->addDays(rand(30, 90)),
                'views' => rand(100, 5000),
                'clicks' => rand(10, 500),
            ]);
            $order++;
        }
    }

    /**
     * Cria notificações de exemplo para usuários
     */
    protected function createNotifications(array $empresas, array $clientes): void
    {
        $notificacoesCliente = [
            ['type' => 'deal', 'title' => 'Nova proposta recebida', 'msg' => 'A empresa ManutenPro enviou uma proposta para seu pedido.'],
            ['type' => 'system', 'title' => 'Bem-vindo ao CondoHub!', 'msg' => 'Explore nossos serviços e encontre o fornecedor ideal.'],
            ['type' => 'deal', 'title' => 'Negociação aceita', 'msg' => 'Sua negociação foi aceita! Verifique os detalhes.'],
            ['type' => 'order', 'title' => 'Ordem em andamento', 'msg' => 'O serviço foi iniciado. Acompanhe o progresso.'],
        ];

        $notificacoesEmpresa = [
            ['type' => 'deal', 'title' => 'Nova solicitação de orçamento', 'msg' => 'Um cliente solicitou orçamento para seus serviços.'],
            ['type' => 'system', 'title' => 'Seu plano foi renovado', 'msg' => 'Sua assinatura Premium foi renovada com sucesso.'],
            ['type' => 'ranking', 'title' => 'Você subiu no ranking!', 'msg' => 'Parabéns! Você está entre os top 10 do seu segmento.'],
            ['type' => 'order', 'title' => 'Ordem concluída', 'msg' => 'A ordem #123 foi marcada como concluída.'],
            ['type' => 'system', 'title' => 'Novo serviço aprovado', 'msg' => 'Seu serviço foi aprovado e está visível para clientes.'],
        ];

        // Notificações para clientes
        foreach ($clientes as $cliente) {
            $numNotifs = rand(1, 3);
            for ($i = 0; $i < $numNotifs; $i++) {
                $notif = $notificacoesCliente[array_rand($notificacoesCliente)];
                Notification::create([
                    'user_id' => $cliente['user']->id,
                    'type' => $notif['type'],
                    'title' => $notif['title'],
                    'message' => $notif['msg'],
                    'read_at' => rand(0, 1) ? now()->subHours(rand(1, 48)) : null,
                    'created_at' => now()->subHours(rand(1, 168)),
                ]);
            }
        }

        // Notificações para empresas
        foreach ($empresas as $empresa) {
            $numNotifs = rand(2, 4);
            for ($i = 0; $i < $numNotifs; $i++) {
                $notif = $notificacoesEmpresa[array_rand($notificacoesEmpresa)];
                Notification::create([
                    'user_id' => $empresa['user']->id,
                    'type' => $notif['type'],
                    'title' => $notif['title'],
                    'message' => $notif['msg'],
                    'read_at' => rand(0, 1) ? now()->subHours(rand(1, 48)) : null,
                    'created_at' => now()->subHours(rand(1, 168)),
                ]);
            }
        }
    }
}
