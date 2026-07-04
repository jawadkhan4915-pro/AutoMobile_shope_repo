import React from 'react';

const ReceiptModal = ({ order, onClose }) => {
  if (!order) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="modal-backdrop">
      <div className="modal max-w-lg">
        {/* Modal Header */}
        <div className="modal-header border-b border-glass pb-3">
          <div className="flex items-center gap-2">
            <span style={{ fontSize: '1.5rem' }}>🧾</span>
            <h2 className="modal-title text-xl">Digital Invoice & Receipt</h2>
          </div>
          <button onClick={onClose} className="modal-close">&times;</button>
        </div>

        {/* Printable Receipt Body */}
        <div className="modal-body p-6 space-y-4 font-mono text-sm" id="printable-receipt">
          {/* Shop Header */}
          <div className="text-center border-b border-dashed border-gray-600 pb-4">
            <h2 className="text-xl font-bold uppercase text-primary tracking-wider">Apex MotorWorks</h2>
            <p className="text-xs text-muted">Auto Parts & Repair Services</p>
            <p className="text-xs text-muted">450 Industrial Pkwy, San Jose, CA</p>
            <p className="text-xs text-muted">Tel: +1 (555) 234-5678</p>
          </div>

          {/* Receipt Meta */}
          <div className="flex justify-between text-xs text-muted border-b border-dashed border-gray-600 pb-3">
            <div>
              <p>Invoice #: <span className="text-white font-bold">{order._id || order.id || 'INV-9021'}</span></p>
              <p>Date: {new Date().toLocaleDateString()} {new Date().toLocaleTimeString()}</p>
            </div>
            <div className="text-right">
              <p>Customer: <span className="text-white font-bold">{order.customerName || 'Walk-in'}</span></p>
              <p>Payment: <span className="uppercase text-primary font-bold">{order.paymentMethod || 'Cash'}</span></p>
            </div>
          </div>

          {/* Item List */}
          <div className="space-y-2 border-b border-dashed border-gray-600 pb-3">
            <div className="flex justify-between text-xs font-bold text-muted uppercase">
              <span>Item Description</span>
              <span className="w-12 text-center">Qty</span>
              <span className="w-20 text-right">Total</span>
            </div>
            {(order.items || []).map((item, idx) => (
              <div key={idx} className="flex justify-between text-xs text-white">
                <span className="truncate pr-2">{item.productName || item.name || 'Auto Component'}</span>
                <span className="w-12 text-center">x{item.quantity}</span>
                <span className="w-20 text-right font-bold">${((item.price || 0) * (item.quantity || 1)).toFixed(2)}</span>
              </div>
            ))}
          </div>

          {/* Calculations */}
          <div className="space-y-1 text-right text-xs pt-1">
            <div className="flex justify-between text-muted">
              <span>Subtotal:</span>
              <span className="text-white font-bold">${(order.totalAmount ? order.totalAmount * 0.9 : 0).toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-muted">
              <span>Sales Tax (10%):</span>
              <span className="text-white font-bold">${(order.totalAmount ? order.totalAmount * 0.1 : 0).toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-base font-bold border-t border-glass pt-2 text-primary">
              <span>Grand Total:</span>
              <span>${(order.totalAmount || 0).toFixed(2)}</span>
            </div>
          </div>

          {/* Footer Note */}
          <div className="text-center text-xs text-muted border-t border-dashed border-gray-600 pt-4">
            <p>Thank you for choosing Apex MotorWorks!</p>
            <p className="text-[10px]">Warranty: 30 days money-back on non-electrical parts.</p>
          </div>
        </div>

        {/* Action Footer */}
        <div className="modal-footer">
          <button onClick={handlePrint} className="btn btn-outline flex items-center gap-2">
            <span>🖨️</span> Print Invoice
          </button>
          <button onClick={onClose} className="btn btn-primary">
            Close & New Sale
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReceiptModal;
