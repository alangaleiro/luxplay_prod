import { LoadingSpinner } from '@/components/ui/loading-spinner';

interface LoadingChartProps {
  type?: 'bar' | 'line' | 'pie' | 'area';
  height?: string;
}

export function LoadingChart({ 
  type = 'bar', 
  height = 'h-64' 
}: LoadingChartProps) {
  const renderChartSkeleton = () => {
    switch (type) {
      case 'bar':
        return (
          <div className="flex items-end justify-between h-full pt-4">
            {Array.from({ length: 8 }).map((_, index) => (
              <div 
                key={index} 
                className="w-8 bg-secondary/70 rounded-t animate-pulse"
                style={{ height: `${Math.random() * 80 + 20}%` }}
              ></div>
            ))}
          </div>
        );
      case 'line':
        return (
          <div className="relative h-full pt-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full h-1 bg-secondary/30 rounded"></div>
            </div>
            <div className="absolute inset-0">
              <svg viewBox="0 0 100 100" className="w-full h-full">
                <path 
                  d="M 0 80 Q 25 60, 50 70 T 100 50" 
                  fill="none" 
                  stroke="hsl(var(--secondary))" 
                  strokeWidth="2" 
                  className="animate-pulse"
                />
              </svg>
            </div>
          </div>
        );
      case 'pie':
        return (
          <div className="relative w-full h-full flex items-center justify-center">
            <div className="w-32 h-32 rounded-full border-8 border-secondary/30 border-t-secondary/70 animate-spin"></div>
          </div>
        );
      case 'area':
        return (
          <div className="relative h-full pt-4">
            <div className="absolute inset-0">
              <svg viewBox="0 0 100 100" className="w-full h-full">
                <path 
                  d="M 0 80 Q 25 60, 50 70 T 100 50 L 100 100 L 0 100 Z" 
                  fill="hsl(var(--secondary)/0.7)" 
                  className="animate-pulse"
                />
              </svg>
            </div>
          </div>
        );
      default:
        return (
          <div className="flex items-center justify-center h-full">
            <LoadingSpinner size="lg" />
          </div>
        );
    }
  };

  return (
    <div className={`${height} w-full bg-secondary/10 rounded-lg p-4`}>
      {renderChartSkeleton()}
    </div>
  );
}