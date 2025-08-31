import { useAppStore, useTransactionStore, useNotificationStore, useSettingsStore } from '../lib/store';
import { PlanId } from '../lib/types';

// App state hooks
export const useAppLoading = () => useAppStore((state) => state.isLoading);
export const useAppError = () => useAppStore((state) => state.error);
export const useSelectedPlan = () => useAppStore((state) => state.selectedPlan);
export const useDepositAmount = () => useAppStore((state) => state.depositAmount);
export const useRedeemAmount = () => useAppStore((state) => state.redeemAmount);

export const useAppActions = () => ({
  setLoading: useAppStore((state) => state.setLoading),
  setError: useAppStore((state) => state.setError),
  setSelectedPlan: useAppStore((state) => state.setSelectedPlan),
  setDepositAmount: useAppStore((state) => state.setDepositAmount),
  setRedeemAmount: useAppStore((state) => state.setRedeemAmount),
  clearForms: useAppStore((state) => state.clearForms),
});

// Modal state hooks
export const useModals = () => ({
  isConnectOpen: useAppStore((state) => state.isConnectModalOpen),
  isSponsorOpen: useAppStore((state) => state.isSponsorModalOpen),
  setConnectOpen: useAppStore((state) => state.setConnectModalOpen),
  setSponsorOpen: useAppStore((state) => state.setSponsorModalOpen),
});

// Transaction hooks
export const usePendingTransactions = () => useTransactionStore((state) => state.pendingTransactions);

export const useTransactionActions = () => ({
  addTransaction: useTransactionStore((state) => state.addTransaction),
  updateTransaction: useTransactionStore((state) => state.updateTransaction),
  removeTransaction: useTransactionStore((state) => state.removeTransaction),
  clearTransactions: useTransactionStore((state) => state.clearTransactions),
});

// Notification hooks
export const useNotifications = () => useNotificationStore((state) => state.notifications);

export const useNotificationActions = () => ({
  addNotification: useNotificationStore((state) => state.addNotification),
  removeNotification: useNotificationStore((state) => state.removeNotification),
  clearNotifications: useNotificationStore((state) => state.clearNotifications),
});

// Settings hooks
export const useSettings = () => ({
  theme: useSettingsStore((state) => state.theme),
  currency: useSettingsStore((state) => state.currency),
  refreshInterval: useSettingsStore((state) => state.refreshInterval),
  showAdvancedFeatures: useSettingsStore((state) => state.showAdvancedFeatures),
});

export const useSettingsActions = () => ({
  setTheme: useSettingsStore((state) => state.setTheme),
  setCurrency: useSettingsStore((state) => state.setCurrency),
  setRefreshInterval: useSettingsStore((state) => state.setRefreshInterval),
  setShowAdvancedFeatures: useSettingsStore((state) => state.setShowAdvancedFeatures),
});

// Composite hooks for common operations
export const useFormState = () => {
  const selectedPlan = useSelectedPlan();
  const depositAmount = useDepositAmount();
  const redeemAmount = useRedeemAmount();
  const { setSelectedPlan, setDepositAmount, setRedeemAmount, clearForms } = useAppActions();

  return {
    selectedPlan,
    depositAmount,
    redeemAmount,
    setSelectedPlan,
    setDepositAmount,
    setRedeemAmount,
    clearForms,
  };
};

// Enhanced notification hook with common patterns
export const useNotify = () => {
  const { addNotification } = useNotificationActions();

  return {
    success: (title: string, message?: string) => 
      addNotification({ type: 'success', title, message }),
    
    error: (title: string, message?: string) => 
      addNotification({ type: 'error', title, message }),
    
    warning: (title: string, message?: string) => 
      addNotification({ type: 'warning', title, message }),
    
    info: (title: string, message?: string) => 
      addNotification({ type: 'info', title, message }),
    
    transaction: {
      pending: (type: string) => 
        addNotification({ 
          type: 'info', 
          title: 'Transaction Pending', 
          message: `Your ${type} transaction is being processed...`,
          duration: 0 // Don't auto-remove
        }),
      
      success: (type: string) => 
        addNotification({ 
          type: 'success', 
          title: 'Transaction Successful', 
          message: `Your ${type} transaction has been confirmed.`
        }),
      
      failed: (type: string, reason?: string) => 
        addNotification({ 
          type: 'error', 
          title: 'Transaction Failed', 
          message: `Your ${type} transaction failed${reason ? `: ${reason}` : '.'}`
        }),
    }
  };
};

// Transaction tracking hook
export const useTransactionTracker = () => {
  const { addTransaction, updateTransaction, removeTransaction } = useTransactionActions();
  const { transaction } = useNotify();

  const trackTransaction = (
    type: 'deposit' | 'redeem' | 'claim' | 'register' | 'approve',
    options?: { amount?: string; plan?: PlanId }
  ) => {
    const tx = addTransaction({ type, ...options });
    transaction.pending(type);
    return tx;
  };

  const updateTransactionHash = (id: string, hash: `0x${string}`) => {
    updateTransaction(id, { hash });
  };

  const completeTransaction = (id: string, type: string) => {
    removeTransaction(id);
    transaction.success(type);
  };

  const failTransaction = (id: string, type: string, reason?: string) => {
    removeTransaction(id);
    transaction.failed(type, reason);
  };

  return {
    trackTransaction,
    updateTransactionHash,
    completeTransaction,
    failTransaction,
  };
};