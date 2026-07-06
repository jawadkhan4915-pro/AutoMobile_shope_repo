import React, { useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { encodeBillQR } from '../../store/dataHelpers';

const MechanicBillSlip = ({ bill, onClose }) => {
    const slipRef = useRef();
    const qrData = encodeBillQR(bill);

    const handlePrint = () => {
        const win = window.open('', '_blank');
        win.document.write(`
            <html><head><title>Bill Slip — ${bill.id}</title>
            <style>
                body { font-family: 'Courier New', monospace; max-width: 400px; margin: 0 auto; padding: 20px; color: #000; }
                h2 { text-align: center; font-size: 1.2rem; margin: 0; }
                hr { border: 1px dashed #999; margin: 10px 0; }
                table { width: 100%; border-collapse: collapse; font-size: 0.8rem; }
                th { text-align: left; padding: 4px 0; border-bottom: 1px solid #ccc; }
                td { padding: 3px 0; }
                @media print { body { max-width: 100%; } }
            </style></head><body>
            ${slipRef.current.innerHTML}
            <script>window.onload = () => window.print();<\/script>
            </body></html>
        `);
        win.document.close();
    };

    return (
        <div style={{
            position: 'fixed', inset: 0, zIndex: 1000,
            background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16,
        }}>
            <div style={{
                background: '#fff', borderRadius: 16, padding: 28,
                maxWidth: 480, width: '100%', maxHeight: '90vh', overflowY: 'auto',
                color: '#0f172a', position: 'relative',
            }}>
                <button onClick={onClose} style={{
                    position: 'absolute', top: 12, right: 14, background: 'none',
                    border: 'none', fontSize: '1.25rem', cursor: 'pointer', color: '#64748b',
                }}>×</button>

                <div ref={slipRef}>
                    <h2 style={{ textAlign: 'center', fontFamily: 'monospace', margin: 0, fontSize: '1.1rem' }}>
                        🏎️ APEX MOTORWORKS
                    </h2>
                    <p style={{ textAlign: 'center', fontSize: '0.7rem', color: '#555', margin: '4px 0 12px', fontFamily: 'monospace' }}>
                        Automotive Service & Parts<br />contact@apexmotorworks.com
                    </p>
                    <hr style={{ border: '1px dashed #999' }} />
                    <table style={{ width: '100%', fontSize: '0.75rem', fontFamily: 'monospace' }}>
                        <tbody>
                            <tr><td>Bill #</td><td style={{ textAlign: 'right', fontWeight: 700 }}>{bill.id}</td></tr>
                            <tr><td>Date</td><td style={{ textAlign: 'right' }}>{new Date(bill.date).toLocaleString()}</td></tr>
                            <tr><td>Mechanic</td><td style={{ textAlign: 'right' }}>{bill.mechanicName}</td></tr>
                            <tr><td>Customer</td><td style={{ textAlign: 'right' }}>{bill.customerName || 'Walk-in'}</td></tr>
                            {bill.vehicleInfo && <tr><td>Vehicle</td><td style={{ textAlign: 'right' }}>{bill.vehicleInfo}</td></tr>}
                        </tbody>
                    </table>
                    <hr style={{ border: '1px dashed #999' }} />
                    <table style={{ width: '100%', fontSize: '0.75rem', fontFamily: 'monospace' }}>
                        <thead>
                            <tr>
                                <th>Part</th>
                                <th style={{ textAlign: 'center' }}>Qty</th>
                                <th style={{ textAlign: 'right' }}>Price</th>
                                <th style={{ textAlign: 'right' }}>Sub</th>
                            </tr>
                        </thead>
                        <tbody>
                            {bill.items.map((item, i) => (
                                <tr key={i}>
                                    <td>{item.name}</td>
                                    <td style={{ textAlign: 'center' }}>{item.qty}</td>
                                    <td style={{ textAlign: 'right' }}>${item.price.toFixed(2)}</td>
                                    <td style={{ textAlign: 'right' }}>${(item.qty * item.price).toFixed(2)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <hr style={{ border: '1px dashed #999' }} />
                    <table style={{ width: '100%', fontSize: '0.75rem', fontFamily: 'monospace' }}>
                        <tbody>
                            <tr><td>Subtotal</td><td style={{ textAlign: 'right' }}>${bill.subtotal.toFixed(2)}</td></tr>
                            <tr><td>Tax (10%)</td><td style={{ textAlign: 'right' }}>${bill.tax.toFixed(2)}</td></tr>
                            <tr style={{ fontWeight: 800, fontSize: '0.95rem', borderTop: '2px solid #000' }}>
                                <td>TOTAL</td><td style={{ textAlign: 'right' }}>${bill.total.toFixed(2)}</td>
                            </tr>
                        </tbody>
                    </table>
                    <hr style={{ border: '1px dashed #999' }} />
                    <div style={{ textAlign: 'center', marginTop: 12 }}>
                        <p style={{ fontSize: '0.65rem', fontFamily: 'monospace', marginBottom: 8, color: '#333' }}>
                            ── SCAN QR CODE AT CASHIER COUNTER ──
                        </p>
                        <QRCodeSVG value={qrData} size={160} level="M" includeMargin />
                        <p style={{ fontSize: '0.6rem', color: '#666', marginTop: 6, fontFamily: 'monospace' }}>
                            Cashier will scan this QR to process payment
                        </p>
                    </div>
                </div>

                <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
                    <button onClick={handlePrint} style={{
                        flex: 1, padding: '11px', borderRadius: 10,
                        background: 'linear-gradient(135deg, #4f46e5, #6366f1)',
                        color: '#fff', fontWeight: 700, border: 'none', cursor: 'pointer', fontSize: '0.875rem',
                    }}>🖨️ Print Bill Slip</button>
                    <button onClick={onClose} style={{
                        padding: '11px 18px', borderRadius: 10,
                        background: '#f1f5f9', color: '#64748b', fontWeight: 600, border: 'none', cursor: 'pointer',
                    }}>Close</button>
                </div>
            </div>
        </div>
    );
};

export default MechanicBillSlip;
