import { useReadContract, useWriteContract, useWaitForTransactionReceipt, useAccount } from 'wagmi';
import activePoolAbi from '../abi/ActivePool.json';
import { CONTRACT_ADDRESSES } from '../lib/contracts';
import { PlanId } from '../lib/types';
import { fromWei } from '../lib/utils';

// Read hooks
export function useCountdown() {
  return useReadContract({
    address: CONTRACT_ADDRESSES.ACTIVE_POOL,
    abi: activePoolAbi,
    functionName: 'secondsUntilNextEpoch',
    query: {
      refetchInterval: 60000, // Update every 60 seconds
    }
  });
}

export function useUserInfo(userAddress?: `0x${string}`) {
  const result = useReadContract({
    address: CONTRACT_ADDRESSES.ACTIVE_POOL,
    abi: activePoolAbi,
    functionName: 'userInfo',
    args: userAddress ? [userAddress] : undefined,
    query: {
      enabled: !!userAddress,
      refetchInterval: 5000,
      retry: (failureCount, error) => {
        if (failureCount < 3) {
          console.warn(`[WARN] useUserInfo retry ${failureCount + 1}/3:`, error?.message);
          return true;
        }
        return false;
      },
      // Add stale time to prevent excessive calls
      staleTime: 10000, // 10 seconds
      gcTime: 30000, // 30 seconds cache
    }
  });



  return result;
}

export function useViewUserTotals(userAddress?: `0x${string}`) {
  const result = useReadContract({
    address: CONTRACT_ADDRESSES.ACTIVE_POOL,
    abi: activePoolAbi,
    functionName: 'viewUserTotals',
    args: userAddress ? [userAddress] : undefined,
    query: {
      enabled: !!userAddress,
      refetchInterval: 5000,
      retry: (failureCount, error) => {
        if (failureCount < 3) {
          console.warn(`[WARN] useViewUserTotals retry ${failureCount + 1}/3:`, error?.message);
          return true;
        }
        return false;
      },
    }
  });



  return result;
}

// DEPRECATED: Use useViewPendingReward instead
// export function usePendingRewards(userAddress?: `0x${string}`) {
//   return useReadContract({
//     address: CONTRACT_ADDRESSES.ACTIVE_POOL,
//     abi: activePoolAbi,
//     functionName: 'pendingRewards', // This function doesn't exist in new ABI
//     args: userAddress ? [userAddress] : undefined,
//     query: {
//       enabled: !!userAddress,
//       refetchInterval: 5000, // Update every 5 seconds
//     }
//   });
// }

export function useTotalActive() {
  const result = useReadContract({
    address: CONTRACT_ADDRESSES.ACTIVE_POOL,
    abi: activePoolAbi,
    functionName: 'totalActive',
  });
  

  
  return result;
}

export function useReferralPendingReward(userAddress?: `0x${string}`) {
  const result = useReadContract({
    address: CONTRACT_ADDRESSES.ACTIVE_POOL,
    abi: activePoolAbi,
    functionName: 'referralPendingReward',
    args: userAddress ? [userAddress] : undefined,
    query: {
      enabled: !!userAddress,
      refetchInterval: 5000,
      retry: (failureCount, error) => {
        if (failureCount < 3) {
          console.warn(`[WARN] useReferralPendingReward retry ${failureCount + 1}/3:`, error?.message);
          return true;
        }
        return false;
      },
      staleTime: 10000,
      gcTime: 30000,
    }
  });



  return result;
}

export function useTotalReferralAccrued(userAddress?: `0x${string}`) {
  const result = useReadContract({
    address: CONTRACT_ADDRESSES.ACTIVE_POOL,
    abi: activePoolAbi,
    functionName: 'totalReferralAccrued',
    args: userAddress ? [userAddress] : undefined,
    query: {
      enabled: !!userAddress,
      refetchInterval: 5000,
      retry: (failureCount, error) => {
        if (failureCount < 3) {
          console.warn(`[WARN] useTotalReferralAccrued retry ${failureCount + 1}/3:`, error?.message);
          return true;
        }
        return false;
      },
    }
  });



  return result;
}

export function useViewDownlinesStakeByPlanAndLevel(userAddress?: `0x${string}`) {
  const result = useReadContract({
    address: CONTRACT_ADDRESSES.ACTIVE_POOL,
    abi: activePoolAbi,
    functionName: 'viewDownlineStakeByLevelAndPlan', // ✅ Correct function name from ABI
    args: userAddress ? [userAddress] : undefined,
    query: {
      enabled: !!userAddress,
      refetchInterval: 5000,
      retry: (failureCount, error) => {
        if (failureCount < 3) {
          console.warn(`[WARN] useViewDownlinesStakeByPlanAndLevel retry ${failureCount + 1}/3:`, error?.message);
          return true;
        }
        return false;
      },
    }
  });



  return result;
}

export function usePreviewClaimableReward(userAddress?: `0x${string}`) {
  return useReadContract({
    address: CONTRACT_ADDRESSES.ACTIVE_POOL,
    abi: activePoolAbi,
    functionName: 'previewClaimableReward',
    args: userAddress ? [userAddress] : undefined,
    query: {
      enabled: !!userAddress,
    }
  });
}

// New function from updated ABI
export function useViewPendingReward(userAddress?: `0x${string}`) {
  return useReadContract({
    address: CONTRACT_ADDRESSES.ACTIVE_POOL,
    abi: activePoolAbi,
    functionName: 'viewPendingReward',
    args: userAddress ? [userAddress] : undefined,
    query: {
      enabled: !!userAddress,
      refetchInterval: 5000, // Update every 5 seconds
    }
  });
}

// Write hooks
export function useCheckpoint() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const receipt = useWaitForTransactionReceipt({ hash });

  const checkpoint = () => {
    writeContract({
      address: CONTRACT_ADDRESSES.ACTIVE_POOL,
      abi: activePoolAbi,
      functionName: 'checkpoint',
      gas: 5000000n, // Set explicit gas limit
    });
  };

  return {
    checkpoint,
    hash,
    isPending,
    error,
    receipt,
  };
}

export function useDeposit() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const receipt = useWaitForTransactionReceipt({ 
    hash,
    confirmations: 1, // Reduced to 1 confirmation to avoid BlockNotFoundError
    pollingInterval: 3000, // Poll every 3 seconds
    timeout: 120000, // 2 minute timeout
    query: {
      retry: (failureCount, error) => {
        if (failureCount < 3 && error?.message?.includes('Block at number')) {
          console.warn(`[WARN] Block not found, retrying (${failureCount + 1}/3)...`);
          return true;
        }
        return false;
      },
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    }
  });

  const deposit = (stake: bigint, plan: PlanId) => {
    console.log('[DEBUG] Attempting deposit:', { stake: stake.toString(), plan });
    
    writeContract({
      address: CONTRACT_ADDRESSES.ACTIVE_POOL,
      abi: activePoolAbi,
      functionName: 'deposit',
      args: [stake, plan],
      gas: 5000000n, // Set explicit gas limit to prevent estimation issues
    });
  };

  return {
    deposit,
    hash,
    isPending,
    error,
    receipt,
    isConfirming: receipt?.isLoading,
    isSuccess: receipt?.isSuccess,
  };
}

export function useClaimRewards() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const receipt = useWaitForTransactionReceipt({ hash });

  const claimRewards = (amount: bigint) => {
    writeContract({
      address: CONTRACT_ADDRESSES.ACTIVE_POOL,
      abi: activePoolAbi,
      functionName: 'claimRewards',
      args: [amount],
      gas: 5000000n, // Set explicit gas limit
    });
  };

  return {
    claimRewards,
    hash,
    isPending,
    error,
    receipt,
  };
}

export function useClaimReferralRewards() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const receipt = useWaitForTransactionReceipt({ hash });

  const claimReferralRewards = (amount: bigint) => {
    writeContract({
      address: CONTRACT_ADDRESSES.ACTIVE_POOL,
      abi: activePoolAbi,
      functionName: 'claimReferralRewards',
      args: [amount],
      gas: 5000000n, // Set explicit gas limit
    });
  };

  return {
    claimReferralRewards,
    hash,
    isPending,
    error,
    receipt,
  };
}

export function useStakeReferralRewards() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const receipt = useWaitForTransactionReceipt({ hash });

  const stakeReferralRewards = (amount: bigint) => {
    writeContract({
      address: CONTRACT_ADDRESSES.ACTIVE_POOL,
      abi: activePoolAbi,
      functionName: 'stakeReferralRewards',
      args: [amount],
      gas: 5000000n, // Set explicit gas limit
    });
  };

  return {
    stakeReferralRewards,
    hash,
    isPending,
    error,
    receipt,
  };
}

export function useUpgradePlan() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const receipt = useWaitForTransactionReceipt({ hash });

  const upgradePlan = (newPlan: PlanId) => {
    writeContract({
      address: CONTRACT_ADDRESSES.ACTIVE_POOL,
      abi: activePoolAbi,
      functionName: 'upgradePlan',
      args: [newPlan],
      gas: 5000000n, // Set explicit gas limit
    });
  };

  return {
    upgradePlan,
    hash,
    isPending,
    error,
    receipt,
  };
}

export function useMoveWarmUpToActivePool() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const receipt = useWaitForTransactionReceipt({ 
    hash,
    confirmations: 1, // Reduced to 1 confirmation to avoid BlockNotFoundError
    pollingInterval: 3000, // Poll every 3 seconds instead of default
    timeout: 120000, // 2 minute timeout
    query: {
      retry: (failureCount, error) => {
        // Retry up to 3 times for block-related errors
        if (failureCount < 3 && error?.message?.includes('Block at number')) {
          console.warn(`[WARN] Block not found, retrying (${failureCount + 1}/3)...`);
          return true;
        }
        return false;
      },
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff
    }
  });

  const moveWarmUpToActivePool = () => {
    console.log('[DEBUG] Initiating moveWarmUpToActivePool transaction');
    
    try {
      writeContract({
        address: CONTRACT_ADDRESSES.ACTIVE_POOL,
        abi: activePoolAbi,
        functionName: 'moveWarmUpToActivePool',
        gas: 5000000n, // Set explicit gas limit to prevent estimation issues
      });
    } catch (error: any) {
      console.error('[ERROR] moveWarmUpToActivePool contract call failed:', error);
      throw error;
    }
  };

  return {
    moveWarmUpToActivePool,
    hash,
    isPending,
    error,
    receipt,
    isConfirming: receipt?.isLoading,
    isSuccess: receipt?.isSuccess,
  };
}

// Alternative hook for userInfo with extended data (if ABI has 8 values)
export function useUserInfoExtended(userAddress?: `0x${string}`) {
  return useReadContract({
    address: CONTRACT_ADDRESSES.ACTIVE_POOL,
    abi: activePoolAbi,
    functionName: 'userInfo',
    args: userAddress ? [userAddress] : undefined,
    query: {
      enabled: !!userAddress,
    }
  });
}

// Composite hook for Prize Summary
export function usePrizeSummary() {
  const { address } = useAccount();
  
  const { data: countdownSec } = useCountdown();
  const { data: totalActiveTokens } = useTotalActive();
  const { data: userInfo } = useUserInfo(address);
  const { data: userTotals } = useViewUserTotals(address);

  // Extract values from userInfo array based on updated ABI structure:
  // [0] activeAmount, [1] principal, [2] voucherAmount, [3] maxReferralCap, 
  // [4] plan, [5] lastEpochId, [6] pendingReward, [7] logicAmount
  const activeAmount = userInfo && Array.isArray(userInfo) ? (userInfo[0] as bigint) : 0n;
  const principal = userInfo && Array.isArray(userInfo) ? (userInfo[1] as bigint) : 0n;
  const voucherAmount = userInfo && Array.isArray(userInfo) ? (userInfo[2] as bigint) : 0n;
  const maxReferralCap = userInfo && Array.isArray(userInfo) ? (userInfo[3] as bigint) : 0n;
  const userPlan = userInfo && Array.isArray(userInfo) ? Number(userInfo[4]) : 0;
  const lastEpochId = userInfo && Array.isArray(userInfo) ? (userInfo[5] as bigint) : 0n;
  const pendingReward = userInfo && Array.isArray(userInfo) ? (userInfo[6] as bigint) : 0n; // ✅ Index 6 - pendingReward
  const logicAmount = userInfo && Array.isArray(userInfo) ? (userInfo[7] as bigint) : 0n;

  // Extract values from userTotals: [deposited, active, warmUpDeposit, cap2xMax, apyReceived, referralReceived]
  const totalDeposited = userTotals && Array.isArray(userTotals) ? (userTotals[0] as bigint) : 0n;
  const totalActive = userTotals && Array.isArray(userTotals) ? (userTotals[1] as bigint) : 0n;
  const warmupAmount = userTotals && Array.isArray(userTotals) ? (userTotals[2] as bigint) : 0n;
  const cap2xMax = userTotals && Array.isArray(userTotals) ? (userTotals[3] as bigint) : 0n;
  const apyReceived = userTotals && Array.isArray(userTotals) ? (userTotals[4] as bigint) : 0n;
  const referralReceived = userTotals && Array.isArray(userTotals) ? (userTotals[5] as bigint) : 0n;



  return {
    countdownSec: countdownSec ? Number(countdownSec) : 0,
    globalActiveTokens: totalActiveTokens || 0n,
    claimable: pendingReward, // ✅ Now using pendingReward from userInfo[6]
    activePrize: activeAmount, // Updated: now using activeAmount from userInfo[0]
    burned: principal, // Updated: now using principal from userInfo[1] 
    activeAmount: totalActive, // Updated: using totalActive from userTotals[1]
    warmupAmount, // From userTotals[2]
    voucherAmount,
    maxReferralCap,
    userPlan,
    lastEpochId,
    logicAmount,
    totalDeposited,
    cap2xMax,
    apyReceived,
    referralReceived
  };
}

// Additional hooks for invite page
export function useViewRemainingReferralCapPct(userAddress?: `0x${string}`) {
  const result = useReadContract({
    address: CONTRACT_ADDRESSES.ACTIVE_POOL,
    abi: activePoolAbi,
    functionName: 'viewRemainingReferralCapPct',
    args: userAddress ? [userAddress] : undefined,
    query: {
      enabled: !!userAddress,
      refetchInterval: 5000,
      retry: (failureCount, error) => {
        if (failureCount < 3) {
          console.warn(`[WARN] useViewRemainingReferralCapPct retry ${failureCount + 1}/3:`, error?.message);
          return true;
        }
        return false;
      },
    }
  });



  return result;
}

export function useViewDownlineActiveCount(userAddress?: `0x${string}`) {
  const result = useReadContract({
    address: CONTRACT_ADDRESSES.ACTIVE_POOL,
    abi: activePoolAbi,
    functionName: 'viewDownlineActiveCount',
    args: userAddress ? [userAddress] : undefined,
    query: {
      enabled: !!userAddress,
      refetchInterval: 5000,
      retry: (failureCount, error) => {
        if (failureCount < 3) {
          console.warn(`[WARN] useViewDownlineActiveCount retry ${failureCount + 1}/3:`, error?.message);
          return true;
        }
        return false;
      },
    }
  });



  return result;
}

export function useViewUnlockableWarmUp(userAddress?: `0x${string}`) {
  return useReadContract({
    address: CONTRACT_ADDRESSES.ACTIVE_POOL,
    abi: activePoolAbi,
    functionName: 'viewUnlockableWarmUp',
    args: userAddress ? [userAddress] : undefined,
    query: {
      enabled: !!userAddress,
      refetchInterval: 5000,
    }
  });
}

// Plan Lock hooks - using available functions
export function usePrincipalActiveSince(userAddress?: `0x${string}`) {
  return useReadContract({
    address: CONTRACT_ADDRESSES.ACTIVE_POOL,
    abi: activePoolAbi,
    functionName: 'principalActiveSince',
    args: userAddress ? [userAddress] : undefined,
    query: {
      enabled: !!userAddress,
      refetchInterval: 5000,
    }
  });
}

export function usePlanLock(plan: number) {
  return useReadContract({
    address: CONTRACT_ADDRESSES.ACTIVE_POOL,
    abi: activePoolAbi,
    functionName: 'planLock',
    args: [plan],
    query: {
      refetchInterval: 5000,
    }
  });
}

// viewPrincipalLock - requires address parameter
export function useViewPrincipalLock(userAddress?: `0x${string}`) {
  const result = useReadContract({
    address: CONTRACT_ADDRESSES.ACTIVE_POOL,
    abi: activePoolAbi,
    functionName: 'viewPrincipalLock',
    args: userAddress ? [userAddress] : undefined,
    query: {
      enabled: !!userAddress,
      refetchInterval: 5000,
      retry: (failureCount, error) => {
        if (failureCount < 3) {
          console.warn(`[WARN] useViewPrincipalLock retry ${failureCount + 1}/3:`, error?.message);
          return true;
        }
        return false;
      },
    }
  });



  return result;
}

// viewMyPrincipalLock - no address parameter needed
export function useViewMyPrincipalLock() {
  const { address } = useAccount();
  
  const result = useReadContract({
    address: CONTRACT_ADDRESSES.ACTIVE_POOL,
    abi: activePoolAbi,
    functionName: 'viewMyPrincipalLock',
    query: {
      enabled: !!address,
      refetchInterval: 5000,
      retry: (failureCount, error) => {
        if (failureCount < 3) {
          console.warn(`[WARN] useViewMyPrincipalLock retry ${failureCount + 1}/3:`, error?.message);
          return true;
        }
        return false;
      },
    }
  });

  return result;
}