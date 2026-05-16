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

export function ExternalCartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ExternalCartItem[]>([]);

  const addItem = useCallback((part: SearchPart, quantity = 1) => {
    setItems(prev => {
      const existing = prev.find(i => i.part.name === part.name); // unique by name + supplier? better use partNumber if available
      if (existing) {
        return prev.map(i => i.part.name === part.name ? { ...i, quantity: i.quantity + quantity } : i);
      }
      return [...prev, { part, quantity }];
    });
  }, []);

  const removeItem = useCallback((part: SearchPart) => {
    setItems(prev => prev.filter(i => i.part.name !== part.name));
  }, []);

  const updateQuantity = useCallback((part: SearchPart, quantity: number) => {
    setItems(prev => prev.map(i => i.part.name === part.name ? { ...i, quantity } : i));
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