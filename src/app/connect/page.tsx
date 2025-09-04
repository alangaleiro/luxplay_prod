'use client';

import { useState, useEffect } from 'react';
import { useAccount, useConnect } from 'wagmi';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { useRegister, useIsRegistered } from '../../../hooks/useUserContract';
import { useNotify } from '../../../hooks/useStore';
import { isAddress } from 'viem';

// Icons
import { 
  Wallet, 
  Users, 
  CheckCircle, 
  AlertCircle, 
  ExternalLink,
  RefreshCw,
  ArrowRight,
  Shield,
  Link as LinkIcon
} from 'lucide-react';

export default function ConnectPage() {
  // Wagmi hooks
  const { address, isConnected, isConnecting } = useAccount();
  const { connect, connectors, isPending: isConnectPending, error: connectError } = useConnect();
  
  // Router and search params
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnTo = searchParams.get('returnTo') || '/prize-program';
  const refParam = searchParams.get('ref'); // Referral parameter
  
  // Auth context
  const { isAuthenticated, isRegistered, isLoading: isAuthLoading } = useAuth();
  
  // Local state
  const [sponsorAddress, setSponsorAddress] = useState(refParam || '');
  const [isValidSponsor, setIsValidSponsor] = useState(false);
  const [showSponsorForm, setShowSponsorForm] = useState(false);
  
  // Hooks
  const notify = useNotify();
  const { data: registrationStatus, isLoading: isCheckingRegistration } = useIsRegistered(address);
  const { 
    register, 
    isPending: isRegisterPending, 
    error: registerError,
    receipt: registerReceipt 
  } = useRegister();

  // Validate sponsor address
  useEffect(() => {
    if (sponsorAddress) {
      const valid = isAddress(sponsorAddress) && sponsorAddress !== address;
      setIsValidSponsor(valid);
    } else {
      setIsValidSponsor(false);
    }
  }, [sponsorAddress, address]);

  // Handle connection errors
  useEffect(() => {
    if (connectError) {
      console.error('[DEBUG] Connection error:', connectError);
      
      let errorMessage = 'Failed to connect wallet';
      
      if (connectError.message.includes('User rejected')) {
        errorMessage = 'Connection cancelled by user';
      } else if (connectError.message.includes('WalletConnect') || connectError.message.includes('Invalid App Configuration')) {
        errorMessage = 'WalletConnect configuration error. Please try MetaMask or contact support.';
      } else if (connectError.message.includes('403') || connectError.message.includes('Forbidden')) {
        errorMessage = 'Connection service unavailable. Please try again later or use MetaMask.';
      } else if (connectError.message.includes('Modal')) {
        errorMessage = 'Failed to open wallet connection modal. Please try again.';
      }
      
      notify.error('Connection Error', errorMessage);
    }
  }, [connectError, notify]);

  // Handle successful registration
  useEffect(() => {
    if (registerReceipt?.isSuccess) {
      notify.success('Registration Successful', 'Welcome to LuxPlay! You can now start staking.');
      // Delay redirect to ensure state is updated
      setTimeout(() => {
        router.push(returnTo);
      }, 3000);
    }
  }, [registerReceipt?.isSuccess, notify, router, returnTo]);

  // Handle registration errors
  useEffect(() => {
    if (registerError) {
      notify.error('Registration Failed', registerError.message || 'Failed to complete registration');
    }
  }, [registerError, notify]);

  // Auto-redirect if already authenticated and registered
  useEffect(() => {
    if (!isAuthLoading && isAuthenticated && isRegistered) {
      console.log('[DEBUG] User already authenticated and registered, redirecting to:', returnTo);
      router.push(returnTo);
    }
  }, [isAuthenticated, isRegistered, isAuthLoading, router, returnTo]);

  // Show sponsor form when user is connected but not registered
  useEffect(() => {
    if (isConnected && registrationStatus === false) {
      setShowSponsorForm(true);
    } else {
      setShowSponsorForm(false);
    }
  }, [isConnected, registrationStatus]);

  // Get specific wallet connectors
  const metaMaskConnector = connectors.find(
    (connector) => connector.name.toLowerCase().includes('metamask') || connector.id === 'metaMask'
  );
  
  const walletConnectConnector = connectors.find(
    (connector) => connector.id === 'walletConnect'
  );
  
  const injectedConnector = connectors.find(
    (connector) => connector.id === 'injected'
  );
  
  const coinbaseConnector = connectors.find(
    (connector) => connector.name.toLowerCase().includes('coinbase')
  );

  const handleConnectMetaMask = () => {
    console.log('[DEBUG] Attempting to connect MetaMask');
    if (metaMaskConnector) {
      connect({ connector: metaMaskConnector });
    } else {
      // Fallback to injected for MetaMask
      connect({ connector: injectedConnector || connectors[0] });
    }
  };
  
  const handleConnectWalletConnect = () => {
    console.log('[DEBUG] Attempting to connect via WalletConnect');
    console.log('[DEBUG] WalletConnect Project ID:', process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID ? 'configured' : 'missing');
    
    if (walletConnectConnector) {
      console.log('[DEBUG] WalletConnect connector found:', walletConnectConnector.name);
      try {
        connect({ connector: walletConnectConnector });
      } catch (error) {
        console.error('[ERROR] WalletConnect connection failed:', error);
        notify.error('Connection Failed', 'Failed to open WalletConnect. Please try again.');
      }
    } else {
      console.error('[ERROR] WalletConnect connector not found');
      notify.error('WalletConnect Not Available', 'WalletConnect is not properly configured.');
    }
  };
  
  const handleConnectInjected = () => {
    console.log('[DEBUG] Attempting to connect browser wallet');
    if (injectedConnector) {
      connect({ connector: injectedConnector });
    }
  };
  
  const handleConnectCoinbase = () => {
    console.log('[DEBUG] Attempting to connect Coinbase Wallet');
    if (coinbaseConnector) {
      connect({ connector: coinbaseConnector });
    }
  };

  const handleRegister = () => {
    if (!isValidSponsor) {
      notify.warning('Invalid Sponsor', 'Please enter a valid sponsor address');
      return;
    }
    
    console.log('[DEBUG] Starting registration with sponsor:', sponsorAddress);
    register(sponsorAddress as `0x${string}`);
  };

  const handleUseSponsor = (defaultSponsor: string) => {
    setSponsorAddress(defaultSponsor);
  };

  // Debug logging
  console.log('[DEBUG] Connect page state:', {
    isConnected,
    isConnecting,
    isAuthenticated,
    isRegistered,
    registrationStatus,
    showSponsorForm,
    returnTo,
    refParam,
    sponsorAddress,
    isValidSponsor,
    availableConnectors: connectors.map(c => ({ id: c.id, name: c.name })),
    walletConnectProjectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID ? 'configured' : 'missing'
  });

  return (
    <div className="min-h-screen p-6">
      <div className="container mx-auto max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Connect to LuxPlay</h1>
          <p className="text-muted-foreground">
            Connect your wallet to start earning rewards
          </p>
        </div>

        {/* Connection Status */}
        {isConnected && (
          <Card className="mb-6 border-green-700/50 bg-green-900/20 shadow-green-900/10">
            <CardContent className="py-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-green-700/30 border border-green-600/40 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-300" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-green-900 dark:text-green-100">
                    Wallet Connected
                  </p>
                  <p className="text-xs text-green-700 dark:text-green-300">
                    {address?.slice(0, 6)}...{address?.slice(-4)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Main Content */}
        {!isConnected ? (
          /* Wallet Connection Card */
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wallet className="w-5 h-5" />
                Connect Wallet
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Connect your Web3 wallet to access the LuxPlay ecosystem.
              </p>
              
              <div className="space-y-3">
                {/* MetaMask - Primary option */}
                <Button 
                  onClick={handleConnectMetaMask}
                  disabled={isConnecting || isConnectPending}
                  className="w-full"
                  size="lg"
                >
                  {isConnecting || isConnectPending ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Connecting...
                    </>
                  ) : (
                    <>
                      <Wallet className="w-4 h-4 mr-2" />
                      Connect MetaMask
                    </>
                  )}
                </Button>
                
                {/* WalletConnect - For mobile wallets */}
                {walletConnectConnector && (
                  <>
                    <Button 
                      onClick={handleConnectWalletConnect}
                      disabled={isConnecting || isConnectPending}
                      className="w-full"
                      size="lg"
                      variant="outline"
                    >
                      {isConnecting || isConnectPending ? (
                        <>
                          <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                          Connecting...
                        </>
                      ) : (
                        <>
                          <Wallet className="w-4 h-4 mr-2" />
                          WalletConnect (Mobile)
                        </>
                      )}
                    </Button>
                    
                    {/* Debug info for WalletConnect */}
                    {process.env.NODE_ENV === 'development' && (
                      <div className="text-xs text-muted-foreground text-center mt-1">
                        Project ID: {process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID ? 'Configured' : 'Missing'}
                      </div>
                    )}
                  </>
                )}
                
                {/* Trust Wallet / SafePal / Other Browser Wallets */}
                {injectedConnector && injectedConnector.id !== metaMaskConnector?.id && (
                  <Button 
                    onClick={handleConnectInjected}
                    disabled={isConnecting || isConnectPending}
                    className="w-full"
                    variant="outline"
                  >
                    {isConnecting || isConnectPending ? (
                      <>
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                        Connecting...
                      </>
                    ) : (
                      <>
                        <Wallet className="w-4 h-4 mr-2" />
                        Browser Wallet
                      </>
                    )}
                  </Button>
                )}
                
                {/* Coinbase Wallet */}
                {coinbaseConnector && (
                  <Button 
                    onClick={handleConnectCoinbase}
                    disabled={isConnecting || isConnectPending}
                    className="w-full"
                    variant="outline"
                  >
                    {isConnecting || isConnectPending ? (
                      <>
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                        Connecting...
                      </>
                    ) : (
                      <>
                        <Wallet className="w-4 h-4 mr-2" />
                        Coinbase Wallet
                      </>
                    )}
                  </Button>
                )}
                
                {/* Fallback for other connectors */}
                {connectors.filter(c => 
                  c.id !== metaMaskConnector?.id && 
                  c.id !== walletConnectConnector?.id && 
                  c.id !== injectedConnector?.id && 
                  c.id !== coinbaseConnector?.id
                ).length > 0 && (
                  <div className="space-y-2">
                    <p className="text-xs text-muted-foreground text-center">Other wallets:</p>
                    {connectors.filter(c => 
                      c.id !== metaMaskConnector?.id && 
                      c.id !== walletConnectConnector?.id && 
                      c.id !== injectedConnector?.id && 
                      c.id !== coinbaseConnector?.id
                    ).map((connector) => (
                      <Button
                        key={connector.id}
                        onClick={() => connect({ connector })}
                        variant="outline"
                        className="w-full"
                        disabled={isConnecting || isConnectPending}
                      >
                        {connector.name}
                      </Button>
                    ))}
                  </div>
                )}
              </div>
              
              {/* Wallet-specific instructions */}
              <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                <div className="text-xs text-blue-600 dark:text-blue-400 space-y-2">
                  <p className="font-medium">Supported Wallets:</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li><strong>MetaMask:</strong> Browser extension or mobile app</li>
                    <li><strong>Trust Wallet:</strong> Use WalletConnect or browser extension</li>
                    <li><strong>SafePal:</strong> Use WalletConnect or browser extension</li>
                    <li><strong>Coinbase Wallet:</strong> Browser extension or mobile app</li>
                    <li><strong>Others:</strong> Any WalletConnect-compatible wallet</li>
                  </ul>
                </div>
              </div>
              
              {/* Troubleshooting for WalletConnect issues */}
              <div className="mt-4 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                <div className="text-xs text-yellow-600 dark:text-yellow-400 space-y-2">
                  <p className="font-medium">Having issues with WalletConnect?</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Try refreshing the page and clicking WalletConnect again</li>
                    <li>Use MetaMask as an alternative (works more reliably)</li>
                    <li>For mobile wallets, try opening this page in their built-in browser</li>
                    <li>Check that your wallet app supports WalletConnect v2</li>
                  </ul>
                </div>
              </div>

              <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                <div className="flex items-start gap-2">
                  <Shield className="w-4 h-4 text-blue-500 mt-0.5" />
                  <div className="text-xs text-blue-600 dark:text-blue-400">
                    <p className="font-medium">Secure Connection</p>
                    <p>Your wallet connection is secure and encrypted. LuxPlay cannot access your private keys.</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : !isRegistered && showSponsorForm ? (
          /* Registration Form */
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Complete Registration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {refParam && (
                <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                  <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                    <LinkIcon className="w-4 h-4" />
                    <span className="text-sm font-medium">
                      Referral Link Detected
                    </span>
                  </div>
                  <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                    Your sponsor has been automatically filled in.
                  </p>
                </div>
              )}
              
              <p className="text-sm text-muted-foreground">
                Enter your sponsor address to complete registration and start earning rewards.
              </p>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Sponsor Address</label>
                <Input
                  placeholder="0x..."
                  value={sponsorAddress}
                  onChange={(e) => setSponsorAddress(e.target.value)}
                  className={isValidSponsor ? 'border-green-500' : sponsorAddress ? 'border-red-500' : ''}
                />
                {sponsorAddress && !isValidSponsor && (
                  <p className="text-xs text-red-500">
                    Please enter a valid Ethereum address that is different from your wallet address.
                  </p>
                )}
                {isValidSponsor && (
                  <p className="text-xs text-green-500">
                    Valid sponsor address
                  </p>
                )}
              </div>

              {/* Default Sponsor Option */}
              <div className="p-3 bg-secondary/50 rounded-lg">
                <p className="text-xs text-muted-foreground mb-2">No sponsor? Use the default:</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleUseSponsor('0xff1d11A306cCB9AA26F1dA6C265a1f7a68F43AeC')}
                  className="w-full text-xs"
                >
                  Use Default Sponsor
                </Button>
              </div>

              <Button 
                onClick={handleRegister}
                disabled={!isValidSponsor || isRegisterPending || isCheckingRegistration}
                className="w-full"
                size="lg"
              >
                {isRegisterPending ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Registering...
                  </>
                ) : (
                  <>
                    <Users className="w-4 h-4 mr-2" />
                    Complete Registration
                  </>
                )}
              </Button>

              <div className="mt-4 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-yellow-500 mt-0.5" />
                  <div className="text-xs text-yellow-600 dark:text-yellow-400">
                    <p className="font-medium">Registration Required</p>
                    <p>You need to register with a sponsor to access LuxPlay features. This is a one-time blockchain transaction.</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : isRegistered ? (
          /* Success State */
          <Card className="border-green-700/50 bg-green-900/20 shadow-green-900/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-900 dark:text-green-100">
                <CheckCircle className="w-5 h-5" />
                Welcome to LuxPlay!
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-green-700 dark:text-green-300">
                Your wallet is connected and registered. You can now access all LuxPlay features.
              </p>
              
              <Button 
                onClick={() => router.push(returnTo)}
                className="w-full"
                size="lg"
              >
                Continue to LuxPlay
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </CardContent>
          </Card>
        ) : (
          /* Loading State */
          <Card>
            <CardContent className="py-8">
              <div className="text-center space-y-4">
                <RefreshCw className="w-8 h-8 animate-spin mx-auto text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  Checking registration status...
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Help Section */}
        <div className="mt-8 text-center">
          <p className="text-xs text-muted-foreground mb-2">
            Need help? Check our documentation
          </p>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => window.open('https://docs.luxplay.io', '_blank')}
          >
            <ExternalLink className="w-3 h-3 mr-1" />
            Documentation
          </Button>
        </div>
      </div>
    </div>
  );
}