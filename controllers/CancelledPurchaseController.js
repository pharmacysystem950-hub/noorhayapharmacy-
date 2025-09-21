const CancelledPurchaseModel = require("../models/CancelledPurchaseModel");
const { ProductSoldModel } = require("../models/ProductSoldModel"); // ✅ import correctly

const CancelledPurchaseController = {
  // Get all cancelled purchases for logged-in admin
  async getAll(req, res) {
    try {
      const { ADMIN_ID } = req.user;
      if (!ADMIN_ID) return res.status(401).json({ error: "Unauthorized" });

      const cancelled = await CancelledPurchaseModel.getByAdmin(ADMIN_ID);
      res.json(cancelled);
    } catch (err) {
      console.error("❌ Error fetching cancelled purchases:", err);
      res.status(500).json({ error: "Failed to fetch cancelled purchases" });
    }
  },

  // Cancel ONE sold product and move it to cancelled purchases
  async create(req, res) {
    try {
      const { ADMIN_ID } = req.user;
      if (!ADMIN_ID) return res.status(401).json({ error: "Unauthorized" });

      const { PRODUCT_SOLD_ID } = req.body;
      if (!PRODUCT_SOLD_ID)
        return res.status(400).json({ error: "PRODUCT_SOLD_ID is required" });

      // Cancel the sold product (marks it cancelled + restores stock)
      const { soldRecord } = await ProductSoldModel.cancel(PRODUCT_SOLD_ID);

      // ✅ Save cancelled purchase snapshot from ProductSold itself
      const cancelledPurchase = await CancelledPurchaseModel.create({
        PRODUCT_SOLD_ID: soldRecord._id,
        PRODUCT_ID: soldRecord.PRODUCT_ID?._id || null,
        PRODUCT_NAME: soldRecord.PRODUCT_NAME,
        BRAND: soldRecord.BRAND,
        UNIT_PRICE: soldRecord.UNIT_PRICE,
        EXPIRATION_DATE: soldRecord.EXPIRATION_DATE,
        CATEGORY: soldRecord.CATEGORY,
        QUANTITY_SOLD: soldRecord.QUANTITY_SOLD,
        PRICE: soldRecord.PRICE,
        TOTAL_AMOUNT: soldRecord.TOTAL_AMOUNT,
        TIMESTAMP: soldRecord.TIMESTAMP,
        CANCELLED_AT: soldRecord.CANCELLED_AT,
        ADMIN_ID,
      });

      res.json({ message: "Purchase cancelled successfully", cancelledPurchase });
    } catch (err) {
      console.error("❌ Error cancelling purchase:", err);
      res.status(500).json({ error: "Failed to cancel purchase" });
    }
  },
};

module.exports = CancelledPurchaseController;
