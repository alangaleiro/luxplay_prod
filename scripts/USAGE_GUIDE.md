# Guia de Uso dos Scripts de Desenvolvimento

Este documento explica como usar os scripts criados para facilitar o desenvolvimento e diagnosticar problemas.

## Scripts Disponíveis

### 1. Scripts de Verificação Automática
Estes scripts são executados automaticamente quando você inicia o servidor:

- `npm run dev` - Executa verificações antes de iniciar o servidor
- `npm run dev:quick` - Inicia o servidor sem verificações

### 2. Scripts de Diagnóstico Específico
Estes scripts ajudam a diagnosticar problemas específicos:

- `npm run preflight` - Verificação básica de ambiente
- `npm run env-check` - Verificação detalhada de variáveis de ambiente
- `npm run wallet-test` - Teste de configuração de carteiras
- `npm run metamask-diag` - Diagnóstico específico de problemas com MetaMask
- `npm run full-test` - Executa todos os testes em sequência

## Quando Usar Cada Script

### Problemas com Conexão de Carteira
```bash
# Diagnóstico específico para MetaMask
npm run metamask-diag

# Teste geral de carteiras
npm run wallet-test
```

### Problemas com Variáveis de Ambiente
```bash
# Verificação detalhada de ambiente
npm run env-check

# Verificação rápida
npm run preflight
```

### Antes de Fazer Deploy
```bash
# Teste completo do sistema
npm run full-test
```

### Durante o Desenvolvimento Diário
```bash
# Normal - com verificações automáticas
npm run dev

# Rápido - sem verificações
npm run dev:quick
```

## Solução de Problemas Comuns

### 1. "MetaMask: Lost connection" 
Execute:
```bash
npm run metamask-diag
```

Soluções recomendadas:
- Reinicie a extensão da MetaMask
- Recarregue a página
- Verifique as permissões do site na MetaMask

### 2. Erros de Autorização (código 4100)
Execute:
```bash
npm run wallet-test
```

Soluções recomendadas:
- Verifique se o Project ID do WalletConnect está correto
- Confirme que os domínios estão registrados no dashboard
- Desconecte e reconecte a carteira

### 3. Problemas com Contratos
Execute:
```bash
npm run env-check
```

Soluções recomendadas:
- Verifique se os endereços dos contratos estão corretos
- Confirme que os contratos estão implantados
- Teste as funções com Remix ou outra ferramenta

### 4. Erros de Rede/RPC
Execute:
```bash
npm run preflight
```

Soluções recomendadas:
- Verifique a URL do RPC
- Teste com um provedor diferente (Infura, QuickNode)
- Confirme que a MetaMask está na rede correta (Polygon)

## Estrutura dos Scripts

```
scripts/
├── preflight-check.js          # Verificação prévia básica
├── environment-check.js        # Verificação detalhada de ambiente
├── wallet-test.js              # Teste de configuração de carteiras
├── metamask-diagnosis.js       # Diagnóstico específico da MetaMask
├── full-test.js                # Execução de todos os testes
└── README.md                   # Este documento
```

## Personalização dos Scripts

Você pode personalizar os scripts modificando:

1. **Domínios permitidos** - Edite os arrays de domínios nos scripts
2. **Variáveis verificadas** - Adicione/remova variáveis no objeto `requiredVars`
3. **Contratos testados** - Modifique o objeto `contracts` nos testes
4. **Mensagens de erro** - Atualize as mensagens informativas

## Integração Contínua

Para ambientes de CI/CD, você pode usar:
```bash
# Executar verificações antes do build
npm run preflight && npm run build
```

## Logs e Debugging

Todos os scripts geram logs detalhados que podem ser usados para:
- Identificar problemas específicos
- Rastrear erros
- Verificar configurações

Para ver logs mais detalhados, você pode:
1. Executar os scripts individualmente
2. Verificar o console do navegador
3. Consultar os logs do terminal