import { createContext, useState, useCallback } from 'react';
import { cartAPI } from '../api/apiService';

export const CartContext = createContext();

// Generate a temporary ID for optimistic items
const tempId = () => `temp_${Date.now()}_${Math.random().toString(36).slice(2)}`;

export const CartProvider = ({ children }) => {
    const [cart, setCart] = useState({ items: [], total: 0, count: 0 });
    const [loading, setLoading] = useState(false);

    const fetchCart = useCallback(async () => {
        try {
            const response = await cartAPI.getCart();
            setCart(response.data.data);
        } catch (error) {
            console.error('Failed to fetch cart:', error);
        }
    }, []);

    // Optimistic add — updates UI instantly, syncs backend in background
    const addToCart = useCallback(async (productId, quantity = 1) => {
        try {
            setLoading(true);
            const result = await cartAPI.addItem({ productId, quantity });
            // Sync with real server data after add
            if (result.data?.data) {
                setCart(result.data.data);
            } else {
                await fetchCart();
            }
            return { success: true };
        } catch (error) {
            const message = error.response?.data?.message || 'Failed to add item';
            // Optimistic fallback: add item to local cart if backend unavailable
            setCart(prev => {
                const existing = prev.items.find(i => (i.productId || i.product) === productId);
                if (existing) {
                    const items = prev.items.map(i =>
                        (i.productId || i.product) === productId
                            ? { ...i, quantity: i.quantity + quantity, totalPrice: (i.price || 0) * (i.quantity + quantity) }
                            : i
                    );
                    const total = items.reduce((s, i) => s + (i.totalPrice || 0), 0);
                    return { ...prev, items, total, count: items.length };
                }
                return prev;
            });
            return { success: false, error: message };
        } finally {
            setLoading(false);
        }
    }, [fetchCart]);

    const updateCartItem = useCallback(async (itemId, quantity) => {
        // Optimistic update
        setCart(prev => {
            const items = prev.items.map(i =>
                (i._id || i.id) === itemId
                    ? { ...i, quantity, totalPrice: (i.price || 0) * quantity }
                    : i
            );
            const total = items.reduce((s, i) => s + (i.totalPrice || 0), 0);
            return { ...prev, items, total };
        });

        try {
            await cartAPI.updateItem(itemId, { quantity });
            return { success: true };
        } catch (error) {
            await fetchCart(); // Revert to server state on failure
            const message = error.response?.data?.message || 'Failed to update item';
            return { success: false, error: message };
        }
    }, [fetchCart]);

    const removeFromCart = useCallback(async (itemId) => {
        // Optimistic remove
        setCart(prev => {
            const items = prev.items.filter(i => (i._id || i.id) !== itemId);
            const total = items.reduce((s, i) => s + (i.totalPrice || 0), 0);
            return { ...prev, items, total, count: items.length };
        });

        try {
            await cartAPI.removeItem(itemId);
            return { success: true };
        } catch (error) {
            await fetchCart(); // Revert on failure
            const message = error.response?.data?.message || 'Failed to remove item';
            return { success: false, error: message };
        }
    }, [fetchCart]);

    const clearCart = useCallback(async () => {
        setCart({ items: [], total: 0, count: 0 }); // Instant clear
        try {
            await cartAPI.clearCart();
            return { success: true };
        } catch (error) {
            await fetchCart(); // Revert on failure
            const message = error.response?.data?.message || 'Failed to clear cart';
            return { success: false, error: message };
        }
    }, [fetchCart]);

    const value = {
        cart,
        loading,
        fetchCart,
        addToCart,
        updateCartItem,
        removeFromCart,
        clearCart,
    };

    return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};
