'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAccount } from 'wagmi';
import { useIsRegistered } from '../hooks/useUserContract';

interface AuthContextType {
  isAuthenticated: boolean;
  isRegistered: boolean | undefined;
  isLoading: boolean;
  address: `0x${string}` | undefined;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { address, isConnected, isConnecting, isReconnecting } = useAccount();
  const { data: isRegistered, isLoading: isCheckingRegistration, error: registrationError } = useIsRegistered(address);

  const [authState, setAuthState] = useState({
    isAuthenticated: false,
    isRegistered: false,
    isLoading: true,
    address: undefined as `0x${string}` | undefined
  });

  // Enhanced debug logging
  useEffect(() => {
    console.log('[DEBUG] AuthContext state:', {
      isConnected,
      isConnecting,
      isReconnecting,
      address: address ? `${address.slice(0, 6)}...${address.slice(-4)}` : 'undefined',
      isRegistered,
      isCheckingRegistration,
      registrationError: registrationError?.message || 'none',
      currentAuthState: authState
    });
  }, [isConnected, isConnecting, isReconnecting, address, isRegistered, isCheckingRegistration, registrationError, authState]);

  // Update auth state when account or registration status changes
  useEffect(() => {
    // Don't update auth state if we're still connecting or reconnecting
    if (isConnecting || isReconnecting) {
      console.log('[DEBUG] AuthContext: Still connecting/reconnecting, maintaining current state');
      return;
    }

    if (isConnected && address) {
      if (isRegistered === true) {
        // User is connected and registered
        console.log('[DEBUG] AuthContext: User connected and registered');
        setAuthState({
          isAuthenticated: true,
          isRegistered: true,
          isLoading: false,
          address
        });
      } else if (isRegistered === false) {
        // User is connected but not registered
        console.log('[DEBUG] AuthContext: User connected but not registered');
        setAuthState({
          isAuthenticated: true,
          isRegistered: false,
          isLoading: false,
          address
        });
      } else if (isCheckingRegistration) {
        // Still checking registration status
        console.log('[DEBUG] AuthContext: Still checking registration status');
        setAuthState({
          isAuthenticated: true,
          isRegistered: false,
          isLoading: true,
          address
        });
      } else if (registrationError) {
        // Error checking registration - treat as not registered but still authenticated
        console.log('[DEBUG] AuthContext: Error checking registration, treating as not registered');
        setAuthState({
          isAuthenticated: true,
          isRegistered: false,
          isLoading: false,
          address
        });
      }
    } else {
      // User is not connected
      console.log('[DEBUG] AuthContext: User not connected');
      setAuthState({
        isAuthenticated: false,
        isRegistered: false,
        isLoading: false,
        address: undefined
      });
    }
  }, [isConnected, isConnecting, isReconnecting, address, isRegistered, isCheckingRegistration, registrationError]);

  // Return the final auth state with additional loading check
  const isLoading = authState.isLoading || isConnecting || isReconnecting || (isConnected && address && isCheckingRegistration);
  
  return (
    <AuthContext.Provider value={{
      isAuthenticated: authState.isAuthenticated,
      isRegistered: authState.isRegistered,
      isLoading,
      address: authState.address
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}