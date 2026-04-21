"use client";

import { useEffect, useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { doc, getDoc, collection, query, where, limit, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import ProductActions from "@/components/ProductActions";
import CollectionLoader from "@/components/CollectionLoader";
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
  const [similarLoading, setSimilarLoading] = useState(false);
  const [selectedColor, setSelectedColor] = useState(null);
  const [selectedThumbIndex, setSelectedThumbIndex] = useState(0);
  const [similarProducts, setSimilarProducts] = useState([]);
  const [userRating, setUserRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [swiper, setSwiper] = useState(null);
  const { toggleFavorite, isFavorite } = useFavorites();

  useEffect(() => {
    let isActive = true;

    const fetchProduct = async () => {
      if (!id) return;
      setLoading(true);
      setSimilarLoading(false);
      setSimilarProducts([]);
      try {
        const docRef = doc(db, "products", id);
        const docSnap = await getDoc(docRef);

        if (!isActive) return;

        if (docSnap.exists()) {
          const data = { id: docSnap.id, ...docSnap.data() };
          setProduct(data);
          setSelectedColor(data.variants && data.variants.length > 0 ? data.variants[0].color : null);
          setLoading(false);

          // Fetch Similar Products
          if (data.category) {
            setSimilarLoading(true);
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
              if (!isActive) return;
              setSimilarProducts(simList);
            } catch (err) {
              console.error("Failed to fetch similar:", err);
            } finally {
              if (isActive) {
                setSimilarLoading(false);
              }
            }
          } else {
            setSimilarLoading(false);
          }
        } else {
          router.push("/gallery");
        }
      } catch (error) {
        console.error("Error fetching product:", error);
      } finally {
        if (isActive) {
          setLoading(false);
          setSimilarLoading(false);
        }
      }
    };

    fetchProduct();
    return () => {
      isActive = false;
    };
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
        <main
          className="pt-24 min-h-screen bg-[#0a0a0a] flex items-center justify-center"
          style={{ padding: "6.5rem 2rem 4.5rem" }}
        >
          <CollectionLoader variant="product" />
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
    if (firstIdx !== -1) {
        setSelectedThumbIndex(firstIdx);
        if (swiper) swiper.slideTo(firstIdx);
    }
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
              <div className="flex items-center justify-between mb-4">
                  <h1
                    className="font-serif text-white"
                    style={{
                      fontSize: "clamp(28px, 3vw, 48px)",
                      fontWeight: 300,
                    }}
                  >
                    {product.name}
                  </h1>
                  <button 
                    onClick={() => {
                        const url = window.location.href;
                        window.open(`https://wa.me/?text=Check out this masterpiece: ${url}`, '_blank');
                    }}
                    className="text-gray-400 hover:text-[#25D366] transition-colors p-3 bg-[#111] border border-white/5 hover:border-[#25D366]/30 rounded-full flex items-center justify-center group shadow-lg"
                    title="Share on WhatsApp"
                  >
                        <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/>
                        </svg>
                  </button>
              </div>
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
              <div style={{ paddingTop: "10px", paddingBottom: "10px" }} className="mt-10 mb-8 border-y border-white/10 py-6">
                <div className="grid grid-cols-1 gap-4 mb-2">
                  {/* Delivery Estimate */}
                  <div className="flex items-center gap-4 text-gray-300 text-sm">
                    <div className="w-8 h-8 rounded-full bg-gold/10 flex items-center justify-center text-gold">
                        <Truck size={16} />
                    </div>
                    <span>Order before 5PM — <strong className="text-white font-medium">Ships Tomorrow</strong></span>
                  </div>
                  {/* Authenticate */}
                  <div className="flex items-center gap-4 text-gray-300 text-sm">
                    <div className="w-8 h-8 rounded-full bg-gold/10 flex items-center justify-center text-gold">
                        <ShieldCheck size={16} />
                    </div>
                    <span>100% Authentic <strong className="text-white font-medium">Guaranteed</strong></span>
                  </div>
                  {/* Returns */}
                  <div className="flex items-center gap-4 text-gray-300 text-sm">
                    <div className="w-8 h-8 rounded-full bg-gold/10 flex items-center justify-center text-gold">
                        <RotateCcw size={16} />
                    </div>
                    <span>7-Day <strong className="text-white font-medium">Hassle-Free Returns</strong></span>
                  </div>
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
                      onSwiper={setSwiper}
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
              <div className="flex items-center justify-between mb-2">
                  <h1
                    className="font-serif text-white"
                    style={{
                      fontSize: "clamp(24px, 6vw, 36px)",
                      fontWeight: 300,
                    }}
                  >
                    {product.name}
                  </h1>
                  <button 
                    onClick={() => {
                        const url = window.location.href;
                        window.open(`https://wa.me/?text=Check out this masterpiece: ${url}`, '_blank');
                    }}
                    className="text-gray-400 hover:text-[#25D366] transition-colors p-2.5 bg-[#111] border border-white/5 rounded-full flex items-center justify-center shrink-0"
                  >
                        <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/>
                        </svg>
                  </button>
              </div>
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
              <div className="mt-8 mb-6 border-y border-white/10 py-5">
                <div className="flex flex-col gap-3 mb-2">
                  <div className="flex items-center gap-3 text-gray-300 text-xs">
                    <div className="w-6 h-6 rounded-full bg-gold/10 flex items-center justify-center shrink-0 text-gold">
                        <Truck size={14} />
                    </div>
                    <span>Order before 5PM — <strong className="text-white font-medium">Ships Tomorrow</strong></span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-300 text-xs">
                    <div className="w-6 h-6 rounded-full bg-gold/10 flex items-center justify-center shrink-0 text-gold">
                        <ShieldCheck size={14} />
                    </div>
                    <span>100% Authentic <strong className="text-white font-medium">Guaranteed</strong></span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-300 text-xs">
                    <div className="w-6 h-6 rounded-full bg-gold/10 flex items-center justify-center shrink-0 text-gold">
                        <RotateCcw size={14} />
                    </div>
                    <span>7-Day <strong className="text-white font-medium">Hassle-Free Returns</strong></span>
                  </div>
                </div>
              </div>

              <ProductActions product={product} selectedColor={selectedColor} />
            </div>
          </div>
        </div>

        {/* Customer Reviews Section */}
        <section 
            className="w-full bg-[#0a0a0a] border-t border-white/5 flex justify-center"
            style={{ padding: "8vw 0vw", marginTop: "4vw" }}
        >
            <div className="max-w-3xl flex flex-col items-center text-center px-6">
                <h2 className="font-serif text-3xl md:text-4xl text-white mb-6">Customer Reviews</h2>
                <div className="flex items-center justify-center gap-4 mb-8">
                    {[1, 2, 3, 4, 5].map((star) => (
                        <button
                            key={star}
                            onMouseEnter={() => setHoverRating(star)}
                            onMouseLeave={() => setHoverRating(0)}
                            onClick={() => setUserRating(star)}
                            className="relative group transition-transform duration-300 hover:scale-125 focus:outline-none"
                        >
                            <Star 
                                size={32} 
                                className={cn(
                                    "transition-all duration-300",
                                    (hoverRating || userRating) >= star 
                                        ? "text-gold fill-gold drop-shadow-[0_0_12px_rgba(201,169,76,0.5)]" 
                                        : "text-white/10 hover:text-white/30"
                                )}
                                strokeWidth={1}
                            />
                            {userRating === star && (
                                <motion.div
                                    layoutId="selectedRating"
                                    className="absolute -inset-2 border border-gold/30 rounded-full z-0"
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ duration: 0.4 }}
                                />
                            )}
                        </button>
                    ))}
                </div>
                <AnimatePresence mode="wait">
                    {userRating > 0 ? (
                        <motion.p 
                            key="rating-text"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-gold text-sm tracking-widest uppercase font-bold"
                            style={{ textAlign: "center", width: "100%" }}
                        >
                            Thank you for your {userRating}-star rating!
                        </motion.p>
                    ) : (
                        <motion.p 
                            key="placeholder-text"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-white text-lg md:text-xl font-light mb-2"
                            style={{ textAlign: "center", width: "100%" }}
                        >
                            Be the first to review this Masterpiece
                        </motion.p>
                    )}
                </AnimatePresence>
                <p className="text-gray-500 text-sm uppercase tracking-widest mt-6">Verified purchase reviews coming soon</p>
                <div className="mt-12 w-full max-w-sm h-px bg-linear-to-r from-transparent via-gold/50 to-transparent opacity-50"></div>
            </div>
        </section>

        {/* You May Also Like Section */}
        {(similarLoading || similarProducts.length > 0) && (
          <section 
            className="border-t flex justify-center border-white/5 px-6 md:px-12 2xl:px-20 relative"
            style={{ padding: "3vw 0vw" }}
          >
            <div className="max-w-7xl mx-auto flex flex-col items-center justify-center relative z-10">
                <p 
                    className="text-gold tracking-[0.4em] text-xs font-semibold uppercase mb-4 opacity-80 decoration-gold/50 underline-offset-12 underline decoration-px"
                    style={{ textAlign: "center", width: "100%" }}
                >
                  Similar Masterpieces
                </p>
                <h2 
                    className="font-serif text-4xl md:text-6xl text-white font-light mb-20 leading-tight"
                    style={{ textAlign: "center",paddingTop: "10px", width: "100%" }}
                >
                  You Might Also Like
                </h2>
              {/* </div> */}
              
              {similarLoading ? (
                <div className="w-full mt-10">
                  <CollectionLoader variant="similar" />
                </div>
              ) : (
                <div 
                  style={{ 
                      display: "flex", 
                      justifyContent: "center", 
                      flexWrap: "wrap", 
                      gap: "3rem", 
                      width: "100%",
                      marginTop: "2rem"
                  }}
                >
                  {similarProducts.map((simProduct) => (
                    <Link 
                      href={`/product/${simProduct.id}`} 
                      key={simProduct.id} 
                      style={{ width: "280px", display: "flex", flexDirection: "column", alignItems: "center" }}
                      className="group cursor-pointer"
                    >
                      <div 
                          style={{ width: "100%", aspectRatio: "3/4", position: "relative", borderRadius: "1rem", overflow: "hidden", marginBottom: "1.5rem", border: "1px solid rgba(255,255,255,0.1)", boxShadow: "0 25px 50px -12px rgba(0,0,0,0.5)" }}
                      >
                        {simProduct.imageUrl ? (
                          <Image
                            src={simProduct.imageUrl}
                            alt={simProduct.name}
                            fill
                            className="object-cover group-hover:scale-110 transition-transform duration-700 ease-[cubic-bezier(0.25,1,0.5,1)]"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-xs text-gray-600 bg-dark">No Image</div>
                        )}
                        {/* Gradient overlay mimicking shadcn/21st.dev luxury overlays */}
                        <div className="absolute inset-0 bg-linear-to-t from-black/60 via-black/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 ease-out" />
                        
                        {/* View Button Overlay inside Image Frame */}
                        <div className="absolute bottom-6 left-0 right-0 flex justify-center translate-y-8 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 ease-[cubic-bezier(0.25,1,0.5,1)]">
                           <span style={{padding: "10px"}} className="bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-gold hover:border-gold hover:text-black font-semibold text-xs tracking-widest uppercase px-8 py-3 rounded-full transition-colors shadow-xl">
                              View Details
                           </span>
                        </div>
                      </div>
                      <div className="text-center w-full">
                        <h3 className="font-serif text-white text-lg mb-1 group-hover:text-gold transition-colors">{simProduct.name}</h3>
                        <p className="text-gold text-sm tracking-wide">Rs. {simProduct.price?.toLocaleString()}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
            {/* Ambient luxury glow bounds */}
            <div className="absolute inset-0 pointer-events-none flex justify-center opacity-30">
                <div className="w-[80vw] h-full bg-[radial-gradient(ellipse_at_center,rgba(201,169,76,0.15)_0%,rgba(0,0,0,0)_70%)]" />
            </div>
          </section>
        )}
      </main>
      <Footer />
    </>
  );
}
