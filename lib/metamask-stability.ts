// MetaMask Connection Stability Utilities
// Handles connection drops, authorization errors, and transport issues

export const enhanceMetaMaskStability = () => {
  if (typeof window !== 'undefined' && window.ethereum) {
    // Handle MetaMask connection drops
    const ethereum = window.ethereum;
    
    // Track connection state
    let isConnected = false;
    let reconnectAttempts = 0;
    const maxReconnectAttempts = 3;
    
    // Connection monitoring
    const monitorConnection = () => {
      if (ethereum.isConnected && ethereum.isConnected()) {
        isConnected = true;
        reconnectAttempts = 0;
      } else {
        isConnected = false;
      }
    };
    
    // Auto-reconnect logic
    const attemptReconnect = async () => {
      if (reconnectAttempts < maxReconnectAttempts && !isConnected) {
        try {
          reconnectAttempts++;
          console.log(`[MetaMask] Attempting reconnection ${reconnectAttempts}/${maxReconnectAttempts}`);
          
          await ethereum.request({ method: 'eth_accounts' });
          monitorConnection();
          
          if (isConnected) {
            console.log('[MetaMask] Reconnection successful');
          }
        } catch (error) {
          console.warn(`[MetaMask] Reconnection attempt ${reconnectAttempts} failed:`, error);
          
          if (reconnectAttempts < maxReconnectAttempts) {
            setTimeout(attemptReconnect, 2000 * reconnectAttempts); // Exponential backoff
          }
        }
      }
    };
    
    // Listen for connection events
    if (ethereum.on) {
      ethereum.on('connect', () => {
        console.log('[MetaMask] Connected');
        isConnected = true;
        reconnectAttempts = 0;
      });
      
      ethereum.on('disconnect', (error: any) => {
        console.log('[MetaMask] Disconnected:', error);
        isConnected = false;
        
        // Auto-reconnect for non-user initiated disconnections
        if (error?.code !== 4100) { // Not user rejection
          setTimeout(attemptReconnect, 1000);
        }
      });
      
      ethereum.on('accountsChanged', (accounts: string[]) => {
        console.log('[MetaMask] Accounts changed:', accounts);
        monitorConnection();
      });
      
      ethereum.on('chainChanged', (chainId: string) => {
        console.log('[MetaMask] Chain changed:', chainId);
        // Reload page on chain change to prevent state issues
        window.location.reload();
      });
    }
    
    // Initial connection check
    monitorConnection();
    
    return {
      isConnected: () => isConnected,
      attemptReconnect,
      getReconnectAttempts: () => reconnectAttempts
    };
  }
  
  return null;
};

// Enhanced transaction error handling
export const handleTransactionErrors = (error: any): { shouldRetry: boolean; message: string } => {
  if (!error) return { shouldRetry: false, message: 'Unknown error' };
  
  const errorCode = error?.code;
  const errorMessage = error?.message || error?.toString() || '';
  
  switch (errorCode) {
    case 4100: // Unauthorized - user needs to connect/authorize
      return {
        shouldRetry: true,
        message: 'Please connect your wallet and authorize the transaction'
      };
    
    case 4001: // User rejected the request
      return {
        shouldRetry: false,
        message: 'Transaction was rejected by user'
      };
    
    case -32002: // Request already pending
      return {
        shouldRetry: true,
        message: 'Please check your wallet - there may be a pending request'
      };
    
    case -32603: // Internal error
      return {
        shouldRetry: true,
        message: 'Internal error - please try again'
      };
    
    default:
      if (errorMessage.includes('network')) {
        return {
          shouldRetry: true,
          message: 'Network error - please check your connection and try again'
        };
      }
      
      if (errorMessage.includes('gas')) {
        return {
          shouldRetry: true,
          message: 'Transaction failed due to gas issues - please try again with higher gas'
        };
      }
      
      if (errorMessage.includes('nonce')) {
        return {
          shouldRetry: true,
          message: 'Nonce error - please reset your MetaMask account or try again'
        };
      }
      
      return {
        shouldRetry: false,
        message: errorMessage || 'Transaction failed'
      };
  }
};

// Connection health check
export const checkConnectionHealth = async (): Promise<{
  isHealthy: boolean;
  issues: string[];
  recommendations: string[];
}> => {
  const issues: string[] = [];
  const recommendations: string[] = [];
  
  if (typeof window === 'undefined') {
    return { isHealthy: false, issues: ['Not in browser environment'], recommendations: [] };
  }
  
  // Check MetaMask availability
  if (!window.ethereum) {
    issues.push('MetaMask not detected');
    recommendations.push('Please install MetaMask extension');
  } else {
    // Check if MetaMask is connected
    try {
      const accounts = await window.ethereum.request({ method: 'eth_accounts' });
      if (!accounts || accounts.length === 0) {
        issues.push('No accounts connected');
        recommendations.push('Please connect your MetaMask wallet');
      }
    } catch (error) {
      issues.push('Failed to check account connection');
      recommendations.push('Please refresh the page and try reconnecting');
    }
    
    // Check network
    try {
      const chainId = await window.ethereum.request({ method: 'eth_chainId' });
      if (chainId !== '0x89') { // Polygon mainnet
        issues.push('Wrong network detected');
        recommendations.push('Please switch to Polygon network in MetaMask');
      }
    } catch (error) {
      issues.push('Failed to check network');
      recommendations.push('Please check your MetaMask network settings');
    }
  }
  
  return {
    isHealthy: issues.length === 0,
    issues,
    recommendations
  };
};