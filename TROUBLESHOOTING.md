# Problemas Conhecidos e Soluções

## 1. Problemas de Conexão com MetaMask

### Sintoma: "MetaMask: Lost connection to 'MetaMask'""
**Causas Possíveis:**
- Extensão da MetaMask com cache corrompido
- Permissões insuficientes para o site
- Bloqueio de pop-ups ativo
- Conflitos com outras extensões de carteira

**Soluções:**
1. Reiniciar a extensão da MetaMask:
   - Clique com botão direito na extensão
   - Escolha "Gerenciar extensão"
   - Clique em "Recarregar"

2. Limpar cache da MetaMask:
   - Nas configurações da MetaMask
   - "Avançado" → "Redefinir conta"

3. Verificar permissões do site:
   - Abrir MetaMask
   - "Conectado aos sites" → Remover e reconectar

### Sintoma: Erro 4100 - "The requested account and/or method has not been authorized"
**Causas Possíveis:**
- Conta não selecionada na MetaMask
- Site não autorizado na MetaMask
- Problemas de autorização do WalletConnect

**Soluções:**
1. Verificar conta selecionada:
   - Abrir MetaMask
   - Confirmar que a conta correta está selecionada

2. Reautorizar o site:
   - Nas configurações da MetaMask
   - "Conectado aos sites" → Remover site
   - Reconectar no aplicativo

3. Verificar configuração do WalletConnect:
   - Confirmar Project ID correto
   - Verificar domínios registrados

## 2. Problemas de Registro de Sponsor

### Sintoma: Loop infinito após autorizar transação
**Causas Possíveis:**
- Problemas com ABI do contrato
- Endereço de sponsor inválido
- Problemas de estado da aplicação

**Soluções:**
1. Verificar ABI do contrato:
   ```bash
   npm run env-check
   ```

2. Validar endereço de sponsor:
   - Confirmar formato válido (0x + 40 caracteres hexadecimais)
   - Verificar se o endereço está registrado na blockchain

3. Resetar estado da aplicação:
   - Limpar localStorage
   - Recarregar página

## 3. Problemas de Conectividade RPC

### Sintoma: "Failed to fetch" ou timeouts
**Causas Possíveis:**
- URL do RPC incorreta
- Problemas de conectividade de rede
- Limites de taxa da API

**Soluções:**
1. Verificar URL do RPC:
   ```bash
   npm run preflight
   ```

2. Testar com provedor alternativo:
   - Infura
   - QuickNode
   - Moralis

3. Verificar limites de API:
   - Confirmar chave de API válida
   - Verificar limites de requisições

## 4. Problemas de Contrato

### Sintoma: Funções não retornando valores esperados
**Causas Possíveis:**
- Endereços de contrato incorretos
- Contratos não implantados na rede
- Problemas com ABI

**Soluções:**
1. Verificar endereços de contrato:
   ```bash
   npm run env-check
   ```

2. Confirmar implantação:
   - Verificar no explorador de blocos
   - Testar funções com Remix

3. Validar ABI:
   - Confirmar compatibilidade com contrato implantado
   - Verificar versão do compilador

## 5. Problemas de Dependências

### Sintoma: Erros de compilação ou runtime
**Causas Possíveis:**
- Versões incompatíveis de dependências
- Conflitos de peer dependencies
- Pacotes desatualizados

**Soluções:**
1. Verificar atualizações:
   ```bash
   npm run dep-check
   ```

2. Atualizar dependências:
   ```bash
   npm update
   ```

3. Resolver conflitos:
   ```bash
   npm install --legacy-peer-deps
   ```

## Ferramentas de Diagnóstico

### Scripts Disponíveis
```bash
# Diagnóstico completo
npm run full-test

# Diagnóstico específico da MetaMask
npm run metamask-diag

# Verificação de ambiente
npm run env-check

# Teste de carteiras
npm run wallet-test
```

### Monitoramento em Tempo de Execução
- Console do navegador (F12)
- Logs da MetaMask
- Monitor de rede
- React DevTools

## Prevenção de Problemas

### Boas Práticas
1. Executar verificações antes do desenvolvimento:
   ```bash
   npm run preflight
   ```

2. Manter dependências atualizadas:
   ```bash
   npm run dep-check
   ```

3. Testar em múltiplos navegadores e carteiras

4. Verificar logs detalhados após cada atualização significativa

### Checklist de Verificação
- [ ] Variáveis de ambiente configuradas corretamente
- [ ] WalletConnect Project ID válido
- [ ] Domínios registrados no dashboard
- [ ] Endereços de contrato corretos
- [ ] Conexão RPC funcionando
- [ ] Extensão da MetaMask atualizada
- [ ] Dependências atualizadas
- [ ] Testes passando