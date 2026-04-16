<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class SanitizeMessage
{
    /**
     * Sanitiza mensagens removendo dados pessoais.
     * Este middleware pode ser usado em rotas de mensagem.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $response = $next($request);

        // Se for uma resposta JSON com mensagens, sanitiza
        if ($response->headers->get('Content-Type') === 'application/json') {
            $content = json_decode($response->getContent(), true);

            if (isset($content['data']['messages'])) {
                $content['data']['messages'] = array_map(
                    [$this, 'sanitizeMessageContent'],
                    $content['data']['messages']
                );
                $response->setContent(json_encode($content));
            }
        }

        return $response;
    }

    /**
     * Sanitiza o conteúdo de uma mensagem
     */
    protected function sanitizeMessageContent(array $message): array
    {
        if (isset($message['content'])) {
            $message['content'] = $this->sanitize($message['content']);
        }
        return $message;
    }

    /**
     * Remove dados pessoais do texto
     */
    protected function sanitize(string $content): string
    {
        // Remove CPF
        $content = preg_replace('/\d{3}\.\d{3}\.\d{3}-\d{2}/', '[CPF OCULTO]', $content);

        // Remove CNPJ
        $content = preg_replace('/\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}/', '[CNPJ OCULTO]', $content);

        // Remove telefones
        $content = preg_replace('/\(?\d{2}\)?\s*\d{4,5}[-.\s]?\d{4}/', '[TELEFONE OCULTO]', $content);

        // Remove emails
        $content = preg_replace('/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/', '[EMAIL OCULTO]', $content);

        return $content;
    }
}
