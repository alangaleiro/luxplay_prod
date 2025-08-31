#!/usr/bin/env node

// Script de teste completo do sistema
// Executa todos os testes de verificação em sequência

console.log('🚀 LUXPLAY - Teste Completo do Sistema');
console.log('='.repeat(45));

async function runAllTests() {
  try {
    // Importar e executar cada script de teste
    console.log('\n1️⃣  Executando verificação de ambiente...');
    const envCheck = require('./environment-check.js');
    await new Promise(resolve => setTimeout(resolve, 1000)); // Pequena pausa
    
    console.log('\n2️⃣  Executando verificação prévia...');
    const preflightCheck = require('./preflight-check.js');
    await new Promise(resolve => setTimeout(resolve, 1000)); // Pequena pausa
    
    console.log('\n3️⃣  Executando teste de carteiras...');
    const walletTest = require('./wallet-test.js');
    await new Promise(resolve => setTimeout(resolve, 1000)); // Pequena pausa
    
    console.log('\n' + '='.repeat(45));
    console.log('✅ TODOS OS TESTES EXECUTADOS');
    console.log('='.repeat(45));
    console.log('\n📋 Próximos passos:');
    console.log('   1. Revise os resultados de cada teste acima');
    console.log('   2. Corrija quaisquer problemas identificados');
    console.log('   3. Execute "npm run dev" para iniciar o servidor');
    console.log('   4. Acesse http://localhost:3000');
    
    return true;
  } catch (error) {
    console.error('❌ Erro durante os testes:', error.message);
    return false;
  }
}

// Executar todos os testes
runAllTests().then(success => {
  process.exit(success ? 0 : 1);
}).catch(error => {
  console.error('❌ Erro fatal:', error.message);
  process.exit(1);
});