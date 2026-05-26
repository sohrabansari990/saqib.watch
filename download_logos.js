const google = require('googlethis');
const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

const brands = [
  "Patek Philippe", "Seastar", "Curren", "D-Ziner", "Audemars Piguet", "Skmei",
  "Pagani Design", "Fitron", "Naviforce", "Benyar", "Rolex", "Tissot", "Universal Point",
  "Rick", "Rado", "KWC", "Frank Muller", "Elegance", "Hublot", "Carter", "Citizen",
  "Megir"
];

const dir = path.join(__dirname, 'public', 'logos');
if (!fs.existsSync(dir)){
    fs.mkdirSync(dir, { recursive: true });
}

async function download(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    const client = url.startsWith('https') ? https : http;
    client.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, response => {
      if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
        return download(response.headers.location, dest).then(resolve).catch(reject);
      }
      response.pipe(file);
      file.on('finish', () => {
        file.close(resolve);
      });
    }).on('error', err => {
      fs.unlink(dest, () => {});
      reject(err);
    });
  });
}

async function run() {
  for (const brand of brands) {
    console.log("Searching for " + brand);
    try {
      const images = await google.image(`${brand} watch logo transparent`, { safe: false });
      if (images && images.length > 0) {
        let bestImage = images.find(img => img.url.toLowerCase().endsWith('.png')) || images[0];
        const filename = brand.toLowerCase().replace(/[^a-z0-9]/g, '-') + '.png';
        await download(bestImage.url, path.join(dir, filename));
        console.log("Downloaded " + filename);
      }
    } catch (e) {
      console.log("Error on " + brand, e.message);
    }
    await new Promise(r => setTimeout(r, 1000));
  }
}
run();
