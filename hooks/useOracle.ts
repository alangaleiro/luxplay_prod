import { useReadContract } from 'wagmi';
import oracleAbi from '../abi/Oracle.json';
import { CONTRACT_ADDRESSES } from '../lib/contracts';

// Read hooks
export function useGetPrice() {
  return useReadContract({
    address: CONTRACT_ADDRESSES.ORACLE,
    abi: oracleAbi,
    functionName: 'getPrice',
    query: {
      refetchInterval: 30000, // Update every 30 seconds
    }
  });
}

export function useDecimals0() {
  return useReadContract({
    address: CONTRACT_ADDRESSES.ORACLE,
    abi: oracleAbi,
    functionName: 'decimals0',
  });
}

export function useDecimals1() {
  return useReadContract({
    address: CONTRACT_ADDRESSES.ORACLE,
    abi: oracleAbi,
    functionName: 'decimals1',
  });
}

export function usePeekSqrtPrice() {
  return useReadContract({
    address: CONTRACT_ADDRESSES.ORACLE,
    abi: oracleAbi,
    functionName: 'peekSqrtPrice',
  });
}

export function usePoolId() {
  return useReadContract({
    address: CONTRACT_ADDRESSES.ORACLE,
    abi: oracleAbi,
    functionName: 'poolId',
  });
}

// Composite hook for formatted price data
export function useFormattedPrice() {
  const { data: price, isLoading: priceLoading, error } = useGetPrice();
  const { data: decimals0 } = useDecimals0();
  const { data: decimals1 } = useDecimals1();

  // Format price considering decimals
  const formatPrice = (rawPrice: bigint, dec0: number, dec1: number): number => {
    if (!rawPrice || dec0 === undefined || dec1 === undefined) return 0;
    
    // Adjust for decimal differences
    const decimalAdjustment = dec1 - dec0;
    const adjustedPrice = decimalAdjustment >= 0 
      ? rawPrice * (10n ** BigInt(decimalAdjustment))
      : rawPrice / (10n ** BigInt(-decimalAdjustment));
    
    return Number(adjustedPrice) / (10 ** 18); // Assuming 18 decimal standard
  };

  const formattedPrice = price && decimals0 !== undefined && decimals1 !== undefined
    ? formatPrice(price as bigint, decimals0, decimals1)
    : 0;

  return {
    price: formattedPrice,
    rawPrice: price || 0n,
    decimals0: decimals0 || 0,
    decimals1: decimals1 || 0,
    isLoading: priceLoading,
    error,
  };
}