const fs = require('fs');
const path = require('path');

const companies = [
  "Patek Philippe", "Seastar", "Curren", "D-Ziner", "Audemars Piguet", "Skmei",
  "Pagani Design", "Fitron", "Naviforce", "Benyar", "Rolex", "Tissot", "Universal Point",
  "Rick", "Rado", "KWC", "Frank Muller", "Elegance", "Hublot", "Carter", "Citizen",
  "Megir", "Design"
];

const dir = path.join(__dirname, 'public', 'logos');
if (!fs.existsSync(dir)){
    fs.mkdirSync(dir, { recursive: true });
}

companies.forEach(name => {
  const filename = name.toLowerCase().replace(/[^a-z0-9]/g, '-') + '.svg';
  const width = Math.max(150, name.length * 18);
  
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} 40" height="40" width="${width}">
  <style>
    text {
      font-family: 'Georgia', serif;
      font-size: 22px;
      fill: #c9a96e;
      font-weight: 500;
      text-anchor: middle;
      dominant-baseline: middle;
      letter-spacing: 3px;
      text-transform: uppercase;
    }
  </style>
  <text x="50%" y="55%">${name}</text>
</svg>`;

  fs.writeFileSync(path.join(dir, filename), svg);
});
console.log("Logos generated!");
