"use client";
import { useState, useEffect, useCallback } from "react";

// Utility to encode/decode base64
const encodeBase64 = (value: string) => btoa(value);
const decodeBase64 = (value: string) => atob(value);

export function useLocalStorageBase64<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(initialValue);
  const [isClient, setIsClient] = useState(false); // To check if it's client-side

  // Set isClient to true once the component is mounted
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Initialize localStorage with initialValue if it doesn't exist
  useEffect(() => {
    if (isClient) {
      try {
        const item = localStorage.getItem(key);
        if (!item) {
          localStorage.setItem(key, encodeBase64(JSON.stringify(initialValue)));
        }
      } catch (error) {
        console.error("Error initializing localStorage key", key, error);
      }
    }
  }, [key, initialValue, isClient]);

  // Read from localStorage after mounting
  useEffect(() => {
    if (isClient) {
      try {
        const item = localStorage.getItem(key);
        if (item) {
          setStoredValue(JSON.parse(decodeBase64(item)));
        }
      } catch (error) {
        console.error("Error reading localStorage key", key, error);
      }
    }
  }, [key, isClient]);

  // Save to localStorage
  const setValue = useCallback(
    (value: T) => {
      if (isClient) {
        try {
          const valueToStore =
            value instanceof Function ? value(storedValue) : value;
          setStoredValue(valueToStore);
          localStorage.setItem(key, encodeBase64(JSON.stringify(valueToStore)));
          // Trigger a storage event manually
          window.dispatchEvent(new Event("storage"));
        } catch (error) {
          console.error("Error setting localStorage key", key, error);
        }
      }
    },
    [key, storedValue, isClient]
  );

  // Listen to changes in localStorage
  useEffect(() => {
    if (isClient) {
      const handleStorageChange = () => {
        try {
          const item = localStorage.getItem(key);
          setStoredValue(item ? JSON.parse(decodeBase64(item)) : initialValue);
        } catch (error) {
          console.error(
            "Error handling localStorage change for key",
            key,
            error
          );
        }
      };

      window.addEventListener("storage", handleStorageChange);
      return () => window.removeEventListener("storage", handleStorageChange);
    }
  }, [key, initialValue, isClient]);

  return [storedValue, setValue] as const;
}
