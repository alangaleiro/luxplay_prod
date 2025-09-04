import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

interface LoadingCardProps {
  title?: string;
  message?: string;
  className?: string;
}

export function LoadingCard({ 
  title = 'Loading...', 
  message = 'Aguarde enquanto carregamos as informações',
  className
}: LoadingCardProps) {
  return (
    <Card className={className}>
      {title && (
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
      )}
      <CardContent className="flex flex-col items-center justify-center py-8">
        <LoadingSpinner size="lg" />
        <p className="mt-4 text-muted-foreground text-center">{message}</p>
      </CardContent>
    </Card>
  );
}