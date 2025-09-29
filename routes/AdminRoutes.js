const express = require("express");
const AdminController = require("../controllers/AdminController");
const verifyToken = require("../middlewares/verifyToken");

const AdminRoutes = express.Router();

// Login
AdminRoutes.post("/login", AdminController.login);

// Get profile (requires token)
AdminRoutes.get("/profile", verifyToken, AdminController.getProfile);

// Edit profile (requires token)
AdminRoutes.put("/edit-profile", verifyToken, AdminController.editProfile);


// ✅ New routes for signup + OTP verification
AdminRoutes.post("/signup", AdminController.signup);
 
module.exports = AdminRoutes;
