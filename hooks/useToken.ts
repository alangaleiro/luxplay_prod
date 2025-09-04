import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { useAccount } from 'wagmi';
import playTokenAbi from '../abi/PlayToken.json';
import { CONTRACT_ADDRESSES } from '../lib/contracts';

// Read hooks
export function useTokenBalance(userAddress?: `0x${string}`) {
  return useReadContract({
    address: CONTRACT_ADDRESSES.PLAY_TOKEN,
    abi: playTokenAbi,
    functionName: 'balanceOf',
    args: userAddress ? [userAddress] : undefined,
    query: {
      enabled: !!userAddress,
      refetchInterval: 5000, // Update every 5 seconds
    }
  });
}

export function useTokenAllowance(owner?: `0x${string}`, spender?: `0x${string}`) {
  return useReadContract({
    address: CONTRACT_ADDRESSES.PLAY_TOKEN,
    abi: playTokenAbi,
    functionName: 'allowance',
    args: owner && spender ? [owner, spender] : undefined,
    query: {
      enabled: !!owner && !!spender,
    }
  });
}

export function useTokenDecimals() {
  return useReadContract({
    address: CONTRACT_ADDRESSES.PLAY_TOKEN,
    abi: playTokenAbi,
    functionName: 'decimals',
  });
}

export function useTokenTotalSupply() {
  return useReadContract({
    address: CONTRACT_ADDRESSES.PLAY_TOKEN,
    abi: playTokenAbi,
    functionName: 'totalSupply',
  });
}

export function useTokenName() {
  return useReadContract({
    address: CONTRACT_ADDRESSES.PLAY_TOKEN,
    abi: playTokenAbi,
    functionName: 'name',
  });
}

export function useTokenSymbol() {
  return useReadContract({
    address: CONTRACT_ADDRESSES.PLAY_TOKEN,
    abi: playTokenAbi,
    functionName: 'symbol',
  });
}

// Write hooks
export function useTokenApprove() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const receipt = useWaitForTransactionReceipt({ 
    hash,
    confirmations: 1, // Reduced to 1 confirmation to avoid BlockNotFoundError
    pollingInterval: 3000, // Poll every 3 seconds
    timeout: 120000, // 2 minute timeout
    query: {
      retry: (failureCount, error) => {
        if (failureCount < 3 && error?.message?.includes('Block at number')) {
          console.warn(`[WARN] Block not found during approval, retrying (${failureCount + 1}/3)...`);
          return true;
        }
        return false;
      },
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    }
  });

  const approve = (spender: `0x${string}`, amount: bigint) => {
    console.log('[DEBUG] Requesting token approval:', {
      spender,
      amount: amount.toString()
    });
    
    writeContract({
      address: CONTRACT_ADDRESSES.PLAY_TOKEN,
      abi: playTokenAbi,
      functionName: 'approve',
      args: [spender, amount],
      gas: 5000000n, // Set explicit gas limit for approval
    });
  };

  return {
    approve,
    hash,
    isPending,
    error,
    receipt,
  };
}

export function useTokenTransfer() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const receipt = useWaitForTransactionReceipt({ hash });

  const transfer = (to: `0x${string}`, amount: bigint) => {
    writeContract({
      address: CONTRACT_ADDRESSES.PLAY_TOKEN,
      abi: playTokenAbi,
      functionName: 'transfer',
      args: [to, amount],
      gas: 5000000n, // Set explicit gas limit for transfer
    });
  };

  return {
    transfer,
    hash,
    isPending,
    error,
    receipt,
  };
}

// Composite hooks
export function useTokenData() {
  const { data: name } = useTokenName();
  const { data: symbol } = useTokenSymbol();
  const { data: decimals } = useTokenDecimals();
  const { data: totalSupply } = useTokenTotalSupply();

  return {
    name: name || '',
    symbol: symbol || '',
    decimals: decimals || 18,
    totalSupply: totalSupply || 0n,
  };
}

export function useUserTokenData(userAddress?: `0x${string}`) {
  const { data: balance } = useTokenBalance(userAddress);
  const { data: allowanceActivePool } = useTokenAllowance(userAddress, CONTRACT_ADDRESSES.ACTIVE_POOL);
  // Play Hub v2: No Binary Pool, only Active Pool allowance needed

  return {
    balance: balance || 0n,
    allowanceActivePool: allowanceActivePool || 0n,
  };
}

// Helper hook to ensure allowance for deposits
export function useEnsureAllowance() {
  const { address } = useAccount();
  const { data: currentAllowance, refetch: refetchAllowance } = useTokenAllowance(address, CONTRACT_ADDRESSES.ACTIVE_POOL);
  const { approve, isPending, error, receipt } = useTokenApprove();

  const ensureAllowance = async (requiredAmount: bigint): Promise<boolean> => {
    try {
      // Refetch current allowance to get the latest value
      const { data: latestAllowance } = await refetchAllowance();
      const allowance = (latestAllowance as bigint) || 0n;
      
      console.log('[DEBUG] Checking allowance:', {
        current: allowance.toString(),
        required: requiredAmount.toString(),
        needsApproval: allowance < requiredAmount
      });
      
      if (allowance < requiredAmount) {
        // Approve a large amount to avoid frequent approvals
        const approvalAmount = requiredAmount * 10n; // 10x the required amount for future transactions
        console.log('[DEBUG] Requesting approval for amount:', approvalAmount.toString());
        
        await approve(CONTRACT_ADDRESSES.ACTIVE_POOL, approvalAmount);
        
        // Wait for approval transaction to be confirmed
        if (receipt) {
          await new Promise((resolve) => {
            const checkReceipt = () => {
              if (receipt.isSuccess) {
                console.log('[DEBUG] Approval transaction confirmed');
                resolve(true);
              } else if (receipt.isError) {
                console.error('[DEBUG] Approval transaction failed');
                throw new Error('Approval transaction failed');
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
      
      console.log('[DEBUG] Sufficient allowance already exists');
      return true;
    } catch (error) {
      console.error('[ERROR] Allowance check/approval failed:', error);
      throw error;
    }
  };

  return {
    ensureAllowance,
    currentAllowance: currentAllowance || 0n,
    isPending,
    error,
    receipt,
  };
}