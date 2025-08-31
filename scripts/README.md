# Scripts de Desenvolvimento e Teste

Este diretório contém scripts úteis para verificar e testar a configuração do projeto antes de executá-lo.

## Scripts Disponíveis

### `npm run dev` (Padrão)
Executa a verificação prévia e inicia o servidor de desenvolvimento:
```bash
npm run dev
```

### `npm run dev:quick`
Inicia o servidor de desenvolvimento sem verificações:
```bash
npm run dev:quick
```

### `npm run preflight`
Executa apenas a verificação prévia:
```bash
npm run preflight
```

### `npm run env-check`
Verifica variáveis de ambiente e configurações:
```bash
npm run env-check
```

### `npm run wallet-test`
Testa configuração de carteiras:
```bash
npm run wallet-test
```

### `npm run full-test`
Executa todos os testes em sequência:
```bash
npm run full-test
```

## O que cada script verifica

### Verificação Prévia (`preflight`)
- Carrega variáveis de ambiente
- Verifica variáveis obrigatórias
- Testa conexão RPC
- Verifica implantação dos contratos
- Testa configuração do WalletConnect

### Verificação de Ambiente (`env-check`)
- Valida formato das variáveis
- Verifica endereços Ethereum
- Testa URL do RPC
- Valida Project ID do WalletConnect
- Confirma domínios permitidos

### Teste de Carteiras (`wallet-test`)
- Simula detecção de carteiras
- Verifica configuração do WalletConnect
- Testa permissões de domínio

## Quando usar cada script

1. **Durante o desenvolvimento diário**: Use `npm run dev` para verificações automáticas
2. **Quando encontrar problemas de conexão**: Use `npm run wallet-test` e `npm run env-check`
3. **Antes de fazer deploy**: Use `npm run full-test` para verificação completa
4. **Para desenvolvimento rápido**: Use `npm run dev:quick` para pular verificações

## Solução de Problemas

Se os scripts relataram problemas:

1. **Verifique o arquivo `.env.local`**:
   - Confirme que todas as variáveis estão presentes
   - Verifique se não há erros de digitação
   - Certifique-se de que as aspas estão balanceadas

2. **Problemas com WalletConnect**:
   - Verifique o Project ID no dashboard do WalletConnect
   - Confirme que os domínios estão registrados corretamente
   - Tente criar um novo Project ID

3. **Problemas com RPC**:
   - Teste a URL do RPC em um cliente como curl
   - Verifique se há restrições de CORS
   - Tente usar um provedor diferente (Infura, QuickNode)

4. **Problemas com contratos**:
   - Confirme que os endereços estão corretos
   - Verifique se os contratos estão implantados
   - Teste as funções dos contratos com uma ferramenta como Remix