const fs = require('fs');
let content = fs.readFileSync('src/app/product/[id]/page.js', 'utf8');

// The mess is roughly between line 50 and 110 based on the view
// I will just use a regex to find all occurrences of the renderStars function and remove them
// then I will add it back ONCE in the correct place.

// Regex to match the renderStars function block
const renderStarsRegex = /  const renderStars = \(percentage\) => \{[\s\S]*?    \);[\s\S]*?  \};\n\n/g;

content = content.replace(renderStarsRegex, '');

// Now let's find the main ProductPage component and insert it there.
const productPageTarget = `  const { toggleFavorite, isFavorite } = useFavorites();`;
const renderStarsDefinition = `
  const renderStars = (percentage) => {
    if (!percentage) return null;
    const p = Math.max(0, Math.min(100, percentage));
    return (
      <div className="flex items-center gap-2 mb-4" title={\`\${p}% Rating\`}>
        <div className="relative inline-block w-[80px]">
            <div className="flex text-white/20 w-max">
                {[...Array(5)].map((_, i) => <Star key={\`empty-\${i}\`} size={16} fill="currentColor" strokeWidth={0} />)}
            </div>
            <div className="flex text-gold absolute top-0 left-0 overflow-hidden w-max" style={{ clipPath: \`inset(0 \${100 - p}% 0 0)\` }}>
                {[...Array(5)].map((_, i) => <Star key={\`filled-\${i}\`} size={16} fill="currentColor" strokeWidth={0} />)}
            </div>
        </div>
        <span className="text-xs text-white/50">({\${p}}%)</span>
      </div>
    );
  };
`;

if (content.includes(productPageTarget)) {
    content = content.replace(productPageTarget, productPageTarget + renderStarsDefinition);
}

fs.writeFileSync('src/app/product/[id]/page.js', content);
