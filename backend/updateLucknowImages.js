require("dotenv").config();

const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");
const Property = require("./src/models/Property.model");

const PREVIEW_FILE = path.join(__dirname, "lucknow-image-preview.html");

function decodeHtml(value = "") {
  return String(value)
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

function extractApprovedImages(html) {
  const cards = [...html.matchAll(
    /<article class="card">([\s\S]*?)<\/article>/g
  )];

  const result = new Map();

  for (const match of cards) {
    const card = match[1];

    const titleMatch = card.match(/<h3>([\s\S]*?)<\/h3>/);
    const imageMatch = card.match(/<img\s+src="([^"]+)"/);

    if (!titleMatch || !imageMatch) {
      throw new Error("Preview card is missing a title or image.");
    }

    const title = decodeHtml(titleMatch[1].trim());
    const url = decodeHtml(imageMatch[1]);

    if (!url.startsWith("https://images.unsplash.com/")) {
      throw new Error(`Unapproved image URL for: ${title}`);
    }

    if (result.has(title)) {
      throw new Error(`Duplicate property title in preview: ${title}`);
    }

    result.set(title, url);
  }

  return result;
}

async function main() {
  if (!fs.existsSync(PREVIEW_FILE)) {
    throw new Error("Preview HTML not found. Cannot continue.");
  }

  await mongoose.connect(process.env.MONGO_URI);

  const html = fs.readFileSync(PREVIEW_FILE, "utf8");
  const approvedImages = extractApprovedImages(html);

  const properties = await Property.find({
    "location.city": /^Lucknow$/i,
    "images.url": /picsum\.photos/i
  }).lean();

  console.log("Target Lucknow records:", properties.length);
  console.log("Approved preview images:", approvedImages.size);

  if (properties.length !== 30 || approvedImages.size !== 30) {
    throw new Error("Expected exactly 30 records and 30 approved images. Stopping.");
  }

  const backup = [];
  const updates = [];

  for (const property of properties) {
    const approvedUrl = approvedImages.get(property.title);

    if (!approvedUrl) {
      throw new Error(`No approved preview image for: ${property.title}`);
    }

    const updatedImages = property.images.map(image => {
      if (/picsum\.photos/i.test(image.url || "")) {
        return { ...image, url: approvedUrl };
      }

      return image;
    });

    if (JSON.stringify(updatedImages) === JSON.stringify(property.images)) {
      throw new Error(`No Picsum image replaced for: ${property.title}`);
    }

    backup.push(property);
    updates.push({
      _id: property._id,
      images: updatedImages,
      title: property.title
    });
  }

  const backupFile = path.join(
    __dirname,
    `lucknow-images-backup-${Date.now()}.json`
  );

  fs.writeFileSync(
    backupFile,
    JSON.stringify(backup, null, 2),
    "utf8"
  );

  console.log("Backup created:", backupFile);

  let modified = 0;

  for (const item of updates) {
    const result = await Property.collection.updateOne(
      {
        _id: item._id,
        "location.city": /^Lucknow$/i,
        "images.url": /picsum\.photos/i
      },
      {
        $set: { images: item.images }
      }
    );

    if (result.modifiedCount !== 1) {
      throw new Error(`Update verification failed for: ${item.title}`);
    }

    modified++;
    console.log(`Updated ${modified}/30: ${item.title}`);
  }

  const remaining = await Property.countDocuments({
    "location.city": /^Lucknow$/i,
    "images.url": /picsum\.photos/i
  });

  console.log("\n========== FINAL VERIFICATION ==========");
  console.log("Updated records:", modified);
  console.log("Remaining Lucknow Picsum records:", remaining);
  console.log("Backup:", backupFile);

  if (remaining !== 0 || modified !== 30) {
    throw new Error("Final verification failed. Check the backup.");
  }

  console.log("\nSUCCESS: All 30 approved Lucknow images updated.");
}

main()
  .catch(error => {
    console.error("\nUPDATE ERROR:", error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
  });
