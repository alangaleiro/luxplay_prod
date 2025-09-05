'use client';

import { useState } from 'react';

interface CopyableAddressProps {
  address?: string;
}

export function CopyableAddress({ address }: CopyableAddressProps) {
  const [copied, setCopied] = useState(false);
  
  const handleCopy = () => {
    if (address) {
      navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!address) return null;

  return (
    <span 
      className={`inline-flex items-center justify-center rounded-md border px-3 py-1 text-xs font-medium w-fit whitespace-nowrap shrink-0 cursor-pointer hover:bg-secondary/80 border-transparent bg-secondary text-secondary-foreground ${copied ? 'bg-green-500/20 border-green-500/30' : ''}`}
      onClick={handleCopy}
    >
      {address.slice(0, 6)}...{address.slice(-4)}
      {copied && <span className="ml-1">✓</span>}
    </span>
  );
}