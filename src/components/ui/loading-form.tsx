import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

interface LoadingFormProps {
  title?: string;
  fields?: number;
  actions?: boolean;
}

export function LoadingForm({ 
  title = 'Loading form...', 
  fields = 3,
  actions = true
}: LoadingFormProps) {
  return (
    <Card>
      {title && (
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
      )}
      <CardContent className="space-y-6">
        {Array.from({ length: fields }).map((_, index) => (
          <div key={index} className="space-y-2">
            <div className="h-4 w-1/3 bg-secondary rounded animate-pulse"></div>
            <div className="h-10 bg-secondary/70 rounded animate-pulse"></div>
          </div>
        ))}
      </CardContent>
      {actions && (
        <CardFooter className="flex justify-end gap-2">
          <div className="h-10 w-20 bg-secondary/70 rounded animate-pulse"></div>
          <div className="h-10 w-20 bg-secondary/70 rounded animate-pulse"></div>
        </CardFooter>
      )}
    </Card>
  );
}