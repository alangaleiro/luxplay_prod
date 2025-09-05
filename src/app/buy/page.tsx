'use client';

import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

// Import hooks
import { useFormattedPrice } from '../../../hooks/useOracle';
import { useNotify } from '../../../hooks/useStore';

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
  RefreshCw
} from 'lucide-react';

export default function BuyPage() {
  const [fromAmount, setFromAmount] = useState('');
  const [toAmount, setToAmount] = useState('');
  const [fromToken, setFromToken] = useState<'USDT' | 'PLAY'>('USDT');
  const [toToken, setToToken] = useState<'USDT' | 'PLAY'>('PLAY');
  const [slippage, setSlippage] = useState('0.5');
  const [donatePercentage, setDonatePercentage] = useState('10');
  const [isLoading, setIsLoading] = useState(false);
  const [previewData, setPreviewData] = useState<any>(null);

  // Wagmi
  const { address, isConnected } = useAccount();

  // Store
  const notify = useNotify();

  // Contract data
  const { price: tokenPriceUSD } = useFormattedPrice();

  // Toggle token pair
  const handleSwapTokens = () => {
    const tempFrom = fromToken;
    const tempTo = toToken;
    const tempFromAmount = fromAmount;
    const tempToAmount = toAmount;
    
    setFromToken(tempTo);
    setToToken(tempFrom);
    setFromAmount(tempToAmount);
    setToAmount(tempFromAmount);
  };

  // Simulate quote calculation (in real implementation, this would call PlaySwap contract)
  const calculateQuote = async (amount: string, from: string, to: string) => {
    if (!amount || parseFloat(amount) <= 0) {
      setToAmount('');
      setPreviewData(null);
      return;
    }

    setIsLoading(true);
    try {
      // Simulate quote calculation
      // In real implementation: const quote = await usePlaySwapQuote(amount, from, to);
      const rate = from === 'USDT' && to === 'PLAY' ? 0.1 : 10; // Mock rate
      const outputAmount = parseFloat(amount) * rate;
      
      // Simulate donation calculation
      const donateAmount = parseFloat(amount) * (parseFloat(donatePercentage) / 100);
      const swapAmount = parseFloat(amount) - donateAmount;
      
      setToAmount(outputAmount.toFixed(6));
      setPreviewData({
        swapAmount: swapAmount.toFixed(6),
        donateAmount: donateAmount.toFixed(6),
        expectedOut: outputAmount.toFixed(6),
        minOut: (outputAmount * (1 - parseFloat(slippage) / 100)).toFixed(6),
        priceImpact: '0.1%',
        fee: '0.3%'
      });
    } catch (error) {
      console.error('Quote calculation failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle input changes
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (fromAmount) {
        calculateQuote(fromAmount, fromToken, toToken);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [fromAmount, fromToken, toToken, slippage, donatePercentage]);

  // Handle swap execution
  const handleSwap = async () => {
    if (!isConnected) {
      notify.warning('Wallet Required', 'Please connect your wallet to proceed');
      return;
    }

    if (!fromAmount || parseFloat(fromAmount) <= 0) {
      notify.warning('Invalid Amount', 'Please enter a valid amount');
      return;
    }

    try {
      setIsLoading(true);
      // In real implementation: await playSwap.swapAndDonate(amountIn);
      
      notify.info('Swap Initiated', 'Your swap transaction has been submitted');
      
      // Simulate transaction
      setTimeout(() => {
        notify.success('Swap Completed', `Successfully swapped ${fromAmount} ${fromToken} for ${toAmount} ${toToken}`);
        setFromAmount('');
        setToAmount('');
        setPreviewData(null);
        setIsLoading(false);
      }, 3000);
      
    } catch (error: any) {
      notify.error('Swap Failed', error?.message || 'Failed to execute swap');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative z-10">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 relative z-20">
        <div className="container flex h-14 items-center justify-between">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            LUXPLAY
          </h1>
          <nav className="hidden md:flex items-center space-x-4">
            <Button variant="ghost" asChild>
              <a href="/connect">Connect</a>
            </Button>
            <Button variant="ghost" asChild>
              <a href="/prize-program">Prize Program</a>
            </Button>
            <Button variant="ghost" asChild>
              <a href="/invite">Invite</a>
            </Button>
            <Button variant="default">Buy PLAY</Button>
          </nav>
          {address ? (
            <Badge variant="secondary" className="hidden sm:inline-flex">
              {address.slice(0, 6)}...{address.slice(-4)}
            </Badge>
          ) : (
            <Button variant="outline" asChild>
              <a href="/connect">Connect Wallet</a>
            </Button>
          )}
        </div>
      </header>

      <main className="container mx-auto max-w-4xl px-4 py-8">
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
                    You can explore the interface, but you'll need to connect your wallet to execute swaps.
                  </p>
                </div>
                <Button size="sm" variant="outline" asChild>
                  <a href="/connect">Connect Wallet</a>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Swap Interface */}
          <div className="lg:col-span-2 space-y-6">
            <div>
              <h2 className="text-3xl font-bold mb-2">Buy PLAY Tokens</h2>
              <p className="text-muted-foreground">
                Swap USDT for PLAY tokens with automatic donation to the prize pool
              </p>
            </div>

            {/* Swap Card */}
            <Card>
              <CardHeader>
                <CardTitle>
                  PlaySwap Exchange
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* From Token */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">From</label>
                    <Button variant="ghost" size="sm" disabled>
                      Balance: 0.00
                    </Button>
                  </div>
                  <div className="flex gap-2">
                    <Input
                      placeholder="0.00"
                      value={fromAmount}
                      onChange={(e) => setFromAmount(e.target.value)}
                      className="flex-1"
                      type="number"
                      step="0.000001"
                    />
                    <Button 
                      variant="outline" 
                      className="min-w-[100px]"
                      onClick={() => setFromToken(fromToken === 'USDT' ? 'PLAY' : 'USDT')}
                    >
                      <Coins className="w-4 h-4 mr-2" />
                      {fromToken}
                    </Button>
                    <Button variant="ghost" size="sm" disabled>
                      Max
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {TOKEN_CONFIG[fromToken].name} ({TOKEN_CONFIG[fromToken].decimals} decimals)
                  </p>
                </div>

                {/* Swap Button */}
                <div className="flex justify-center">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="rounded-full border"
                    onClick={handleSwapTokens}
                  >
                    <ArrowUpDown className="w-4 h-4" />
                  </Button>
                </div>

                {/* To Token */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">To</label>
                    <span className="text-xs text-muted-foreground">
                      {isLoading && <RefreshCw className="w-3 h-3 animate-spin inline mr-1" />}
                      {previewData && `Rate: 1 ${fromToken} = ${(parseFloat(toAmount) / parseFloat(fromAmount)).toFixed(6)} ${toToken}`}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <Input
                      placeholder="0.00"
                      value={toAmount}
                      readOnly
                      className="flex-1 bg-muted"
                    />
                    <Button 
                      variant="outline" 
                      className="min-w-[100px]"
                      onClick={() => setToToken(toToken === 'USDT' ? 'PLAY' : 'USDT')}
                    >
                      <Coins className="w-4 h-4 mr-2" />
                      {toToken}
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {TOKEN_CONFIG[toToken].name} ({TOKEN_CONFIG[toToken].decimals} decimals)
                  </p>
                </div>

                {/* Settings */}
                <div className="space-y-3 pt-4 border-t">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Slippage Tolerance</label>
                      <div className="flex gap-1">
                        {['0.1', '0.5', '1.0'].map((value) => (
                          <Button
                            key={value}
                            variant={slippage === value ? "default" : "outline"}
                            size="sm"
                            onClick={() => setSlippage(value)}
                            className="flex-1"
                          >
                            {value}%
                          </Button>
                        ))}
                        <Input
                          placeholder="Custom"
                          value={slippage}
                          onChange={(e) => setSlippage(e.target.value)}
                          className="w-20"
                          size={1}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Donation %</label>
                      <div className="flex gap-1">
                        {['5', '10', '15'].map((value) => (
                          <Button
                            key={value}
                            variant={donatePercentage === value ? "default" : "outline"}
                            size="sm"
                            onClick={() => setDonatePercentage(value)}
                            className="flex-1"
                          >
                            {value}%
                          </Button>
                        ))}
                        <Input
                          placeholder="Custom"
                          value={donatePercentage}
                          onChange={(e) => setDonatePercentage(e.target.value)}
                          className="w-20"
                          size={1}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Swap Button */}
                <Button 
                  className="w-full" 
                  size="lg"
                  onClick={handleSwap}
                  disabled={!isConnected || isLoading || !fromAmount || parseFloat(fromAmount) <= 0}
                >
                  {isLoading ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : !isConnected ? (
                    'Connect Wallet to Swap'
                  ) : (
                    `Swap ${fromToken} for ${toToken}`
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Preview Details */}
            {previewData && (
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
                        <span>{previewData.swapAmount} {fromToken}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Donation Amount:</span>
                        <span className="text-green-600">{previewData.donateAmount} {fromToken}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Expected Output:</span>
                        <span>{previewData.expectedOut} {toToken}</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Minimum Output:</span>
                        <span>{previewData.minOut} {toToken}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Price Impact:</span>
                        <span className="text-yellow-600">{previewData.priceImpact}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Network Fee:</span>
                        <span>{previewData.fee}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span className="text-sm font-medium">Donation Benefit</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Your {donatePercentage}% donation helps fund the prize pool and supports the platform.
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Token Prices */}
            <Card>
              <CardHeader>
                <CardTitle>
                  Token Prices
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                      P
                    </div>
                    <div>
                      <p className="font-medium">PLAY</p>
                      <p className="text-xs text-muted-foreground">Play Token</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">{formatUSD(tokenPriceUSD)}</p>
                    <p className="text-xs text-green-500">+2.4%</p>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                      U
                    </div>
                    <div>
                      <p className="font-medium">USDT</p>
                      <p className="text-xs text-muted-foreground">Tether USD</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">$1.00</p>
                    <p className="text-xs text-muted-foreground">~</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Contract Information */}
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

            {/* PlaySwap Features */}
            <Card>
              <CardHeader>
                <CardTitle>PlaySwap Features</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Automatic donation to prize pool</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Low slippage trading</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Integrated with Active Pool</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>MEV protection</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}