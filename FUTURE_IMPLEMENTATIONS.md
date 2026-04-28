# Implementacoes Futuras - ServicePro

## Gateway de Pagamento

**Status:** Planejado
**Prioridade:** Alta
**Estimativa:** A definir

### Descricao
Integrar gateway de pagamento para processar transacoes entre clientes e empresas atraves da plataforma.

### Opcoes de Gateway
1. **Mercado Pago** - Popular no Brasil, split de pagamento nativo
2. **Stripe** - Robusto, boa documentacao, suporte internacional
3. **PagSeguro** - Tradicional no Brasil
4. **Pagar.me** - Focado em marketplaces

### Funcionalidades Necessarias
- [ ] Split de pagamento (empresa recebe 90%, plataforma 10%)
- [ ] Webhook para confirmar pagamentos
- [ ] Estornos automaticos
- [ ] Relatorios financeiros reais
- [ ] Saque/transferencia para empresas
- [ ] Historico de transacoes

### Fluxo Proposto
```
Cliente conclui deal
    |
    v
Gera link de pagamento
    |
    v
Cliente paga via gateway
    |
    v
Webhook recebe confirmacao
    |
    v
Cria Transaction (type: servico)
    |
    v
Cria Transaction (type: comissao) - 10%
    |
    v
Atualiza ranking da empresa
    |
    v
Libera avaliacao para cliente
```

### Arquivos Relacionados
- `backend/app/Models/Transaction.php` - Modelo de transacao
- `backend/app/Services/FinanceService.php` - Servico financeiro
- `backend/app/Http/Controllers/TransactionController.php` - Controller
- `frontend/src/pages/finance/FinanceView.jsx` - Interface financeira

### Tabelas Existentes
- `transactions` - Ja criada, pronta para uso
- `orders` - Para vincular pagamentos a deals

### Notas
- A estrutura de dados ja esta preparada
- FinanceService ja calcula comissao de 10%
- Frontend ja tem interface completa
- Falta apenas integracao com gateway

---

## Outras Melhorias Planejadas

### Notificacoes Push
- [ ] Firebase Cloud Messaging
- [ ] Notificacoes de novas mensagens
- [ ] Alertas de deals

### Chat em Tempo Real
- [ ] WebSockets com Laravel Echo
- [ ] Indicador de digitando
- [ ] Confirmacao de leitura

### App Mobile
- [ ] React Native
- [ ] Push notifications nativas
