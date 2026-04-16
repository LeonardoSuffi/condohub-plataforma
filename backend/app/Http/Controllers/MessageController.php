<?php

namespace App\Http\Controllers;

use App\Models\Deal;
use App\Models\Message;
use App\Services\DealService;
use Illuminate\Http\Request;

class MessageController extends Controller
{
    protected DealService $dealService;

    public function __construct(DealService $dealService)
    {
        $this->dealService = $dealService;
    }

    /**
     * Lista mensagens de um deal (polling)
     */
    public function index(Request $request, $dealId)
    {
        $user = $request->user();
        $deal = Deal::findOrFail($dealId);

        // Verifica acesso
        if (!$deal->belongsToUser($user)) {
            return $this->error('Acesso negado a esta conversa.', 403);
        }

        // Parâmetro para buscar apenas mensagens novas (desde timestamp)
        $since = $request->get('since');

        $query = Message::where('deal_id', $dealId)
            ->with('sender')
            ->orderBy('created_at', 'asc');

        if ($since) {
            $query->where('created_at', '>', $since);
        }

        $messages = $query->get();

        // Marca mensagens como lidas
        Message::where('deal_id', $dealId)
            ->where('sender_id', '!=', $user->id)
            ->where('read', false)
            ->update(['read' => true, 'read_at' => now()]);

        // Formata mensagens para exibição
        $formattedMessages = $messages->map(function ($message) use ($deal, $user) {
            return $this->formatMessageForUser($message, $deal, $user);
        });

        return $this->success([
            'messages' => $formattedMessages,
            'deal_status' => $deal->status,
            'is_anonymous' => $deal->isAnonymous(),
        ], 'Mensagens carregadas');
    }

    /**
     * Envia uma mensagem
     */
    public function store(Request $request, $dealId)
    {
        $validated = $request->validate([
            'content' => 'required|string|max:2000',
        ]);

        $user = $request->user();
        $deal = Deal::findOrFail($dealId);

        // Verifica acesso
        if (!$deal->belongsToUser($user)) {
            return $this->error('Acesso negado a esta conversa.', 403);
        }

        // Verifica se pode enviar mensagem
        if (!$deal->canChat()) {
            return $this->error('Não é possível enviar mensagens nesta negociação.', 400);
        }

        // Sanitiza o conteúdo se ainda estiver anônimo
        $contentOriginal = $validated['content'];
        $contentSanitized = $deal->isAnonymous()
            ? $this->dealService->sanitizeMessage($contentOriginal)
            : $contentOriginal;

        // Cria a mensagem
        $message = Message::create([
            'deal_id' => $dealId,
            'sender_id' => $user->id,
            'content_sanitized' => $contentSanitized,
            'content_original' => $contentOriginal,
        ]);

        // Se o deal estava "aberto", muda para "negociando"
        if ($deal->status === 'aberto') {
            $deal->update(['status' => 'negociando']);
        }

        return $this->success(
            $this->formatMessageForUser($message->load('sender'), $deal, $user),
            'Mensagem enviada',
            201
        );
    }

    /**
     * Formata mensagem para exibição
     */
    protected function formatMessageForUser(Message $message, Deal $deal, $currentUser): array
    {
        $sender = $message->sender;
        $isMine = $message->sender_id === $currentUser->id;

        // Determina o nome do remetente
        if ($message->is_system) {
            $senderName = 'Sistema';
        } elseif ($deal->isAnonymous()) {
            $senderName = $deal->getAnonHandleFor($sender);
        } else {
            // Dados reais após aceite
            if ($sender->isEmpresa()) {
                $senderName = $sender->companyProfile?->display_name ?? $sender->name;
            } else {
                $senderName = $sender->name;
            }
        }

        return [
            'id' => $message->id,
            'content' => $message->content_sanitized,
            'sender_name' => $senderName,
            'is_mine' => $isMine,
            'is_system' => $message->is_system,
            'read' => $message->read,
            'created_at' => $message->created_at,
        ];
    }
}
