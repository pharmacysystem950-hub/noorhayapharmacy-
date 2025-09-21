const { ProductModel } = require("../models/ProductModel"); // Use wrapper

const ProductController = {
  async create(req, res) {
    const { PRODUCT_NAME, BRAND, UNIT_PRICE, QUANTITY, EXPIRATION_DATE, CATEGORY } = req.body;
    const { ADMIN_ID } = req.user;

    try {
      const product = await ProductModel.create({
        PRODUCT_NAME,
        BRAND,
        UNIT_PRICE,
        QUANTITY,
        EXPIRATION_DATE,
        CATEGORY,
        ADMIN_ID,
      });
      res.status(201).json(product);
    } catch (err) {
      console.error("Error creating product:", err);
      res.status(500).json({ error: "Internal server error" });
    }
  },

  async getProductsByAdmin(req, res) {
    const { ADMIN_ID } = req.user;
    try {
      const products = await ProductModel.getProductsByAdminId(ADMIN_ID);
      res.json(products);
    } catch (err) {
      console.error("Error fetching products:", err);
      res.status(500).json({ error: "Failed to fetch products" });
    }
  },

  async getProductCount(req, res) {
    const { ADMIN_ID } = req.user;
    try {
      const count = await ProductModel.getProductCountByAdminId(ADMIN_ID);
      res.json({ count });
    } catch (err) {
      console.error("Error fetching product count:", err);
      res.status(500).json({ error: "Failed to fetch product count" });
    }
  },

  async getLowStockProducts(req, res) {
    const { ADMIN_ID } = req.user;
    try {
      const products = await ProductModel.getLowStockProducts(ADMIN_ID);
      res.json(products);
    } catch (err) {
      console.error("Error fetching low-stock products:", err);
      res.status(500).json({ error: "Failed to fetch low-stock products" });
    }
  },

  async getExpiredProducts(req, res) {
    const { ADMIN_ID } = req.user;
    try {
      const products = await ProductModel.getExpiredProducts(ADMIN_ID);
      res.json(products);
    } catch (err) {
      console.error("Error fetching expired products:", err);
      res.status(500).json({ error: "Failed to fetch expired products" });
    }
  },

  async getActiveProducts(req, res) {
    const { ADMIN_ID } = req.user;
    try {
      const products = await ProductModel.getActiveProductsByAdminId(ADMIN_ID);
      res.json(products);
    } catch (err) {
      console.error("Error fetching active products:", err);
      res.status(500).json({ error: "Failed to fetch active products" });
    }
  },

  async findAll(req, res) {
    try {
      const products = await ProductModel.findAll();
      res.json(products);
    } catch (err) {
      console.error("Error fetching all products:", err);
      res.status(500).json({ error: "Failed to fetch products" });
    }
  },

  async update(req, res) {
    const PRODUCT_ID = req.params.id;
    const { PRODUCT_NAME, BRAND, UNIT_PRICE, QUANTITY, EXPIRATION_DATE, CATEGORY } = req.body;
    const { ADMIN_ID } = req.user;

    try {
      const existingProduct = await ProductModel.getProductById(PRODUCT_ID);
      if (!existingProduct) return res.status(404).json({ error: "Product not found" });
      if (existingProduct.ADMIN_ID.toString() !== ADMIN_ID.toString())
        return res.status(403).json({ error: "Unauthorized" });

      const updatedProduct = await ProductModel.update(PRODUCT_ID, {
        PRODUCT_NAME,
        BRAND,
        UNIT_PRICE,
        QUANTITY,
        EXPIRATION_DATE,
        CATEGORY,
        TIMESTAMP: new Date(),
      });

      res.json(updatedProduct);
    } catch (err) {
      console.error("Error updating product:", err);
      res.status(500).json({ error: "Failed to update product" });
    }
  },

  async delete(req, res) {
    const PRODUCT_ID = req.params.id;
    const { ADMIN_ID } = req.user;

    try {
      const existingProduct = await ProductModel.getProductById(PRODUCT_ID);
      if (!existingProduct) return res.status(404).json({ error: "Product not found" });
      if (existingProduct.ADMIN_ID.toString() !== ADMIN_ID.toString())
        return res.status(403).json({ error: "Unauthorized" });

      await ProductModel.delete(PRODUCT_ID);
      res.status(204).send();
    } catch (err) {
      console.error("Error deleting product:", err);
      res.status(500).json({ error: "Failed to delete product" });
    }
  },
 
};

module.exports = ProductController;
