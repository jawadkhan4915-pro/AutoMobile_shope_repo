import React, { useState } from 'react';
import ProductGrid from '../components/pos/ProductGrid';
import Cart from '../components/pos/Cart';
import Checkout from '../components/pos/Checkout';

const POS = () => {
    const [showCheckout, setShowCheckout] = useState(false);
    const [lastOrder, setLastOrder] = useState(null);

    const handleCheckoutComplete = (order) => {
        setLastOrder(order);
        setShowCheckout(false);
        // Could show a success modal or receipt here
        alert('Order completed successfully! ID: ' + order.id);
    };

    return (
        <div className="flex flex-col md:flex-row h-[calc(100vh-6rem)] gap-4">
            <div className="flex-1 min-w-0">
                <ProductGrid />
            </div>

            <div className="w-full md:w-96">
                <Cart onCheckout={() => setShowCheckout(true)} />
            </div>

            {showCheckout && (
                <Checkout
                    onClose={() => setShowCheckout(false)}
                    onComplete={handleCheckoutComplete}
                />
            )}
        </div>
    );
};

export default POS;
