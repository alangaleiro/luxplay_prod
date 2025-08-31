import { cn } from '@/lib/utils';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  fullScreen?: boolean;
}

export function LoadingSpinner({ 
  size = 'md', 
  className,
  fullScreen = false 
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };

  const spinner = (
    <div className={cn(
      "relative",
      sizeClasses[size],
      fullScreen ? "absolute inset-0 flex items-center justify-center" : "",
      className
    )}>
      <div className={cn(
        "absolute inset-0 rounded-full border-2 border-solid border-primary/20"
      )}></div>
      <div className={cn(
        "absolute inset-0 rounded-full border-2 border-solid border-primary border-t-transparent animate-spin"
      )}></div>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
        {spinner}
      </div>
    );
  }

  return spinner;
}