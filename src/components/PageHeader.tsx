import { cn } from '@/lib/utils';
import React from 'react';

interface PageHeaderProps {
  title: string;
  description?: string;
  className?: string;
}

export function PageHeader({ 
  title, 
  description, 
  className 
}: PageHeaderProps) {
  return (
    <div className={cn('text-center space-y-4 mb-12', className)}>
      <h2 className="text-3xl md:text-4xl font-bold">{title}</h2>
      {description && (
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          {description}
        </p>
      )}
    </div>
  );
}