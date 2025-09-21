const mongoose = require("mongoose");

const CancelledPurchaseSchema = new mongoose.Schema(
  {
    PRODUCT_SOLD_ID: { type: mongoose.Schema.Types.ObjectId, ref: "ProductSold", required: true },
    PRODUCT_ID: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: false },

    PRODUCT_NAME: { type: String, required: true },
    BRAND: { type: String, required: true },
    UNIT_PRICE: { type: Number, required: true },
    EXPIRATION_DATE: { type: Date, required: true },
    CATEGORY: { type: String, required: true },

    QUANTITY_SOLD: { type: Number, required: true },
    PRICE: { type: Number, required: true },
    TOTAL_AMOUNT: { type: Number, required: true },

    TIMESTAMP: { type: Date, required: true },   // when sold
    CANCELLED_AT: { type: Date, default: Date.now }, // when cancelled

    ADMIN_ID: { type: mongoose.Schema.Types.ObjectId, ref: "Admin", required: true },
  },
  { timestamps: true }
);

const CancelledPurchase = mongoose.model(
  "CancelledPurchase",
  CancelledPurchaseSchema,
  "cancelled_purchases"
);

const CancelledPurchaseModel = {
  // Create cancelled purchase record
  create: async (data) => {
    const cancelledPurchase = new CancelledPurchase(data);
    return await cancelledPurchase.save();
  },

  // Get all cancelled purchases for an admin (with snapshot data)
  getByAdmin: async (ADMIN_ID) => {
    const records = await CancelledPurchase.find({ ADMIN_ID })
      .sort({ CANCELLED_AT: -1 })
      .exec();

    return records.map(sp => ({
      _id: sp._id,
      PRODUCT_NAME: sp.PRODUCT_NAME,
      BRAND: sp.BRAND,
      UNIT_PRICE: sp.UNIT_PRICE,
      EXPIRATION_DATE: sp.EXPIRATION_DATE,
      CATEGORY: sp.CATEGORY,
      QUANTITY_SOLD: sp.QUANTITY_SOLD,
      PRICE: sp.PRICE,
      TOTAL_AMOUNT: sp.TOTAL_AMOUNT,
      TIMESTAMP: sp.TIMESTAMP,
      CANCELLED_AT: sp.CANCELLED_AT,
    }));
  }
};

module.exports = CancelledPurchaseModel;
