import { createContext, useContext, useEffect, useState } from 'react';
import api from '../utils/api';
import { useAuth } from './AuthContext';
import useLocalStorage from '../hooks/useLocalStorage';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const { userInfo } = useAuth();
  const [localCart, setLocalCart] = useLocalStorage('cartItems', []);
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (userInfo) {
      fetchCart();
    } else {
      setCartItems(localCart);
    }
  }, [userInfo, localCart]);

  const fetchCart = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/api/cart');
      setCartItems(data.items || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async (product, quantity = 1) => {
    if (userInfo) {
      try {
        await api.post('/api/cart/add', {
          productId: product._id,
          quantity,
          price: product.price,
        });
        fetchCart();
      } catch (error) {
        console.error(error);
      }
    } else {
      const existingItem = localCart.find((i) => i.product._id === product._id);
      if (existingItem) {
        setLocalCart(
          localCart.map((i) =>
            i.product._id === product._id
              ? { ...i, quantity: i.quantity + quantity }
              : i
          )
        );
      } else {
        setLocalCart([...localCart, { product, quantity, price: product.price }]);
      }
    }
  };

  const removeFromCart = async (productId) => {
    if (userInfo) {
      try {
        await api.delete(`/api/cart/remove/${productId}`);
        fetchCart();
      } catch (error) {
        console.error(error);
      }
    } else {
      setLocalCart(localCart.filter((i) => i.product._id !== productId));
    }
  };

  const updateQuantity = async (productId, quantity) => {
    if (userInfo) {
      try {
        await api.put('/api/cart/update', { productId, quantity });
        fetchCart();
      } catch (error) {
        console.error(error);
      }
    } else {
      setLocalCart(
        localCart.map((i) =>
          i.product._id === productId ? { ...i, quantity } : i
        )
      );
    }
  };

  const clearCart = async () => {
    if (userInfo) {
      try {
        await api.delete('/api/cart/clear');
        fetchCart();
      } catch (error) {
        console.error(error);
      }
    } else {
      setLocalCart([]);
    }
  };

  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const cartTotal = cartItems.reduce((acc, item) => acc + item.quantity * item.price, 0);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        loading,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        cartCount,
        cartTotal,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
