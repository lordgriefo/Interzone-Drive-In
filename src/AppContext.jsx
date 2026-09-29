import React, { createContext, useContext } from 'react';

const AppContext = createContext();

export function AppProvider({ 
  children, 
  audioSignals, 
  selectedEra, 
  setSelectedEra,
  selectedStyle, 
  setSelectedStyle,
  selectedRube, 
  setSelectedRube,
  assets 
}) {
  return (
    <AppContext.Provider value={{ 
      audioSignals, 
      selectedEra, 
      setSelectedEra,
      selectedStyle, 
      setSelectedStyle,
      selectedRube, 
      setSelectedRube,
      assets 
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppState() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppState must be used within AppProvider');
  }
  return context;
}
