'use client';

import { useState, useEffect } from 'react';
import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { CopyableAddress } from '@/components/CopyableAddress';
import { WalletIcon } from '@/components/WalletIcon';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { useCheckpoint } from '../../hooks/useActivePool';

function SyncDataButton() {
  const { checkpoint, isPending } = useCheckpoint();
  
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={checkpoint}
      disabled={isPending}
    >
      {isPending ? 'Syncing...' : 'Sync Data'}
    </Button>
  );
}

interface WalletSectionProps {
  connectors: any[];
  isPending: boolean;
  isConnecting: boolean;
  handleConnect: (connector: any) => void;
  isAuthenticated: boolean;
  isRegistered: boolean;
  pathname: string;
}

export function WalletSection({ 
  connectors, 
  isPending, 
  isConnecting, 
  handleConnect, 
  isAuthenticated, 
  isRegistered, 
  pathname 
}: WalletSectionProps) {
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleDisconnect = () => {
    disconnect();
    router.push('/');
  };

  if (!mounted) {
    return <div suppressHydrationWarning />;
  }

  return (
    <div className="space-y-3">
      {!isConnected && (
        <div>
          <Button
            className="w-full"
            size="lg"
            onClick={() => router.push('/connect')} // Redirect to /connect page
          >
            {isConnecting ? ( // Use isConnecting from props
              <>
                <LoadingSpinner size="sm" className="mr-2" />
                Connecting...
              </>
            ) : (
              <>
                <WalletIcon className="mr-2 h-5 w-5" /> {/* Larger icon */}
                Connect Wallet
              </>
            )}
          </Button>
        </div>
      )}

      {isConnected && (
        <div>
          <div className="p-3 bg-secondary/50 rounded-lg">
            <div className="flex items-center gap-2">
              <CopyableAddress address={address} />
              <SyncDataButton />
              <Button
                variant="outline"
                size="sm"
                onClick={handleDisconnect}
              >
                Disconnect
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}