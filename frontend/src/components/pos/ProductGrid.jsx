import React, { useState, useMemo, useCallback } from 'react';
import { useStore } from '../../store/useStore';
import { formatImageUrl, handleImageError } from '../../store/dataHelpers';
import { useCart } from '../../hooks/useCart';

// Debounce hook for fast search
const useDebounce = (value, delay = 350) => {
    const [debounced, setDebounced] = useState(value);
    React.useEffect(() => {
        const timer = setTimeout(() => setDebounced(value), delay);
        return () => clearTimeout(timer);
    }, [value, delay]);
    return debounced;
};

const categories = ['All', 'Engine Parts', 'Brake Systems', 'Oils & Fluids', 'Tires & Wheels', 'Electrical', 'Accessories'];



const ProductGrid = () => {
    const { products } = useStore();
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [addingId, setAddingId] = useState(null);
    const { addToCart } = useCart();

    const debouncedSearch = useDebounce(searchTerm, 350);

    const handleAddToCart = useCallback(async (e, product) => {
        e.stopPropagation();
        const id = product.id || product._id;
        setAddingId(id);
        await addToCart(id, 1);
        setAddingId(null);
    }, [addToCart]);

    // Client-side filtering from store
    const filteredProducts = useMemo(() => {
        return products.filter((product) => {
            const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
            const term = debouncedSearch.toLowerCase();
            const matchesSearch = !term ||
                product.name.toLowerCase().includes(term) ||
                (product.compatibility && product.compatibility.toLowerCase().includes(term)) ||
                (product.sku && product.sku.toLowerCase().includes(term)) ||
                (product.barcode && product.barcode.toLowerCase().includes(term));
            return matchesCategory && matchesSearch;
        });
    }, [products, selectedCategory, debouncedSearch]);

    const loading = false; // products from store are always available

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
            background: 'rgba(20, 25, 40, 0.7)',
            border: '1px solid rgba(148, 163, 184, 0.12)',
            borderRadius: 16,
            padding: 16,
            gap: 12,
            backdropFilter: 'blur(20px)',
        }}>
            {/* Search Bar */}
            <div style={{ position: 'relative' }}>
                <span style={{
                    position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)',
                    fontSize: 14, color: 'var(--text-muted)', pointerEvents: 'none',
                }}>🔍</span>
                <input
                    type="text"
                    placeholder="Search part name, SKU, or vehicle (e.g. Civic 2020)..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    autoFocus
                    style={{
                        width: '100%',
                        padding: '10px 14px 10px 40px',
                        background: 'rgba(15, 23, 42, 0.7)',
                        border: '1px solid rgba(148, 163, 184, 0.2)',
                        borderRadius: 8,
                        color: '#f1f5f9',
                        fontSize: '0.875rem',
                        outline: 'none',
                        fontFamily: 'var(--font-family)',
                        transition: 'border-color 0.2s, box-shadow 0.2s',
                    }}
                    onFocus={e => {
                        e.target.style.borderColor = 'var(--color-primary)';
                        e.target.style.boxShadow = '0 0 0 3px rgba(129,140,248,0.15)';
                    }}
                    onBlur={e => {
                        e.target.style.borderColor = 'rgba(148,163,184,0.2)';
                        e.target.style.boxShadow = 'none';
                    }}
                />
            </div>

            {/* Category Filter Pills */}
            <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 4, flexShrink: 0 }}>
                {categories.map((cat) => (
                    <button
                        key={cat}
                        onClick={() => setSelectedCategory(cat)}
                        style={{
                            padding: '5px 12px',
                            fontSize: '0.6875rem',
                            fontWeight: 700,
                            borderRadius: 20,
                            border: '1px solid',
                            whiteSpace: 'nowrap',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            fontFamily: 'var(--font-family)',
                            ...(selectedCategory === cat ? {
                                background: 'linear-gradient(135deg, #6366f1, #818cf8)',
                                color: '#fff',
                                borderColor: '#6366f1',
                                boxShadow: '0 2px 8px rgba(99,102,241,0.35)',
                            } : {
                                background: 'rgba(15, 23, 42, 0.5)',
                                color: '#94a3b8',
                                borderColor: 'rgba(148,163,184,0.2)',
                            }),
                        }}
                    >
                        {cat}
                    </button>
                ))}
            </div>

            {/* Product Grid */}
            <div style={{ flex: 1, overflowY: 'auto', paddingRight: 2 }}>
                {loading ? (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                        <Loader />
                    </div>
                ) : filteredProducts.length === 0 ? (
                    <div style={{
                        height: '100%', display: 'flex', flexDirection: 'column',
                        alignItems: 'center', justifyContent: 'center', color: '#64748b',
                    }}>
                        <span style={{ fontSize: '2.5rem' }}>🔧</span>
                        <p style={{ marginTop: 8, fontWeight: 600, color: '#64748b' }}>No parts match your search</p>
                        <p style={{ fontSize: '0.75rem', color: '#475569', marginTop: 4 }}>Try a different keyword or category</p>
                    </div>
                ) : (
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
                        gap: 12,
                    }}>
                        {filteredProducts.map((product) => {
                            const pid = product.id || product._id;
                            const isAdding = addingId === pid;
                            const lowStock = product.quantity < 10;
                            return (
                                <div
                                    key={pid}
                                    onClick={(e) => handleAddToCart(e, product)}
                                    style={{
                                        background: 'rgba(15, 23, 42, 0.75)',
                                        border: '1px solid rgba(148, 163, 184, 0.15)',
                                        borderRadius: 12,
                                        overflow: 'hidden',
                                        cursor: 'pointer',
                                        transition: 'all 0.25s cubic-bezier(0.4,0,0.2,1)',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        opacity: isAdding ? 0.7 : 1,
                                    }}
                                    onMouseEnter={e => {
                                        e.currentTarget.style.borderColor = 'rgba(129,140,248,0.4)';
                                        e.currentTarget.style.transform = 'translateY(-2px)';
                                        e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.3), 0 0 0 1px rgba(129,140,248,0.15)';
                                    }}
                                    onMouseLeave={e => {
                                        e.currentTarget.style.borderColor = 'rgba(148,163,184,0.15)';
                                        e.currentTarget.style.transform = 'translateY(0)';
                                        e.currentTarget.style.boxShadow = 'none';
                                    }}
                                >
                                    {/* Image — fixed aspect ratio, no overflow */}
                                    <div style={{
                                        width: '100%',
                                        height: 110,
                                        overflow: 'hidden',
                                        position: 'relative',
                                        background: 'rgba(0,0,0,0.4)',
                                        flexShrink: 0,
                                    }}>
                                        <img
                                            src={formatImageUrl(product.imageUrl)}
                                            alt={product.name}
                                            loading="lazy"
                                            onError={handleImageError}
                                            style={{
                                                width: '100%',
                                                height: '100%',
                                                objectFit: 'cover',
                                                display: 'block',
                                                transition: 'transform 0.35s ease',
                                            }}
                                            onMouseEnter={e => e.target.style.transform = 'scale(1.08)'}
                                            onMouseLeave={e => e.target.style.transform = 'scale(1)'}
                                        />
                                        {/* Category badge */}
                                        <span style={{
                                            position: 'absolute', top: 6, right: 6,
                                            padding: '2px 7px',
                                            fontSize: '0.5625rem',
                                            fontWeight: 700,
                                            borderRadius: 20,
                                            background: 'rgba(0,0,0,0.75)',
                                            backdropFilter: 'blur(8px)',
                                            color: '#a5b4fc',
                                            border: '1px solid rgba(129,140,248,0.3)',
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.05em',
                                        }}>
                                            {product.category || 'Part'}
                                        </span>
                                        {/* Low stock warning */}
                                        {lowStock && (
                                            <span style={{
                                                position: 'absolute', top: 6, left: 6,
                                                padding: '2px 7px',
                                                fontSize: '0.5rem',
                                                fontWeight: 700,
                                                borderRadius: 20,
                                                background: 'rgba(248,113,113,0.85)',
                                                color: '#fff',
                                                border: '1px solid rgba(248,113,113,0.5)',
                                            }}>
                                                LOW
                                            </span>
                                        )}
                                    </div>

                                    {/* Card body */}
                                    <div style={{ padding: '10px 12px 12px', display: 'flex', flexDirection: 'column', gap: 6, flex: 1 }}>
                                        <h3 style={{
                                            fontSize: '0.8rem',
                                            fontWeight: 700,
                                            color: '#e2e8f0',
                                            lineHeight: 1.35,
                                            display: '-webkit-box',
                                            WebkitLineClamp: 2,
                                            WebkitBoxOrient: 'vertical',
                                            overflow: 'hidden',
                                            margin: 0,
                                        }}>
                                            {product.name}
                                        </h3>

                                        {product.compatibility && (
                                            <p style={{
                                                fontSize: '0.6875rem',
                                                color: '#64748b',
                                                lineHeight: 1.3,
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                                whiteSpace: 'nowrap',
                                                margin: 0,
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: 4,
                                            }}>
                                                <span>🚘</span>
                                                <span>{product.compatibility}</span>
                                            </p>
                                        )}

                                        <div style={{
                                            marginTop: 'auto',
                                            paddingTop: 8,
                                            borderTop: '1px solid rgba(148,163,184,0.1)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'space-between',
                                        }}>
                                            <div>
                                                <p style={{ fontSize: '0.625rem', color: '#64748b', margin: 0 }}>
                                                    Stock: <span style={{ color: lowStock ? '#f87171' : '#34d399', fontWeight: 700 }}>{product.quantity}</span>
                                                </p>
                                                <p style={{
                                                    fontSize: '1.0625rem',
                                                    fontWeight: 800,
                                                    color: '#818cf8',
                                                    letterSpacing: '-0.02em',
                                                    margin: 0,
                                                    lineHeight: 1.2,
                                                }}>
                                                    ${product.price ? product.price.toFixed(2) : '0.00'}
                                                </p>
                                            </div>
                                            <button
                                                onClick={(e) => handleAddToCart(e, product)}
                                                disabled={isAdding}
                                                style={{
                                                    padding: '6px 12px',
                                                    borderRadius: 20,
                                                    background: isAdding
                                                        ? 'rgba(99,102,241,0.3)'
                                                        : 'linear-gradient(135deg, #6366f1, #818cf8)',
                                                    color: '#fff',
                                                    fontSize: '0.6875rem',
                                                    fontWeight: 700,
                                                    border: 'none',
                                                    cursor: isAdding ? 'not-allowed' : 'pointer',
                                                    transition: 'all 0.2s',
                                                    whiteSpace: 'nowrap',
                                                    boxShadow: '0 2px 6px rgba(99,102,241,0.3)',
                                                }}
                                            >
                                                {isAdding ? '...' : '+ Add'}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProductGrid;
