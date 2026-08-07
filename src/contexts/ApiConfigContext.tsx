import React, { createContext, useContext, useState } from 'react';
import {
  ApiMode,
  getCustomBaseUrl,
  getStoredApiMode,
  setCustomBaseUrl as saveCustomBaseUrl,
  setStoredApiMode,
} from '../services/apiClient';

interface ApiConfigContextType {
  apiMode: ApiMode;
  setApiMode: (mode: ApiMode) => void;
  baseUrl: string;
  setBaseUrl: (url: string) => void;
}

const ApiConfigContext = createContext<ApiConfigContextType | undefined>(undefined);

export const ApiConfigProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [apiMode, setApiModeState] = useState<ApiMode>(getStoredApiMode);
  const [baseUrl, setBaseUrlState] = useState<string>(getCustomBaseUrl);

  const setApiMode = (mode: ApiMode) => {
    setStoredApiMode(mode);
    setApiModeState(mode);
  };

  const setBaseUrl = (url: string) => {
    saveCustomBaseUrl(url);
    setBaseUrlState(url);
  };

  return (
    <ApiConfigContext.Provider value={{ apiMode, setApiMode, baseUrl, setBaseUrl }}>
      {children}
    </ApiConfigContext.Provider>
  );
};

export function useApiConfig() {
  const ctx = useContext(ApiConfigContext);
  if (!ctx) throw new Error('useApiConfig must be used within ApiConfigProvider');
  return ctx;
}
