const express = require('express');
const router = express.Router();
const {
    getCustomers,
    getCustomer,
    createCustomer,
    updateCustomer,
    deleteCustomer,
} = require('../controllers/customerController');
const { protect } = require('../middleware/auth');
const upload = require('../utils/upload');

router
    .route('/')
    .get(protect, getCustomers)
    .post(protect, upload.single('avatar'), createCustomer);

router
    .route('/:id')
    .get(protect, getCustomer)
    .put(protect, upload.single('avatar'), updateCustomer)
    .delete(protect, deleteCustomer);

module.exports = router;
