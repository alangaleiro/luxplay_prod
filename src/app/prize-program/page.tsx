'use client';

import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { PageLoader } from '@/components/PageLoader';

// Import hooks
import { 
  usePrizeSummary, 
  useCheckpoint, 
  useDeposit, 
  useClaimRewards, 
  useUpgradePlan,
  useMoveWarmUpToActivePool,
  useUserInfo,
  useViewUserTotals,
  useTotalActive
} from '../../../hooks/useActivePool';
import { useFormattedPrice } from '../../../hooks/useOracle';
import { useTokenBalance, useEnsureAllowance, useTokenApprove } from '../../../hooks/useToken';
import { useFormState, useNotify } from '../../../hooks/useStore';

// Import utilities
import { formatEpochCountdown } from '../../../lib/utils';
import { SlidingNumber } from '@/components/core/sliding-number';

// Import utilities
import { toWei, fromWei, formatUSD, planEpochRatePct, safeFromWei } from '../../../lib/utils';

// Helper function to format PLAY amounts
const formatPlayAmount = (amount: bigint): string => {
  return Number(fromWei(amount)).toFixed(4);
};
import { CONTRACT_ADDRESSES } from '../../../lib/contracts';
import { PlanId } from '../../../lib/types';

// Icons
import { 
  Clock, 
  TrendingUp, 
  DollarSign, 
  Zap, 
  RefreshCw, 
  ArrowUp,
  Timer,
  Coins,
  Wallet
} from 'lucide-react';

interface CountdownClockProps {
  seconds: number | undefined;
}

function CountdownClock({ seconds }: CountdownClockProps) {
  const [currentSeconds, setCurrentSeconds] = useState<number | undefined>(seconds);

  useEffect(() => {
    setCurrentSeconds(seconds);
  }, [seconds]);

  useEffect(() => {
    if (currentSeconds === undefined || currentSeconds <= 0) return;

    const interval = setInterval(() => {
      setCurrentSeconds(prev => {
        if (prev === undefined || prev <= 0) return 0;
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [currentSeconds]);

  if (currentSeconds === undefined) {
    return <span>Loading...</span>;
  }

  const totalSeconds = Math.max(0, currentSeconds);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const remainingSeconds = totalSeconds % 60;

  return (
    <div className='flex items-center justify-center gap-0.5 font-mono text-2xl'>
      {hours > 0 && (
        <>
          <SlidingNumber value={hours} padStart={true} />
          <span className='text-muted-foreground'>:</span>
        </>
      )}
      <SlidingNumber value={minutes} padStart={true} />
      <span className='text-muted-foreground'>:</span>
      <SlidingNumber value={remainingSeconds} padStart={true} />
    </div>
  );
}

export default function PrizeProgramPage() {
  const [mode, setMode] = useState<'burn' | 'redeem'>('burn');
  const [amount, setAmount] = useState('');
  const [pendingDepositAmount, setPendingDepositAmount] = useState<bigint | null>(null);
  const [pendingDepositPlan, setPendingDepositPlan] = useState<PlanId | null>(null);
  const [isClientMounted, setIsClientMounted] = useState(false);

  // Wagmi
  const { address, isConnected } = useAccount();
  const router = useRouter();
  const { isAuthenticated, isRegistered, isLoading } = useAuth();

  // Store state
  const { selectedPlan, setSelectedPlan } = useFormState();

  // Notifications
  const notify = useNotify();

  // Active Pool hooks - MUST be called before any conditional returns
  const summary = usePrizeSummary();
  const { data: userInfo, refetch: refetchUserInfo } = useUserInfo(address);
  const { data: userTotals, refetch: refetchUserTotals } = useViewUserTotals(address);
  const { data: totalActive, isLoading: isTotalActiveLoading, error: totalActiveError } = useTotalActive();
  
  const refetchSummary = async () => {
    try {
      // Refetch the core data that summary depends on
      await Promise.all([
        refetchUserInfo(),
        refetchUserTotals()
      ]);
      console.log('[DEBUG] Summary data refetched successfully');
    } catch (error) {
      console.error('[DEBUG] Failed to refetch summary data:', error);
    }
  };

  // Debug logging for claimable value
  useEffect(() => {
    if (summary?.claimable !== undefined) {
      console.log('[DEBUG] Claimable value updated:', {
        claimable: summary.claimable.toString(),
        claimableFormatted: fromWei(summary.claimable as bigint),
        address
      });
    }
  }, [summary?.claimable, address]);

  // Set selectedPlan from user's actual plan in contract
  useEffect(() => {
    if (summary?.userPlan !== undefined && summary.userPlan !== selectedPlan) {
      console.log('[DEBUG] Setting selected plan from user contract data:', {
        currentSelectedPlan: selectedPlan,
        userActualPlan: summary.userPlan,
        updating: true
      });
      setSelectedPlan(summary.userPlan as PlanId);
    }
  }, [summary?.userPlan, selectedPlan, setSelectedPlan]);

  const { 
    checkpoint, 
    isPending: isCheckpointPending,
    receipt: checkpointReceipt
  } = useCheckpoint();

  const { 
    deposit, 
    isPending: isDepositPending,
    receipt: depositReceipt
  } = useDeposit();

  const { 
    claimRewards, 
    isPending: isClaimPending,
    receipt: claimReceipt
  } = useClaimRewards();

  const { 
    upgradePlan, 
    isPending: isUpgradePending,
    receipt: upgradeReceipt
  } = useUpgradePlan();

  const { 
    moveWarmUpToActivePool, 
    isPending: isMoveWarmUpPending,
    receipt: moveWarmUpReceipt
  } = useMoveWarmUpToActivePool();

  // Oracle hooks
  const { 
    price, 
    isLoading: isPriceLoading 
  } = useFormattedPrice();

  // Token hooks
  const { 
    data: balance, 
    isLoading: isBalanceLoading,
    refetch: refetchBalance
  } = useTokenBalance(address);

  const { 
    currentAllowance,
    isPending: isAllowancePending,
    receipt: allowanceReceipt
  } = useEnsureAllowance();
  
  const { approve } = useTokenApprove();

  // Debug logging for global active tokens
  useEffect(() => {
    if (summary?.globalActiveTokens !== undefined) {
      console.log('[DEBUG] Global active tokens updated:', {
        globalActiveTokens: summary.globalActiveTokens.toString(),
        globalActiveFormatted: fromWei(summary.globalActiveTokens as bigint),
        usdValue: formatUSD(Number(fromWei((summary.globalActiveTokens as bigint) || 0n)) * Number(price || 0))
      });
    }
  }, [summary?.globalActiveTokens, price]);

  // Debug logging for user plan information
  useEffect(() => {
    if (summary?.userPlan !== undefined || userInfo) {
      console.log('[DEBUG] User plan information:', {
        summaryUserPlan: summary?.userPlan,
        selectedPlan,
        userInfoPlan: userInfo && Array.isArray(userInfo) ? userInfo[4] : 'N/A',
        planNames: {
          0: '400% APY',
          1: '750% APY', 
          2: '1400% APY'
        }
      });
    }
  }, [summary?.userPlan, selectedPlan, userInfo]);

  // Track client mounting to prevent hydration issues
  useEffect(() => {
    setIsClientMounted(true);
  }, []);

  // Debug logging for direct totalActive call
  useEffect(() => {
    console.log('[DEBUG] Direct totalActive hook data:', {
      totalActive: totalActive?.toString() || 'undefined',
      totalActiveFormatted: totalActive ? fromWei(totalActive as bigint) : 'N/A',
      isLoading: isTotalActiveLoading,
      error: totalActiveError?.message || 'none'
    });
  }, [totalActive, isTotalActiveLoading, totalActiveError]);

  // Redirect if not authenticated - enhanced logic
  useEffect(() => {
    // Enhanced debug logging for redirect decisions
    console.log('[DEBUG] Prize Program - Auth state check:', {
      isLoading,
      isAuthenticated,
      isRegistered,
      address: address ? `${address.slice(0, 6)}...${address.slice(-4)}` : 'undefined',
      shouldRedirect: !isLoading && (!isAuthenticated || !isRegistered)
    });

    // Only redirect if we're not loading and either not authenticated or not registered
    if (!isLoading && (!isAuthenticated || !isRegistered)) {
      console.log('[DEBUG] Prize Program - Redirecting to connect page with returnTo parameter');
      router.push('/connect?returnTo=/prize-program');
    }
  }, [isAuthenticated, isRegistered, isLoading, router, address]);

  // Auto-clear pending states if they get stuck (safety mechanism)
  useEffect(() => {
    if (pendingDepositAmount !== null && !isAllowancePending && allowanceReceipt?.isSuccess) {
      console.log('[DEBUG] Safety mechanism: clearing stuck pending state');
      setPendingDepositAmount(null);
      setPendingDepositPlan(null);
    }
  }, [pendingDepositAmount, isAllowancePending, allowanceReceipt?.isSuccess]);

  // Handle allowance receipt changes
  useEffect(() => {
    if (allowanceReceipt?.isSuccess) {
      console.log('[DEBUG] Allowance approval confirmed', {
        pendingDepositAmount: pendingDepositAmount?.toString(),
        pendingDepositPlan
      });
      
      if (pendingDepositAmount && pendingDepositPlan !== null) {
        console.log('[DEBUG] Proceeding with deposit after approval...');
        
        // Execute the pending deposit
        deposit(pendingDepositAmount, pendingDepositPlan);
        
        notify.success('Approval Successful', 'Token approval confirmed. Processing deposit...');
      } else {
        console.log('[DEBUG] Allowance approval confirmed without pending deposit');
        notify.success('Approval Successful', 'Token approval confirmed. You can now proceed with the deposit.');
      }
      
      // Always clear pending states after handling approval
      setPendingDepositAmount(null);
      setPendingDepositPlan(null);
    }
    
    if (allowanceReceipt?.isError) {
      console.error('[DEBUG] Allowance approval failed:', allowanceReceipt.error);
      
      // Clear pending states on error
      setPendingDepositAmount(null);
      setPendingDepositPlan(null);
      
      notify.error('Approval Failed', 'Token approval failed. Please try again.');
    }
  }, [allowanceReceipt?.isSuccess, allowanceReceipt?.isError, allowanceReceipt?.error, pendingDepositAmount, pendingDepositPlan, deposit, notify]);

  useEffect(() => {
    if (checkpointReceipt?.isSuccess) {
      refetchSummary();
      notify.success('Sync Successful', 'Data has been synchronized');
    }
  }, [checkpointReceipt?.isSuccess, refetchSummary, notify]);

  useEffect(() => {
    if (depositReceipt?.isSuccess) {
      refetchSummary();
      refetchBalance();
      setAmount('');
      notify.success('Deposit Successful', 'Your tokens have been deposited');
    }
  }, [depositReceipt?.isSuccess, refetchSummary, refetchBalance, notify]);

  useEffect(() => {
    if (claimReceipt?.isSuccess) {
      refetchSummary();
      setAmount('');
      notify.success('Claim Successful', 'Your rewards have been claimed');
    }
  }, [claimReceipt?.isSuccess, refetchSummary, notify]);

  useEffect(() => {
    if (upgradeReceipt?.isSuccess) {
      refetchSummary();
      notify.success('Upgrade Successful', 'Your plan has been upgraded');
    }
  }, [upgradeReceipt?.isSuccess, refetchSummary, notify]);

  useEffect(() => {
    if (moveWarmUpReceipt?.isSuccess) {
      console.log('[DEBUG] Move warm-up transaction successful, refetching data...');
      // Add a small delay before refetching to ensure blockchain state is updated
      setTimeout(() => {
        refetchSummary();
        notify.success('Activation Successful', 'Your warm-up tokens have been activated');
      }, 2000);
    }
  }, [moveWarmUpReceipt?.isSuccess, refetchSummary, notify]);

  // Handle transaction errors
  useEffect(() => {
    if (checkpointReceipt?.isError) {
      notify.error('Sync Failed', 'Failed to synchronize data');
    }
  }, [checkpointReceipt?.isError, notify]);

  useEffect(() => {
    if (depositReceipt?.isError) {
      notify.error('Deposit Failed', 'Failed to deposit tokens');
    }
  }, [depositReceipt?.isError, notify]);

  useEffect(() => {
    if (claimReceipt?.isError) {
      notify.error('Claim Failed', 'Failed to claim rewards');
    }
  }, [claimReceipt?.isError, notify]);

  useEffect(() => {
    if (upgradeReceipt?.isError) {
      notify.error('Upgrade Failed', 'Failed to upgrade plan');
    }
  }, [upgradeReceipt?.isError, notify]);

  useEffect(() => {
    if (moveWarmUpReceipt?.isError) {
      console.error('[ERROR] Move warm-up transaction failed:', moveWarmUpReceipt.error);
      
      const error = moveWarmUpReceipt.error;
      let errorMessage = 'Failed to activate warm-up tokens';
      
      // Handle specific BlockNotFoundError
      if (error?.message?.includes('Block at number') || error?.message?.includes('could not be found')) {
        console.warn('[WARN] Block not found error detected, transaction may still be successful');
        errorMessage = 'Transaction submitted but confirmation delayed. Please check your wallet for updates.';
        notify.warning('Confirmation Delayed', errorMessage);
        
        // Try to refetch data after a delay in case transaction actually succeeded
        setTimeout(() => {
          console.log('[DEBUG] Attempting to refetch data after block error...');
          refetchSummary();
        }, 10000);
        
        return;
      }
      
      // Handle other errors normally
      errorMessage = error?.message || errorMessage;
      notify.error('Activation Failed', errorMessage);
    }
  }, [moveWarmUpReceipt?.isError, moveWarmUpReceipt?.error, notify, refetchSummary]);

  // Show loading if checking auth - MOVED AFTER ALL HOOKS
  if (isLoading || !isAuthenticated || !isRegistered) {
    return <PageLoader message="Checking authentication..." />;
  }

  const handleSync = () => {
    checkpoint();
  };

  const handleSubmit = async () => {
    if (!amount) {
      notify.warning('Invalid Amount', 'Please enter a valid amount');
      return;
    }

    const amountWei = toWei(amount);
    if (amountWei <= 0n) {
      notify.warning('Invalid Amount', 'Please enter a valid amount');
      return;
    }

    // Check balance for burn transactions
    if (mode === 'burn' && balance && amountWei > (balance as bigint)) {
      notify.warning('Insufficient Balance', `You don't have enough PLAY tokens. Balance: ${fromWei(balance as bigint)} PLAY`);
      return;
    }

    try {
      if (mode === 'burn') {
        console.log('[DEBUG] Starting burn process with amount:', amountWei.toString());
        
        // Check current allowance first
        const allowance = (currentAllowance as bigint) || 0n;
        console.log('[DEBUG] Current allowance:', allowance.toString());
        
        if (allowance < amountWei) {
          console.log('[DEBUG] Insufficient allowance, requesting approval...');
          // Set a flag to track that we need to deposit after approval
          setPendingDepositAmount(amountWei);
          setPendingDepositPlan(selectedPlan);
          
          // Request approval with 10x amount for future transactions
          const approvalAmount = amountWei * 10n;
          approve(CONTRACT_ADDRESSES.ACTIVE_POOL, approvalAmount);
          
          // The actual deposit will be triggered by the allowanceReceipt success effect
          return;
        } else {
          console.log('[DEBUG] Sufficient allowance exists, proceeding with deposit...');
          // Sufficient allowance exists, proceed directly with deposit
          deposit(amountWei, selectedPlan);
        }
        
      } else {
        // Redeem flow - check claimable amount
        if (summary?.claimable && amountWei > (summary.claimable as bigint)) {
          notify.warning('Insufficient Claimable', `You can only claim up to ${fromWei(summary.claimable as bigint)} PLAY`);
          return;
        }
        
        console.log('[DEBUG] Executing claim transaction...');
        claimRewards(amountWei);
      }
    } catch (error: any) {
      console.error('[ERROR] Transaction failed:', error);
      notify.error(
        'Transaction Failed', 
        error.message || 'Failed to complete transaction. Please try again.'
      );
    }
  };

  const handleMax = () => {
    if (mode === 'burn') {
      // Use balance for deposit
      setAmount(Number(fromWei(balance as bigint || 0n)).toFixed(4));
    } else {
      // Use claimable for redeem
      setAmount(Number(fromWei(summary?.claimable as bigint || 0n)).toFixed(4));
    }
  };

  const handleUpgrade = () => {
    upgradePlan(selectedPlan);
  };

  const handleMoveWarmUp = async () => {
    try {
      console.log('[DEBUG] Moving warm-up tokens to active pool...');
      
      // Check if user has warm-up tokens
      if (!summary?.warmupAmount || summary.warmupAmount <= 0n) {
        notify.warning('No Warm-up Tokens', 'You don\'t have any warm-up tokens to activate.');
        return;
      }
      
      console.log('[DEBUG] Warm-up amount:', summary.warmupAmount.toString());
      moveWarmUpToActivePool();
    } catch (error: any) {
      console.error('[ERROR] Move warm-up failed:', error);
      notify.error('Move Failed', error.message || 'Failed to move warm-up tokens. Please try again.');
    }
  };

  // Calculate next prize amount
  const activeAmount = summary?.activeAmount || 0n;
  const epochRate = planEpochRatePct(selectedPlan) / 100;
  const nextPrizeAmount = Number(fromWei(activeAmount)) * epochRate;

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-4">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Prize Program</h1>
        <p className="text-muted-foreground">
          Earn rewards with our multi-level staking system
        </p>
      </div>

      {/* Action Bar */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="card-title-large card-title-centered">Action</CardTitle>

          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <ToggleGroup type="single" value={mode} onValueChange={(v: any) => v && setMode(v)}>
            <ToggleGroupItem value="burn">Stake</ToggleGroupItem>
            <ToggleGroupItem value="redeem">Redeem</ToggleGroupItem>
          </ToggleGroup>
          
          <div className="flex gap-2">
            <Input 
              placeholder="0.0000" 
              value={amount} 
              onChange={e => setAmount(e.target.value)} 
            />
            <Button 
              variant="secondary" 
              onClick={handleMax}
            >
              Max
            </Button>
            <Button 
              onClick={handleSubmit} 
              disabled={isDepositPending || isClaimPending || isAllowancePending || !amount || (pendingDepositAmount !== null)}
            >
              {(() => {
                // Debug button state
                console.log('[DEBUG] Button state:', {
                  isAllowancePending,
                  pendingDepositAmount: pendingDepositAmount?.toString() || 'null',
                  isDepositPending,
                  isClaimPending,
                  allowanceReceiptStatus: allowanceReceipt ? {
                    isSuccess: allowanceReceipt.isSuccess,
                    isError: allowanceReceipt.isError,
                    isPending: allowanceReceipt.isPending
                  } : 'null'
                });
                
                if (isAllowancePending) {
                  return (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Approving Token...
                    </>
                  );
                } else if (pendingDepositAmount !== null) {
                  return (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Waiting for Approval...
                    </>
                  );
                } else if (isDepositPending || isClaimPending) {
                  return (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Processing...
                    </>
                  );
                } else {
                  return mode === 'burn' ? 'Stake PLAY' : 'Redeem PLAY';
                }
              })()}
            </Button>
          </div>
          
          {mode === 'burn' && (
            <div className="flex gap-2 items-start">
              <div>
                <Select 
                  value={String(selectedPlan)} 
                  onValueChange={(v) => setSelectedPlan(Number(v) as PlanId)}
                >
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="APY Plan" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">400% APY</SelectItem>
                    <SelectItem value="1">750% APY</SelectItem>
                    <SelectItem value="2">1400% APY</SelectItem>
                  </SelectContent>
                </Select>
                {/* Show current plan info */}
                {summary?.userPlan !== undefined && (
                  <div className="text-xs text-muted-foreground mt-1">
                    Your current plan: {summary.userPlan === 0 ? '400%' : summary.userPlan === 1 ? '750%' : '1400%'} APY
                  </div>
                )}
              </div>
              <Button 
                variant="outline" 
                onClick={handleUpgrade}
                disabled={isUpgradePending}
              >
                {isUpgradePending ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                    Upgrading...
                  </>
                ) : (
                  'Upgrade'
                )}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Top Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="bg-gradient-to-b from-neutral-900 to-indigo-900">
          <CardHeader className="flex justify-between items-center card-content">
            <CardTitle className="card-title-large">
              Global Total Active
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center font-mono card-content">
            <div className="space-y-1">
              {isClientMounted && (summary?.globalActiveTokens || totalActive) ? (
                <div className="text-2xl font-bold font-mono">
                  {formatPlayAmount(((summary?.globalActiveTokens as bigint) || (totalActive as bigint)) || 0n)} PLAY
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2 text-muted-foreground">
                  <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-current"></div>
                  Loading...
                </div>
              )}
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-b from-neutral-900 to-indigo-900">
          <CardHeader>
            <CardTitle className="card-title-large">
              Staked
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center font-mono">
            <div className="text-2xl font-bold font-mono">
              {Number(fromWei(summary?.burned || 0n)).toFixed(4)} PLAY
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-b from-neutral-900 to-indigo-900">
          <CardHeader>
            <CardTitle className="card-title-large">
              Active Prize
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center font-mono">
            <div className="text-2xl font-bold font-mono">
              {Number(fromWei(summary?.activePrize || 0n)).toFixed(4)} PLAY
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Countdown + APY Plan */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="card-title-large">
              Next Rebase
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center font-mono">
            <CountdownClock seconds={summary?.countdownSec} />
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="card-title-large">
              APY Plan
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center font-mono">
            <div className="space-y-2">
              <div className="text-2xl font-bold font-mono">
                {planEpochRatePct(selectedPlan).toFixed(4)}%
              </div>
              {summary?.userPlan !== undefined && (
                <div className="text-sm text-muted-foreground">
                  {summary.userPlan === 0 ? '400%' : summary.userPlan === 1 ? '750%' : '1400%'} APY
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Claimable + Warmup */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="flex justify-between items-center">
            <CardTitle className="card-title-large">
              Claimable
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center font-mono">
            <div className="space-y-1">
              <div className="text-2xl font-bold font-mono">
                {isClientMounted && summary?.claimable !== undefined ? (
                  `${formatPlayAmount((summary.claimable as bigint) || 0n)} PLAY`
                ) : (
                  <div className="flex items-center justify-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                    Loading...
                  </div>
                )}
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end" style={{ visibility: 'hidden' }}>
            <Button
              onClick={() => claimRewards((summary?.claimable as bigint) || 0n)}
              disabled={isClaimPending || !summary?.claimable || (summary.claimable as bigint) <= 0n}
              variant="outline"
              size="sm"
            >
              {isClaimPending ? (
                <>
                  <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-current mr-1"></div>
                  Claiming...
                </>
              ) : (
                'Claim'
              )}
            </Button>
          </CardFooter>
        </Card>
        
        <Card>
          <CardHeader className="flex justify-between items-center">
            <CardTitle className="card-title-large">
              Warmup
            </CardTitle>
            <Button 
              variant="secondary" 
              onClick={handleMoveWarmUp}
              disabled={isMoveWarmUpPending || !summary?.warmupAmount || summary.warmupAmount <= 0n}
              size="sm"
            >
              {isMoveWarmUpPending ? (
                <>
                  <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-current mr-1"></div>
                  Moving...
                </>
              ) : (
                <>
                  <ArrowUp className="w-3 h-3 mr-1" />
                  Move to Active
                </>
              )}
            </Button>
          </CardHeader>
          <CardContent className="text-center font-mono">
            <div className="text-2xl font-bold font-mono">
              Warmup: {formatPlayAmount(summary?.warmupAmount || 0n)} PLAY
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Yield Information - Full Width */}
      <Card>
        <CardHeader>
          <CardTitle className="card-title-large">
            Yield Information
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center font-mono">
          <div className="text-2xl font-bold font-mono">
            Next Prize Amount: {formatPlayAmount(BigInt(Math.floor(nextPrizeAmount * (10**18))))} PLAY
          </div>
        </CardContent>
      </Card>
    </div>
  );
}