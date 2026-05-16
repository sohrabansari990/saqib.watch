const fs = require('fs');
let content = fs.readFileSync('src/app/product/[id]/page.js', 'utf8');

const target = `                          style={{ width: "100%", aspectRatio: getFrameAspect(simProduct, simProduct.imageUrl), position: "relative", borderRadius: "1rem", overflow: "hidden", marginBottom: "1.5rem", border: "1px solid rgba(255,255,255,0.1)", boxShadow: "0 25px 50px -12px rgba(0,0,0,0.5)", background: "#111" }}`;
const replacement = `                          style={{ width: "100%", aspectRatio: "3 / 4", position: "relative", borderRadius: "1rem", overflow: "hidden", marginBottom: "1.5rem", border: "1px solid rgba(255,255,255,0.1)", boxShadow: "0 25px 50px -12px rgba(0,0,0,0.5)", background: "#111" }}`;

content = content.replace(target, replacement);

fs.writeFileSync('src/app/product/[id]/page.js', content);
