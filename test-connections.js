// Test script for RPC and contract connections
const { createPublicClient, http } = require('viem');
const { polygon } = require('viem/chains');

// Environment variables check
console.log('🔍 Testing LuxPlay (Play Hub v2) Connections...\n');

// Check environment variables
console.log('📋 Environment Configuration:');
console.log('RPC URL:', process.env.NEXT_PUBLIC_RPC_URL || 'Not set');
console.log('Chain ID:', process.env.NEXT_PUBLIC_CHAIN_ID || 'Not set');
console.log('Network:', process.env.NEXT_PUBLIC_NETWORK_NAME || 'Not set');

// Contract addresses
const addresses = {
  ACTIVE_POOL: process.env.NEXT_PUBLIC_ACTIVE_POOL_ADDRESS,
  USER_CONTRACT: process.env.NEXT_PUBLIC_USER_CONTRACT_ADDRESS,
  ORACLE: process.env.NEXT_PUBLIC_ORACLE_ADDRESS,
  PLAY_TOKEN: process.env.NEXT_PUBLIC_PLAY_TOKEN_ADDRESS,
  USDT_TOKEN: process.env.NEXT_PUBLIC_USDT_TOKEN_ADDRESS,
  PLAYSWAP: process.env.NEXT_PUBLIC_PLAYSWAP_ADDRESS
};

console.log('\n📝 Contract Addresses:');
Object.entries(addresses).forEach(([name, address]) => {
  console.log(`${name}: ${address || 'Not set'}`);
});

// Test RPC connection
async function testRPCConnection() {
  try {
    console.log('\n🌐 Testing RPC Connection...');
    
    const client = createPublicClient({
      chain: polygon,
      transport: http(process.env.NEXT_PUBLIC_RPC_URL)
    });

    // Test basic RPC connectivity
    const blockNumber = await client.getBlockNumber();
    console.log('✅ RPC Connection: SUCCESS');
    console.log(`Latest block: ${blockNumber}`);

    // Test chain ID
    const chainId = await client.getChainId();
    console.log(`Chain ID: ${chainId}`);
    
    return { success: true, blockNumber, chainId };
  } catch (error) {
    console.log('❌ RPC Connection: FAILED');
    console.error('Error:', error.message);
    return { success: false, error: error.message };
  }
}

// Test contract deployment
async function testContracts() {
  try {
    console.log('\n📊 Testing Contract Deployments...');
    
    const client = createPublicClient({
      chain: polygon,
      transport: http(process.env.NEXT_PUBLIC_RPC_URL)
    });

    const results = {};
    
    for (const [name, address] of Object.entries(addresses)) {
      if (address) {
        try {
          const code = await client.getBytecode({ address });
          const isDeployed = code && code !== '0x';
          results[name] = { 
            address, 
            deployed: isDeployed,
            status: isDeployed ? '✅ Deployed' : '❌ Not deployed'
          };
          console.log(`${name}: ${results[name].status}`);
        } catch (error) {
          results[name] = { 
            address, 
            deployed: false, 
            status: '❌ Error checking',
            error: error.message
          };
          console.log(`${name}: ${results[name].status}`);
        }
      } else {
        results[name] = { 
          address: null, 
          deployed: false, 
          status: '⚠️ Address not configured'
        };
        console.log(`${name}: ${results[name].status}`);
      }
    }
    
    return results;
  } catch (error) {
    console.log('❌ Contract Testing: FAILED');
    console.error('Error:', error.message);
    return { error: error.message };
  }
}

// Run tests
async function runTests() {
  console.log('='.repeat(50));
  console.log('🚀 Starting LuxPlay Connection Tests');
  console.log('='.repeat(50));
  
  // Test RPC
  const rpcResult = await testRPCConnection();
  
  if (rpcResult.success) {
    // Test contracts if RPC works
    const contractResults = await testContracts();
    
    console.log('\n📈 Test Summary:');
    console.log('RPC Connection:', rpcResult.success ? '✅ Working' : '❌ Failed');
    
    if (contractResults && !contractResults.error) {
      const deployedContracts = Object.values(contractResults).filter(r => r.deployed).length;
      const totalContracts = Object.keys(addresses).length;
      console.log(`Contracts Deployed: ${deployedContracts}/${totalContracts}`);
      
      if (deployedContracts === totalContracts) {
        console.log('🎉 All systems are operational!');
      } else {
        console.log('⚠️ Some contracts need attention');
      }
    }
  } else {
    console.log('\n❌ Cannot test contracts due to RPC connection failure');
  }
  
  console.log('\n' + '='.repeat(50));
}

// Load environment variables manually
const fs = require('fs');
const path = require('path');

try {
  const envPath = path.join(__dirname, '.env.local');
  const envContent = fs.readFileSync(envPath, 'utf8');
  
  envContent.split('\n').forEach(line => {
    line = line.trim();
    if (line && !line.startsWith('#')) {
      const equalIndex = line.indexOf('=');
      if (equalIndex > 0) {
        const key = line.substring(0, equalIndex).trim();
        const value = line.substring(equalIndex + 1).trim();
        if (key.startsWith('NEXT_PUBLIC_')) {
          process.env[key] = value;
          console.log(`Loaded: ${key} = ${value}`);
        }
      }
    }
  });
  
  console.log('✅ Environment variables loaded from .env.local\n');
} catch (error) {
  console.log('⚠️ Could not load .env.local:', error.message);
}

// Run the tests
runTests().catch(console.error);