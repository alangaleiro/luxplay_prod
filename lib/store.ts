import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { PlanId } from './types';

// Main application state
interface AppState {
  // UI State
  isLoading: boolean;
  error: string | null;
  
  // User preferences
  selectedPlan: PlanId;
  slippageTolerance: number;
  
  // Form state
  depositAmount: string;
  redeemAmount: string;
  
  // Modal state
  isConnectModalOpen: boolean;
  isSponsorModalOpen: boolean;
  
  // Actions
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setSelectedPlan: (plan: PlanId) => void;
  setSlippageTolerance: (tolerance: number) => void;
  setDepositAmount: (amount: string) => void;
  setRedeemAmount: (amount: string) => void;
  setConnectModalOpen: (open: boolean) => void;
  setSponsorModalOpen: (open: boolean) => void;
  clearForms: () => void;
  reset: () => void;
}

export const useAppStore = create<AppState>()(
  devtools(
    persist(
      (set) => ({
        // Initial state
        isLoading: false,
        error: null,
        selectedPlan: 0 as PlanId,
        slippageTolerance: 0.5, // 0.5%
        depositAmount: '',
        redeemAmount: '',
        isConnectModalOpen: false,
        isSponsorModalOpen: false,
        
        // Actions
        setLoading: (loading) => set({ isLoading: loading }),
        setError: (error) => set({ error }),
        setSelectedPlan: (plan) => set({ selectedPlan: plan }),
        setSlippageTolerance: (tolerance) => set({ slippageTolerance: tolerance }),
        setDepositAmount: (amount) => set({ depositAmount: amount }),
        setRedeemAmount: (amount) => set({ redeemAmount: amount }),
        setConnectModalOpen: (open) => set({ isConnectModalOpen: open }),
        setSponsorModalOpen: (open) => set({ isSponsorModalOpen: open }),
        clearForms: () => set({ 
          depositAmount: '', 
          redeemAmount: '',
          error: null
        }),
        reset: () => set({
          isLoading: false,
          error: null,
          selectedPlan: 0 as PlanId,
          slippageTolerance: 0.5,
          depositAmount: '',
          redeemAmount: '',
          isConnectModalOpen: false,
          isSponsorModalOpen: false,
        }),
      }),
      {
        name: 'luxplay-app-state',
        partialize: (state) => ({
          selectedPlan: state.selectedPlan,
          slippageTolerance: state.slippageTolerance,
        }),
      }
    ),
    {
      name: 'luxplay-app',
    }
  )
);

// Transaction state store
interface TransactionState {
  pendingTransactions: Array<{
    id: string;
    type: 'deposit' | 'redeem' | 'claim' | 'register' | 'approve';
    hash?: `0x${string}`;
    timestamp: number;
    amount?: string;
    plan?: PlanId;
  }>;
  
  // Actions
  addTransaction: (tx: Omit<TransactionState['pendingTransactions'][0], 'id' | 'timestamp'>) => void;
  updateTransaction: (id: string, updates: Partial<TransactionState['pendingTransactions'][0]>) => void;
  removeTransaction: (id: string) => void;
  clearTransactions: () => void;
}

export const useTransactionStore = create<TransactionState>()(
  devtools(
    (set) => ({
      pendingTransactions: [],
      
      addTransaction: (tx) => set((state) => ({
        pendingTransactions: [
          ...state.pendingTransactions,
          {
            ...tx,
            id: Math.random().toString(36).substring(2),
            timestamp: Date.now(),
          }
        ]
      })),
      
      updateTransaction: (id, updates) => set((state) => ({
        pendingTransactions: state.pendingTransactions.map(tx =>
          tx.id === id ? { ...tx, ...updates } : tx
        )
      })),
      
      removeTransaction: (id) => set((state) => ({
        pendingTransactions: state.pendingTransactions.filter(tx => tx.id !== id)
      })),
      
      clearTransactions: () => set({ pendingTransactions: [] }),
    }),
    {
      name: 'luxplay-transactions',
    }
  )
);

// Notifications store
interface NotificationState {
  notifications: Array<{
    id: string;
    type: 'success' | 'error' | 'warning' | 'info';
    title: string;
    message?: string;
    timestamp: number;
    duration?: number;
  }>;
  
  // Actions
  addNotification: (notification: Omit<NotificationState['notifications'][0], 'id' | 'timestamp'>) => void;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;
}

export const useNotificationStore = create<NotificationState>()(
  devtools(
    (set) => ({
      notifications: [],
      
      addNotification: (notification) => {
        const id = Math.random().toString(36).substring(2);
        set((state) => ({
          notifications: [
            ...state.notifications,
            {
              ...notification,
              id,
              timestamp: Date.now(),
            }
          ]
        }));
        
        // Auto-remove notification after duration
        if (notification.duration !== 0) {
          setTimeout(() => {
            set((state) => ({
              notifications: state.notifications.filter(n => n.id !== id)
            }));
          }, notification.duration || 5000);
        }
      },
      
      removeNotification: (id) => set((state) => ({
        notifications: state.notifications.filter(n => n.id !== id)
      })),
      
      clearNotifications: () => set({ notifications: [] }),
    }),
    {
      name: 'luxplay-notifications',
    }
  )
);

// Settings store
interface SettingsState {
  theme: 'dark';
  currency: 'USD' | 'EUR' | 'BTC' | 'ETH';
  refreshInterval: number; // in seconds
  showAdvancedFeatures: boolean;
  
  // Actions
  setTheme: (theme: SettingsState['theme']) => void;
  setCurrency: (currency: SettingsState['currency']) => void;
  setRefreshInterval: (interval: number) => void;
  setShowAdvancedFeatures: (show: boolean) => void;
  reset: () => void;
}

export const useSettingsStore = create<SettingsState>()(
  devtools(
    persist(
      (set) => ({
        theme: 'dark',
        currency: 'USD',
        refreshInterval: 30,
        showAdvancedFeatures: false,
        
        setTheme: (theme) => set({ theme }),
        setCurrency: (currency) => set({ currency }),
        setRefreshInterval: (interval) => set({ refreshInterval: interval }),
        setShowAdvancedFeatures: (show) => set({ showAdvancedFeatures: show }),
        reset: () => set({
          theme: 'dark',
          currency: 'USD',
          refreshInterval: 30,
          showAdvancedFeatures: false,
        }),
      }),
      {
        name: 'luxplay-settings',
      }
    ),
    {
      name: 'luxplay-settings',
    }
  )
);