"use client";

import { useEffect, useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProductActions from "@/components/ProductActions";
import { useFavorites } from "@/context/FavoritesContext";
import { Heart } from "lucide-react";
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

              <ProductActions product={product} selectedColor={selectedColor} />
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
