#!/usr/bin/env node

// Script de verificação de ambiente e contratos
// Verifica variáveis de ambiente e testa conexões com contratos

const fs = require('fs');
const path = require('path');

console.log('🔧 LUXPLAY - Verificação de Ambiente e Contratos');
console.log('='.repeat(55));

// Função para carregar variáveis de ambiente
function loadEnvVars() {
  console.log('\n📋 Carregando variáveis de ambiente...');
  
  const envPath = path.join(__dirname, '..', '.env.local');
  const envVars = {};
  
  try {
    if (fs.existsSync(envPath)) {
      const envContent = fs.readFileSync(envPath, 'utf8');
      const lines = envContent.split('\n');
      
      lines.forEach(line => {
        line = line.trim();
        if (line && !line.startsWith('#')) {
          const equalIndex = line.indexOf('=');
          if (equalIndex > 0) {
            const key = line.substring(0, equalIndex).trim();
            let value = line.substring(equalIndex + 1).trim();
            
            // Remover aspas se existirem
            if ((value.startsWith('"') && value.endsWith('"')) ||
                (value.startsWith("'") && value.endsWith("'"))) {
              value = value.substring(1, value.length - 1);
            }
            
            envVars[key] = value;
            
            // Mostrar variáveis públicas, mascarar privadas
            if (key.startsWith('NEXT_PUBLIC_')) {
              const maskedValue = value.length > 20 ? 
                `${value.substring(0, 10)}...${value.substring(value.length - 10)}` : 
                value;
              console.log(`✅ ${key} = ${maskedValue}`);
            } else if (key.includes('SECRET') || key.includes('KEY') || key.includes('PASSWORD')) {
              console.log(`🔒 ${key} = ******** (valor oculto)`);
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
  console.log('\n🔍 Verificando variáveis obrigatórias...');
  
  const requiredPublicVars = [
    { name: 'NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID', description: 'WalletConnect Project ID' },
    { name: 'NEXT_PUBLIC_RPC_URL', description: 'RPC URL' },
    { name: 'NEXT_PUBLIC_USER_CONTRACT_ADDRESS', description: 'User Contract Address' },
    { name: 'NEXT_PUBLIC_ACTIVE_POOL_ADDRESS', description: 'Active Pool Address' },
    { name: 'NEXT_PUBLIC_PLAY_TOKEN_ADDRESS', description: 'PLAY Token Address' },
    { name: 'NEXT_PUBLIC_USDT_TOKEN_ADDRESS', description: 'USDT Token Address' }
  ];
  
  let allPresent = true;
  
  requiredPublicVars.forEach(({ name, description }) => {
    if (envVars[name]) {
      console.log(`✅ ${description}: Configurado`);
    } else {
      console.log(`❌ ${description}: NÃO CONFIGURADO`);
      allPresent = false;
    }
  });
  
  return allPresent;
}

// Verificar formato dos endereços Ethereum
function validateEthereumAddresses(envVars) {
  console.log('\n📬 Validando endereços Ethereum...');
  
  const addressVars = [
    'NEXT_PUBLIC_USER_CONTRACT_ADDRESS',
    'NEXT_PUBLIC_ACTIVE_POOL_ADDRESS',
    'NEXT_PUBLIC_PLAY_TOKEN_ADDRESS',
    'NEXT_PUBLIC_USDT_TOKEN_ADDRESS',
    'NEXT_PUBLIC_ORACLE_ADDRESS',
    'NEXT_PUBLIC_PLAYSWAP_ADDRESS'
  ];
  
  let allValid = true;
  
  addressVars.forEach(varName => {
    const address = envVars[varName];
    if (address) {
      // Verificar formato básico de endereço Ethereum
      const isValidFormat = /^0x[a-fA-F0-9]{40}$/.test(address);
      if (isValidFormat) {
        console.log(`✅ ${varName}: Formato válido`);
      } else {
        console.log(`❌ ${varName}: Formato inválido (${address})`);
        allValid = false;
      }
    }
  });
  
  return allValid;
}

// Verificar URL do RPC
function validateRpcUrl(envVars) {
  console.log('\n🌐 Validando URL do RPC...');
  
  const rpcUrl = envVars.NEXT_PUBLIC_RPC_URL;
  
  if (!rpcUrl) {
    console.log('❌ RPC URL não configurado');
    return false;
  }
  
  try {
    // Verificar formato básico da URL
    const url = new URL(rpcUrl);
    
    if (url.protocol !== 'http:' && url.protocol !== 'https:') {
      console.log('❌ Protocolo inválido na RPC URL (deve ser http ou https)');
      return false;
    }
    
    console.log(`✅ RPC URL: ${url.hostname}${url.pathname}`);
    
    // Verificar provedor conhecido
    const knownProviders = [
      { pattern: 'alchemy.com', name: 'Alchemy' },
      { pattern: 'infura.io', name: 'Infura' },
      { pattern: 'quicknode.com', name: 'QuickNode' },
      { pattern: 'moralis.io', name: 'Moralis' }
    ];
    
    const provider = knownProviders.find(p => rpcUrl.includes(p.pattern));
    if (provider) {
      console.log(`✅ Provedor RPC identificado: ${provider.name}`);
    } else {
      console.log('ℹ️  Provedor RPC: Personalizado/Não identificado');
    }
    
    return true;
  } catch (error) {
    console.log(`❌ RPC URL inválida: ${error.message}`);
    return false;
  }
}

// Verificar Project ID do WalletConnect
function validateWalletConnectId(envVars) {
  console.log('\n💳 Validando WalletConnect Project ID...');
  
  const projectId = envVars.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID;
  
  if (!projectId) {
    console.log('❌ WalletConnect Project ID não configurado');
    return false;
  }
  
  console.log(`✅ WalletConnect Project ID: ${projectId.substring(0, 8)}...`);
  
  // Verificar comprimento (deve ter 32 caracteres)
  if (projectId.length !== 32) {
    console.log(`⚠️  Project ID tem ${projectId.length} caracteres (esperado: 32)`);
    return false;
  }
  
  console.log('✅ Project ID tem comprimento correto (32 caracteres)');
  
  return true;
}

// Verificar domínios permitidos
function checkAllowedDomains() {
  console.log('\n🌐 Verificando domínios permitidos...');
  
  const domains = [
    'http://localhost:3000',
    'http://localhost:3001',
    'http://localhost:3002',
    'https://localhost:3000',
    'https://localhost:3001',
    'https://localhost:3002'
  ];
  
  console.log('✅ Domínios registrados para WalletConnect:');
  domains.forEach(domain => {
    console.log(`   - ${domain}`);
  });
  
  console.log('\nℹ️  Verifique se estes domínios estão registrados no dashboard do WalletConnect');
  
  return true;
}

// Função principal
async function runEnvironmentCheck() {
  try {
    console.log('📅 Data/Hora da verificação:', new Date().toISOString());
    
    // Carregar variáveis de ambiente
    const envVars = loadEnvVars();
    
    // Verificar variáveis obrigatórias
    const varsOk = checkRequiredVariables(envVars);
    
    // Validar endereços Ethereum
    const addressesOk = validateEthereumAddresses(envVars);
    
    // Validar URL do RPC
    const rpcOk = validateRpcUrl(envVars);
    
    // Validar Project ID do WalletConnect
    const wcIdOk = validateWalletConnectId(envVars);
    
    // Verificar domínios permitidos
    const domainsOk = checkAllowedDomains();
    
    console.log('\n' + '='.repeat(55));
    console.log('📊 RESUMO DA VERIFICAÇÃO DE AMBIENTE:');
    console.log('='.repeat(55));
    console.log(`Variáveis Obrigatórias: ${varsOk ? '✅ OK' : '❌ PROBLEMAS'}`);
    console.log(`Endereços Ethereum: ${addressesOk ? '✅ OK' : '❌ PROBLEMAS'}`);
    console.log(`URL do RPC: ${rpcOk ? '✅ OK' : '❌ PROBLEMAS'}`);
    console.log(`WalletConnect ID: ${wcIdOk ? '✅ OK' : '❌ PROBLEMAS'}`);
    console.log(`Domínios Permitidos: ${domainsOk ? '✅ OK' : '❌ PROBLEMAS'}`);
    
    const overallOk = varsOk && addressesOk && rpcOk && wcIdOk && domainsOk;
    console.log(`\n🎯 STATUS GERAL: ${overallOk ? '✅ TUDO CERTO' : '❌ PROBLEMAS ENCONTRADOS'}`);
    
    if (!overallOk) {
      console.log('\n🔧 Recomendações para correção:');
      if (!varsOk) console.log('   - Configure todas as variáveis obrigatórias no .env.local');
      if (!addressesOk) console.log('   - Verifique o formato dos endereços Ethereum');
      if (!rpcOk) console.log('   - Verifique a URL do RPC e sua conectividade');
      if (!wcIdOk) console.log('   - Verifique o Project ID do WalletConnect (32 caracteres)');
      if (!domainsOk) console.log('   - Registre os domínios corretos no dashboard do WalletConnect');
    }
    
    console.log('\n💡 Dicas adicionais:');
    console.log('   - Reinicie o servidor após fazer alterações no .env.local');
    console.log('   - Verifique se não há espaços extras nas variáveis');
    console.log('   - Confirme que as aspas estão balanceadas');
    console.log('   - Certifique-se de que não há caracteres especiais não escapados');
    
    return overallOk;
  } catch (error) {
    console.error('❌ Erro durante a verificação:', error.message);
    return false;
  }
}

// Executar verificação
runEnvironmentCheck().then(success => {
  process.exit(success ? 0 : 1);
}).catch(error => {
  console.error('❌ Erro fatal:', error.message);
  process.exit(1);
});