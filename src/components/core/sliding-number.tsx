'use client';

import React, { useState, useEffect } from 'react';

interface SlidingNumberProps {
  value: number;
  padStart?: boolean;
}

export function SlidingNumber({ value, padStart }: SlidingNumberProps) {
  const [previousValue, setPreviousValue] = useState(value);
  const [animationClass, setAnimationClass] = useState('');

  useEffect(() => {
    if (value !== previousValue) {
      setAnimationClass(value < previousValue ? 'animate-slide-down' : 'animate-slide-up');
      const timer = setTimeout(() => {
        setPreviousValue(value);
      }, 0); // set previous value after animation starts
      return () => clearTimeout(timer);
    }
  }, [value, previousValue]);

  const displayValue = padStart && value < 10 ? `0${value}` : `${value}`;

  return (
    <div className="relative h-8 w-6 overflow-hidden tabular-nums">
      <div
        key={value}
        className={animationClass}
        onAnimationEnd={() => setAnimationClass('')}
      >
        {displayValue}
      </div>
    </div>
  );
}
