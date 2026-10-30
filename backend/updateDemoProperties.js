require("dotenv").config();

const mongoose = require("mongoose");
const connectDB = require("./src/config/db");
const Property = require("./src/models/Property.model");

// --------------------------------------------------
// REAL-ESTATE DEMO PHOTO LIBRARY
// --------------------------------------------------
// Photos are illustrative demo photos, not verified photos
// of the exact properties in your database.
// Different image URLs are used to reduce repetition.
// --------------------------------------------------

const photoLibrary = {
  modern: [
    "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=1200&q=80",
  ],

  luxury: [
    "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80",
  ],

  traditional: [
    "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80",
  ],

  middleClass: [
    "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1200&q=80",
  ],

  commercial: [
    "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-149736621선?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-149736621선?auto=format&fit=crop&w=1200&q=80",
  ],

  plot: [
    "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=80",
  ],
};

// --------------------------------------------------
// DEMO PRICE DATA
// --------------------------------------------------
// Prices are INR.
// Rent prices are monthly.
// Sale prices are total property prices.
// These are demo values, not official market valuations.
// --------------------------------------------------

const priceByTitle = {
  "Modern 2 BHK Apartment in Gomti Nagar": 6500000,
  "Luxury 3 BHK Apartment in Indira Nagar": 8500000,
  "Independent Villa in Jankipuram": 9500000,
  "Residential Plot in Sultanpur Road": 3500000,
  "Commercial Space in Hazratganj": 12500000,
  "2 BHK Flat for Rent in Aliganj": 18000,
  "3 BHK Apartment in Mahanagar": 7800000,
  "Independent House in Rajajipuram": 7200000,
  "Residential Plot in Faizabad Road": 2800000,
  "Office Space in Gomti Nagar": 45000,
  "Affordable 1 BHK Apartment in Chinhat": 2800000,
  "Premium 4 BHK Villa in Sushant Golf City": 18000000,
  "Residential Plot in Raebareli Road": 2200000,
  "Retail Shop in Aminabad": 6000000,
  "2 BHK Apartment for Rent in Vikas Nagar": 16000,
  "3 BHK Apartment in Ashiyana": 6800000,
  "Independent Villa in Alambagh": 8200000,
  "Plot in Kursi Road": 1900000,
  "Commercial Office in Vibhuti Khand": 55000,
  "2 BHK Apartment in Krishna Nagar": 4200000,
  "Luxury Villa in Gomti Nagar Extension": 15500000,
  "Plot in Deva Road": 1700000,
  "Commercial Shop in Bhootnath Market": 4800000,
  "1 BHK Apartment for Rent in Gomti Nagar": 14000,
  "3 BHK Apartment in Sarojini Nagar": 5200000,
  "Independent House in Kalyanpur": 5800000,
  "Plot in Mohanlalganj": 1400000,
  "Commercial Building in Charbagh": 11000000,
  "2 BHK Apartment in Tedhi Pulia": 3900000,
  "Premium 3 BHK Villa in Faizabad Road": 10500000,
};

// --------------------------------------------------
// TITLE-BASED PHOTO STYLE
// --------------------------------------------------

function getPhotoStyle(property) {
  const title = property.title.toLowerCase();

  if (
    title.includes("commercial") ||
    title.includes("office") ||
    title.includes("shop") ||
    title.includes("retail")
  ) {
    return "commercial";
  }

  if (
    title.includes("plot") ||
    title.includes("residential land")
  ) {
    return "plot";
  }

  if (
    title.includes("luxury") ||
    title.includes("premium") ||
    title.includes("royal")
  ) {
    return "luxury";
  }

  if (
    title.includes("traditional") ||
    title.includes("heritage")
  ) {
    return "traditional";
  }

  if (
    title.includes("affordable") ||
    title.includes("middle class") ||
    title.includes("1 bhk")
  ) {
    return "middleClass";
  }

  if (property.property_type === "villa") {
    return "luxury";
  }

  return "modern";
}

// --------------------------------------------------
// UPDATE PROPERTIES
// --------------------------------------------------

async function updateDemoProperties() {
  try {
    await connectDB();

    const properties = await Property.find({
      title: { $in: Object.keys(priceByTitle) },
    });

    console.log(`Found ${properties.length} properties`);

    for (let i = 0; i < properties.length; i++) {
      const property = properties[i];

      // Set demo price
      if (priceByTitle[property.title] !== undefined) {
        property.price = priceByTitle[property.title];
      }

      const style = getPhotoStyle(property);
      const photos = photoLibrary[style];

      // Rotate the images based on the property index.
      // This changes the image order between properties.
      const rotatedPhotos = photos.map((_, photoIndex) => {
        const selectedIndex =
          (photoIndex + i) % photos.length;

        return photos[selectedIndex];
      });

      property.images = rotatedPhotos.map((url, imageIndex) => ({
        url,
        public_id: `demo-${property._id}-${imageIndex + 1}`,
        is_primary: imageIndex === 0,
      }));

      await property.save();

      console.log(
        `Updated: ${property.title} | ₹${property.price} | Style: ${style}`
      );
    }

    console.log("Demo property update completed!");
  } catch (error) {
    console.error("Update error:", error);
  } finally {
    await mongoose.disconnect();
  }
}

updateDemoProperties();