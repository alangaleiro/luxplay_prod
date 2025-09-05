'use client';

import { useState } from 'react';
import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { WalletSection } from '@/components/WalletSection';
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle, 
  SheetTrigger 
} from '@/components/ui/sheet';
import { 
  Menu, 
  Wallet, 
  Home, 
  Trophy, 
  Users, 
  Settings,
  ExternalLink,
  ChevronDown,
  CheckCircle,
  ArrowUpDown,
  RefreshCw
} from 'lucide-react';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { useCheckpoint } from '../../hooks/useActivePool';
import { useAuth } from '@/contexts/AuthContext';

interface NavigationItem {
  name: string;
  href: string;
  icon: React.ReactNode;
  description: string;
}

const navigationItems: NavigationItem[] = [
  {
    name: 'Home',
    href: '/',
    icon: <Home className="w-4 h-4" />,
    description: 'Back to main page'
  },
  {
    name: 'Prize Program',
    href: '/prize-program',
    icon: <Trophy className="w-4 h-4" />,
    description: 'Staking rewards and APY plans'
  },
  {
    name: 'Invite Program',
    href: '/invite',
    icon: <Users className="w-4 h-4" />,
    description: 'Referral program and networking'
  },
  {
    name: 'Token Swap',
    href: '/swap',
    icon: <ArrowUpDown className="w-4 h-4" />,
    description: 'Swap USDT for PLAY tokens'
  }
];

export function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { address, isConnected, isConnecting } = useAccount();
  const { connect, connectors, isPending } = useConnect();
  const { disconnect } = useDisconnect();
  const { isAuthenticated, isRegistered } = useAuth();

  // Sync Data logic
  const { checkpoint, isPending: isCheckpointPending } = useCheckpoint();

  const handleSync = () => {
    checkpoint();
  };

  const handleConnect = (connector: any) => {
    try {
      connect({ connector });
      setIsMenuOpen(false);
    } catch (error) {
      console.error('Connection error:', error);
    }
  };

  const handleDisconnect = () => {
    disconnect();
    setIsMenuOpen(false);
    router.push('/connect');
  };

  return (
    <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4">
        {/* Logo and Brand */}
        <div className="flex items-center gap-4">
          {/* Mobile Menu */}
          <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="lg:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-80">
              <SheetHeader>
                <SheetTitle className="text-left">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                      <span className="text-sm font-bold text-primary-foreground">L</span>
                    </div>
                    LUXPLAY
                  </div>
                </SheetTitle>
              </SheetHeader>
              
              <div className="mt-8 space-y-6">
                {/* Navigation Links */}
                <nav className="space-y-2">
                  {navigationItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setIsMenuOpen(false)}
                      className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors hover:bg-secondary ${
                        pathname === item.href 
                          ? 'bg-secondary text-secondary-foreground' 
                          : 'text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      {item.icon}
                      <div>
                        <div className="font-medium">{item.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {item.description}
                        </div>
                      </div>
                    </Link>
                  ))}
                </nav>

                {/* Wallet Section */}
                <div className="border-t pt-6">
                  <WalletSection
                    connectors={connectors}
                    isPending={isPending}
                    isConnecting={isConnecting}
                    handleConnect={handleConnect}
                    isAuthenticated={isAuthenticated}
                    isRegistered={isRegistered}
                    pathname={pathname}
                  />
                </div>
              </div>
            </SheetContent>
          </Sheet>

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary/60 rounded-lg flex items-center justify-center">
              <span className="text-sm font-bold text-primary-foreground">L</span>
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              LUXPLAY
            </span>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center space-x-1">
          {navigationItems.map((item) => (
            <Link key={item.href} href={item.href}>
              <Button
                variant={pathname === item.href ? 'default' : 'ghost'}
                className="gap-2"
              >
                {item.icon}
                {item.name}
              </Button>
            </Link>
          ))}
        </nav>

        {/* Desktop Wallet Section */}
        <div className="hidden lg:flex items-center gap-4">
          <WalletSection
            connectors={connectors}
            isPending={isPending}
            isConnecting={isConnecting}
            handleConnect={handleConnect}
            isAuthenticated={isAuthenticated}
            isRegistered={isRegistered}
            pathname={pathname}
          />
        </div>
      </div>
    </header>
  );
}