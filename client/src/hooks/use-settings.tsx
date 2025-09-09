import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";

interface Settings {
  storeName: string;
  storeEmail: string;
  currency: string;
  timezone: string;
  language: string;
  emailNotifications: boolean;
  lowStockAlerts: boolean;
}

interface SettingsContextType {
  settings: Settings;
  isLoading: boolean;
  getCurrencySymbol: () => string;
}

const defaultSettings: Settings = {
  storeName: 'VisionCraft',
  storeEmail: 'admin@visioncraft.com',
  currency: 'USD',
  timezone: 'UTC',
  language: 'en',
  emailNotifications: true,
  lowStockAlerts: true,
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  
  const { data: settingsData, isLoading } = useQuery<Record<string, string>>({
    queryKey: ["settings"],
    retry: 2,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
  });

  useEffect(() => {
    if (settingsData) {
      setSettings({
        storeName: settingsData.storeName || defaultSettings.storeName,
        storeEmail: settingsData.storeEmail || defaultSettings.storeEmail,
        currency: settingsData.currency || defaultSettings.currency,
        timezone: settingsData.timezone || defaultSettings.timezone,
        language: settingsData.language || defaultSettings.language,
        emailNotifications: settingsData.emailNotifications === 'true',
        lowStockAlerts: settingsData.lowStockAlerts === 'true',
      });
    }
  }, [settingsData]);

  const getCurrencySymbol = (): string => {
    switch (settings.currency) {
      case 'EUR':
        return '€';
      case 'GBP':
        return '£';
      case 'AED':
        return 'د.إ';
      case 'INR':
        return '₹';
      case 'USD':
      default:
        return '$';
    }
  };

  return (
    <SettingsContext.Provider value={{ settings, isLoading, getCurrencySymbol }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}