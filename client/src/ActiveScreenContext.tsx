// src/context/ActiveScreenContext.tsx
import { createContext, useContext, useState, ReactNode } from "react";

type Screen = 'search' | 'pending' | 'chat' | 'dashboard' | 'posts' | 'templates' | 'brand' | 'profile';

interface ActiveScreenContextType {
  activeScreen: Screen;
  setActiveScreen: (screen: Screen) => void;
}

const ActiveScreenContext = createContext<ActiveScreenContextType | undefined>(undefined);

export const ActiveScreenProvider = ({ children }: { children: ReactNode }) => {
  const [activeScreen, setActiveScreen] = useState<Screen>('dashboard');

  return (
    <ActiveScreenContext.Provider value={{ activeScreen, setActiveScreen }}>
      {children}
    </ActiveScreenContext.Provider>
  );
};

export const useActiveScreen = () => {
  const context = useContext(ActiveScreenContext);
  if (!context) {
    throw new Error("useActiveScreen must be used within an ActiveScreenProvider");
  }
  return context;
};
