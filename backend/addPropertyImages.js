import mongoose from "mongoose";
import dotenv from "dotenv";
import Property from "./src/models/Property.model.js";

dotenv.config();

const photoSets = {
  modern: [
    "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1620626011761-996317b8d101?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80",
  ],

  luxury: [
    "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1620626011761-996317b8d101?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80",
  ],

  traditional: [
    "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1620626011761-996317b8d101?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1200&q=80",
  ],

  middleClass: [
    "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1620626011761-996317b8d101?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1200&q=80",
  ],
};

function getPhotoStyle(property, index) {
  const title = property.title?.toLowerCase() || "";

  if (
    title.includes("luxury") ||
    title.includes("premium") ||
    title.includes("royal")
  ) {
    return photoSets.luxury;
  }

  if (
    title.includes("traditional") ||
    title.includes("heritage")
  ) {
    return photoSets.traditional;
  }

  if (
    title.includes("affordable") ||
    title.includes("middle class")
  ) {
    return photoSets.middleClass;
  }

  if (
    property.property_type === "villa"
  ) {
    return photoSets.luxury;
  }

  return index % 2 === 0
    ? photoSets.modern
    : photoSets.middleClass;
}

async function addPropertyImages() {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    const properties = await Property.find({
      title: { $exists: true },
    }).sort({ createdAt: 1 });

    for (let i = 0; i < properties.length; i++) {
      const property = properties[i];

      const selectedPhotos = getPhotoStyle(property, i);

      property.images = selectedPhotos.map((url, index) => ({
        url,
        public_id: `demo-${property._id}-${index + 1}`,
        is_primary: index === 0,
      }));

      await property.save();

      console.log(`Updated: ${property.title}`);
    }

    console.log("All property images updated!");
  } catch (error) {
    console.error("Error updating images:", error);
  } finally {
    await mongoose.disconnect();
  }
}

addPropertyImages();