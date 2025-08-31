'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class WalletErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    // Check if this is a wallet-related error we should handle gracefully
    const walletErrors = [
      'Failed to fetch',
      'NetworkError',
      'WalletConnect',
      'MetaMask',
      'Coinbase',
      'chrome-extension',
      'telemetry',
      'analytics',
      'undefined'
    ];

    const errorMessage = error.message || error.toString();
    const isWalletError = walletErrors.some(keyword => 
      errorMessage.toLowerCase().includes(keyword.toLowerCase())
    );

    if (isWalletError) {
      // Log error in development for debugging
      if (process.env.NODE_ENV === 'development') {
        console.debug('LuxPlay: Wallet error caught by boundary:', error);
      }
      return { hasError: true, error };
    }

    // Let other errors bubble up
    throw error;
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log wallet errors silently in production
    if (process.env.NODE_ENV === 'production') {
      // Could send to error tracking service here
      console.debug('LuxPlay wallet error:', { error, errorInfo });
    }
  }

  render() {
    if (this.state.hasError) {
      // Return fallback UI or continue rendering children
      return this.props.fallback || this.props.children;
    }

    return this.props.children;
  }
}

// Hook version for functional components
export function useWalletErrorHandler() {
  React.useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      const error = event.error;
      const errorMessage = error?.message || '';

      // Handle specific wallet errors
      const walletErrors = [
        'Failed to fetch',
        'NetworkError', 
        'WalletConnect',
        'MetaMask',
        'Coinbase',
        'chrome-extension',
        'telemetry'
      ];

      if (walletErrors.some(keyword => errorMessage.includes(keyword))) {
        event.preventDefault();
        if (process.env.NODE_ENV === 'development') {
          console.debug('LuxPlay: Wallet error suppressed:', error);
        }
      }
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      const error = event.reason;
      const errorMessage = error?.message || error?.toString() || '';

      // Suppress wallet-related promise rejections
      if (
        errorMessage.includes('Failed to fetch') ||
        errorMessage.includes('NetworkError') ||
        errorMessage.includes('telemetry') ||
        errorMessage.includes('WalletConnect') ||
        errorMessage === 'undefined' ||
        errorMessage === ''
      ) {
        event.preventDefault();
        if (process.env.NODE_ENV === 'development') {
          console.debug('LuxPlay: Promise rejection suppressed:', error);
        }
      }
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);
}