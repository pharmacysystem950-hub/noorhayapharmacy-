// deleteAllCancelledPurchases.js
const { MongoClient } = require("mongodb");

const uri = "mongodb+srv://Admin:password1234@cluster1.zmuvd1w.mongodb.net/POS_IM_PHARMACY_SYSTEM?retryWrites=true&w=majority&appName=cluster1";

async function deleteAllCancelledPurchases() {
  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log("✅ Connected to MongoDB Atlas...");

    const db = client.db("POS_IM_PHARMACY_SYSTEM");
    const result = await db.collection("cancelled_purchases").deleteMany({});

    console.log(`🗑️ Deleted ${result.deletedCount} cancelled purchase records`);
  } catch (err) {
    console.error("❌ Error deleting cancelled purchases:", err);
  } finally {
    await client.close();
    console.log("✅ Disconnected");
  }
}

deleteAllCancelledPurchases();
