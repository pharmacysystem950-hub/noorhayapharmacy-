const mongoose = require("mongoose");

// Product schema
const ProductSchema = new mongoose.Schema({
  PRODUCT_NAME: { type: String, required: true },
  BRAND: { type: String, required: true },
  UNIT_PRICE: { type: Number, required: true },
  QUANTITY: { type: Number, required: true },
  EXPIRATION_DATE: { type: Date, required: true },
  CATEGORY: { type: String, required: true },
  TIMESTAMP: { type: Date, default: Date.now },
  ADMIN_ID: { type: mongoose.Schema.Types.ObjectId, ref: "Admin", required: true },
});

// Mongoose model
const Product = mongoose.model("Product", ProductSchema, "products");

// Wrapper with helper methods
const ProductModel = {
  create: async ({ PRODUCT_NAME, BRAND, UNIT_PRICE, QUANTITY, EXPIRATION_DATE, CATEGORY, ADMIN_ID }) => {
    const product = new Product({ PRODUCT_NAME, BRAND, UNIT_PRICE, QUANTITY, EXPIRATION_DATE, CATEGORY, ADMIN_ID });
    return await product.save();
  },

  getLowStockProducts: async (ADMIN_ID, threshold = 5) =>
    Product.find({ ADMIN_ID, QUANTITY: { $lte: threshold } }).sort({ QUANTITY: 1 }).exec(),

  getProductsByAdminId: async (ADMIN_ID) => Product.find({ ADMIN_ID }).sort({ TIMESTAMP: -1 }).exec(),

  getProductById: async (PRODUCT_ID) => Product.findById(PRODUCT_ID).exec(),

  update: async (PRODUCT_ID, data) => {
    const updated = await Product.findByIdAndUpdate(PRODUCT_ID, data, { new: true });
    if (!updated) throw new Error("Product not found");
    return updated;
  },

  delete: async (PRODUCT_ID) => {
    const deleted = await Product.findByIdAndDelete(PRODUCT_ID);
    if (!deleted) throw new Error("Product not found");
    return deleted;
  },


};

// Export both raw model and wrapper
module.exports = { Product, ProductModel };
