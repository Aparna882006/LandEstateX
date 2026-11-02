require("dotenv").config();

const mongoose = require("mongoose");
const Property = require("./src/models/Property.model");

async function main() {
  await mongoose.connect(process.env.MONGO_URI);

  const properties = await Property.find({
    "location.city": /lucknow/i,
    "images.url": /picsum\.photos/i
  })
  .select("title property_type location images")
  .lean();

  console.log("\n========== LUCKNOW PICSUM AUDIT ==========");
  console.log("Total matching records:", properties.length);

  properties.forEach((p, index) => {
    console.log(`\n${index + 1}. ${p.title}`);
    console.log("Type:", p.property_type);
    console.log("City:", p.location?.city);
    console.log("Locality:", p.location?.locality);
    console.log("Address:", p.location?.address);
  });

  console.log("\nNo database changes made.");
}

main()
  .catch(console.error)
  .finally(() => mongoose.disconnect());
