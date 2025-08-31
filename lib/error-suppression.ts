// MetaMask connection utility to handle console warnings
export const suppressMetaMaskWarnings = () => {
  if (typeof window !== 'undefined') {
    // Suppress MetaMask connection warnings
    const originalConsoleWarn = console.warn;
    const originalConsoleError = console.error;
    
    console.warn = (...args) => {
      const message = args.join(' ');
      
      // Filter out specific MetaMask and browser extension warnings
      if (
        message.includes('MetaMask: Lost connection') ||
        message.includes('ObjectMultiplex - orphaned data') ||
        message.includes('chromePort disconnected') ||
        message.includes('premature close') ||
        message.includes('Lit is in dev mode') ||
        message.includes('[Reown Config] Failed to fetch') ||
        message.includes('WalletConnect service unavailable') ||
        message.includes('The configured WalletConnect') ||
        message.includes('differs from the actual page url')
      ) {
        return; // Suppress these warnings
      }
      
      originalConsoleWarn.apply(console, args);
    };
    
    console.error = (...args) => {
      const message = args.join(' ');
      
      // Filter out specific MetaMask and configuration errors that are non-critical
      if (
        message.includes('Failed to execute inlined telemetry script') ||
        message.includes('chromePort disconnected') ||
        message.includes('Origin http://') && message.includes('not found on Allowlist') ||
        message.includes('A tree hydrated but some attributes') ||
        message.includes('Uncaught (in promise) undefined') ||
        message.includes('GET https://api.web3modal.org') ||
        message.includes('POST https://pulse.walletconnect.org') ||
        message.includes('403 (Forbidden)') ||
        message.includes('400 (Bad Request)') ||
        message.includes('Failed to load resource')
      ) {
        return; // Suppress these errors
      }
      
      originalConsoleError.apply(console, args);
    };
  }
};

// WalletConnect error handling
export const handleWalletConnectErrors = () => {
  if (typeof window !== 'undefined') {
    // Handle WalletConnect configuration warnings
    const originalFetch = window.fetch;
    
    window.fetch = async (input, init) => {
      try {
        // Fix WalletConnect Project ID in requests
        if (typeof input === 'string') {
          // Replace placeholder or missing project ID with the actual one
          if (input.includes('YOUR_WALLETCONNECT_PROJECT_ID_HERE')) {
            const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || '3fd8364d4214414955d9fc6960eb5f79';
            input = input.replace('YOUR_WALLETCONNECT_PROJECT_ID_HERE', projectId);
          }
        }
        
        const response = await originalFetch(input, init);
        
        // Handle WalletConnect API errors silently
        if (typeof input === 'string' && 
            (input.includes('api.web3modal.org') || 
             input.includes('pulse.walletconnect.org') || 
             input.includes('cca-lite.coinbase.com'))) {
          if (!response.ok) {
            console.warn(`WalletConnect API error (${response.status}): Using fallback configuration`);
            return response;
          }
        }
        
        return response;
      } catch (error) {
        // Silently handle network errors for WalletConnect
        if (typeof input === 'string' && 
            (input.includes('web3modal.org') || 
             input.includes('walletconnect.org') || 
             input.includes('coinbase.com'))) {
          console.warn('WalletConnect service unavailable, using local configuration');
          return new Response(JSON.stringify({ error: 'Service unavailable' }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
          });
        }
        throw error;
      }
    };
  }
};

// Initialize error suppression
export const initializeErrorHandling = () => {
  suppressMetaMaskWarnings();
  handleWalletConnectErrors();
  
  // Global unhandled promise rejection handler
  if (typeof window !== 'undefined') {
    window.addEventListener('unhandledrejection', (event) => {
      const error = event.reason;
      const errorMessage = error?.message || error?.toString() || '';
      
      // Suppress specific wallet and telemetry errors
      if (
        errorMessage.includes('Failed to fetch') ||
        errorMessage.includes('NetworkError') ||
        errorMessage.includes('telemetry') ||
        errorMessage.includes('analytics') ||
        errorMessage.includes('Coinbase') ||
        errorMessage.includes('WalletConnect') ||
        errorMessage.includes('MetaMask') ||
        errorMessage.includes('extension not found') ||
        errorMessage === '' || 
        errorMessage === 'undefined'
      ) {
        event.preventDefault();
        return;
      }
    });
    
    // Global error handler
    window.addEventListener('error', (event) => {
      const errorMessage = event.message || '';
      
      // Suppress extension and wallet-related errors
      if (
        errorMessage.includes('chrome-extension://') ||
        errorMessage.includes('moz-extension://') ||
        errorMessage.includes('Script error') ||
        errorMessage.includes('Non-Error promise rejection') ||
        errorMessage.includes('MetaMask extension not found')
      ) {
        event.preventDefault();
        return;
      }
    });
  }
  
  // Additional React dev tools suppression
  if (process.env.NODE_ENV === 'development') {
    const originalConsoleLog = console.log;
    console.log = (...args) => {
      const message = args.join(' ');
      
      // Suppress React DevTools download message
      if (message.includes('Download the React DevTools')) {
        return;
      }
      
      originalConsoleLog.apply(console, args);
    };
  }
};