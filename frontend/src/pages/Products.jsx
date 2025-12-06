import React, { useState, useEffect } from 'react';
import { productsAPI } from '../api/apiService';
import Loader from '../components/common/Loader';

const Products = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

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

    if (loading) return <Loader />;

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Products</h1>
                <button className="btn btn-primary">Add Product</button>
            </div>

            <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="table">
                    <thead>
                        <tr>
                            <th>Image</th>
                            <th>Name</th>
                            <th>Price</th>
                            <th>Stock</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {products.map(product => (
                            <tr key={product.id}>
                                <td>
                                    <img src={product.imageUrl || '/placeholder.jpg'} alt="" className="w-10 h-10 object-cover rounded" />
                                </td>
                                <td>
                                    <div className="font-medium text-gray-900">{product.name}</div>
                                    <div className="text-sm text-gray-500">{product.barcode}</div>
                                </td>
                                <td>${product.price ? product.price.toFixed(2) : '0.00'}</td>
                                <td>{product.quantity}</td>
                                <td>
                                    <span className={`badge ${product.status ? 'badge-success' : 'badge-danger'}`}>
                                        {product.status ? 'Active' : 'Inactive'}
                                    </span>
                                </td>
                                <td>
                                    <button className="text-primary hover:text-primary-dark mr-2">Edit</button>
                                    <button className="text-danger hover:text-danger-dark">Delete</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Products;
