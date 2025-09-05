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
    type: 'grainy-gradient',
    opacity: 0.4,
    intensity: 1.0,
    showOnPage: true,
    ...defaultSettings
  });

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

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

  if (!mounted) {
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
      {settings.enabled && settings.showOnPage && settings.type === 'neural-vortex' && (
        <InteractiveNeuralVortex 
          opacity={settings.opacity}
          intensity={settings.intensity}
        />
      )}
      <div className="relative z-10">
        {children}
      </div>
    </BackgroundContext.Provider>
  );
}

export const usePageBackground = (showBackground: boolean = true) => {
  const { setPageBackground } = useBackground();
  
  useEffect(() => {
    setPageBackground(showBackground);
    return () => setPageBackground(true);
  }, [showBackground, setPageBackground]);
};

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