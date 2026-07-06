import React, { useState, useRef, useCallback, useEffect } from 'react';
import { decodeBillQR } from '../../store/dataHelpers';

const QRScanner = ({ onScan, onManualEntry }) => {
    const scannerRef = useRef(null);
    const [scannerActive, setScannerActive] = useState(false);
    const [manualId, setManualId] = useState('');
    const [error, setError] = useState('');
    const html5QrCodeRef = useRef(null);

    const stopScanner = useCallback(async () => {
        try {
            if (html5QrCodeRef.current) {
                await html5QrCodeRef.current.stop();
                html5QrCodeRef.current = null;
            }
        } catch { /* ignore */ }
        setScannerActive(false);
    }, []);

    const startScanner = useCallback(async () => {
        try {
            const { Html5Qrcode } = await import('html5-qrcode');
            html5QrCodeRef.current = new Html5Qrcode('qr-reader-cashier');
            await html5QrCodeRef.current.start(
                { facingMode: 'environment' },
                { fps: 10, qrbox: { width: 250, height: 250 } },
                (decodedText) => {
                    stopScanner();
                    onScan(decodeBillQR(decodedText));
                },
                () => { }
            );
            setScannerActive(true);
            setError('');
        } catch {
            setError('Camera not available. Use Manual Bill ID entry below.');
        }
    }, [onScan, stopScanner]);

    useEffect(() => () => { stopScanner(); }, [stopScanner]);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{
                background: 'rgba(15,23,42,0.8)', borderRadius: 14,
                border: '1px solid rgba(148,163,184,0.15)', overflow: 'hidden',
            }}>
                <div id="qr-reader-cashier" ref={scannerRef} style={{ width: '100%', minHeight: 280 }} />
                {!scannerActive && (
                    <div style={{
                        display: 'flex', flexDirection: 'column', alignItems: 'center',
                        justifyContent: 'center', minHeight: 280, gap: 16, padding: 20,
                    }}>
                        <div style={{
                            width: 80, height: 80, borderRadius: '50%',
                            background: 'rgba(99,102,241,0.15)', display: 'flex',
                            alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem',
                        }}>📷</div>
                        <p style={{ color: '#94a3b8', textAlign: 'center', margin: 0, fontSize: '0.875rem' }}>
                            Point camera at mechanic&apos;s bill QR code
                        </p>
                        {error && <p style={{ color: '#f87171', fontSize: '0.8rem', textAlign: 'center', margin: 0 }}>{error}</p>}
                        <button onClick={startScanner} style={{
                            padding: '11px 28px', borderRadius: 10, fontWeight: 700, fontSize: '0.9rem',
                            background: 'linear-gradient(135deg,#4f46e5,#6366f1)', color: '#fff',
                            border: 'none', cursor: 'pointer', boxShadow: '0 4px 16px rgba(99,102,241,0.4)',
                        }}>📷 Start Camera Scanner</button>
                    </div>
                )}
                {scannerActive && (
                    <div style={{ padding: '12px', textAlign: 'center' }}>
                        <p style={{ color: '#fbbf24', fontSize: '0.8rem', margin: '0 0 8px', fontWeight: 600 }}>
                            ● Scanning... Point at QR code
                        </p>
                        <button onClick={stopScanner} style={{
                            padding: '7px 18px', borderRadius: 8, fontWeight: 600, fontSize: '0.8rem',
                            background: 'rgba(248,113,113,0.15)', color: '#f87171',
                            border: '1px solid rgba(248,113,113,0.3)', cursor: 'pointer',
                        }}>Stop Scanner</button>
                    </div>
                )}
            </div>

            <div style={{ background: 'rgba(15,23,42,0.6)', borderRadius: 12, padding: 16, border: '1px solid rgba(148,163,184,0.12)' }}>
                <p style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', margin: '0 0 10px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    Or Enter Bill ID Manually
                </p>
                <div style={{ display: 'flex', gap: 8 }}>
                    <input
                        value={manualId}
                        onChange={e => setManualId(e.target.value.toUpperCase())}
                        placeholder="e.g. MECH-1234-ABCD"
                        style={{
                            flex: 1, padding: '9px 12px', background: 'rgba(15,23,42,0.7)',
                            border: '1px solid rgba(148,163,184,0.2)', borderRadius: 8,
                            color: '#f1f5f9', fontSize: '0.875rem', outline: 'none',
                        }}
                        onKeyDown={e => e.key === 'Enter' && manualId && onManualEntry(manualId)}
                    />
                    <button
                        onClick={() => manualId && onManualEntry(manualId)}
                        style={{
                            padding: '9px 18px', borderRadius: 8, fontWeight: 700, fontSize: '0.8125rem',
                            background: 'linear-gradient(135deg,#6366f1,#818cf8)', color: '#fff',
                            border: 'none', cursor: 'pointer',
                        }}
                    >Fetch</button>
                </div>
            </div>
        </div>
    );
};

export default QRScanner;
