const mongoose = require("mongoose");

const AdminSchema = new mongoose.Schema({
  USERNAME: { type: String, required: true },
  PASSWORD: { type: String, required: true },
});

const Admin = mongoose.model("Admin", AdminSchema, "admins");

class AdminModel {
  // ✅ Find admin by username only
  static async findByUsername(USERNAME) {
    return await Admin.findOne({ USERNAME }).exec();
  }

  // ✅ Get admin by ID
  static async findById(ADMIN_ID) {
    return await Admin.findById(ADMIN_ID)
      .select("USERNAME")
      .exec();
  }

  // ✅ Update profile
  static async updateProfile(ADMIN_ID, USERNAME, PASSWORD) {
    const updateData = { USERNAME };
    if (PASSWORD) updateData.PASSWORD = PASSWORD;
    return await Admin.findByIdAndUpdate(ADMIN_ID, updateData, { new: true })
      .select("USERNAME")
      .exec();
  }

  // ✅ Create admin
  static async createAdmin(adminData) {
    const admin = new Admin(adminData);
    return await admin.save();
  }
}

module.exports = AdminModel;
