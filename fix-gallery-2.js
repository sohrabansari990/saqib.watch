const fs = require('fs');
let content = fs.readFileSync('src/app/gallery/page.js', 'utf8');

const target2 = `                            <button
                                onClick={() => {
                                    addToCart(quickViewProduct, 1, selectedQuickViewColor || quickViewProduct.variants?.[0]?.color || null);
                                    setQuickViewProduct(null);
                                }}
                                className="w-full bg-gold text-black font-bold uppercase tracking-widest py-4 mb-4 hover:bg-white hover:text-black transition-all duration-300 shadow-lg hover:shadow-gold/20"
                            >
                                Add to Cart
                            </button>`;

const replacement2 = `                            <button
                                onClick={() => {
                                    addToCart(quickViewProduct, 1, selectedQuickViewColor || quickViewProduct.variants?.[0]?.color || null);
                                    setQuickViewProduct(null);
                                }}
                                disabled={quickViewProduct.variants?.find(v => v.color === selectedQuickViewColor)?.available === false}
                                className="w-full bg-gold text-black font-bold uppercase tracking-widest py-4 mb-4 hover:bg-white hover:text-black transition-all duration-300 shadow-lg hover:shadow-gold/20 disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-700 disabled:text-gray-300"
                            >
                                {quickViewProduct.variants?.find(v => v.color === selectedQuickViewColor)?.available === false ? "Out of Stock" : "Add to Cart"}
                            </button>`;

content = content.replace(target2, replacement2);
fs.writeFileSync('src/app/gallery/page.js', content);
