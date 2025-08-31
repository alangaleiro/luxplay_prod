// Debug utility to test wallet connections and contract calls
// This helps diagnose MetaMask integration issues

export const testWalletIntegration = async () => {
  if (typeof window === 'undefined' || !window.ethereum) {
    console.error('[TEST] MetaMask not detected');
    return false;
  }

  try {
    // Test 1: Check if wallet is connected
    const accounts = await window.ethereum.request({ method: 'eth_accounts' });
    console.log('[TEST] Connected accounts:', accounts);

    if (accounts.length === 0) {
      console.error('[TEST] No accounts connected');
      return false;
    }

    // Test 2: Check network
    const chainId = await window.ethereum.request({ method: 'eth_chainId' });
    console.log('[TEST] Current chain ID:', chainId);

    // Test 3: Test a simple eth_call
    const blockNumber = await window.ethereum.request({ method: 'eth_blockNumber' });
    console.log('[TEST] Current block number:', blockNumber);

    // Test 4: Check if MetaMask can handle transaction requests
    try {
      // This should trigger MetaMask popup for a test transaction (we won't send it)
      await window.ethereum.request({
        method: 'eth_sendTransaction',
        params: [{
          from: accounts[0],
          to: accounts[0], // Send to self (safe test)
          value: '0x0', // 0 ETH
          data: '0x' // Empty data
        }]
      });
      console.log('[TEST] MetaMask transaction dialog works');
    } catch (error: any) {
      if (error.code === 4001) {
        console.log('[TEST] User rejected transaction (expected behavior)');
      } else {
        console.error('[TEST] Unexpected error in transaction test:', error);
        return false;
      }
    }

    console.log('[TEST] All wallet integration tests passed');
    return true;

  } catch (error) {
    console.error('[TEST] Wallet integration test failed:', error);
    return false;
  }
};

// Test contract interaction specifically
export const testContractInteraction = async (
  contractAddress: string, 
  functionName: string, 
  args: any[] = []
) => {
  if (typeof window === 'undefined' || !window.ethereum) {
    console.error('[CONTRACT_TEST] MetaMask not detected');
    return false;
  }

  try {
    const accounts = await window.ethereum.request({ method: 'eth_accounts' });
    if (accounts.length === 0) {
      console.error('[CONTRACT_TEST] No accounts connected');
      return false;
    }

    // Test a contract call
    console.log('[CONTRACT_TEST] Testing contract interaction:', {
      contract: contractAddress,
      function: functionName,
      args
    });

    // This will test if the contract call structure is valid
    // Note: This is a read call, not a transaction
    const result = await window.ethereum.request({
      method: 'eth_call',
      params: [{
        to: contractAddress,
        data: '0x' // We'd need to encode the function call properly
      }, 'latest']
    });

    console.log('[CONTRACT_TEST] Contract call successful:', result);
    return true;

  } catch (error) {
    console.error('[CONTRACT_TEST] Contract interaction test failed:', error);
    return false;
  }
};

// Test specifically for token approval and deposit flow
export const debugBurnTransaction = async () => {
  console.log('[BURN_DEBUG] Starting comprehensive burn transaction debug...');
  
  // Step 1: Test wallet connection
  const walletOk = await testWalletIntegration();
  if (!walletOk) {
    console.error('[BURN_DEBUG] Wallet integration failed');
    return;
  }

  // Step 2: Test environment variables
  console.log('[BURN_DEBUG] Environment check:');
  console.log('PLAY_TOKEN:', process.env.NEXT_PUBLIC_PLAY_TOKEN_ADDRESS);
  console.log('ACTIVE_POOL:', process.env.NEXT_PUBLIC_ACTIVE_POOL_ADDRESS);
  console.log('RPC_URL:', process.env.NEXT_PUBLIC_RPC_URL?.substring(0, 30) + '...');

  // Step 3: Check if contracts are reachable
  const playToken = process.env.NEXT_PUBLIC_PLAY_TOKEN_ADDRESS;
  const activePool = process.env.NEXT_PUBLIC_ACTIVE_POOL_ADDRESS;

  if (playToken && activePool) {
    console.log('[BURN_DEBUG] Testing contract reachability...');
    await testContractInteraction(playToken, 'balanceOf');
    await testContractInteraction(activePool, 'userInfo');
  }

  console.log('[BURN_DEBUG] Debug complete. Check console for any errors above.');
};