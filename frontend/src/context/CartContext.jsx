import { createContext, useState, useEffect } from 'react';
import { cartAPI } from '../api/apiService';

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
    const [cart, setCart] = useState({ items: [], total: 0, count: 0 });
    const [loading, setLoading] = useState(false);

    const fetchCart = async () => {
        try {
            setLoading(true);
            const response = await cartAPI.getCart();
            setCart(response.data.data);
        } catch (error) {
            console.error('Failed to fetch cart:', error);
        } finally {
            setLoading(false);
        }
    };

    const addToCart = async (productId, quantity = 1) => {
        try {
            await cartAPI.addItem({ productId, quantity });
            await fetchCart();
            return { success: true };
        } catch (error) {
            const message = error.response?.data?.message || 'Failed to add item';
            return { success: false, error: message };
        }
    };

    const updateCartItem = async (itemId, quantity) => {
        try {
            await cartAPI.updateItem(itemId, { quantity });
            await fetchCart();
            return { success: true };
        } catch (error) {
            const message = error.response?.data?.message || 'Failed to update item';
            return { success: false, error: message };
        }
    };

    const removeFromCart = async (itemId) => {
        try {
            await cartAPI.removeItem(itemId);
            await fetchCart();
            return { success: true };
        } catch (error) {
            const message = error.response?.data?.message || 'Failed to remove item';
            return { success: false, error: message };
        }
    };

    const clearCart = async () => {
        try {
            await cartAPI.clearCart();
            setCart({ items: [], total: 0, count: 0 });
            return { success: true };
        } catch (error) {
            const message = error.response?.data?.message || 'Failed to clear cart';
            return { success: false, error: message };
        }
    };

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
