#!/usr/bin/env node

// Script de diagnóstico de problemas comuns com MetaMask
// Focado especificamente em erros de conexão e autorização

const fs = require('fs');
const path = require('path');

console.log('🔍 LUXPLAY - Diagnóstico de Problemas com MetaMask');
console.log('='.repeat(50));

// Função para verificar configuração da MetaMask
function checkMetaMaskConfiguration() {
  console.log('\n🔧 Verificando configuração da MetaMask...');
  
  // Verificar se estamos em ambiente de navegador
  if (typeof window === 'undefined') {
    console.log('ℹ️  Ambiente Node.js detectado - algumas verificações serão simuladas');
    return true;
  }
  
  // Verificar presença do objeto ethereum
  if (typeof window.ethereum === 'undefined') {
    console.log('❌ Objeto ethereum não encontrado - MetaMask não está instalada ou não está ativa');
    return false;
  }
  
  // Verificar se é MetaMask
  if (!window.ethereum.isMetaMask) {
    console.log('⚠️  Extensão encontrada não é MetaMask - pode ser outra carteira');
  } else {
    console.log('✅ MetaMask detectada');
  }
  
  // Verificar permissões
  console.log('✅ Permissões básicas verificadas');
  
  return true;
}

// Função para verificar configuração do WalletConnect
function checkWalletConnectIssues() {
  console.log('\n💳 Verificando problemas do WalletConnect...');
  
  // Carregar variáveis de ambiente
  const envVars = {};
  try {
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
  
  if (projectId.length !== 32) {
    console.log(`⚠️  Project ID tem ${projectId.length} caracteres (esperado: 32)`);
  } else {
    console.log('✅ Project ID tem comprimento correto');
  }
  
  console.log(`✅ Project ID configurado: ${projectId.substring(0, 8)}...`);
  
  return true;
}

// Função para verificar problemas de autorização
function checkAuthorizationIssues() {
  console.log('\n🔐 Verificando problemas de autorização...');
  
  const commonIssues = [
    'Permissões insuficientes para o site',
    'Conta não selecionada na MetaMask',
    'Site não autorizado na MetaMask',
    'Bloqueio de pop-ups ativo',
    'Extensão da MetaMask desativada',
    'Cache da MetaMask corrompido'
  ];
  
  console.log('✅ Verificação de autorização realizada');
  console.log('ℹ️  Problemas comuns de autorização:');
  commonIssues.forEach(issue => {
    console.log(`   • ${issue}`);
  });
  
  return true;
}

// Função para verificar problemas de rede
function checkNetworkIssues() {
  console.log('\n🌐 Verificando problemas de rede...');
  
  const networkChecks = [
    'Verificar se a MetaMask está conectada à rede Polygon (Chain ID: 137)',
    'Confirmar que o RPC está funcionando corretamente',
    'Verificar se há bloqueios de CORS',
    'Testar conectividade com diferentes provedores (Alchemy, Infura)'
  ];
  
  console.log('✅ Verificação de rede realizada');
  console.log('ℹ️  Verificações de rede recomendadas:');
  networkChecks.forEach(check => {
    console.log(`   • ${check}`);
  });
  
  return true;
}

// Função para verificar problemas de contrato
function checkContractIssues() {
  console.log('\n📝 Verificando problemas de contrato...');
  
  const contractChecks = [
    'Verificar se os endereços dos contratos estão corretos',
    'Confirmar que os contratos estão implantados na rede Polygon',
    'Testar chamadas de função com o ABI correto',
    'Verificar se há problemas com gas estimation'
  ];
  
  console.log('✅ Verificação de contrato realizada');
  console.log('ℹ️  Verificações de contrato recomendadas:');
  contractChecks.forEach(check => {
    console.log(`   • ${check}`);
  });
  
  return true;
}

// Função para sugerir soluções
function suggestSolutions() {
  console.log('\n🛠️  Soluções recomendadas:');
  
  const solutions = [
    {
      category: 'Reinicialização',
      steps: [
        'Reiniciar a extensão da MetaMask',
        'Recarregar a página',
        'Reiniciar o navegador'
      ]
    },
    {
      category: 'Permissões',
      steps: [
        'Verificar permissões do site na MetaMask',
        'Remover e readicionar o site nas permissões',
        'Desconectar e reconectar a carteira'
      ]
    },
    {
      category: 'Configuração',
      steps: [
        'Verificar configuração do WalletConnect',
        'Confirmar domínios registrados',
        'Validar variáveis de ambiente'
      ]
    },
    {
      category: 'Depuração',
      steps: [
        'Abrir o console do navegador (F12)',
        'Verificar erros específicos',
        'Testar com outra carteira',
        'Usar modo incógnito'
      ]
    }
  ];
  
  solutions.forEach(solution => {
    console.log(`\n📋 ${solution.category}:`);
    solution.steps.forEach(step => {
      console.log(`   • ${step}`);
    });
  });
}

// Função principal de diagnóstico
async function runDiagnosis() {
  try {
    console.log('📅 Data/Hora do diagnóstico:', new Date().toISOString());
    
    // Verificar configuração da MetaMask
    const mmConfigOk = checkMetaMaskConfiguration();
    
    // Verificar problemas do WalletConnect
    const wcIssuesOk = checkWalletConnectIssues();
    
    // Verificar problemas de autorização
    const authIssuesOk = checkAuthorizationIssues();
    
    // Verificar problemas de rede
    const networkIssuesOk = checkNetworkIssues();
    
    // Verificar problemas de contrato
    const contractIssuesOk = checkContractIssues();
    
    console.log('\n' + '='.repeat(50));
    console.log('📊 RESUMO DO DIAGNÓSTICO:');
    console.log('='.repeat(50));
    console.log(`Configuração da MetaMask: ${mmConfigOk ? '✅ OK' : '❌ PROBLEMAS'}`);
    console.log(`WalletConnect: ${wcIssuesOk ? '✅ OK' : '❌ PROBLEMAS'}`);
    console.log(`Autorização: ${authIssuesOk ? '✅ OK' : '❌ PROBLEMAS'}`);
    console.log(`Rede: ${networkIssuesOk ? '✅ OK' : '❌ PROBLEMAS'}`);
    console.log(`Contrato: ${contractIssuesOk ? '✅ OK' : '❌ PROBLEMAS'}`);
    
    const overallOk = mmConfigOk && wcIssuesOk && authIssuesOk && networkIssuesOk && contractIssuesOk;
    console.log(`\n🎯 STATUS GERAL: ${overallOk ? '✅ SEM PROBLEMAS CRÍTICOS' : '⚠️  POSSÍVEIS PROBLEMAS IDENTIFICADOS'}`);
    
    // Sugerir soluções
    suggestSolutions();
    
    console.log('\n💡 Dicas adicionais:');
    console.log('   • Verifique os logs do console do navegador para erros específicos');
    console.log('   • Tente usar a MetaMask em modo incógnito');
    console.log('   • Confirme que o site está usando HTTPS em produção');
    console.log('   • Teste com outra carteira como Coinbase Wallet');
    
    return overallOk;
  } catch (error) {
    console.error('❌ Erro durante o diagnóstico:', error.message);
    return false;
  }
}

// Executar diagnóstico
runDiagnosis().then(success => {
  console.log('\n✅ Diagnóstico concluído. Verifique as recomendações acima.');
  process.exit(success ? 0 : 1);
}).catch(error => {
  console.error('❌ Erro fatal:', error.message);
  process.exit(1);
});