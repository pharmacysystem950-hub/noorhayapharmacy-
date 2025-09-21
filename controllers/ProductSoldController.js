const { ProductSoldModel } = require("../models/ProductSoldModel");



const ProductSoldController = {
 async create(req, res) {
  try {
    const { QUANTITY_SOLD, PRICE, TOTAL_AMOUNT, PRODUCT_ID } = req.body;
    const { ADMIN_ID } = req.user;

    const productSold = await ProductSoldModel.create({
      QUANTITY_SOLD,
      PRICE,
      TOTAL_AMOUNT,
      PRODUCT_ID,
      ADMIN_ID
    });

    res.status(201).json(productSold);
  } catch (err) {
    console.error("❌ Error creating product sold:", err);
    res.status(400).json({ error: err.message });
  }
},

 // All sales (active)
async getByAdmin(req, res) {
  try {
    const { ADMIN_ID } = req.user;
    const soldProducts = await ProductSoldModel.getByAdmin(ADMIN_ID);
    res.json(soldProducts);
  } catch (err) {
    console.error("❌ Error fetching sold products:", err);
    res.status(500).json({ error: "Error fetching product sold records" });
  }
},
 
// Edit sold product (update sold record + product info)
async editProductSold(req, res) {
  try {
    const { id } = req.params; // PRODUCT_SOLD_ID

    if (!id) {
      return res.status(400).json({ error: "Missing PRODUCT_SOLD_ID" });
    }

    const updatedFields = req.body; 
    const updated = await ProductSoldModel.update(id, updatedFields);

    res.json(updated);
  } catch (err) {
    console.error("❌ Error editing product sold:", err);
    res.status(400).json({ error: err.message });
  }
}

};

module.exports = ProductSoldController;
