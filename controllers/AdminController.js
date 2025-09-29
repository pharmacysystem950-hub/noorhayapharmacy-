const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const AdminModel = require("../models/AdminModel");


// Utility to generate 6-digit OTP
const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

// Configure email transporter (Gmail example)
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER, // your Gmail email
    pass: process.env.EMAIL_PASS, // app password (not your Gmail password)
  },
});


// ✅ Verify SMTP connection ONCE at server startup
transporter.verify((error, success) => {
  if (error) {
    console.error("❌ SMTP connection failed:", error);
  } else {
    console.log("✅ SMTP server ready to send messages");
  }
});

const AdminController = {
// Signup
 signup: async (req, res) => {
    const { USERNAME, PASSWORD, PHARMACY_NAME, EMAIL } = req.body;

    try {
      const hashedPassword = bcrypt.hashSync(PASSWORD, 10);
      const otp = generateOTP();
      const otpExpires = new Date(Date.now() + 5 * 60 * 1000);

      const newAdmin = await AdminModel.createAdmin({
        USERNAME,
        PASSWORD: hashedPassword,
        PHARMACY_NAME,
        EMAIL,
        otp,
        otpExpires,
      });

      // Send OTP via email
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: EMAIL,
        subject: "Your OTP Code",
        text: `Your OTP code is: ${otp}. It will expire in 5 minutes.`,
      };

      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.error("Email send error:", error);
        } else {
          console.log("Email sent:", info.response);
        }
      });

      res.status(201).json({
        message: "Admin registered. OTP sent to your email.",
        adminId: newAdmin._id,
      });
    } catch (err) {
      console.error("Signup error:", err);
      res.status(500).json({ error: "Internal server error" });
    }
  },

  verifyOtp: async (req, res) => {
    const { ADMIN_ID, otp } = req.body;

    try {
      const admin = await AdminModel.findByIdFull(ADMIN_ID);
      if (!admin) return res.status(404).json({ error: "Admin not found" });

      if (admin.isVerified)
        return res.status(400).json({ error: "Admin already verified" });

      if (admin.otp !== otp || admin.otpExpires < new Date())
        return res.status(400).json({ error: "Invalid or expired OTP" });

      await AdminModel.verifyAdmin(ADMIN_ID);
      res.status(200).json({ message: "OTP verified. You can now login." });
    } catch (err) {
      console.error("OTP verification error:", err);
      res.status(500).json({ error: "Internal server error" });
    }
  },



  
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

      const updatedAdmin = await AdminModel.updateProfile(ADMIN_ID, USERNAME, PHARMACY_NAME, hashedPassword);

      if (!updatedAdmin) {
        return res.status(404).json({ error: "Admin not found" });
      }

      res.status(200).json({ message: "Profile updated successfully", updatedAdmin });
    } catch (err) {
      console.error("Error updating admin profile:", err);
      res.status(500).json({ error: "Internal server error" });
    }
  },

   // Forgot password – send OTP
  forgotPassword: async (req, res) => {
    const { EMAIL } = req.body;
    if (!EMAIL) return res.status(400).json({ error: "Email is required" });

    try {
      const admin = await AdminModel.findByEmail(EMAIL);
      if (!admin) return res.status(404).json({ error: "Admin not found" });

      const otp = generateOTP();
      const otpExpires = new Date(Date.now() + 5 * 60 * 1000);
      admin.otp = otp;
      admin.otpExpires = otpExpires;
      await admin.save();

      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: EMAIL,
        subject: "Password Reset OTP",
        text: `Hello ${admin.USERNAME}, your password reset OTP is: ${otp}. It expires in 5 minutes.`,
      };

      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.error("Forgot Password email error:", error);
          return res.status(500).json({ error: "Error sending OTP email" });
        }
        console.log("OTP email sent:", info.response);
        res.status(200).json({ message: "OTP sent to your email" });
      });
    } catch (err) {
      console.error("Forgot Password error:", err);
      res.status(500).json({ error: "Internal server error" });
    }
  },

  // Reset password – verify OTP
  resetPassword: async (req, res) => {
    const { EMAIL, OTP, NEW_PASSWORD } = req.body;
    if (!EMAIL || !OTP || !NEW_PASSWORD)
      return res.status(400).json({ error: "Email, OTP, and new password are required" });

    try {
      const admin = await AdminModel.findByEmail(EMAIL);
      if (!admin) return res.status(404).json({ error: "Admin not found" });

      if (admin.otp !== OTP || admin.otpExpires < new Date())
        return res.status(400).json({ error: "Invalid or expired OTP" });

      admin.PASSWORD = bcrypt.hashSync(NEW_PASSWORD, 10);
      admin.otp = null;
      admin.otpExpires = null;
      await admin.save();

      res.status(200).json({ message: "Password reset successfully. You can now login." });
    } catch (err) {
      console.error("Reset Password error:", err);
      res.status(500).json({ error: "Internal server error" });
    }
  },
  
};


module.exports = AdminController;
