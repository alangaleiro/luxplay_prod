import { LoadingSpinner } from '@/components/ui/loading-spinner';

interface PageLoaderProps {
  message?: string;
  fullscreen?: boolean;
}

export function PageLoader({ 
  message = 'Carregando...', 
  fullscreen = true 
}: PageLoaderProps) {
  if (fullscreen) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm">
        <LoadingSpinner size="lg" />
        <p className="mt-4 text-muted-foreground">{message}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center py-12">
      <LoadingSpinner size="lg" />
      <p className="mt-4 text-muted-foreground">{message}</p>
    </div>
  );
}