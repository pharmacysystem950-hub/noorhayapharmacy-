const express = require('express');
const router = express.Router();
const ProductSoldController = require('../controllers/ProductSoldController');
const verifyToken = require('../middlewares/verifyToken');

// Create a new sold record
router.post('/', verifyToken, ProductSoldController.create);

// Get sold records for the current admin
router.get('/admin', verifyToken, ProductSoldController.getByAdmin);

 
// Edit sold product
router.put('/edit/:id', verifyToken, ProductSoldController.editProductSold);



 
module.exports = router;
