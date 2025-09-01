'use client';

import { useAccount, useConnect } from 'wagmi';
import Link from 'next/link';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Layout } from '../components/Layout';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useIsRegistered } from '../../hooks/useUserContract';
import { 
  Wallet, 
  TrendingUp, 
  Users, 
  DollarSign, 
  Zap,
  Shield,
  Globe,
  ArrowRight,
  Star,
  CheckCircle
} from 'lucide-react';
import { PageLoader } from '@/components/PageLoader';

export default function HomePage() {
  const { isConnected, isConnecting, address } = useAccount();
  const { connect, connectors } = useConnect();
  const router = useRouter();
  const { data: isRegistered, isLoading: isCheckingRegistration } = useIsRegistered(address);

  // Find MetaMask connector
  const metaMaskConnector = connectors.find(
    (connector) => connector.name.toLowerCase().includes('metamask') || connector.id === 'metaMask'
  );

  // Handle MetaMask connection
  const handleConnectMetaMask = () => {
    console.log('[DEBUG] Attempting MetaMask connection...');
    console.log('[DEBUG] Available connectors:', connectors.map(c => ({ id: c.id, name: c.name })));
    
    if (metaMaskConnector) {
      console.log('[DEBUG] Found MetaMask connector:', metaMaskConnector.name);
      connect({ connector: metaMaskConnector });
    } else {
      console.log('[DEBUG] MetaMask connector not found, using first available connector');
      // Fallback to first available connector if MetaMask not found
      connect({ connector: connectors[0] });
    }
  };

  // Auto-redirect logic after wallet connection
  useEffect(() => {
    if (isConnected && address) {
      if (isRegistered === true) {
        // User is connected and registered, redirect to prize program
        console.log('[DEBUG] User connected and registered, redirecting to prize program');
        router.push('/prize-program');
      } else if (isRegistered === false) {
        // User is connected but not registered, redirect to connect page for registration
        console.log('[DEBUG] User connected but not registered, redirecting to connect page');
        router.push('/connect');
      }
      // If isRegistered is undefined, we're still checking, so don't redirect
    }
  }, [isConnected, address, isRegistered, router]);

  // Show loading state while connecting or checking registration
  if (isConnecting || (isConnected && isCheckingRegistration)) {
    return <PageLoader message="Carregando..." />;
  }

  return (
    <Layout>
      <div className="min-h-screen">
        {/* Hero Section */}
        <div className="container mx-auto px-4 max-w-2xl py-16">
          <div className="text-center space-y-8 max-w-4xl mx-auto">
            <Badge variant="secondary" className="text-sm px-3 py-1">
              🚀 Multi-Level DeFi Platform
            </Badge>
            
            <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-primary via-purple-600 to-pink-600 bg-clip-text text-transparent">
              Welcome to LUXPLAY
            </h1>
            
            <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto">
              Earn extraordinary rewards with our innovative multi-level staking system, 
              referral programs, and networking opportunities in the DeFi ecosystem.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              {!isConnected ? (
                <>
                  <Button 
                    size="lg" 
                    className="text-lg px-8" 
                    onClick={handleConnectMetaMask}
                    disabled={isConnecting}
                  >
                    <Wallet className="mr-2 h-5 w-5" />
                    {isConnecting ? 'Connecting...' : 'Get Started'}
                  </Button>
                  <Button size="lg" variant="outline" className="text-lg px-8" asChild>
                    <Link href="/prize-program">
                      Learn More
                    </Link>
                  </Button>
                </>
              ) : (
                <>
                  <Button size="lg" className="text-lg px-8" asChild>
                    <Link href="/prize-program">
                      <TrendingUp className="mr-2 h-5 w-5" />
                      Prize Program
                    </Link>
                  </Button>
                  <Button size="lg" variant="outline" className="text-lg px-8" asChild>
                    <Link href="/invite">
                      <Users className="mr-2 h-5 w-5" />
                      Invite & Earn
                    </Link>
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="container mx-auto px-4 max-w-2xl py-16 bg-secondary/10 relative z-10">
          <div className="text-center space-y-4 mb-12">
            <h2 className="text-3xl md:text-4xl font-bold">Why Choose LUXPLAY?</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Unlock the power of multi-level DeFi with our innovative platform
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard
              icon={<TrendingUp className="w-8 h-8" />}
              title="Multi-Level APY"
              description="Choose from 400%, 750%, or 1400% APY plans with epoch-based rewards"
              highlights={["400% APY Plan", "750% APY Plan", "1400% APY Plan"]}
            />
            
            <FeatureCard
              icon={<Users className="w-8 h-8" />}
              title="15-Level Networking"
              description="Build your network and earn from referrals across 15 levels with progressive unlocks"
              highlights={["15 Referral Levels", "Progressive Unlocks", "Network Rewards"]}
            />
            
            <FeatureCard
              icon={<Shield className="w-8 h-8" />}
              title="Active Pool System"
              description="Centralized staking and rewards in Play Hub v2 with enhanced security"
              highlights={["Centralized Pool", "Enhanced Security", "Optimized Rewards"]}
            />
          </div>
        </div>

        {/* Stats Section */}
        <div className="container mx-auto px-4 max-w-2xl py-16">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <StatCard
              icon={<DollarSign className="w-8 h-8" />}
              value="$2.5M+"
              label="Total Value Locked"
            />
            <StatCard
              icon={<Users className="w-8 h-8" />}
              value="15,000+"
              label="Active Users"
            />
            <StatCard
              icon={<TrendingUp className="w-8 h-8" />}
              value="1400%"
              label="Max APY"
            />
            <StatCard
              icon={<Zap className="w-8 h-8" />}
              value="24/7"
              label="Real-time Rewards"
            />
          </div>
        </div>

        {/* How It Works */}
        <div className="container mx-auto px-4 max-w-2xl py-16 bg-secondary/10 relative z-10">
          <div className="text-center space-y-4 mb-12">
            <h2 className="text-3xl md:text-4xl font-bold">How It Works</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Get started with LUXPLAY in three simple steps
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <StepCard
              step="01"
              title="Connect Wallet"
              description="Connect your Web3 wallet and register with a sponsor address to join the LUXPLAY ecosystem."
              icon={<Wallet className="w-6 h-6" />}
            />
            
            <StepCard
              step="02"
              title="Choose Your Plan"
              description="Select from our APY plans (400%, 750%, 1400%) and deposit PLAY tokens to start earning."
              icon={<TrendingUp className="w-6 h-6" />}
            />
            
            <StepCard
              step="03"
              title="Earn & Refer"
              description="Watch your rewards grow and invite others to build your referral network across 15 levels."
              icon={<Users className="w-6 h-6" />}
            />
          </div>
        </div>

        {/* CTA Section */}
        <div className="container mx-auto px-4 max-w-lg py-16 text-center">
          <div className="space-y-8">
            <h2 className="text-4xl md:text-5xl font-bold">
              Ready to Start Earning?
            </h2>
            <p className="text-xl text-muted-foreground">
              Join thousands of users already earning rewards with LUXPLAY
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                className="text-lg px-8" 
                onClick={isConnected ? () => router.push('/prize-program') : handleConnectMetaMask}
                disabled={isConnecting}
              >
                {isConnecting ? (
                  'Connecting...'
                ) : isConnected ? (
                  'Go to Dashboard'
                ) : (
                  'Connect Wallet'
                )}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <footer className="border-t py-8 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                LUXPLAY
              </h2>
              <span className="text-sm text-muted-foreground">© {new Date().getFullYear()} All rights reserved</span>
            </div>
            
            <div className="flex gap-6">
              <Link href="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Home
              </Link>
              <Link href="/connect" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Connect
              </Link>
              <Link href="/prize-program" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Prize Program
              </Link>
              <Link href="/invite" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Invite
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </Layout>
  );
}

// Container Component
interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl' | '7xl' | 'full';
  children: React.ReactNode;
}

function Container({ 
  maxWidth = 'xl', 
  className, 
  children, 
  ...props 
}: ContainerProps) {
  const maxWidthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '3xl': 'max-w-3xl',
    '4xl': 'max-w-4xl',
    '5xl': 'max-w-5xl',
    '6xl': 'max-w-6xl',
    '7xl': 'max-w-7xl',
    'full': 'max-w-full',
  };

  return (
    <div
      className={cn(
        'container mx-auto px-4',
        maxWidthClasses[maxWidth],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

// PageHeader Component
interface PageHeaderProps {
  title: string;
  description?: string;
  className?: string;
}

function PageHeader({ 
  title, 
  description, 
  className 
}: PageHeaderProps) {
  return (
    <div className={cn('text-center space-y-4 mb-12', className)}>
      <h2 className="text-3xl md:text-4xl font-bold">{title}</h2>
      {description && (
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          {description}
        </p>
      )}
    </div>
  );
}

// Footer Component
function Footer() {
  return (
    <footer className="border-t py-8 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              LUXPLAY
            </h2>
            <span className="text-sm text-muted-foreground">© {new Date().getFullYear()} All rights reserved</span>
          </div>
          
          <div className="flex gap-6">
            <Link href="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Home
            </Link>
            <Link href="/connect" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Connect
            </Link>
            <Link href="/prize-program" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Prize Program
            </Link>
            <Link href="/invite" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Invite
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

// Feature Card Component
interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  highlights: string[];
}

function FeatureCard({ icon, title, description, highlights }: FeatureCardProps) {
  return (
    <Card className="text-center h-full">
      <CardHeader>
        <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
          <div className="text-primary">{icon}</div>
        </div>
        <CardTitle className="text-xl">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-muted-foreground">{description}</p>
        <div className="space-y-2">
          {highlights.map((highlight, i) => (
            <div key={i} className="flex items-center justify-center gap-2 text-sm">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span>{highlight}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// Stat Card Component
interface StatCardProps {
  icon: React.ReactNode;
  value: string;
  label: string;
}

function StatCard({ icon, value, label }: StatCardProps) {
  return (
    <Card>
      <CardContent className="py-8 text-center">
        <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
          <div className="text-primary">{icon}</div>
        </div>
        <div className="text-3xl font-bold mb-2">{value}</div>
        <div className="text-muted-foreground">{label}</div>
      </CardContent>
    </Card>
  );
}

// Step Card Component
interface StepCardProps {
  step: string;
  title: string;
  description: string;
  icon: React.ReactNode;
}

function StepCard({ step, title, description, icon }: StepCardProps) {
  return (
    <Card className="text-center relative overflow-hidden">
      <CardHeader>
        <div className="absolute top-4 right-4 text-6xl font-bold text-primary/10">
          {step}
        </div>
        <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
          <div className="text-primary">{icon}</div>
        </div>
        <CardTitle className="text-xl">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
}