import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const SalesChart = ({ data, chartRange, onRangeChange, showProfit = true, height = 220 }) => (
    <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3 style={{ margin: 0, color: '#f1f5f9', fontWeight: 700, fontSize: '0.9375rem' }}>
                {showProfit ? 'Revenue vs Profit' : 'Revenue — Last 7 Days'}
            </h3>
            {onRangeChange && (
                <div style={{ display: 'flex', gap: 4 }}>
                    {[7, 14, 30].map(d => (
                        <button key={d} onClick={() => onRangeChange(d)} style={{
                            padding: '4px 10px', borderRadius: 6, fontSize: '0.6875rem', fontWeight: 700, border: 'none', cursor: 'pointer',
                            background: chartRange === d ? '#6366f1' : 'rgba(148,163,184,0.1)',
                            color: chartRange === d ? '#fff' : '#64748b',
                        }}>{d}d</button>
                    ))}
                </div>
            )}
        </div>
        <ResponsiveContainer width="100%" height={height}>
            <AreaChart data={data}>
                <defs>
                    <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.25} />
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                    </linearGradient>
                    {showProfit && (
                        <linearGradient id="profGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#34d399" stopOpacity={0.25} />
                            <stop offset="95%" stopColor="#34d399" stopOpacity={0} />
                        </linearGradient>
                    )}
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.08)" />
                <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `$${v}`} />
                <Tooltip
                    contentStyle={{ background: '#1e293b', border: '1px solid rgba(148,163,184,0.2)', borderRadius: 8, color: '#f1f5f9' }}
                    formatter={(v, n) => [`$${Number(v).toFixed(2)}`, n === 'revenue' ? 'Revenue' : 'Profit']}
                />
                <Area type="monotone" dataKey="revenue" stroke="#6366f1" strokeWidth={2} fill="url(#revGrad)" />
                {showProfit && <Area type="monotone" dataKey="profit" stroke="#34d399" strokeWidth={2} fill="url(#profGrad)" />}
            </AreaChart>
        </ResponsiveContainer>
    </div>
);

export default SalesChart;
