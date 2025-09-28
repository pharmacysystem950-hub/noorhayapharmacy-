require('dotenv').config(); // ✅ Load environment variables from .env file
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');

// Import Routes
const AdminRoutes = require('./routes/AdminRoutes');
const ProductRoutes = require('./routes/ProductRoutes');
const ProductSoldRoutes = require('./routes/ProductSoldRoutes');
const CancelledPurchaseRoutes = require("./routes/CancelledPurchaseRoutes");

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors({
  origin: "https://maymed-pharmacy.onrender.com",
  credentials: true
}));
app.use(bodyParser.json());


// ✅ Use only the .env connection string
const mongoURI = process.env.MONGO_URI;

if (!mongoURI) {
  console.error("❌ MONGO_URI is not defined in .env");
  process.exit(1);
}

mongoose
  .connect(mongoURI)
  .then(() => console.log("✅ MongoDB Atlas Connected..."))
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err.message);
    process.exit(1);
  });

// Routes
app.use('/admins', AdminRoutes);
app.use('/products', ProductRoutes);
app.use('/productsold', ProductSoldRoutes);
app.use('/cancelledpurchase', CancelledPurchaseRoutes); 


// Root route (for testing)
app.get("/", (req, res) => {
  res.json({
    message: "API is running 🚀 and connected to MongoDB Atlas ✅",
  });
});

// Start server
app.listen(port, () => {
  console.log(`🚀 Server is running on port ${port}`);
});
