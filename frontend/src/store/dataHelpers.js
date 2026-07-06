/**
 * dataHelpers — Excel export, QR encoding/decoding, image utilities
 */

export const TAX_RATE = 0.10;

/** Local SVG placeholder for offline / failed image loads */
export const PART_IMAGE_PLACEHOLDER =
    'data:image/svg+xml,' + encodeURIComponent(
        `<svg xmlns="http://www.w3.org/2000/svg" width="300" height="180" viewBox="0 0 300 180">
            <rect width="300" height="180" fill="#1e293b"/>
            <rect x="90" y="40" width="120" height="80" rx="8" fill="#334155" stroke="#6366f1" stroke-width="2"/>
            <circle cx="115" cy="130" r="18" fill="#475569" stroke="#64748b" stroke-width="3"/>
            <circle cx="185" cy="130" r="18" fill="#475569" stroke="#64748b" stroke-width="3"/>
            <text x="150" y="88" text-anchor="middle" fill="#818cf8" font-family="system-ui,sans-serif" font-size="14" font-weight="700">AUTO PART</text>
        </svg>`
    );

/** Ensure Unsplash URLs have consistent crop/size params */
export const formatImageUrl = (url) => {
    if (!url) return PART_IMAGE_PLACEHOLDER;
    if (url.startsWith('data:')) return url;
    try {
        const u = new URL(url);
        u.searchParams.set('w', '300');
        u.searchParams.set('h', '180');
        u.searchParams.set('fit', 'crop');
        u.searchParams.set('auto', 'format');
        return u.toString();
    } catch {
        return url;
    }
};

/** onError handler — swap to local SVG placeholder */
export const handleImageError = (e) => {
    e.target.onerror = null;
    e.target.src = PART_IMAGE_PLACEHOLDER;
};

/** Encode mechanic bill as QR payload */
export const encodeBillQR = (bill) => JSON.stringify({
    id: bill.id,
    items: bill.items,
    total: bill.total,
    tax: bill.tax,
    subtotal: bill.subtotal,
    customerName: bill.customerName,
    vehicleInfo: bill.vehicleInfo,
    mechanicName: bill.mechanicName,
    date: bill.date,
});

/** Decode QR scan text into bill object */
export const decodeBillQR = (text) => {
    try {
        return JSON.parse(text);
    } catch {
        return { raw: text };
    }
};

/** Monthly Excel export — 3 sheets: Transactions, Products, Summary */
export const exportMonthlyExcel = async (transactions, products, monthLabel) => {
    const XLSX = await import('xlsx');
    const wb = XLSX.utils.book_new();

    const trxRows = [
        ['ID', 'Date', 'Type', 'Customer', 'Staff', 'Items', 'Method', 'Subtotal', 'Tax', 'Total'],
        ...transactions.map(t => [
            t.id,
            new Date(t.date).toLocaleString(),
            t.type === 'mechanic_bill' ? 'Mechanic Bill' : 'POS Sale',
            t.customerName || 'Walk-in',
            t.staffName || '—',
            (t.items || []).map(i => `${i.name} x${i.qty}`).join('; '),
            t.method || '—',
            t.subtotal?.toFixed(2) || '0.00',
            t.tax?.toFixed(2) || '0.00',
            t.total?.toFixed(2) || '0.00',
        ]),
    ];
    const ws1 = XLSX.utils.aoa_to_sheet(trxRows);
    ws1['!cols'] = [10, 20, 16, 20, 16, 50, 12, 12, 12, 12].map(w => ({ wch: w }));
    XLSX.utils.book_append_sheet(wb, ws1, 'Transactions');

    const soldQty = {};
    transactions.forEach(t => {
        (t.items || []).forEach(item => {
            const key = item.productId || item.name;
            soldQty[key] = (soldQty[key] || 0) + (item.qty || 1);
        });
    });

    const stockRows = [
        ['Product ID', 'Name', 'SKU', 'Category', 'Sold Qty', 'Remaining Stock', 'Selling Price', 'Cost Price'],
        ...products.map(p => [
            p._id,
            p.name,
            p.sku || p.barcode || '—',
            p.category,
            soldQty[p._id] || soldQty[p.name] || 0,
            p.quantity,
            p.price?.toFixed(2),
            (p.costPrice || p.price * 0.65)?.toFixed(2),
        ]),
    ];
    const ws2 = XLSX.utils.aoa_to_sheet(stockRows);
    ws2['!cols'] = [10, 40, 12, 18, 12, 16, 14, 14].map(w => ({ wch: w }));
    XLSX.utils.book_append_sheet(wb, ws2, 'Products');

    const totalRevenue = transactions.reduce((s, t) => s + (t.total || 0), 0);
    const totalCost = transactions.reduce((s, t) =>
        s + (t.items || []).reduce((is, item) => {
            const p = products.find(p => p.name === item.name || p._id === item.productId);
            return is + ((p?.costPrice || (item.price || 0) * 0.65)) * (item.qty || 1);
        }, 0), 0);
    const totalProfit = totalRevenue - totalCost;

    const summaryRows = [
        [`APEX MOTORWORKS — Monthly Summary: ${monthLabel}`],
        [],
        ['REVENUE BREAKDOWN'],
        ['Total Sales', `$${totalRevenue.toFixed(2)}`],
        ['Total Cost of Goods', `$${totalCost.toFixed(2)}`],
        ['Net Profit', `$${totalProfit.toFixed(2)}`],
        ['Profit Margin', `${totalRevenue > 0 ? ((totalProfit / totalRevenue) * 100).toFixed(1) : 0}%`],
        [],
        ['TRANSACTION BREAKDOWN'],
        ['Total Transactions', transactions.length],
        ['POS Sales', transactions.filter(t => t.type !== 'mechanic_bill').length],
        ['Mechanic Bills Processed', transactions.filter(t => t.type === 'mechanic_bill').length],
        [],
        ['INVENTORY SUMMARY'],
        ['Total Products', products.length],
        ['Out of Stock Items', products.filter(p => p.quantity === 0).length],
        ['Low Stock Items (≤5)', products.filter(p => p.quantity > 0 && p.quantity <= 5).length],
        ['Total Stock Value', `$${products.reduce((s, p) => s + (p.price || 0) * (p.quantity || 0), 0).toFixed(2)}`],
        [],
        ['Generated on', new Date().toLocaleString()],
    ];
    const ws3 = XLSX.utils.aoa_to_sheet(summaryRows);
    ws3['!cols'] = [35, 20].map(w => ({ wch: w }));
    XLSX.utils.book_append_sheet(wb, ws3, 'Summary');

    XLSX.writeFile(wb, `ApexMotorWorks_${monthLabel.replace(' ', '_')}_Report.xlsx`);
};
