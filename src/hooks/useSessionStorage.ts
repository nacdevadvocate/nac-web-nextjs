"use client";

import { useEffect, useState } from "react";

function useSessionStorageBase64(
  key: string,
  initialValue: string = ""
): [string, (value: string | ((val: string) => string)) => void] {
  const [storedValue, setStoredValue] = useState<string>(() => {
    if (typeof window !== "undefined") {
      try {
        const item = sessionStorage.getItem(key);
        return item ? atob(item) : initialValue; // Decode from Base64
      } catch (error) {
        console.error("Error decoding from Base64", error);
      }
    }
    return initialValue;
  });

  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === key) {
        setStoredValue(event.newValue ? atob(event.newValue) : initialValue); // Decode Base64
      }
    };

    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, [key, initialValue]);

  const setValue = (value: string | ((val: string) => string)) => {
    if (typeof window === "undefined") return;

    try {
      const valueToStore =
        typeof value === "function" ? value(storedValue) : value;
      setStoredValue(valueToStore);
      const encodedValue = btoa(valueToStore); // Encode to Base64
      sessionStorage.setItem(key, encodedValue);

      // Dispatch a storage event to notify other components
      window.dispatchEvent(
        new StorageEvent("storage", {
          key,
          newValue: encodedValue,
        })
      );
    } catch (error) {
      console.error("Error encoding to Base64", error);
    }
  };

  return [storedValue, setValue];
}

function useSessionStorage(
  key: string,
  initialValue: string | number = ""
): [
  string | number,
  (value: string | number | ((val: string | number) => string | number)) => void
] {
  const [storedValue, setStoredValue] = useState<string | number>(() => {
    if (typeof window !== "undefined") {
      try {
        const item = sessionStorage.getItem(key);
        return item
          ? isNaN(Number(item))
            ? item
            : Number(item)
          : initialValue;
      } catch (error) {
        console.error("Error retrieving session storage value", error);
      }
    }
    return initialValue;
  });

  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === key) {
        setStoredValue(
          event.newValue ? JSON.parse(event.newValue) : initialValue
        );
      }
    };

    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, [key, initialValue]);

  const setValue = (
    value: string | number | ((val: string | number) => string | number)
  ) => {
    if (typeof window === "undefined") return;

    try {
      const valueToStore =
        typeof value === "function" ? value(storedValue) : value;
      setStoredValue(valueToStore);
      sessionStorage.setItem(key, valueToStore.toString());

      // Manually dispatch a storage event to notify other components
      window.dispatchEvent(
        new StorageEvent("storage", {
          key,
          newValue: valueToStore.toString(),
        })
      );
    } catch (error) {
      console.error("Error setting session storage value", error);
    }
  };

  return [storedValue, setValue];
}

export { useSessionStorageBase64, useSessionStorage };
