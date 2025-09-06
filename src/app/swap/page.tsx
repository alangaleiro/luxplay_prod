'use client';

import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

// Import hooks
import { useNotify } from '../../../hooks/useStore';
import { 
  usePlaySwap, 
  usePreviewBuyWithDonation,
  useUSDTBalance,
  useUSDTAllowance 
} from '../../../hooks/usePlaySwap';

// Import utilities
import { toWei, fromWei, formatUSD, safeFromWei } from '../../../lib/utils';
import { CONTRACT_ADDRESSES, TOKEN_CONFIG } from '../../../lib/contracts';

// Icons
import { 
  ArrowUpDown, 
  Wallet, 
  TrendingUp, 
  Info,
  ExternalLink,
  Zap,
  DollarSign,
  Coins,
  AlertCircle,
  CheckCircle,
  RefreshCw,
  Heart
} from 'lucide-react';

export default function SwapPage() {
  const [inputAmount, setInputAmount] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [swapDirection, setSwapDirection] = useState<'USDT_TO_PLAY' | 'PLAY_TO_USDT'>('USDT_TO_PLAY');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);
  
  // Wagmi
  const { address, isConnected } = useAccount();

  // Store
  const notify = useNotify();

  // PlaySwap hooks
  const playSwap = usePlaySwap();
  const usdtBalance = useUSDTBalance(address);
  const usdtAllowance = useUSDTAllowance(address);
  
  // Preview data
  const inputAmountBN = inputAmount ? toWei(inputAmount, 6) : undefined; // USDT has 6 decimals
  const previewData = usePreviewBuyWithDonation(inputAmountBN);

  // Handle input changes
  const handleInputChange = (value: string) => {
    // Only allow positive numbers with up to 6 decimal places (USDT precision)
    const regex = /^\d*\.?\d{0,6}$/;
    if (regex.test(value) || value === '') {
      setInputAmount(value);
    }
  };

  // Handle max button
  const handleMaxAmount = () => {
    if (usdtBalance.data) {
      const maxAmount = safeFromWei(usdtBalance.data as bigint, 6);
      setInputAmount(maxAmount.toString());
    }
  };

  // Handle approval
  const handleApprove = async () => {
    if (!inputAmountBN || !isConnected) {
      notify.warning('Invalid Input', 'Please enter a valid amount and connect your wallet');
      return;
    }

    try {
      setIsProcessing(true);
      await playSwap.ensureUSDTAllowance(inputAmountBN);
      notify.success('Approval Successful', 'USDT approval completed successfully');
    } catch (error: any) {
      notify.error('Approval Failed', error?.message || 'Failed to approve USDT');
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle swap
  const handleSwap = async () => {
    console.log('[DEBUG] Swap button clicked!');
    
    if (!inputAmountBN || !isConnected) {
      notify.warning('Invalid Input', 'Please enter a valid amount and connect your wallet');
      return;
    }

    if (!usdtBalance.data || (usdtBalance.data as bigint) < inputAmountBN) {
      notify.warning('Insufficient Balance', 'You don\'t have enough USDT for this swap');
      return;
    }

    try {
      setIsProcessing(true);
      
      // Check if approval is needed
      if (playSwap.needsApproval(inputAmountBN)) {
        notify.info('Approval Required', 'Approving USDT first...');
        await playSwap.ensureUSDTAllowance(inputAmountBN);
      }

      // Execute swap
      notify.info('Swap Initiated', 'Executing swap and donation...');
      await playSwap.swapAndDonate(inputAmountBN);
      
      // Wait for confirmation
      if (playSwap.swapReceipt?.isSuccess) {
        notify.success('Swap Completed', 'Successfully swapped USDT for PLAY tokens!');
        setInputAmount('');
        // Refetch balances
        await playSwap.refetchUSDTBalance();
      }
      
    } catch (error: any) {
      notify.error('Swap Failed', error?.message || 'Failed to execute swap');
    } finally {
      setIsProcessing(false);
    }
  };

  // Check if user needs approval
  const needsApproval = inputAmountBN ? playSwap.needsApproval(inputAmountBN) : false;
  
  // Debug logging
  console.log('[DEBUG] Swap page state:', {
    inputAmount,
    inputAmountBN: inputAmountBN?.toString(),
    isConnected,
    usdtBalance: usdtBalance.data?.toString(),
    usdtAllowance: usdtAllowance.data?.toString(),
    needsApproval,
    isProcessing,
    previewData: previewData.data,
    buttonDisabled: {
      notConnected: !isConnected,
      processing: isProcessing,
      noInputAmount: !inputAmount,
      invalidAmount: parseFloat(inputAmount) <= 0,
      overall: !isConnected || isProcessing || !inputAmount || parseFloat(inputAmount) <= 0
    }
  });
  
  // Format preview data
  const formatPreviewData = () => {
    // Handle simulation result structure
    const result = previewData.data?.result || previewData.data;
    
    if (!result || !Array.isArray(result)) {
      console.log('[DEBUG] No preview data available:', previewData);
      return null;
    }
    
    const [swapAmt, donateAmt, expectedOut, minOut] = result as unknown as [bigint, bigint, bigint, bigint];
    
    return {
      swapAmount: safeFromWei(swapAmt, 6), // USDT amount used for swap
      donateAmount: safeFromWei(donateAmt, 6), // USDT amount donated
      expectedOut: safeFromWei(expectedOut, 18), // Expected PLAY tokens
      minOut: safeFromWei(minOut, 18), // Minimum PLAY tokens (with slippage)
    };
  };

  const preview = formatPreviewData();

  if (!mounted) {
    return <div suppressHydrationWarning />;
  }

  return (
    <div className="min-h-screen p-6">
      <div className="container mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Token Swap</h1>
          <p className="text-muted-foreground">
            Swap USDT for PLAY tokens with automatic donation to the prize pool
          </p>
        </div>

        {/* Wallet Connection Notice */}
        {!isConnected && (
          <Card className="border-blue-700/50 bg-blue-900/20 shadow-blue-900/10 mb-8">
            <CardContent className="py-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-700/30 border border-blue-600/40 rounded-full flex items-center justify-center">
                  <Wallet className="w-4 h-4 text-blue-600 dark:text-blue-300" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                    Connect your wallet to start trading
                  </p>
                  <p className="text-xs text-blue-700 dark:text-blue-300">
                    You'll need to connect your wallet to execute swaps and approvals.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="space-y-6">
          {/* Main Swap Interface */}
          <div className="space-y-6">
            {/* Swap Card */}
            <Card>
              <CardHeader>
                <CardTitle>
                  PlaySwap Exchange
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* From Token */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">From</label>
                    <div className="text-xs text-muted-foreground">
                      Balance: {swapDirection === 'USDT_TO_PLAY' 
                        ? (usdtBalance.data ? safeFromWei(usdtBalance.data as bigint, 6) : '0.00') + ' USDT'
                        : '0.00 PLAY'
                      }
                    </div>
                  </div>
                  <div className="flex items-center gap-2 p-3 bg-secondary/50 rounded-lg">
                    <Input
                      placeholder="0.00"
                      value={inputAmount}
                      onChange={(e) => handleInputChange(e.target.value)}
                      className="flex-1 border-0 bg-transparent text-lg font-semibold focus-visible:ring-0 px-0"
                      type="text"
                    />
                    <Button 
                      variant="outline" 
                      className="min-w-[100px]"
                      disabled
                    >
                      {swapDirection === 'USDT_TO_PLAY' ? (
                        <><Coins className="w-4 h-4 mr-2" />USDT</>
                      ) : (
                        <><div className="w-4 h-4 mr-2 bg-primary rounded-full" />PLAY</>
                      )}
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={handleMaxAmount}
                      disabled={swapDirection === 'USDT_TO_PLAY' ? !usdtBalance.data : true}
                    >
                      Max
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {swapDirection === 'USDT_TO_PLAY' ? 'Tether USD (6 decimals)' : 'Play Token (18 decimals)'}
                  </p>
                </div>

                {/* Swap Arrow */}
                <div className="flex justify-center">
                  <Button
                    variant="outline"
                    size="icon"
                    className="rounded-full"
                    onClick={() => {
                      setSwapDirection(prev => 
                        prev === 'USDT_TO_PLAY' ? 'PLAY_TO_USDT' : 'USDT_TO_PLAY'
                      );
                    }}
                  >
                    <ArrowUpDown className="w-4 h-4" />
                  </Button>
                </div>

                {/* To Token */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">To</label>
                    <div className="text-xs text-muted-foreground">
                      Expected: {swapDirection === 'USDT_TO_PLAY' 
                        ? (preview?.expectedOut || '0.00') + ' PLAY'
                        : '0.00 USDT'
                      }
                    </div>
                  </div>
                  <div className="flex items-center gap-2 p-3 bg-secondary/50 rounded-lg">
                    <Input
                      placeholder="0.00"
                      value={swapDirection === 'USDT_TO_PLAY' ? (preview?.expectedOut || '') : '0.00'}
                      className="flex-1 border-0 bg-transparent text-lg font-semibold focus-visible:ring-0 px-0"
                      disabled
                    />
                    <Button 
                      variant="outline" 
                      className="min-w-[100px]"
                      disabled
                    >
                      {swapDirection === 'USDT_TO_PLAY' ? (
                        <><div className="w-4 h-4 mr-2 bg-primary rounded-full" />PLAY</>
                      ) : (
                        <><Coins className="w-4 h-4 mr-2" />USDT</>
                      )}
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {swapDirection === 'USDT_TO_PLAY' ? 'Play Token (18 decimals)' : 'Tether USD (6 decimals)'}
                  </p>
                </div>

                <div className="h-[1px] bg-border w-full my-2" />

                {/* Action Buttons */}
                <div className="space-y-3">
                  {needsApproval && (
                    <Button 
                      className="w-full" 
                      size="lg"
                      onClick={handleApprove}
                      disabled={!isConnected || isProcessing || !inputAmount || parseFloat(inputAmount) <= 0}
                      variant="outline"
                    >
                      {isProcessing && playSwap.isApprovingUSDT ? (
                        <>
                          <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                          Approving USDT...
                        </>
                      ) : (
                        <>
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Approve USDT
                        </>
                      )}
                    </Button>
                  )}
                  
                  <Button 
                    className="w-full" 
                    size="lg"
                    onClick={handleSwap}
                    disabled={
                      !isConnected || 
                      isProcessing || 
                      !inputAmount || 
                      parseFloat(inputAmount) <= 0
                    }
                  >
                    {isProcessing && playSwap.isSwapping ? (
                      <>
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                        Swapping...
                      </>
                    ) : !isConnected ? (
                      'Connect Wallet to Swap'
                    ) : needsApproval ? (
                      <>
                        <Heart className="w-4 h-4 mr-2" />
                        Approve & Swap
                      </>
                    ) : (
                      <>
                        <Heart className="w-4 h-4 mr-2" />
                        Swap & Donate
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Preview Details */}
            {preview && (
              <Card>
                <CardHeader>
                  <CardTitle>
                    Swap Preview
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Swap Amount:</span>
                        <span>{preview.swapAmount} USDT</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Donation Amount:</span>
                        <span className="text-green-600">{preview.donateAmount} USDT</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Expected Out:</span>
                        <span>{preview.expectedOut} PLAY</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Minimum Out:</span>
                        <span>{preview.minOut} PLAY</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-4 p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                    <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                      <Heart className="w-4 h-4" />
                      <span className="text-sm font-medium">
                        Your swap includes a donation to the prize pool!
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Contract Information Section */}
        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle>
                Contract Info
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <div>
                  <p className="text-sm font-medium">PlaySwap Contract</p>
                  <p className="text-xs text-muted-foreground break-all">
                    {CONTRACT_ADDRESSES.PLAYSWAP}
                  </p>
                </div>
                <div className="h-[1px] bg-border w-full my-2" />
                <div>
                  <p className="text-sm font-medium">PLAY Token</p>
                  <p className="text-xs text-muted-foreground break-all">
                    {CONTRACT_ADDRESSES.PLAY_TOKEN}
                  </p>
                </div>
                <div className="h-[1px] bg-border w-full my-2" />
                <div>
                  <p className="text-sm font-medium">USDT Token</p>
                  <p className="text-xs text-muted-foreground break-all">
                    {CONTRACT_ADDRESSES.USDT_TOKEN}
                  </p>
                </div>
              </div>

              <Button variant="outline" size="sm" className="w-full">
                <ExternalLink className="w-4 h-4 mr-2" />
                View on Explorer
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}