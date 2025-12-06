import React from 'react';
import { useCart } from '../../hooks/useCart';
import Button from '../common/Button';

const Cart = ({ onCheckout }) => {
    const { cart, updateCartItem, removeFromCart, clearCart, loading } = useCart();

    const handleQuantityChange = (itemId, newQuantity) => {
        if (newQuantity < 1) {
            removeFromCart(itemId);
        } else {
            updateCartItem(itemId, newQuantity);
        }
    };

    return (
        <div className="flex flex-col h-full bg-white border-l border-gray-200 w-full md:w-96 shadow-lg transform md:transform-none transition-transform duration-300 fixed md:static right-0 top-0 bottom-0 z-sticky">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                    <span>🛒</span> Current Order
                </h2>
                <button
                    className="text-gray-500 hover:text-danger text-sm flex items-center gap-1"
                    onClick={clearCart}
                    disabled={cart.items.length === 0}
                >
                    Clear
                </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
                {cart.items.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-gray-400">
                        <span className="text-4xl mb-2">🛍️</span>
                        <p>Cart is empty</p>
                        <p className="text-sm">Scan or select products to start</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {cart.items.map((item) => (
                            <div key={item._id || item.id} className="flex gap-3 bg-gray-50 p-2 rounded-md border border-gray-100">
                                <div className="flex-1">
                                    <h4 className="text-sm font-medium text-gray-900 line-clamp-1">{item.productName}</h4>
                                    <p className="text-xs text-gray-500">${item.price.toFixed(2)} / unit</p>
                                </div>

                                <div className="flex flex-col items-end gap-1">
                                    <div className="font-semibold text-sm">
                                        ${item.totalPrice.toFixed(2)}
                                    </div>
                                    <div className="flex items-center bg-white rounded border border-gray-200 h-7">
                                        <button
                                            className="px-2 hover:bg-gray-100 text-gray-600 border-r border-gray-200"
                                            onClick={() => handleQuantityChange(item._id || item.id, item.quantity - 1)}
                                        >
                                            -
                                        </button>
                                        <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                                        <button
                                            className="px-2 hover:bg-gray-100 text-gray-600 border-l border-gray-200"
                                            onClick={() => handleQuantityChange(item._id || item.id, item.quantity + 1)}
                                        >
                                            +
                                        </button>
                                    </div>
                                </div>

                                <button
                                    className="text-gray-400 hover:text-danger self-start"
                                    onClick={() => removeFromCart(item._id || item.id)}
                                >
                                    ×
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div className="p-4 border-t border-gray-200 bg-gray-50">
                <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm text-gray-600">
                        <span>Subtotal</span>
                        <span>${cart.total.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm text-gray-600">
                        <span>Tax (10%)</span>
                        <span>${(cart.total * 0.1).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-lg font-bold text-gray-900 pt-2 border-t border-gray-200">
                        <span>Total</span>
                        <span>${(cart.total * 1.1).toFixed(2)}</span>
                    </div>
                </div>

                <Button
                    variant="primary"
                    className="w-full justify-center py-3 text-lg"
                    onClick={onCheckout}
                    disabled={cart.items.length === 0 || loading}
                >
                    {loading ? 'Processing...' : `Pay $${(cart.total * 1.1).toFixed(2)}`}
                </Button>
            </div>
        </div>
    );
};

export default Cart;
