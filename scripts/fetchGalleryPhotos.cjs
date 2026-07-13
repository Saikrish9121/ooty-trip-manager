const https = require('https');
const fs = require('fs');
const path = require('path');

const places = [
  // Ooty & Coonoor
  { term: "Government Botanical Garden, Udhagamandalam", label: "Botanical Garden, Ooty", filename: "botanical_garden" },
  { term: "Ooty Lake", label: "Ooty Lake", filename: "ooty_lake" },
  { term: "Doddabetta", label: "Doddabetta Peak", filename: "doddabetta" },
  { term: "Sim's Park", label: "Sim's Park, Coonoor", filename: "sims_park" },
  { term: "Dolphin's Nose Coonoor", label: "Dolphin's Nose, Coonoor", filename: "dolphins_nose" },
  // Kotagiri
  { term: "Catherine Falls", label: "Catherine Falls, Kotagiri", filename: "catherine_falls" },
  { term: "Kodanad View Point", label: "Kodanad View Point", filename: "kodanad" },
  { term: "Kotagiri", label: "Kotagiri Tea Estates", filename: "kotagiri" },
  // Masinagudi / Mudumalai
  { term: "Mudumalai National Park", label: "Mudumalai Safari", filename: "mudumalai" },
  { term: "Moyar River", label: "Moyar River, Masinagudi", filename: "moyar" }
];

const foods = [
  { term: "Varkey", label: "Ooty Varkey", filename: "varkey" },
  { term: "Homemade chocolate Ooty", label: "Ooty Chocolates", filename: "ooty_chocolates" },
  { term: "Mysore pak", label: "Mysore Pak", filename: "mysore_pak" },
  { term: "Set dosa", label: "Set Dosa", filename: "set_dosa" },
  { term: "South Indian Thali", label: "South Indian Meals", filename: "meals" },
  { term: "Indian filter coffee", label: "Filter Coffee", filename: "filter_coffee" }
];

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
  const result = { places: [], foods: [] };

  for (const place of places) {
    const url = await fetchWikipediaImage(place.term);
    if (url) {
      result.places.push({ id: place.filename, label: place.label, url });
    }
    await sleep(1500);
  }
  
  for (const food of foods) {
    const url = await fetchWikipediaImage(food.term);
    if (url) {
      result.foods.push({ id: food.filename, label: food.label, url });
    }
    await sleep(1500);
  }
  
  fs.writeFileSync(path.join(__dirname, '../src/assets/gallery_urls.json'), JSON.stringify(result, null, 2));
  console.log("Done fetching gallery URLs.");
}

run();
