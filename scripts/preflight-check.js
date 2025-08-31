#!/usr/bin/env node

// Script de verificação prévia (Preflight Check)
// Executado antes de iniciar o servidor de desenvolvimento

const { createPublicClient, http } = require('viem');
const { polygon } = require('viem/chains');
const fs = require('fs');
const path = require('path');

console.log('🔍 LUXPLAY - Verificação Prévia de Conexões');
console.log('='.repeat(50));

// Carregar variáveis de ambiente
function loadEnvVariables() {
  console.log('\n📋 Carregando Variáveis de Ambiente...');
  
  const envPath = path.join(__dirname, '..', '.env.local');
  let envVars = {};
  
  try {
    if (fs.existsSync(envPath)) {
      const envContent = fs.readFileSync(envPath, 'utf8');
      envContent.split('\n').forEach(line => {
        line = line.trim();
        if (line && !line.startsWith('#')) {
          const equalIndex = line.indexOf('=');
          if (equalIndex > 0) {
            const key = line.substring(0, equalIndex).trim();
            const value = line.substring(equalIndex + 1).trim();
            if (key.startsWith('NEXT_PUBLIC_')) {
              envVars[key] = value;
              console.log(`✅ ${key} = ${value.substring(0, 30)}${value.length > 30 ? '...' : ''}`);
            }
          }
        }
      });
    } else {
      console.log('⚠️  Arquivo .env.local não encontrado');
    }
  } catch (error) {
    console.log('❌ Erro ao carregar .env.local:', error.message);
  }
  
  return envVars;
}

// Verificar variáveis obrigatórias
function checkRequiredVariables(envVars) {
  console.log('\n🔧 Verificando Variáveis Obrigatórias...');
  
  const requiredVars = [
    'NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID',
    'NEXT_PUBLIC_RPC_URL',
    'NEXT_PUBLIC_USER_CONTRACT_ADDRESS',
    'NEXT_PUBLIC_ACTIVE_POOL_ADDRESS'
  ];
  
  let allPresent = true;
  
  requiredVars.forEach(varName => {
    if (envVars[varName]) {
      console.log(`✅ ${varName}: Configurado`);
    } else {
      console.log(`❌ ${varName}: NÃO CONFIGURADO`);
      allPresent = false;
    }
  });
  
  return allPresent;
}

// Testar conexão RPC
async function testRpcConnection(envVars) {
  console.log('\n🌐 Testando Conexão RPC...');
  
  if (!envVars.NEXT_PUBLIC_RPC_URL) {
    console.log('❌ RPC URL não configurado');
    return false;
  }
  
  try {
    const client = createPublicClient({
      chain: polygon,
      transport: http(envVars.NEXT_PUBLIC_RPC_URL)
    });
    
    // Testar conexão básica
    const blockNumber = await client.getBlockNumber();
    console.log(`✅ RPC Conectado - Bloco mais recente: ${blockNumber}`);
    
    // Testar chain ID
    const chainId = await client.getChainId();
    console.log(`✅ Chain ID: ${chainId} (Esperado: 137 para Polygon)`);
    
    return true;
  } catch (error) {
    console.log(`❌ Falha na conexão RPC: ${error.message}`);
    return false;
  }
}

// Testar contratos
async function testContractDeployments(envVars) {
  console.log('\n📝 Testando Implantação dos Contratos...');
  
  if (!envVars.NEXT_PUBLIC_RPC_URL) {
    console.log('❌ RPC URL não configurado - não é possível testar contratos');
    return false;
  }
  
  const client = createPublicClient({
    chain: polygon,
    transport: http(envVars.NEXT_PUBLIC_RPC_URL)
  });
  
  const contracts = {
    'User Contract': envVars.NEXT_PUBLIC_USER_CONTRACT_ADDRESS,
    'Active Pool': envVars.NEXT_PUBLIC_ACTIVE_POOL_ADDRESS,
    'PLAY Token': envVars.NEXT_PUBLIC_PLAY_TOKEN_ADDRESS,
    'USDT Token': envVars.NEXT_PUBLIC_USDT_TOKEN_ADDRESS
  };
  
  let allDeployed = true;
  
  for (const [name, address] of Object.entries(contracts)) {
    if (address && address !== '0x0000000000000000000000000000000000000000') {
      try {
        const code = await client.getBytecode({ address });
        const isDeployed = code && code !== '0x';
        if (isDeployed) {
          console.log(`✅ ${name}: Implantado (${address})`);
        } else {
          console.log(`❌ ${name}: NÃO IMPLANTADO (${address})`);
          allDeployed = false;
        }
      } catch (error) {
        console.log(`⚠️  ${name}: Erro ao verificar (${error.message})`);
        allDeployed = false;
      }
    } else {
      console.log(`⚠️  ${name}: Endereço não configurado`);
      allDeployed = false;
    }
  }
  
  return allDeployed;
}

// Verificar configuração do WalletConnect
function checkWalletConnectConfig(envVars) {
  console.log('\n💳 Verificando Configuração do WalletConnect...');
  
  const projectId = envVars.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID;
  
  if (!projectId) {
    console.log('❌ WalletConnect Project ID não configurado');
    return false;
  }
  
  if (projectId.length < 32) {
    console.log('⚠️  WalletConnect Project ID parece curto (deve ter 32 caracteres)');
  }
  
  console.log(`✅ WalletConnect Project ID: ${projectId.substring(0, 8)}...`);
  return true;
}

// Função principal
async function runPreflightCheck() {
  try {
    // Carregar variáveis de ambiente
    const envVars = loadEnvVariables();
    
    // Verificar variáveis obrigatórias
    const varsOk = checkRequiredVariables(envVars);
    
    // Testar conexão RPC
    const rpcOk = await testRpcConnection(envVars);
    
    // Testar implantação dos contratos
    const contractsOk = await testContractDeployments(envVars);
    
    // Verificar configuração do WalletConnect
    const walletConnectOk = checkWalletConnectConfig(envVars);
    
    console.log('\n' + '='.repeat(50));
    console.log('📊 RESUMO DA VERIFICAÇÃO:');
    console.log('='.repeat(50));
    console.log(`Variáveis de Ambiente: ${varsOk ? '✅ OK' : '❌ PROBLEMAS'}`);
    console.log(`Conexão RPC: ${rpcOk ? '✅ OK' : '❌ PROBLEMAS'}`);
    console.log(`Contratos: ${contractsOk ? '✅ OK' : '❌ PROBLEMAS'}`);
    console.log(`WalletConnect: ${walletConnectOk ? '✅ OK' : '❌ PROBLEMAS'}`);
    
    const overallOk = varsOk && rpcOk && contractsOk && walletConnectOk;
    console.log(`\n🎯 STATUS GERAL: ${overallOk ? '✅ TUDO CERTO' : '❌ PROBLEMAS ENCONTRADOS'}`);
    
    if (!overallOk) {
      console.log('\n⚠️  Recomendações:');
      if (!varsOk) console.log('   - Verifique as variáveis de ambiente no .env.local');
      if (!rpcOk) console.log('   - Verifique a URL do RPC e sua conectividade');
      if (!contractsOk) console.log('   - Verifique os endereços dos contratos');
      if (!walletConnectOk) console.log('   - Verifique o Project ID do WalletConnect');
    }
    
    console.log('\n🚀 Iniciando servidor de desenvolvimento...\n');
    
    // Retornar sucesso mesmo com problemas, mas mostrar alerta
    return true;
  } catch (error) {
    console.error('❌ Erro durante a verificação:', error.message);
    console.log('\n🚀 Iniciando servidor de desenvolvimento (ignorando erros)...');
    return true;
  }
}

// Executar verificação
runPreflightCheck().catch(console.error);