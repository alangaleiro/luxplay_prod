import { z } from 'zod';
import { isAddress } from 'viem';
import { PlanId } from './types';

// Custom validators
const ethereumAddressSchema = z.string().refine(
  (value) => isAddress(value),
  { message: 'Must be a valid Ethereum address' }
);

const positiveNumberSchema = z.string().refine(
  (value) => {
    const num = parseFloat(value);
    return !isNaN(num) && num > 0;
  },
  { message: 'Must be a positive number' }
);

const planIdSchema = z.number().refine(
  (value): value is PlanId => [0, 1, 2].includes(value),
  { message: 'Must be a valid plan ID (0, 1, or 2)' }
);

// Registration form validation
export const registrationSchema = z.object({
  sponsorAddress: ethereumAddressSchema,
});

export type RegistrationForm = z.infer<typeof registrationSchema>;

// Deposit form validation
export const depositSchema = z.object({
  amount: positiveNumberSchema,
  planId: planIdSchema,
});

export type DepositForm = z.infer<typeof depositSchema>;

// Redeem form validation
export const redeemSchema = z.object({
  amount: positiveNumberSchema,
});

export type RedeemForm = z.infer<typeof redeemSchema>;

// Swap form validation
export const swapSchema = z.object({
  fromAmount: positiveNumberSchema,
  toAmount: z.string().optional(),
  fromToken: z.string().min(1, 'From token is required'),
  toToken: z.string().min(1, 'To token is required'),
  slippage: z.number().min(0.1).max(50).optional().default(0.5),
});

export type SwapForm = z.infer<typeof swapSchema>;

// Settings form validation
export const settingsSchema = z.object({
  theme: z.enum(['light', 'dark', 'system']),
  currency: z.enum(['USD', 'EUR', 'BTC', 'ETH']),
  refreshInterval: z.number().min(5).max(300),
  showAdvancedFeatures: z.boolean(),
  slippageTolerance: z.number().min(0.1).max(50),
});

export type SettingsForm = z.infer<typeof settingsSchema>;

// Referral claim validation
export const referralClaimSchema = z.object({
  amount: positiveNumberSchema,
});

export type ReferralClaimForm = z.infer<typeof referralClaimSchema>;

// Plan upgrade validation
export const planUpgradeSchema = z.object({
  newPlanId: planIdSchema,
});

export type PlanUpgradeForm = z.infer<typeof planUpgradeSchema>;

// General validation utilities
export const validateAmount = (
  amount: string,
  options?: {
    min?: number;
    max?: number;
    decimals?: number;
  }
) => {
  const num = parseFloat(amount);
  
  if (isNaN(num)) {
    return { isValid: false, error: 'Invalid number format' };
  }
  
  if (num <= 0) {
    return { isValid: false, error: 'Amount must be greater than 0' };
  }
  
  if (options?.min && num < options.min) {
    return { isValid: false, error: `Amount must be at least ${options.min}` };
  }
  
  if (options?.max && num > options.max) {
    return { isValid: false, error: `Amount must be at most ${options.max}` };
  }
  
  if (options?.decimals) {
    const decimals = amount.split('.')[1]?.length || 0;
    if (decimals > options.decimals) {
      return { isValid: false, error: `Maximum ${options.decimals} decimal places allowed` };
    }
  }
  
  return { isValid: true, error: null };
};

export const validateAddress = (address: string) => {
  if (!address) {
    return { isValid: false, error: 'Address is required' };
  }
  
  if (!isAddress(address)) {
    return { isValid: false, error: 'Invalid Ethereum address format' };
  }
  
  return { isValid: true, error: null };
};

// Balance validation
export const validateBalance = (
  amount: string, 
  availableBalance: bigint,
  decimals: number = 18
) => {
  const amountValidation = validateAmount(amount);
  if (!amountValidation.isValid) {
    return amountValidation;
  }
  
  const amountWei = BigInt(Math.floor(parseFloat(amount) * (10 ** decimals)));
  
  if (amountWei > availableBalance) {
    return { isValid: false, error: 'Insufficient balance' };
  }
  
  return { isValid: true, error: null };
};

// Transaction validation
export const validateTransaction = (
  type: 'deposit' | 'redeem' | 'claim' | 'approve',
  data: Record<string, any>
) => {
  switch (type) {
    case 'deposit':
      return depositSchema.safeParse(data);
    case 'redeem':
      return redeemSchema.safeParse(data);
    case 'claim':
      return referralClaimSchema.safeParse(data);
    default:
      return { success: false, error: { issues: [{ message: 'Unknown transaction type' }] } };
  }
};

// Error message formatting
export const formatValidationError = (error: z.ZodError): string => {
  return error.issues
    .map((issue) => issue.message)
    .join(', ');
};

export const formatValidationErrors = (error: z.ZodError): Record<string, string> => {
  const errors: Record<string, string> = {};
  
  error.issues.forEach((issue) => {
    const path = issue.path.join('.');
    errors[path] = issue.message;
  });
  
  return errors;
};