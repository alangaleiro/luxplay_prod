'use client';

import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PageLoader } from '@/components/PageLoader';
import { useAuth } from '@/contexts/AuthContext';

// Import hooks
import { 
  useClaimReferralRewards,
  useUserInfo,
  useReferralPendingReward,
  useViewUserTotals,
  useViewRemainingReferralCapPct,
  useViewDownlineActiveCount,
  useViewDownlinesStakeByPlanAndLevel,
  useTotalReferralAccrued
} from '../../../hooks/useActivePool';
import { useFormattedPrice } from '../../../hooks/useOracle';
import { useNetworkingData } from '../../../hooks/useUserContract';
import { useNotify } from '../../../hooks/useStore';

// Import utilities
import { fromWei, formatUSD, safeFromWei } from '../../../lib/utils';
import { CONTRACT_ADDRESSES } from '../../../lib/contracts';

// Icons
import { Users, DollarSign, TrendingUp, Zap, Gift } from 'lucide-react';

// APY Plan types
type APYPlan = '400' | '750' | '1400';
const APY_PLANS: { id: APYPlan; label: string; planIndex: number }[] = [
  { id: '400', label: '400% APY', planIndex: 0 },
  { id: '750', label: '750% APY', planIndex: 1 },
  { id: '1400', label: '1400% APY', planIndex: 2 }
];

export default function InviteProgramPage() {
  // Wagmi
  const { address, isConnected } = useAccount();
  const router = useRouter();
  const { isAuthenticated, isRegistered, isLoading } = useAuth();

  // Notifications
  const notify = useNotify();

  // APY Plan filter state
  const [selectedAPYPlan, setSelectedAPYPlan] = useState<APYPlan>('400');

  // Redirect if not authenticated - enhanced logic to allow staying on invite page
  useEffect(() => {
    // Enhanced debug logging for redirect decisions
    console.log('[DEBUG] Invite Program - Auth state check:', {
      isLoading,
      isAuthenticated,
      isRegistered,
      address: address ? `${address.slice(0, 6)}...${address.slice(-4)}` : 'undefined',
      shouldRedirect: !isLoading && (!isAuthenticated || !isRegistered)
    });

    // Only redirect if we're not loading and either not authenticated or not registered
    // If user is authenticated AND registered, let them stay on invite page
    if (!isLoading && (!isAuthenticated || !isRegistered)) {
      console.log('[DEBUG] Invite Program - User not authenticated or not registered, redirecting to connect page with returnTo parameter');
      router.push('/connect?returnTo=/invite');
    } else if (!isLoading && isAuthenticated && isRegistered) {
      console.log('[DEBUG] Invite Program - User authenticated and registered, staying on invite page');
      // User is fully authenticated and registered - stay on invite page
    }
  }, [isAuthenticated, isRegistered, isLoading, router, address]);

  // Show loading if checking auth
  if (isLoading || !isAuthenticated || !isRegistered) {
    return <PageLoader message="Verificando autenticação..." />;
  }

  // Active Pool hooks
  const { 
    claimReferralRewards, 
    isPending: isClaimPending,
    receipt: claimReceipt
  } = useClaimReferralRewards();

  const { 
    data: userInfo, 
    isLoading: isUserInfoLoading 
  } = useUserInfo(address);

  const { 
    data: pendingRewards, 
    isLoading: isPendingRewardsLoading 
  } = useReferralPendingReward(address);

  const { 
    data: userTotals, 
    isLoading: isUserTotalsLoading 
  } = useViewUserTotals(address);

  const { 
    data: referralCap, 
    isLoading: isReferralCapLoading 
  } = useViewRemainingReferralCapPct(address);

  const { 
    data: totalReferralReceived, 
    isLoading: isTotalReferralLoading 
  } = useTotalReferralAccrued(address);

  const { 
    data: downlineCounts, 
    isLoading: isDownlineCountsLoading 
  } = useViewDownlineActiveCount(address);

  const { 
    data: downlineStakes, 
    isLoading: isDownlineStakesLoading 
  } = useViewDownlinesStakeByPlanAndLevel(address);

  // Oracle hooks
  const { 
    price, 
    isLoading: isPriceLoading 
  } = useFormattedPrice();

  // User Contract hooks
  const networkingData = useNetworkingData(address);

  // Get filtered downline stakes based on selected APY plan
  const getFilteredDownlineStakes = () => {
    if (!downlineStakes || !Array.isArray(downlineStakes)) return Array(15).fill(0n);
    
    const selectedPlanIndex = APY_PLANS.find(plan => plan.id === selectedAPYPlan)?.planIndex || 0;
    return downlineStakes[selectedPlanIndex] || Array(15).fill(0n);
  };

  const filteredDownlineStakes = getFilteredDownlineStakes();

  // Debug logging for invite page data
  useEffect(() => {
    console.log('[DEBUG] ===== INVITE PAGE DATA STATE =====');
    console.log('[DEBUG] Basic Info:', {
      address: address ? `${address.slice(0, 6)}...${address.slice(-4)}` : 'undefined',
      isConnected,
      isAuthenticated,
      isRegistered
    });
    
    console.log('[DEBUG] Contract Addresses:', {
      ACTIVE_POOL: CONTRACT_ADDRESSES.ACTIVE_POOL,
      USER_CONTRACT: CONTRACT_ADDRESSES.USER_CONTRACT
    });
    
    console.log('[DEBUG] ACTIVE_POOL Hooks (ISSUE):', {
      userInfo: {
        data: userInfo ? (Array.isArray(userInfo) ? `Array(${userInfo.length})` : 'Object') : 'undefined',
        rawData: userInfo,
        principal: (userInfo as any)?.[1]?.toString() || 'undefined',
        isLoading: isUserInfoLoading
      },
      pendingRewards: {
        data: pendingRewards?.toString() || 'undefined',
        rawData: pendingRewards,
        isLoading: isPendingRewardsLoading
      },
      totalReferralReceived: {
        data: totalReferralReceived?.toString() || 'undefined',
        rawData: totalReferralReceived,
        isLoading: isTotalReferralLoading
      },
      referralCap: {
        data: referralCap ? (Array.isArray(referralCap) ? `Array(${referralCap.length})` : 'Object') : 'undefined',
        rawData: referralCap,
        isLoading: isReferralCapLoading
      },
      downlineStakes: {
        data: downlineStakes ? (Array.isArray(downlineStakes) ? `Array(${downlineStakes.length})` : 'Object') : 'undefined',
        structure: downlineStakes && Array.isArray(downlineStakes) ? {
          plan0_400APY: downlineStakes[0] ? `Array(${Array.isArray(downlineStakes[0]) ? downlineStakes[0].length : 'not array'})` : 'undefined',
          plan1_750APY: downlineStakes[1] ? `Array(${Array.isArray(downlineStakes[1]) ? downlineStakes[1].length : 'not array'})` : 'undefined',
          plan2_1400APY: downlineStakes[2] ? `Array(${Array.isArray(downlineStakes[2]) ? downlineStakes[2].length : 'not array'})` : 'undefined'
        } : 'N/A',
        selectedAPYPlan,
        filteredData: filteredDownlineStakes ? `Array(${filteredDownlineStakes.length})` : 'undefined',
        isLoading: isDownlineStakesLoading
      }
    });
    
    console.log('[DEBUG] USER_CONTRACT Hooks (WORKING):', {
      networkingData: {
        data: networkingData ? 'loaded' : 'undefined',
        referrals: networkingData?.referrals ? `Array(${(networkingData.referrals as any[]).length})` : 'undefined',
        downlineCounts: networkingData?.downlineCounts ? `Array(${(networkingData.downlineCounts as any[]).length})` : 'undefined',
        referrer: networkingData?.referrer || 'undefined',
        isRegistered: networkingData?.isRegistered || false,
        isActive: networkingData?.isActive || false
      }
    });
    
    console.log('[DEBUG] ===== END INVITE PAGE DATA =====');
  }, [address, isConnected, isAuthenticated, isRegistered, userInfo, pendingRewards, userTotals, referralCap, totalReferralReceived, downlineCounts, downlineStakes, price, networkingData, selectedAPYPlan, filteredDownlineStakes, isUserInfoLoading, isPendingRewardsLoading, isUserTotalsLoading, isReferralCapLoading, isTotalReferralLoading, isDownlineCountsLoading, isDownlineStakesLoading]);

  // Handle successful claim
  useEffect(() => {
    if (claimReceipt?.isSuccess) {
      notify.success('Claim Successful', 'Your referral rewards have been claimed');
    }
  }, [claimReceipt?.isSuccess, notify]);

  // Handle claim error
  useEffect(() => {
    if (claimReceipt?.isError) {
      notify.error('Claim Failed', 'Failed to claim referral rewards');
    }
  }, [claimReceipt?.isError, notify]);

  const handleClaim = () => {
    const available = (pendingRewards as bigint) || 0n;
    if (available > 0n) {
      claimReferralRewards(available);
    } else {
      notify.warning('No Rewards', 'You have no available referral rewards to claim');
    }
  };

  // Check if user is new (no deposits made)
  const isNewUser = (
    (!userInfo || (Array.isArray(userInfo) && userInfo[1] && (userInfo[1] as bigint) === 0n)) && // No principal (burned)
    (!pendingRewards || (pendingRewards as bigint) === 0n) && // No pending rewards
    (!totalReferralReceived || (totalReferralReceived as bigint) === 0n) // No referral received
  );

  // Check if user has deposits but no referral data yet
  const hasDepositsButNoReferrals = (
    userInfo && Array.isArray(userInfo) && userInfo[1] && (userInfo[1] as bigint) > 0n && // Has deposits
    (!referralCap || (Array.isArray(referralCap) && (referralCap[2] as bigint) === 0n)) // No referral cap set
  );

  // Calculate USD deposited
  const burned = (userInfo as any)?.[1] || 0n; // principal from userInfo[1]
  const usdDeposited = Number(fromWei(burned)) * Number(price || 0);

  // Unlock thresholds with filtered data
  const unlockThresholds = Array.from({ length: 15 }, (_, i) => ({
    level: i + 1,
    threshold: (i + 1) * 100, // $100, $200, $300, etc.
    users: (downlineCounts as any)?.[i] || 0,
    volume: filteredDownlineStakes[i] || 0n,
    totalVolume: downlineStakes ? 
      ((downlineStakes as any)[0]?.[i] || 0n) + 
      ((downlineStakes as any)[1]?.[i] || 0n) + 
      ((downlineStakes as any)[2]?.[i] || 0n) : 0n,
    unlocked: usdDeposited >= (i + 1) * 100
  }));

  return (
    <div className="container mx-auto py-8 max-w-6xl">
      <div className="text-center space-y-2 mb-8">
        <h1 className="text-3xl font-bold">Invite Program</h1>
        <p className="text-muted-foreground">
          Build your network and earn from referrals
        </p>
      </div>

      {/* Show connection status for debugging */}
      {!address && (
        <div className="mb-4 p-4 bg-yellow-100 dark:bg-yellow-900 border border-yellow-200 dark:border-yellow-800 rounded-lg">
          <p className="text-yellow-800 dark:text-yellow-200">
            ⚠️ Wallet not connected. Please connect your wallet to view invite program data.
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Invite Section */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Invite Program
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {isNewUser ? (
                <div className="text-center py-4 space-y-3">
                  <div className="text-muted-foreground">
                    👋 Welcome to LuxPlay!
                  </div>
                  <p className="text-sm text-muted-foreground">
                    You haven't made any deposits yet. Start by staking PLAY tokens in the Prize Program to unlock referral rewards.
                  </p>
                  <Button 
                    onClick={() => router.push('/prize-program')}
                    className="mt-2"
                  >
                    Start Staking PLAY
                  </Button>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between">
                    <div>My Total Burned</div>
                    <Badge variant="secondary">
                      {isUserInfoLoading ? (
                        <div className="flex items-center gap-2">
                          <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-current"></div>
                          Loading...
                        </div>
                      ) : (
                        fromWei(burned || 0n) + ' PLAY'
                      )}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>Available</div>
                    <div className="flex gap-2 items-center">
                      <Badge variant="secondary">
                        {isPendingRewardsLoading ? (
                          <div className="flex items-center gap-2">
                            <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-current"></div>
                            Loading...
                          </div>
                        ) : (
                          fromWei((pendingRewards as bigint) || 0n) + ' PLAY'
                        )}
                      </Badge>
                      <Button 
                        onClick={handleClaim}
                        disabled={isClaimPending || !pendingRewards || (pendingRewards as bigint) <= 0n}
                        size="sm"
                      >
                        {isClaimPending ? (
                          <>
                            <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-1"></div>
                            Claiming...
                          </>
                        ) : (
                          'Claim'
                        )}
                      </Button>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>Total Received</div>
                    <Badge variant="secondary">
                      {isTotalReferralLoading ? (
                        <div className="flex items-center gap-2">
                          <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-current"></div>
                          Loading...
                        </div>
                      ) : (
                        fromWei((totalReferralReceived as bigint) || 0n) + ' PLAY'
                      )}
                    </Badge>
                  </div>
                  
                  <div className="pt-2 text-sm text-muted-foreground">
                    Remaining Cap: {isReferralCapLoading ? (
                      <span className="inline-flex items-center gap-1">
                        <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-current"></div>
                        Loading...
                      </span>
                    ) : (
                      formatUSD(Number(fromWei((referralCap as any)?.remaining || 0n)) * Number(price || 0))
                    )} 
                    (approx)
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Limits Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="w-5 h-5" />
                Limits
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isNewUser ? (
                <div className="text-center py-4">
                  <p className="text-sm text-muted-foreground">
                    Your referral limits will appear here once you start staking PLAY tokens.
                  </p>
                </div>
              ) : hasDepositsButNoReferrals ? (
                <div className="text-center py-4 space-y-2">
                  <p className="text-sm text-muted-foreground">
                    🎯 Referral cap is being calculated based on your {fromWei(burned)} PLAY stake.
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Your referral earning limits will be set once you invite your first user.
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Current Cap:</span>
                    <span>
                      {isReferralCapLoading ? (
                        <div className="flex items-center gap-2">
                          <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-current"></div>
                          Loading...
                        </div>
                      ) : (
                        formatUSD(Number(fromWei((referralCap as any)?.[2] || 0n)) * Number(price || 0))
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Remaining:</span>
                    <span>
                      {isReferralCapLoading ? (
                        <div className="flex items-center gap-2">
                          <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-current"></div>
                          Loading...
                        </div>
                      ) : (
                        formatUSD(Number(fromWei((referralCap as any)?.[1] || 0n)) * Number(price || 0))
                      )}
                    </span>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-2">
                    <div 
                      className="bg-primary h-2 rounded-full" 
                      style={{ 
                        width: `${(referralCap as any)?.[0] ? Number((referralCap as any)[0]) / 100 : 0}%` 
                      }}
                    ></div>
                  </div>
                  <div className="text-right text-sm text-muted-foreground">
                    {(referralCap as any)?.[0] ? (Number((referralCap as any)[0]) / 100).toFixed(2) : '0'}% used
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Networking Section */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Networking (Affiliate Structure)
              </CardTitle>
              
              {/* APY Plan Filter Buttons */}
              <div className="flex flex-wrap gap-2 pt-4">
                {APY_PLANS.map((plan) => (
                  <Button
                    key={plan.id}
                    variant={selectedAPYPlan === plan.id ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedAPYPlan(plan.id)}
                    className={`${selectedAPYPlan === plan.id ? 'bg-primary text-primary-foreground' : ''}`}
                  >
                    {plan.label}
                  </Button>
                ))}
              </div>
              
              {/* Show current filter info */}
              <div className="text-sm text-muted-foreground">
                Showing stake volumes for {APY_PLANS.find(p => p.id === selectedAPYPlan)?.label} plan
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {unlockThresholds.map((item) => (
                  <div 
                    key={item.level} 
                    className="flex items-center justify-between p-3 rounded-lg border"
                  >
                    <div className="space-y-1">
                      <div className="font-medium">Level {item.level}</div>
                      <div className="text-sm text-muted-foreground">
                        {item.users} users • {fromWei(item.volume)} PLAY volume
                        {item.totalVolume !== item.volume && (
                          <span className="text-xs text-muted-foreground block">
                            (Total all plans: {fromWei(item.totalVolume)} PLAY)
                          </span>
                        )}
                      </div>
                    </div>
                    <Badge 
                      variant={item.unlocked ? "default" : "secondary"}
                      className={item.unlocked ? "bg-green-500" : ""}
                    >
                      {item.unlocked ? "Unlocked" : `Unlock at $${item.threshold}`}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Referrer Info */}
          {(() => {
            if (networkingData?.referrer && typeof networkingData.referrer === 'string') {
              return (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Gift className="w-5 h-5" />
                      Your Referrer
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <span>Referrer Address:</span>
                      <Badge variant="secondary">
                        {(networkingData.referrer as string).slice(0, 6)}...{(networkingData.referrer as string).slice(-4)}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              );
            }
            return null;
          })()}
        </div>
      </div>
    </div>
  );
}