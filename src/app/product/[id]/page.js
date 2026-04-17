"use client";

import { useEffect, useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { doc, getDoc, collection, query, where, limit, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProductActions from "@/components/ProductActions";
import { useFavorites } from "@/context/FavoritesContext";
import { Heart, ShieldCheck, Truck, RotateCcw, Star } from "lucide-react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import Image from "next/image";

export default function ProductPage() {
  const { id } = useParams();
  const router = useRouter();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedColor, setSelectedColor] = useState(null);
  const [selectedThumbIndex, setSelectedThumbIndex] = useState(0);
  const [similarProducts, setSimilarProducts] = useState([]);
  const { toggleFavorite, isFavorite } = useFavorites();

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const docRef = doc(db, "products", id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = { id: docSnap.id, ...docSnap.data() };
          setProduct(data);
          if (data.variants && data.variants.length > 0) {
            setSelectedColor(data.variants[0].color);
          }

          // Fetch Similar Products
          if (data.category) {
            try {
              const q = query(
                collection(db, "products"),
                where("category", "==", data.category),
                limit(5)
              );
              const simSnap = await getDocs(q);
              const simList = simSnap.docs
                .map((d) => ({ id: d.id, ...d.data() }))
                .filter((d) => d.id !== id)
                .slice(0, 4);
              setSimilarProducts(simList);
            } catch (err) {
              console.error("Failed to fetch similar:", err);
            }
          }
        } else {
          router.push("/gallery");
        }
      } catch (error) {
        console.error("Error fetching product:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id, router]);

  // Build flat list of ALL images across all variants (or general images)
  const allImages = useMemo(() => {
    if (!product) return [];
    const hasVariants = product.variants && product.variants.length > 0;
    if (hasVariants) {
      const imgs = [];
      product.variants.forEach((variant) => {
        (variant.images || []).forEach((url) => {
          imgs.push({ url, color: variant.color });
        });
      });
      return imgs;
    }
    if (product.images && product.images.length > 0) {
      return product.images.map((url) => ({ url, color: null }));
    }
    if (product.imageUrl) {
      return [{ url: product.imageUrl, color: null }];
    }
    return [];
  }, [product]);

  if (loading) {
    return (
      <>
        <Header />
        <main className="pt-24 min-h-screen bg-dark flex items-center justify-center">
          <div className="text-white animate-pulse">Loading Product...</div>
        </main>
        <Footer />
      </>
    );
  }

  if (!product) return null;

  const hasVariants = product.variants && product.variants.length > 0;
  const mainImage = allImages[selectedThumbIndex] || allImages[0];

  // Click a thumbnail: show that image & update selected color
  const handleThumbClick = (idx) => {
    setSelectedThumbIndex(idx);
    const img = allImages[idx];
    if (img && img.color) setSelectedColor(img.color);
  };

  // Click a color swatch: jump to first image of that color
  const handleColorChange = (color) => {
    setSelectedColor(color);
    const firstIdx = allImages.findIndex((img) => img.color === color);
    if (firstIdx !== -1) setSelectedThumbIndex(firstIdx);
  };

  return (
    <>
      <Header />
      <main className="min-h-screen bg-dark" style={{ paddingTop: "100px" }}>
        <div style={{ padding: "20px 24px 40px 24px" }}>
          {/* ===== DESKTOP: 3-column (thumbs | main image | details) ===== */}
          <div
            className="hidden lg:flex"
            style={{ gap: "24px", alignItems: "flex-start" }}
          >
            {/* Column 1 — Vertical Thumbnails (ALL images from ALL colors) */}
            <div
              style={{
                width: "80px",
                flexShrink: 0,
                display: "flex",
                flexDirection: "column",
                gap: "10px",
                position: "sticky",
                top: "110px",
                maxHeight: "calc(100vh - 140px)",
                overflowY: "auto",
              }}
            >
              {allImages.map((img, idx) => (
                <button
                  key={`vthumb-${idx}`}
                  onClick={() => handleThumbClick(idx)}
                  style={{
                    width: "80px",
                    height: "80px",
                    flexShrink: 0,
                    position: "relative",
                    borderRadius: "6px",
                    overflow: "hidden",
                    border:
                      selectedThumbIndex === idx
                        ? "2px solid #c9a96e"
                        : "2px solid rgba(255,255,255,0.1)",
                    cursor: "pointer",
                    transition: "border-color 0.2s",
                  }}
                >
                  <Image
                    src={img.url}
                    alt={`Thumb ${idx + 1}`}
                    fill
                    sizes="80px"
                    className="object-cover"
                  />
                </button>
              ))}
            </div>

            {/* Column 2 — Main Image (single selected image, no carousel) */}
            <div style={{ flex: "1", maxWidth: "550px", position: "relative" }}>
              {/* Favorite button */}
              <button
                onClick={() => toggleFavorite(product)}
                style={{
                  position: "absolute",
                  top: "12px",
                  right: "12px",
                  zIndex: 20,
                  width: "40px",
                  height: "40px",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  transition: "all 0.3s",
                  border: "none",
                  background: isFavorite(product.id)
                    ? "rgba(255,255,255,0.9)"
                    : "rgba(0,0,0,0.4)",
                  color: isFavorite(product.id) ? "#ef4444" : "#fff",
                }}
              >
                <Heart
                  size={20}
                  fill={isFavorite(product.id) ? "currentColor" : "none"}
                />
              </button>

              {product.mode && product.mode !== "new" && (
                <span
                  style={{
                    position: "absolute",
                    top: "12px",
                    left: "12px",
                    zIndex: 20,
                    background: "#c9a96e",
                    color: "#000",
                    fontSize: "11px",
                    fontWeight: "bold",
                    padding: "4px 12px",
                    textTransform: "uppercase",
                    letterSpacing: "0.1em",
                  }}
                >
                  {product.mode}
                </span>
              )}

              {mainImage ? (
                <div
                  style={{
                    position: "relative",
                    borderRadius: "8px",
                    overflow: "hidden",
                    border: "1px solid rgba(255,255,255,0.05)",
                    // background: "#1a1a1a",
                    aspectRatio: "5 / 5",
                  }}
                >
                  <Image
                    key={mainImage.url}
                    src={mainImage.url}
                    alt={product.name}
                    fill
                    sizes="(min-width: 1024px) 40vw, 90vw"
                    priority
                    style={{ objectFit: "contain" }}
                  />
                </div>
              ) : (
                <div
                  style={{
                    aspectRatio: "4/5",
                    background: "#1a1a1a",
                    borderRadius: "8px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    border: "1px solid rgba(255,255,255,0.05)",
                  }}
                >
                  <div style={{ color: "#6b7280" }}>No Image Available</div>
                </div>
              )}
            </div>

            {/* Column 3 — Product Details */}
            <div style={{ flex: "1", minWidth: 0, paddingTop: "4px" }}>
              <Link
                href="/gallery"
                className="text-gold hover:underline"
                style={{
                  fontSize: "11px",
                  letterSpacing: "0.2em",
                  textTransform: "uppercase",
                  marginBottom: "16px",
                  display: "inline-block",
                }}
              >
                ← Back to Collection
              </Link>
              <h1
                className="font-serif text-white"
                style={{
                  fontSize: "clamp(28px, 3vw, 48px)",
                  fontWeight: 300,
                  marginBottom: "12px",
                }}
              >
                {product.name}
              </h1>
              <p
                style={{
                  fontSize: "24px",
                  color: "#c9a96e",
                  marginBottom: "20px",
                }}
              >
                Rs. {product.price?.toLocaleString()}
              </p>

              {hasVariants && (
                <div style={{ marginBottom: "20px" }}>
                  <span
                    style={{
                      color: "#9ca3af",
                      fontSize: "12px",
                      textTransform: "uppercase",
                      letterSpacing: "0.1em",
                      display: "block",
                      marginBottom: "12px",
                    }}
                  >
                    Color:{" "}
                    <span
                      style={{ color: "#fff", textTransform: "capitalize" }}
                    >
                      {selectedColor}
                    </span>
                  </span>
                  <div
                    style={{ display: "flex", flexWrap: "wrap", gap: "12px" }}
                  >
                    {product.variants.map((variant) => (
                      <button
                        key={variant.color}
                        onClick={() => handleColorChange(variant.color)}
                        style={{
                          width: "36px",
                          height: "36px",
                          borderRadius: "50%",
                          backgroundColor: variant.hex,
                          border:
                            selectedColor === variant.color
                              ? "2px solid #c9a96e"
                              : "2px solid rgba(255,255,255,0.2)",
                          cursor: "pointer",
                          transition: "all 0.2s",
                          transform:
                            selectedColor === variant.color
                              ? "scale(1.1)"
                              : "scale(1)",
                          boxShadow:
                            selectedColor === variant.color
                              ? "0 0 0 3px rgba(201,169,110,0.3)"
                              : "none",
                        }}
                        title={variant.color}
                      />
                    ))}
                  </div>
                </div>
              )}

              <div
                style={{
                  width: "64px",
                  height: "1px",
                  background: "rgba(255,255,255,0.2)",
                  marginBottom: "24px",
                }}
              />
              <p
                style={{
                  color: "#9ca3af",
                  lineHeight: 1.7,
                  marginBottom: "24px",
                  fontSize: "15px",
                  whiteSpace: "pre-line",
                }}
              >
                {product.description}
              </p>

              <div>
                {[
                  { label: "Model", value: product.model || product.id },
                  { label: "Category", value: product.category },
                  { label: "Availability", value: "In Stock", isGreen: true },
                ].map((row) => (
                  <div
                    key={row.label}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "12px 0",
                      borderBottom: "1px solid rgba(255,255,255,0.1)",
                    }}
                  >
                    <span
                      style={{
                        color: "#9ca3af",
                        fontSize: "12px",
                        textTransform: "uppercase",
                        letterSpacing: "0.1em",
                      }}
                    >
                      {row.label}
                    </span>
                    <span
                      style={{
                        color: row.isGreen ? "#22c55e" : "#fff",
                        fontSize: "13px",
                        textTransform:
                          row.label === "Category" ? "capitalize" : "none",
                      }}
                    >
                      {row.value}
                    </span>
                  </div>
                ))}
              </div>

              {/* Trust Badges & Delivery Estimate */}
              <div className="mt-8 mb-6">
                {/* Badges */}
                <div className="flex items-center justify-between border border-white/10 rounded-lg p-4 bg-white/5 backdrop-blur-sm">
                  <div className="flex flex-col items-center gap-2">
                    <ShieldCheck size={18} className="text-gray-400" />
                    <span className="text-[10px] text-gray-400 uppercase tracking-widest text-center">Authentic<br/>Product</span>
                  </div>
                  <div className="w-px h-10 bg-white/10" />
                  <div className="flex flex-col items-center gap-2">
                    <Truck size={18} className="text-gray-400" />
                    <span className="text-[10px] text-gray-400 uppercase tracking-widest text-center">Free<br/>Shipping</span>
                  </div>
                  <div className="w-px h-10 bg-white/10" />
                  <div className="flex flex-col items-center gap-2">
                    <RotateCcw size={18} className="text-gray-400" />
                    <span className="text-[10px] text-gray-400 uppercase tracking-widest text-center">Easy<br/>Returns</span>
                  </div>
                </div>

                {/* Delivery Estimate */}
                <div className="flex items-center gap-3 mt-4 text-gray-300 text-sm bg-white/5 p-3 rounded-lg border border-white/5">
                  <Truck size={18} className="text-gold" />
                  <span>Order before 5PM — <strong className="text-white font-medium">Ships Tomorrow</strong></span>
                </div>
              </div>

              <ProductActions product={product} selectedColor={selectedColor} />
            </div>
          </div>

          {/* ===== MOBILE / TABLET: stacked layout (all images in swiper) ===== */}
          <div
            className="flex flex-col gap-10  lg:hidden"
            
          >
            {/* Mobile — All images swipeable + pagination dots */}
            <div style={{ position: "relative" }}>
              <button
                onClick={() => toggleFavorite(product)}
                style={{
                  position: "absolute",
                  top: "12px",
                  right: "12px",
                  zIndex: 20,
                  width: "40px",
                  height: "40px",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  border: "none",
                  transition: "all 0.3s",
                  background: isFavorite(product.id)
                    ? "rgba(255,255,255,0.9)"
                    : "rgba(0,0,0,0.4)",
                  color: isFavorite(product.id) ? "#ef4444" : "#fff",
                }}
              >
                <Heart
                  size={20}
                  fill={isFavorite(product.id) ? "currentColor" : "none"}
                />
              </button>

              {product.mode && product.mode !== "new" && (
                <span
                  style={{
                    position: "absolute",
                    top: "12px",
                    left: "12px",
                    zIndex: 20,
                    background: "#c9a96e",
                    color: "#000",
                    fontSize: "11px",
                    fontWeight: "bold",
                    padding: "4px 12px",
                    textTransform: "uppercase",
                    letterSpacing: "0.1em",
                  }}
                >
                  {product.mode}
                </span>
              )}

              {allImages.length > 0 ? (
                <div
                  style={{
                    borderRadius: "8px",
                    overflow: "hidden",
                    border: "1px solid rgba(255,255,255,0.05)",
                    background: "#1a1a1a",
                  }}
                >
                  {allImages.length === 1 ? (
                    <div style={{ position: "relative", aspectRatio: "4 / 5" }}>
                      <Image
                        src={allImages[0].url}
                        alt={product.name}
                        fill
                        sizes="95vw"
                        priority
                        style={{ objectFit: "contain" }}
                      />
                    </div>
                  ) : (
                    <Swiper
                      modules={[Navigation, Pagination]}
                      navigation
                      pagination={{ clickable: true }}
                      onSlideChange={(swiper) => {
                        setSelectedThumbIndex(swiper.activeIndex);
                        const img = allImages[swiper.activeIndex];
                        if (img && img.color) setSelectedColor(img.color);
                      }}
                      className="product-carousel"
                      spaceBetween={0}
                      slidesPerView={1}
                    >
                      {allImages.map((img, idx) => (
                        <SwiperSlide key={`m-${idx}`}>
                          <div style={{ position: "relative", aspectRatio: "4 / 5" }}>
                            <Image
                              src={img.url}
                              alt={`${product.name} - ${idx + 1}`}
                              fill
                              sizes="95vw"
                              priority={idx === 0}
                              style={{ objectFit: "contain" }}
                            />
                          </div>
                        </SwiperSlide>
                      ))}
                    </Swiper>
                  )}
                </div>
              ) : (
                <div
                  style={{
                    aspectRatio: "4/5",
                    background: "#1a1a1a",
                    borderRadius: "8px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    border: "1px solid rgba(255,255,255,0.05)",
                  }}
                >
                  <div style={{ color: "#6b7280" }}>No Image Available</div>
                </div>
              )}
            </div>

            {/* Mobile — Details below image */}
            <div
              style={{ display: "flex", flexDirection: "column", gap: "8px" }}
            >
              <Link
                href="/gallery"
                className="text-gold hover:underline"
                style={{
                  fontSize: "11px",
                  letterSpacing: "0.2em",
                  textTransform: "uppercase",
                  marginBottom: "12px",
                  display: "inline-block",
                }}
              >
                ← Back to Collection
              </Link>
              <h1
                className="font-serif text-white"
                style={{
                  fontSize: "clamp(24px, 6vw, 36px)",
                  fontWeight: 300,
                  marginBottom: "8px",
                }}
              >
                {product.name}
              </h1>
              <p
                style={{
                  fontSize: "22px",
                  color: "#c9a96e",
                  marginBottom: "16px",
                }}
              >
                Rs. {product.price?.toLocaleString()}
              </p>

              {hasVariants && (
                <div style={{ marginBottom: "16px" }}>
                  <span
                    style={{
                      color: "#9ca3af",
                      fontSize: "12px",
                      textTransform: "uppercase",
                      letterSpacing: "0.1em",
                      display: "block",
                      marginBottom: "12px",
                    }}
                  >
                    Color:{" "}
                    <span
                      style={{ color: "#fff", textTransform: "capitalize" }}
                    >
                      {selectedColor}
                    </span>
                  </span>
                  <div
                    style={{ display: "flex", flexWrap: "wrap", gap: "12px" }}
                  >
                    {product.variants.map((variant) => (
                      <button
                        key={`m-${variant.color}`}
                        onClick={() => handleColorChange(variant.color)}
                        style={{
                          width: "36px",
                          height: "36px",
                          borderRadius: "50%",
                          backgroundColor: variant.hex,
                          border:
                            selectedColor === variant.color
                              ? "2px solid #c9a96e"
                              : "2px solid rgba(255,255,255,0.2)",
                          cursor: "pointer",
                          transition: "all 0.2s",
                          transform:
                            selectedColor === variant.color
                              ? "scale(1.1)"
                              : "scale(1)",
                          boxShadow:
                            selectedColor === variant.color
                              ? "0 0 0 3px rgba(201,169,110,0.3)"
                              : "none",
                        }}
                        title={variant.color}
                      />
                    ))}
                  </div>
                </div>
              )}

              <div
                style={{
                  width: "64px",
                  height: "1px",
                  background: "rgba(255,255,255,0.2)",
                  marginBottom: "20px",
                }}
              />
              <p
                style={{
                  color: "#9ca3af",
                  lineHeight: 1.7,
                  marginBottom: "20px",
                  fontSize: "15px",
                  whiteSpace: "pre-line",
                }}
              >
                {product.description}
              </p>

              <div>
                {[
                  { label: "Model", value: product.model || product.id },
                  { label: "Category", value: product.category },
                  { label: "Availability", value: "In Stock", isGreen: true },
                ].map((row) => (
                  <div
                    key={row.label}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "12px 0",
                      borderBottom: "1px solid rgba(255,255,255,0.1)",
                    }}
                  >
                    <span
                      style={{
                        color: "#9ca3af",
                        fontSize: "12px",
                        textTransform: "uppercase",
                        letterSpacing: "0.1em",
                      }}
                    >
                      {row.label}
                    </span>
                    <span
                      style={{
                        color: row.isGreen ? "#22c55e" : "#fff",
                        fontSize: "13px",
                        textTransform:
                          row.label === "Category" ? "capitalize" : "none",
                      }}
                    >
                      {row.value}
                    </span>
                  </div>
                ))}
              </div>

              {/* Trust Badges & Delivery Estimate (Mobile) */}
              <div className="mt-6 mb-4">
                {/* Badges */}
                <div className="flex items-center justify-between border border-white/10 rounded-lg p-3 bg-white/5 backdrop-blur-sm">
                  <div className="flex flex-col items-center gap-1.5 w-1/3">
                    <ShieldCheck size={16} className="text-gray-400" />
                    <span className="text-[9px] text-gray-400 uppercase tracking-widest text-center">Authentic<br />Product</span>
                  </div>
                  <div className="w-px h-8 bg-white/10" />
                  <div className="flex flex-col items-center gap-1.5 w-1/3">
                    <Truck size={16} className="text-gray-400" />
                    <span className="text-[9px] text-gray-400 uppercase tracking-widest text-center">Free<br />Shipping</span>
                  </div>
                  <div className="w-px h-8 bg-white/10" />
                  <div className="flex flex-col items-center gap-1.5 w-1/3">
                    <RotateCcw size={16} className="text-gray-400" />
                    <span className="text-[9px] text-gray-400 uppercase tracking-widest text-center">Easy<br />Returns</span>
                  </div>
                </div>

                {/* Delivery Estimate */}
                <div className="flex items-center justify-center gap-3 mt-3 text-gray-300 text-sm bg-white/5 p-3 rounded-lg border border-white/5">
                  <Truck size={16} className="text-gold" />
                  <span className="text-xs">Order before 5PM — <strong className="text-white font-medium">Ships Tomorrow</strong></span>
                </div>
              </div>

              <ProductActions product={product} selectedColor={selectedColor} />
            </div>
          </div>
        </div>

        {/* Customer Reviews Section Placeholder */}
        <section className="border-t border-white/10 py-20 px-6 mt-10">
          <div className="max-w-4xl mx-auto flex flex-col items-center text-center">
            <h2 className="font-serif text-3xl md:text-4xl text-white mb-6">Customer Reviews</h2>
            <div className="flex items-center justify-center gap-2 mb-6">
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={28} className="text-gold" strokeWidth={1} />
              ))}
            </div>
            <p className="text-white text-lg mb-2">Be the first to review this product</p>
            <p className="text-gray-500 text-sm">Verified purchase reviews coming soon</p>
          </div>
        </section>

        {/* You May Also Like Section */}
        {similarProducts.length > 0 && (
          <section className="bg-[#0a0a0a] border-t border-white/5 py-20 px-6 md:px-12 2xl:px-20">
            <div className="max-w-7xl mx-auto text-center">
              <p className="text-gold tracking-[0.3em] text-[10px] md:text-xs uppercase mb-3">
                You May Also Like
              </p>
              <h2 className="font-serif text-3xl md:text-4xl text-white font-light mb-12">
                Similar Masterpieces
              </h2>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 text-left">
                {similarProducts.map((simProduct) => (
                  <Link href={`/product/${simProduct.id}`} key={simProduct.id} className="group block border border-white/5 rounded-lg overflow-hidden bg-[#111] hover:border-gold/30 transition-all">
                    <div className="aspect-[4/5] relative bg-[#1a1a1a]">
                      {simProduct.imageUrl ? (
                        <Image
                          src={simProduct.imageUrl}
                          alt={simProduct.name}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-xs text-gray-600">No Image</div>
                      )}
                    </div>
                    <div className="p-4 md:p-6 text-center">
                      <h3 className="font-serif text-white text-sm md:text-base mb-1 group-hover:text-gold transition-colors">{simProduct.name}</h3>
                      <p className="text-gold text-xs md:text-sm mb-4">Rs. {simProduct.price?.toLocaleString()}</p>
                      <span className="inline-block border border-white/20 text-white text-[10px] md:text-xs uppercase px-4 py-2 group-hover:bg-gold group-hover:text-black group-hover:border-gold transition-colors">
                        View
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}
      </main>
      <Footer />
    </>
  );
}
