import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Web3 Utility Functions

/**
 * Convert a number or string to Wei (BigInt with 18 decimals)
 * @param value - The value to convert
 * @param decimals - Number of decimals (default: 18)
 * @returns BigInt representation
 */
export const toWei = (value: string | number, decimals = 18): bigint => {
  if (!value || value === '') return 0n;
  
  // Convert to string and handle decimal points
  const valueStr = String(value);
  const parts = valueStr.split('.');
  const integerPart = parts[0] || '0';
  const decimalPart = (parts[1] || '').padEnd(decimals, '0').slice(0, decimals);
  
  const fullString = integerPart + decimalPart;
  return BigInt(fullString);
};

/**
 * Convert Wei (BigInt) to a readable number
 * @param value - BigInt value in Wei
 * @param decimals - Number of decimals (default: 18)
 * @returns Number representation
 */
export const fromWei = (value: bigint, decimals = 18): number => {
  if (!value) return 0;
  
  const divisor = 10 ** decimals;
  return Number(value) / divisor;
};

/**
 * Format a number as USD currency
 * @param value - Number to format
 * @returns Formatted USD string
 */
export const formatUSD = (value: number): string => {
  return value.toLocaleString('en-US', { 
    style: 'currency', 
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
};

/**
 * Format a token amount with proper decimals
 * @param value - BigInt or number value
 * @param decimals - Token decimals (default: 18)
 * @param displayDecimals - Number of decimals to display (default: 4)
 * @returns Formatted string
 */
export const formatToken = (
  value: bigint | number, 
  decimals = 18, 
  displayDecimals = 4
): string => {
  const numValue = typeof value === 'bigint' ? fromWei(value, decimals) : value;
  
  if (numValue === 0) return '0';
  
  return numValue.toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: displayDecimals
  });
};

/**
 * Get APY rate per epoch based on plan
 * @param plan - Plan ID (0, 1, or 2)
 * @returns Percentage per epoch
 */
export const planEpochRatePct = (plan: 0 | 1 | 2): number => {
  // Rates per epoch as specified in documentation
  switch (plan) {
    case 0: return 0.126682; // 300% APY
    case 1: return 0.177867; // 600% APY  
    case 2: return 0.234517; // 1200% APY
    default: return 0;
  }
};

/**
 * Get plan display name
 * @param plan - Plan ID (0, 1, or 2)
 * @returns Plan display name
 */
export const getPlanName = (plan: 0 | 1 | 2): string => {
  switch (plan) {
    case 0: return '300% APY';
    case 1: return '600% APY';
    case 2: return '1200% APY';
    default: return 'Unknown Plan';
  }
};

/**
 * Format time duration in seconds to human readable format
 * @param seconds - Duration in seconds
 * @returns Formatted time string
 */
export const formatDuration = (seconds: number): string => {
  if (seconds <= 0) return '0s';
  
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  
  if (hours > 0) {
    return `${hours}h ${minutes}m ${secs}s`;
  } else if (minutes > 0) {
    return `${minutes}m ${secs}s`;
  } else {
    return `${secs}s`;
  }
};

/**
 * Format countdown timer for display
 * @param seconds - Remaining seconds
 * @returns Formatted countdown string
 */
export const formatCountdown = (seconds: number): string => {
  if (seconds <= 0) return '00:00:00';
  
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

/**
 * Truncate an Ethereum address for display
 * @param address - Full Ethereum address
 * @param startLength - Characters to show at start (default: 6)
 * @param endLength - Characters to show at end (default: 4)
 * @returns Truncated address
 */
export const truncateAddress = (address: string, startLength = 6, endLength = 4): string => {
  if (!address || address.length <= startLength + endLength) {
    return address;
  }
  
  return `${address.slice(0, startLength)}...${address.slice(-endLength)}`;
};

/**
 * Validate Ethereum address format
 * @param address - Address to validate
 * @returns Boolean indicating if address is valid
 */
export const isValidAddress = (address: string): boolean => {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
};

/**
 * Calculate USD value from token amount and price
 * @param tokenAmount - Amount in tokens (BigInt)
 * @param priceUsd - Price per token in USD
 * @param decimals - Token decimals (default: 18)
 * @returns USD value
 */
export const calculateUsdValue = (
  tokenAmount: bigint, 
  priceUsd: number, 
  decimals = 18
): number => {
  const tokenValue = fromWei(tokenAmount, decimals);
  return tokenValue * priceUsd;
};

/**
 * Format percentage value
 * @param value - Percentage as decimal (e.g., 0.05 for 5%)
 * @param decimals - Number of decimal places (default: 2)
 * @returns Formatted percentage string
 */
export const formatPercentage = (value: number, decimals = 2): string => {
  return `${(value * 100).toFixed(decimals)}%`;
};

/**
 * Safe BigInt parsing from various types
 * @param value - Value to parse (string, number, bigint, or unknown)
 * @returns BigInt or 0n if parsing fails
 */
export const safeBigInt = (value: unknown): bigint => {
  if (typeof value === 'bigint') return value;
  if (typeof value === 'number') return BigInt(Math.floor(value));
  if (typeof value === 'string' && value !== '') {
    try {
      return BigInt(value);
    } catch {
      return 0n;
    }
  }
  return 0n;
};

/**
 * Safe fromWei function that handles unknown types
 * @param value - Value to convert from Wei
 * @param decimals - Number of decimals (default: 18)
 * @returns Number or 0 if conversion fails
 */
export const safeFromWei = (value: unknown, decimals = 18): number => {
  return fromWei(safeBigInt(value), decimals);
};

/**
 * Safe address string extraction
 * @param value - Value to extract address from
 * @returns Valid address string or empty string
 */
export const safeAddress = (value: unknown): string => {
  if (typeof value === 'string' && value.startsWith('0x') && value.length === 42) {
    return value;
  }
  return '';
};

/**
 * Safe array extraction with type checking
 * @param value - Value to check
 * @param defaultArray - Default array to return
 * @returns Array or default array
 */
export const safeArray = <T>(value: unknown, defaultArray: T[] = []): T[] => {
  if (Array.isArray(value)) return value;
  return defaultArray;
};

/**
 * Generate a referral link
 * @param referrerAddress - Address of the referrer
 * @param baseUrl - Base URL for the application
 * @returns Complete referral link
 */
export const generateReferralLink = (referrerAddress: string, baseUrl?: string): string => {
  const base = baseUrl || (typeof window !== 'undefined' ? window.location.origin : '');
  return `${base}/connect?ref=${referrerAddress}`;
};

/**
 * Copy text to clipboard
 * @param text - Text to copy
 * @returns Promise that resolves when copy is complete
 */
export const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    } else {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      const result = document.execCommand('copy');
      textArea.remove();
      return result;
    }
  } catch (error) {
    console.error('Failed to copy text:', error);
    return false;
  }
};