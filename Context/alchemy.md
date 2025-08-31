# Alchemy RPC Integration Guide

## 🔗 RPC Configuration for LuxPlay

### Environment Setup

Create `.env.local` in your project root:

```bash
# Alchemy RPC (recommended for production)
NEXT_PUBLIC_RPC_URL=https://polygon-mainnet.g.alchemy.com/v2/WAjAsGR9B4Aj9dJQBxOnYqCcJHsvC-QV

# Backup RPC providers
NEXT_PUBLIC_RPC_URL_BACKUP=https://quicknode-or-other-provider
```

## 🔧 Wagmi Integration in Next.js

Update your `app/providers.tsx`:

```typescript
'use client';

import { createConfig, http } from 'wagmi';
import { polygon } from 'wagmi/chains'; // adjust to your chain
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiProvider } from 'wagmi';

// Create wagmi config with Alchemy RPC
const config = createConfig({
  chains: [polygon], // or your target chain
  transports: {
    [polygon.id]: http(process.env.NEXT_PUBLIC_RPC_URL!),
  },
  // Optional: Add fallback
  multiInjectedProviderDiscovery: false,
});

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 3,
      staleTime: 30_000, // 30 seconds
    },
  },
});

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </WagmiProvider>
  );
}
```

## 📊 Performance Optimization

### Batch Calls for Efficiency

```typescript
// Instead of multiple individual calls:
// const userInfo = useReadContract({ address: ADDR.activePool, functionName: 'userInfo' });
// const pending = useReadContract({ address: ADDR.activePool, functionName: 'pendingRewards' });

// Use multicall for better performance:
import { useReadContracts } from 'wagmi';

const { data } = useReadContracts({
  contracts: [
    {
      address: ADDR.activePool,
      abi: activePoolAbi,
      functionName: 'userInfo',
      args: [address!],
    },
    {
      address: ADDR.activePool,
      abi: activePoolAbi,
      functionName: 'pendingRewards', 
      args: [address!],
    },
  ],
  query: { enabled: !!address },
});
```

## ⚡ Testing RPC Connection

Test your setup with a simple component:

```typescript
import { useReadContract } from 'wagmi';
import { ADDRESSES } from '@/lib/addresses';
import { activePoolAbi } from '@/abi';

export function RPCTest() {
  const { data: totalActive, isLoading, error } = useReadContract({
    address: ADDRESSES.activePool,
    abi: activePoolAbi,
    functionName: 'totalActive',
  });

  if (isLoading) return <div>Testing RPC connection...</div>;
  if (error) return <div>RPC Error: {error.message}</div>;
  
  return (
    <div>
      ✅ RPC Connected! Total Active: {totalActive?.toString()}
    </div>
  );
}
```

## 🔐 Security Notes

- Never commit API keys to git
- Use environment variables for all RPC URLs
- Consider rate limiting for high-frequency calls
- Monitor your Alchemy usage dashboard

## 🐛 Common Issues & Solutions

### Issue: "Failed to fetch" errors
**Solution**: Check RPC URL and API key validity

### Issue: Slow response times
**Solution**: 
- Use `useReadContracts` for batch calls
- Implement proper query caching
- Add `staleTime` to reduce unnecessary refetches

### Issue: Rate limiting
**Solution**: 
- Implement exponential backoff
- Use Alchemy's tier with higher rate limits
- Cache responses when possible
