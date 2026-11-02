require("dotenv").config();

const mongoose = require("mongoose");
const Property = require("./src/models/Property.model");

async function main() {
  await mongoose.connect(process.env.MONGO_URI);

  const docs = await Property.collection
    .find(
      { "images.url": /picsum\.photos/i },
      { projection: { title: 1, images: 1 } }
    )
    .limit(3)
    .toArray();

  console.log("\n========== RAW MONGODB DOCUMENTS ==========");

  docs.forEach((doc, index) => {
    console.log(`\n--- DOCUMENT ${index + 1} ---`);
    console.log(JSON.stringify(doc, null, 2));
  });

  console.log("\n========== PROPERTY SCHEMA PATHS ==========");
  console.log(Object.keys(Property.schema.paths));
}

main()
  .catch(console.error)
  .finally(() => mongoose.disconnect());
