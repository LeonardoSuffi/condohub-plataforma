<?php

namespace App\Observers;

use App\Models\Order;
use App\Models\OrderLog;
use Illuminate\Support\Facades\Auth;

class OrderObserver
{
    /**
     * Handle the Order "created" event.
     */
    public function created(Order $order): void
    {
        OrderLog::create([
            'order_id' => $order->id,
            'user_id' => Auth::id(),
            'old_status' => null,
            'new_status' => $order->status,
            'notes' => 'Ordem criada.',
            'metadata' => [
                'deal_id' => $order->deal_id,
                'value' => $order->value,
            ],
        ]);
    }

    /**
     * Handle the Order "updating" event.
     */
    public function updating(Order $order): void
    {
        // Armazena o status antigo para o log
        $order->_old_status = $order->getOriginal('status');
    }

    /**
     * Handle the Order "updated" event.
     */
    public function updated(Order $order): void
    {
        // Verifica se o status mudou
        $oldStatus = $order->_old_status ?? $order->getOriginal('status');
        $newStatus = $order->status;

        if ($oldStatus !== $newStatus) {
            OrderLog::create([
                'order_id' => $order->id,
                'user_id' => Auth::id(),
                'old_status' => $oldStatus,
                'new_status' => $newStatus,
                'notes' => $order->notes ?? $this->getDefaultNote($newStatus),
                'metadata' => [
                    'approved_by' => $order->approved_by,
                    'value' => $order->value,
                    'rejection_reason' => $order->rejection_reason,
                ],
            ]);
        }
    }

    /**
     * Retorna nota padrão para o status
     */
    protected function getDefaultNote(string $status): string
    {
        return match ($status) {
            'aprovado' => 'Ordem aprovada pelo administrador.',
            'rejeitado' => 'Ordem rejeitada pelo administrador.',
            'concluido' => 'Serviço executado e ordem concluída.',
            default => 'Status atualizado.',
        };
    }
}
