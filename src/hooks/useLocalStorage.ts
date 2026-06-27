import { useState, useCallback, useRef, useEffect } from 'react';

export function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T | ((prev: T) => T)) => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? (JSON.parse(item) as T) : initialValue;
    } catch {
      return initialValue;
    }
  });

  // Ref always holds the latest value — avoids stale closure in setValue
  const valueRef = useRef<T>(storedValue);
  valueRef.current = storedValue;

  const setValue = useCallback((value: T | ((prev: T) => T)) => {
    // Compute new value synchronously using the ref (never stale)
    const valueToStore = value instanceof Function ? value(valueRef.current) : value;
    // Write to localStorage synchronously, before any React re-render
    try {
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (e) {
      console.error('localStorage write error:', e);
    }
    // Update ref immediately so the next setValue call in the same tick sees the new value
    valueRef.current = valueToStore;
    // Schedule React state update (for re-render)
    setStoredValue(valueToStore);
  }, [key]);

  // Sync from other tabs
  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === key && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue) as T;
          valueRef.current = parsed;
          setStoredValue(parsed);
        } catch { /* ignore */ }
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, [key]);

  return [storedValue, setValue];
}
