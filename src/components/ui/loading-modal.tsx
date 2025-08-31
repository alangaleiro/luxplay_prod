import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

interface LoadingModalProps {
  open: boolean;
  title?: string;
  message?: string;
}

export function LoadingModal({ 
  open, 
  title = 'Processando...', 
  message = 'Aguarde enquanto processamos sua solicitação'
}: LoadingModalProps) {
  return (
    <Dialog open={open}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col items-center justify-center py-8">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-muted-foreground text-center">{message}</p>
        </div>
      </DialogContent>
    </Dialog>
  );
}