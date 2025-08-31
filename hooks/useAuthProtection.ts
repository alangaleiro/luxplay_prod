import { useEffect } from 'react';
import { useAccount } from 'wagmi';
import { useRouter } from 'next/navigation';
import { useIsRegistered } from '../hooks/useUserContract';

export function useAuthProtection() {
  const { address, isConnected } = useAccount();
  const { data: isRegistered, isLoading: isCheckingRegistration } = useIsRegistered(address);
  const router = useRouter();

  useEffect(() => {
    // Check if user is authenticated and registered
    const checkAuth = () => {
      // If not connected, redirect to connect page
      if (!isConnected) {
        router.push('/connect');
        return;
      }

      // If connected but not registered, redirect to connect page to complete registration
      if (isConnected && isRegistered === false) {
        // Verificar se já está na página de conexão
        if (window.location.pathname !== '/connect') {
          router.push('/connect');
        }
        return;
      }

      // If connected and registered, user can access protected pages
      if (isConnected && isRegistered === true) {
        // User is properly authenticated
        return;
      }
    };

    // Só executar o checkAuth quando o status de registro for conhecido
    if (!isCheckingRegistration) {
      checkAuth();
    }
  }, [isConnected, isRegistered, isCheckingRegistration, router]);

  return { 
    isAuthenticated: isConnected && isRegistered === true,
    isRegistered: isRegistered,
    isCheckingAuth: isCheckingRegistration
  };
}