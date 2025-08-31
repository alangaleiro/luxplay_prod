// Mock data system for development without real smart contracts

export type PlanId = 0 | 1 | 2; // 300%, 600%, 1200% APY

export interface UserData {
  activePrize: bigint;
  burned: bigint;
  activeAmount: bigint;
  warmupAmount: bigint;
  claimable: bigint;
  currentPlan: PlanId;
  isRegistered: boolean;
  lastEpochProcessed: number;
}

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
  monthlyEarnings: bigint;
}

export interface GlobalData {
  totalActive: bigint;
  currentPrice: number;
  secondsUntilNextEpoch: number;
  globalValueBurned: number;
  currentEpoch: number;
  totalUsers: number;
  totalValueStaked: bigint;
}

export interface BinaryPoolData {
  leftVolume: bigint;
  rightVolume: bigint;
  binaryAccrued: bigint;
  dailyBinaryEarnings: bigint;
  lifetimeBinaryEarnings: bigint;
  remainingCap: bigint;
}

// Comprehensive mock data
export const MOCK_DATA = {
  // User data for active development
  userData: {
    activePrize: BigInt("1500000000000000000000"), // 1500 BITZ
    burned: BigInt("5000000000000000000000"), // 5000 BITZ
    activeAmount: BigInt("3000000000000000000000"), // 3000 BITZ
    warmupAmount: BigInt("500000000000000000000"), // 500 BITZ
    claimable: BigInt("250000000000000000000"), // 250 BITZ
    currentPlan: 1 as PlanId, // 600% APY
    isRegistered: true,
    lastEpochProcessed: 155
  } as UserData,
  
  // Referral program data
  referralData: {
    totalBurned: BigInt("5000000000000000000000"), // 5000 BITZ
    available: BigInt("150000000000000000000"), // 150 BITZ
    totalReceived: BigInt("800000000000000000000"), // 800 BITZ
    remainingCap: BigInt("2000000000000000000000"), // 2000 BITZ equivalent in USD
    referrer: "0x742d35Cc6634C0532925a3b8D474a3eb7FBff6", // Example referrer
    referralLink: "https://destiny.app/connect?ref=0x742d35Cc6634C0532925a3b8D474a3eb7FBff6",
    monthlyEarnings: BigInt("300000000000000000000") // 300 BITZ
  } as ReferralData,
  
  // Networking structure (15 levels)
  networkingData: {
    downlineCount: [5, 12, 28, 45, 67, 89, 123, 156, 189, 234, 278, 312, 345, 378, 401],
    stakeByLevel: [
      BigInt("10000000000000000000000"), // Level 1: 10k BITZ
      BigInt("25000000000000000000000"), // Level 2: 25k BITZ
      BigInt("50000000000000000000000"), // Level 3: 50k BITZ
      BigInt("75000000000000000000000"), // Level 4: 75k BITZ
      BigInt("100000000000000000000000"), // Level 5: 100k BITZ
      BigInt("125000000000000000000000"), // Level 6: 125k BITZ
      BigInt("150000000000000000000000"), // Level 7: 150k BITZ
      BigInt("175000000000000000000000"), // Level 8: 175k BITZ
      BigInt("200000000000000000000000"), // Level 9: 200k BITZ
      BigInt("225000000000000000000000"), // Level 10: 225k BITZ
      BigInt("250000000000000000000000"), // Level 11: 250k BITZ
      BigInt("275000000000000000000000"), // Level 12: 275k BITZ
      BigInt("300000000000000000000000"), // Level 13: 300k BITZ
      BigInt("325000000000000000000000"), // Level 14: 325k BITZ
      BigInt("350000000000000000000000")  // Level 15: 350k BITZ
    ],
    unlockedLevels: [true, true, true, true, false, false, false, false, false, false, false, false, false, false, false],
    totalDownlineStake: BigInt("2500000000000000000000000"), // 2.5M BITZ total
    activeReferrals: 45
  } as NetworkingData,
  
  // Global platform data
  globalData: {
    totalActive: BigInt("50000000000000000000000000"), // 50M BITZ
    currentPrice: 0.045, // $0.045 USD per BITZ
    secondsUntilNextEpoch: 7200, // 2 hours
    globalValueBurned: 2250000, // $2.25M USD
    currentEpoch: 156,
    totalUsers: 12543,
    totalValueStaked: BigInt("75000000000000000000000000") // 75M BITZ
  } as GlobalData,
  
  // Binary pool data
  binaryPoolData: {
    leftVolume: BigInt("15000000000000000000000"), // 15k BITZ
    rightVolume: BigInt("12000000000000000000000"), // 12k BITZ
    binaryAccrued: BigInt("500000000000000000000"), // 500 BITZ
    dailyBinaryEarnings: BigInt("50000000000000000000"), // 50 BITZ
    lifetimeBinaryEarnings: BigInt("2000000000000000000000"), // 2k BITZ
    remainingCap: BigInt("5000000000000000000000") // 5k BITZ
  } as BinaryPoolData,
  
  // Contract constants (matching real contract values)
  constants: {
    MIN_DEPOSIT: BigInt("10000000000000000000"), // 10 BITZ
    MIN_PLAN0: BigInt("100000000000000000000"), // 100 BITZ for 300% plan
    MIN_PLAN1: BigInt("500000000000000000000"), // 500 BITZ for 600% plan
    MIN_PLAN2: BigInt("1000000000000000000000"), // 1000 BITZ for 1200% plan
    EPOCH_DURATION: 7200, // 2 hours in seconds
    WARMUP_EPOCHS: 2, // 2 epochs for warmup
    EXPIRATION_EPOCHS: 100, // 100 epochs until expiration
    COMPANY_BP: 500, // 5% company fee
    REFERRAL_BP: [300, 200, 100, 50, 50] // Referral bonuses by level
  },
  
  // Level unlock requirements (USD values)
  levelRequirements: [
    100,   // Level 1: $100
    200,   // Level 2: $200  
    300,   // Level 3: $300
    400,   // Level 4: $400
    500,   // Level 5: $500
    600,   // Level 6: $600
    700,   // Level 7: $700
    800,   // Level 8: $800
    900,   // Level 9: $900
    1000,  // Level 10: $1000
    1100,  // Level 11: $1100
    1200,  // Level 12: $1200
    1300,  // Level 13: $1300
    1400,  // Level 14: $1400
    1500   // Level 15: $1500
  ]
};

// Mock wallet addresses for testing
export const MOCK_ADDRESSES = {
  USER: "0x1234567890123456789012345678901234567890",
  REFERRER: "0x742d35Cc6634C0532925a3b8D474a3eb7FBff6",
  ROOT_USER: "0x0000000000000000000000000000000000000001"
};

// Mock transaction responses
export const MOCK_TRANSACTIONS = {
  DEPOSIT: {
    hash: "0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890",
    status: 'success' as const,
    confirmations: 3
  },
  CLAIM: {
    hash: "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
    status: 'success' as const,
    confirmations: 5
  },
  REGISTER: {
    hash: "0xfedcba0987654321fedcba0987654321fedcba0987654321fedcba0987654321",
    status: 'success' as const,
    confirmations: 2
  }
};

// Function to simulate contract calls with delays
export const mockContractCall = async <T>(data: T, delay = 500): Promise<T> => {
  await new Promise(resolve => setTimeout(resolve, delay));
  return data;
};

// Function to simulate transaction execution
export const mockTransaction = async (type: keyof typeof MOCK_TRANSACTIONS) => {
  await new Promise(resolve => setTimeout(resolve, 1000));
  return MOCK_TRANSACTIONS[type];
};

// Function to generate dynamic mock data (simulates real-time updates)
export const generateDynamicMockData = () => {
  const baseData = MOCK_DATA;
  
  // Add some randomness to simulate real-time changes
  const priceVariation = (Math.random() - 0.5) * 0.01; // ±1% price variation
  const countdownVariation = Math.floor(Math.random() * 60); // ±60s countdown variation
  
  return {
    ...baseData,
    globalData: {
      ...baseData.globalData,
      currentPrice: Math.max(0.01, baseData.globalData.currentPrice + priceVariation),
      secondsUntilNextEpoch: Math.max(0, baseData.globalData.secondsUntilNextEpoch - countdownVariation)
    }
  };
};

// Mock user interactions
export const mockUserActions = {
  // Simulate depositing tokens
  deposit: async (amount: bigint, plan: PlanId) => {
    console.log(`[MOCK] Deposit: ${amount.toString()} BITZ to Plan ${plan}`);
    await mockContractCall(null, 2000);
    return MOCK_TRANSACTIONS.DEPOSIT;
  },
  
  // Simulate claiming rewards
  claimRewards: async (amount: bigint) => {
    console.log(`[MOCK] Claim Rewards: ${amount.toString()} BITZ`);
    await mockContractCall(null, 1500);
    return MOCK_TRANSACTIONS.CLAIM;
  },
  
  // Simulate moving warmup to active
  moveWarmupToActive: async () => {
    console.log('[MOCK] Move Warmup to Active Pool');
    await mockContractCall(null, 1000);
    return MOCK_TRANSACTIONS.CLAIM;
  },
  
  // Simulate plan upgrade
  upgradePlan: async (newPlan: PlanId) => {
    console.log(`[MOCK] Upgrade to Plan ${newPlan}`);
    await mockContractCall(null, 1500);
    return MOCK_TRANSACTIONS.DEPOSIT;
  },
  
  // Simulate user registration
  registerUser: async (sponsor: string) => {
    console.log(`[MOCK] Register User with Sponsor: ${sponsor}`);
    await mockContractCall(null, 2000);
    return MOCK_TRANSACTIONS.REGISTER;
  },
  
  // Simulate checkpoint sync
  checkpoint: async () => {
    console.log('[MOCK] Checkpoint - Syncing data');
    await mockContractCall(null, 800);
    return true;
  }
};

// Export function to check if mock mode is enabled
export const isMockMode = (): boolean => {
  return process.env.NODE_ENV === 'development' && 
    process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true';
};