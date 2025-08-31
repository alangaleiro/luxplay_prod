// LuxPlay (Play Hub v2) Contract Addresses Configuration
// Updated for Play Hub v2 migration - Binary Pool removed, PlaySwap added

export const CONTRACT_ADDRESSES = {
  // Active Pool Contract - centralized rewards, deposits, epochs (Play Hub v2)
  ACTIVE_POOL: (process.env.NEXT_PUBLIC_ACTIVE_POOL_ADDRESS || "0x0000000000000000000000000000000000000000") as `0x${string}`,
  
  // User Contract - handles registration, sponsors
  USER_CONTRACT: (process.env.NEXT_PUBLIC_USER_CONTRACT_ADDRESS || "0x0000000000000000000000000000000000000000") as `0x${string}`,
  
  // Oracle Contract - provides PLAY/USD price feeds
  ORACLE: (process.env.NEXT_PUBLIC_ORACLE_ADDRESS || "0x0000000000000000000000000000000000000000") as `0x${string}`,
  
  // Play Token Contract - PLAY token (18 decimals)
  PLAY_TOKEN: (process.env.NEXT_PUBLIC_PLAY_TOKEN_ADDRESS || "0x0000000000000000000000000000000000000000") as `0x${string}`,
  
  // USDT Token Contract - USDT token (6 decimals)
  USDT_TOKEN: (process.env.NEXT_PUBLIC_USDT_TOKEN_ADDRESS || "0x0000000000000000000000000000000000000000") as `0x${string}`,
  
  // PlaySwap Contract - token swapping with donation
  PLAYSWAP: (process.env.NEXT_PUBLIC_PLAYSWAP_ADDRESS || "0x0000000000000000000000000000000000000000") as `0x${string}`,
  
  // Legacy compatibility - TOKEN points to PLAY_TOKEN
  TOKEN: (process.env.NEXT_PUBLIC_PLAY_TOKEN_ADDRESS || "0x0000000000000000000000000000000000000000") as `0x${string}`
} as const;

// Import Play Hub v2 ABIs
import ActivePoolABI from '../abi/ActivePool.json';
import UserABI from '../abi/User.json';
import OracleABI from '../abi/Oracle.json';
import PlayTokenABI from '../abi/PlayToken.json';
import USDTABI from '../abi/USDT.json';
import PlaySwapABI from '../abi/PlaySwap.json';

export const ABIS = {
  activePool: ActivePoolABI,
  user: UserABI,
  oracle: OracleABI,
  playToken: PlayTokenABI,
  usdt: USDTABI,
  playSwap: PlaySwapABI,
  // Legacy compatibility
  token: PlayTokenABI
} as const;

// Chain configuration for Play Hub v2
export const CHAIN_CONFIG = {
  CHAIN_ID: parseInt(process.env.NEXT_PUBLIC_CHAIN_ID || "1"), // Default to Ethereum mainnet
  RPC_URL: process.env.NEXT_PUBLIC_RPC_URL || "https://mainnet.infura.io/v3/YOUR-PROJECT-ID"
};

// Token Configuration
export const TOKEN_CONFIG = {
  PLAY: {
    name: 'Play Token',
    symbol: 'PLAY',
    decimals: 18,
    address: CONTRACT_ADDRESSES.PLAY_TOKEN
  },
  USDT: {
    name: 'Tether USD',
    symbol: 'USDT', 
    decimals: 6,
    address: CONTRACT_ADDRESSES.USDT_TOKEN
  }
} as const;

// Development mode toggle
export const USE_MOCK_DATA = process.env.NODE_ENV === 'development' && 
  process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true';