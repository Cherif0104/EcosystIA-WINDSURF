import { useState, useEffect } from 'react';

// Hook pour persister l'état dans localStorage/sessionStorage
export const usePersistedState = <T>(
  key: string,
  defaultValue: T,
  storage: 'localStorage' | 'sessionStorage' = 'sessionStorage'
): [T, (value: T) => void] => {
  const [state, setState] = useState<T>(() => {
    try {
      const item = storage === 'localStorage' 
        ? localStorage.getItem(key)
        : sessionStorage.getItem(key);
      
      if (item) {
        return JSON.parse(item);
      }
    } catch (error) {
      console.warn(`Erreur lors de la lecture de ${key} depuis ${storage}:`, error);
    }
    return defaultValue;
  });

  useEffect(() => {
    try {
      if (storage === 'localStorage') {
        localStorage.setItem(key, JSON.stringify(state));
      } else {
        sessionStorage.setItem(key, JSON.stringify(state));
      }
    } catch (error) {
      console.warn(`Erreur lors de la sauvegarde de ${key} dans ${storage}:`, error);
    }
  }, [key, state, storage]);

  return [state, setState];
};
