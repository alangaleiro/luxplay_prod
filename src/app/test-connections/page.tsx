'use client';

import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { PageLoader } from '@/components/PageLoader';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

export default function TestConnectionPage() {
  const { address, isConnected, isConnecting } = useAccount();
  const { connect, connectors, error, isLoading } = useConnect();
  const { disconnect } = useDisconnect();

  // Show loading state while connecting
  if (isConnecting) {
    return <PageLoader message="Conectando carteira..." />;
  }

  return (
    <div className="container mx-auto py-8">
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Wallet Connection Test</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {isConnected ? (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Connected to: {address?.slice(0, 6)}...{address?.slice(-4)}
              </p>
              <Button onClick={() => disconnect()} variant="outline">
                Disconnect
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Connect your wallet:
              </p>
              <div className="space-y-2">
                {connectors.map((connector) => (
                  <Button
                    key={connector.id}
                    onClick={() => connect({ connector })}
                    variant="outline"
                    className="w-full"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <LoadingSpinner size="sm" className="mr-2" />
                    ) : null}
                    {connector.name}
                  </Button>
                ))}
              </div>
              {error && (
                <p className="text-sm text-red-500">
                  Error: {error.message}
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}