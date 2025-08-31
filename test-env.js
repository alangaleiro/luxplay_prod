// Simple environment test
console.log('🔍 LuxPlay Environment Test\n');

// Direct environment check
console.log('📋 Environment Variables:');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('NEXT_PUBLIC_RPC_URL:', process.env.NEXT_PUBLIC_RPC_URL || 'Not set');
console.log('NEXT_PUBLIC_CHAIN_ID:', process.env.NEXT_PUBLIC_CHAIN_ID || 'Not set');
console.log('NEXT_PUBLIC_NETWORK_NAME:', process.env.NEXT_PUBLIC_NETWORK_NAME || 'Not set');

console.log('\n📝 Contract Addresses:');
console.log('ACTIVE_POOL:', process.env.NEXT_PUBLIC_ACTIVE_POOL_ADDRESS || 'Not set');
console.log('USER_CONTRACT:', process.env.NEXT_PUBLIC_USER_CONTRACT_ADDRESS || 'Not set');
console.log('ORACLE:', process.env.NEXT_PUBLIC_ORACLE_ADDRESS || 'Not set');
console.log('PLAY_TOKEN:', process.env.NEXT_PUBLIC_PLAY_TOKEN_ADDRESS || 'Not set');
console.log('USDT_TOKEN:', process.env.NEXT_PUBLIC_USDT_TOKEN_ADDRESS || 'Not set');
console.log('PLAYSWAP:', process.env.NEXT_PUBLIC_PLAYSWAP_ADDRESS || 'Not set');

console.log('\n🌐 RPC Configuration:');
const rpcUrl = process.env.NEXT_PUBLIC_RPC_URL;
if (rpcUrl) {
  console.log('✅ RPC URL configured:', rpcUrl);
  
  // Simple fetch test
  fetch(rpcUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      jsonrpc: '2.0',
      method: 'eth_blockNumber',
      params: [],
      id: 1
    })
  })
  .then(response => response.json())
  .then(data => {
    if (data.result) {
      const blockNumber = parseInt(data.result, 16);
      console.log('✅ RPC Connection: SUCCESS');
      console.log('Latest block:', blockNumber);
    } else {
      console.log('❌ RPC Response Error:', data.error?.message || 'Unknown error');
    }
  })
  .catch(error => {
    console.log('❌ RPC Connection: FAILED');
    console.error('Error:', error.message);
  });
} else {
  console.log('❌ RPC URL not configured');
}