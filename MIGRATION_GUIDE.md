# Guia de Migração e Novas Funcionalidades

## Novos Scripts de Desenvolvimento

### 1. Scripts de Diagnóstico Automatizados
Foram adicionados 6 novos scripts para facilitar o desenvolvimento e diagnóstico de problemas:

```bash
# Verificação e diagnóstico
npm run preflight     # Verificação prévia automática
npm run env-check      # Verificação detalhada de ambiente
npm run wallet-test    # Teste de configuração de carteiras
npm run metamask-diag  # Diagnóstico específico da MetaMask
npm run dep-check      # Verificação de dependências
npm run full-test      # Teste completo do sistema
```

### 2. Comandos de Desenvolvimento Aprimorados
```bash
# Desenvolvimento com verificações automáticas
npm run dev           # Executa preflight-check.js antes de iniciar

# Desenvolvimento rápido (sem verificações)
npm run dev:quick     # Inicia diretamente o servidor
```

## Atualizações de Dependências

### Dependências Críticas Atualizadas
Todas as dependências principais foram atualizadas para suas versões mais recentes:

- **viem**: 2.34.0 → 2.36.0
- **wagmi**: 2.16.4 → 2.16.9
- **@wagmi/core**: 2.19.0 → 2.20.3
- **@wagmi/connectors**: 5.9.4 → 5.9.9
- **react**: 19.1.0 → 19.1.1
- **react-dom**: 19.1.0 → 19.1.1
- **next**: 15.5.0 → 15.5.2
- **@types/react**: 19.1.11 → 19.1.12
- **@types/react-dom**: 19.1.7 → 19.1.9
- **@types/node**: 20.19.11 → 24.3.0
- **lucide-react**: 0.400.0 → 0.542.0

### Benefícios das Atualizações
- Correção de bugs conhecidos
- Melhorias de performance
- Compatibilidade com as últimas versões dos navegadores
- Segurança aprimorada

## Estrutura de Scripts

### Localização
```
/scripts/
  ├── preflight-check.js          # Verificação prévia de ambiente
  ├── environment-check.js       # Verificação detalhada de variáveis
  ├── wallet-test.js              # Teste de configuração de carteiras
  ├── metamask-diagnosis.js       # Diagnóstico específico da MetaMask
  ├── dependency-check.js          # Verificação de atualizações
  ├── full-test.js                # Execução de todos os testes
  ├── README.md                   # Documentação dos scripts
  ├── USAGE_GUIDE.md              # Guia de uso detalhado
  └── TROUBLESHOOTING.md          # Solução de problemas
```

## Novas Funcionalidades de Diagnóstico

### 1. Verificação Automática de Ambiente
Antes de iniciar o servidor de desenvolvimento, o sistema agora verifica automaticamente:

- Variáveis de ambiente configuradas corretamente
- Conectividade com RPC
- Implantação dos contratos
- Configuração do WalletConnect

### 2. Diagnóstico Específico de Problemas
Scripts especializados para diagnosticar problemas comuns:

- **MetaMask**: Conexão perdida, erros de autorização
- **WalletConnect**: Configuração de Project ID, domínios registrados
- **Contratos**: Endereços válidos, funções disponíveis
- **Dependências**: Versões desatualizadas, conflitos

### 3. Monitoramento de Atualizações
O script `dep-check` verifica automaticamente se há versões mais recentes das dependências críticas, identificando:

- Atualizações patch disponíveis
- Atualizações minor disponíveis
- Atualizações major (possíveis breaking changes)

## Melhorias na Experiência do Desenvolvedor

### 1. Feedback Imediato
- Mensagens claras de sucesso/erro
- Indicadores visuais de progresso
- Recomendações específicas para resolver problemas

### 2. Documentação Integrada
- READMEs detalhados para cada script
- Guia de uso prático
- Soluções para problemas conhecidos

### 3. Compatibilidade
- Funciona em ambientes Windows, macOS e Linux
- Integração nativa com npm scripts
- Sem dependências externas adicionais

## Como Usar os Novos Recursos

### Durante o Desenvolvimento Diário
```bash
# Iniciar trabalho diário (com verificações automáticas)
npm run dev

# Se precisar iniciar rapidamente (sem verificações)
npm run dev:quick
```

### Quando Enfrentar Problemas
```bash
# Diagnóstico específico para MetaMask
npm run metamask-diag

# Verificação completa do ambiente
npm run full-test
```

### Manutenção Regular
```bash
# Verificar atualizações de dependências
npm run dep-check

# Verificação detalhada de ambiente
npm run env-check
```

## Benefícios Esperados

1. **Redução do tempo de diagnóstico**: De horas para minutos
2. **Prevenção de erros**: Identificação proativa de problemas
3. **Consistência**: Verificações padronizadas em todos os ambientes
4. **Documentação viva**: Scripts autoexplicativos e documentados
5. **Manutenibilidade**: Facilidade de atualização e expansão

Essas melhorias tornam o processo de desenvolvimento mais robusto e reduzem significativamente o tempo gasto com diagnóstico de problemas de configuração e conectividade.