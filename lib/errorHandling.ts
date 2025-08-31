import { useState } from 'react';
import { useNotify } from '../hooks/useStore';

// Custom error classes
export class ValidationError extends Error {
  constructor(
    message: string,
    public field?: string,
    public code?: string
  ) {
    super(message);
    this.name = 'ValidationError';
  }
}

export class ContractError extends Error {
  constructor(
    message: string,
    public contractAddress?: string,
    public functionName?: string,
    public originalError?: any
  ) {
    super(message);
    this.name = 'ContractError';
  }
}

export class NetworkError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public endpoint?: string
  ) {
    super(message);
    this.name = 'NetworkError';
  }
}

export class WalletError extends Error {
  constructor(
    message: string,
    public walletType?: string,
    public code?: string
  ) {
    super(message);
    this.name = 'WalletError';
  }
}

// Error code mapping
export const ERROR_CODES = {
  // Validation errors
  INVALID_AMOUNT: 'INVALID_AMOUNT',
  INVALID_ADDRESS: 'INVALID_ADDRESS',
  INSUFFICIENT_BALANCE: 'INSUFFICIENT_BALANCE',
  INVALID_PLAN: 'INVALID_PLAN',
  
  // Contract errors
  CONTRACT_REVERTED: 'CONTRACT_REVERTED',
  TRANSACTION_FAILED: 'TRANSACTION_FAILED',
  INSUFFICIENT_ALLOWANCE: 'INSUFFICIENT_ALLOWANCE',
  CONTRACT_PAUSED: 'CONTRACT_PAUSED',
  
  // Network errors
  NETWORK_ERROR: 'NETWORK_ERROR',
  RPC_ERROR: 'RPC_ERROR',
  TIMEOUT_ERROR: 'TIMEOUT_ERROR',
  
  // Wallet errors
  WALLET_NOT_CONNECTED: 'WALLET_NOT_CONNECTED',
  USER_REJECTED: 'USER_REJECTED',
  INSUFFICIENT_FUNDS: 'INSUFFICIENT_FUNDS',
  WRONG_NETWORK: 'WRONG_NETWORK',
} as const;

// Error message mapping
export const ERROR_MESSAGES = {
  [ERROR_CODES.INVALID_AMOUNT]: 'Please enter a valid amount',
  [ERROR_CODES.INVALID_ADDRESS]: 'Please enter a valid Ethereum address',
  [ERROR_CODES.INSUFFICIENT_BALANCE]: 'Insufficient balance for this transaction',
  [ERROR_CODES.INVALID_PLAN]: 'Please select a valid staking plan',
  
  [ERROR_CODES.CONTRACT_REVERTED]: 'Transaction was reverted by the contract',
  [ERROR_CODES.TRANSACTION_FAILED]: 'Transaction failed to execute',
  [ERROR_CODES.INSUFFICIENT_ALLOWANCE]: 'Insufficient token allowance',
  [ERROR_CODES.CONTRACT_PAUSED]: 'Contract is currently paused',
  
  [ERROR_CODES.NETWORK_ERROR]: 'Network connection error',
  [ERROR_CODES.RPC_ERROR]: 'RPC provider error',
  [ERROR_CODES.TIMEOUT_ERROR]: 'Request timed out',
  
  [ERROR_CODES.WALLET_NOT_CONNECTED]: 'Please connect your wallet',
  [ERROR_CODES.USER_REJECTED]: 'Transaction was rejected by user',
  [ERROR_CODES.INSUFFICIENT_FUNDS]: 'Insufficient funds for gas',
  [ERROR_CODES.WRONG_NETWORK]: 'Please switch to the correct network',
} as const;

// Error parser for common Web3 errors
export const parseWeb3Error = (error: any): { code: string; message: string; details?: string } => {
  const errorString = error?.message || error?.reason || error?.toString() || 'Unknown error';
  const lowerError = errorString.toLowerCase();
  
  // User rejection
  if (lowerError.includes('user rejected') || lowerError.includes('user denied')) {
    return {
      code: ERROR_CODES.USER_REJECTED,
      message: ERROR_MESSAGES[ERROR_CODES.USER_REJECTED],
    };
  }
  
  // Insufficient funds
  if (lowerError.includes('insufficient funds')) {
    return {
      code: ERROR_CODES.INSUFFICIENT_FUNDS,
      message: ERROR_MESSAGES[ERROR_CODES.INSUFFICIENT_FUNDS],
    };
  }
  
  // Contract reverted
  if (lowerError.includes('reverted') || lowerError.includes('revert')) {
    let details = errorString;
    
    // Extract revert reason if available
    const revertMatch = errorString.match(/reverted with reason string '(.+?)'/);
    if (revertMatch) {
      details = revertMatch[1];
    }
    
    return {
      code: ERROR_CODES.CONTRACT_REVERTED,
      message: ERROR_MESSAGES[ERROR_CODES.CONTRACT_REVERTED],
      details,
    };
  }
  
  // Network errors
  if (lowerError.includes('network') || lowerError.includes('connection')) {
    return {
      code: ERROR_CODES.NETWORK_ERROR,
      message: ERROR_MESSAGES[ERROR_CODES.NETWORK_ERROR],
      details: errorString,
    };
  }
  
  // Timeout errors
  if (lowerError.includes('timeout')) {
    return {
      code: ERROR_CODES.TIMEOUT_ERROR,
      message: ERROR_MESSAGES[ERROR_CODES.TIMEOUT_ERROR],
    };
  }
  
  // Wrong network
  if (lowerError.includes('wrong network') || lowerError.includes('unsupported chain')) {
    return {
      code: ERROR_CODES.WRONG_NETWORK,
      message: ERROR_MESSAGES[ERROR_CODES.WRONG_NETWORK],
    };
  }
  
  // Default case
  return {
    code: 'UNKNOWN_ERROR',
    message: 'An unexpected error occurred',
    details: errorString,
  };
};

// Error handling hook
export const useErrorHandler = () => {
  const notify = useNotify();
  
  const handleError = (
    error: any,
    context?: {
      operation?: string;
      fallbackMessage?: string;
      showDetails?: boolean;
    }
  ) => {
    console.error(`Error in ${context?.operation || 'operation'}:`, error);
    
    const parsed = parseWeb3Error(error);
    
    let title = context?.operation 
      ? `${context.operation} Failed`
      : 'Operation Failed';
    
    let message = parsed.message;
    
    if (context?.showDetails && parsed.details) {
      message += `: ${parsed.details}`;
    }
    
    notify.error(title, message);
    
    return {
      code: parsed.code,
      message: parsed.message,
      details: parsed.details,
    };
  };
  
  const handleValidationError = (
    errors: Record<string, string>,
    operation?: string
  ) => {
    const errorMessages = Object.values(errors);
    const title = operation ? `${operation} Validation Failed` : 'Validation Failed';
    const message = errorMessages.join(', ');
    
    notify.warning(title, message);
  };
  
  const handleSuccess = (
    operation: string,
    details?: string
  ) => {
    notify.success(
      `${operation} Successful`,
      details || `Your ${operation.toLowerCase()} was completed successfully`
    );
  };
  
  return {
    handleError,
    handleValidationError,
    handleSuccess,
  };
};

// Retry mechanism for failed operations
export class RetryHandler {
  private retryCount = 0;
  private maxRetries: number;
  private baseDelay: number;
  
  constructor(maxRetries = 3, baseDelay = 1000) {
    this.maxRetries = maxRetries;
    this.baseDelay = baseDelay;
  }
  
  async execute<T>(
    operation: () => Promise<T>,
    shouldRetry?: (error: any) => boolean
  ): Promise<T> {
    try {
      const result = await operation();
      this.retryCount = 0; // Reset on success
      return result;
    } catch (error) {
      if (this.retryCount >= this.maxRetries) {
        throw error;
      }
      
      if (shouldRetry && !shouldRetry(error)) {
        throw error;
      }
      
      // Don't retry user rejections
      const parsed = parseWeb3Error(error);
      if (parsed.code === ERROR_CODES.USER_REJECTED) {
        throw error;
      }
      
      this.retryCount++;
      const delay = this.baseDelay * Math.pow(2, this.retryCount - 1); // Exponential backoff
      
      await new Promise(resolve => setTimeout(resolve, delay));
      
      return this.execute(operation, shouldRetry);
    }
  }
  
  reset() {
    this.retryCount = 0;
  }
}

// Transaction error recovery
export const handleTransactionError = (
  error: any,
  context: {
    operation: string;
    hash?: string;
    retry?: () => Promise<void>;
  }
) => {
  const parsed = parseWeb3Error(error);
  
  return {
    ...parsed,
    canRetry: ![
      ERROR_CODES.USER_REJECTED,
      ERROR_CODES.INSUFFICIENT_FUNDS,
      ERROR_CODES.INSUFFICIENT_BALANCE,
    ].includes(parsed.code as any),
    hash: context.hash,
    retry: context.retry,
  };
};

// Form error state management
export interface FormErrorState {
  [field: string]: string | null;
}

export const createFormErrorManager = () => {
  const [errors, setErrors] = useState<FormErrorState>({});
  
  const setError = (field: string, message: string) => {
    setErrors(prev => ({ ...prev, [field]: message }));
  };
  
  const clearError = (field: string) => {
    setErrors(prev => ({ ...prev, [field]: null }));
  };
  
  const clearAllErrors = () => {
    setErrors({});
  };
  
  const hasErrors = () => {
    return Object.values(errors).some(error => error !== null);
  };
  
  return {
    errors,
    setError,
    clearError,
    clearAllErrors,
    hasErrors,
  };
};