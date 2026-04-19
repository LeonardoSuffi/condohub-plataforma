<?php

namespace Tests\Unit\Services;

use App\Services\DealService;
use App\Models\Deal;
use App\Models\Order;
use App\Models\Service;
use App\Models\Message;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class DealServiceTest extends TestCase
{
    use RefreshDatabase;

    protected DealService $dealService;

    protected function setUp(): void
    {
        parent::setUp();
        $this->dealService = new DealService();
    }

    // ========================================
    // createDeal() Tests
    // ========================================

    /** @test */
    public function create_deal_sets_status_aberto()
    {
        $empresa = $this->createEmpresa();
        $cliente = $this->createCliente();
        $category = $this->getCategory();

        $service = Service::create([
            'company_id' => $empresa->companyProfile->id,
            'category_id' => $category->id,
            'title' => 'Test Service',
            'description' => 'Test',
            'price_range' => 'R$ 100-500',
            'status' => 'ativo',
        ]);

        $deal = $this->dealService->createDeal($cliente->clientProfile, $service);

        $this->assertEquals('aberto', $deal->status);
        $this->assertEquals($service->id, $deal->service_id);
        $this->assertEquals($cliente->clientProfile->id, $deal->client_id);
        $this->assertEquals($empresa->companyProfile->id, $deal->company_id);
    }

    /** @test */
    public function create_deal_with_message_sets_negociando()
    {
        $empresa = $this->createEmpresa();
        $cliente = $this->createCliente();
        $category = $this->getCategory();

        $service = Service::create([
            'company_id' => $empresa->companyProfile->id,
            'category_id' => $category->id,
            'title' => 'Test Service',
            'description' => 'Test',
            'price_range' => 'R$ 100-500',
            'status' => 'ativo',
        ]);

        $mensagem = 'Olá, gostaria de mais informações';
        $deal = $this->dealService->createDeal($cliente->clientProfile, $service, $mensagem);

        $this->assertEquals('negociando', $deal->status);
        $this->assertEquals($mensagem, $deal->mensagem_inicial);
    }

    /** @test */
    public function create_deal_creates_initial_message()
    {
        $empresa = $this->createEmpresa();
        $cliente = $this->createCliente();
        $category = $this->getCategory();

        $service = Service::create([
            'company_id' => $empresa->companyProfile->id,
            'category_id' => $category->id,
            'title' => 'Test Service',
            'description' => 'Test',
            'price_range' => 'R$ 100-500',
            'status' => 'ativo',
        ]);

        $mensagem = 'Primeira mensagem';
        $deal = $this->dealService->createDeal($cliente->clientProfile, $service, $mensagem);

        $this->assertEquals(1, $deal->messages()->count());
        $this->assertEquals($mensagem, $deal->messages()->first()->content_original);
    }

    /** @test */
    public function create_deal_without_message_has_no_messages()
    {
        $empresa = $this->createEmpresa();
        $cliente = $this->createCliente();
        $category = $this->getCategory();

        $service = Service::create([
            'company_id' => $empresa->companyProfile->id,
            'category_id' => $category->id,
            'title' => 'Test Service',
            'description' => 'Test',
            'price_range' => 'R$ 100-500',
            'status' => 'ativo',
        ]);

        $deal = $this->dealService->createDeal($cliente->clientProfile, $service, null);

        $this->assertEquals(0, $deal->messages()->count());
    }

    // ========================================
    // updateStatus() Tests
    // ========================================

    /** @test */
    public function update_status_validates_transitions()
    {
        $empresa = $this->createEmpresa();
        $cliente = $this->createCliente();
        $category = $this->getCategory();

        $service = Service::create([
            'company_id' => $empresa->companyProfile->id,
            'category_id' => $category->id,
            'title' => 'Test Service',
            'description' => 'Test',
            'price_range' => 'R$ 100-500',
            'status' => 'ativo',
        ]);

        $deal = Deal::create([
            'company_id' => $empresa->companyProfile->id,
            'client_id' => $cliente->clientProfile->id,
            'service_id' => $service->id,
            'status' => 'aberto',
        ]);

        // Invalid: aberto -> concluido
        $result = $this->dealService->updateStatus($deal, 'concluido', $empresa);

        $this->assertFalse($result['success']);
        $this->assertStringContainsString('Não é possível', $result['message']);
    }

    /** @test */
    public function update_status_allows_valid_transitions()
    {
        $empresa = $this->createEmpresa();
        $cliente = $this->createCliente();
        $category = $this->getCategory();

        $service = Service::create([
            'company_id' => $empresa->companyProfile->id,
            'category_id' => $category->id,
            'title' => 'Test Service',
            'description' => 'Test',
            'price_range' => 'R$ 100-500',
            'status' => 'ativo',
        ]);

        $deal = Deal::create([
            'company_id' => $empresa->companyProfile->id,
            'client_id' => $cliente->clientProfile->id,
            'service_id' => $service->id,
            'status' => 'aberto',
        ]);

        // Valid: aberto -> negociando
        $result = $this->dealService->updateStatus($deal, 'negociando', $empresa);

        $this->assertTrue($result['success']);
        $this->assertEquals('negociando', $deal->fresh()->status);
    }

    /** @test */
    public function update_status_only_empresa_can_accept()
    {
        $empresa = $this->createEmpresa();
        $cliente = $this->createCliente();
        $category = $this->getCategory();

        $service = Service::create([
            'company_id' => $empresa->companyProfile->id,
            'category_id' => $category->id,
            'title' => 'Test Service',
            'description' => 'Test',
            'price_range' => 'R$ 100-500',
            'status' => 'ativo',
        ]);

        $deal = Deal::create([
            'company_id' => $empresa->companyProfile->id,
            'client_id' => $cliente->clientProfile->id,
            'service_id' => $service->id,
            'status' => 'negociando',
        ]);

        // Cliente trying to accept
        $result = $this->dealService->updateStatus($deal, 'aceito', $cliente);

        $this->assertFalse($result['success']);
        $this->assertStringContainsString('empresa pode aceitar', $result['message']);
    }

    /** @test */
    public function update_status_empresa_can_accept()
    {
        $empresa = $this->createEmpresa();
        $cliente = $this->createCliente();
        $category = $this->getCategory();

        $service = Service::create([
            'company_id' => $empresa->companyProfile->id,
            'category_id' => $category->id,
            'title' => 'Test Service',
            'description' => 'Test',
            'price_range' => 'R$ 100-500',
            'status' => 'ativo',
        ]);

        $deal = Deal::create([
            'company_id' => $empresa->companyProfile->id,
            'client_id' => $cliente->clientProfile->id,
            'service_id' => $service->id,
            'status' => 'negociando',
        ]);

        // Empresa accepting
        $result = $this->dealService->updateStatus($deal, 'aceito', $empresa);

        $this->assertTrue($result['success']);
        $this->assertEquals('aceito', $deal->fresh()->status);
        $this->assertNotNull($deal->fresh()->accepted_at);
    }

    /** @test */
    public function update_status_creates_order_on_accept()
    {
        $empresa = $this->createEmpresa();
        $cliente = $this->createCliente();
        $category = $this->getCategory();

        $service = Service::create([
            'company_id' => $empresa->companyProfile->id,
            'category_id' => $category->id,
            'title' => 'Test Service',
            'description' => 'Test',
            'price_range' => 'R$ 100-500',
            'status' => 'ativo',
        ]);

        $deal = Deal::create([
            'company_id' => $empresa->companyProfile->id,
            'client_id' => $cliente->clientProfile->id,
            'service_id' => $service->id,
            'status' => 'negociando',
        ]);

        $initialOrderCount = Order::count();

        $this->dealService->updateStatus($deal, 'aceito', $empresa);

        $this->assertEquals($initialOrderCount + 1, Order::count());

        $order = Order::where('deal_id', $deal->id)->first();
        $this->assertNotNull($order);
        $this->assertEquals('pendente', $order->status);
    }

    /** @test */
    public function update_status_sets_completed_at()
    {
        $empresa = $this->createEmpresa();
        $cliente = $this->createCliente();
        $category = $this->getCategory();

        $service = Service::create([
            'company_id' => $empresa->companyProfile->id,
            'category_id' => $category->id,
            'title' => 'Test Service',
            'description' => 'Test',
            'price_range' => 'R$ 100-500',
            'status' => 'ativo',
        ]);

        $deal = Deal::create([
            'company_id' => $empresa->companyProfile->id,
            'client_id' => $cliente->clientProfile->id,
            'service_id' => $service->id,
            'status' => 'aceito',
        ]);

        $this->dealService->updateStatus($deal, 'concluido', $empresa);

        $this->assertEquals('concluido', $deal->fresh()->status);
        $this->assertNotNull($deal->fresh()->completed_at);
    }

    // ========================================
    // sanitizeMessage() Tests
    // ========================================

    /** @test */
    public function sanitize_message_removes_cpf()
    {
        $content = 'Meu CPF é 123.456.789-00 para contato';

        $sanitized = $this->dealService->sanitizeMessage($content);

        $this->assertStringContainsString('[CPF OCULTO]', $sanitized);
        $this->assertStringNotContainsString('123.456.789-00', $sanitized);
    }

    /** @test */
    public function sanitize_message_removes_cnpj()
    {
        $content = 'O CNPJ da empresa é 12.345.678/0001-99';

        $sanitized = $this->dealService->sanitizeMessage($content);

        $this->assertStringContainsString('[CNPJ OCULTO]', $sanitized);
        $this->assertStringNotContainsString('12.345.678/0001-99', $sanitized);
    }

    /** @test */
    public function sanitize_message_removes_phone()
    {
        $content = 'Me ligue no (11) 99999-8888 ou 11 98765-4321';

        $sanitized = $this->dealService->sanitizeMessage($content);

        $this->assertStringContainsString('[TELEFONE OCULTO]', $sanitized);
        $this->assertStringNotContainsString('99999-8888', $sanitized);
        $this->assertStringNotContainsString('98765-4321', $sanitized);
    }

    /** @test */
    public function sanitize_message_removes_email()
    {
        $content = 'Meu email é teste@exemplo.com.br para contato';

        $sanitized = $this->dealService->sanitizeMessage($content);

        $this->assertStringContainsString('[EMAIL OCULTO]', $sanitized);
        $this->assertStringNotContainsString('teste@exemplo.com.br', $sanitized);
    }

    /** @test */
    public function sanitize_message_removes_multiple_patterns()
    {
        $content = 'CPF: 123.456.789-00, Email: teste@email.com, Tel: (11) 99999-0000';

        $sanitized = $this->dealService->sanitizeMessage($content);

        $this->assertStringContainsString('[CPF OCULTO]', $sanitized);
        $this->assertStringContainsString('[EMAIL OCULTO]', $sanitized);
        $this->assertStringContainsString('[TELEFONE OCULTO]', $sanitized);
    }

    /** @test */
    public function sanitize_message_preserves_normal_text()
    {
        $content = 'Olá, gostaria de informações sobre o serviço';

        $sanitized = $this->dealService->sanitizeMessage($content);

        $this->assertEquals($content, $sanitized);
    }

    // ========================================
    // formatDealForUser() Tests
    // ========================================

    /** @test */
    public function format_deal_hides_data_when_anonymous_for_empresa()
    {
        $empresa = $this->createEmpresa();
        $cliente = $this->createCliente();
        $category = $this->getCategory();

        $service = Service::create([
            'company_id' => $empresa->companyProfile->id,
            'category_id' => $category->id,
            'title' => 'Test Service',
            'description' => 'Test',
            'price_range' => 'R$ 100-500',
            'status' => 'ativo',
        ]);

        $deal = Deal::create([
            'company_id' => $empresa->companyProfile->id,
            'client_id' => $cliente->clientProfile->id,
            'service_id' => $service->id,
            'status' => 'negociando', // Anonymous status
        ]);

        $formatted = $this->dealService->formatDealForUser($deal->load(['client', 'company', 'service']), $empresa);

        // Empresa should see client as anonymous
        $this->assertArrayHasKey('client', $formatted);
        $this->assertArrayHasKey('anonymous_name', $formatted['client']);
    }

    /** @test */
    public function format_deal_hides_data_when_anonymous_for_cliente()
    {
        $empresa = $this->createEmpresa();
        $cliente = $this->createCliente();
        $category = $this->getCategory();

        $service = Service::create([
            'company_id' => $empresa->companyProfile->id,
            'category_id' => $category->id,
            'title' => 'Test Service',
            'description' => 'Test',
            'price_range' => 'R$ 100-500',
            'status' => 'ativo',
        ]);

        $deal = Deal::create([
            'company_id' => $empresa->companyProfile->id,
            'client_id' => $cliente->clientProfile->id,
            'service_id' => $service->id,
            'status' => 'negociando', // Anonymous status
        ]);

        $formatted = $this->dealService->formatDealForUser($deal->load(['client', 'company', 'service']), $cliente);

        // Cliente should see company as anonymous
        $this->assertArrayHasKey('company', $formatted);
        $this->assertArrayHasKey('anonymous_name', $formatted['company']);
    }

    // ========================================
    // System Message Tests
    // ========================================

    /** @test */
    public function update_status_creates_system_message()
    {
        $empresa = $this->createEmpresa();
        $cliente = $this->createCliente();
        $category = $this->getCategory();

        $service = Service::create([
            'company_id' => $empresa->companyProfile->id,
            'category_id' => $category->id,
            'title' => 'Test Service',
            'description' => 'Test',
            'price_range' => 'R$ 100-500',
            'status' => 'ativo',
        ]);

        $deal = Deal::create([
            'company_id' => $empresa->companyProfile->id,
            'client_id' => $cliente->clientProfile->id,
            'service_id' => $service->id,
            'status' => 'aberto',
        ]);

        $initialMessageCount = Message::count();

        $this->dealService->updateStatus($deal, 'negociando', $empresa);

        // Should create a system message
        $this->assertEquals($initialMessageCount + 1, Message::count());

        $systemMessage = Message::where('deal_id', $deal->id)
            ->where('is_system', true)
            ->first();

        $this->assertNotNull($systemMessage);
    }
}
