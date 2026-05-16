const fs = require('fs');
let content = fs.readFileSync('src/app/product/[id]/page.js', 'utf8');

// 1. Remove percentage from renderStars
content = content.replace(
    /<span className="text-xs text-white\/50">\({p}%\)<\/span>/g,
    ''
);

// 2. Remove the old "Back to Collection" links (desktop and mobile)
const oldBackLinkDesktop = /              <Link\n                href="\/gallery"\n                className="text-gold hover:underline"\n                style={{[\s\S]*?                }}\n              >\n                ← Back to Collection\n              <\/Link>/g;
const oldBackLinkMobile = /              <Link\n                href="\/gallery"\n                className="text-gold hover:underline"\n                style={{[\s\S]*?                }}\n              >\n                ← Back to Collection\n              <\/Link>/g;

content = content.replace(oldBackLinkDesktop, '');
content = content.replace(oldBackLinkMobile, '');

// 3. Add the new Back Button at the top
const containerTop = `<div style={{ padding: "20px 24px 40px 24px", maxWidth: "1560px", margin: "0 auto", position: "relative" }}>`;
const newBackButton = `
          {/* Back Button */}
          <Link
            href="/gallery"
            className="flex items-center gap-2 text-white/60 hover:text-gold transition-colors mb-8 group"
            style={{ width: "fit-content", position: "absolute", top: "-20px", left: "24px" }}
          >
            <div className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center group-hover:border-gold transition-colors">
              <RotateCcw size={14} className="-rotate-90" />
            </div>
            <span className="text-[10px] uppercase tracking-[0.2em] font-bold">Back to Collection</span>
          </Link>`;

if (!content.includes('Back to Collection</span>')) {
    content = content.replace(containerTop, containerTop + newBackButton);
}

// 4. Redesign Review section
const reviewSectionRegex = /<section [\s\S]*?Customer Reviews[\s\S]*?<\/section>/;
const redesignedReviewSection = `
        <section 
            className="w-full bg-[#0a0a0a] border-t border-white/5 flex justify-center"
            style={{ padding: "8vw 0vw", marginTop: "4vw" }}
        >
            <div className="max-w-3xl flex flex-col items-center text-center px-6">
                <h2 className="font-serif text-3xl md:text-4xl text-white mb-6">Customer Reviews</h2>
                <div className="flex flex-col items-center gap-4">
                    <div className="flex gap-2 mb-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <button
                                key={star}
                                onMouseEnter={() => setHoverRating(star)}
                                onMouseLeave={() => setHoverRating(0)}
                                onClick={() => setUserRating(star)}
                                className="transition-all duration-300 hover:scale-125"
                            >
                                <Star 
                                    size={32} 
                                    fill={star <= (hoverRating || userRating) ? "#c9a96e" : "transparent"} 
                                    className={star <= (hoverRating || userRating) ? "text-gold" : "text-white/20"}
                                    strokeWidth={1}
                                />
                            </button>
                        ))}
                    </div>
                    
                    <AnimatePresence mode="wait">
                        {userRating > 0 ? (
                            <motion.div
                                key="thank-you"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="text-center"
                            >
                                <p className="text-gold text-sm font-medium uppercase tracking-widest mb-1">Thank you for rating!</p>
                                <p className="text-white/60 text-xs">Your feedback helps us maintain our standard of excellence.</p>
                            </motion.div>
                        ) : (
                            <motion.p 
                                key="prompt"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="text-white text-lg md:text-xl font-light mb-2"
                                style={{ textAlign: "center", width: "100%" }}
                            >
                                Be the first to review this Masterpiece
                            </motion.p>
                        )}
                    </AnimatePresence>
                </div>
                
                <p className="text-gray-500 text-[10px] uppercase tracking-[0.3em] mt-10">Verified purchase reviews coming soon</p>
                <div className="mt-12 w-full max-w-sm h-px bg-linear-to-r from-transparent via-gold/50 to-transparent opacity-50"></div>
            </div>
        </section>`;

content = content.replace(reviewSectionRegex, redesignedReviewSection);

// Clean up any double code duplication from failed multi_replace
content = content.replace(/borderRadius: "8px",\n                    display: "flex",\n                    alignItems: "center",\n                    justifyContent: "center",\n                    border: "1px solid rgba\(255,255,255,0.05\)",\n                  }},\n                >\n                  <div style={{ color: "#6b7280" }}>No Image Available<\/div>\n                    borderRadius: "8px",\n                    display: "flex",\n                    alignItems: "center",\n                    justifyContent: "center",\n                    border: "1px solid rgba\(255,255,255,0.05\)",\n                  }},\n                >\n                  <div style={{ color: "#6b7280" }}>No Image Available<\/div>/g, 
    `borderRadius: "8px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    border: "1px solid rgba(255,255,255,0.05)",
                  }},
                >
                  <div style={{ color: "#6b7280" }}>No Image Available</div>`);

fs.writeFileSync('src/app/product/[id]/page.js', content);
