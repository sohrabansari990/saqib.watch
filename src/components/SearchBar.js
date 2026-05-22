"use client";

import { useState, useEffect, useRef } from "react";
import { Search, X } from "lucide-react";
import { collection, query, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import Link from "next/link";
import Image from "next/image";
import { getCachedCatalog } from "@/lib/productCache";
import { useRouter } from "next/navigation";
import { getProductHref } from "@/lib/productSlug";

export default function SearchBar({ isMobile = false, forceOpen = false }) {
    const [isOpen, setIsOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const wrapperRef = useRef(null);
    const router = useRouter();

    useEffect(() => {
        function handleClickOutside(event) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    useEffect(() => {
        const fetchResults = async () => {
            if (!searchQuery.trim()) {
                setResults([]);
                return;
            }

            setLoading(true);
            const term = searchQuery.toLowerCase();

            // Check cache first
            const cached = getCachedCatalog();
            if (cached && cached.products) {
                const matches = cached.products.filter(p => p.name.toLowerCase().includes(term));
                setResults(matches.slice(0, 5));
                setLoading(false);
                return;
            }

            // Fallback to firestore
            try {
                const q = query(collection(db, "products"));
                const snap = await getDocs(q);
                const allProducts = snap.docs.map(d => ({ id: d.id, ...d.data() }));
                const matches = allProducts.filter(p => p.name.toLowerCase().includes(term));
                setResults(matches.slice(0, 5));
            } catch (err) {
                console.error("Search error:", err);
            } finally {
                setLoading(false);
            }
        };

        const timeoutId = setTimeout(() => {
            if ((isOpen || isMobile || forceOpen) && searchQuery) fetchResults();
        }, 300);

        return () => clearTimeout(timeoutId);
    }, [searchQuery, isOpen, isMobile, forceOpen]);

    return (
        <div 
            ref={wrapperRef} 
            className={`relative flex items-center justify-end transition-all duration-500 ease-out ${isMobile ? (isOpen ? 'w-full absolute right-0 bg-dark z-50 px-4' : 'w-auto') : 'w-auto'}`}
            style={isMobile && isOpen ? { top: '0', bottom: '0', height: '100%', display: 'flex', alignItems: 'center' } : {}}
        >
            {isOpen || forceOpen ? (
                <div 
                    className={`flex items-center bg-white/5 backdrop-blur-md rounded-full border border-white/10 transition-all ${isMobile || forceOpen ? 'w-full' : 'w-48 md:w-64'}`}
                    style={{ padding: '8px 16px', display: 'flex', alignItems: 'center' }}
                >
                    <Search size={16} className="text-white/60 mr-2 shrink-0" />
                    <input
                        autoFocus={!forceOpen}
                        type="text"
                        placeholder="Search products..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="bg-transparent border-none outline-none text-white text-sm w-full placeholder:text-white/30"
                        style={{ padding: '0', margin: '0', background: 'transparent' }}
                    />
                    {(isOpen && !forceOpen) && (
                        <button onClick={() => { setIsOpen(false); setSearchQuery(""); }} className="text-white/60 hover:text-white ml-2 shrink-0">
                            <X size={16} />
                        </button>
                    )}
                    
                    {/* Results Dropdown */}
                    {searchQuery && (
                        <div className="absolute top-full left-0 w-full mt-2 bg-dark/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-[100]">
                            {loading ? (
                                <div className="p-6 text-center text-xs text-white/40 tracking-widest uppercase">Searching Catalog...</div>
                            ) : results.length > 0 ? (
                                <ul className="max-h-[60vh] overflow-y-auto">
                                    {results.map((product) => {
                                        const imageUrl = product.images?.[0] || product.imageUrl;
                                        return (
                                            <li key={product.id} className="border-b border-white/5 last:border-0">
                                                <Link 
                                                    href={getProductHref(product)}
                                                    onClick={() => { setIsOpen(false); setSearchQuery(""); }}
                                                    className="flex items-center gap-4 p-4 hover:bg-white/5 transition-colors text-left"
                                                >
                                                    <div className="w-12 h-12 relative rounded-lg overflow-hidden bg-black shrink-0 border border-white/10">
                                                        {imageUrl ? (
                                                            <Image src={imageUrl} alt={product.name} fill sizes="48px" className="object-cover" />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center bg-white/5">
                                                                <Search size={14} className="text-white/20"/>
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm text-white truncate font-medium group-hover:text-gold transition-colors">{product.name}</p>
                                                        <p className="text-xs text-gold font-bold">Rs. {product.price?.toLocaleString()}</p>
                                                    </div>
                                                </Link>
                                            </li>
                                        )
                                    })}
                                </ul>
                            ) : (
                                <div className="p-6 text-center text-xs text-white/40 tracking-widest uppercase">No products found</div>
                            )}
                        </div>
                    )}
                </div>
            ) : (
                <button 
                    onClick={() => setIsOpen(true)}
                    className="relative group text-white/80 hover:text-gold transition-all duration-300 p-2"
                    aria-label="Open search"
                >
                    <Search size={22} />
                    <span className="absolute inset-0 bg-white/5 rounded-full scale-0 group-hover:scale-100 transition-transform duration-300" />
                </button>
            )}
        </div>
    );
}
