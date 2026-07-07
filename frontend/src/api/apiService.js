import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add token to requests
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Handle response errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

// Auth API
export const authAPI = {
    login: (credentials) => api.post('/auth/login', credentials),
    register: (userData) => api.post('/auth/register', userData),
    getMe: () => api.get('/auth/me'),
    logout: () => api.post('/auth/logout'),
    getUsers: () => api.get('/auth/users'),
};

// Products API
export const productsAPI = {
    getAll: (params) => api.get('/products', { params }),
    getOne: (id) => api.get(`/products/${id}`),
    create: (formData) => api.post('/products', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    }),
    update: (id, formData) => api.put(`/products/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    }),
    delete: (id) => api.delete(`/products/${id}`),
};

// Customers API
export const customersAPI = {
    getAll: (params) => api.get('/customers', { params }),
    getOne: (id) => api.get(`/customers/${id}`),
    create: (formData) => api.post('/customers', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    }),
    update: (id, formData) => api.put(`/customers/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    }),
    delete: (id) => api.delete(`/customers/${id}`),
};

// Orders API
export const ordersAPI = {
    getAll: (params) => api.get('/orders', { params }),
    getOne: (id) => api.get(`/orders/${id}`),
    create: (orderData) => api.post('/orders', orderData),
    update: (id, orderData) => api.put(`/orders/${id}`, orderData),
    delete: (id) => api.delete(`/orders/${id}`),
    getStats: () => api.get('/orders/stats/summary'),
};

// Cart API
export const cartAPI = {
    getCart: () => api.get('/cart'),
    addItem: (item) => api.post('/cart', item),
    updateItem: (id, data) => api.put(`/cart/${id}`, data),
    removeItem: (id) => api.delete(`/cart/${id}`),
    clearCart: () => api.delete('/cart'),
};

// Payments API
export const paymentsAPI = {
    create: (paymentData) => api.post('/payments', paymentData),
    getOrderPayments: (orderId) => api.get(`/payments/order/${orderId}`),
    getConfig: () => api.get('/payments/config'),
    createPaymentIntent: (amount) => api.post('/payments/create-payment-intent', { amount }),
};

// Settings API
export const settingsAPI = {
    getAll: () => api.get('/settings'),
    getOne: (key) => api.get(`/settings/${key}`),
    update: (key, data) => api.put(`/settings/${key}`, data),
    delete: (key) => api.delete(`/settings/${key}`),
};

// Attendance API
export const attendanceAPI = {
    checkIn: (data) => api.post('/attendance/check-in', data),
    checkOut: (data) => api.post('/attendance/check-out', data),
    getStatus: () => api.get('/attendance/status'),
    getHistory: () => api.get('/attendance/history'),
    getAll: (params) => api.get('/attendance/all', { params }),
    manualRecord: (data) => api.post('/attendance/manual', data),
};

export default api;
