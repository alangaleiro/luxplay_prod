#!/usr/bin/env node

// Script de verificação de atualizações de dependências
// Verifica se há versões mais recentes das dependências críticas

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔄 LUXPLAY - Verificação de Atualizações de Dependências');
console.log('='.repeat(55));

// Dependências críticas para monitorar
const criticalDependencies = [
  'wagmi',
  'viem',
  'connectkit',
  'next',
  'react',
  'react-dom',
  '@wagmi/connectors',
  '@wagmi/core',
  '@tanstack/react-query'
];

// Função para obter a versão instalada de uma dependência
function getInstalledVersion(dependency) {
  try {
    const packageJsonPath = path.join(__dirname, '..', 'node_modules', dependency, 'package.json');
    if (fs.existsSync(packageJsonPath)) {
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
      return packageJson.version;
    }
  } catch (error) {
    // Ignorar erros
  }
  return null;
}

// Função para obter a versão mais recente de uma dependência
function getLatestVersion(dependency) {
  try {
    const output = execSync(`npm view ${dependency} version`, { encoding: 'utf8' });
    return output.trim();
  } catch (error) {
    // Ignorar erros
  }
  return null;
}

// Função para comparar versões
function compareVersions(installed, latest) {
  if (!installed || !latest) return 'unknown';
  
  // Simplificação: comparar strings de versão
  if (installed === latest) return 'up-to-date';
  
  // Verificar se é uma versão major diferente (indicando breaking changes)
  const installedParts = installed.split('.');
  const latestParts = latest.split('.');
  
  if (installedParts[0] !== latestParts[0]) {
    return 'major-update'; // Atualização major - pode ter breaking changes
  }
  
  if (installedParts[1] !== latestParts[1]) {
    return 'minor-update'; // Atualização minor
  }
  
  return 'patch-update'; // Atualização patch
}

// Função principal
async function checkDependencies() {
  try {
    console.log('📅 Data/Hora da verificação:', new Date().toISOString());
    console.log('\n📦 Verificando dependências críticas...\n');
    
    let updatesAvailable = 0;
    let majorUpdates = 0;
    
    for (const dependency of criticalDependencies) {
      const installedVersion = getInstalledVersion(dependency);
      const latestVersion = getLatestVersion(dependency);
      const status = compareVersions(installedVersion, latestVersion);
      
      let statusEmoji = '✅';
      let statusText = 'Atualizado';
      
      switch (status) {
        case 'major-update':
          statusEmoji = '🚨';
          statusText = 'Atualização Major Disponível';
          majorUpdates++;
          updatesAvailable++;
          break;
        case 'minor-update':
          statusEmoji = '⚠️';
          statusText = 'Atualização Minor Disponível';
          updatesAvailable++;
          break;
        case 'patch-update':
          statusEmoji = 'ℹ️';
          statusText = 'Atualização Patch Disponível';
          updatesAvailable++;
          break;
        case 'up-to-date':
          statusEmoji = '✅';
          statusText = 'Atualizado';
          break;
        default:
          statusEmoji = '❓';
          statusText = 'Status Desconhecido';
      }
      
      console.log(`${statusEmoji} ${dependency}:`);
      console.log(`   Instalado: ${installedVersion || 'N/A'}`);
      console.log(`   Última:    ${latestVersion || 'N/A'}`);
      console.log(`   Status:    ${statusText}\n`);
    }
    
    console.log('='.repeat(55));
    console.log('📊 RESUMO DAS ATUALIZAÇÕES:');
    console.log('='.repeat(55));
    console.log(`Dependências Verificadas: ${criticalDependencies.length}`);
    console.log(`Atualizações Disponíveis: ${updatesAvailable}`);
    console.log(`Atualizações Major: ${majorUpdates}`);
    
    if (updatesAvailable > 0) {
      console.log('\n💡 Recomendações:');
      if (majorUpdates > 0) {
        console.log('   🚨 ATENÇÃO: Atualizações major podem ter breaking changes!');
        console.log('   📋 Revise cuidadosamente as release notes antes de atualizar');
      }
      console.log('   🔧 Considere atualizar dependências uma a uma para evitar problemas');
      console.log('   🧪 Teste completamente após cada atualização');
    } else {
      console.log('\n✅ Todas as dependências críticas estão atualizadas!');
    }
    
    console.log('\n🔧 Para atualizar uma dependência específica:');
    console.log('   npm install <nome-da-dependência>@latest');
    
    console.log('\n🔄 Para atualizar todas as dependências:');
    console.log('   npm update');
    
    return true;
  } catch (error) {
    console.error('❌ Erro durante a verificação:', error.message);
    return false;
  }
}

// Executar verificação
checkDependencies().then(success => {
  process.exit(success ? 0 : 1);
}).catch(error => {
  console.error('❌ Erro fatal:', error.message);
  process.exit(1);
});