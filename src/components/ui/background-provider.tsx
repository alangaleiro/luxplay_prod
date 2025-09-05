'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import InteractiveNeuralVortex from '@/components/ui/interactive-neural-vortex';

type BackgroundType = 'neural-vortex' | 'grainy-gradient' | 'none';

interface BackgroundSettings {
  enabled: boolean;
  type: BackgroundType;
  opacity: number;
  intensity: number;
  showOnPage: boolean;
}

interface BackgroundContextType {
  settings: BackgroundSettings;
  updateSettings: (newSettings: Partial<BackgroundSettings>) => void;
  toggleBackground: () => void;
  setPageBackground: (show: boolean) => void;
  setBackgroundType: (type: BackgroundType) => void;
}

const BackgroundContext = createContext<BackgroundContextType | undefined>(undefined);

export const useBackground = () => {
  const context = useContext(BackgroundContext);
  if (!context) {
    throw new Error('useBackground must be used within a BackgroundProvider');
  }
  return context;
};

interface BackgroundProviderProps {
  children: ReactNode;
  defaultSettings?: Partial<BackgroundSettings>;
}

export function BackgroundProvider({ 
  children, 
  defaultSettings = {} 
}: BackgroundProviderProps) {
  const [settings, setSettings] = useState<BackgroundSettings>({
    enabled: true,
    type: 'grainy-gradient', // Default to grainy gradient from background.md
    opacity: 0.4,
    intensity: 1.0,
    showOnPage: true,
    ...defaultSettings
  });

  const [isClientMounted, setIsClientMounted] = useState(false);

  // Client-side mounting detection for SSR safety
  useEffect(() => {
    setIsClientMounted(true);
  }, []);

  // Load settings from localStorage on mount
  useEffect(() => {
    if (!isClientMounted) return;
    
    try {
      const savedSettings = localStorage.getItem('luxplay-background-settings');
      if (savedSettings) {
        const parsed = JSON.parse(savedSettings);
        setSettings(prev => ({ ...prev, ...parsed }));
      }
    } catch (error) {
      console.error('Failed to parse LUXPLAY background settings from localStorage:', error);
    }
  }, [isClientMounted]);

  // Save settings to localStorage when they change
  useEffect(() => {
    if (!isClientMounted) return;
    
    try {
      localStorage.setItem('luxplay-background-settings', JSON.stringify(settings));
    } catch (error) {
      console.warn('Failed to save background settings to localStorage:', error);
    }
  }, [settings, isClientMounted]);

  // Update body background based on settings for dark mode
  useEffect(() => {
    if (!isClientMounted) return;
    
    try {
      const body = document.body;
      if (settings.enabled && settings.showOnPage) {
        if (settings.type === 'grainy-gradient') {
          // Apply grainy gradient background class
          body.classList.add('bg-grainy-gradient');
          body.style.background = '';
        } else {
          // Transparent body for other background types
          body.classList.remove('bg-grainy-gradient');
          body.style.background = 'transparent';
        }
      } else {
        // Fallback to LUXPLAY dark theme background when disabled
        body.classList.remove('bg-grainy-gradient');
        body.style.background = 'hsl(var(--background))';
      }
    } catch (error) {
      console.warn('[BackgroundProvider] Failed to update body background:', error);
      // Fallback to default background
      if (typeof document !== 'undefined') {
        document.body.style.background = 'hsl(var(--background))';
      }
    }
  }, [settings.enabled, settings.showOnPage, settings.type, isClientMounted]);

  const updateSettings = (newSettings: Partial<BackgroundSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  const toggleBackground = () => {
    setSettings(prev => ({ ...prev, enabled: !prev.enabled }));
  };

  const setPageBackground = (show: boolean) => {
    setSettings(prev => ({ ...prev, showOnPage: show }));
  };

  const setBackgroundType = (type: BackgroundType) => {
    setSettings(prev => ({ ...prev, type }));
  };

  const value = {
    settings,
    updateSettings,
    toggleBackground,
    setPageBackground,
    setBackgroundType,
  };

  // Prevent rendering background components during SSR
  if (!isClientMounted) {
    return (
      <BackgroundContext.Provider value={value}>
        <div className="relative z-10">
          {children}
        </div>
      </BackgroundContext.Provider>
    );
  }

  return (
    <BackgroundContext.Provider value={value}>
      {/* Render background based on type if enabled and should show on page */}
      {settings.enabled && settings.showOnPage && (
        <>
          {settings.type === 'neural-vortex' && (
            <InteractiveNeuralVortex 
              opacity={settings.opacity}
              intensity={settings.intensity}
            />
          )}
          {/* Grainy gradient is applied via body class, no component needed */}
        </>
      )}
      <div className="relative z-10">
        {children}
      </div>
    </BackgroundContext.Provider>
  );
}

// Hook for pages to control their background visibility
export const usePageBackground = (showBackground: boolean = true) => {
  const { setPageBackground } = useBackground();
  
  useEffect(() => {
    setPageBackground(showBackground);
    
    // Cleanup: restore background when component unmounts
    return () => {
      setPageBackground(true);
    };
  }, [showBackground, setPageBackground]);
};

// Component for pages that want to explicitly control background
interface PageBackgroundProps {
  show?: boolean;
  type?: BackgroundType;
  opacity?: number;
  intensity?: number;
  children?: ReactNode;
}

export function PageBackground({ 
  show = true, 
  type,
  opacity, 
  intensity, 
  children 
}: PageBackgroundProps) {
  const { updateSettings } = useBackground();
  
  useEffect(() => {
    const updates: Partial<BackgroundSettings> = { showOnPage: show };
    if (type !== undefined) updates.type = type;
    if (opacity !== undefined) updates.opacity = opacity;
    if (intensity !== undefined) updates.intensity = intensity;
    
    updateSettings(updates);
    
    // Cleanup: restore default settings when component unmounts
    return () => {
      updateSettings({ 
        showOnPage: true, 
        type: 'grainy-gradient',
        opacity: 0.4, 
        intensity: 1.0 
      });
    };
  }, [show, type, opacity, intensity, updateSettings]);

  return <>{children}</>;
}