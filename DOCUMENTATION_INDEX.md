# Índice de Documentação do Sistema

## Documentos Técnicos

### 1. Scripts de Desenvolvimento
- [`scripts/README.md`](scripts/README.md) - Documentação dos scripts de desenvolvimento
- [`scripts/USAGE_GUIDE.md`](scripts/USAGE_GUIDE.md) - Guia de uso detalhado dos scripts
- [`SCRIPTS_QUICK_REF.md`](SCRIPTS_QUICK_REF.md) - Referência rápida dos comandos

### 2. Atualizações e Migrações
- [`UPDATE_SUMMARY.md`](UPDATE_SUMMARY.md) - Resumo completo das atualizações realizadas
- [`RESUMO_PORTUGUES.md`](RESUMO_PORTUGUES.md) - Resumo em português das atualizações
- [`MIGRATION_GUIDE.md`](MIGRATION_GUIDE.md) - Guia detalhado de migração e novas funcionalidades

### 3. Solução de Problemas
- [`TROUBLESHOOTING.md`](TROUBLESHOOTING.md) - Guia completo de solução de problemas conhecidos
- [`scripts/metamask-diagnosis.js`](scripts/metamask-diagnosis.js) - Script de diagnóstico específico da MetaMask

### 4. Verificações e Testes
- [`scripts/preflight-check.js`](scripts/preflight-check.js) - Script de verificação prévia automática
- [`scripts/environment-check.js`](scripts/environment-check.js) - Script de verificação detalhada de ambiente
- [`scripts/wallet-test.js`](scripts/wallet-test.js) - Script de teste de configuração de carteiras
- [`scripts/dependency-check.js`](scripts/dependency-check.js) - Script de verificação de atualizações de dependências
- [`scripts/full-test.js`](scripts/full-test.js) - Script de execução completa de todos os testes

## Comandos npm Disponíveis

### Desenvolvimento
```bash
npm run dev          # Desenvolvimento com verificações automáticas
npm run dev:quick    # Desenvolvimento rápido (sem verificações)
npm run build        # Build para produção
npm run start        # Iniciar servidor de produção
npm run lint         # Lint do código
```

### Diagnóstico e Verificação
```bash
npm run preflight    # Verificação prévia de ambiente
npm run env-check    # Verificação detalhada de ambiente
npm run wallet-test  # Teste de configuração de carteiras
npm run metamask-diag # Diagnóstico específico da MetaMask
npm run dep-check    # Verificação de atualizações de dependências
npm run full-test    # Teste completo do sistema
```

## Estrutura de Arquivos Criados

```
├── UPDATE_SUMMARY.md          # Resumo completo das atualizações (Inglês)
├── RESUMO_PORTUGUES.md        # Resumo das atualizações (Português)
├── MIGRATION_GUIDE.md        # Guia de migração e novas funcionalidades
├── TROUBLESHOOTING.md         # Solução de problemas conhecidos
├── SCRIPTS_QUICK_REF.md       # Referência rápida dos comandos
├── scripts/
│   ├── README.md              # Documentação dos scripts
│   ├── USAGE_GUIDE.md         # Guia de uso detalhado
│   ├── preflight-check.js     # Verificação prévia automática
│   ├── environment-check.js   # Verificação detalhada de ambiente
│   ├── wallet-test.js         # Teste de configuração de carteiras
│   ├── metamask-diagnosis.js   # Diagnóstico específico da MetaMask
│   ├── dependency-check.js     # Verificação de atualizações
│   ├── full-test.js           # Execução completa de todos os testes
```

## Problemas Conhecidos e Soluções

### Problemas de Conexão com MetaMask
- **Sintoma**: "MetaMask: Lost connection to 'MetaMask'"
- **Solução**: Reiniciar extensão, limpar cache, verificar permissões
- **Script de Diagnóstico**: `npm run metamask-diag`

### Erros de Autorização (Código 4100)
- **Sintoma**: "The requested account and/or method has not been authorized"
- **Solução**: Reautorizar site na MetaMask, verificar conta selecionada
- **Script de Diagnóstico**: `npm run wallet-test`

### Problemas de Configuração do WalletConnect
- **Sintoma**: Project ID inválido ou domínios não registrados
- **Solução**: Verificar dashboard do WalletConnect
- **Script de Diagnóstico**: `npm run env-check`

## Recomendações de Uso

### Durante o Desenvolvimento Diário
1. Use `npm run dev` para verificações automáticas antes do desenvolvimento
2. Se encontrar problemas de conexão, execute `npm run metamask-diag`
3. Para verificar ambiente completo, use `npm run full-test`

### Antes de Commits Significativos
1. Execute `npm run dep-check` para verificar atualizações de dependências
2. Faça `npm run preflight` para garantir ambiente configurado corretamente
3. Teste com `npm run full-test` para verificar integridade completa

### Manutenção Regular
1. Semanalmente, execute `npm run dep-check` para verificar atualizações
2. Mensalmente, faça `npm run full-test` para diagnóstico completo
3. Após atualizações do sistema, execute `npm run preflight`

Esta estrutura de documentação fornece todas as ferramentas necessárias para desenvolver, diagnosticar problemas e manter o sistema de forma eficiente.