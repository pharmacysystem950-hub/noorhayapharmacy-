const mongoose = require("mongoose");
const { Product } = require("./models/ProductModel");
const { ProductSold } = require("./models/ProductSoldModel");


require("dotenv").config();

(async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    const oldSales = await ProductSold.find({
      $or: [
        { PRODUCT_NAME: { $exists: false } },
        { PRODUCT_NAME: "-" },
      ]
    });

    for (let sale of oldSales) {
      const product = await Product.findById(sale.PRODUCT_ID);
      if (product) {
        sale.PRODUCT_NAME = product.PRODUCT_NAME;
        sale.BRAND = product.BRAND;
        sale.CATEGORY = product.CATEGORY;
        sale.EXPIRATION_DATE = product.EXPIRATION_DATE;
        sale.UNIT_PRICE = product.UNIT_PRICE;
        await sale.save();
        console.log(`✅ Fixed sale ${sale._id}`);
      } else {
        console.log(`⚠️ Skipped ${sale._id}, product missing`);
      }
    }

    console.log("🎉 Done fixing old sales");
    process.exit(0);
  } catch (err) {
    console.error("❌ Error:", err);
    process.exit(1);
  }
})();
