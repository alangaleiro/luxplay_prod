'use client';

import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { 
  validateAmount, 
  validateAddress, 
  validateBalance 
} from '../../../lib/validation';
import { AlertCircle, CheckCircle, Copy } from 'lucide-react';

interface ValidatedInputProps {
  label?: string;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  type?: 'text' | 'number' | 'address';
  validation?: {
    required?: boolean;
    min?: number;
    max?: number;
    decimals?: number;
    balance?: bigint;
    balanceDecimals?: number;
  };
  error?: string;
  disabled?: boolean;
  className?: string;
  showMaxButton?: boolean;
  onMaxClick?: () => void;
  showCopyButton?: boolean;
  copyValue?: string;
}

export function ValidatedInput({
  label,
  placeholder,
  value,
  onChange,
  type = 'text',
  validation,
  error: externalError,
  disabled,
  className,
  showMaxButton,
  onMaxClick,
  showCopyButton,
  copyValue,
}: ValidatedInputProps) {
  const [internalError, setInternalError] = useState<string | null>(null);
  const [isValid, setIsValid] = useState<boolean>(true);
  const [touched, setTouched] = useState(false);

  // Validate input
  useEffect(() => {
    if (!touched || !value) {
      setInternalError(null);
      setIsValid(true);
      return;
    }

    let validationResult;

    switch (type) {
      case 'number':
        validationResult = validateAmount(value, {
          min: validation?.min,
          max: validation?.max,
          decimals: validation?.decimals,
        });
        
        // Additional balance validation
        if (validationResult.isValid && validation?.balance) {
          const balanceValidation = validateBalance(
            value,
            validation.balance,
            validation?.balanceDecimals
          );
          if (!balanceValidation.isValid) {
            validationResult = balanceValidation;
          }
        }
        break;
        
      case 'address':
        validationResult = validateAddress(value);
        break;
        
      default:
        validationResult = { isValid: true, error: null };
    }

    setInternalError(validationResult.error);
    setIsValid(validationResult.isValid);
  }, [value, type, validation, touched]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    
    // For number inputs, allow only valid number characters
    if (type === 'number') {
      const regex = /^\d*\.?\d*$/;
      if (newValue && !regex.test(newValue)) {
        return;
      }
    }
    
    onChange(newValue);
    if (!touched) setTouched(true);
  };

  const handleBlur = () => {
    setTouched(true);
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(copyValue || value);
      // Could add a toast notification here
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const error = externalError || internalError;
  const hasError = Boolean(error && touched);
  const hasSuccess = touched && value && isValid && !error;

  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <Label htmlFor={`input-${label}`} className="text-sm font-medium">
          {label}
          {validation?.required && <span className="text-red-500 ml-1">*</span>}
        </Label>
      )}
      
      <div className="relative">
        <div className="flex gap-2">
          <Input
            id={`input-${label}`}
            type="text"
            placeholder={placeholder}
            value={value}
            onChange={handleChange}
            onBlur={handleBlur}
            disabled={disabled}
            className={`
              ${hasError ? 'border-red-500 focus-visible:ring-red-500' : ''}
              ${hasSuccess ? 'border-green-500 focus-visible:ring-green-500' : ''}
              ${showMaxButton || showCopyButton ? 'pr-20' : ''}
            `}
          />
          
          {/* Action buttons */}
          <div className="flex gap-1">
            {showMaxButton && onMaxClick && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onMaxClick}
                disabled={disabled}
              >
                Max
              </Button>
            )}
            
            {showCopyButton && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleCopy}
                disabled={disabled}
              >
                <Copy className="w-3 h-3" />
              </Button>
            )}
          </div>
        </div>

        {/* Status icon */}
        {touched && value && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
            {hasError ? (
              <AlertCircle className="w-4 h-4 text-red-500" />
            ) : hasSuccess ? (
              <CheckCircle className="w-4 h-4 text-green-500" />
            ) : null}
          </div>
        )}
      </div>

      {/* Error message */}
      {hasError && (
        <div className="flex items-center gap-1 text-sm text-red-600">
          <AlertCircle className="w-3 h-3" />
          {error}
        </div>
      )}
      
      {/* Success message */}
      {hasSuccess && type === 'address' && (
        <div className="flex items-center gap-1 text-sm text-green-600">
          <CheckCircle className="w-3 h-3" />
          Valid Ethereum address
        </div>
      )}
    </div>
  );
}

// Specialized components
export function AmountInput(props: Omit<ValidatedInputProps, 'type'>) {
  return <ValidatedInput {...props} type="number" />;
}

export function AddressInput(props: Omit<ValidatedInputProps, 'type'>) {
  return <ValidatedInput {...props} type="address" />;
}

// Balance display component
interface BalanceDisplayProps {
  label: string;
  amount: bigint;
  symbol: string;
  decimals?: number;
  usdValue?: number;
  isLoading?: boolean;
}

export function BalanceDisplay({
  label,
  amount,
  symbol,
  decimals = 18,
  usdValue,
  isLoading,
}: BalanceDisplayProps) {
  const formatAmount = (amount: bigint) => {
    const divisor = 10n ** BigInt(decimals);
    const wholePart = amount / divisor;
    const fractionalPart = amount % divisor;
    
    if (fractionalPart === 0n) {
      return wholePart.toString();
    }
    
    const fractionalStr = fractionalPart.toString().padStart(decimals, '0');
    const trimmed = fractionalStr.replace(/0+$/, '');
    
    return `${wholePart}.${trimmed}`;
  };

  if (isLoading) {
    return (
      <div className="space-y-1">
        <div className="text-sm text-muted-foreground">{label}</div>
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-20"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      <div className="text-sm text-muted-foreground">{label}</div>
      <div className="font-medium">
        {formatAmount(amount)} {symbol}
        {usdValue && (
          <div className="text-sm text-muted-foreground">
            ≈ ${usdValue.toFixed(2)}
          </div>
        )}
      </div>
    </div>
  );
}