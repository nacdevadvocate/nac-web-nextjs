"use client";
import React, { createContext, useContext, useState } from "react";

interface MessageContextType {
  error: string | null;
  success: string | null;
  setError: (message: string, timeout?: number) => void;
  setSuccess: (message: string, timeout?: number) => void;
  clearMessages: () => void;
}

const MessageContext = createContext<MessageContextType | undefined>(undefined);

export const MessageProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const clearMessages = () => {
    setError(null);
    setSuccess(null);
  };

  const setErrorWithTimer = (message: string, timeout: number = 15000) => {
    setError(message);
    setTimeout(() => setError(null), timeout); // Clears error after `timeout` ms
  };

  const setSuccessWithTimer = (message: string, timeout: number = 10000) => {
    setSuccess(message);
    setTimeout(() => setSuccess(null), timeout); // Clears success after `timeout` ms
  };

  return (
    <MessageContext.Provider
      value={{
        error,
        success,
        setError: setErrorWithTimer,
        setSuccess: setSuccessWithTimer,
        clearMessages,
      }}
    >
      {children}
    </MessageContext.Provider>
  );
};

export const useMessage = (): MessageContextType => {
  const context = useContext(MessageContext);
  if (!context) {
    throw new Error("useMessage must be used within a MessageProvider");
  }
  return context;
};
