const https = require('https');
const fs = require('fs');
const path = require('path');

const places = [
  { term: "Bandipur National Park", filename: "bandipur.jpg" },
  { term: "Pykara Falls", filename: "pykara_falls.jpg" },
  { term: "Pykara Lake", filename: "pykara_lake.jpg" },
  { term: "Government Botanical Garden, Udhagamandalam", filename: "botanical_garden.jpg" },
  { term: "Doddabetta", filename: "doddabetta.jpg" },
  { term: "Ooty Lake", filename: "ooty_lake.jpg" },
  { term: "Ketti Valley", filename: "ketti_valley.jpg" },
  { term: "Sim's Park", filename: "sims_park.jpg" },
  { term: "Dolphin's Nose Coonoor", filename: "dolphins_nose.jpg" },
  { term: "Mudumalai National Park", filename: "mudumalai.jpg" },
  { term: "Chamundeshwari Temple", filename: "chamundeshwari.jpg" },
  { term: "Mysore Palace", filename: "mysore_palace.jpg" }
];

const foods = [
  { term: "Mysore pak", filename: "mysore_pak.jpg" },
  { term: "Dosa", filename: "dosa.jpg" },
  { term: "Vada (food)", filename: "vada.jpg" },
  { term: "Biryani", filename: "biryani.jpg" },
  { term: "South Indian filter coffee", filename: "filter_coffee.jpg" }
];

const placesDir = path.join(__dirname, '../src/assets/places');
const foodDir = path.join(__dirname, '../src/assets/food');

if (!fs.existsSync(placesDir)) fs.mkdirSync(placesDir, { recursive: true });
if (!fs.existsSync(foodDir)) fs.mkdirSync(foodDir, { recursive: true });

function fetchJson(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'OotyTripManagerBot/1.0 (contact@example.com)' } }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch(e) {
          console.error("Non-JSON response from API:", data.substring(0, 50));
          resolve(null);
        }
      });
    }).on('error', reject);
  });
}

const sleep = ms => new Promise(r => setTimeout(r, ms));

function downloadImage(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    https.get(url, { headers: { 'User-Agent': 'OotyTripManagerBot/1.0 (contact@example.com)' } }, (res) => {
      if (res.statusCode === 301 || res.statusCode === 302) {
        return downloadImage(res.headers.location, dest).then(resolve).catch(reject);
      }
      res.pipe(file);
      file.on('finish', () => {
        file.close(resolve);
      });
    }).on('error', (err) => {
      fs.unlink(dest, () => reject(err));
    });
  });
}

async function fetchWikipediaImage(term) {
  try {
    console.log(`Searching Wikipedia for: ${term}`);
    const searchUrl = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(term)}&utf8=&format=json`;
    const searchResult = await fetchJson(searchUrl);
    
    if (!searchResult || !searchResult.query || !searchResult.query.search.length) {
      console.log(`No results for ${term}`);
      return null;
    }
    
    const title = searchResult.query.search[0].title;
    console.log(`Found article: ${title}`);
    
    const imageUrl = `https://en.wikipedia.org/w/api.php?action=query&prop=pageimages&format=json&piprop=original&titles=${encodeURIComponent(title)}`;
    const imageResult = await fetchJson(imageUrl);
    
    const pages = imageResult.query.pages;
    const pageId = Object.keys(pages)[0];
    const original = pages[pageId]?.original;
    
    if (original && original.source) {
      console.log(`Found URL for ${term}`);
      return original.source;
    } else {
      console.log(`No image found for ${title}`);
      return null;
    }
  } catch (error) {
    console.error(`Error fetching ${term}:`, error.message);
    return null;
  }
}

async function run() {
  const result = {};

  for (const place of places) {
    const url = await fetchWikipediaImage(place.term);
    if (url) result[place.filename] = url;
    await sleep(1500);
  }
  
  for (const food of foods) {
    const url = await fetchWikipediaImage(food.term);
    if (url) result[food.filename] = url;
    await sleep(1500);
  }
  
  fs.writeFileSync(path.join(__dirname, '../src/assets/photo_urls.json'), JSON.stringify(result, null, 2));
  console.log("Done fetching image URLs.");
}

run();
