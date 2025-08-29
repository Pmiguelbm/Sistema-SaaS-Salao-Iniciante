import React, { createContext, ReactNode, useContext, useState } from 'react';

export interface SalonConfig {
  name: string;
  logo: string;
  description?: string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
}

interface SalonContextType {
  salonConfig: SalonConfig;
  updateSalonConfig: (config: Partial<SalonConfig>) => void;
}

const defaultSalonConfig: SalonConfig = {
  name: 'Salão de Beleza',
  logo: '',
  description: 'Seu salão de beleza de confiança',
  address: 'Rua das Flores, 123 - Centro',
  phone: '(63) 99999-9999',
  email: 'contato@salao.com',
  website: 'www.salao.com'
};

const SalonContext = createContext<SalonContextType | undefined>(undefined);

export const useSalon = () => {
  const context = useContext(SalonContext);
  if (context === undefined) {
    throw new Error('useSalon must be used within a SalonProvider');
  }
  return context;
};

interface SalonProviderProps {
  children: ReactNode;
}

export const SalonProvider: React.FC<SalonProviderProps> = ({ children }) => {
  const [salonConfig, setSalonConfig] = useState<SalonConfig>(() => {
    // Try to load from localStorage
    const saved = localStorage.getItem('salonConfig');
    
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return parsed;
      } catch (error) {
        return defaultSalonConfig;
      }
    }
    
    return defaultSalonConfig;
  });

  const updateSalonConfig = (config: Partial<SalonConfig>) => {
    const newConfig = { ...salonConfig, ...config };
    setSalonConfig(newConfig);
    localStorage.setItem('salonConfig', JSON.stringify(newConfig));
  };

  const value: SalonContextType = {
    salonConfig,
    updateSalonConfig
  };

  return (
    <SalonContext.Provider value={value}>
      {children}
    </SalonContext.Provider>
  );
};
