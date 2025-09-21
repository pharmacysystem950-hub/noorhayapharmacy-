const express = require("express");
const router = express.Router();
const CancelledPurchaseController = require("../controllers/CancelledPurchaseController");
const verifyToken = require("../middlewares/verifyToken");

// Cancel a product (POST + protected)
router.post("/cancel", verifyToken, CancelledPurchaseController.create);

// Get all cancelled products (GET + protected)
router.get("/", verifyToken, CancelledPurchaseController.getAll);

module.exports = router;
