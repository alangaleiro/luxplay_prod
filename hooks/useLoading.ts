import { useState, useEffect } from 'react';

interface UseLoadingProps {
  delay?: number;
}

export function useLoading({ delay = 300 }: UseLoadingProps = {}) {
  const [isLoading, setIsLoading] = useState(false);
  const [showLoading, setShowLoading] = useState(false);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    if (isLoading) {
      // Show loading immediately if no delay
      if (delay === 0) {
        setShowLoading(true);
      } else {
        // Show loading after delay to prevent flickering
        timeoutId = setTimeout(() => {
          setShowLoading(true);
        }, delay);
      }
    } else {
      // Hide loading immediately
      setShowLoading(false);
    }

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [isLoading, delay]);

  return {
    isLoading,
    showLoading,
    setIsLoading,
  };
}