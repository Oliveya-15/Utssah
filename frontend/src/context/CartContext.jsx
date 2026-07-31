import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import api from '../api/axios.js';
import { useAuth } from './AuthContext.jsx';

const CartContext = createContext(null);
const GUEST_CART_KEY = 'utsaah_guest_cart';

const readGuestCart = () => {
  try {
    return JSON.parse(localStorage.getItem(GUEST_CART_KEY)) || [];
  } catch {
    return [];
  }
};
const writeGuestCart = (items) => localStorage.setItem(GUEST_CART_KEY, JSON.stringify(items));

export const CartProvider = ({ children }) => {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [items, setItems] = useState([]); // for guests: [{product, quantity}] with product populated client-side
  const [loading, setLoading] = useState(true);
  const hasMerged = useRef(false);

  const fetchServerCart = useCallback(async () => {
    const { data } = await api.get('/cart');
    setItems(data.items);
  }, []);

  useEffect(() => {
    if (authLoading) return;

    const init = async () => {
      setLoading(true);
      if (isAuthenticated) {
        // merge any guest-cart items collected before login, once
        if (!hasMerged.current) {
          hasMerged.current = true;
          const guestItems = readGuestCart();
          if (guestItems.length > 0) {
            try {
              await api.post('/cart/merge', {
                items: guestItems.map((i) => ({ productId: i.product._id, quantity: i.quantity })),
              });
              writeGuestCart([]);
            } catch {
              /* ignore merge failure */
            }
          }
        }
        try {
          await fetchServerCart();
        } catch {
          setItems([]);
        }
      } else {
        hasMerged.current = false;
        setItems(readGuestCart());
      }
      setLoading(false);
    };
    init();
  }, [isAuthenticated, authLoading, fetchServerCart]);

  const addItem = useCallback(
    async (product, quantity = 1) => {
      if (isAuthenticated) {
        const { data } = await api.post('/cart', { productId: product._id, quantity });
        setItems(data.items);
      } else {
        setItems((prev) => {
          const existing = prev.find((i) => i.product._id === product._id);
          let next;
          if (existing) {
            next = prev.map((i) => (i.product._id === product._id ? { ...i, quantity: i.quantity + quantity } : i));
          } else {
            next = [...prev, { product, quantity }];
          }
          writeGuestCart(next);
          return next;
        });
      }
    },
    [isAuthenticated]
  );

  const updateQuantity = useCallback(
    async (productId, quantity) => {
      if (isAuthenticated) {
        const { data } = await api.put(`/cart/${productId}`, { quantity });
        setItems(data.items);
      } else {
        setItems((prev) => {
          let next;
          if (quantity <= 0) next = prev.filter((i) => i.product._id !== productId);
          else next = prev.map((i) => (i.product._id === productId ? { ...i, quantity } : i));
          writeGuestCart(next);
          return next;
        });
      }
    },
    [isAuthenticated]
  );

  const removeItem = useCallback(
    async (productId) => {
      if (isAuthenticated) {
        const { data } = await api.delete(`/cart/${productId}`);
        setItems(data.items);
      } else {
        setItems((prev) => {
          const next = prev.filter((i) => i.product._id !== productId);
          writeGuestCart(next);
          return next;
        });
      }
    },
    [isAuthenticated]
  );

  const clearCart = useCallback(async () => {
    if (isAuthenticated) {
      await api.delete('/cart');
    } else {
      writeGuestCart([]);
    }
    setItems([]);
  }, [isAuthenticated]);

  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);
  const subtotal = items.reduce((sum, i) => sum + (i.product?.price || 0) * i.quantity, 0);

  return (
    <CartContext.Provider
      value={{ items, loading, addItem, updateQuantity, removeItem, clearCart, itemCount, subtotal, refetch: fetchServerCart }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
};
