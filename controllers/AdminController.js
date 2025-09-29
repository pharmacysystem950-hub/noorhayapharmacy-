const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const AdminModel = require("../models/AdminModel");

const AdminController = {
  // Signup (no email)
  signup: async (req, res) => {
    const { USERNAME, PASSWORD } = req.body;

    try {
      const hashedPassword = bcrypt.hashSync(PASSWORD, 10);

      const newAdmin = await AdminModel.createAdmin({
        USERNAME,
        PASSWORD: hashedPassword,
      });

      res.status(201).json({
        message: "Admin registered successfully. You can now login.",
        adminId: newAdmin._id,
      });
    } catch (err) {
      console.error("Signup error:", err);
      res.status(500).json({ error: "Internal server error" });
    }
  },

  // Login
  login: async (req, res) => {
    const { USERNAME, PASSWORD } = req.body;

    try {
      const admin = await AdminModel.findByUsername(USERNAME);

      if (!admin) {
        return res.status(400).json({ error: "Invalid username or password" });
      }

      const isPasswordValid = bcrypt.compareSync(PASSWORD, admin.PASSWORD);

      if (!isPasswordValid) {
        return res.status(400).json({ error: "Invalid username or password" });
      }

      const token = jwt.sign(
        { ADMIN_ID: admin._id.toString(), USERNAME: admin.USERNAME },
        process.env.JWT_SECRET || "your-secret-key",
        { expiresIn: "1h" }
      );

      res.json({ message: "Login successful", token });
    } catch (err) {
      console.error("Login error:", err);
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

  // Edit profile (no email)
  editProfile: async (req, res) => {
    const ADMIN_ID = req.user.ADMIN_ID;
    const { USERNAME, PASSWORD } = req.body;

    try {
      const hashedPassword = PASSWORD ? bcrypt.hashSync(PASSWORD, 10) : null;

      const updatedAdmin = await AdminModel.updateProfile(
        ADMIN_ID,
        USERNAME,
        hashedPassword
      );

      if (!updatedAdmin) {
        return res.status(404).json({ error: "Admin not found" });
      }

      res.status(200).json({
        message: "Profile updated successfully",
        updatedAdmin,
      });
    } catch (err) {
      console.error("Error updating admin profile:", err);
      res.status(500).json({ error: "Internal server error" });
    }
  },
};

module.exports = AdminController;
