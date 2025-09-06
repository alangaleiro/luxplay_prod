'use client';

import { WagmiProvider, createConfig, http } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { polygon } from "wagmi/chains";
import { injected, metaMask } from '@wagmi/connectors';
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { BackgroundProvider } from '@/components/ui/background-provider';
import { AuthProvider } from '@/contexts/AuthContext';

const config = createConfig({
  chains: [polygon],
  transports: {
    [polygon.id]: http(process.env.NEXT_PUBLIC_RPC_URL || 'https://polygon-mainnet.g.alchemy.com/v2/demo'),
  },
  connectors: [
    injected({ shimDisconnect: false }),
    metaMask({ shimDisconnect: false }),
  ],
  ssr: false,
});

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30 * 1000,
      gcTime: 5 * 60 * 1000,
      retry: false,
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
      refetchOnMount: true
    },
  },
});

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

  useEffect(() => {
    setMounted(true);
    
    if (typeof window !== 'undefined') {
      const root = window.document.documentElement;
      root.classList.add('dark');
      root.style.colorScheme = 'dark';
    }
  }, []);

  if (!mounted) {
    return (
      <div className="dark" suppressHydrationWarning>
        {children}
      </div>
    );
  }

  const value = { theme: 'dark' as const };

  return (
    <ThemeContext.Provider value={value}>
      <div className="dark">
        {children}
      </div>
    </ThemeContext.Provider>
  );
}

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
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
  );
}

export { config, queryClient };