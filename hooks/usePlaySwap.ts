import { useReadContract, useWriteContract, useWaitForTransactionReceipt, useSimulateContract } from 'wagmi';
import { useAccount } from 'wagmi';
import playSwapAbi from '../abi/PlaySwap.json';
import usdtAbi from '../abi/USDT.json';
import { CONTRACT_ADDRESSES } from '../lib/contracts';

// Read hooks for PlaySwap configuration
export function useSwapConfig() {
  return useReadContract({
    address: CONTRACT_ADDRESSES.PLAYSWAP,
    abi: playSwapAbi,
    functionName: 'getSwapConfig',
  });
}

// Preview swap with donation
export function usePreviewBuyWithDonation(amountIn?: bigint) {
  return useSimulateContract({
    address: CONTRACT_ADDRESSES.PLAYSWAP,
    abi: playSwapAbi,
    functionName: 'previewBuyWithDonation',
    args: amountIn ? [amountIn] : undefined,
    query: {
      enabled: !!amountIn && amountIn > 0n,
      refetchInterval: 5000, // Refresh every 5 seconds for updated prices
    }
  });
}

// USDT allowance for PlaySwap
export function useUSDTAllowance(owner?: `0x${string}`) {
  return useReadContract({
    address: CONTRACT_ADDRESSES.USDT_TOKEN,
    abi: usdtAbi,
    functionName: 'allowance',
    args: owner ? [owner, CONTRACT_ADDRESSES.PLAYSWAP] : undefined,
    query: {
      enabled: !!owner,
      refetchInterval: 3000, // Check allowance frequently
    }
  });
}

// USDT balance
export function useUSDTBalance(userAddress?: `0x${string}`) {
  return useReadContract({
    address: CONTRACT_ADDRESSES.USDT_TOKEN,
    abi: usdtAbi,
    functionName: 'balanceOf',
    args: userAddress ? [userAddress] : undefined,
    query: {
      enabled: !!userAddress,
      refetchInterval: 5000, // Update every 5 seconds
    }
  });
}

// Write hooks for USDT approval
export function useUSDTApprove() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const receipt = useWaitForTransactionReceipt({ 
    hash,
    confirmations: 1, // Reduced to 1 confirmation to avoid BlockNotFoundError
    pollingInterval: 3000, // Poll every 3 seconds
    timeout: 120000, // 2 minute timeout
    query: {
      retry: (failureCount, error) => {
        if (failureCount < 3 && error?.message?.includes('Block at number')) {
          console.warn(`[WARN] Block not found during USDT approval, retrying (${failureCount + 1}/3)...`);
          return true;
        }
        return false;
      },
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    }
  });

  const approveUSDT = (amount: bigint) => {
    console.log('[DEBUG] Requesting USDT approval for PlaySwap:', {
      spender: CONTRACT_ADDRESSES.PLAYSWAP,
      amount: amount.toString()
    });
    
    writeContract({
      address: CONTRACT_ADDRESSES.USDT_TOKEN,
      abi: usdtAbi,
      functionName: 'approve',
      args: [CONTRACT_ADDRESSES.PLAYSWAP, amount],
      gas: 5000000n, // Set explicit gas limit for approval
    });
  };

  return {
    approveUSDT,
    hash,
    isPending,
    error,
    receipt,
  };
}

// Write hook for swap and donate
export function useSwapAndDonate() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const receipt = useWaitForTransactionReceipt({ 
    hash,
    confirmations: 1, // Reduced to 1 confirmation to avoid BlockNotFoundError
    pollingInterval: 3000, // Poll every 3 seconds
    timeout: 120000, // 2 minute timeout
    query: {
      retry: (failureCount, error) => {
        if (failureCount < 3 && error?.message?.includes('Block at number')) {
          console.warn(`[WARN] Block not found during swap, retrying (${failureCount + 1}/3)...`);
          return true;
        }
        return false;
      },
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    }
  });

  const swapAndDonate = (amountIn: bigint) => {
    console.log('[DEBUG] Requesting swap and donate:', {
      amountIn: amountIn.toString(),
      contract: CONTRACT_ADDRESSES.PLAYSWAP
    });
    
    writeContract({
      address: CONTRACT_ADDRESSES.PLAYSWAP,
      abi: playSwapAbi,
      functionName: 'swapAndDonate',
      args: [amountIn],
      gas: 5000000n, // Higher gas limit for swap operations
    });
  };

  return {
    swapAndDonate,
    hash,
    isPending,
    error,
    receipt,
  };
}

// Combined hook for easy swap management
export function usePlaySwap() {
  const { address } = useAccount();
  
  // Read hooks
  const swapConfig = useSwapConfig();
  const usdtBalance = useUSDTBalance(address);
  const usdtAllowance = useUSDTAllowance(address);
  
  // Write hooks
  const usdtApprove = useUSDTApprove();
  const swapAndDonate = useSwapAndDonate();
  
  // Helper function to check if approval is needed
  const needsApproval = (amount: bigint): boolean => {
    const allowance = (usdtAllowance.data as bigint) || 0n;
    const needsApprovalResult = allowance < amount;
    
    console.log('[DEBUG] needsApproval check:', {
      amount: amount.toString(),
      allowance: allowance.toString(),
      needsApprovalResult,
      isLoading: usdtAllowance.isLoading
    });
    
    return needsApprovalResult;
  };
  
  // Helper function to ensure USDT allowance
  const ensureUSDTAllowance = async (requiredAmount: bigint): Promise<boolean> => {
    try {
      // Refetch current allowance to get the latest value
      const { data: latestAllowance } = await usdtAllowance.refetch();
      const allowance = (latestAllowance as bigint) || 0n;
      
      console.log('[DEBUG] Checking USDT allowance for PlaySwap:', {
        current: allowance.toString(),
        required: requiredAmount.toString(),
        needsApproval: allowance < requiredAmount
      });
      
      if (allowance < requiredAmount) {
        // Approve a large amount to avoid frequent approvals (10x the required amount)
        const approvalAmount = requiredAmount * 10n;
        console.log('[DEBUG] Requesting USDT approval for amount:', approvalAmount.toString());
        
        await usdtApprove.approveUSDT(approvalAmount);
        
        // Wait for approval transaction to be confirmed
        if (usdtApprove.receipt) {
          await new Promise((resolve, reject) => {
            const checkReceipt = () => {
              if (usdtApprove.receipt?.isSuccess) {
                console.log('[DEBUG] USDT approval transaction confirmed');
                resolve(true);
              } else if (usdtApprove.receipt?.isError) {
                console.error('[DEBUG] USDT approval transaction failed');
                reject(new Error('USDT approval transaction failed'));
              } else {
                // Still pending, check again
                setTimeout(checkReceipt, 1000);
              }
            };
            checkReceipt();
          });
        }
        
        return true;
      }
      
      return false; // No approval needed
    } catch (error) {
      console.error('[ERROR] Failed to ensure USDT allowance:', error);
      throw error;
    }
  };
  
  return {
    // Read data
    swapConfig: swapConfig.data,
    usdtBalance: usdtBalance.data as bigint | undefined,
    usdtAllowance: usdtAllowance.data as bigint | undefined,
    
    // Loading states
    isLoadingSwapConfig: swapConfig.isLoading,
    isLoadingUSDTBalance: usdtBalance.isLoading,
    isLoadingUSDTAllowance: usdtAllowance.isLoading,
    
    // Write functions
    approveUSDT: usdtApprove.approveUSDT,
    swapAndDonate: swapAndDonate.swapAndDonate,
    
    // Transaction states
    isApprovingUSDT: usdtApprove.isPending,
    isSwapping: swapAndDonate.isPending,
    approvalReceipt: usdtApprove.receipt,
    swapReceipt: swapAndDonate.receipt,
    
    // Helper functions
    needsApproval,
    ensureUSDTAllowance,
    
    // Refetch functions
    refetchUSDTBalance: usdtBalance.refetch,
    refetchUSDTAllowance: usdtAllowance.refetch,
  };
}