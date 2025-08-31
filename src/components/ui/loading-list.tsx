import { LoadingSpinner } from '@/components/ui/loading-spinner';

interface LoadingListProps {
  items?: number;
  itemHeight?: string;
}

export function LoadingList({ 
  items = 5, 
  itemHeight = 'h-16' 
}: LoadingListProps) {
  return (
    <div className="space-y-2">
      {Array.from({ length: items }).map((_, index) => (
        <div 
          key={index} 
          className={`${itemHeight} bg-secondary/70 rounded animate-pulse`}
        ></div>
      ))}
      
      <div className="flex justify-center py-4">
        <LoadingSpinner size="md" />
      </div>
    </div>
  );
}