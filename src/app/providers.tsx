'use client';

import { WagmiProvider, createConfig, http } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { polygon } from "wagmi/chains";
import { injected, walletConnect, metaMask, coinbaseWallet, safe } from '@wagmi/connectors';
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { BackgroundProvider } from '@/components/ui/background-provider';
import { BrowserExtensionHandler } from '@/components/BrowserExtensionHandler';
import { WalletErrorBoundary } from '@/components/WalletErrorBoundary';
import { initializeErrorHandling } from '../../lib/error-suppression';
import { enhanceMetaMaskStability } from '../../lib/metamask-stability';
import { AuthProvider } from '@/contexts/AuthContext';
// import '../../lib/wallet-diagnostic'; // Auto-run diagnostics

// Enhanced Wagmi configuration for LuxPlay with multiple wallet support
const config = createConfig({
  chains: [polygon],
  transports: {
    [polygon.id]: http(process.env.NEXT_PUBLIC_RPC_URL!, {
      timeout: 20000, // 20 second timeout
      retryCount: 3,
      retryDelay: 1000,
    }),
  },
  connectors: [
    // MetaMask - Primary connector
    metaMask({
      dappMetadata: {
        name: "LuxPlay",
        url: "https://luxplay.io",
        iconUrl: "https://luxplay.io/logo.png"
      }
    }),
    // WalletConnect - For mobile wallets (Trust, SafePal, etc.)
    walletConnect({
      projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || '28313425a1e696b76d4ed773d5d5d7d5',
      metadata: {
        name: "LuxPlay",
        description: "LuxPlay DeFi Platform",
        url: process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : 'https://luxplay.io',
        icons: ["https://avatars.githubusercontent.com/u/37784886"]
      },
      showQrModal: true,
      qrModalOptions: {
        themeMode: 'dark'
      }
    }),
    // Injected connector for browser wallets (SafePal, Trust Wallet browser extensions)
    injected({
      target: () => ({
        id: 'injected',
        name: 'Browser Wallet',
        provider: typeof window !== 'undefined' ? window.ethereum : undefined,
      })
    }),
    // Coinbase Wallet
    coinbaseWallet({
      appName: "LuxPlay",
      appLogoUrl: "https://luxplay.io/logo.png",
    }),
    // Safe Wallet
    safe({
      allowedDomains: [/luxplay\.io$/],
      debug: false,
    })
  ],
  // Enhanced connection options for stability
  ssr: false,
  batch: {
    multicall: {
      batchSize: 100,
      wait: 16,
    },
  },
});

// Optimized Query client for Play Hub v2
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30 * 1000, // 30 seconds for better UX
      gcTime: 5 * 60 * 1000, // 5 minutes cache (renamed from cacheTime)
      retry: (failureCount, error: any) => {
        // Enhanced retry logic for different error types
        if (failureCount < 3) {
          // Retry network errors
          if (error?.message?.includes('network') || 
              error?.message?.includes('fetch') ||
              error?.message?.includes('timeout') ||
              error?.code === 4100 || // MetaMask authorization errors
              error?.code === -32002) { // MetaMask pending request
            return true;
          }
        }
        return false;
      },
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
      refetchOnMount: true
    },
    mutations: {
      retry: (failureCount, error: any) => {
        // Retry MetaMask connection issues once
        if (failureCount < 1 && (
          error?.code === 4100 || // Authorization error
          error?.code === -32002 || // Pending request
          error?.message?.includes('User rejected')
        )) {
          return true;
        }
        return false;
      },
      retryDelay: 2000
    }
  },
});

// LUXPLAY Dark Mode Only Configuration
const ThemeContext = createContext<{ theme: 'dark' } | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

interface ThemeProviderProps {
  children: ReactNode;
}

function ThemeProvider({ children }: ThemeProviderProps) {
  const [mounted, setMounted] = useState(false);
  const [hydrationComplete, setHydrationComplete] = useState(false);

  useEffect(() => {
    // Set mounted first
    setMounted(true);
    
    // Initialize error handling and suppression
    initializeErrorHandling();
    
    // Initialize MetaMask stability enhancements
    enhanceMetaMaskStability();
    
    // Ensure LUXPLAY dark mode is always applied
    const root = window.document.documentElement;
    root.classList.remove('light');
    root.classList.add('dark');
    
    // Set browser color scheme to dark
    root.style.colorScheme = 'dark';
    
    // Set standard background from global.css
    // Background is now handled by BackgroundProvider
    
    // Store LUXPLAY theme preference
    localStorage.setItem('luxplay-ui-theme', 'dark');
    
    // Mark hydration as complete after a short delay
    const timer = setTimeout(() => {
      setHydrationComplete(true);
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);

  // Prevent SSR hydration mismatch during initial load
  if (!mounted || !hydrationComplete) {
    return (
      <div className="dark" style={{ colorScheme: 'dark' }} suppressHydrationWarning>
        {children}
      </div>
    );
  }

  const value = { theme: 'dark' as const };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

// Main Providers component
interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <WalletErrorBoundary>
      <BrowserExtensionHandler>
        <WagmiProvider config={config}>
          <QueryClientProvider client={queryClient}>
            <AuthProvider>
              <ThemeProvider>
                <BackgroundProvider>
                  {children}
                </BackgroundProvider>
              </ThemeProvider>
            </AuthProvider>
          </QueryClientProvider>
        </WagmiProvider>
      </BrowserExtensionHandler>
    </WalletErrorBoundary>
  );
}

export { config, queryClient };