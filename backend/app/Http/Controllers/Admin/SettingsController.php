<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Setting;
use App\Models\ActivityLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class SettingsController extends Controller
{
    /**
     * Listar todas as settings (admin)
     */
    public function index()
    {
        $settings = Setting::getAllCached();

        return $this->success($settings);
    }

    /**
     * Obter settings publicas (sem auth, com cache headers)
     */
    public function publicSettings()
    {
        $settings = Setting::getPublicSettings();

        $cacheTtl = config('security.cache.public_settings_ttl', 300);

        return response()->json([
            'success' => true,
            'data' => $settings
        ])->header('Cache-Control', 'public, max-age=' . $cacheTtl);
    }

    /**
     * Atualizar settings em lote
     */
    public function update(Request $request)
    {
        $data = $request->validate([
            'branding' => 'sometimes|array',
            'branding.app_name' => 'sometimes|string|max:100',
            'branding.tagline' => 'sometimes|string|max:255',
            'theme' => 'sometimes|array',
            'theme.selected_theme' => 'sometimes|string|in:' . implode(',', config('security.validation.themes', ['blue', 'green', 'purple', 'orange', 'teal', 'rose', 'slate', 'indigo'])),
            'home' => 'sometimes|array',
            'home.*' => 'sometimes|string',
            'footer' => 'sometimes|array',
            'footer.*' => 'sometimes|string',
            'seo' => 'sometimes|array',
            'seo.*' => 'sometimes|string',
            'contact' => 'sometimes|array',
            'contact.*' => 'sometimes|string|nullable',
            'social' => 'sometimes|array',
            'social.*' => 'sometimes|string|nullable',
            'dashboard_cliente' => 'sometimes|array',
            'dashboard_cliente.sections' => 'sometimes|array',
            'dashboard_empresa' => 'sometimes|array',
            'dashboard_empresa.sections' => 'sometimes|array',
            'dashboard_cards' => 'sometimes|array',
            'dashboard_cards.sizes' => 'sometimes|array',
            'reports' => 'sometimes|array',
            'reports.default_period' => 'sometimes|string|in:7,30,90,180,365',
            'reports.charts' => 'sometimes|array',
            'reports.metrics' => 'sometimes|array',
            'reports.show_insights' => 'sometimes|boolean',
            'reports.show_export' => 'sometimes|boolean',
            'ranking' => 'sometimes|array',
            'ranking.scoring' => 'sometimes|array',
            'ranking.benefits' => 'sometimes|array',
            'ranking.tips' => 'sometimes|array',
            'ranking.show_podium' => 'sometimes|boolean',
            'ranking.show_how_it_works' => 'sometimes|boolean',
            'ranking.show_benefits' => 'sometimes|boolean',
            'ranking.show_tips' => 'sometimes|boolean',
            'ranking.reset_period' => 'sometimes|string|in:mensal,trimestral,semestral,anual',
        ]);

        Setting::setMany($data);

        // Log da atualizacao de settings
        ActivityLog::log(auth()->user(), ActivityLog::ACTION_ADMIN_SETTINGS_UPDATE, null, [
            'groups_updated' => array_keys($data),
            'keys_count' => count($data, COUNT_RECURSIVE) - count($data),
        ]);

        return $this->success(
            Setting::getAllCached(),
            'Configuracoes atualizadas com sucesso!'
        );
    }

    /**
     * Upload de logo
     * SEGURANCA: Usa guessExtension() para determinar extensao real do arquivo
     */
    public function uploadLogo(Request $request)
    {
        $request->validate([
            'logo' => 'required|image|mimes:png,jpg,jpeg,svg,webp|max:1024', // 1MB
        ]);

        // Remover logo antigo
        $oldLogo = Setting::get('logo_path');
        if ($oldLogo) {
            Storage::disk('public')->delete($oldLogo);
        }

        // Salvar novo logo
        $file = $request->file('logo');

        // SEGURANCA: Usar extensao real baseada no MIME type, nao na extensao do cliente
        $extension = $this->getSecureExtension($file, ['png', 'jpg', 'jpeg', 'svg', 'webp']);
        $filename = 'logo_' . time() . '_' . Str::random(8) . '.' . $extension;
        $path = $file->storeAs('settings', $filename, 'public');

        Setting::set('logo_path', $path, 'branding', 'image');

        // Log do upload de logo
        ActivityLog::log(auth()->user(), ActivityLog::ACTION_ADMIN_SETTINGS_UPDATE, null, [
            'action' => 'upload_logo',
            'file_path' => $path,
        ]);

        return $this->success([
            'path' => $path,
            'url' => Storage::disk('public')->url($path)
        ], 'Logo atualizado com sucesso!');
    }

    /**
     * Upload de favicon
     * SEGURANCA: Usa guessExtension() para determinar extensao real do arquivo
     */
    public function uploadFavicon(Request $request)
    {
        $request->validate([
            'favicon' => 'required|mimes:ico,png,svg|max:256', // 256KB
        ]);

        // Remover favicon antigo
        $oldFavicon = Setting::get('favicon_path');
        if ($oldFavicon) {
            Storage::disk('public')->delete($oldFavicon);
        }

        // Salvar novo favicon
        $file = $request->file('favicon');

        // SEGURANCA: Usar extensao real baseada no MIME type
        $extension = $this->getSecureExtension($file, ['ico', 'png', 'svg']);
        $filename = 'favicon_' . time() . '_' . Str::random(8) . '.' . $extension;
        $path = $file->storeAs('settings', $filename, 'public');

        Setting::set('favicon_path', $path, 'branding', 'image');

        // Log do upload de favicon
        ActivityLog::log(auth()->user(), ActivityLog::ACTION_ADMIN_SETTINGS_UPDATE, null, [
            'action' => 'upload_favicon',
            'file_path' => $path,
        ]);

        return $this->success([
            'path' => $path,
            'url' => Storage::disk('public')->url($path)
        ], 'Favicon atualizado com sucesso!');
    }

    /**
     * Upload de imagem OG (Open Graph)
     * SEGURANCA: Usa guessExtension() para determinar extensao real do arquivo
     */
    public function uploadOgImage(Request $request)
    {
        $request->validate([
            'og_image' => 'required|image|mimes:png,jpg,jpeg|max:2048', // 2MB
        ]);

        // Remover imagem antiga
        $oldImage = Setting::get('og_image_path');
        if ($oldImage) {
            Storage::disk('public')->delete($oldImage);
        }

        // Salvar nova imagem
        $file = $request->file('og_image');

        // SEGURANCA: Usar extensao real baseada no MIME type
        $extension = $this->getSecureExtension($file, ['png', 'jpg', 'jpeg']);
        $filename = 'og_image_' . time() . '_' . Str::random(8) . '.' . $extension;
        $path = $file->storeAs('settings', $filename, 'public');

        Setting::set('og_image_path', $path, 'seo', 'image');

        // Log do upload de imagem OG
        ActivityLog::log(auth()->user(), ActivityLog::ACTION_ADMIN_SETTINGS_UPDATE, null, [
            'action' => 'upload_og_image',
            'file_path' => $path,
        ]);

        return $this->success([
            'path' => $path,
            'url' => Storage::disk('public')->url($path)
        ], 'Imagem OG atualizada com sucesso!');
    }

    /**
     * Obtem extensao segura do arquivo baseada no MIME type real
     * Fallback para extensao permitida padrao se nao conseguir detectar
     */
    private function getSecureExtension($file, array $allowedExtensions): string
    {
        // Tenta detectar a extensao real pelo conteudo do arquivo
        $guessedExtension = $file->guessExtension();

        // Se detectou e esta na lista de permitidas, usa
        if ($guessedExtension && in_array(strtolower($guessedExtension), $allowedExtensions)) {
            return strtolower($guessedExtension);
        }

        // Fallback: usa a primeira extensao permitida
        return $allowedExtensions[0];
    }

    /**
     * Remover logo
     */
    public function removeLogo()
    {
        $oldLogo = Setting::get('logo_path');
        if ($oldLogo) {
            Storage::disk('public')->delete($oldLogo);
        }

        Setting::set('logo_path', null, 'branding', 'image');

        return $this->success(null, 'Logo removido com sucesso!');
    }

    /**
     * Remover favicon
     */
    public function removeFavicon()
    {
        $oldFavicon = Setting::get('favicon_path');
        if ($oldFavicon) {
            Storage::disk('public')->delete($oldFavicon);
        }

        Setting::set('favicon_path', null, 'branding', 'image');

        return $this->success(null, 'Favicon removido com sucesso!');
    }
}
