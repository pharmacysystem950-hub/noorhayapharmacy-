const mongoose = require("mongoose");

const uri = "mongodb+srv://Admin:password1234@cluster1.zmuvd1w.mongodb.net/POS_IM_PHARMACY_SYSTEM?retryWrites=true&w=majority&appName=cluster1";

mongoose.connect(uri)
  .then(async () => {
    console.log("✅ Connected to MongoDB...");

    try {
      // Check if index exists first
      const indexes = await mongoose.connection.db.collection("admins").indexes();
      const hasUsernameIndex = indexes.find(index => index.name === "USERNAME_1");

      if (hasUsernameIndex) {
        const result = await mongoose.connection.db.collection("admins").dropIndex("USERNAME_1");
        console.log("✅ Index dropped:", result);
      } else {
        console.log("ℹ️ No USERNAME_1 index found — nothing to drop.");
      }
    } catch (err) {
      console.error("❌ Error dropping index:", err);
    }

    await mongoose.disconnect();
    console.log("🔌 Disconnected from MongoDB");
  })
  .catch(err => {
    console.error("❌ Connection error:", err);
    process.exit(1);
  });
