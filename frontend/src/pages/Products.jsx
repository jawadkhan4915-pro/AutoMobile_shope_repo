import React, { useState, useEffect } from 'react';
import { productsAPI } from '../api/apiService';
import Loader from '../components/common/Loader';
import Modal from '../components/common/Modal';

const Products = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [viewMode, setViewMode] = useState('grid');
    const [selectedCategory, setSelectedCategory] = useState('All');

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentProduct, setCurrentProduct] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        barcode: '',
        price: '',
        quantity: '',
        category: 'Engine Parts',
        compatibility: 'Toyota Camry 2018-2022',
        status: true,
        imageUrl: ''
    });

    const defaultProductsList = [
        { _id: '1', name: 'Brembo Ceramic Brake Pads (Front)', barcode: 'BP-8802', price: 85.00, quantity: 18, category: 'Brake Systems', compatibility: 'Toyota Camry, Honda Accord 2018-2022', status: true, imageUrl: 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=400' },
        { _id: '2', name: 'Castrol Edge 5W-30 Full Synthetic Oil (5L)', barcode: 'OL-5590', price: 45.00, quantity: 45, category: 'Oils & Fluids', compatibility: 'Universal Gasoline & Hybrid Engines', status: true, imageUrl: 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=400' },
        { _id: '3', name: 'Bosch Iridium Spark Plug Set (4pcs)', barcode: 'SP-9912', price: 48.00, quantity: 4, category: 'Engine Parts', compatibility: 'Ford F-150, Chevy Silverado 2015-2021', status: true, imageUrl: 'https://images.unsplash.com/photo-1486006920555-c77dce18193b?w=400' },
        { _id: '4', name: 'Michelin Pilot Sport 4S Tire 245/40R18', barcode: 'TR-4018', price: 240.00, quantity: 12, category: 'Tires & Wheels', compatibility: 'BMW 3-Series, Audi A4, Mercedes C-Class', status: true, imageUrl: 'https://images.unsplash.com/photo-1578844251758-2f71da64c96f?w=400' },
        { _id: '5', name: 'Optima RedTop AGM High-Performance Battery', barcode: 'BT-1090', price: 220.00, quantity: 8, category: 'Electrical', compatibility: 'Trucks, SUVs, Heavy Duty Commercial', status: true, imageUrl: 'https://images.unsplash.com/photo-1558441719-67450807e98a?w=400' },
        { _id: '6', name: 'K&N High-Flow Air Filter Drop-In', barcode: 'AF-3320', price: 62.00, quantity: 24, category: 'Engine Parts', compatibility: 'Nissan GT-R, 370Z, Infiniti Q50', status: true, imageUrl: 'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?w=400' },
    ];

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            const response = await productsAPI.getAll({ limit: 100 });
            if (response.data?.data && response.data.data.length > 0) {
                setProducts(response.data.data);
            } else {
                setProducts(defaultProductsList);
            }
        } catch (error) {
            console.error('Failed to fetch products, using fallback list', error);
            setProducts(defaultProductsList);
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
                category: product.category || 'Engine Parts',
                compatibility: product.compatibility || '',
                status: product.status,
                imageUrl: product.imageUrl || ''
            });
        } else {
            setCurrentProduct(null);
            setFormData({
                name: '',
                barcode: `SKU-${Math.floor(1000 + Math.random() * 9000)}`,
                price: '',
                quantity: '',
                category: 'Engine Parts',
                compatibility: 'Toyota Camry 2018-2022',
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
            if (currentProduct) {
                setProducts(prev => prev.map(p => p._id === currentProduct._id ? { ...p, ...formData, price: parseFloat(formData.price), quantity: parseInt(formData.quantity) } : p));
            } else {
                const newProd = {
                    _id: Date.now().toString(),
                    ...formData,
                    price: parseFloat(formData.price),
                    quantity: parseInt(formData.quantity)
                };
                setProducts(prev => [newProd, ...prev]);
            }
            handleCloseModal();
        } catch (error) {
            console.error('Failed to save product', error);
        }
    };

    const handleDeleteProduct = (id) => {
        if (window.confirm('Are you sure you want to remove this product?')) {
            setProducts(prev => prev.filter(p => p._id !== id));
        }
    };

    const filteredProducts = products.filter(product => {
        const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
        const matchesSearch = `${product.name} ${product.barcode} ${product.compatibility || ''}`
            .toLowerCase()
            .includes(searchTerm.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    const lowStockCount = products.filter(p => p.quantity < 10).length;

    if (loading) return <Loader />;

    return (
        <div className="animate-fade-in p-2 md:p-6 space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 glass-panel p-6">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold mb-1" style={{ color: 'var(--color-primary)' }}>
                        Auto Parts & Inventory Catalog
                    </h1>
                    <p className="text-sm text-muted">
                        Track stock levels, vehicle compatibility, SKUs, and product pricing.
                    </p>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    className="btn btn-primary hover-glow flex items-center gap-2"
                >
                    <span>➕</span> Add Spare Part
                </button>
            </div>

            {/* Low Stock Warning Banner */}
            {lowStockCount > 0 && (
                <div className="p-4 rounded-lg flex items-center justify-between border" style={{ background: 'rgba(255, 0, 85, 0.1)', borderColor: 'rgba(255, 0, 85, 0.3)' }}>
                    <div className="flex items-center gap-3">
                        <span className="text-xl">⚠️</span>
                        <div>
                            <p className="font-bold text-danger text-sm">Low Stock Alert ({lowStockCount} items)</p>
                            <p className="text-xs text-muted">Some auto parts are running below safety threshold (10 units).</p>
                        </div>
                    </div>
                    <button 
                        onClick={() => setSearchTerm('')} 
                        className="btn btn-sm btn-danger"
                    >
                        View Items
                    </button>
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
                    {['All', 'Brake Systems', 'Engine Parts', 'Oils & Fluids', 'Tires & Wheels', 'Electrical'].map((cat) => (
                        <button
                            key={cat}
                            onClick={() => setSelectedCategory(cat)}
                            className={`px-3 py-1.5 text-xs font-semibold rounded-full transition-all whitespace-nowrap border ${
                                selectedCategory === cat
                                    ? 'bg-primary text-black border-primary font-bold'
                                    : 'bg-panel text-muted border-glass hover:text-white'
                            }`}
                            style={selectedCategory === cat ? { background: 'var(--color-primary)' } : {}}
                        >
                            {cat}
                        </button>
                    ))}

                    <div className="ml-auto flex gap-1 border border-glass rounded-lg p-1 bg-black/30">
                        <button
                            onClick={() => setViewMode('grid')}
                            className={`p-1.5 text-xs rounded ${viewMode === 'grid' ? 'bg-primary text-black font-bold' : 'text-muted'}`}
                            style={viewMode === 'grid' ? { background: 'var(--color-primary)' } : {}}
                        >
                            ⊞
                        </button>
                        <button
                            onClick={() => setViewMode('table')}
                            className={`p-1.5 text-xs rounded ${viewMode === 'table' ? 'bg-primary text-black font-bold' : 'text-muted'}`}
                            style={viewMode === 'table' ? { background: 'var(--color-primary)' } : {}}
                        >
                            ☰
                        </button>
                    </div>
                </div>
            </div>

            {/* Inventory Display Grid/Table */}
            {viewMode === 'grid' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredProducts.map((product) => (
                        <div key={product._id} className="card hover-lift group flex flex-col justify-between">
                            <div>
                                <div className="relative h-44 rounded-t-lg overflow-hidden bg-black/40 mb-3 border border-glass">
                                    <img 
                                        src={product.imageUrl || 'https://images.unsplash.com/photo-1486006920555-c77dce18193b?w=400'} 
                                        alt={product.name} 
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                        onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1486006920555-c77dce18193b?w=400'; }}
                                    />
                                    <span className="absolute top-2 left-2 badge badge-success">
                                        {product.category || 'Spare Part'}
                                    </span>
                                    <span className={`absolute top-2 right-2 badge ${product.quantity < 10 ? 'badge-danger' : 'badge-success'}`}>
                                        {product.quantity < 10 ? 'Low Stock' : 'In Stock'}
                                    </span>
                                </div>

                                <h3 className="font-bold text-base text-white line-clamp-1 mb-1">{product.name}</h3>
                                <p className="text-xs font-mono text-muted mb-2">SKU: {product.barcode}</p>

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
                                        <p className={`font-extrabold ${product.quantity < 10 ? 'text-danger' : 'text-success'}`}>
                                            {product.quantity} units
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs text-muted">Unit Price</p>
                                        <p className="text-lg font-bold text-primary">${product.price?.toFixed(2)}</p>
                                    </div>
                                </div>

                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleOpenModal(product)}
                                        className="btn btn-sm btn-outline flex-1"
                                    >
                                        ✏️ Edit
                                    </button>
                                    <button 
                                        onClick={() => handleDeleteProduct(product._id)}
                                        className="btn btn-sm btn-danger px-3"
                                    >
                                        🗑️
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="card">
                    <div className="table-container">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>Part Details</th>
                                    <th>Category</th>
                                    <th>Vehicle Compatibility</th>
                                    <th>Price</th>
                                    <th>Stock Level</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredProducts.map((product) => (
                                    <tr key={product._id}>
                                        <td>
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded bg-white/10 overflow-hidden flex-shrink-0">
                                                    <img src={product.imageUrl || 'https://images.unsplash.com/photo-1486006920555-c77dce18193b?w=100'} className="w-full h-full object-cover" />
                                                </div>
                                                <div>
                                                    <div className="font-bold text-white">{product.name}</div>
                                                    <div className="text-xs text-muted font-mono">{product.barcode}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td><span className="badge badge-success">{product.category || 'General'}</span></td>
                                        <td className="text-xs text-muted">{product.compatibility || 'Universal'}</td>
                                        <td className="font-bold text-primary">${product.price?.toFixed(2)}</td>
                                        <td>
                                            <span className={`font-bold ${product.quantity < 10 ? 'text-danger' : 'text-success'}`}>
                                                {product.quantity} units
                                            </span>
                                        </td>
                                        <td>
                                            <div className="flex gap-2">
                                                <button onClick={() => handleOpenModal(product)} className="text-primary hover:text-white">✏️</button>
                                                <button onClick={() => handleDeleteProduct(product._id)} className="text-danger hover:text-white">🗑️</button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                title={currentProduct ? "Edit Auto Part" : "Add New Auto Part"}
                footer={
                    <>
                        <button onClick={handleCloseModal} className="btn btn-secondary">Cancel</button>
                        <button onClick={handleSubmit} className="btn btn-primary">
                            {currentProduct ? "Update Product" : "Save Product"}
                        </button>
                    </>
                }
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="form-label">Part Name</label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            className="form-input"
                            required
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="form-label">SKU / Barcode</label>
                            <input
                                type="text"
                                name="barcode"
                                value={formData.barcode}
                                onChange={handleInputChange}
                                className="form-input"
                                required
                            />
                        </div>
                        <div>
                            <label className="form-label">Category</label>
                            <select
                                name="category"
                                value={formData.category}
                                onChange={handleInputChange}
                                className="form-input"
                            >
                                <option value="Brake Systems">Brake Systems</option>
                                <option value="Engine Parts">Engine Parts</option>
                                <option value="Oils & Fluids">Oils & Fluids</option>
                                <option value="Tires & Wheels">Tires & Wheels</option>
                                <option value="Electrical">Electrical</option>
                                <option value="Accessories">Accessories</option>
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="form-label">Price ($)</label>
                            <input
                                type="number"
                                step="0.01"
                                name="price"
                                value={formData.price}
                                onChange={handleInputChange}
                                className="form-input"
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
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="form-label">Vehicle Fitment / Compatibility</label>
                        <input
                            type="text"
                            name="compatibility"
                            value={formData.compatibility}
                            onChange={handleInputChange}
                            className="form-input"
                            placeholder="e.g. Honda Civic 2016-2021, Toyota Corolla"
                        />
                    </div>

                    <div>
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
                </form>
            </Modal>
        </div>
    );
};

export default Products;
