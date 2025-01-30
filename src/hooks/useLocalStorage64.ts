"use client";
import { useState, useEffect, useCallback } from "react";

// Utility to encode/decode base64
const encodeBase64 = (value: unknown) => btoa(JSON.stringify(value));
const decodeBase64 = (value: string) => JSON.parse(atob(value));

export function useLocalStorageBase64<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(initialValue);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (isClient) {
      try {
        const item = localStorage.getItem(key);
        if (item) {
          setStoredValue(decodeBase64(item) as T);
        } else {
          // Save initial value if not present
          localStorage.setItem(key, encodeBase64(initialValue));
          setStoredValue(initialValue);
        }
      } catch (error) {
        console.error("Error reading localStorage key", key, error);
      }
    }
  }, [key, isClient, initialValue]);

  const setValue = useCallback(
    (value: T) => {
      if (isClient) {
        try {
          const valueToStore =
            value instanceof Function ? value(storedValue) : value;
          setStoredValue(valueToStore);
          localStorage.setItem(key, encodeBase64(valueToStore));
          window.dispatchEvent(new Event("storage"));
        } catch (error) {
          console.error("Error setting localStorage key", key, error);
        }
      }
    },
    [key, storedValue, isClient]
  );

  return [storedValue, setValue] as const;
}
