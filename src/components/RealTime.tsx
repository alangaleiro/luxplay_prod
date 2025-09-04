'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Clock, Timer, RefreshCw, Pause, Play } from 'lucide-react';

// Countdown timer hook
export function useCountdown(initialSeconds: number) {
  const [timeLeft, setTimeLeft] = useState(initialSeconds);
  const [isActive, setIsActive] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const start = useCallback(() => {
    setIsActive(true);
    setIsPaused(false);
  }, []);

  const pause = useCallback(() => {
    setIsPaused(true);
  }, []);

  const resume = useCallback(() => {
    setIsPaused(false);
  }, []);

  const stop = useCallback(() => {
    setIsActive(false);
    setIsPaused(false);
    setTimeLeft(initialSeconds);
  }, [initialSeconds]);

  const reset = useCallback((newTime?: number) => {
    const resetTime = newTime ?? initialSeconds;
    setTimeLeft(resetTime);
    setIsActive(false);
    setIsPaused(false);
  }, [initialSeconds]);

  useEffect(() => {
    if (isActive && !isPaused) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((time) => {
          if (time <= 1) {
            setIsActive(false);
            return 0;
          }
          return time - 1;
        });
      }, 1000);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isActive, isPaused]);

  useEffect(() => {
    setTimeLeft(initialSeconds);
  }, [initialSeconds]);

  return {
    timeLeft,
    isActive,
    isPaused,
    start,
    pause,
    resume,
    stop,
    reset,
  };
}

// Real-time data update hook
export function useRealTimeUpdates(
  fetchFunction: () => void,
  interval: number = 30000, // 30 seconds default
  dependencies: any[] = []
) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const update = useCallback(async () => {
    setIsUpdating(true);
    try {
      await fetchFunction();
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Real-time update failed:', error);
    } finally {
      setIsUpdating(false);
    }
  }, [fetchFunction]);

  const startUpdates = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    
    intervalRef.current = setInterval(update, interval);
    update(); // Initial update
  }, [update, interval]);

  const stopUpdates = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  useEffect(() => {
    startUpdates();
    return () => stopUpdates();
  }, [startUpdates, stopUpdates, ...dependencies]);

  return {
    isUpdating,
    lastUpdate,
    update,
    startUpdates,
    stopUpdates,
  };
}

// Countdown display component
interface CountdownDisplayProps {
  seconds: number;
  format?: 'full' | 'compact' | 'minimal';
  showProgress?: boolean;
  totalSeconds?: number;
  className?: string;
  onComplete?: () => void;
}

export function CountdownDisplay({
  seconds,
  format = 'full',
  showProgress = false,
  totalSeconds,
  className = '',
  onComplete,
}: CountdownDisplayProps) {
  const [displaySeconds, setDisplaySeconds] = useState(seconds);

  useEffect(() => {
    setDisplaySeconds(seconds);
  }, [seconds]);

  useEffect(() => {
    if (displaySeconds <= 0 && onComplete) {
      onComplete();
    }
  }, [displaySeconds, onComplete]);

  const formatTime = (totalSeconds: number) => {
    const days = Math.floor(totalSeconds / (24 * 3600));
    const hours = Math.floor((totalSeconds % (24 * 3600)) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    switch (format) {
      case 'compact':
        if (days > 0) return `${days}d ${hours}h ${minutes}m`;
        if (hours > 0) return `${hours}h ${minutes}m ${seconds}s`;
        return `${minutes}m ${seconds}s`;
      
      case 'minimal':
        if (days > 0) return `${days}d`;
        if (hours > 0) return `${hours}h`;
        return `${minutes}m`;
      
      case 'full':
      default:
        const pad = (n: number) => n.toString().padStart(2, '0');
        if (days > 0) {
          return `${days}:${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
        }
        return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
    }
  };

  const progressPercentage = totalSeconds ? 
    ((totalSeconds - displaySeconds) / totalSeconds) * 100 : 0;

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex items-center gap-2">
        <Clock className="w-4 h-4 text-muted-foreground" />
        <span className="font-mono text-lg font-bold">
          {formatTime(displaySeconds)}
        </span>
      </div>
      
      {showProgress && totalSeconds && (
        <Progress 
          value={progressPercentage} 
          className="h-2"
        />
      )}
    </div>
  );
}

// Real-time status indicator
interface RealTimeStatusProps {
  isUpdating: boolean;
  lastUpdate: Date | null;
  onManualUpdate?: () => void;
  updateInterval?: number;
}

export function RealTimeStatus({
  isUpdating,
  lastUpdate,
  onManualUpdate,
  updateInterval = 30000,
}: RealTimeStatusProps) {
  const [timeSinceUpdate, setTimeSinceUpdate] = useState(0);

  useEffect(() => {
    if (!lastUpdate) return;

    const interval = setInterval(() => {
      const now = new Date();
      const diff = Math.floor((now.getTime() - lastUpdate.getTime()) / 1000);
      setTimeSinceUpdate(diff);
    }, 1000);

    return () => clearInterval(interval);
  }, [lastUpdate]);

  const getStatusColor = () => {
    if (isUpdating) return 'bg-blue-500';
    if (timeSinceUpdate > updateInterval / 1000) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getStatusText = () => {
    if (isUpdating) return 'Updating...';
    if (!lastUpdate) return 'Never updated';
    if (timeSinceUpdate < 60) return `Updated ${timeSinceUpdate}s ago`;
    const minutes = Math.floor(timeSinceUpdate / 60);
    return `Updated ${minutes}m ago`;
  };

  return (
    <div className="flex items-center gap-2">
      <div className={`w-2 h-2 rounded-full ${getStatusColor()} ${isUpdating ? 'animate-pulse' : ''}`} />
      <span className="text-xs text-muted-foreground">
        {getStatusText()}
      </span>
      
      {onManualUpdate && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onManualUpdate}
          disabled={isUpdating}
          className="h-6 px-2"
        >
          <RefreshCw className={`w-3 h-3 ${isUpdating ? 'animate-spin' : ''}`} />
        </Button>
      )}
    </div>
  );
}

// Epoch countdown component specifically for the DeFi context
interface EpochCountdownProps {
  secondsUntilNextEpoch: number;
  className?: string;
  onEpochComplete?: () => void;
}

export function EpochCountdown({
  secondsUntilNextEpoch,
  className = '',
  onEpochComplete,
}: EpochCountdownProps) {
  const totalEpochDuration = 24 * 60 * 60; // 24 hours in seconds
  const progress = ((totalEpochDuration - secondsUntilNextEpoch) / totalEpochDuration) * 100;

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-muted-foreground">Next Rebase</h3>
        <Badge variant="secondary" className="text-xs">
          Epoch Progress
        </Badge>
      </div>
      
      <CountdownDisplay
        seconds={secondsUntilNextEpoch}
        format="compact"
        showProgress={true}
        totalSeconds={totalEpochDuration}
        onComplete={onEpochComplete}
      />
      
      <div className="text-xs text-muted-foreground">
        Rewards will be calculated and distributed when the countdown reaches zero
      </div>
    </div>
  );
}

// Prize draw countdown component
interface PrizeDrawCountdownProps {
  drawTime: Date;
  prizeAmount: string;
  className?: string;
}

export function PrizeDrawCountdown({
  drawTime,
  prizeAmount,
  className = '',
}: PrizeDrawCountdownProps) {
  const [timeUntilDraw, setTimeUntilDraw] = useState(0);

  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date();
      const diff = Math.max(0, Math.floor((drawTime.getTime() - now.getTime()) / 1000));
      setTimeUntilDraw(diff);
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 60000);

    return () => clearInterval(interval);
  }, [drawTime]);

  return (
    <div className={`text-center space-y-4 ${className}`}>
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Next Prize Draw</h3>
        <div className="text-2xl font-bold text-primary">
          {prizeAmount}
        </div>
      </div>
      
      <CountdownDisplay
        seconds={timeUntilDraw}
        format="full"
        className="justify-center"
      />
      
      {timeUntilDraw === 0 ? (
        <Badge variant="default" className="animate-pulse">
          Draw in Progress!
        </Badge>
      ) : (
        <div className="text-sm text-muted-foreground">
          Time until next prize draw
        </div>
      )}
    </div>
  );
}

// Animated number counter for displaying changing values
interface AnimatedCounterProps {
  value: number;
  duration?: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  className?: string;
}

export function AnimatedCounter({
  value,
  duration = 1000,
  decimals = 0,
  prefix = '',
  suffix = '',
  className = '',
}: AnimatedCounterProps) {
  const [currentValue, setCurrentValue] = useState(0);
  const [previousValue, setPreviousValue] = useState(0);

  useEffect(() => {
    setPreviousValue(currentValue);
    
    const startTime = Date.now();
    const startValue = currentValue;
    const difference = value - startValue;

    const updateValue = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing function for smooth animation
      const easeOutCubic = 1 - Math.pow(1 - progress, 3);
      
      const newValue = startValue + (difference * easeOutCubic);
      setCurrentValue(newValue);

      if (progress < 1) {
        requestAnimationFrame(updateValue);
      }
    };

    requestAnimationFrame(updateValue);
  }, [value, duration, currentValue]);

  const formatNumber = (num: number) => {
    return num.toFixed(decimals);
  };

  return (
    <span className={`font-mono ${className}`}>
      {prefix}{formatNumber(currentValue)}{suffix}
    </span>
  );
}