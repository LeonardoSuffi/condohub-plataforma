<?php

namespace App\Http\Controllers;

use App\Models\Review;
use App\Models\CompanyProfile;
use App\Models\Deal;
use App\Services\ActivityLogService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class ReviewController extends Controller
{
    protected ActivityLogService $activityLog;

    public function __construct(ActivityLogService $activityLog)
    {
        $this->activityLog = $activityLog;
    }

    /**
     * Avaliacoes recebidas pela empresa
     */
    public function received(Request $request): JsonResponse
    {
        $user = $request->user();

        if (!$user->isEmpresa()) {
            return response()->json(['message' => 'Apenas empresas podem ver avaliacoes recebidas'], 403);
        }

        $reviews = Review::forCompany($user->companyProfile->id)
            ->with(['client.user:id,name,foto_path', 'deal:id,titulo'])
            ->latest()
            ->paginate(15);

        $stats = [
            'average' => Review::getAverageForCompany($user->companyProfile->id),
            'total' => Review::getCountForCompany($user->companyProfile->id),
            'distribution' => Review::getRatingDistribution($user->companyProfile->id),
        ];

        return response()->json([
            'data' => $reviews,
            'stats' => $stats,
        ]);
    }

    /**
     * Avaliacoes dadas pelo cliente
     */
    public function given(Request $request): JsonResponse
    {
        $user = $request->user();

        if (!$user->isCliente()) {
            return response()->json(['message' => 'Apenas clientes podem ver avaliacoes dadas'], 403);
        }

        $reviews = Review::byClient($user->clientProfile->id)
            ->with(['company.user:id,name', 'deal:id,titulo'])
            ->latest()
            ->paginate(15);

        return response()->json([
            'data' => $reviews,
        ]);
    }

    /**
     * Criar nova avaliacao
     */
    public function store(Request $request): JsonResponse
    {
        $user = $request->user();

        if (!$user->isCliente()) {
            return response()->json(['message' => 'Apenas clientes podem criar avaliacoes'], 403);
        }

        $validator = Validator::make($request->all(), [
            'company_id' => 'required|exists:company_profiles,id',
            'deal_id' => 'nullable|exists:deals,id',
            'rating' => 'required|integer|min:1|max:5',
            'comment' => 'nullable|string|max:2000',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $clientId = $user->clientProfile->id;

        // Verificar se ja avaliou esta empresa neste deal
        if ($request->deal_id) {
            $existingReview = Review::where('client_id', $clientId)
                ->where('deal_id', $request->deal_id)
                ->exists();

            if ($existingReview) {
                return response()->json([
                    'message' => 'Voce ja avaliou esta negociacao',
                ], 422);
            }

            // Verificar se o deal pertence ao cliente
            $deal = Deal::find($request->deal_id);
            if ($deal->client_id !== $clientId) {
                return response()->json([
                    'message' => 'Negociacao nao encontrada',
                ], 404);
            }
        }

        $review = Review::create([
            'company_id' => $request->company_id,
            'client_id' => $clientId,
            'deal_id' => $request->deal_id,
            'rating' => $request->rating,
            'comment' => $request->comment,
            'is_verified' => $request->deal_id !== null, // Avaliacao verificada se tem deal
            'status' => 'approved', // Auto-aprovar por padrao
        ]);

        $this->activityLog->logReviewCreate($user, $review);

        return response()->json([
            'message' => 'Avaliacao criada com sucesso',
            'data' => $review,
        ], 201);
    }

    /**
     * Responder avaliacao (empresa)
     */
    public function respond(Request $request, int $id): JsonResponse
    {
        $user = $request->user();

        if (!$user->isEmpresa()) {
            return response()->json(['message' => 'Apenas empresas podem responder avaliacoes'], 403);
        }

        $review = Review::where('company_id', $user->companyProfile->id)
            ->findOrFail($id);

        $validator = Validator::make($request->all(), [
            'response' => 'required|string|max:2000',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $review->respond($request->response);

        return response()->json([
            'message' => 'Resposta enviada',
            'data' => $review,
        ]);
    }

    /**
     * Avaliacoes publicas de uma empresa
     */
    public function companyReviews(int $companyId): JsonResponse
    {
        $company = CompanyProfile::findOrFail($companyId);

        $reviews = Review::forCompany($companyId)
            ->approved()
            ->with(['client.user:id,name,foto_path'])
            ->latest()
            ->paginate(10);

        $stats = [
            'average' => Review::getAverageForCompany($companyId),
            'total' => Review::getCountForCompany($companyId),
            'distribution' => Review::getRatingDistribution($companyId),
        ];

        return response()->json([
            'company' => [
                'id' => $company->id,
                'name' => $company->display_name,
            ],
            'data' => $reviews,
            'stats' => $stats,
        ]);
    }

    /**
     * Ocultar avaliacao (empresa)
     */
    public function hide(Request $request, int $id): JsonResponse
    {
        $user = $request->user();

        if (!$user->isEmpresa()) {
            return response()->json(['message' => 'Apenas empresas podem ocultar avaliacoes'], 403);
        }

        $review = Review::where('company_id', $user->companyProfile->id)
            ->findOrFail($id);

        $review->hide();

        return response()->json([
            'message' => 'Avaliacao ocultada',
        ]);
    }

    /**
     * Reportar avaliacao (empresa)
     */
    public function report(Request $request, int $id): JsonResponse
    {
        $user = $request->user();

        if (!$user->isEmpresa()) {
            return response()->json(['message' => 'Apenas empresas podem reportar avaliacoes'], 403);
        }

        $review = Review::where('company_id', $user->companyProfile->id)
            ->findOrFail($id);

        $validator = Validator::make($request->all(), [
            'reason' => 'required|string|max:500',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $review->update([
            'status' => 'pending',
            // Poderia salvar o motivo em metadata se necessario
        ]);

        return response()->json([
            'message' => 'Avaliacao reportada para analise',
        ]);
    }
}
