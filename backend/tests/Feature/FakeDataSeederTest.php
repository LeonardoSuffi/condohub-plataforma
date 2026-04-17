<?php

namespace Tests\Feature;

use Tests\TestCase;
use Database\Seeders\FakeDataSeeder;
use App\Models\User;
use App\Models\CompanyProfile;
use App\Models\ClientProfile;
use App\Models\Service;
use App\Models\Deal;
use App\Models\Order;
use App\Models\Message;

class FakeDataSeederTest extends TestCase
{
    /** @test */
    public function seeder_creates_empresa_users()
    {
        $this->seed(FakeDataSeeder::class);

        // Verifica se empresas foram criadas
        $empresas = User::where('type', 'empresa')
            ->whereHas('companyProfile')
            ->get();

        $this->assertGreaterThanOrEqual(10, $empresas->count());
    }

    /** @test */
    public function seeder_creates_cliente_users()
    {
        $this->seed(FakeDataSeeder::class);

        // Verifica se clientes foram criados
        $clientes = User::where('type', 'cliente')
            ->whereHas('clientProfile')
            ->get();

        $this->assertGreaterThanOrEqual(8, $clientes->count());
    }

    /** @test */
    public function empresa_users_have_company_profiles()
    {
        $this->seed(FakeDataSeeder::class);

        $empresas = User::where('type', 'empresa')->get();

        foreach ($empresas as $empresa) {
            $this->assertNotNull($empresa->companyProfile);
            $this->assertNotEmpty($empresa->companyProfile->cnpj);
            $this->assertNotEmpty($empresa->companyProfile->razao_social);
            $this->assertNotEmpty($empresa->companyProfile->segmento);
        }
    }

    /** @test */
    public function cliente_users_have_client_profiles()
    {
        $this->seed(FakeDataSeeder::class);

        $clientes = User::where('type', 'cliente')->get();

        foreach ($clientes as $cliente) {
            $this->assertNotNull($cliente->clientProfile);
            $this->assertNotEmpty($cliente->clientProfile->tipo);
            $this->assertContains($cliente->clientProfile->tipo, ['sindico', 'administradora', 'condominio']);
        }
    }

    /** @test */
    public function seeder_creates_services_for_empresas()
    {
        $this->seed(FakeDataSeeder::class);

        // Verifica se serviços foram criados
        $services = Service::count();
        $this->assertGreaterThan(0, $services);

        // Verifica se os serviços têm campos obrigatórios
        $service = Service::first();
        $this->assertNotEmpty($service->title);
        $this->assertNotEmpty($service->description);
        $this->assertNotEmpty($service->region);
        $this->assertNotEmpty($service->price_range);
    }

    /** @test */
    public function seeder_creates_deals_between_clients_and_empresas()
    {
        $this->seed(FakeDataSeeder::class);

        // Verifica se deals foram criados
        $deals = Deal::count();
        $this->assertGreaterThan(0, $deals);

        // Verifica estrutura do deal
        $deal = Deal::with(['company', 'client', 'service'])->first();
        $this->assertNotNull($deal->company);
        $this->assertNotNull($deal->client);
        $this->assertNotNull($deal->service);
        $this->assertContains($deal->status, ['aberto', 'negociando', 'aceito', 'concluido', 'rejeitado']);
    }

    /** @test */
    public function seeder_creates_orders_for_accepted_deals()
    {
        $this->seed(FakeDataSeeder::class);

        // Verifica se ordens foram criadas para deals aceitos
        $acceptedDeals = Deal::whereIn('status', ['aceito', 'concluido'])->count();
        $orders = Order::count();

        $this->assertGreaterThan(0, $orders);
        $this->assertLessThanOrEqual($acceptedDeals, $orders);
    }

    /** @test */
    public function seeder_creates_messages_for_deals()
    {
        $this->seed(FakeDataSeeder::class);

        // Verifica se mensagens foram criadas
        $messages = Message::count();
        $this->assertGreaterThan(0, $messages);

        // Verifica estrutura da mensagem
        $message = Message::with('deal')->first();
        $this->assertNotNull($message->deal);
        $this->assertNotEmpty($message->content_sanitized);
    }

    /** @test */
    public function empresas_have_active_subscriptions()
    {
        $this->seed(FakeDataSeeder::class);

        $empresas = User::where('type', 'empresa')->get();
        $withSubscription = 0;

        foreach ($empresas as $empresa) {
            if ($empresa->subscriptions()->count() > 0) {
                $withSubscription++;
            }
        }

        $this->assertGreaterThan(0, $withSubscription);
    }

    /** @test */
    public function all_fake_users_have_default_password()
    {
        $this->seed(FakeDataSeeder::class);

        // Pega um usuário criado pelo seeder
        $empresa = User::where('email', 'contato@manutenpro.com.br')->first();
        $cliente = User::where('email', 'carlos.silva@email.com')->first();

        // Verifica que a senha padrão funciona
        $this->assertTrue(\Hash::check('senha123', $empresa->password));
        $this->assertTrue(\Hash::check('senha123', $cliente->password));
    }

    /** @test */
    public function services_are_linked_to_valid_categories()
    {
        $this->seed(FakeDataSeeder::class);

        $services = Service::with('category')->get();

        foreach ($services as $service) {
            $this->assertNotNull($service->category);
            $this->assertTrue($service->category->active);
        }
    }

    /** @test */
    public function deals_have_anonymous_handles()
    {
        $this->seed(FakeDataSeeder::class);

        $deals = Deal::all();

        foreach ($deals as $deal) {
            $this->assertNotEmpty($deal->anon_handle_a);
            $this->assertNotEmpty($deal->anon_handle_b);
            $this->assertStringContainsString('Fornecedor #', $deal->anon_handle_a);
            $this->assertStringContainsString('Cliente #', $deal->anon_handle_b);
        }
    }
}
