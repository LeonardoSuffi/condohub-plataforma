<?php

/**
 * Configuracoes de seguranca da aplicacao
 * Centraliza valores que antes estavam hardcoded
 */
return [
    /*
    |--------------------------------------------------------------------------
    | Autenticacao e Sessao
    |--------------------------------------------------------------------------
    */
    'session' => [
        // Duracao da sessao em minutos (timeout absoluto)
        'duration_minutes' => env('SESSION_DURATION_MINUTES', 120),

        // Timeout por inatividade em minutos
        'inactivity_timeout_minutes' => env('INACTIVITY_TIMEOUT_MINUTES', 30),
    ],

    /*
    |--------------------------------------------------------------------------
    | Protecao contra Brute Force
    |--------------------------------------------------------------------------
    */
    'login' => [
        // Maximo de tentativas antes de bloquear
        'max_failed_attempts' => env('LOGIN_MAX_FAILED_ATTEMPTS', 5),

        // Duracao do bloqueio em minutos
        'block_duration_minutes' => env('LOGIN_BLOCK_DURATION_MINUTES', 30),

        // Tentativas antes de exigir CAPTCHA
        'captcha_threshold' => env('LOGIN_CAPTCHA_THRESHOLD', 3),
    ],

    /*
    |--------------------------------------------------------------------------
    | Politica de Senha
    |--------------------------------------------------------------------------
    */
    'password' => [
        // Tamanho minimo
        'min_length' => 8,

        // Regex para validacao de complexidade
        // Requer: 1 maiuscula, 1 minuscula, 1 numero, 1 especial
        'complexity_regex' => '/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).+$/',

        // Mensagem de erro para regex
        'complexity_message' => 'A senha deve conter pelo menos: 1 letra maiuscula, 1 minuscula, 1 numero e 1 caractere especial.',

        // Quantidade de senhas anteriores a verificar
        'history_count' => 5,
    ],

    /*
    |--------------------------------------------------------------------------
    | Rate Limiting
    |--------------------------------------------------------------------------
    */
    'rate_limits' => [
        // Requisicoes de autenticacao por minuto
        'auth' => env('RATE_LIMIT_AUTH', 5),

        // Requisicoes gerais de admin por minuto
        'admin' => env('RATE_LIMIT_ADMIN', 100),

        // Acoes criticas de admin por minuto
        'admin_critical' => env('RATE_LIMIT_ADMIN_CRITICAL', 10),

        // Exports por hora
        'admin_export' => env('RATE_LIMIT_ADMIN_EXPORT', 5),

        // API geral por minuto
        'api' => env('RATE_LIMIT_API', 60),
    ],

    /*
    |--------------------------------------------------------------------------
    | Paginacao
    |--------------------------------------------------------------------------
    */
    'pagination' => [
        // Limite maximo de itens por pagina
        'max_per_page' => 100,

        // Padrao de itens por pagina
        'default_per_page' => 15,
    ],

    /*
    |--------------------------------------------------------------------------
    | Upload de Arquivos
    |--------------------------------------------------------------------------
    */
    'uploads' => [
        // Tamanho maximo de imagem em KB
        'max_image_size' => 5120, // 5MB

        // Tamanho maximo de logo em KB
        'max_logo_size' => 2048, // 2MB

        // Extensoes de imagem permitidas
        'allowed_image_extensions' => ['jpeg', 'png', 'jpg', 'webp'],
    ],

    /*
    |--------------------------------------------------------------------------
    | Limites de Arrays
    |--------------------------------------------------------------------------
    */
    'limits' => [
        // Maximo de tags por servico
        'max_tags' => 20,

        // Maximo de itens em reorder
        'max_reorder_items' => 100,

        // Maximo de imagens por servico
        'max_service_images' => 10,

        // Maximo de itens de portfolio
        'max_portfolio_items' => 50,
    ],

    /*
    |--------------------------------------------------------------------------
    | Cache
    |--------------------------------------------------------------------------
    */
    'cache' => [
        // TTL das settings publicas em segundos
        'public_settings_ttl' => env('PUBLIC_SETTINGS_CACHE_TTL', 300), // 5 min
    ],

    /*
    |--------------------------------------------------------------------------
    | Validacao
    |--------------------------------------------------------------------------
    */
    'validation' => [
        // Estados brasileiros validos
        'estados' => [
            'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO',
            'MA', 'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI',
            'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO',
        ],

        // Regex para telefone brasileiro
        'phone_regex' => '/^\(?[1-9]{2}\)?\s?(?:9\d{4}|\d{4})-?\d{4}$/',

        // Temas disponiveis
        'themes' => ['blue', 'green', 'purple', 'orange', 'teal', 'rose', 'slate', 'indigo'],
    ],

    /*
    |--------------------------------------------------------------------------
    | Datas
    |--------------------------------------------------------------------------
    */
    'dates' => [
        // Data minima para filtros (evita datas muito antigas)
        'min_filter_date' => '2020-01-01',

        // Maximo de dias no futuro para filtros
        'max_future_days' => 365,
    ],
];
