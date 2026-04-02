'use client';

import { createContext, useContext, useState, type ReactNode } from 'react';

interface HeaderSlotContextType {
  centerSlot: ReactNode | null;
  setCenterSlot: (slot: ReactNode | null) => void;
}

const HeaderSlotContext = createContext<HeaderSlotContextType>({
  centerSlot: null,
  setCenterSlot: () => {},
});

export function HeaderSlotProvider({ children }: { children: ReactNode }) {
  const [centerSlot, setCenterSlot] = useState<ReactNode | null>(null);
  return (
    <HeaderSlotContext.Provider value={{ centerSlot, setCenterSlot }}>
      {children}
    </HeaderSlotContext.Provider>
  );
}

export function useHeaderSlot() {
  return useContext(HeaderSlotContext);
}
