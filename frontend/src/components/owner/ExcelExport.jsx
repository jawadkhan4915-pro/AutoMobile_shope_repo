import React, { useState, useCallback } from 'react';
import { exportMonthlyExcel } from '../../store/dataHelpers';

const ExcelExport = ({ transactions, products, monthLabel, monthStats, variant = 'button' }) => {
    const [exporting, setExporting] = useState(false);

    const handleExport = useCallback(async () => {
        setExporting(true);
        try {
            const monthTrx = monthStats?.transactions || transactions.filter(t => {
                const d = new Date(t.date);
                const now = new Date();
                return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
            });
            await exportMonthlyExcel(monthTrx, products, monthLabel);
        } catch (err) {
            alert('Failed to export Excel: ' + err.message);
        } finally {
            setExporting(false);
        }
    }, [transactions, products, monthLabel, monthStats]);

    if (variant === 'card') {
        return (
            <div style={{
                background: 'rgba(15,23,42,0.75)', border: '1px solid rgba(99,102,241,0.25)',
                borderRadius: 14, padding: 20, backgroundImage: 'linear-gradient(rgba(99,102,241,0.04), rgba(99,102,241,0.04))',
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 14 }}>
                    <div>
                        <h3 style={{ margin: 0, color: 'var(--text-primary)', fontWeight: 800, fontSize: '1.1rem' }}>📥 Monthly Excel Report</h3>
                        <p style={{ margin: '4px 0 0', color: '#64748b', fontSize: '0.875rem' }}>
                            Download complete report for <strong style={{ color: '#818cf8' }}>{monthLabel}</strong>
                        </p>
                        <p style={{ margin: '4px 0 0', fontSize: '0.75rem', color: '#475569' }}>
                            Sheets: Transactions · Products · Summary
                        </p>
                    </div>
                    <button onClick={handleExport} disabled={exporting} style={{
                        padding: '12px 24px', borderRadius: 12, fontWeight: 800, fontSize: '0.9375rem',
                        background: exporting ? 'rgba(52,211,153,0.3)' : 'linear-gradient(135deg,#059669,#34d399)',
                        color: '#fff', border: 'none', cursor: exporting ? 'not-allowed' : 'pointer',
                        boxShadow: '0 4px 16px rgba(52,211,153,0.3)',
                    }}>
                        {exporting ? '⏳ Preparing...' : '📥 Download Excel'}
                    </button>
                </div>
                {monthStats && (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: 12, marginTop: 20 }}>
                        {[
                            { label: 'Revenue', value: `$${monthStats.revenue.toFixed(2)}`, color: '#6366f1' },
                            { label: 'Cost', value: `$${monthStats.cost.toFixed(2)}`, color: '#fbbf24' },
                            { label: 'Profit', value: `$${monthStats.profit.toFixed(2)}`, color: '#34d399' },
                            { label: 'Transactions', value: monthStats.orders, color: '#60a5fa' },
                        ].map(({ label, value, color }) => (
                            <div key={label} style={{ background: 'rgba(15,23,42,0.5)', borderRadius: 10, padding: '14px', textAlign: 'center' }}>
                                <p style={{ margin: '0 0 6px', fontSize: '0.6875rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>{label}</p>
                                <p style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color }}>{value}</p>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        );
    }

    return (
        <button onClick={handleExport} disabled={exporting} style={{
            padding: '9px 18px', borderRadius: 10, fontWeight: 700, fontSize: '0.8125rem',
            background: exporting ? 'rgba(52,211,153,0.3)' : 'linear-gradient(135deg,#059669,#34d399)',
            color: '#fff', border: 'none', cursor: exporting ? 'not-allowed' : 'pointer',
            boxShadow: '0 3px 12px rgba(52,211,153,0.3)', display: 'flex', alignItems: 'center', gap: 6,
        }}>
            {exporting ? '⏳ Exporting...' : '📥 Download Excel Report'}
        </button>
    );
};

export default ExcelExport;
