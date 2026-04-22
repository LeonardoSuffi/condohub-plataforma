<?php

namespace App\Http\Controllers;

use App\Models\ActivityLog;
use App\Models\Deal;
use App\Models\Message;
use App\Models\Review;
use App\Services\ActivityLogService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;

class GdprController extends Controller
{
    protected ActivityLogService $activityLog;

    public function __construct(ActivityLogService $activityLog)
    {
        $this->activityLog = $activityLog;
    }

    /**
     * Exportar todos os dados do usuario (LGPD)
     */
    public function exportData(Request $request): JsonResponse
    {
        $user = $request->user();

        // Coletar dados do usuario
        $data = [
            'exportado_em' => now()->toIso8601String(),
            'usuario' => [
                'id' => $user->id,
                'nome' => $user->name,
                'email' => $user->email,
                'tipo' => $user->type,
                'criado_em' => $user->created_at,
                'ultimo_login' => $user->last_login_at,
            ],
        ];

        // Perfil de empresa
        if ($user->isEmpresa() && $user->companyProfile) {
            $company = $user->companyProfile;
            $data['perfil_empresa'] = [
                'cnpj' => $company->cnpj,
                'razao_social' => $company->razao_social,
                'nome_fantasia' => $company->nome_fantasia,
                'segmento' => $company->segmento,
                'telefone' => $company->telefone,
                'endereco' => $company->endereco,
                'cidade' => $company->cidade,
                'estado' => $company->estado,
                'cep' => $company->cep,
                'descricao' => $company->descricao,
                'website' => $company->website,
                'verificado' => $company->verified,
            ];

            // Servicos
            $data['servicos'] = $company->services()->get(['id', 'titulo', 'descricao', 'preco', 'status', 'created_at'])->toArray();

            // Portfolio
            $data['portfolio'] = $company->portfolioItems()->get(['id', 'title', 'description', 'created_at'])->toArray();

            // Avaliacoes recebidas
            $data['avaliacoes_recebidas'] = Review::forCompany($company->id)
                ->get(['id', 'rating', 'comment', 'response', 'created_at'])
                ->toArray();

            // Negociacoes
            $data['negociacoes'] = Deal::where('company_id', $company->id)
                ->get(['id', 'titulo', 'status', 'valor', 'created_at'])
                ->toArray();
        }

        // Perfil de cliente
        if ($user->isCliente() && $user->clientProfile) {
            $client = $user->clientProfile;
            $data['perfil_cliente'] = [
                'cpf' => $client->cpf,
                'cnpj' => $client->cnpj,
                'tipo' => $client->tipo,
                'telefone' => $client->telefone,
                'nome_organizacao' => $client->nome_organizacao,
                'endereco_organizacao' => $client->endereco_organizacao,
                'cidade' => $client->cidade,
                'estado' => $client->estado,
                'cep' => $client->cep,
                'num_funcionarios' => $client->num_funcionarios,
            ];

            // Avaliacoes dadas
            $data['avaliacoes_dadas'] = Review::byClient($client->id)
                ->get(['id', 'company_id', 'rating', 'comment', 'created_at'])
                ->toArray();

            // Negociacoes
            $data['negociacoes'] = Deal::where('client_id', $client->id)
                ->get(['id', 'titulo', 'status', 'valor', 'created_at'])
                ->toArray();
        }

        // Mensagens
        $data['mensagens'] = Message::where('sender_id', $user->id)
            ->get(['id', 'receiver_id', 'content', 'created_at'])
            ->toArray();

        // Logs de atividade
        $data['logs_atividade'] = ActivityLog::forUser($user->id)
            ->get(['action', 'ip_address', 'created_at'])
            ->toArray();

        // Registrar exportacao
        $this->activityLog->logGdprExport($user);

        return response()->json([
            'message' => 'Dados exportados com sucesso',
            'data' => $data,
        ]);
    }

    /**
     * Download dos dados em JSON
     */
    public function downloadData(Request $request)
    {
        $user = $request->user();

        // Usar mesmo metodo de exportacao
        $exportResponse = $this->exportData($request);
        $data = $exportResponse->getData(true);

        $filename = "dados_usuario_{$user->id}_" . now()->format('Y-m-d_His') . '.json';

        return response()->streamDownload(function () use ($data) {
            echo json_encode($data['data'], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
        }, $filename, [
            'Content-Type' => 'application/json',
        ]);
    }

    /**
     * Solicitar exclusao de conta
     */
    public function deleteAccount(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'password' => 'required|string',
            'confirmation' => 'required|in:EXCLUIR',
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

        // Registrar solicitacao antes de deletar
        $this->activityLog->logAccountDeleteRequest($user);

        // Soft delete do usuario
        // Em producao, poderia agendar exclusao para 30 dias
        $user->delete();

        // Revogar tokens
        $user->tokens()->delete();

        return response()->json([
            'message' => 'Conta marcada para exclusao',
        ]);
    }

    /**
     * Obter consentimentos do usuario
     */
    public function getConsents(Request $request): JsonResponse
    {
        $user = $request->user();

        return response()->json([
            'data' => [
                'gdpr_consent_at' => $user->gdpr_consent_at,
                'terms_accepted' => true, // Assumindo que aceitou ao cadastrar
                'marketing_consent' => false, // Poderia ter campo especifico
            ],
        ]);
    }

    /**
     * Atualizar consentimentos
     */
    public function updateConsents(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'marketing_consent' => 'boolean',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $user = $request->user();

        // Atualizar consentimentos
        // Poderia ter campos especificos no usuario
        if ($request->has('gdpr_consent') && $request->gdpr_consent) {
            $user->update(['gdpr_consent_at' => now()]);
        }

        return response()->json([
            'message' => 'Consentimentos atualizados',
        ]);
    }
}
