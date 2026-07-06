import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { useAuth } from '../hooks/useAuth';
import Modal from '../components/common/Modal';
import { formatImageUrl, handleImageError } from '../store/dataHelpers';

const CATEGORIES = ['Engine Parts', 'Brake Systems', 'Oils & Fluids', 'Tires & Wheels', 'Electrical', 'Accessories'];

const Products = () => {
    const { isOwner } = useAuth();
    const { products, addProduct, updateProduct, deleteProduct } = useStore();

    const [searchTerm, setSearchTerm] = useState('');
    const [viewMode, setViewMode] = useState('grid');
    const [selectedCategory, setSelectedCategory] = useState('All');

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentProduct, setCurrentProduct] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        sku: '',
        price: '',
        costPrice: '',
        quantity: '',
        category: 'Engine Parts',
        compatibility: '',
        imageUrl: ''
    });

    const handleOpenModal = (product = null) => {
        if (product) {
            setCurrentProduct(product);
            setFormData({
                name: product.name,
                sku: product.sku || product.barcode || '',
                price: product.price,
                costPrice: product.costPrice || (product.price * 0.65).toFixed(2),
                quantity: product.quantity,
                category: product.category || 'Engine Parts',
                compatibility: product.compatibility || '',
                imageUrl: product.imageUrl || ''
            });
        } else {
            setCurrentProduct(null);
            setFormData({
                name: '',
                sku: `SKU-${Math.floor(1000 + Math.random() * 9000)}`,
                price: '',
                costPrice: '',
                quantity: '',
                category: 'Engine Parts',
                compatibility: '',
                imageUrl: ''
            });
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setCurrentProduct(null);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const payload = {
            ...formData,
            price: parseFloat(formData.price) || 0,
            costPrice: parseFloat(formData.costPrice) || parseFloat(formData.price) * 0.65,
            quantity: parseInt(formData.quantity) || 0,
        };
        if (currentProduct) {
            updateProduct(currentProduct._id, payload);
        } else {
            addProduct(payload);
        }
        handleCloseModal();
    };

    const handleDeleteProduct = (id) => {
        if (window.confirm('Remove this product from inventory?')) {
            deleteProduct(id);
        }
    };

    const filteredProducts = products.filter(product => {
        const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
        const matchesSearch = `${product.name} ${product.sku || ''} ${product.barcode || ''} ${product.compatibility || ''}`
            .toLowerCase()
            .includes(searchTerm.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    const lowStockCount = products.filter(p => p.quantity <= 5).length;

    return (
        <div className="animate-fade-in p-2 md:p-6 space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 glass-panel p-6">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold mb-1" style={{ color: 'var(--color-primary)' }}>
                        Auto Parts &amp; Inventory Catalog
                    </h1>
                    <p className="text-sm text-muted">
                        {products.length} products · Track stock, compatibility, SKUs, and pricing.
                    </p>
                </div>
                {isOwner && (
                    <button
                        onClick={() => handleOpenModal()}
                        className="btn btn-primary hover-glow flex items-center gap-2"
                    >
                        <span>➕</span> Add Spare Part
                    </button>
                )}
            </div>

            {/* Low Stock Warning Banner */}
            {lowStockCount > 0 && (
                <div className="p-4 rounded-lg flex items-center justify-between border"
                    style={{ background: 'rgba(248,113,113,0.08)', borderColor: 'rgba(248,113,113,0.25)' }}>
                    <div className="flex items-center gap-3">
                        <span className="text-xl">⚠️</span>
                        <div>
                            <p className="font-bold text-sm" style={{ color: '#f87171' }}>
                                Low Stock Alert ({lowStockCount} items)
                            </p>
                            <p className="text-xs text-muted">Parts running below safety threshold (5 units).</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Controls & Category Filters */}
            <div className="glass-panel p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="relative w-full md:w-96">
                    <span className="absolute left-3 top-3 text-muted">🔍</span>
                    <input
                        type="text"
                        placeholder="Search part name, SKU, or vehicle model..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="form-input pl-10 mb-0"
                    />
                </div>

                <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto">
                    {['All', ...CATEGORIES].map((cat) => (
                        <button
                            key={cat}
                            onClick={() => setSelectedCategory(cat)}
                            className={`px-3 py-1.5 text-xs font-semibold rounded-full transition-all whitespace-nowrap border ${selectedCategory === cat
                                ? 'text-white border-indigo-500'
                                : 'bg-panel text-muted border-glass hover:text-white'
                                }`}
                            style={selectedCategory === cat ? { background: 'linear-gradient(135deg,#6366f1,#818cf8)', borderColor: '#6366f1' } : {}}
                        >
                            {cat}
                        </button>
                    ))}

                    <div className="ml-auto flex gap-1 border border-glass rounded-lg p-1 bg-black/30">
                        <button
                            onClick={() => setViewMode('grid')}
                            className={`p-1.5 text-xs rounded ${viewMode === 'grid' ? 'text-white' : 'text-muted'}`}
                            style={viewMode === 'grid' ? { background: 'linear-gradient(135deg,#6366f1,#818cf8)' } : {}}
                        >⊞</button>
                        <button
                            onClick={() => setViewMode('table')}
                            className={`p-1.5 text-xs rounded ${viewMode === 'table' ? 'text-white' : 'text-muted'}`}
                            style={viewMode === 'table' ? { background: 'linear-gradient(135deg,#6366f1,#818cf8)' } : {}}
                        >☰</button>
                    </div>
                </div>
            </div>

            {/* Grid View */}
            {viewMode === 'grid' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredProducts.map((product) => (
                        <div key={product._id} className="card hover-lift group flex flex-col justify-between">
                            <div>
                                <div className="relative overflow-hidden bg-black/40 mb-3 border border-glass" style={{ height: 130, borderRadius: '8px 8px 0 0' }}>
                                    <img
                                        src={formatImageUrl(product.imageUrl)}
                                        alt={product.name}
                                        loading="lazy"
                                        style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.3s' }}
                                        className="group-hover:scale-105"
                                        onError={handleImageError}
                                    />
                                    <span className="absolute top-2 left-2 badge badge-success" style={{ fontSize: '0.55rem' }}>
                                        {product.category || 'Spare Part'}
                                    </span>
                                    <span className={`absolute top-2 right-2 badge`}
                                        style={{
                                            fontSize: '0.55rem',
                                            background: product.quantity === 0 ? 'rgba(248,113,113,0.2)' : product.quantity <= 5 ? 'rgba(251,191,36,0.2)' : 'rgba(52,211,153,0.15)',
                                            color: product.quantity === 0 ? '#f87171' : product.quantity <= 5 ? '#fbbf24' : '#34d399',
                                            border: `1px solid ${product.quantity === 0 ? 'rgba(248,113,113,0.3)' : product.quantity <= 5 ? 'rgba(251,191,36,0.3)' : 'rgba(52,211,153,0.3)'}`,
                                        }}>
                                        {product.quantity === 0 ? '● OUT' : product.quantity <= 5 ? '● LOW' : '● IN STOCK'}
                                    </span>
                                </div>

                                <h3 className="font-bold text-base text-white line-clamp-1 mb-1">{product.name}</h3>
                                <p className="text-xs font-mono text-muted mb-2">SKU: {product.sku || product.barcode}</p>

                                {product.compatibility && (
                                    <p className="text-xs text-muted mb-3 bg-white/5 p-2 rounded border border-glass flex items-center gap-1">
                                        <span>🚘</span> <span className="line-clamp-1">{product.compatibility}</span>
                                    </p>
                                )}
                            </div>

                            <div>
                                <div className="flex justify-between items-center pt-2 border-t border-glass mb-3">
                                    <div>
                                        <p className="text-xs text-muted">Stock Qty</p>
                                        <p className="font-extrabold" style={{ color: product.quantity === 0 ? '#f87171' : product.quantity <= 5 ? '#fbbf24' : '#34d399' }}>
                                            {product.quantity} units
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs text-muted">Unit Price</p>
                                        <p className="text-lg font-bold" style={{ color: 'var(--color-primary)' }}>${product.price?.toFixed(2)}</p>
                                    </div>
                                </div>

                                {isOwner && (
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleOpenModal(product)}
                                            className="btn btn-sm btn-outline flex-1"
                                        >✏️ Edit</button>
                                        <button
                                            onClick={() => handleDeleteProduct(product._id)}
                                            className="btn btn-sm btn-danger px-3"
                                        >🗑️</button>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                    {filteredProducts.length === 0 && (
                        <div className="col-span-full text-center py-16" style={{ color: '#475569' }}>
                            <p style={{ fontSize: '3rem' }}>🔧</p>
                            <p>No parts found matching your search</p>
                        </div>
                    )}
                </div>
            ) : (
                <div className="card">
                    <div className="table-container">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>Part Details</th>
                                    <th>Category</th>
                                    <th>Compatibility</th>
                                    <th>Cost</th>
                                    <th>Price</th>
                                    <th>Stock</th>
                                    {isOwner && <th>Actions</th>}
                                </tr>
                            </thead>
                            <tbody>
                                {filteredProducts.map((product) => (
                                    <tr key={product._id}>
                                        <td>
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded bg-white/10 overflow-hidden flex-shrink-0">
                                                    <img
                                                        src={formatImageUrl(product.imageUrl)}
                                                        className="w-full h-full object-cover"
                                                        loading="lazy"
                                                        alt={product.name}
                                                        onError={handleImageError}
                                                    />
                                                </div>
                                                <div>
                                                    <div className="font-bold text-white">{product.name}</div>
                                                    <div className="text-xs text-muted font-mono">{product.sku || product.barcode}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td><span className="badge badge-success">{product.category || 'General'}</span></td>
                                        <td className="text-xs text-muted">{product.compatibility || 'Universal'}</td>
                                        <td className="font-mono text-sm" style={{ color: '#64748b' }}>${(product.costPrice || product.price * 0.65).toFixed(2)}</td>
                                        <td className="font-bold" style={{ color: 'var(--color-primary)' }}>${product.price?.toFixed(2)}</td>
                                        <td>
                                            <span className="font-bold" style={{ color: product.quantity === 0 ? '#f87171' : product.quantity <= 5 ? '#fbbf24' : '#34d399' }}>
                                                {product.quantity} units
                                            </span>
                                        </td>
                                        {isOwner && (
                                            <td>
                                                <div className="flex gap-2">
                                                    <button onClick={() => handleOpenModal(product)} className="text-primary hover:text-white">✏️</button>
                                                    <button onClick={() => handleDeleteProduct(product._id)} className="text-danger hover:text-white">🗑️</button>
                                                </div>
                                            </td>
                                        )}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {filteredProducts.length === 0 && (
                            <div className="text-center py-16" style={{ color: '#475569' }}>
                                <p style={{ fontSize: '3rem' }}>🔧</p>
                                <p>No parts found</p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Add/Edit Modal */}
            {isOwner && (
                <Modal
                    isOpen={isModalOpen}
                    onClose={handleCloseModal}
                    title={currentProduct ? 'Edit Auto Part' : 'Add New Auto Part'}
                    footer={
                        <>
                            <button onClick={handleCloseModal} className="btn btn-secondary">Cancel</button>
                            <button onClick={handleSubmit} className="btn btn-primary">
                                {currentProduct ? 'Update Product' : 'Save Product'}
                            </button>
                        </>
                    }
                >
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="form-label">Part Name</label>
                            <input type="text" name="name" value={formData.name} onChange={handleInputChange} className="form-input" required />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="form-label">SKU / Barcode</label>
                                <input type="text" name="sku" value={formData.sku} onChange={handleInputChange} className="form-input" required />
                            </div>
                            <div>
                                <label className="form-label">Category</label>
                                <select name="category" value={formData.category} onChange={handleInputChange} className="form-input">
                                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </div>
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                            <div>
                                <label className="form-label">Sell Price ($)</label>
                                <input type="number" step="0.01" name="price" value={formData.price} onChange={handleInputChange} className="form-input" required />
                            </div>
                            <div>
                                <label className="form-label">Cost Price ($)</label>
                                <input type="number" step="0.01" name="costPrice" value={formData.costPrice} onChange={handleInputChange} className="form-input" placeholder="Auto-calculated" />
                            </div>
                            <div>
                                <label className="form-label">Quantity</label>
                                <input type="number" name="quantity" value={formData.quantity} onChange={handleInputChange} className="form-input" required />
                            </div>
                        </div>
                        <div>
                            <label className="form-label">Vehicle Fitment / Compatibility</label>
                            <input type="text" name="compatibility" value={formData.compatibility} onChange={handleInputChange} className="form-input" placeholder="e.g. Honda Civic 2016-2021, Toyota Corolla" />
                        </div>
                        <div>
                            <label className="form-label">Image URL</label>
                            <input type="text" name="imageUrl" value={formData.imageUrl} onChange={handleInputChange} className="form-input" placeholder="https://..." />
                            {formData.imageUrl && (
                                <img
                                    src={formatImageUrl(formData.imageUrl)}
                                    alt="Preview"
                                    onError={handleImageError}
                                    style={{ width: '100%', height: 80, objectFit: 'cover', borderRadius: 8, marginTop: 8 }}
                                />
                            )}
                        </div>
                    </form>
                </Modal>
            )}
        </div>
    );
};

export default Products;
