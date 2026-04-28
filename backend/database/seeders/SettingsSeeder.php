<?php

namespace Database\Seeders;

use App\Models\Setting;
use Illuminate\Database\Seeder;

class SettingsSeeder extends Seeder
{
    public function run(): void
    {
        $settings = [
            // Branding
            ['group' => 'branding', 'key' => 'logo_path', 'value' => null, 'type' => 'image'],
            ['group' => 'branding', 'key' => 'favicon_path', 'value' => null, 'type' => 'image'],
            ['group' => 'branding', 'key' => 'app_name', 'value' => 'ServicePro', 'type' => 'text'],
            ['group' => 'branding', 'key' => 'tagline', 'value' => 'O marketplace de servicos para seu condominio', 'type' => 'text'],

            // Theme
            ['group' => 'theme', 'key' => 'selected_theme', 'value' => 'blue', 'type' => 'text'],

            // Home Page
            ['group' => 'home', 'key' => 'hero_badge', 'value' => 'Marketplace #1 de Servicos', 'type' => 'text'],
            ['group' => 'home', 'key' => 'hero_title', 'value' => 'Encontre os melhores profissionais para seu condominio', 'type' => 'text'],
            ['group' => 'home', 'key' => 'hero_subtitle', 'value' => 'Conectamos voce aos melhores prestadores de servicos. Solicite orcamentos, compare precos e contrate com seguranca.', 'type' => 'text'],
            ['group' => 'home', 'key' => 'hero_cta_primary', 'value' => 'Explorar Servicos', 'type' => 'text'],
            ['group' => 'home', 'key' => 'hero_cta_secondary', 'value' => 'Sou Prestador', 'type' => 'text'],
            ['group' => 'home', 'key' => 'trust_badges', 'value' => json_encode(['Empresas Verificadas', 'Sem Taxas Ocultas', 'Suporte 24/7', 'Pagamento Seguro']), 'type' => 'json'],
            ['group' => 'home', 'key' => 'cta_title', 'value' => 'Pronto para encontrar o profissional ideal?', 'type' => 'text'],
            ['group' => 'home', 'key' => 'cta_subtitle', 'value' => 'Junte-se a milhares de clientes satisfeitos e encontre o servico perfeito para suas necessidades.', 'type' => 'text'],
            ['group' => 'home', 'key' => 'cta_button', 'value' => 'Comecar Agora', 'type' => 'text'],

            // Footer
            ['group' => 'footer', 'key' => 'company_description', 'value' => 'A plataforma que conecta voce aos melhores prestadores de servicos para condominios.', 'type' => 'text'],
            ['group' => 'footer', 'key' => 'copyright_text', 'value' => 'Todos os direitos reservados.', 'type' => 'text'],
            ['group' => 'footer', 'key' => 'privacy_url', 'value' => '/privacy', 'type' => 'text'],
            ['group' => 'footer', 'key' => 'terms_url', 'value' => '/terms', 'type' => 'text'],

            // SEO
            ['group' => 'seo', 'key' => 'meta_title', 'value' => 'ServicePro - Marketplace de Servicos para Condominios', 'type' => 'text'],
            ['group' => 'seo', 'key' => 'meta_description', 'value' => 'Encontre os melhores profissionais para seu condominio. Manutencao, limpeza, seguranca e muito mais. Orcamentos gratis!', 'type' => 'text'],
            ['group' => 'seo', 'key' => 'meta_keywords', 'value' => 'servicos, condominio, manutencao, limpeza, seguranca, profissionais', 'type' => 'text'],
            ['group' => 'seo', 'key' => 'og_image_path', 'value' => null, 'type' => 'image'],

            // Contact
            ['group' => 'contact', 'key' => 'email', 'value' => 'contato@servicepro.com.br', 'type' => 'text'],
            ['group' => 'contact', 'key' => 'phone', 'value' => '(11) 99999-9999', 'type' => 'text'],
            ['group' => 'contact', 'key' => 'address', 'value' => 'Sao Paulo, SP - Brasil', 'type' => 'text'],
            ['group' => 'contact', 'key' => 'whatsapp', 'value' => '5511999999999', 'type' => 'text'],

            // Social
            ['group' => 'social', 'key' => 'facebook', 'value' => null, 'type' => 'text'],
            ['group' => 'social', 'key' => 'instagram', 'value' => null, 'type' => 'text'],
            ['group' => 'social', 'key' => 'linkedin', 'value' => null, 'type' => 'text'],
            ['group' => 'social', 'key' => 'twitter', 'value' => null, 'type' => 'text'],
            ['group' => 'social', 'key' => 'youtube', 'value' => null, 'type' => 'text'],

            // Dashboard - Cliente Configuration
            ['group' => 'dashboard_cliente', 'key' => 'sections', 'value' => json_encode([
                ['id' => 'hero', 'title' => 'Hero Section', 'visible' => true, 'order' => 1],
                ['id' => 'categories', 'title' => 'Barra de Categorias', 'visible' => true, 'order' => 2],
                ['id' => 'user_stats', 'title' => 'Estatisticas do Usuario', 'visible' => true, 'order' => 3],
                ['id' => 'featured', 'title' => 'Empresas em Destaque', 'visible' => true, 'order' => 4, 'items' => 15, 'cardSize' => 'medium'],
                ['id' => 'top_rated_new', 'title' => 'Melhores Avaliadas e Novas', 'visible' => true, 'order' => 5, 'items' => 5],
                ['id' => 'most_hired', 'title' => 'Mais Contratadas', 'visible' => true, 'order' => 6, 'items' => 15, 'cardSize' => 'medium'],
                ['id' => 'verified', 'title' => 'Empresas Verificadas', 'visible' => true, 'order' => 7, 'items' => 8, 'cardSize' => 'compact'],
                ['id' => 'nearby', 'title' => 'Perto de Voce', 'visible' => true, 'order' => 8, 'items' => 15, 'cardSize' => 'medium'],
                ['id' => 'recent_deals', 'title' => 'Negociacoes Recentes', 'visible' => true, 'order' => 9, 'items' => 5],
                ['id' => 'cta_banner', 'title' => 'Banner CTA', 'visible' => true, 'order' => 10],
                ['id' => 'trust_bar', 'title' => 'Barra de Confianca', 'visible' => true, 'order' => 11],
            ]), 'type' => 'json'],

            // Dashboard - Empresa Configuration
            ['group' => 'dashboard_empresa', 'key' => 'sections', 'value' => json_encode([
                ['id' => 'hero', 'title' => 'Hero Section', 'visible' => true, 'order' => 1],
                ['id' => 'categories', 'title' => 'Barra de Categorias', 'visible' => true, 'order' => 2],
                ['id' => 'user_stats', 'title' => 'Estatisticas do Usuario', 'visible' => true, 'order' => 3],
                ['id' => 'tools', 'title' => 'Ferramentas Rapidas', 'visible' => true, 'order' => 4],
                ['id' => 'featured', 'title' => 'Empresas em Destaque', 'visible' => true, 'order' => 5, 'items' => 15, 'cardSize' => 'medium'],
                ['id' => 'top_rated_new', 'title' => 'Melhores Avaliadas e Novas', 'visible' => true, 'order' => 6, 'items' => 5],
                ['id' => 'most_hired', 'title' => 'Mais Contratadas', 'visible' => true, 'order' => 7, 'items' => 15, 'cardSize' => 'medium'],
                ['id' => 'verified', 'title' => 'Empresas Verificadas', 'visible' => true, 'order' => 8, 'items' => 8, 'cardSize' => 'compact'],
                ['id' => 'nearby', 'title' => 'Perto de Voce', 'visible' => true, 'order' => 9, 'items' => 15, 'cardSize' => 'medium'],
                ['id' => 'recent_deals', 'title' => 'Negociacoes Recentes', 'visible' => true, 'order' => 10, 'items' => 5],
                ['id' => 'trust_bar', 'title' => 'Barra de Confianca', 'visible' => true, 'order' => 11],
            ]), 'type' => 'json'],

            // Dashboard - Card Sizes Configuration
            ['group' => 'dashboard_cards', 'key' => 'sizes', 'value' => json_encode([
                'small' => ['width' => 240, 'showCover' => false, 'showRating' => true, 'showLocation' => false],
                'medium' => ['width' => 288, 'showCover' => true, 'showRating' => true, 'showLocation' => true],
                'large' => ['width' => 320, 'showCover' => true, 'showRating' => true, 'showLocation' => true],
            ]), 'type' => 'json'],

            // Reports Configuration
            ['group' => 'reports', 'key' => 'default_period', 'value' => '30', 'type' => 'text'],
            ['group' => 'reports', 'key' => 'charts', 'value' => json_encode([
                ['id' => 'deals_timeline', 'title' => 'Evolucao de Negociacoes', 'type' => 'area', 'visible' => true],
                ['id' => 'deals_status', 'title' => 'Status das Negociacoes', 'type' => 'donut', 'visible' => true],
                ['id' => 'top_services', 'title' => 'Servicos Mais Solicitados', 'type' => 'bar', 'visible' => true],
                ['id' => 'reviews_timeline', 'title' => 'Evolucao de Avaliacoes', 'type' => 'area', 'visible' => true],
            ]), 'type' => 'json'],
            ['group' => 'reports', 'key' => 'metrics', 'value' => json_encode([
                ['id' => 'total_deals', 'title' => 'Total de Negociacoes', 'visible' => true],
                ['id' => 'conversion_rate', 'title' => 'Taxa de Conversao', 'visible' => true],
                ['id' => 'avg_rating', 'title' => 'Media de Avaliacoes', 'visible' => true],
                ['id' => 'completed_services', 'title' => 'Servicos Concluidos', 'visible' => true],
            ]), 'type' => 'json'],
            ['group' => 'reports', 'key' => 'show_insights', 'value' => 'true', 'type' => 'boolean'],
            ['group' => 'reports', 'key' => 'show_export', 'value' => 'true', 'type' => 'boolean'],

            // Ranking Configuration
            ['group' => 'ranking', 'key' => 'scoring', 'value' => json_encode([
                'revenue_multiplier' => 0.1,
                'deal_completed_points' => 10,
                'five_star_review_points' => 5,
            ]), 'type' => 'json'],
            ['group' => 'ranking', 'key' => 'benefits', 'value' => json_encode([
                ['id' => 'featured_search', 'title' => 'Destaque nas buscas', 'description' => 'Apareca em primeiro nas pesquisas', 'visible' => true],
                ['id' => 'badge', 'title' => 'Badge Top Performer', 'description' => 'Selo exclusivo no perfil', 'visible' => true],
                ['id' => 'priority_leads', 'title' => 'Leads prioritarios', 'description' => 'Receba leads qualificados primeiro', 'visible' => true],
                ['id' => 'campaign_exposure', 'title' => 'Exposicao em campanhas', 'description' => 'Destaque em campanhas da plataforma', 'visible' => true],
            ]), 'type' => 'json'],
            ['group' => 'ranking', 'key' => 'tips', 'value' => json_encode([
                ['id' => 'update_profile', 'text' => 'Mantenha seu perfil atualizado', 'visible' => true],
                ['id' => 'quick_response', 'text' => 'Responda rapidamente as solicitacoes', 'visible' => true],
                ['id' => 'quality_service', 'text' => 'Entregue servicos de qualidade', 'visible' => true],
            ]), 'type' => 'json'],
            ['group' => 'ranking', 'key' => 'show_podium', 'value' => 'true', 'type' => 'boolean'],
            ['group' => 'ranking', 'key' => 'show_how_it_works', 'value' => 'true', 'type' => 'boolean'],
            ['group' => 'ranking', 'key' => 'show_benefits', 'value' => 'true', 'type' => 'boolean'],
            ['group' => 'ranking', 'key' => 'show_tips', 'value' => 'true', 'type' => 'boolean'],
            ['group' => 'ranking', 'key' => 'reset_period', 'value' => 'semestral', 'type' => 'text'],
        ];

        foreach ($settings as $setting) {
            Setting::updateOrCreate(
                ['key' => $setting['key']],
                $setting
            );
        }

        $this->command->info('Settings seeded successfully!');
    }
}
