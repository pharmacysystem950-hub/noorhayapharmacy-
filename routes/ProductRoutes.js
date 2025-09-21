const express = require('express');
const router = express.Router();
const ProductController = require('../controllers/ProductController');
const verifyToken = require('../middlewares/verifyToken');

// Create a new product
router.post('/', verifyToken, ProductController.create);

// Get all products for the current admin
router.get('/admin', verifyToken, ProductController.getProductsByAdmin);

// Get product count for the current admin
router.get('/count', verifyToken, ProductController.getProductCount);

// Get low-stock products for the current admin
router.get('/low-stock', verifyToken, ProductController.getLowStockProducts);

// Get expired products for the current admin
router.get('/expired', verifyToken, ProductController.getExpiredProducts);

// Get active products for the current admin
router.get('/active', verifyToken, ProductController.getActiveProducts);

// Get all products (admin-agnostic)
router.get('/', ProductController.findAll);

// Update product by ID
router.put('/:id', verifyToken, ProductController.update);

// Delete product by ID
router.delete('/:id', verifyToken, ProductController.delete);

 
module.exports = router;
