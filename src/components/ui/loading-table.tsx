import { LoadingSpinner } from '@/components/ui/loading-spinner';

interface LoadingTableProps {
  rows?: number;
  columns?: number;
}

export function LoadingTable({ rows = 5, columns = 4 }: LoadingTableProps) {
  return (
    <div className="w-full">
      <div className="space-y-4">
        {/* Table header */}
        <div className="grid grid-cols-12 gap-4 px-4 py-3 bg-secondary/50 rounded-lg">
          {Array.from({ length: columns }).map((_, index) => (
            <div key={index} className="h-4 bg-secondary rounded animate-pulse"></div>
          ))}
        </div>
        
        {/* Table rows */}
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div key={rowIndex} className="grid grid-cols-12 gap-4 px-4 py-3 border-b border-border/50">
            {Array.from({ length: columns }).map((_, colIndex) => (
              <div key={colIndex} className="h-4 bg-secondary/70 rounded animate-pulse"></div>
            ))}
          </div>
        ))}
      </div>
      
      <div className="flex justify-center py-8">
        <LoadingSpinner size="md" />
      </div>
    </div>
  );
}