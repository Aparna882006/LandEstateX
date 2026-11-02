require("dotenv").config();

const fs = require("fs");
const mongoose = require("mongoose");
const Property = require("./src/models/Property.model");

const ACCESS_KEY = process.env.UNSPLASH_ACCESS_KEY;

if (!ACCESS_KEY) {
  throw new Error("UNSPLASH_ACCESS_KEY missing in backend/.env");
}

const searches = {
  apartment: "residential apartment building exterior balconies architecture",
  villa: "independent luxury house villa exterior architecture",
  plot: "vacant residential land plot aerial view",
  commercial: "commercial office retail building exterior architecture"
};

function escapeHtml(value = "") {
  return String(value).replace(/[&<>"']/g, char => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[char]);
}

async function getPhotos(query) {
  const url = new URL("https://api.unsplash.com/search/photos");

  url.searchParams.set("query", query);
  url.searchParams.set("per_page", "30");
  url.searchParams.set("orientation", "landscape");

  const response = await fetch(url, {
    headers: {
      Authorization: `Client-ID ${ACCESS_KEY}`
    }
  });

  if (!response.ok) {
    throw new Error(`Unsplash error ${response.status}: ${await response.text()}`);
  }

  const data = await response.json();

  return (data.results || []).map(photo => ({
    id: photo.id,
    url: photo.urls.regular,
    page: photo.links.html,
    description: photo.alt_description || photo.description || "No description available",
    photographer: photo.user?.name || "Unknown"
  }));
}

function normalizeType(value = "") {
  const type = String(value).toLowerCase();

  if (type.includes("apartment") || type.includes("flat")) return "apartment";
  if (type.includes("villa") || type.includes("house")) return "villa";
  if (type.includes("plot") || type.includes("land")) return "plot";
  if (type.includes("commercial") || type.includes("office") || type.includes("shop")) return "commercial";

  return "apartment";
}

async function main() {
  await mongoose.connect(process.env.MONGO_URI);

  const properties = await Property.find({
    "location.city": /^Lucknow$/i,
    "images.url": /picsum\.photos/i
  })
  .select("title property_type location images")
  .lean();

  console.log("Confirmed Lucknow records:", properties.length);

  if (properties.length !== 30) {
    throw new Error(
      `Expected 30 Lucknow records, found ${properties.length}. Stopping preview.`
    );
  }

  const photoPools = {};

  for (const [type, query] of Object.entries(searches)) {
    console.log(`Fetching ${type} images...`);

    photoPools[type] = await getPhotos(query);

    console.log(`${type}: ${photoPools[type].length} images`);

    if (!photoPools[type].length) {
      throw new Error(`No Unsplash images found for ${type}`);
    }
  }

  const usedPhotos = new Set();

  const cards = properties.map((property, index) => {
    const type = normalizeType(property.property_type);
    const pool = photoPools[type];

    let photo = pool.find(item => !usedPhotos.has(item.id));

    if (!photo) {
      photo = pool[index % pool.length];
    }

    usedPhotos.add(photo.id);

    return {
      property,
      type,
      photo
    };
  });

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>LandEstateX - Lucknow Image Review</title>

<style>
* { box-sizing: border-box; }

body {
  margin: 0;
  padding: 25px;
  font-family: Arial, sans-serif;
  background: #f3f4f6;
  color: #202124;
}

header {
  margin-bottom: 25px;
}

h1 {
  margin-bottom: 8px;
}

.note {
  color: #555;
  line-height: 1.6;
}

.count {
  font-weight: bold;
  margin-top: 15px;
}

.section {
  margin: 30px 0 15px;
  text-transform: capitalize;
}

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.card {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 9px #00000015;
}

.card img {
  width: 100%;
  height: 220px;
  object-fit: cover;
  background: #ddd;
}

.details {
  padding: 15px;
}

.tag {
  display: inline-block;
  padding: 5px 9px;
  background: #e8eefc;
  border-radius: 20px;
  font-size: 12px;
  margin-bottom: 10px;
}

h3 {
  margin: 0 0 10px;
  font-size: 17px;
}

.location {
  font-size: 13px;
  color: #555;
  margin-bottom: 10px;
}

.description {
  font-size: 13px;
  color: #555;
  line-height: 1.5;
}

.credit {
  font-size: 12px;
  color: #777;
  margin-top: 12px;
}

a {
  color: #2459a6;
}
</style>
</head>

<body>

<header>
  <h1>LandEstateX — Lucknow Property Image Review</h1>

  <p class="note">
    Review proposed Unsplash images for the 30 affected Lucknow listings.
    These are suggestions, not verified photographs of the actual properties.
  </p>

  <p class="count">
    Total listings: ${cards.length}
  </p>

  <p class="note">
    Database status: No records modified. Original Picsum URLs remain unchanged.
  </p>
</header>

${Object.keys(searches).map(type => `
  <h2 class="section">${escapeHtml(type)} properties</h2>

  <div class="grid">
    ${cards.filter(card => card.type === type).map(({ property, photo }) => `
      <article class="card">
        <img
          src="${escapeHtml(photo.url)}"
          alt="${escapeHtml(photo.description)}"
          loading="lazy"
        >

        <div class="details">
          <span class="tag">${escapeHtml(type.toUpperCase())}</span>

          <h3>${escapeHtml(property.title)}</h3>

          <div class="location">
            ${escapeHtml(property.location?.locality || "")},
            ${escapeHtml(property.location?.city || "Lucknow")}
          </div>

          <div class="description">
            ${escapeHtml(photo.description)}
          </div>

          <div class="credit">
            Photo by ${escapeHtml(photo.photographer)}
            · <a href="${escapeHtml(photo.page)}" target="_blank" rel="noopener">
              View on Unsplash
            </a>
          </div>
        </div>
      </article>
    `).join("")}
  </div>
`).join("")}

</body>
</html>`;

  fs.writeFileSync(
    "lucknow-image-preview.html",
    html,
    "utf8"
  );

  console.log("\nSUCCESS: Preview generated.");
  console.log("File: D:\\LandEstateX\\backend\\lucknow-image-preview.html");
  console.log("Database was NOT modified.");
}

main()
  .catch(error => {
    console.error("\nPREVIEW ERROR:", error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
  });
