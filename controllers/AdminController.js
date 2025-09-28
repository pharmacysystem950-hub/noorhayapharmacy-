const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const AdminModel = require("../models/AdminModel");

const AdminController = {
  // Login
  login: async (req, res) => {
    const { USERNAME, PASSWORD, PHARMACY_NAME } = req.body;

    try {
      const admin = await AdminModel.findByUsernameAndPharmacyName(USERNAME, PHARMACY_NAME);

      if (!admin) {
        return res.status(400).json({ error: "Invalid username, password, or pharmacy name" });
      }

      const isPasswordValid = bcrypt.compareSync(PASSWORD, admin.PASSWORD);

      if (!isPasswordValid) {
        return res.status(400).json({ error: "Invalid username, password, or pharmacy name" });
      }

      const token = jwt.sign(
        { ADMIN_ID: admin._id.toString(), USERNAME: admin.USERNAME },
        process.env.JWT_SECRET || "your-secret-key",
        { expiresIn: "1h" }
      );

      res.json({ message: "Login successful", token });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Internal server error" });
    }
  },

  // Get profile
  getProfile: async (req, res) => {
    try {
      const ADMIN_ID = req.user.ADMIN_ID;

      if (!ADMIN_ID) {
        return res.status(403).json({ error: "Unauthorized: No admin ID found" });
      }

      const admin = await AdminModel.findById(ADMIN_ID);

      if (!admin) {
        return res.status(404).json({ error: "Admin not found" });
      }

      res.status(200).json(admin);
    } catch (err) {
      console.error("Error fetching admin profile:", err);
      res.status(500).json({ error: "Internal server error" });
    }
  },

  // Edit profile
  editProfile: async (req, res) => {
    const ADMIN_ID = req.user.ADMIN_ID;
    const { USERNAME, PASSWORD, PHARMACY_NAME } = req.body;

    try {
      const hashedPassword = PASSWORD ? bcrypt.hashSync(PASSWORD, 10) : null;

      const updatedAdmin = await AdminModel.updateProfile(
        ADMIN_ID,
        USERNAME,
        PHARMACY_NAME,
        hashedPassword
      );

      if (!updatedAdmin) {
        return res.status(404).json({ error: "Admin not found" });
      }

      res.status(200).json({ message: "Profile updated successfully", updatedAdmin });
    } catch (err) {
      console.error("Error updating admin profile:", err);
      res.status(500).json({ error: "Internal server error" });
    }
  },
};

module.exports = AdminController;
