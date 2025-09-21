const mongoose = require("mongoose");
const { Product } = require("./ProductModel");

// Sold product schema
// Sold product schema
const ProductSoldSchema = new mongoose.Schema({
  QUANTITY_SOLD: { type: Number, required: true },
  PRICE: { type: Number, required: true }, // selling price at the time
  TOTAL_AMOUNT: { type: Number, required: true },
  TIMESTAMP: { type: Date, default: Date.now },
  
  // Keep reference for relation
  PRODUCT_ID: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
  ADMIN_ID: { type: mongoose.Schema.Types.ObjectId, ref: "Admin", required: true },

  // Snapshotted product details (names match Product schema now)
  PRODUCT_NAME: { type: String, required: true },
  BRAND: { type: String, required: true },
  CATEGORY: { type: String, required: true },
  EXPIRATION_DATE: { type: Date, required: true }, // ✅ same as Product
  UNIT_PRICE: { type: Number, required: true },    // ✅ same as Product

  // Management fields
  EDITED_AT: { type: Date, default: null },
  CANCELLED: { type: Boolean, default: false },
  CANCELLED_AT: { type: Date, default: null }
});


const ProductSold = mongoose.model("ProductSold", ProductSoldSchema, "product_sold");

const ProductSoldModel = {
  // Create sold record (just like PostgreSQL: no JOIN here)
   create: async ({ QUANTITY_SOLD, PRICE, TOTAL_AMOUNT, PRODUCT_ID, ADMIN_ID }) => {
  const product = await Product.findById(PRODUCT_ID);
  if (!product) throw new Error("Product not found");
  if (product.QUANTITY < QUANTITY_SOLD) throw new Error("Not enough stock available");

  // Deduct stock
  product.QUANTITY -= QUANTITY_SOLD;
  await product.save();

  // Save with full snapshot (no renaming headache anymore)
  const soldRecord = new ProductSold({
    QUANTITY_SOLD,
    PRICE,
    TOTAL_AMOUNT,
    PRODUCT_ID,
    ADMIN_ID,

    PRODUCT_NAME: product.PRODUCT_NAME,
    BRAND: product.BRAND,
    CATEGORY: product.CATEGORY,
    EXPIRATION_DATE: product.EXPIRATION_DATE,
    UNIT_PRICE: product.UNIT_PRICE
  });

  return soldRecord.save();
},

// Get sold records with product details (like JOIN in PostgreSQL)
getByAdmin: async (ADMIN_ID) => {
  const soldProducts = await ProductSold.find({ ADMIN_ID })
    .populate({
      path: "PRODUCT_ID",
      select: "PRODUCT_NAME BRAND UNIT_PRICE EXPIRATION_DATE CATEGORY ADMIN_ID"
    })
    .sort({ TIMESTAMP: -1 })
    .exec();

  return soldProducts.map(sp => ({
    _id: sp._id,

    // ✅ Always use snapshot first, fallback to populated product if it still exists
    PRODUCT_NAME: sp.PRODUCT_NAME || sp.PRODUCT_ID?.PRODUCT_NAME || "-",
    BRAND: sp.BRAND || sp.PRODUCT_ID?.BRAND || "-",
    UNIT_PRICE: sp.UNIT_PRICE ?? sp.PRODUCT_ID?.UNIT_PRICE ?? 0,
    EXPIRATION_DATE: sp.EXPIRATION_DATE || sp.PRODUCT_ID?.EXPIRATION_DATE || null,
    CATEGORY: sp.CATEGORY || sp.PRODUCT_ID?.CATEGORY || "-",

    QUANTITY_SOLD: sp.QUANTITY_SOLD,
    PRICE: sp.PRICE,
    TOTAL_AMOUNT: sp.TOTAL_AMOUNT,
    TIMESTAMP: sp.TIMESTAMP,
    CANCELLED: sp.CANCELLED ?? false,
  }));
},

cancel: async (PRODUCT_SOLD_ID) => {
  const soldRecord = await ProductSold.findById(PRODUCT_SOLD_ID);
  if (!soldRecord) throw new Error("Product sold record not found");

  // Restore stock
  const product = await Product.findById(soldRecord.PRODUCT_ID);
  if (product) {
    product.QUANTITY += soldRecord.QUANTITY_SOLD;
    await product.save();
  }

  // Mark as cancelled instead of deleting
  soldRecord.CANCELLED = true;
  soldRecord.CANCELLED_AT = new Date(); // ✅ record cancel timestamp
  await soldRecord.save();

  return { message: "Sold product cancelled successfully", soldRecord };
}, 


  // ✅ New: find by ID
 findById: async (id) => {
  // use 'id', not 'PRODUCT_SOLD_ID'
  return await ProductSold.findById(id).populate("PRODUCT_ID");
},


  // ✅ New: delete by ID
  findByIdAndDelete: async (id) => {
    return await ProductSold.findByIdAndDelete(id);
  },

// Update a sold product (edit quantity, price, total amount + product info)
update: async (
  PRODUCT_SOLD_ID,
  {
    QUANTITY_SOLD,
    PRICE,
    TOTAL_AMOUNT,
    PRODUCT_NAME,
    BRAND,
    UNIT_PRICE,
    QUANTITY,
    EXPIRATION_DATE,
    CATEGORY
  }
) => {
  const soldRecord = await ProductSold.findById(PRODUCT_SOLD_ID);
  if (!soldRecord) throw new Error("Product sold record not found");

  const product = await Product.findById(soldRecord.PRODUCT_ID);
  if (!product) throw new Error("Associated product not found");

  // ✅ Adjust stock correctly
  const quantityDiff = QUANTITY_SOLD - soldRecord.QUANTITY_SOLD;
  if (quantityDiff > 0 && product.QUANTITY < quantityDiff) {
    throw new Error("Not enough stock available");
  }
  product.QUANTITY -= quantityDiff;

  // ✅ Update product fields (but keep the same PRODUCT_ID)
  if (PRODUCT_NAME !== undefined) product.PRODUCT_NAME = PRODUCT_NAME;
  if (BRAND !== undefined) product.BRAND = BRAND;
  if (UNIT_PRICE !== undefined) product.UNIT_PRICE = UNIT_PRICE;
  if (QUANTITY !== undefined) product.QUANTITY = QUANTITY;
  if (EXPIRATION_DATE !== undefined) product.EXPIRATION_DATE = EXPIRATION_DATE;
  if (CATEGORY !== undefined) product.CATEGORY = CATEGORY;

  await product.save();

  // ✅ Update sold record fields
  soldRecord.QUANTITY_SOLD = QUANTITY_SOLD;
  soldRecord.PRICE = PRICE;
  soldRecord.TOTAL_AMOUNT = TOTAL_AMOUNT;
  soldRecord.EDITED_AT = new Date(); // mark edit timestamp

  return soldRecord.save();
}

};

// keep existing ProductSoldModel object above

module.exports = { ProductSoldModel, ProductSold };
