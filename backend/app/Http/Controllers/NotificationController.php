<?php

namespace App\Http\Controllers;

use App\Models\Notification;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    /**
     * Lista notificacoes do usuario
     */
    public function index(Request $request)
    {
        $user = $request->user();

        $notifications = Notification::where('user_id', $user->id)
            ->orderByDesc('created_at')
            ->paginate(20);

        $unreadCount = Notification::where('user_id', $user->id)
            ->unread()
            ->count();

        return $this->success([
            'notifications' => $notifications,
            'unread_count' => $unreadCount,
        ], 'Lista de notificacoes');
    }

    /**
     * Retorna contagem de notificacoes nao lidas
     */
    public function unreadCount(Request $request)
    {
        $user = $request->user();

        $count = Notification::where('user_id', $user->id)
            ->unread()
            ->count();

        return $this->success(['count' => $count], 'Contagem de nao lidas');
    }

    /**
     * Marca notificacao como lida
     */
    public function markAsRead(Request $request, $id)
    {
        $user = $request->user();

        $notification = Notification::where('user_id', $user->id)
            ->where('id', $id)
            ->firstOrFail();

        $notification->markAsRead();

        return $this->success($notification, 'Notificacao marcada como lida');
    }

    /**
     * Marca todas as notificacoes como lidas
     */
    public function markAllAsRead(Request $request)
    {
        $user = $request->user();

        Notification::where('user_id', $user->id)
            ->unread()
            ->update(['read_at' => now()]);

        return $this->success(null, 'Todas as notificacoes foram marcadas como lidas');
    }

    /**
     * Exclui uma notificacao
     */
    public function destroy(Request $request, $id)
    {
        $user = $request->user();

        $notification = Notification::where('user_id', $user->id)
            ->where('id', $id)
            ->firstOrFail();

        $notification->delete();

        return $this->success(null, 'Notificacao excluida');
    }

    /**
     * Exclui todas as notificacoes lidas
     */
    public function clearRead(Request $request)
    {
        $user = $request->user();

        Notification::where('user_id', $user->id)
            ->read()
            ->delete();

        return $this->success(null, 'Notificacoes lidas foram excluidas');
    }
}
