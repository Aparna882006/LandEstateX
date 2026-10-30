
require("dotenv").config();
const mongoose = require("mongoose");

const MONGO_URI =
  process.env.MONGODB_URI ||
  process.env.MONGO_URI ||
  process.env.DATABASE_URL;

const MAX_SAMPLE_DOCUMENTS = 100;
const MAX_SAMPLE_FIELDS = 15;

function isRelevantKey(key) {
  return /price|amount|value|rate|valuation|cost|rent|sold|transaction|date|time|year|month|period|histor|createdat|updatedat|soldat|listedat|city|locality|location|address|area|propertytype|listingtype/i.test(
    key
  );
}

function shorten(value) {
  if (value instanceof Date) return value.toISOString();

  if (typeof value === "string") {
    return value.length > 120
      ? value.slice(0, 120) + "..."
      : value;
  }

  if (value && typeof value === "object") {
    if (value._id) return String(value._id);
    return JSON.stringify(value).slice(0, 120);
  }

  return value;
}

async function main() {
  if (!MONGO_URI) {
    console.error(
      "\nMongoDB URI nahi mili. Backend ki .env file mein MONGODB_URI, MONGO_URI ya DATABASE_URL check karo.\n"
    );
    process.exitCode = 1;
    return;
  }

  try {
    await mongoose.connect(MONGO_URI);

    console.log("\nConnected to MongoDB");
    console.log("Database:", mongoose.connection.name);

    const collections = await mongoose.connection.db
      .listCollections({}, { nameOnly: true })
      .toArray();

    if (!collections.length) {
      console.log("Database mein koi collection nahi mili.");
      return;
    }

    for (const collectionInfo of collections) {
      const collectionName = collectionInfo.name;
      const collection = mongoose.connection.db.collection(collectionName);

      const count = await collection.countDocuments();

      console.log("\n" + "=".repeat(70));
      console.log("COLLECTION:", collectionName);
      console.log("DOCUMENT COUNT:", count);

      if (count === 0) {
        console.log("Collection empty hai.");
        continue;
      }

      const documents = await collection
        .find({})
        .limit(MAX_SAMPLE_DOCUMENTS)
        .toArray();

      const relevantDocuments = [];

      for (const doc of documents) {
        const fields = {};

        for (const [key, value] of Object.entries(doc)) {
          if (isRelevantKey(key)) {
            fields[key] = shorten(value);
          }
        }

        if (Object.keys(fields).length > 0) {
          relevantDocuments.push(fields);
        }
      }

      console.log(
        "SAMPLED DOCUMENTS:",
        documents.length,
        "(maximum",
        MAX_SAMPLE_DOCUMENTS + ")"
      );

      console.log(
        "DOCUMENTS WITH POSSIBLE PRICE/HISTORY FIELDS:",
        relevantDocuments.length
      );

      if (relevantDocuments.length > 0) {
        console.log(
          JSON.stringify(
            relevantDocuments.slice(0, MAX_SAMPLE_FIELDS),
            null,
            2
          )
        );
      } else {
        console.log(
          "Sampled documents mein obvious price/date/location fields nahi mile."
        );

        console.log(
          "Sample field names:",
          Object.keys(documents[0]).join(", ")
        );
      }
    }

    console.log("\nAudit complete. Is script ne database mein koi data modify nahi kiya.");
  } catch (error) {
    console.error("\nAudit failed:", error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect().catch(() => {});
  }
}

main();
