const mongoose = require("mongoose");

const AdminSchema = new mongoose.Schema({
  USERNAME: { type: String, required: true },
  PHARMACY_NAME: { type: String, required: true },
  PASSWORD: { type: String, required: true },
  EMAIL: { type: String, required: true },
  isVerified: { type: Boolean, default: false },
  otp: { type: String },
  otpExpires: { type: Date },
});

const Admin = mongoose.model("Admin", AdminSchema, "admins");

class AdminModel {
  static async findByUsernameAndPharmacyName(USERNAME, PHARMACY_NAME) {
    return await Admin.findOne({ USERNAME, PHARMACY_NAME }).exec();
  }

  static async findById(ADMIN_ID) {
    return await Admin.findById(ADMIN_ID).select("USERNAME PHARMACY_NAME EMAIL").exec();
  }

  static async findByIdFull(ADMIN_ID) {
    return await Admin.findById(ADMIN_ID).exec();
  }

  static async updateProfile(ADMIN_ID, USERNAME, PHARMACY_NAME, PASSWORD) {
    const updateData = { USERNAME, PHARMACY_NAME };
    if (PASSWORD) updateData.PASSWORD = PASSWORD;
    return await Admin.findByIdAndUpdate(ADMIN_ID, updateData, { new: true })
      .select("USERNAME PHARMACY_NAME EMAIL")
      .exec();
  }

  static async createAdmin(adminData) {
    const admin = new Admin(adminData);
    return await admin.save();
  }

  static async findByEmail(EMAIL) {
    return await Admin.findOne({ EMAIL }).exec();
  }

  static async verifyAdmin(ADMIN_ID) {
    return await Admin.findByIdAndUpdate(
      ADMIN_ID,
      { isVerified: true, otp: null, otpExpires: null },
      { new: true }
    ).exec();
  }
}

module.exports = AdminModel;
