import { createContext, useContext, useState, useCallback, type ReactNode, } from 'react';

export interface CartItem {
  inventoryId: number;
  quantity: number;
  // we can store extra data for display (maybe we'll rely on inventory list)
}

interface CartContextType {
  items: CartItem[];
  addItem: (inventoryId: number, quantity?: number) => void;
  removeItem: (inventoryId: number) => void;
  updateQuantity: (inventoryId: number, quantity: number) => void;
  clearCart: () => void;
  itemCount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  const addItem = useCallback((inventoryId: number, quantity = 1) => {
    setItems(prev => {
      const existing = prev.find(i => i.inventoryId === inventoryId);
      if (existing) {
        return prev.map(i => i.inventoryId === inventoryId ? { ...i, quantity: i.quantity + quantity } : i);
      }
      return [...prev, { inventoryId, quantity }];
    });
  }, []);

  const removeItem = useCallback((inventoryId: number) => {
    setItems(prev => prev.filter(i => i.inventoryId !== inventoryId));
  }, []);

  const updateQuantity = useCallback((inventoryId: number, quantity: number) => {
    setItems(prev => prev.map(i => i.inventoryId === inventoryId ? { ...i, quantity } : i));
  }, []);

  const clearCart = useCallback(() => setItems([]), []);

  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, updateQuantity, clearCart, itemCount }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}