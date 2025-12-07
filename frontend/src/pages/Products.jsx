import React, { useState, useEffect } from 'react';
import { productsAPI } from '../api/apiService';
import Loader from '../components/common/Loader';

const Products = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'table'

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            const response = await productsAPI.getAll({ limit: 100 });
            setProducts(response.data.data);
        } catch (error) {
            console.error('Failed to fetch products', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredProducts = products.filter(product =>
        `${product.name} ${product.barcode} ${product.description}`
            .toLowerCase()
            .includes(searchTerm.toLowerCase())
    );

    const lowStockProducts = products.filter(p => p.quantity < 10).length;
    const totalValue = products.reduce((sum, p) => sum + (p.price * p.quantity), 0);

    if (loading) return <Loader />;

    return (
        <div className="animate-fade-in">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 animate-slide-in-down">
                <div>
                    <h1
                        className="text-3xl font-bold"
                        style={{
                            background: 'linear-gradient(135deg, var(--color-accent), var(--color-primary))',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent'
                        }}
                    >
                        Products
                    </h1>
                    <p className="text-muted mt-1">Manage your inventory</p>
                </div>
                <button
                    className="btn btn-primary hover-glow"
                    style={{
                        padding: '12px 24px',
                        fontSize: '0.95rem',
                        fontWeight: '600',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                    }}
                >
                    <span>➕</span>
                    <span>Add Product</span>
                </button>
            </div>

            {/* Search and View Toggle */}
            <div className="flex flex-col md:flex-row gap-4 mb-6 animate-slide-in-up stagger-1">
                <div className="flex-1 relative">
                    <input
                        type="text"
                        placeholder="Search products by name, barcode, or description..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="form-input"
                        style={{
                            paddingLeft: '45px',
                            fontSize: '0.95rem'
                        }}
                    />
                    <span
                        style={{
                            position: 'absolute',
                            left: '16px',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            fontSize: '1.2rem',
                            color: 'var(--text-muted)'
                        }}
                    >
                        🔍
                    </span>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => setViewMode('grid')}
                        className={`btn ${viewMode === 'grid' ? 'btn-primary' : 'btn-secondary'}`}
                        style={{ padding: '12px 20px' }}
                    >
                        ⊞ Grid
                    </button>
                    <button
                        onClick={() => setViewMode('table')}
                        className={`btn ${viewMode === 'table' ? 'btn-primary' : 'btn-secondary'}`}
                        style={{ padding: '12px 20px' }}
                    >
                        ☰ Table
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="stats-card hover-lift animate-slide-in-up stagger-1">
                    <p className="stats-card-title">Total Products</p>
                    <p className="stats-card-value text-primary">{products.length}</p>
                    <p className="stats-card-change">In inventory</p>
                </div>
                <div className="stats-card hover-lift animate-slide-in-up stagger-2">
                    <p className="stats-card-title">Inventory Value</p>
                    <p className="stats-card-value" style={{ background: 'linear-gradient(to right, #fff, #00FF9D)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                        ${totalValue.toFixed(2)}
                    </p>
                    <p className="stats-card-change">Total worth</p>
                </div>
                <div className="stats-card hover-lift animate-slide-in-up stagger-3">
                    <p className="stats-card-title">Low Stock</p>
                    <p className="stats-card-value" style={{ background: 'linear-gradient(to right, #fff, #FFB800)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                        {lowStockProducts}
                    </p>
                    <p className="stats-card-change">Need restock</p>
                </div>
                <div className="stats-card hover-lift animate-slide-in-up stagger-4">
                    <p className="stats-card-title">Active Products</p>
                    <p className="stats-card-value" style={{ background: 'linear-gradient(to right, #fff, #00F0FF)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                        {products.filter(p => p.status).length}
                    </p>
                    <p className="stats-card-change">Available for sale</p>
                </div>
            </div>

            {/* Products Display */}
            {viewMode === 'grid' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {filteredProducts.map((product, index) => (
                        <div
                            key={product._id || index}
                            className="card hover-lift animate-scale-in"
                            style={{
                                animationDelay: `${index * 0.05}s`,
                                padding: '0',
                                overflow: 'hidden'
                            }}
                        >
                            <div
                                style={{
                                    height: '180px',
                                    background: 'linear-gradient(135deg, rgba(112, 0, 255, 0.1), rgba(0, 240, 255, 0.1))',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    position: 'relative'
                                }}
                            >
                                {product.imageUrl ? (
                                    <img
                                        src={product.imageUrl}
                                        alt={product.name}
                                        style={{
                                            width: '100%',
                                            height: '100%',
                                            objectFit: 'cover'
                                        }}
                                    />
                                ) : (
                                    <span style={{ fontSize: '4rem' }}>📦</span>
                                )}
                                <span
                                    className={`badge ${product.status ? 'badge-success' : 'badge-danger'}`}
                                    style={{
                                        position: 'absolute',
                                        top: '12px',
                                        right: '12px'
                                    }}
                                >
                                    {product.status ? 'Active' : 'Inactive'}
                                </span>
                            </div>
                            <div style={{ padding: 'var(--spacing-lg)' }}>
                                <h3
                                    className="font-bold text-lg mb-1"
                                    style={{ color: 'var(--text-main)' }}
                                >
                                    {product.name}
                                </h3>
                                <p className="text-xs text-muted mb-3">
                                    Barcode: {product.barcode}
                                </p>
                                <div className="flex justify-between items-center mb-3">
                                    <div>
                                        <p className="text-xs text-muted">Price</p>
                                        <p
                                            className="text-xl font-bold"
                                            style={{ color: 'var(--color-primary)' }}
                                        >
                                            ${product.price?.toFixed(2) || '0.00'}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs text-muted">Stock</p>
                                        <p
                                            className="text-xl font-bold"
                                            style={{
                                                color: product.quantity < 10 ? 'var(--color-danger)' : 'var(--color-success)'
                                            }}
                                        >
                                            {product.quantity}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        className="btn btn-sm flex-1"
                                        style={{
                                            background: 'rgba(0, 240, 255, 0.1)',
                                            border: '1px solid rgba(0, 240, 255, 0.3)',
                                            color: 'var(--color-primary)',
                                            fontSize: '0.85rem'
                                        }}
                                    >
                                        ✏️ Edit
                                    </button>
                                    <button
                                        className="btn btn-sm flex-1"
                                        style={{
                                            background: 'rgba(255, 0, 85, 0.1)',
                                            border: '1px solid rgba(255, 0, 85, 0.3)',
                                            color: 'var(--color-danger)',
                                            fontSize: '0.85rem'
                                        }}
                                    >
                                        🗑️
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="card hover-lift animate-slide-in-up stagger-2">
                    <div className="card-header">
                        <h3 className="card-title">All Products ({filteredProducts.length})</h3>
                    </div>
                    <div className="table-container">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>Product</th>
                                    <th>Price</th>
                                    <th>Stock</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredProducts.map((product, index) => (
                                    <tr
                                        key={product._id || index}
                                        className="animate-fade-in"
                                        style={{ animationDelay: `${index * 0.05}s` }}
                                    >
                                        <td>
                                            <div className="flex items-center gap-3">
                                                <div
                                                    style={{
                                                        width: '48px',
                                                        height: '48px',
                                                        borderRadius: 'var(--radius-sm)',
                                                        background: 'linear-gradient(135deg, rgba(112, 0, 255, 0.1), rgba(0, 240, 255, 0.1))',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        overflow: 'hidden'
                                                    }}
                                                >
                                                    {product.imageUrl ? (
                                                        <img
                                                            src={product.imageUrl}
                                                            alt=""
                                                            style={{
                                                                width: '100%',
                                                                height: '100%',
                                                                objectFit: 'cover'
                                                            }}
                                                        />
                                                    ) : (
                                                        <span style={{ fontSize: '1.5rem' }}>📦</span>
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="font-semibold" style={{ color: 'var(--text-main)' }}>
                                                        {product.name}
                                                    </p>
                                                    <p className="text-xs text-muted">
                                                        {product.barcode}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <p className="font-bold" style={{ color: 'var(--color-primary)' }}>
                                                ${product.price?.toFixed(2) || '0.00'}
                                            </p>
                                        </td>
                                        <td>
                                            <p
                                                className="font-semibold"
                                                style={{
                                                    color: product.quantity < 10 ? 'var(--color-danger)' : 'var(--color-success)'
                                                }}
                                            >
                                                {product.quantity}
                                            </p>
                                        </td>
                                        <td>
                                            <span className={`badge ${product.status ? 'badge-success' : 'badge-danger'}`}>
                                                {product.status ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                        <td>
                                            <div className="flex gap-2">
                                                <button
                                                    className="btn btn-sm"
                                                    style={{
                                                        background: 'rgba(0, 240, 255, 0.1)',
                                                        border: '1px solid rgba(0, 240, 255, 0.3)',
                                                        color: 'var(--color-primary)',
                                                        padding: '6px 12px',
                                                        fontSize: '0.85rem'
                                                    }}
                                                >
                                                    ✏️ Edit
                                                </button>
                                                <button
                                                    className="btn btn-sm"
                                                    style={{
                                                        background: 'rgba(255, 0, 85, 0.1)',
                                                        border: '1px solid rgba(255, 0, 85, 0.3)',
                                                        color: 'var(--color-danger)',
                                                        padding: '6px 12px',
                                                        fontSize: '0.85rem'
                                                    }}
                                                >
                                                    🗑️
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Products;
