require("dotenv").config();

const mongoose = require("mongoose");
const Property = require("./src/models/Property.model");

async function main() {
  await mongoose.connect(process.env.MONGO_URI);

  const properties = await Property.find({
    "images.url": /picsum\.photos/i
  })
  .select("title city locality address property_type images.url")
  .lean();

  console.log("\n========== ALL PICSUM RECORDS ==========");
  console.log("Total:", properties.length);

  properties.forEach((p, index) => {
    console.log(`\n${index + 1}. ${p.title}`);
    console.log("City:", p.city);
    console.log("Locality:", p.locality);
    console.log("Address:", p.address);
    console.log("Type:", p.property_type);
    console.log("Image:", p.images?.[0]?.url);
  });
}

main()
  .catch(error => console.error(error))
  .finally(() => mongoose.disconnect());
