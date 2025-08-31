// Type definitions for the Destiny application

export type PlanId = 0 | 1 | 2; // 300%, 600%, 1200% APY

// User-related types
export interface UserData {
  activePrize: bigint;
  burned: bigint;
  activeAmount: bigint;
  warmupAmount: bigint;
  claimable: bigint;
  currentPlan: PlanId;
  isRegistered: boolean;
  lastEpochProcessed?: number;
}

export interface UserInfo {
  activePrize: bigint;
  burned: bigint;
}

export interface UserTotals {
  plan: PlanId;
  active: bigint;
  warmup: bigint;
}

// Networking and referral types
export interface NetworkingData {
  downlineCount: number[];
  stakeByLevel: bigint[];
  unlockedLevels: boolean[];
  totalDownlineStake: bigint;
  activeReferrals: number;
}

export interface ReferralData {
  totalBurned: bigint;
  available: bigint;
  totalReceived: bigint;
  remainingCap: bigint;
  referrer: string;
  referralLink: string;
  monthlyEarnings?: bigint;
}

// Global platform data
export interface GlobalData {
  totalActive: bigint;
  currentPrice: number;
  secondsUntilNextEpoch: number;
  globalValueBurned: number;
  currentEpoch: number;
  totalUsers?: number;
  totalValueStaked?: bigint;
}

// Binary pool types
export interface BinaryPoolData {
  leftVolume: bigint;
  rightVolume: bigint;
  binaryAccrued: bigint;
  dailyBinaryEarnings?: bigint;
  lifetimeBinaryEarnings?: bigint;
  remainingCap: bigint;
}

// Contract interaction types
export interface ContractConfig {
  address: `0x${string}`;
  abi: any[];
  functionName: string;
  args?: any[];
  enabled?: boolean;
}

export interface TransactionResult {
  hash: `0x${string}`;
  status: 'success' | 'error' | 'pending';
  confirmations?: number;
}

// UI Component types
export interface ActionBarProps {
  mode: 'burn' | 'redeem';
  amount: string;
  plan: PlanId;
  onModeChange: (mode: 'burn' | 'redeem') => void;
  onAmountChange: (amount: string) => void;
  onPlanChange: (plan: PlanId) => void;
  onSubmit: () => void;
  isLoading: boolean;
  maxAmount: bigint;
  disabled?: boolean;
}

export interface MetricsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  action?: {
    label: string;
    onClick: () => void;
    loading?: boolean;
    disabled?: boolean;
  };
  variant?: 'default' | 'highlight' | 'success' | 'warning';
  className?: string;
}

export interface NetworkingLevelProps {
  level: number;
  userCount: number;
  volume: bigint;
  unlocked: boolean;
  requiredUsd: number;
}

export interface CountdownTimerProps {
  seconds: number;
  onComplete?: () => void;
  format?: 'full' | 'compact';
}

// Form types
export interface DepositFormData {
  amount: string;
  plan: PlanId;
}

export interface ClaimFormData {
  amount: string;
}

export interface RegistrationFormData {
  sponsor: string;
}

// Navigation types
export interface NavigationItem {
  href: string;
  label: string;
  icon?: React.ComponentType<any>;
  disabled?: boolean;
}

// Wallet connection types
export interface WalletState {
  isConnected: boolean;
  address: string | null;
  isConnecting: boolean;
  error: string | null;
}

// Store types (Zustand)
export interface LuxplayStore {
  // Wallet state
  wallet: WalletState;
  
  // User data
  userData: UserData | null;
  networkingData: NetworkingData | null;
  referralData: ReferralData | null;
  globalData: GlobalData | null;
  binaryPoolData: BinaryPoolData | null;
  
  // UI state
  isLoading: boolean;
  currentPage: string;
  notifications: Notification[];
  
  // Actions
  setUserData: (data: UserData | null) => void;
  setNetworkingData: (data: NetworkingData | null) => void;
  setReferralData: (data: ReferralData | null) => void;
  setGlobalData: (data: GlobalData | null) => void;
  setBinaryPoolData: (data: BinaryPoolData | null) => void;
  setWallet: (wallet: Partial<WalletState>) => void;
  setLoading: (loading: boolean) => void;
  addNotification: (notification: Omit<Notification, 'id'>) => void;
  removeNotification: (id: string) => void;
  
  // Async actions
  syncUserData: () => Promise<void>;
  syncAllData: () => Promise<void>;
  resetStore: () => void;
}

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

// API types
export interface PriceResponse {
  price: number;
  timestamp: number;
  source: string;
}

export interface ContractConstants {
  MIN_DEPOSIT: bigint;
  MIN_PLAN0: bigint;
  MIN_PLAN1: bigint;
  MIN_PLAN2: bigint;
  EPOCH_DURATION: number;
  WARMUP_EPOCHS: number;
  EXPIRATION_EPOCHS: number;
  COMPANY_BP: number;
  REFERRAL_BP: number[];
}

// Error types
export interface ContractError extends Error {
  code?: string;
  reason?: string;
  transaction?: {
    hash: string;
  };
}

export interface ValidationError extends Error {
  field: string;
  value: any;
}

// Hook return types
export interface UseActivePoolReturn {
  // Data
  activePrize?: bigint;
  burned?: bigint;
  activeAmount?: bigint;
  warmupAmount?: bigint;
  claimable?: bigint;
  countdown?: number;
  
  // States
  isLoading: boolean;
  isPending: boolean;
  error: Error | null;
  
  // Actions
  deposit: (amount: bigint, plan: PlanId) => Promise<void>;
  claimRewards: (amount: bigint) => Promise<void>;
  checkpoint: () => Promise<void>;
  upgradePlan: (plan: PlanId) => Promise<void>;
  moveWarmUpToActivePool: () => Promise<void>;
  
  // Transaction receipt
  receipt?: TransactionResult;
}

export interface UseUserContractReturn {
  isRegistered?: boolean;
  referrals?: string[];
  referrer?: string;
  isLoading: boolean;
  error: Error | null;
  registerUser: (sponsor: string) => Promise<void>;
}

export interface UseBinaryPoolReturn {
  remainingCap?: bigint;
  binaryAccrued?: bigint;
  leftVolume?: bigint;
  rightVolume?: bigint;
  isLoading: boolean;
  error: Error | null;
  claimBinary: () => Promise<void>;
}

export interface UseOracleReturn {
  price?: number;
  lastUpdated?: number;
  isLoading: boolean;
  error: Error | null;
}

// Chart data types
export interface ChartDataPoint {
  label: string;
  value: number;
  color?: string;
}

export interface TimeSeriesData {
  timestamp: number;
  value: number;
}

// Theme types
export type ThemeMode = 'dark';

// Utility types
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

export type RequiredKeys<T, K extends keyof T> = T & Required<Pick<T, K>>;

// React component props
export interface BaseComponentProps {
  className?: string;
  children?: React.ReactNode;
}

export interface PageProps {
  params?: { [key: string]: string };
  searchParams?: { [key: string]: string | string[] | undefined };
}

// Environment types
export interface EnvironmentConfig {
  NODE_ENV: 'development' | 'production' | 'test';
  NEXT_PUBLIC_USE_MOCK_DATA?: string;
  NEXT_PUBLIC_CHAIN_ID?: string;
  NEXT_PUBLIC_RPC_URL?: string;
  NEXT_PUBLIC_ACTIVE_POOL_ADDRESS?: string;
  NEXT_PUBLIC_BINARY_POOL_ADDRESS?: string;
  NEXT_PUBLIC_USER_CONTRACT_ADDRESS?: string;
  NEXT_PUBLIC_ORACLE_ADDRESS?: string;
  NEXT_PUBLIC_TOKEN_ADDRESS?: string;
}