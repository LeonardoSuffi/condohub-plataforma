<?php

namespace App\Http\Controllers;

use App\Models\UserSession;
use App\Services\ActivityLogService;
use App\Services\TwoFactorService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;

class SecurityController extends Controller
{
    protected TwoFactorService $twoFactor;
    protected ActivityLogService $activityLog;

    public function __construct(TwoFactorService $twoFactor, ActivityLogService $activityLog)
    {
        $this->twoFactor = $twoFactor;
        $this->activityLog = $activityLog;
    }

    // ==========================================
    // SESSOES
    // ==========================================

    /**
     * Listar sessoes ativas do usuario
     */
    public function getSessions(Request $request): JsonResponse
    {
        $user = $request->user();

        $sessions = UserSession::forUser($user->id)
            ->active()
            ->orderBy('is_current', 'desc')
            ->orderBy('last_active_at', 'desc')
            ->get();

        return response()->json([
            'data' => $sessions,
        ]);
    }

    /**
     * Revogar uma sessao especifica
     */
    public function revokeSession(Request $request, int $id): JsonResponse
    {
        $user = $request->user();

        $session = UserSession::forUser($user->id)->findOrFail($id);

        if ($session->is_current) {
            return response()->json([
                'message' => 'Nao e possivel revogar a sessao atual',
            ], 422);
        }

        $session->revoke();

        return response()->json([
            'message' => 'Sessao revogada com sucesso',
        ]);
    }

    /**
     * Revogar todas as outras sessoes
     */
    public function revokeAllSessions(Request $request): JsonResponse
    {
        $user = $request->user();

        $count = UserSession::revokeAllForUser(
            $user->id,
            $user->current_session_id
        );

        $this->activityLog->logLogoutAll($user, $count);

        return response()->json([
            'message' => "Todas as {$count} sessoes foram revogadas",
        ]);
    }

    // ==========================================
    // 2FA
    // ==========================================

    /**
     * Status do 2FA
     */
    public function get2FAStatus(Request $request): JsonResponse
    {
        $status = $this->twoFactor->getStatus($request->user());

        return response()->json($status);
    }

    /**
     * Iniciar configuracao do 2FA
     */
    public function enable2FA(Request $request): JsonResponse
    {
        $user = $request->user();

        if ($user->two_factor_enabled) {
            return response()->json([
                'message' => 'Autenticacao de 2 fatores ja esta ativada',
            ], 422);
        }

        $setup = $this->twoFactor->initiate($user);

        return response()->json([
            'message' => 'Escaneie o QR code com seu aplicativo autenticador',
            'secret' => $setup['secret'],
            'qr_code_url' => $setup['qr_code_url'],
        ]);
    }

    /**
     * Verificar e ativar 2FA
     */
    public function verify2FA(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'code' => 'required|string|size:6',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $user = $request->user();

        if ($user->two_factor_enabled) {
            return response()->json([
                'message' => 'Autenticacao de 2 fatores ja esta ativada',
            ], 422);
        }

        $valid = $this->twoFactor->verify($user, $request->code);

        if (!$valid) {
            return response()->json([
                'message' => 'Codigo invalido',
            ], 422);
        }

        // Gerar codigos de backup
        $backupCodes = $this->twoFactor->regenerateBackupCodes($user);

        $this->activityLog->log2FAEnable($user);

        return response()->json([
            'message' => 'Autenticacao de 2 fatores ativada com sucesso',
            'backup_codes' => $backupCodes,
        ]);
    }

    /**
     * Desativar 2FA
     */
    public function disable2FA(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'code' => 'required|string',
            'password' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $user = $request->user();

        // Verificar senha
        if (!Hash::check($request->password, $user->password)) {
            return response()->json([
                'message' => 'Senha incorreta',
            ], 422);
        }

        if (!$user->two_factor_enabled) {
            return response()->json([
                'message' => 'Autenticacao de 2 fatores nao esta ativada',
            ], 422);
        }

        $disabled = $this->twoFactor->disable($user, $request->code);

        if (!$disabled) {
            return response()->json([
                'message' => 'Codigo invalido',
            ], 422);
        }

        $this->activityLog->log2FADisable($user);

        return response()->json([
            'message' => 'Autenticacao de 2 fatores desativada',
        ]);
    }

    /**
     * Regenerar codigos de backup
     */
    public function regenerateBackupCodes(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'code' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $user = $request->user();

        if (!$user->two_factor_enabled) {
            return response()->json([
                'message' => 'Autenticacao de 2 fatores nao esta ativada',
            ], 422);
        }

        // Validar codigo atual
        if (!$this->twoFactor->validate($user, $request->code)) {
            return response()->json([
                'message' => 'Codigo invalido',
            ], 422);
        }

        $backupCodes = $this->twoFactor->regenerateBackupCodes($user);

        return response()->json([
            'message' => 'Novos codigos de backup gerados',
            'backup_codes' => $backupCodes,
        ]);
    }

    // ==========================================
    // LOGS DE ATIVIDADE
    // ==========================================

    /**
     * Listar atividades recentes do usuario
     */
    public function getActivityLog(Request $request): JsonResponse
    {
        $user = $request->user();

        $activities = $this->activityLog->getRecentActivities($user, 30, 50);

        return response()->json([
            'data' => $activities,
        ]);
    }

    /**
     * Listar atividades de seguranca
     */
    public function getSecurityLog(Request $request): JsonResponse
    {
        $user = $request->user();

        $activities = $this->activityLog->getSecurityActivities($user, 20);

        return response()->json([
            'data' => $activities,
        ]);
    }
}
