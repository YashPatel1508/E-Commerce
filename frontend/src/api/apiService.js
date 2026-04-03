import api from './axios';

/**
 * Standardized API service for CRUD operations.
 */
const apiService = {
    // Products & Shop
    products: {
        list: (params) => api.get('/shop/products/', { params }),
        get: (id) => api.get(`/shop/products/${id}/`),
        categories: () => api.get('/shop/categories/'),
        subcategories: () => api.get('/shop/subcategories/'),
    },

    // Orders & Checkout
    orders: {
        list: () => api.get('/checkout/orders/'),
        get: (id) => api.get(`/checkout/orders/${id}/`),
        create: (data) => api.post('/checkout/orders/', data),
        // Use POST /action/ with a 'cmd' parameter for all modifications
        cancel: (id) => api.post(`/checkout/orders/${id}/action/`, { cmd: 'cancel-pending' }),
        requestReturn: (id) => api.post(`/checkout/orders/${id}/action/`, { cmd: 'request-return' }),
        updateStatus: (id, status) => api.post(`/checkout/orders/${id}/action/`, { cmd: 'update-status', status }),
    },

    // Generic CRUD helpers
    get: (url, params) => api.get(url, { params }),
    post: (url, data) => api.post(url, data),
    
    // Commands (Replacement for PATCH/PUT/DELETE)
    command: (url, cmd, data = {}) => api.post(`${url}action/`, { cmd, ...data }),
};

export default apiService;
