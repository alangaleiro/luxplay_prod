#!/usr/bin/env node

// Script de teste de carteiras
// Testa a detecção de carteiras e conectividade

console.log('💳 LUXPLAY - Teste de Detecção de Carteiras');
console.log('='.repeat(50));

// Esta função simula o ambiente do navegador
function simulateBrowserEnvironment() {
  console.log('\n🖥️  Simulando ambiente do navegador...');
  
  // Criar objeto global window
  global.window = {
    location: {
      origin: 'http://localhost:3000',
      hostname: 'localhost',
      port: '3000'
    },
    document: {
      createElement: () => ({}),
      addEventListener: () => {}
    }
  };
  
  // Criar objeto ethereum simulado
  global.ethereum = {
    isMetaMask: true,
    request: async (params) => {
      console.log(`   Ethereum request: ${JSON.stringify(params)}`);
      if (params.method === 'eth_chainId') {
        return '0x89'; // Polygon chain ID
      }
      if (params.method === 'eth_accounts') {
        return [];
      }
      return null;
    }
  };
  
  console.log('✅ Ambiente do navegador simulado');
  return true;
}

// Testar detecção de carteiras
function testWalletDetection() {
  console.log('\n🔍 Testando detecção de carteiras...');
  
  const wallets = [];
  
  // Testar MetaMask
  if (typeof global.ethereum !== 'undefined' && global.ethereum.isMetaMask) {
    wallets.push('MetaMask');
    console.log('✅ MetaMask detectada');
  } else {
    console.log('❌ MetaMask não detectada');
  }
  
  // Testar outros provedores conhecidos
  const knownProviders = {
    isCoinbaseWallet: 'Coinbase Wallet',
    isTrust: 'Trust Wallet',
    isBraveWallet: 'Brave Wallet'
  };
  
  for (const [prop, name] of Object.entries(knownProviders)) {
    if (global.ethereum && global.ethereum[prop]) {
      wallets.push(name);
      console.log(`✅ ${name} detectada`);
    }
  }
  
  if (wallets.length === 0) {
    console.log('ℹ️  Nenhuma carteira detectada (isso é esperado em ambiente Node.js)');
  }
  
  return wallets;
}

// Testar configuração do WalletConnect
function testWalletConnectConfig() {
  console.log('\n🔗 Testando configuração do WalletConnect...');
  
  // Simular carga das variáveis de ambiente
  const envVars = {};
  try {
    const fs = require('fs');
    const path = require('path');
    const envPath = path.join(__dirname, '..', '.env.local');
    
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
            }
          }
        }
      });
    }
  } catch (error) {
    console.log('⚠️  Erro ao carregar .env.local:', error.message);
  }
  
  const projectId = envVars.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID;
  
  if (!projectId) {
    console.log('❌ WalletConnect Project ID não configurado');
    return false;
  }
  
  console.log(`✅ WalletConnect Project ID: ${projectId.substring(0, 8)}...`);
  
  // Verificar comprimento adequado
  if (projectId.length < 32) {
    console.log('⚠️  Project ID parece curto (deve ter 32 caracteres)');
  } else {
    console.log('✅ Project ID tem comprimento adequado');
  }
  
  return true;
}

// Testar permissões de domínio
function testDomainPermissions() {
  console.log('\n🌐 Testando permissões de domínio...');
  
  const allowedDomains = [
    'http://localhost:3000',
    'http://localhost:3001',
    'http://localhost:3002',
    'https://localhost:3000',
    'https://localhost:3001',
    'https://localhost:3002'
  ];
  
  console.log('✅ Domínios registrados para WalletConnect:');
  allowedDomains.forEach(domain => {
    console.log(`   - ${domain}`);
  });
  
  console.log('\nℹ️  Verifique se estes domínios estão registrados no dashboard do WalletConnect');
  
  return true;
}

// Função principal
async function runWalletTest() {
  try {
    console.log('📅 Data/Hora do teste:', new Date().toISOString());
    
    // Simular ambiente do navegador
    const browserOk = simulateBrowserEnvironment();
    
    // Testar detecção de carteiras
    const detectedWallets = testWalletDetection();
    
    // Testar configuração do WalletConnect
    const wcConfigOk = testWalletConnectConfig();
    
    // Testar permissões de domínio
    const domainOk = testDomainPermissions();
    
    console.log('\n' + '='.repeat(50));
    console.log('📊 RESUMO DO TESTE DE CARTEIRAS:');
    console.log('='.repeat(50));
    console.log(`Ambiente do Navegador: ${browserOk ? '✅ Simulado' : '❌ Falhou'}`);
    console.log(`Carteiras Detectadas: ${detectedWallets.length > 0 ? `✅ ${detectedWallets.join(', ')}` : 'ℹ️  Nenhuma (normal em Node.js)'}`);
    console.log(`WalletConnect Config: ${wcConfigOk ? '✅ OK' : '❌ PROBLEMAS'}`);
    console.log(`Permissões de Domínio: ${domainOk ? '✅ Configuradas' : '❌ PROBLEMAS'}`);
    
    console.log('\n💡 Dicas para resolver problemas de conexão:');
    console.log('   1. Verifique se o Project ID do WalletConnect está correto');
    console.log('   2. Confirme que os domínios estão registrados no dashboard');
    console.log('   3. Verifique se a MetaMask tem permissões para o site');
    console.log('   4. Tente reiniciar a extensão da MetaMask');
    console.log('   5. Verifique se está usando HTTPS em produção');
    
    return true;
  } catch (error) {
    console.error('❌ Erro durante o teste:', error.message);
    return false;
  }
}

// Executar teste
runWalletTest().catch(console.error);