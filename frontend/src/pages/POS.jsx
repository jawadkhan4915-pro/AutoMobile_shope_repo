import React, { useState } from 'react';
import ProductGrid from '../components/pos/ProductGrid';
import Cart from '../components/pos/Cart';
import Checkout from '../components/pos/Checkout';
import ReceiptModal from '../components/pos/ReceiptModal';

const POS = () => {
    const [showCheckout, setShowCheckout] = useState(false);
    const [completedOrder, setCompletedOrder] = useState(null);

    const handleCheckoutComplete = (order) => {
        setCompletedOrder(order);
        setShowCheckout(false);
    };

    return (
        <div className="flex flex-col md:flex-row h-[calc(100vh-6rem)] gap-4 p-2 md:p-4 animate-fade-in">
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

            {completedOrder && (
                <ReceiptModal
                    order={completedOrder}
                    onClose={() => setCompletedOrder(null)}
                />
            )}
        </div>
    );
};

export default POS;
