import React, { createContext, useCallback, useContext, useState } from "react";

interface AppContextType {
  isLoading: boolean;
  isInitialized: boolean;
  setIsLoading: (loading: boolean) => void;
  setIsInitialized: (initialized: boolean) => void;
  showSpinner: () => void;
  hideSpinner: () => void;
}

const AppContext = createContext<AppContextType>({
  isLoading: false,
  isInitialized: false,
  setIsLoading: () => {},
  setIsInitialized: () => {},
  showSpinner: () => {},
  hideSpinner: () => {},
});

export const AppContextProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  const showSpinner = useCallback(() => setIsLoading(true), []);
  const hideSpinner = useCallback(() => setIsLoading(false), []);

  return (
    <AppContext.Provider
      value={{
        isLoading,
        isInitialized,
        setIsLoading,
        setIsInitialized,
        showSpinner,
        hideSpinner,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useAppContext must be used within an AppContextProvider");
  }
  return context;
};
