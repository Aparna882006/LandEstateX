require("dotenv").config();
const mongoose = require("mongoose");

const uri =
  process.env.MONGODB_URI ||
  process.env.MONGO_URI ||
  process.env.DATABASE_URL;

async function main() {
  if (!uri) throw new Error("MongoDB URI backend .env mein nahi mili.");

  await mongoose.connect(uri);

  try {
    const collection = mongoose.connection.db.collection("properties");

    const summary = await collection.aggregate([
      {
        $group: {
          _id: { status: "$status", listing_type: "$listing_type" },
          count: { $sum: 1 },
          valid_price_count: {
            $sum: {
              $cond: [{ $gt: [{ $ifNull: ["$price", 0] }, 0] }, 1, 0]
            }
          },
          valid_area_count: {
            $sum: {
              $cond: [{ $gt: [{ $ifNull: ["$area_sqft", 0] }, 0] }, 1, 0]
            }
          },
          oldest_created: { $min: "$created_at" },
          newest_created: { $max: "$created_at" }
        }
      },
      { $sort: { "_id.status": 1, "_id.listing_type": 1 } }
    ]).toArray();

    console.log("\n=== LISTING SUMMARY ===");
    console.log(JSON.stringify(summary, null, 2));

    const locations = await collection.aggregate([
      { $match: { status: "approved" } },
      {
        $group: {
          _id: {
            city: "$location.city",
            locality: "$location.locality",
            property_type: "$property_type",
            listing_type: "$listing_type"
          },
          count: { $sum: 1 },
          min_price: { $min: "$price" },
          max_price: { $max: "$price" },
          avg_price: { $avg: "$price" }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 30 }
    ]).toArray();

    console.log("\n=== APPROVED LISTINGS BY LOCATION / TYPE ===");
    console.log(JSON.stringify(locations, null, 2));
    console.log("\nAnalysis complete. Database unchanged.");
  } finally {
    await mongoose.disconnect();
  }
}

main().catch(async error => {
  console.error("Analysis failed:", error.message);
  await mongoose.disconnect().catch(() => {});
  process.exitCode = 1;
});
