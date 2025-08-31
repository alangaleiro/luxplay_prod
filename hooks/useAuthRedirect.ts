import { useAccount } from 'wagmi';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useIsRegistered } from './useUserContract';

export function useAuthRedirect() {
  const { isConnected, address } = useAccount();
  const router = useRouter();
  const { data: isRegistered, isLoading: isCheckingRegistration } = useIsRegistered(address);

  useEffect(() => {
    // Verificar se o usuário está autenticado
    const checkAuth = () => {
      // Se não estiver conectado, redirecionar para a página de conexão
      if (!isConnected || !address) {
        router.push('/connect');
        return;
      }

      // Se estiver conectado e registrado, redirecionar para a página de prêmios
      if (isConnected && address && isRegistered === true) {
        router.push('/prize-program');
        return;
      }

      // Se estiver conectado mas não registrado, manter na página atual para completar o registro
      if (isConnected && address && isRegistered === false) {
        // Verificar se já está na página de conexão
        if (window.location.pathname !== '/connect') {
          router.push('/connect');
        }
        return;
      }
    };

    // Só executar o checkAuth quando o status de registro for conhecido
    if (!isCheckingRegistration) {
      checkAuth();
    }
  }, [isConnected, address, isRegistered, isCheckingRegistration, router]);

  return { isConnected, address, isRegistered, isLoading: isCheckingRegistration };
}