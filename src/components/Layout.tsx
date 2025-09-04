'use client';

import { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Navigation } from '@/components/Navigation';
import { PageLoader } from '@/components/PageLoader';

export function Layout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isRegistered, isLoading, address } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [initialLoad, setInitialLoad] = useState(true);

  // Verificar se o usuário está tentando acessar páginas protegidas
  useEffect(() => {
    // Páginas que requerem conexão e registro
    const protectedRoutes = ['/prize-program', '/invite', '/verify-registration', '/referral-network'];
    
    // If still loading, wait
    if (isLoading) {
      return;
    }
    
    // Se o usuário está autenticado e registrado, pode acessar qualquer página
    if (isAuthenticated && isRegistered) {
      setInitialLoad(false);
      return;
    }
    
    // Se o usuário está na página de conexão, permitir
    if (pathname === '/connect') {
      setInitialLoad(false);
      return;
    }
    
    // Se o usuário não está autenticado e está tentando acessar uma página protegida
    if (!isAuthenticated && protectedRoutes.includes(pathname)) {
      // Redirecionar para a página de conexão
      router.push('/connect');
      return;
    }
    
    // Se o usuário está autenticado mas não registrado e está tentando acessar uma página protegida
    if (isAuthenticated && !isRegistered && protectedRoutes.includes(pathname)) {
      // Permitir acesso à página de conexão para completar o registro
      router.push('/connect');
      return;
    }
    
    setInitialLoad(false);
  }, [isAuthenticated, isRegistered, isLoading, pathname, router]);

  // Mostrar loading durante o carregamento inicial
  if (initialLoad || isLoading) {
    return <PageLoader message="Loading..." />;
  }

  return (
    <div className="flex flex-col min-h-screen relative">
      <Navigation />
      <div className="flex-1 relative z-10">
        {children}
      </div>
    </div>
  );
}