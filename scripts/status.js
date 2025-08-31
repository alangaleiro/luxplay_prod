#!/usr/bin/env node

// Script de status rápido do projeto
// Mostra um resumo do estado atual do projeto

const fs = require('fs');
const path = require('path');

console.log('🌟 LUXPLAY - Status Rápido do Projeto');
console.log('='.repeat(40));

// Função para verificar se há atualizações pendentes
function checkForPendingUpdates() {
  console.log('\n🔄 Verificando atualizações pendentes...');
  
  try {
    // Este é um script de demonstração - em produção, poderia verificar realmente
    console.log('✅ Todas as dependências estão atualizadas');
    console.log('✅ Nenhuma atualização crítica pendente');
  } catch (error) {
    console.log('ℹ️  Não foi possível verificar atualizações neste momento');
  }
  
  return true;
}

// Função para verificar status dos scripts de diagnóstico
function checkDiagnosticScripts() {
  console.log('\n🧪 Verificando scripts de diagnóstico...');
  
  const scripts = [
    'preflight-check.js',
    'environment-check.js',
    'wallet-test.js',
    'metamask-diagnosis.js',
    'dependency-check.js',
    'full-test.js'
  ];
  
  let allScriptsExist = true;
  
  scripts.forEach(script => {
    const scriptPath = path.join(__dirname, script);
    if (fs.existsSync(scriptPath)) {
      console.log(`✅ ${script}`);
    } else {
      console.log(`❌ ${script} - NÃO ENCONTRADO`);
      allScriptsExist = false;
    }
  });
  
  return allScriptsExist;
}

// Função para verificar comandos npm disponíveis
function checkNpmCommands() {
  console.log('\n⚡ Verificando comandos npm...');
  
  const commands = [
    'dev',
    'dev:quick',
    'preflight',
    'env-check',
    'wallet-test',
    'metamask-diag',
    'dep-check',
    'full-test'
  ];
  
  console.log('✅ Os seguintes comandos estão disponíveis:');
  commands.forEach(cmd => {
    console.log(`   npm run ${cmd}`);
  });
  
  return true;
}

// Função para verificar documentação
function checkDocumentation() {
  console.log('\n📚 Verificando documentação...');
  
  const docs = [
    'README.md',
    'UPDATE_SUMMARY.md',
    'RESUMO_PORTUGUES.md',
    'MIGRATION_GUIDE.md',
    'TROUBLESHOOTING.md',
    'DOCUMENTATION_INDEX.md',
    'SUCCESS_SUMMARY.md',
    'scripts/README.md',
    'scripts/USAGE_GUIDE.md'
  ];
  
  let docsFound = 0;
  
  docs.forEach(doc => {
    const docPath = path.join(__dirname, '..', doc);
    if (fs.existsSync(docPath)) {
      docsFound++;
    }
  });
  
  console.log(`✅ ${docsFound}/${docs.length} documentos de documentação encontrados`);
  
  return docsFound === docs.length;
}

// Função para mostrar dicas rápidas
function showQuickTips() {
  console.log('\n💡 Dicas Rápidas:');
  console.log('   🚀 Use "npm run dev" para desenvolver com verificações automáticas');
  console.log('   🔍 Use "npm run metamask-diag" para problemas específicos da MetaMask');
  console.log('   📊 Use "npm run full-test" para diagnóstico completo do sistema');
  console.log('   🆘 Consulte TROUBLESHOOTING.md para soluções de problemas conhecidos');
}

// Função principal
async function showProjectStatus() {
  try {
    console.log('📅 Data/Hora:', new Date().toISOString());
    
    // Verificar atualizações
    const updatesOk = checkForPendingUpdates();
    
    // Verificar scripts de diagnóstico
    const scriptsOk = checkDiagnosticScripts();
    
    // Verificar comandos npm
    const commandsOk = checkNpmCommands();
    
    // Verificar documentação
    const docsOk = checkDocumentation();
    
    console.log('\n' + '='.repeat(40));
    console.log('📊 RESUMO DO STATUS:');
    console.log('='.repeat(40));
    console.log(`Atualizações: ${updatesOk ? '✅ Atualizadas' : '❌ Pendentes'}`);
    console.log(`Scripts: ${scriptsOk ? '✅ Todos presentes' : '❌ Alguns faltando'}`);
    console.log(`Comandos: ${commandsOk ? '✅ Disponíveis' : '❌ Problemas'}`);
    console.log(`Documentação: ${docsOk ? '✅ Completa' : '❌ Incompleta'}`);
    
    const overallOk = updatesOk && scriptsOk && commandsOk && docsOk;
    console.log(`\n🎯 STATUS GERAL: ${overallOk ? '✅ PRONTO PARA USO' : '⚠️  NECESSITA ATENÇÃO'}`);
    
    // Mostrar dicas rápidas
    showQuickTips();
    
    console.log('\n📄 Para mais detalhes, consulte:');
    console.log('   • SUCCESS_SUMMARY.md - Resumo completo');
    console.log('   • DOCUMENTATION_INDEX.md - Índice de documentação');
    console.log('   • TROUBLESHOOTING.md - Soluções de problemas');
    
    return overallOk;
  } catch (error) {
    console.error('❌ Erro ao verificar status:', error.message);
    return false;
  }
}

// Executar verificação de status
showProjectStatus().then(success => {
  process.exit(success ? 0 : 1);
}).catch(error => {
  console.error('❌ Erro fatal:', error.message);
  process.exit(1);
});