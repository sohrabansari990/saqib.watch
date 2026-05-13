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
import { BadgeCheck, Clock3, Heart, PackageCheck, RotateCcw, ShieldCheck, Star, Truck } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import Image from "next/image";
import { cacheProducts, getCachedCatalog, getCachedProduct, getSimilarProducts } from "@/lib/productCache";
import { getImageFrameAspectRatio } from "@/lib/imageFrame";

function isVariantAvailable(variant) {
  return variant?.available !== false && Array.isArray(variant?.images) && variant.images.length > 0;
}

function getInitialSelectedColor(product) {
  const variants = Array.isArray(product?.variants) ? product.variants : [];
  return variants.find(isVariantAvailable)?.color || variants[0]?.color || null;
}

function ProductImageWithSkeleton({ src, alt, sizes = "100vw", priority = false, className = "", style, onLoad }) {
  const [loaded, setLoaded] = useState(false);

  return (
    <>
      {!loaded && <div className="skeleton-surface absolute inset-0 z-10" />}
      <Image
        src={src}
        alt={alt}
        fill
        sizes={sizes}
        priority={priority}
        className={cn(className, "transition-opacity duration-300", loaded ? "opacity-100" : "opacity-0")}
        style={style}
        onLoad={(event) => {
          setLoaded(true);
          onLoad?.(event);
        }}
        onError={() => setLoaded(true)}
      />
    </>
  );
}

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
  const [imageDimensions, setImageDimensions] = useState({});
  const { toggleFavorite, isFavorite } = useFavorites();

  useEffect(() => {
    let isActive = true;

    const fetchProduct = async () => {
      if (!id) return;
      const cachedCatalog = getCachedCatalog();
      const cachedProduct = getCachedProduct(id);

      if (cachedProduct) {
        setProduct(cachedProduct);
        setSelectedColor(getInitialSelectedColor(cachedProduct));
        setLoading(false);

        if (cachedCatalog?.products?.length) {
          setSimilarProducts(getSimilarProducts(cachedCatalog.products, cachedProduct, 4));
        }
      } else {
        setProduct(null);
        setSelectedColor(null);
        setLoading(true);
        setSimilarProducts([]);
      }

      setSimilarLoading(false);

      if (cachedProduct && cachedCatalog?.products?.length && !cachedCatalog.isStale) {
        return;
      }

      try {
        const docRef = doc(db, "products", id);
        const docSnap = await getDoc(docRef);

        if (!isActive) return;

        if (docSnap.exists()) {
          const data = { id: docSnap.id, ...docSnap.data() };
          setProduct(data);
          setSelectedColor(getInitialSelectedColor(data));
          cacheProducts([data]);
          setLoading(false);

          if (cachedCatalog?.products?.length) {
            setSimilarProducts(getSimilarProducts(cachedCatalog.products, data, 4));
          } else if (data.category) {
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
              cacheProducts(simList);
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
      const availableVariants = product.variants.filter(isVariantAvailable);
      const visibleVariants = availableVariants.length > 0 ? availableVariants : product.variants;

      visibleVariants.forEach((variant) => {
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
  const selectedVariant = hasVariants ? product.variants.find((variant) => variant.color === selectedColor) : null;
  const selectedVariantAvailable = !hasVariants || isVariantAvailable(selectedVariant);
  const getFrameAspect = (sourceProduct, imageUrl, fallback = "portrait") =>
    getImageFrameAspectRatio(sourceProduct?.imageAspect, imageDimensions[imageUrl], fallback);
  const handleImageLoad = (imageUrl, event) => {
    if (!imageUrl) return;
    const { naturalWidth, naturalHeight } = event.currentTarget;
    if (!naturalWidth || !naturalHeight) return;

    setImageDimensions((current) => {
      const previous = current[imageUrl];
      if (previous?.width === naturalWidth && previous?.height === naturalHeight) {
        return current;
      }
      return {
        ...current,
        [imageUrl]: { width: naturalWidth, height: naturalHeight },
      };
    });
  };

  // Click a thumbnail: show that image & update selected color
  const handleThumbClick = (idx) => {
    setSelectedThumbIndex(idx);
    const img = allImages[idx];
    if (img && img.color) setSelectedColor(img.color);
  };

  // Click a color swatch: jump to first image of that color
  const handleColorChange = (color) => {
    const variant = product.variants?.find((item) => item.color === color);
    if (variant && !isVariantAvailable(variant)) return;

    setSelectedColor(color);
    const firstIdx = allImages.findIndex((img) => img.color === color);
    if (firstIdx !== -1) {
        setSelectedThumbIndex(firstIdx);
        if (swiper) swiper.slideTo(firstIdx);
    }
  };

  const handleShareOnWhatsApp = () => {
    const url = window.location.href;
    window.open(`https://wa.me/?text=Check out this watch: ${url}`, "_blank");
  };

  const renderColorOptions = (keyPrefix = "color") => {
    if (!hasVariants) return null;

    return (
      <div style={{ marginBottom: "22px" }}>
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
          <span style={{ color: "#fff", textTransform: "capitalize", fontWeight: 700 }}>
            {selectedColor || "Select"}
          </span>
        </span>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
          {product.variants.map((variant) => {
            const isSelected = selectedColor === variant.color;
            const isAvailable = isVariantAvailable(variant);

            return (
              <button
                key={`${keyPrefix}-${variant.color}`}
                type="button"
                onClick={() => handleColorChange(variant.color)}
                disabled={!isAvailable}
                title={isAvailable ? variant.color : `${variant.color} unavailable`}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  minHeight: "42px",
                  padding: "0 13px 0 8px",
                  borderRadius: "999px",
                  border: isSelected ? "1px solid #c9a96e" : "1px solid rgba(255,255,255,0.12)",
                  background: isSelected ? "rgba(201,169,110,0.16)" : "rgba(255,255,255,0.035)",
                  color: isAvailable ? "#f9fafb" : "#6b7280",
                  cursor: isAvailable ? "pointer" : "not-allowed",
                  opacity: isAvailable ? 1 : 0.45,
                  position: "relative",
                  transition: "all 0.2s ease",
                }}
              >
                <span
                  style={{
                    width: "26px",
                    height: "26px",
                    borderRadius: "50%",
                    background: variant.hex,
                    border: variant.color?.toLowerCase() === "white" ? "1px solid rgba(0,0,0,0.25)" : "1px solid rgba(255,255,255,0.25)",
                    boxShadow: isSelected ? "0 0 0 3px rgba(201,169,110,0.32)" : "none",
                  }}
                />
                <span style={{ fontSize: "11px", fontWeight: 800, textTransform: "capitalize", letterSpacing: "0.04em" }}>
                  {variant.color}
                </span>
                {!isAvailable && (
                  <span
                    aria-hidden="true"
                    style={{
                      position: "absolute",
                      left: "10px",
                      right: "10px",
                      top: "50%",
                      height: "1px",
                      background: "rgba(255,255,255,0.55)",
                      transform: "rotate(-12deg)",
                    }}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  const serviceItems = [
    {
      icon: PackageCheck,
      title: "Inspect Before Payment",
      text: "Check the parcel and confirm the watch before handing payment to the rider.",
    },
    {
      icon: Truck,
      title: "Fast Dispatch",
      text: "Most confirmed orders move quickly, with city-by-city updates shared on WhatsApp.",
    },
    {
      icon: BadgeCheck,
      title: "Verified Support",
      text: "We confirm color, model, and availability before dispatch so surprises stay out of the box.",
    },
    {
      icon: Clock3,
      title: "Delay Care",
      text: "If a confirmed order misses the promised 3-day window, support will arrange a fair concession.",
    },
  ];

  const renderServicePromise = () => (
    <div
      style={{
        border: "1px solid rgba(255,255,255,0.08)",
        background: "rgba(255,255,255,0.025)",
        borderRadius: "14px",
        padding: "18px",
        marginTop: "24px",
        marginBottom: "4px",
      }}
    >
      <div style={{ display: "flex", flexWrap: "wrap", gap: "14px" }}>
        {serviceItems.map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.title} style={{ display: "flex", gap: "12px", minWidth: "240px", flex: "1 1 240px" }}>
              <div className="shrink-0 flex items-center justify-center rounded-full bg-gold/10 text-gold" style={{ width: "34px", height: "34px" }}>
                <Icon size={16} />
              </div>
              <div>
                <p style={{ color: "#fff", fontSize: "12px", fontWeight: 800, marginBottom: "4px" }}>{item.title}</p>
                <p style={{ color: "#9ca3af", fontSize: "12px", lineHeight: 1.55 }}>{item.text}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  return (
    <>
      <Header />
      <main className="min-h-screen bg-dark" style={{ paddingTop: "100px" }}>
        <div style={{ padding: "20px 24px 40px 24px", maxWidth: "1560px", margin: "0 auto" }}>
          {/* ===== DESKTOP: 3-column (thumbs | main image | details) ===== */}
          <div
            className="hidden lg:flex"
            style={{ gap: "28px", alignItems: "flex-start", justifyContent: "center" }}
          >
            {/* Column 1 — Vertical Thumbnails (ALL images from ALL colors) */}
            <div
              className="product-thumb-rail"
              style={{
                width: "76px",
                flexShrink: 0,
                display: "flex",
                flexDirection: "column",
                gap: "10px",
                position: "sticky",
                top: "110px",
                maxHeight: "calc(100vh - 140px)",
                overflowY: "auto",
                overflowX: "hidden",
              }}
            >
              {allImages.map((img, idx) => (
                <button
                  key={`vthumb-${idx}`}
                  onClick={() => handleThumbClick(idx)}
                  style={{
                    width: "76px",
                    height: "76px",
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
                    sizes="76px"
                    className="object-cover"
                  />
                </button>
              ))}
            </div>

            {/* Column 2 — Main Image (single selected image, no carousel) */}
            <div style={{ flex: "0 1 620px", maxWidth: "620px", position: "relative" }}>
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

              <div style={{ position: "absolute", top: "16px", left: "0px", zIndex: 20, display: "flex", flexDirection: "column", gap: "8px" }}>
                  {product.mode && product.mode !== "new" && (
                    <span
                      style={{
                        backgroundColor: "#c9a96e",
                        color: "black",
                        fontSize: "11px",
                        fontWeight: "bold",
                        padding: "4px 12px 4px 16px",
                        textTransform: "uppercase",
                        letterSpacing: "0.1em",
                        alignSelf: "flex-start",
                        borderRadius: "0 4px 4px 0",
                        boxShadow: "0 2px 4px rgba(0,0,0,0.2)"
                      }}
                    >
                      {product.mode}
                    </span>
                  )}
                  {!product.soldOut && product.discount > 0 && (
                      <span
                        style={{
                          backgroundColor: "#DC2626",
                          color: "white",
                          fontSize: "11px",
                          fontWeight: "bold",
                          padding: "4px 12px 4px 16px",
                          textTransform: "uppercase",
                          letterSpacing: "0.1em",
                          alignSelf: "flex-start",
                          borderRadius: "0 4px 4px 0",
                          boxShadow: "0 2px 4px rgba(0,0,0,0.2)"
                        }}
                      >
                        -{product.discount}% OFF
                      </span>
                  )}
              </div>
              {product.soldOut && (
                  <div className="absolute top-2 right-2 z-20 pointer-events-none w-[100px] sm:w-[120px]">
                      <img src="/sold-out-removebg-preview.png" alt="Sold Out" className="w-full h-auto drop-shadow-lg" />
                  </div>
              )}

              {mainImage ? (
                <div
                  style={{
                    position: "relative",
                    borderRadius: "8px",
                    overflow: "hidden",
                    border: "1px solid rgba(255,255,255,0.05)",
                    background: "#111",
                    aspectRatio: getFrameAspect(product, mainImage.url),
                  }}
                >
                  <ProductImageWithSkeleton
                    key={mainImage.url}
                    src={mainImage.url}
                    alt={product.name}
                    sizes="(min-width: 1024px) 40vw, 90vw"
                    priority
                    style={{ objectFit: "cover", objectPosition: "center" }}
                    onLoad={(event) => handleImageLoad(mainImage.url, event)}
                  />
                </div>
              ) : (
                <div
                  style={{
                    aspectRatio: getFrameAspect(product, null),
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
            <div style={{ flex: "0 1 620px", maxWidth: "620px", minWidth: 0, paddingTop: "10px" }}>
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
              <div className="flex items-start justify-between gap-4 mb-4">
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
                    onClick={handleShareOnWhatsApp}
                    className="shrink-0 text-[#25D366] hover:text-black transition-colors px-4 py-3 bg-[#25D366]/10 border border-[#25D366]/25 hover:bg-[#25D366] hover:border-[#25D366] rounded-full flex items-center justify-center gap-2 group shadow-lg"
                    title="Share on WhatsApp"
                  >
                    <FaWhatsapp className="h-4 w-4" />
                    <span className="text-[10px] font-bold uppercase tracking-[0.16em]">Share</span>
                  </button>
              </div>
              <div style={{ display: "flex", alignItems: "flex-end", gap: "12px", marginBottom: "20px" }}>
                  <p
                    style={{
                      fontSize: "24px",
                      color: "#c9a96e",
                      fontWeight: "600",
                    }}
                  >
                    Rs. {product.price?.toLocaleString()}
                  </p>
                  {product.discount > 0 && (
                      <p
                        style={{
                          fontSize: "18px",
                          color: "#6b7280",
                          textDecoration: "line-through",
                          marginBottom: "3px",
                          opacity: 0.8
                        }}
                      >
                        Rs. {Math.round(product.price / (1 - product.discount / 100)).toLocaleString()}
                      </p>
                  )}
              </div>

              {renderColorOptions("desktop")}

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
              {renderServicePromise()}
              <div style={{ display: "none", paddingTop: "10px", paddingBottom: "10px" }} className="mt-10 mb-8 border-y border-white/10 py-6">
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

              <ProductActions product={product} selectedColor={selectedColor} selectedVariantAvailable={selectedVariantAvailable} />
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

              <div style={{ position: "absolute", top: "16px", left: "0px", zIndex: 20, display: "flex", flexDirection: "column", gap: "8px" }}>
                  {product.mode && product.mode !== "new" && (
                    <span
                      style={{
                        backgroundColor: "#c9a96e",
                        color: "black",
                        fontSize: "11px",
                        fontWeight: "bold",
                        padding: "4px 12px 4px 16px",
                        textTransform: "uppercase",
                        letterSpacing: "0.1em",
                        alignSelf: "flex-start",
                        borderRadius: "0 4px 4px 0",
                        boxShadow: "0 2px 4px rgba(0,0,0,0.2)"
                      }}
                    >
                      {product.mode}
                    </span>
                  )}
                  {!product.soldOut && product.discount > 0 && (
                      <span
                        style={{
                          backgroundColor: "#DC2626",
                          color: "white",
                          fontSize: "11px",
                          fontWeight: "bold",
                          padding: "4px 12px 4px 16px",
                          textTransform: "uppercase",
                          letterSpacing: "0.1em",
                          alignSelf: "flex-start",
                          borderRadius: "0 4px 4px 0",
                          boxShadow: "0 2px 4px rgba(0,0,0,0.2)"
                        }}
                      >
                        -{product.discount}% OFF
                      </span>
                  )}
              </div>
              {product.soldOut && (
                  <div className="absolute top-2 right-2 z-20 pointer-events-none w-[100px] sm:w-[120px]">
                      <img src="/sold-out-removebg-preview.png" alt="Sold Out" className="w-full h-auto drop-shadow-lg" />
                  </div>
              )}

              {allImages.length > 0 ? (
                <div
                  style={{
                    borderRadius: "8px",
                    overflow: "hidden",
                    border: "1px solid rgba(255,255,255,0.05)",
                    background: "#111",
                  }}
                >
                  {allImages.length === 1 ? (
                    <div style={{ position: "relative", aspectRatio: getFrameAspect(product, allImages[0].url) }}>
                      <ProductImageWithSkeleton
                        src={allImages[0].url}
                        alt={product.name}
                        sizes="95vw"
                        priority
                        style={{ objectFit: "cover", objectPosition: "center" }}
                        onLoad={(event) => handleImageLoad(allImages[0].url, event)}
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
                          <div style={{ position: "relative", aspectRatio: getFrameAspect(product, img.url) }}>
                            <ProductImageWithSkeleton
                              src={img.url}
                              alt={`${product.name} - ${idx + 1}`}
                              sizes="95vw"
                              priority={idx === 0}
                              style={{ objectFit: "cover", objectPosition: "center" }}
                              onLoad={(event) => handleImageLoad(img.url, event)}
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
                    aspectRatio: getFrameAspect(product, null),
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
                    onClick={handleShareOnWhatsApp}
                    className="text-[#25D366] hover:text-black transition-colors px-3 py-2.5 bg-[#25D366]/10 border border-[#25D366]/25 hover:bg-[#25D366] rounded-full flex items-center justify-center gap-2 shrink-0"
                    title="Share on WhatsApp"
                  >
                    <FaWhatsapp className="h-4 w-4" />
                    <span className="text-[10px] font-bold uppercase tracking-[0.14em]">Share</span>
                  </button>
              </div>
              <div style={{ display: "flex", alignItems: "flex-end", gap: "10px", marginBottom: "16px" }}>
                  <p
                    style={{
                      fontSize: "22px",
                      color: "#c9a96e",
                      fontWeight: "600",
                    }}
                  >
                    Rs. {product.price?.toLocaleString()}
                  </p>
                  {product.discount > 0 && (
                      <p
                        style={{
                          fontSize: "16px",
                          color: "#6b7280",
                          textDecoration: "line-through",
                          marginBottom: "3px",
                          opacity: 0.8
                        }}
                      >
                        Rs. {Math.round(product.price / (1 - product.discount / 100)).toLocaleString()}
                      </p>
                  )}
              </div>

              {renderColorOptions("mobile")}

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
              {renderServicePromise()}
              <div className="hidden mt-8 mb-6 border-y border-white/10 py-5">
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

              <ProductActions product={product} selectedColor={selectedColor} selectedVariantAvailable={selectedVariantAvailable} />
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
                          style={{ width: "100%", aspectRatio: getFrameAspect(simProduct, simProduct.imageUrl), position: "relative", borderRadius: "1rem", overflow: "hidden", marginBottom: "1.5rem", border: "1px solid rgba(255,255,255,0.1)", boxShadow: "0 25px 50px -12px rgba(0,0,0,0.5)", background: "#111" }}
                      >
                        {simProduct.imageUrl ? (
                          <ProductImageWithSkeleton
                            src={simProduct.imageUrl}
                            alt={simProduct.name}
                            className="object-cover group-hover:scale-105 transition-transform duration-700 ease-[cubic-bezier(0.25,1,0.5,1)]"
                            onLoad={(event) => handleImageLoad(simProduct.imageUrl, event)}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-xs text-gray-600 bg-dark">No Image</div>
                        )}
                        {/* Gradient overlay */}
                        <div className="absolute inset-0 bg-linear-to-t from-black/60 via-black/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 ease-out" />

                        {/* Badges */}
                        <div style={{ position: "absolute", top: "12px", left: "0px", zIndex: 20, display: "flex", flexDirection: "column", gap: "6px" }}>
                          {simProduct.mode && simProduct.mode !== "new" && (
                            <span style={{ backgroundColor: "#c9a96e", color: "black", fontSize: "10px", fontWeight: "bold", padding: "3px 10px 3px 12px", textTransform: "uppercase", letterSpacing: "0.05em", alignSelf: "flex-start", borderRadius: "0 4px 4px 0", boxShadow: "0 2px 4px rgba(0,0,0,0.2)" }}>
                              {simProduct.mode}
                            </span>
                          )}
                          {!simProduct.soldOut && simProduct.discount > 0 && (
                            <span style={{ backgroundColor: "#DC2626", color: "white", fontSize: "10px", fontWeight: "bold", padding: "3px 10px 3px 12px", textTransform: "uppercase", letterSpacing: "0.05em", alignSelf: "flex-start", borderRadius: "0 4px 4px 0", boxShadow: "0 2px 4px rgba(0,0,0,0.2)" }}>
                              -{simProduct.discount}% OFF
                            </span>
                          )}
                        </div>
                        {simProduct.soldOut && (
                          <div className="absolute top-2 right-2 z-20 pointer-events-none w-[80px]">
                            <img src="/sold-out-removebg-preview.png" alt="Sold Out" className="w-full h-auto drop-shadow-lg" />
                          </div>
                        )}

                        {/* View Button Overlay */}
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

