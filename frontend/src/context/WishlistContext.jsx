import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../api/axios.js';
import { useAuth } from './AuthContext.jsx';

const WishlistContext = createContext(null);

export const WishlistProvider = ({ children }) => {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchWishlist = useCallback(async () => {
    if (!isAuthenticated) {
      setProducts([]);
      return;
    }
    const { data } = await api.get('/wishlist');
    setProducts(data.products);
  }, [isAuthenticated]);

  useEffect(() => {
    if (authLoading) return;
    setLoading(true);
    fetchWishlist().finally(() => setLoading(false));
  }, [authLoading, fetchWishlist]);

  const isInWishlist = useCallback((productId) => products.some((p) => p._id === productId), [products]);

  const toggleWishlist = useCallback(
    async (product) => {
      if (!isAuthenticated) return { requiresAuth: true };
      if (isInWishlist(product._id)) {
        const { data } = await api.delete(`/wishlist/${product._id}`);
        setProducts(data.products);
        return { added: false };
      } else {
        const { data } = await api.post(`/wishlist/${product._id}`);
        setProducts(data.products);
        return { added: true };
      }
    },
    [isAuthenticated, isInWishlist]
  );

  return (
    <WishlistContext.Provider value={{ products, loading, isInWishlist, toggleWishlist, refetch: fetchWishlist }}>
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error('useWishlist must be used within WishlistProvider');
  return ctx;
};
