<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class NewDeviceLoginNotification extends Notification
{
    use Queueable;

    protected string $ip;
    protected ?string $device;
    protected ?string $location;
    protected string $loginTime;

    public function __construct(string $ip, ?string $device, ?string $location)
    {
        $this->ip = $ip;
        $this->device = $device;
        $this->location = $location;
        $this->loginTime = now()->format('d/m/Y H:i:s');
    }

    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $deviceInfo = $this->device ? $this->parseUserAgent($this->device) : 'Dispositivo desconhecido';

        return (new MailMessage)
            ->subject('Novo login detectado - ServicePro')
            ->greeting('Ola, ' . $notifiable->name . '!')
            ->line('Detectamos um novo login em sua conta.')
            ->line('**Detalhes do acesso:**')
            ->line('- Data/Hora: ' . $this->loginTime)
            ->line('- Endereco IP: ' . $this->ip)
            ->line('- Dispositivo: ' . $deviceInfo)
            ->line('- Localizacao: ' . ($this->location ?? 'Nao identificada'))
            ->line('Se voce reconhece este acesso, nenhuma acao e necessaria.')
            ->line('Se NAO foi voce, recomendamos:')
            ->action('Alterar sua senha', url('/settings'))
            ->line('1. Altere sua senha imediatamente')
            ->line('2. Ative a autenticacao de dois fatores')
            ->line('3. Revogue todas as sessoes ativas')
            ->salutation('Equipe ServicePro');
    }

    private function parseUserAgent(?string $userAgent): string
    {
        if (!$userAgent) return 'Desconhecido';

        $browser = 'Navegador desconhecido';
        $os = 'SO desconhecido';

        // Detect browser
        if (str_contains($userAgent, 'Chrome')) $browser = 'Chrome';
        elseif (str_contains($userAgent, 'Firefox')) $browser = 'Firefox';
        elseif (str_contains($userAgent, 'Safari')) $browser = 'Safari';
        elseif (str_contains($userAgent, 'Edge')) $browser = 'Edge';
        elseif (str_contains($userAgent, 'Opera')) $browser = 'Opera';

        // Detect OS
        if (str_contains($userAgent, 'Windows')) $os = 'Windows';
        elseif (str_contains($userAgent, 'Mac')) $os = 'MacOS';
        elseif (str_contains($userAgent, 'Linux')) $os = 'Linux';
        elseif (str_contains($userAgent, 'Android')) $os = 'Android';
        elseif (str_contains($userAgent, 'iPhone') || str_contains($userAgent, 'iPad')) $os = 'iOS';

        return "$browser em $os";
    }

    public function toArray(object $notifiable): array
    {
        return [
            'ip' => $this->ip,
            'device' => $this->device,
            'location' => $this->location,
            'login_time' => $this->loginTime,
        ];
    }
}
