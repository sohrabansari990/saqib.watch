const fs = require('fs');
let content = fs.readFileSync('src/app/product/[id]/page.js', 'utf8');

const similarSectionStart = `{/* You May Also Like Section */}`;
const redesignedReviewSection = `
        {/* Customer Reviews Section */}
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
        </section>

        `;

if (content.includes(similarSectionStart)) {
    content = content.replace(similarSectionStart, redesignedReviewSection + similarSectionStart);
} else {
    // fallback
    content = content.replace('{(similarLoading || similarProducts.length > 0) && (', redesignedReviewSection + '{(similarLoading || similarProducts.length > 0) && (');
}

fs.writeFileSync('src/app/product/[id]/page.js', content);
