const fs = require('fs');
const path = require('path');
const dir = 'public/logos';

const brands = [
  { name: 'Patek Philippe', letterSpacing: 4 },
  { name: 'Seastar', letterSpacing: 5 },
  { name: 'Curren', letterSpacing: 5 },
  { name: 'D-Ziner', letterSpacing: 4 },
  { name: 'Audemars Piguet', letterSpacing: 3 },
  { name: 'Skmei', letterSpacing: 5 },
  { name: 'Pagani Design', letterSpacing: 3 },
  { name: 'Naviforce', letterSpacing: 4 },
  { name: 'Benyar', letterSpacing: 5 },
  { name: 'Rolex', letterSpacing: 6 },
  { name: 'Tissot', letterSpacing: 6 },
  { name: 'Universal Point', letterSpacing: 2 },
  { name: 'Rick', letterSpacing: 8 },
  { name: 'Rado', letterSpacing: 7 },
  { name: 'KWC', letterSpacing: 8 },
  { name: 'Frank Muller', letterSpacing: 3 },
  { name: 'Elegance', letterSpacing: 4 },
  { name: 'Hublot', letterSpacing: 5 },
  { name: 'Carter', letterSpacing: 5 },
  { name: 'Citizen', letterSpacing: 5 },
  { name: 'Megir', letterSpacing: 6 },
];

brands.forEach(function(brand) {
  const name = brand.name;
  const letterSpacing = brand.letterSpacing;
  const chars = name.length;
  const w = Math.max(120, chars * 14 + (chars - 1) * letterSpacing + 32);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} 36" width="${w}" height="36">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#a07830"/>
      <stop offset="50%" stop-color="#c9a96e"/>
      <stop offset="100%" stop-color="#a07830"/>
    </linearGradient>
  </defs>
  <text
    x="50%" y="50%"
    text-anchor="middle"
    dominant-baseline="middle"
    font-family="Georgia, 'Times New Roman', serif"
    font-size="13"
    fill="url(#g)"
    letter-spacing="${letterSpacing}"
    font-weight="400"
  >${name.toUpperCase()}</text>
</svg>`;
  const filename = name.toLowerCase().replace(/[^a-z0-9]/g, '-') + '.svg';
  fs.writeFileSync(path.join(dir, filename), svg);
  console.log('Written ' + filename);
});
console.log('Done!');
