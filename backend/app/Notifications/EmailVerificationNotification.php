<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
use Illuminate\Support\Facades\URL;

class EmailVerificationNotification extends Notification
{
    use Queueable;

    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $verificationUrl = $this->verificationUrl($notifiable);

        return (new MailMessage)
            ->subject('Verifique seu email - ServicePro')
            ->greeting('Ola, ' . $notifiable->name . '!')
            ->line('Obrigado por se cadastrar no ServicePro.')
            ->line('Por favor, clique no botao abaixo para verificar seu endereco de email.')
            ->action('Verificar Email', $verificationUrl)
            ->line('Este link expira em 60 minutos.')
            ->line('Se voce nao criou uma conta, nenhuma acao e necessaria.')
            ->salutation('Equipe ServicePro');
    }

    protected function verificationUrl($notifiable): string
    {
        $frontendUrl = config('app.frontend_url', 'http://localhost:3000');

        $temporarySignedUrl = URL::temporarySignedRoute(
            'verification.verify',
            now()->addMinutes(60),
            [
                'id' => $notifiable->getKey(),
                'hash' => sha1($notifiable->getEmailForVerification()),
            ]
        );

        // Extract the signature and expires from the backend URL
        $parsedUrl = parse_url($temporarySignedUrl);
        parse_str($parsedUrl['query'] ?? '', $queryParams);

        // Build frontend URL with verification params
        return $frontendUrl . '/verify-email?' . http_build_query([
            'id' => $notifiable->getKey(),
            'hash' => sha1($notifiable->getEmailForVerification()),
            'expires' => $queryParams['expires'] ?? '',
            'signature' => $queryParams['signature'] ?? '',
        ]);
    }

    public function toArray(object $notifiable): array
    {
        return [];
    }
}
