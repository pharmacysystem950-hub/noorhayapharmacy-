// deleteAllProductSold.js
const { MongoClient } = require("mongodb");

const uri = "mongodb+srv://Admin:password1234@cluster1.zmuvd1w.mongodb.net/POS_IM_PHARMACY_SYSTEM?retryWrites=true&w=majority&appName=cluster1";

async function deleteAllProductSold() {
  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log("✅ Connected to MongoDB Atlas...");

    const db = client.db("POS_IM_PHARMACY_SYSTEM");
    const result = await db.collection("product_sold").deleteMany({});

    console.log(`🗑️ Deleted ${result.deletedCount} sales records`);
  } catch (err) {
    console.error("❌ Error deleting sales:", err);
  } finally {
    await client.close();
    console.log("✅ Disconnected");
  }
}

deleteAllProductSold();
