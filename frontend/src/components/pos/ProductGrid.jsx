import React, { useState, useEffect } from 'react';
import { productsAPI } from '../../api/apiService';
import Loader from '../common/Loader';
import Button from '../common/Button';
import { useCart } from '../../hooks/useCart';

const ProductGrid = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const { addToCart } = useCart();

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async (search = '') => {
        try {
            setLoading(true);
            const response = await productsAPI.getAll({ search, limit: 100, status: true });
            setProducts(response.data.data);
        } catch (error) {
            console.error('Failed to fetch products:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e) => {
        const term = e.target.value;
        setSearchTerm(term);
        // Debounce search could be added here
        if (term.length === 0 || term.length > 2) {
            fetchProducts(term);
        }
    };

    const handleAddToCart = async (product) => {
        await addToCart(product.id, 1);
    };

    return (
        <div className="flex flex-col h-full bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-4 border-b border-gray-200">
                <input
                    type="text"
                    placeholder="Scan barcode or search products..."
                    className="search-input"
                    value={searchTerm}
                    onChange={handleSearch}
                    autoFocus
                />
            </div>

            <div className="flex-1 overflow-y-auto p-4">
                {loading ? (
                    <Loader />
                ) : products.length === 0 ? (
                    <div className="text-center text-gray-500 py-8">
                        No products found
                    </div>
                ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                        {products.map((product) => (
                            <div
                                key={product.id}
                                className="group relative border border-gray-200 rounded-lg p-3 hover:shadow-md transition-shadow cursor-pointer bg-white"
                                onClick={() => handleAddToCart(product)}
                            >
                                <div className="aspect-w-1 aspect-h-1 w-full overflow-hidden rounded-md bg-gray-200 lg:aspect-none group-hover:opacity-75 lg:h-32 mb-2">
                                    <img
                                        src={product.imageUrl || '/placeholder.jpg'}
                                        alt={product.name}
                                        className="h-full w-full object-cover object-center lg:h-full lg:w-full"
                                        onError={(e) => { e.target.src = 'https://via.placeholder.com/150' }}
                                    />
                                </div>
                                <div className="mt-2 text-center">
                                    <h3 className="text-sm font-medium text-gray-700 truncate">
                                        {product.name}
                                    </h3>
                                    <p className="text-sm font-bold text-primary mt-1">
                                        ${product.price ? product.price.toFixed(2) : '0.00'}
                                    </p>
                                    <p className="text-xs text-secondary mt-1">
                                        Stock: {product.quantity}
                                    </p>
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
