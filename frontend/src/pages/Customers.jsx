import React, { useState, useEffect } from 'react';
import { customersAPI } from '../api/apiService';
import Loader from '../components/common/Loader';

const Customers = () => {
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchCustomers();
    }, []);

    const fetchCustomers = async () => {
        try {
            const response = await customersAPI.getAll({ limit: 100 });
            setCustomers(response.data.data);
        } catch (error) {
            console.error('Failed to fetch customers', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <Loader />;

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Customers</h1>
                <button className="btn btn-primary">Add Customer</button>
            </div>

            <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="table">
                    <thead>
                        <tr>
                            <th>Avatar</th>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Phone</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {customers.map(customer => (
                            <tr key={customer.id}>
                                <td>
                                    <div className="w-10 h-10 rounded-full bg-primary-light text-white flex items-center justify-center font-bold">
                                        {customer.avatar ? (
                                            <img src={customer.avatarUrl} alt="" className="w-full h-full rounded-full object-cover" />
                                        ) : (
                                            customer.firstName.charAt(0)
                                        )}
                                    </div>
                                </td>
                                <td>{customer.firstName} {customer.lastName}</td>
                                <td>{customer.email}</td>
                                <td>{customer.phone}</td>
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

export default Customers;
