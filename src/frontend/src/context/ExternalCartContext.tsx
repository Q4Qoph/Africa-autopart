import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import type { SearchPart } from '@/types/parts';

export interface ExternalCartItem {
  part: SearchPart;
  quantity: number;
}

interface ExternalCartContextType {
  items: ExternalCartItem[];
  addItem: (part: SearchPart, quantity?: number) => void;
  removeItem: (part: SearchPart) => void;
  updateQuantity: (part: SearchPart, quantity: number) => void;
  clearCart: () => void;
  itemCount: number;
}

const ExternalCartContext = createContext<ExternalCartContextType | undefined>(undefined);

function matchesCartPart(first: SearchPart, second: SearchPart) {
  return first.partNumber === second.partNumber && first.supplier === second.supplier &&
    first.price === second.price && Boolean(first.isEstimated) === Boolean(second.isEstimated)
}

export function ExternalCartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ExternalCartItem[]>([]);

  const addItem = useCallback((part: SearchPart, quantity = 1) => {
    setItems(prev => {
      const existing = prev.find(i => matchesCartPart(i.part, part));
      if (existing) {
        return prev.map(i => matchesCartPart(i.part, part) ? { ...i, quantity: i.quantity + quantity } : i);
      }
      return [...prev, { part, quantity }];
    });
  }, []);

  const removeItem = useCallback((part: SearchPart) => {
    setItems(prev => prev.filter(i => !matchesCartPart(i.part, part)));
  }, []);

  const updateQuantity = useCallback((part: SearchPart, quantity: number) => {
    setItems(prev => prev.map(i => matchesCartPart(i.part, part) ? { ...i, quantity } : i));
  }, []);

  const clearCart = useCallback(() => setItems([]), []);

  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <ExternalCartContext.Provider value={{ items, addItem, removeItem, updateQuantity, clearCart, itemCount }}>
      {children}
    </ExternalCartContext.Provider>
  );
}

export function useExternalCart() {
  const ctx = useContext(ExternalCartContext);
  if (!ctx) throw new Error('useExternalCart must be used within ExternalCartProvider');
  return ctx;
}