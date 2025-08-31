'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAccount } from 'wagmi';
import { useIsRegistered } from '../../hooks/useUserContract';

interface AuthContextType {
  isAuthenticated: boolean;
  isRegistered: boolean | undefined;
  isLoading: boolean;
  address: `0x${string}` | undefined;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { address, isConnected } = useAccount();
  const { data: isRegistered, isLoading: isCheckingRegistration } = useIsRegistered(address);

  const [authState, setAuthState] = useState({
    isAuthenticated: false,
    isRegistered: false,
    isLoading: true,
    address: undefined as `0x${string}` | undefined
  });

  // Update auth state when account or registration status changes
  useEffect(() => {
    if (isConnected && address) {
      if (isRegistered === true) {
        // User is connected and registered
        setAuthState({
          isAuthenticated: true,
          isRegistered: true,
          isLoading: false,
          address
        });
      } else if (isRegistered === false) {
        // User is connected but not registered
        setAuthState({
          isAuthenticated: true,
          isRegistered: false,
          isLoading: false,
          address
        });
      } else {
        // Still checking registration status
        setAuthState({
          isAuthenticated: true,
          isRegistered: false,
          isLoading: true,
          address
        });
      }
    } else {
      // User is not connected
      setAuthState({
        isAuthenticated: false,
        isRegistered: false,
        isLoading: false,
        address: undefined
      });
    }
  }, [isConnected, address, isRegistered]);

  return (
    <AuthContext.Provider value={{
      isAuthenticated: authState.isAuthenticated,
      isRegistered: authState.isRegistered,
      isLoading: authState.isLoading || isCheckingRegistration,
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