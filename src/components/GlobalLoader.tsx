'use client';

import { useAccount } from 'wagmi';
import { useState, useEffect } from 'react';
import { PageLoader } from '@/components/PageLoader';

interface GlobalLoaderProps {
  children: React.ReactNode;
}

export function GlobalLoader({ children }: GlobalLoaderProps) {
  const { isConnecting } = useAccount();
  const [showLoading, setShowLoading] = useState(false);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    if (isConnecting) {
      // Show loading after delay to prevent flickering
      timeoutId = setTimeout(() => {
        setShowLoading(true);
      }, 300);
    } else {
      // Hide loading immediately
      setShowLoading(false);
    }

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [isConnecting]);

  if (showLoading) {
    return <PageLoader message="Processando conexão..." />;
  }

  return <>{children}</>;
}