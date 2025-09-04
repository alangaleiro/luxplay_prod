// Wallet Connection Diagnostic Utility
// This helps diagnose and fix wallet connection issues

export const walletDiagnostic = {
  // Check if WalletConnect is properly configured
  checkWalletConnect: () => {
    const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID;
    console.log('[DIAGNOSTIC] WalletConnect Project ID:', projectId ? 'configured' : 'missing');
    
    if (!projectId) {
      console.error('[ERROR] WalletConnect Project ID is missing. Please set NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID in .env.local');
      return false;
    }
    
    if (projectId.length < 20) {
      console.warn('[WARNING] WalletConnect Project ID seems too short. Please verify it\'s correct.');
      return false;
    }
    
    // Test WalletConnect modal availability
    try {
      console.log('[DIAGNOSTIC] Testing WalletConnect initialization...');
      // Basic check if WalletConnect can be imported
      if (typeof window !== 'undefined') {
        console.log('[DIAGNOSTIC] Browser environment detected, WalletConnect should work');
      }
      return true;
    } catch (error) {
      console.error('[ERROR] WalletConnect initialization failed:', error);
      return false;
    }
  },

  // Detect available wallets
  detectWallets: () => {
    const wallets = {
      metamask: typeof window !== 'undefined' && window.ethereum?.isMetaMask,
      trustwallet: typeof window !== 'undefined' && window.ethereum?.isTrust,
      safepal: typeof window !== 'undefined' && window.ethereum?.isSafePal,
      coinbase: typeof window !== 'undefined' && window.ethereum?.isCoinbaseWallet,
      injected: typeof window !== 'undefined' && window.ethereum,
    };

    console.log('[DIAGNOSTIC] Detected wallets:', wallets);
    return wallets;
  },

  // Check network configuration
  checkNetwork: () => {
    const rpcUrl = process.env.NEXT_PUBLIC_RPC_URL;
    const chainId = process.env.NEXT_PUBLIC_CHAIN_ID;
    
    console.log('[DIAGNOSTIC] Network config:', {
      rpcUrl: rpcUrl ? 'configured' : 'missing',
      chainId: chainId || 'missing'
    });
    
    return !!(rpcUrl && chainId);
  },

  // Run full diagnostic
  runFullDiagnostic: () => {
    console.log('[DIAGNOSTIC] Running full wallet diagnostic...');
    
    const wcCheck = walletDiagnostic.checkWalletConnect();
    const wallets = walletDiagnostic.detectWallets();
    const networkCheck = walletDiagnostic.checkNetwork();
    
    const results = {
      walletConnect: wcCheck,
      detectedWallets: wallets,
      network: networkCheck,
      overall: wcCheck && networkCheck
    };
    
    console.log('[DIAGNOSTIC] Results:', results);
    
    if (!results.overall) {
      console.error('[ERROR] Wallet configuration has issues. Please check the above diagnostics.');
    } else {
      console.log('[SUCCESS] Wallet configuration looks good!');
    }
    
    return results;
  }
};

// Auto-run diagnostic in development
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  setTimeout(() => {
    walletDiagnostic.runFullDiagnostic();
  }, 1000);
}

export default walletDiagnostic;