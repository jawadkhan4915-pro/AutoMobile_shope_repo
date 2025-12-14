import React, { useState, useEffect } from 'react';
import { productsAPI } from '../api/apiService';
import Loader from '../components/common/Loader';
import Modal from '../components/common/Modal';

const Products = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [viewMode, setViewMode] = useState('grid');

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentProduct, setCurrentProduct] = useState(null); // null = add mode, object = edit mode
    const [formData, setFormData] = useState({
        name: '',
        barcode: '',
        price: '',
        quantity: '',
        status: true,
        imageUrl: '' // In a real app this would be a file upload
    });

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

    const handleOpenModal = (product = null) => {
        if (product) {
            setCurrentProduct(product);
            setFormData({
                name: product.name,
                barcode: product.barcode,
                price: product.price,
                quantity: product.quantity,
                status: product.status,
                imageUrl: product.imageUrl || ''
            });
        } else {
            setCurrentProduct(null);
            setFormData({
                name: '',
                barcode: '',
                price: '',
                quantity: '',
                status: true,
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
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // NOTE: In a real app, validate data here
            if (currentProduct) {
                // Edit Logic (Mock API call if not fully implemented in backend yet for this edit)
                // await productsAPI.update(currentProduct._id, formData);
                console.log('Update product:', currentProduct._id, formData);

                // Optimistic UI update
                setProducts(prev => prev.map(p => p._id === currentProduct._id ? { ...p, ...formData } : p));
            } else {
                // Add Logic
                // await productsAPI.create(formData);
                console.log('Create product:', formData);

                // Optimistic UI update for demo purposes
                setProducts(prev => [...prev, { _id: Date.now().toString(), ...formData }]);
            }
            handleCloseModal();
        } catch (error) {
            console.error('Failed to save product', error);
            // Show error notification
        }
    };

    const filteredProducts = products.filter(product =>
        `${product.name} ${product.barcode} ${product.description || ''}`
            .toLowerCase()
            .includes(searchTerm.toLowerCase())
    );

    const totalValue = products.reduce((sum, p) => sum + (p.price * p.quantity), 0);

    if (loading) return <Loader />;

    return (
        <div className="animate-fade-in p-2">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 animate-slide-in-down">
                <div>
                    <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-purple-600"
                        style={{
                            background: 'linear-gradient(135deg, var(--color-primary), var(--color-accent))',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent'
                        }}>
                        Products Inventory
                    </h1>
                    <p className="text-muted mt-1">Manage stock and product details</p>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    className="btn btn-primary hover-glow flex items-center gap-2"
                >
                    <span className="text-xl">+</span> Add New Product
                </button>
            </div>

            {/* Filter & View Controls */}
            <div className="glass-panel p-4 mb-6 flex flex-col md:flex-row gap-4 items-center justify-between animate-slide-in-up stagger-1">
                <div className="relative w-full md:w-96">
                    <input
                        type="text"
                        placeholder="Search by name, barcode..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="form-input mb-0"
                        style={{ paddingLeft: '40px' }}
                    />
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted">🔍</span>
                </div>

                <div className="flex gap-2">
                    <button
                        onClick={() => setViewMode('grid')}
                        className={`btn ${viewMode === 'grid' ? 'btn-primary' : 'btn-secondary'}`}
                    >
                        ⊞ Grid
                    </button>
                    <button
                        onClick={() => setViewMode('table')}
                        className={`btn ${viewMode === 'table' ? 'btn-primary' : 'btn-secondary'}`}
                    >
                        ☰ Table
                    </button>
                </div>
            </div>

            {/* Content */}
            {viewMode === 'grid' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredProducts.map((product, index) => (
                        <div key={product._id || index} className="card hover-lift group animate-scale-in" style={{ animationDelay: `${index * 0.05}s` }}>
                            <div className="relative h-48 bg-gradient-to-br from-gray-800 to-gray-900 rounded-t-lg overflow-hidden flex items-center justify-center">
                                {/* Image Placeholder */}
                                {product.imageUrl ? (
                                    <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                                ) : (
                                    <div className="text-6xl opacity-50">📦</div>
                                )}
                                <span className={`absolute top-2 right-2 badge ${product.status ? 'badge-success' : 'badge-danger'}`}>
                                    {product.status ? 'Active' : 'Inactive'}
                                </span>
                            </div>

                            <div className="p-4">
                                <h3 className="font-bold text-lg mb-1 truncate" title={product.name}>{product.name}</h3>
                                <div className="flex justify-between items-center mb-4">
                                    <span className="font-mono text-xs text-muted">#{product.barcode}</span>
                                    <span className="text-xl font-bold text-primary">${product.price?.toFixed(2)}</span>
                                </div>

                                <div className="flex justify-between text-sm mb-4 p-2 bg-white/5 rounded-lg border border-white/5">
                                    <div className="text-center">
                                        <div className="text-xs text-muted">Stock</div>
                                        <div className={`font-bold ${product.quantity < 10 ? 'text-danger' : 'text-success'}`} style={{ color: product.quantity < 10 ? 'var(--color-danger)' : 'var(--color-success)' }}>
                                            {product.quantity}
                                        </div>
                                    </div>
                                    <div className="w-px bg-white/10"></div>
                                    <div className="text-center">
                                        <div className="text-xs text-muted">Value</div>
                                        <div className="font-bold text-white">${(product.price * product.quantity).toFixed(0)}</div>
                                    </div>
                                </div>

                                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity translate-y-2 group-hover:translate-y-0">
                                    <button
                                        onClick={() => handleOpenModal(product)}
                                        className="btn btn-sm btn-outline flex-1"
                                    >
                                        Edit
                                    </button>
                                    <button className="btn btn-sm btn-danger px-3">
                                        🗑️
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="card animate-slide-in-up">
                    <div className="table-container">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>Product Info</th>
                                    <th>Price</th>
                                    <th>Inventory</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredProducts.map((product) => (
                                    <tr key={product._id} className="hover:bg-white/5">
                                        <td>
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded bg-white/10 flex items-center justify-center">
                                                    {product.imageUrl ? <img src={product.imageUrl} className="w-full h-full object-cover rounded" /> : '📦'}
                                                </div>
                                                <div>
                                                    <div className="font-semibold">{product.name}</div>
                                                    <div className="text-xs text-muted font-mono">{product.barcode}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="font-bold text-primary">${product.price?.toFixed(2)}</td>
                                        <td>
                                            <span className={`${product.quantity < 10 ? 'text-danger' : 'text-success'}`}>{product.quantity} units</span>
                                        </td>
                                        <td>
                                            <span className={`badge ${product.status ? 'badge-success' : 'badge-danger'}`}>
                                                {product.status ? 'Active' : 'Hidden'}
                                            </span>
                                        </td>
                                        <td>
                                            <div className="flex gap-2">
                                                <button onClick={() => handleOpenModal(product)} className="text-primary hover:text-white transition-colors">✏️</button>
                                                <button className="text-danger hover:text-white transition-colors">🗑️</button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Add/Edit Product Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                title={currentProduct ? "Edit Product" : "Add New Product"}
                footer={
                    <>
                        <button onClick={handleCloseModal} className="btn btn-secondary">Cancel</button>
                        <button onClick={handleSubmit} className="btn btn-primary">
                            {currentProduct ? "Update Product" : "Create Product"}
                        </button>
                    </>
                }
            >
                <form id="productForm" onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-2">
                            <label className="form-label">Product Name</label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleInputChange}
                                className="form-input"
                                placeholder="e.g. Brake Pads"
                                required
                            />
                        </div>
                        <div>
                            <label className="form-label">Barcode / SKU</label>
                            <input
                                type="text"
                                name="barcode"
                                value={formData.barcode}
                                onChange={handleInputChange}
                                className="form-input"
                                placeholder="e.g. 12345678"
                                required
                            />
                        </div>
                        <div>
                            <label className="form-label">Price ($)</label>
                            <input
                                type="number"
                                name="price"
                                value={formData.price}
                                onChange={handleInputChange}
                                className="form-input"
                                placeholder="0.00"
                                min="0"
                                step="0.01"
                                required
                            />
                        </div>
                        <div>
                            <label className="form-label">Quantity</label>
                            <input
                                type="number"
                                name="quantity"
                                value={formData.quantity}
                                onChange={handleInputChange}
                                className="form-input"
                                placeholder="0"
                                min="0"
                                required
                            />
                        </div>
                        <div>
                            <label className="form-label">Status</label>
                            <select
                                name="status"
                                value={formData.status}
                                onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value === 'true' }))}
                                className="form-input"
                            >
                                <option value="true">Active (For Sale)</option>
                                <option value="false">Inactive (Hidden)</option>
                            </select>
                        </div>
                        <div className="col-span-2">
                            <label className="form-label">Image URL</label>
                            <input
                                type="text"
                                name="imageUrl"
                                value={formData.imageUrl}
                                onChange={handleInputChange}
                                className="form-input"
                                placeholder="https://..."
                            />
                        </div>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default Products;
