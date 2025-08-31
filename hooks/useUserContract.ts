import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect } from 'react';
import userAbi from '../abi/User.json';
import { CONTRACT_ADDRESSES, ABIS } from '../lib/contracts';

// Read hooks
export function useIsRegistered(userAddress?: `0x${string}`) {
  return useReadContract({
    address: CONTRACT_ADDRESSES.USER_CONTRACT,
    abi: userAbi,
    functionName: 'isRegistered',
    args: userAddress ? [userAddress] : undefined,
    query: {
      enabled: !!userAddress,
      staleTime: 30 * 1000, // 30 seconds - cache registration status
      gcTime: 5 * 60 * 1000, // 5 minutes cache time
      retry: (failureCount, error) => {
        // Retry network errors up to 3 times
        if (failureCount < 3) {
          const errorMessage = error?.message?.toLowerCase() || '';
          if (errorMessage.includes('network') || 
              errorMessage.includes('fetch') ||
              errorMessage.includes('timeout') ||
              errorMessage.includes('connection')) {
            console.warn(`[WARN] Network error checking registration, retrying (${failureCount + 1}/3)...`);
            return true;
          }
        }
        return false;
      },
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000), // Max 10s delay
      refetchOnMount: true,
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
    }
  });
}

export function useIsActive(userAddress?: `0x${string}`) {
  return useReadContract({
    address: CONTRACT_ADDRESSES.USER_CONTRACT,
    abi: userAbi,
    functionName: 'isActive',
    args: userAddress ? [userAddress] : undefined,
    query: {
      enabled: !!userAddress,
    }
  });
}

export function useReferrerOf(userAddress?: `0x${string}`) {
  return useReadContract({
    address: CONTRACT_ADDRESSES.USER_CONTRACT,
    abi: userAbi,
    functionName: 'referrerOf',
    args: userAddress ? [userAddress] : undefined,
    query: {
      enabled: !!userAddress,
    }
  });
}

export function useGetReferrals(userAddress?: `0x${string}`) {
  return useReadContract({
    address: CONTRACT_ADDRESSES.USER_CONTRACT,
    abi: userAbi,
    functionName: 'getReferrals',
    args: userAddress ? [userAddress] : undefined,
    query: {
      enabled: !!userAddress,
    }
  });
}

export function useGetUpline(userAddress?: `0x${string}`, level?: number) {
  return useReadContract({
    address: CONTRACT_ADDRESSES.USER_CONTRACT,
    abi: userAbi,
    functionName: 'getUpline',
    args: userAddress && level !== undefined ? [userAddress, level] : undefined,
    query: {
      enabled: !!userAddress && level !== undefined,
    }
  });
}

export function useViewDownlineCount(userAddress?: `0x${string}`, levels?: number) {
  return useReadContract({
    address: CONTRACT_ADDRESSES.USER_CONTRACT,
    abi: userAbi,
    functionName: 'viewDownlineCount',
    args: userAddress && levels !== undefined ? [userAddress, levels] : undefined,
    query: {
      enabled: !!userAddress && levels !== undefined,
    }
  });
}

export function useRootUser() {
  return useReadContract({
    address: CONTRACT_ADDRESSES.USER_CONTRACT,
    abi: userAbi,
    functionName: 'rootUser',
  });
}

// Write hooks
export function useRegister() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const receipt = useWaitForTransactionReceipt({ 
    hash,
    confirmations: 1, // Reduced to 1 confirmation to avoid BlockNotFoundError
    pollingInterval: 3000, // Poll every 3 seconds
    timeout: 120000, // 2 minute timeout
    query: {
      retry: (failureCount, error) => {
        if (failureCount < 3 && error?.message?.includes('Block at number')) {
          console.warn(`[WARN] Block not found during registration, retrying (${failureCount + 1}/3)...`);
          return true;
        }
        return false;
      },
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    }
  });
  const router = useRouter();

  const register = useCallback((sponsor: string) => {
    console.log('[DEBUG] Attempting to register with sponsor:', sponsor);
    
    try {
      return writeContract({
        address: CONTRACT_ADDRESSES.USER_CONTRACT,
        abi: ABIS.user,
        functionName: 'register',
        args: [sponsor as `0x${string}`],
        gas: 500000n, // Set explicit gas limit to prevent estimation issues
      });
    } catch (error) {
      console.error('[ERROR] Registration failed:', error);
      throw error;
    }
  }, [writeContract]);

  // Redirect after successful registration
  useEffect(() => {
    if (receipt?.isSuccess) {
      console.log('[DEBUG] Registration transaction confirmed, redirecting to prize program');
      // Longer delay to ensure blockchain state is updated and avoid race conditions
      setTimeout(() => {
        router.push('/prize-program');
      }, 3000);
    }
  }, [receipt?.isSuccess, router]);

  return {
    register,
    hash,
    isPending,
    error,
    receipt,
    isConfirming: receipt?.isLoading,
    isSuccess: receipt?.isSuccess,
  };
}

// Composite hook for networking data
export function useNetworkingData(userAddress?: `0x${string}`) {
  const { data: referrals } = useGetReferrals(userAddress);
  const { data: referrer } = useReferrerOf(userAddress);
  const { data: downlineCounts } = useViewDownlineCount(userAddress, 15);
  const { data: isRegistered } = useIsRegistered(userAddress);
  const { data: isActive } = useIsActive(userAddress);

  return {
    referrals: referrals || [],
    referrer,
    downlineCounts: downlineCounts || [],
    isRegistered: isRegistered || false,
    isActive: isActive || false,
  };
}

// Hook to get upline chain (levels 1-15)
export function useUplineChain(userAddress?: `0x${string}`) {
  const uplineQueries = Array.from({ length: 15 }, (_, i) => 
    useGetUpline(userAddress, i + 1)
  );

  const uplineChain = uplineQueries.map(query => query.data).filter(Boolean);
  const isLoading = uplineQueries.some(query => query.isLoading);
  const error = uplineQueries.find(query => query.error)?.error;

  return {
    uplineChain,
    isLoading,
    error,
  };
}