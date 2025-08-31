'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import InteractiveNeuralVortex from '@/components/ui/interactive-neural-vortex';

interface BackgroundSettings {
  enabled: boolean;
  opacity: number;
  intensity: number;
  showOnPage: boolean;
}

interface BackgroundContextType {
  settings: BackgroundSettings;
  updateSettings: (newSettings: Partial<BackgroundSettings>) => void;
  toggleBackground: () => void;
  setPageBackground: (show: boolean) => void;
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
    opacity: 0.4,
    intensity: 1.0,
    showOnPage: true,
    ...defaultSettings
  });

  // Load settings from localStorage on mount
  useEffect(() => {
    const savedSettings = localStorage.getItem('luxplay-background-settings');
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        setSettings(prev => ({ ...prev, ...parsed }));
      } catch (error) {
        console.error('Failed to parse LUXPLAY background settings from localStorage:', error);
      }
    }
  }, []);

  // Save settings to localStorage when they change
  useEffect(() => {
    localStorage.setItem('luxplay-background-settings', JSON.stringify(settings));
  }, [settings]);

  // Update body background based on settings for dark mode
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const body = document.body;
      if (settings.enabled && settings.showOnPage) {
        // Transparent body when neural vortex background is active
        body.style.background = 'transparent';
      } else {
        // Fallback to LUXPLAY dark theme background when disabled
        body.style.background = 'hsl(var(--background))';
      }
    }
  }, [settings.enabled, settings.showOnPage]);

  const updateSettings = (newSettings: Partial<BackgroundSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  const toggleBackground = () => {
    setSettings(prev => ({ ...prev, enabled: !prev.enabled }));
  };

  const setPageBackground = (show: boolean) => {
    setSettings(prev => ({ ...prev, showOnPage: show }));
  };

  const value = {
    settings,
    updateSettings,
    toggleBackground,
    setPageBackground,
  };

  return (
    <BackgroundContext.Provider value={value}>
      {/* Render the neural vortex background if enabled and should show on page */}
      {settings.enabled && settings.showOnPage && (
        <InteractiveNeuralVortex 
          opacity={settings.opacity}
          intensity={settings.intensity}
        />
      )}
      {children}
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
  opacity?: number;
  intensity?: number;
  children?: ReactNode;
}

export function PageBackground({ 
  show = true, 
  opacity, 
  intensity, 
  children 
}: PageBackgroundProps) {
  const { updateSettings } = useBackground();
  
  useEffect(() => {
    const updates: Partial<BackgroundSettings> = { showOnPage: show };
    if (opacity !== undefined) updates.opacity = opacity;
    if (intensity !== undefined) updates.intensity = intensity;
    
    updateSettings(updates);
    
    // Cleanup: restore default settings when component unmounts
    return () => {
      updateSettings({ 
        showOnPage: true, 
        opacity: 0.4, 
        intensity: 1.0 
      });
    };
  }, [show, opacity, intensity, updateSettings]);

  return <>{children}</>;
}