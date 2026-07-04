import React, { useState, useEffect } from 'react';
import { productsAPI } from '../../api/apiService';
import Loader from '../common/Loader';
import { useCart } from '../../hooks/useCart';

const ProductGrid = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const { addToCart } = useCart();

    const categories = ['All', 'Engine Parts', 'Brake Systems', 'Oils & Fluids', 'Tires & Wheels', 'Electrical', 'Accessories'];

    // Mock initial auto products if backend returns empty
    const defaultAutoProducts = [
        { id: '1', name: 'Brembo Ceramic Brake Pads (Front)', price: 85.00, quantity: 18, category: 'Brake Systems', compatibility: 'Toyota Camry, Honda Accord 2018-2022', imageUrl: 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=300&auto=format&fit=crop' },
        { id: '2', name: 'Castrol Edge 5W-30 Full Synthetic Oil (5L)', price: 45.00, quantity: 45, category: 'Oils & Fluids', compatibility: 'Universal Gasoline & Hybrid Engines', imageUrl: 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=300&auto=format&fit=crop' },
        { id: '3', name: 'Bosch Iridium Spark Plug Set (4pcs)', price: 48.00, quantity: 32, category: 'Engine Parts', compatibility: 'Ford F-150, Chevy Silverado 2015-2021', imageUrl: 'https://images.unsplash.com/photo-1486006920555-c77dce18193b?w=300&auto=format&fit=crop' },
        { id: '4', name: 'Michelin Pilot Sport 4S Tire 245/40R18', price: 240.00, quantity: 12, category: 'Tires & Wheels', compatibility: 'BMW 3-Series, Audi A4, Mercedes C-Class', imageUrl: 'https://images.unsplash.com/photo-1578844251758-2f71da64c96f?w=300&auto=format&fit=crop' },
        { id: '5', name: 'Optima RedTop AGM High-Performance Battery', price: 220.00, quantity: 8, category: 'Electrical', compatibility: 'Trucks, SUVs, Heavy Duty Commercial', imageUrl: 'https://images.unsplash.com/photo-1558441719-67450807e98a?w=300&auto=format&fit=crop' },
        { id: '6', name: 'K&N High-Flow Air Filter Drop-In', price: 62.00, quantity: 24, category: 'Engine Parts', compatibility: 'Nissan GT-R, 370Z, Infiniti Q50', imageUrl: 'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?w=300&auto=format&fit=crop' },
    ];

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async (search = '') => {
        try {
            setLoading(true);
            const response = await productsAPI.getAll({ search, limit: 100, status: true });
            if (response.data?.data && response.data.data.length > 0) {
                setProducts(response.data.data);
            } else {
                setProducts(defaultAutoProducts);
            }
        } catch (error) {
            console.error('Failed to fetch products, using default auto catalog:', error);
            setProducts(defaultAutoProducts);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e) => {
        const term = e.target.value;
        setSearchTerm(term);
        fetchProducts(term);
    };

    const handleAddToCart = async (product) => {
        await addToCart(product.id || product._id, 1);
    };

    const filteredProducts = products.filter((product) => {
        const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
        const matchesSearch = !searchTerm || 
            product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (product.compatibility && product.compatibility.toLowerCase().includes(searchTerm.toLowerCase()));
        return matchesCategory && matchesSearch;
    });

    return (
        <div className="flex flex-col h-full glass-panel p-4 space-y-4">
            {/* Search Bar & Fitment Filter */}
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                    <span className="absolute left-3 top-3 text-muted">🔍</span>
                    <input
                        type="text"
                        placeholder="Search part name, SKU, or vehicle compatibility (e.g. Civic 2020)..."
                        className="form-input pl-10 mb-0"
                        value={searchTerm}
                        onChange={handleSearch}
                        autoFocus
                    />
                </div>
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
                {categories.map((cat) => (
                    <button
                        key={cat}
                        onClick={() => setSelectedCategory(cat)}
                        className={`px-3 py-1.5 text-xs font-semibold rounded-full transition-all whitespace-nowrap border ${
                            selectedCategory === cat
                                ? 'bg-primary text-black border-primary font-bold shadow-lg'
                                : 'bg-panel text-muted border-glass hover:text-white hover:border-primary/50'
                        }`}
                        style={selectedCategory === cat ? { background: 'var(--color-primary)' } : {}}
                    >
                        {cat}
                    </button>
                ))}
            </div>

            {/* Product Cards Grid */}
            <div className="flex-1 overflow-y-auto pr-1">
                {loading ? (
                    <Loader />
                ) : filteredProducts.length === 0 ? (
                    <div className="h-64 flex flex-col items-center justify-center text-muted">
                        <span style={{ fontSize: '2.5rem' }}>🔧</span>
                        <p className="mt-2 font-semibold">No automotive components match your search</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-4">
                        {filteredProducts.map((product) => (
                            <div
                                key={product.id || product._id}
                                className="glass-card hover-lift p-3 rounded-lg border border-glass flex flex-col justify-between cursor-pointer group transition-all"
                                style={{ background: 'rgba(20, 25, 40, 0.7)' }}
                                onClick={() => handleAddToCart(product)}
                            >
                                <div>
                                    <div className="relative h-32 w-full rounded-md overflow-hidden bg-black/40 mb-3 border border-glass">
                                        <img
                                            src={product.imageUrl || 'https://images.unsplash.com/photo-1486006920555-c77dce18193b?w=300'}
                                            alt={product.name}
                                            className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                                            onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1486006920555-c77dce18193b?w=300'; }}
                                        />
                                        <span className="absolute top-2 right-2 px-2 py-0.5 text-[10px] font-bold rounded-full bg-black/70 backdrop-blur text-primary border border-primary/30">
                                            {product.category || 'Spare Part'}
                                        </span>
                                    </div>

                                    <h3 className="font-bold text-sm text-white line-clamp-1 group-hover:text-primary transition-colors">
                                        {product.name}
                                    </h3>

                                    {product.compatibility && (
                                        <p className="text-[11px] text-muted line-clamp-1 mt-1 flex items-center gap-1">
                                            <span>🚘</span> {product.compatibility}
                                        </p>
                                    )}
                                </div>

                                <div className="mt-3 pt-2 border-t border-glass flex items-center justify-between">
                                    <div>
                                        <p className="text-xs text-muted">Stock: <span className={product.quantity < 10 ? 'text-danger font-bold' : 'text-success font-bold'}>{product.quantity}</span></p>
                                        <p className="text-lg font-extrabold text-primary">
                                            ${product.price ? product.price.toFixed(2) : '0.00'}
                                        </p>
                                    </div>
                                    <button 
                                        className="btn btn-primary btn-sm rounded-full p-2"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleAddToCart(product);
                                        }}
                                    >
                                        + Add
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProductGrid;
