"use client";

import { useEffect, useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { doc, getDoc, collection, query, getDocs, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import ProductActions from "@/components/ProductActions";
import CollectionLoader from "@/components/CollectionLoader";
import { useFavorites } from "@/context/FavoritesContext";
import { BadgeCheck, Clock3, Heart, PackageCheck, RotateCcw, ShieldCheck, Star, Truck, Send, ArrowLeft } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import Image from "next/image";
import { getCachedCatalog, getSimilarProducts } from "@/lib/productCache";
import { getImageFrameAspectRatio } from "@/lib/imageFrame";
import { getProductHref, getProductSlug, productMatchesSlug, safeDecodeSlug } from "@/lib/productSlug";

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
  const { slug } = useParams();
  const router = useRouter();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [similarLoading, setSimilarLoading] = useState(false);
  const [selectedColor, setSelectedColor] = useState(null);
  const [selectedThumbIndex, setSelectedThumbIndex] = useState(0);
  const [similarProducts, setSimilarProducts] = useState([]);
  const [visibleSimilarCount, setVisibleSimilarCount] = useState(4);
  const [userRating, setUserRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewName, setReviewName] = useState("");
  const [reviewComment, setReviewComment] = useState("");
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [reviewSubmitted, setReviewSubmitted] = useState(false);
  
  const [swiper, setSwiper] = useState(null);
  const [imageDimensions, setImageDimensions] = useState({});
  const { toggleFavorite, isFavorite } = useFavorites();

  const renderStars = (percentage) => {
    const p = Math.max(0, Math.min(100, percentage || 0));
    return (
      <div className="flex items-center gap-2 mb-4">
        <div className="relative inline-block w-[80px]">
            <div className="flex text-white/20 w-max">
                {[...Array(5)].map((_, i) => <Star key={`empty-${i}`} size={16} fill="currentColor" strokeWidth={0} />)}
            </div>
            <div className="flex text-gold absolute top-0 left-0 overflow-hidden w-max" style={{ clipPath: `inset(0 ${100 - p}% 0 0)` }}>
                {[...Array(5)].map((_, i) => <Star key={`filled-${i}`} size={16} fill="currentColor" strokeWidth={0} />)}
            </div>
        </div>
      </div>
    );
  };

  useEffect(() => {
    let isActive = true;

    const fetchProduct = async () => {
      if (!slug) return;
      
      const cachedCatalog = getCachedCatalog();
      let targetProduct = null;
      const decodedSlug = safeDecodeSlug(slug);
      const showProduct = (nextProduct, catalogProducts = []) => {
        setProduct(nextProduct);
        setSelectedColor(getInitialSelectedColor(nextProduct));
        setLoading(false);

        if (catalogProducts.length > 0) {
          setSimilarProducts(getSimilarProducts(catalogProducts, nextProduct, 12));
        }

        const canonicalSlug = getProductSlug(nextProduct);
        if (canonicalSlug && decodedSlug !== canonicalSlug) {
          router.replace(getProductHref(nextProduct), { scroll: false });
        }
      };

      if (cachedCatalog && cachedCatalog.products) {
          targetProduct = cachedCatalog.products.find((p) => productMatchesSlug(p, decodedSlug));
      }

      if (targetProduct) {
        showProduct(targetProduct, cachedCatalog.products);
      } else {
        setLoading(true);
        try {
            const docRef = doc(db, "products", decodedSlug);
            const docSnap = await getDoc(docRef);
            
            if (docSnap.exists()) {
                const data = { id: docSnap.id, ...docSnap.data() };
                if (isActive) {
                    showProduct(data);
                }
            } else {
                const q = query(collection(db, "products"));
                const snap = await getDocs(q);
                const all = snap.docs.map(d => ({ id: d.id, ...d.data() }));
                
                const match = all.find((p) => productMatchesSlug(p, decodedSlug));
                
                if (isActive) {
                    if (match) {
                        showProduct(match, all);
                    } else {
                        router.push("/gallery");
                    }
                }
            }
        } catch (err) {
            console.error("Fetch error:", err);
            if (isActive) setLoading(false);
        }
      }
    };

    fetchProduct();
    return () => { isActive = false; };
  }, [slug, router]);

  const allImages = useMemo(() => {
    if (!product) return [];
    const hasVariants = product.variants && product.variants.length > 0;
    if (hasVariants) {
      const imgs = [];
      const visibleVariants = product.variants;

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

  const handleThumbClick = (idx) => {
    setSelectedThumbIndex(idx);
    const img = allImages[idx];
    if (img && img.color) setSelectedColor(img.color);
  };

  const handleColorChange = (color) => {
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

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (userRating === 0) return alert("Please select a rating.");
    if (!product?.id) return;

    setIsSubmittingReview(true);
    try {
        await addDoc(collection(db, "reviews"), {
            productId: product.id,
            productName: product.name,
            userName: reviewName,
            rating: userRating,
            comment: reviewComment,
            createdAt: serverTimestamp(),
            status: "pending" // Admin can approve before showing
        });
        setReviewSubmitted(true);
    } catch (err) {
        console.error("Review submission error:", err);
        alert("Failed to submit review. Please try again.");
    } finally {
        setIsSubmittingReview(false);
    }
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

  return (
    <>
      <Header />
      <main className="min-h-screen bg-dark" style={{ paddingTop: "140px" }}>
        


        <div style={{ padding: "30px 24px 0 24px", maxWidth: "1560px", margin: "0 auto" }}>
            <Link 
                href="/gallery"
                style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "12px",
                    padding: "10px 24px",
                    backgroundColor: "rgba(255,255,255,0.05)",
                    backdropFilter: "blur(12px)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: "9999px",
                    transition: "all 0.3s ease",
                    marginBottom: "32px",
                    textDecoration: "none"
                }}
                className="group hover:border-gold hover:bg-gold/10"
            >
                <ArrowLeft size={16} className="text-white group-hover:text-gold transition-colors" />
                <span style={{ fontSize: "11px", fontWeight: "bold", textTransform: "uppercase", letterSpacing: "0.2em", color: "rgba(255,255,255,0.8)" }} className="group-hover:text-white transition-colors">Back to collection</span>
            </Link>
        </div>

        <div style={{ padding: "0 24px 40px 24px", maxWidth: "1560px", margin: "0 auto", position: "relative" }}>
          
          <div
            className="hidden lg:flex"
            style={{ gap: "28px", alignItems: "flex-start", justifyContent: "center" }}
          >
            {/* Column 1 — Vertical Thumbnails */}
            <div
              className="product-thumb-rail"
              style={{
                width: "76px",
                flexShrink: 0,
                display: "flex",
                flexDirection: "column",
                gap: "10px",
                position: "sticky",
                top: "140px",
                maxHeight: "calc(100vh - 180px)",
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

            {/* Column 2 — Main Image */}
            <div style={{ flex: "0 1 620px", maxWidth: "620px", position: "relative" }}>

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
                    <span style={{ backgroundColor: "#c9a96e", color: "black", fontSize: "11px", fontWeight: "bold", padding: "4px 12px 4px 16px", textTransform: "uppercase", letterSpacing: "0.1em", alignSelf: "flex-start", borderRadius: "0 4px 4px 0", boxShadow: "0 2px 4px rgba(0,0,0,0.2)" }}>
                      {product.mode}
                    </span>
                  )}
                  {!product.soldOut && product.discount > 0 && (
                    <span style={{ backgroundColor: "#DC2626", color: "white", fontSize: "11px", fontWeight: "bold", padding: "4px 12px 4px 16px", textTransform: "uppercase", letterSpacing: "0.1em", alignSelf: "flex-start", borderRadius: "0 4px 4px 0", boxShadow: "0 2px 4px rgba(0,0,0,0.2)" }}>
                      -{product.discount}% OFF
                    </span>
                  )}
              </div>
              
              {product.soldOut && (
                  <div className="absolute top-2 right-2 z-20 pointer-events-none w-[100px] sm:w-[120px]">
                      <img src="/sold-out-removebg-preview.png" alt="Sold Out" className="w-full h-auto drop-shadow-lg" />
                  </div>
              )}

              <div
                style={{
                  position: "relative",
                  borderRadius: "8px",
                  overflow: "hidden",
                  border: "1px solid rgba(255,255,255,0.05)",
                  background: "#111",
                  aspectRatio: getFrameAspect(product, mainImage?.url),
                }}
              >
                {mainImage ? (
                  <ProductImageWithSkeleton
                    key={mainImage.url}
                    src={mainImage.url}
                    alt={product.name}
                    sizes="(min-width: 1024px) 40vw, 90vw"
                    priority
                    style={{ objectFit: "cover", objectPosition: "center" }}
                    onLoad={(event) => handleImageLoad(mainImage.url, event)}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-500">No Image Available</div>
                )}
              </div>
            </div>

            {/* Column 3 — Product Details */}
            <div style={{ flex: "0 1 620px", maxWidth: "620px", minWidth: 0, paddingTop: "10px" }}>
              <div className="flex items-start justify-between gap-4 mb-4">
                  <h1 className="font-serif text-white" style={{ fontSize: "clamp(28px, 3vw, 48px)", fontWeight: 300 }}>
                    {product.name}
                  </h1>
                  <button
                    onClick={handleShareOnWhatsApp}
                    className="shrink-0 text-[#25D366] hover:text-black transition-colors bg-[#25D366]/10 border border-[#25D366]/25 hover:bg-[#25D366] hover:border-[#25D366] rounded-full flex items-center justify-center gap-2 group shadow-lg"
                    style={{ padding: "12px 16px", margin: "0" }}
                  >
                    <FaWhatsapp className="h-4 w-4" />
                    <span className="text-[10px] font-bold uppercase tracking-[0.16em]">Share</span>
                  </button>
              </div>
              {renderStars(product.ratingPercentage)}
              <div style={{ display: "flex", alignItems: "flex-end", gap: "12px", marginBottom: "20px" }}>
                  <p style={{ fontSize: "24px", color: "#c9a96e", fontWeight: "600" }}>
                    Rs. {product.price?.toLocaleString()}
                  </p>
                  {product.discount > 0 && (
                      <p style={{ fontSize: "18px", color: "#6b7280", textDecoration: "line-through", marginBottom: "3px", opacity: 0.8 }}>
                        Rs. {Math.round(product.price / (1 - product.discount / 100)).toLocaleString()}
                      </p>
                  )}
              </div>

              {/* Color Options */}
              {hasVariants && (
                <div style={{ marginBottom: "22px" }}>
                  <span style={{ color: "#9ca3af", fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.1em", display: "block", marginBottom: "12px" }}>
                    Color: <span style={{ color: "#fff", textTransform: "capitalize", fontWeight: 700 }}>{selectedColor || "Select"}</span>
                  </span>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
                    {product.variants.map((variant) => (
                      <button
                        key={`desktop-color-${variant.color}`}
                        type="button"
                        onClick={() => handleColorChange(variant.color)}
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "8px",
                          minHeight: "42px",
                          padding: "0 13px 0 8px",
                          borderRadius: "999px",
                          border: selectedColor === variant.color ? "1px solid #c9a96e" : "1px solid rgba(255,255,255,0.12)",
                          background: selectedColor === variant.color ? "rgba(201,169,110,0.16)" : "rgba(255,255,255,0.035)",
                          color: isVariantAvailable(variant) ? "#f9fafb" : "#6b7280",
                          cursor: "pointer",
                          transition: "all 0.2s ease",
                        }}
                      >
                        <span style={{ width: "26px", height: "26px", borderRadius: "50%", background: variant.hex, border: "1px solid rgba(255,255,255,0.25)" }} />
                        <span style={{ fontSize: "11px", fontWeight: 800, textTransform: "capitalize" }}>{variant.color}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div style={{ width: "64px", height: "1px", background: "rgba(255,255,255,0.2)", marginBottom: "24px" }} />
              <p style={{ color: "#9ca3af", lineHeight: 1.7, marginBottom: "24px", fontSize: "15px", whiteSpace: "pre-line" }}>
                {product.description}
              </p>

              <div className="mb-8">
                {[
                  { label: "Model", value: product.model || product.id },
                  { label: "Category", value: product.category },
                  { label: "Availability", value: "In Stock", isGreen: true },
                ].map((row) => (
                  <div key={row.label} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 0", borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
                    <span style={{ color: "#9ca3af", fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.1em" }}>{row.label}</span>
                    <span style={{ color: row.isGreen ? "#22c55e" : "#fff", fontSize: "13px", textTransform: row.label === "Category" ? "capitalize" : "none" }}>{row.value}</span>
                  </div>
                ))}
              </div>

              {/* Service Promise */}
              <div style={{ border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.025)", borderRadius: "14px", padding: "18px", marginTop: "24px", marginBottom: "4px" }}>
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
              
              <ProductActions product={product} selectedColor={selectedColor} selectedVariantAvailable={selectedVariantAvailable} />
            </div>
          </div>

          {/* ===== MOBILE / TABLET: stacked layout ===== */}
          <div className="flex flex-col gap-10 lg:hidden">
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
                  background: isFavorite(product.id) ? "rgba(255,255,255,0.9)" : "rgba(0,0,0,0.4)",
                  color: isFavorite(product.id) ? "#ef4444" : "#fff",
                }}
              >
                <Heart size={20} fill={isFavorite(product.id) ? "currentColor" : "none"} />
              </button>

              <div style={{ position: "absolute", top: "16px", left: "0px", zIndex: 20, display: "flex", flexDirection: "column", gap: "8px" }}>
                  {product.mode && product.mode !== "new" && (
                    <span style={{ backgroundColor: "#c9a96e", color: "black", fontSize: "11px", fontWeight: "bold", padding: "4px 12px 4px 16px", textTransform: "uppercase", letterSpacing: "0.1em", alignSelf: "flex-start", borderRadius: "0 4px 4px 0", boxShadow: "0 2px 4px rgba(0,0,0,0.2)" }}>
                      {product.mode}
                    </span>
                  )}
                  {!product.soldOut && product.discount > 0 && (
                    <span style={{ backgroundColor: "#DC2626", color: "white", fontSize: "11px", fontWeight: "bold", padding: "4px 12px 4px 16px", textTransform: "uppercase", letterSpacing: "0.1em", alignSelf: "flex-start", borderRadius: "0 4px 4px 0", boxShadow: "0 2px 4px rgba(0,0,0,0.2)" }}>
                      -{product.discount}% OFF
                    </span>
                  )}
              </div>
              
              <div style={{ borderRadius: "8px", overflow: "hidden", border: "1px solid rgba(255,255,255,0.05)", background: "#111" }}>
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
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <div className="flex items-center justify-between mb-2">
                  <h1 className="font-serif text-white" style={{ fontSize: "clamp(24px, 6vw, 36px)", fontWeight: 300 }}>
                    {product.name}
                  </h1>
                  <button
                    onClick={handleShareOnWhatsApp}
                    className="text-[#25D366] hover:text-black transition-colors bg-[#25D366]/10 border border-[#25D366]/25 hover:bg-[#25D366] rounded-full flex items-center justify-center gap-2 shrink-0"
                    style={{ padding: "10px 12px", margin: "0" }}
                  >
                    <FaWhatsapp className="h-4 w-4" />
                    <span className="text-[10px] font-bold uppercase tracking-[0.14em]">Share</span>
                  </button>
              </div>
              <div style={{ display: "flex", alignItems: "flex-end", gap: "10px", marginBottom: "16px" }}>
                  <p style={{ fontSize: "22px", color: "#c9a96e", fontWeight: "600" }}>
                    Rs. {product.price?.toLocaleString()}
                  </p>
                  {product.discount > 0 && (
                      <p style={{ fontSize: "16px", color: "#6b7280", textDecoration: "line-through", marginBottom: "3px", opacity: 0.8 }}>
                        Rs. {Math.round(product.price / (1 - product.discount / 100)).toLocaleString()}
                      </p>
                  )}
              </div>

              {/* Color Options Mobile */}
              {hasVariants && (
                <div style={{ marginBottom: "22px" }}>
                  <span style={{ color: "#9ca3af", fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.1em", display: "block", marginBottom: "12px" }}>
                    Color: <span style={{ color: "#fff", textTransform: "capitalize", fontWeight: 700 }}>{selectedColor || "Select"}</span>
                  </span>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
                    {product.variants.map((variant) => (
                      <button
                        key={`mobile-color-${variant.color}`}
                        type="button"
                        onClick={() => handleColorChange(variant.color)}
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "8px",
                          minHeight: "42px",
                          padding: "0 13px 0 8px",
                          borderRadius: "999px",
                          border: selectedColor === variant.color ? "1px solid #c9a96e" : "1px solid rgba(255,255,255,0.12)",
                          background: selectedColor === variant.color ? "rgba(201,169,110,0.16)" : "rgba(255,255,255,0.035)",
                          color: isVariantAvailable(variant) ? "#f9fafb" : "#6b7280",
                          cursor: "pointer",
                          transition: "all 0.2s ease",
                        }}
                      >
                        <span style={{ width: "26px", height: "26px", borderRadius: "50%", background: variant.hex, border: "1px solid rgba(255,255,255,0.25)" }} />
                        <span style={{ fontSize: "11px", fontWeight: 800, textTransform: "capitalize" }}>{variant.color}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div style={{ width: "64px", height: "1px", background: "rgba(255,255,255,0.2)", marginBottom: "20px" }} />
              <p style={{ color: "#9ca3af", lineHeight: 1.7, marginBottom: "20px", fontSize: "15px", whiteSpace: "pre-line" }}>
                {product.description}
              </p>

              <div className="mb-8">
                {[
                  { label: "Model", value: product.model || product.id },
                  { label: "Category", value: product.category },
                  { label: "Availability", value: "In Stock", isGreen: true },
                ].map((row) => (
                  <div key={row.label} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 0", borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
                    <span style={{ color: "#9ca3af", fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.1em" }}>{row.label}</span>
                    <span style={{ color: row.isGreen ? "#22c55e" : "#fff", fontSize: "13px", textTransform: row.label === "Category" ? "capitalize" : "none" }}>{row.value}</span>
                  </div>
                ))}
              </div>

              {/* Service Promise Mobile */}
              <div style={{ border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.025)", borderRadius: "14px", padding: "18px", marginTop: "24px", marginBottom: "4px" }}>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "14px" }}>
                  {serviceItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <div key={item.title} style={{ display: "flex", gap: "12px", minWidth: "100%", flex: "1 1 100%" }}>
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
              
              <ProductActions product={product} selectedColor={selectedColor} selectedVariantAvailable={selectedVariantAvailable} />
            </div>
          </div>
        </div>

        <section 
            className="w-full bg-[#0a0a0a] border-t border-white/5 flex justify-center" 
            style={{ padding: "100px 24px", marginTop: "60px" }}
        >
            <div 
                className="max-w-[1560px] w-full flex flex-col items-center"
                style={{ margin: "0 auto" }}
            >
                <h2 
                    className="font-serif text-white"
                    style={{ fontSize: "clamp(28px, 4vw, 40px)", marginBottom: "8px", fontWeight: 300 }}
                >
                    Customer Reviews
                </h2>
                <p 
                    className="text-white/40"
                    style={{ fontSize: "14px", marginBottom: "48px" }}
                >
                    Share your experience with this masterpiece
                </p>
                
                <AnimatePresence mode="wait">
                    {reviewSubmitted ? (
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.9 }} 
                            animate={{ opacity: 1, scale: 1 }} 
                            className="bg-gold/10 border border-gold/20 rounded-2xl text-center flex flex-col items-center gap-4"
                            style={{ padding: "40px", border: "1px solid rgba(201,169,110,0.2)" }}
                        >
                            <div 
                                className="bg-gold rounded-full flex items-center justify-center text-black"
                                style={{ width: "64px", height: "64px", marginBottom: "16px" }}
                            >
                                <BadgeCheck size={32} />
                            </div>
                            <div>
                                <h3 className="text-gold font-bold" style={{ fontSize: "20px", marginBottom: "8px" }}>Review Submitted!</h3>
                                <p className="text-white/70" style={{ fontSize: "14px", maxWidth: "280px" }}>Thank you for your feedback. Our curators will review and publish it shortly.</p>
                            </div>
                        </motion.div>
                    ) : (
                        <motion.form 
                            onSubmit={handleReviewSubmit}
                            className="w-full"
                            style={{ display: "flex", flexDirection: "column", gap: "24px" }}
                        >
                            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "16px", marginBottom: "16px" }}>
                                <p style={{ color: "#fff", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.2em", fontWeight: "bold" }}>Your Rating</p>
                                <div style={{ display: "flex", gap: "12px" }}>
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <button
                                            key={star}
                                            type="button"
                                            onMouseEnter={() => setHoverRating(star)}
                                            onMouseLeave={() => setHoverRating(0)}
                                            onClick={() => setUserRating(star)}
                                            style={{ 
                                                transition: "all 0.3s ease", 
                                                transform: star <= (hoverRating || userRating) ? "scale(1.2)" : "scale(1)",
                                                background: "none",
                                                border: "none",
                                                cursor: "pointer",
                                                padding: "0"
                                            }}
                                        >
                                            <Star 
                                                size={36} 
                                                fill={star <= (hoverRating || userRating) ? "#c9a96e" : "transparent"} 
                                                style={{ 
                                                    color: star <= (hoverRating || userRating) ? "#c9a96e" : "rgba(255,255,255,0.1)",
                                                    transition: "color 0.3s ease"
                                                }}
                                                strokeWidth={1}
                                            />
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div 
                                style={{ 
                                    display: "grid", 
                                    gridTemplateColumns: "1fr 1fr", 
                                    gap: "16px",
                                    marginBottom: "16px" 
                                }}
                                className="grid-cols-1 md:grid-cols-2"
                            >
                                <input 
                                    required
                                    type="text" 
                                    placeholder="Your Name" 
                                    value={reviewName}
                                    onChange={(e) => setReviewName(e.target.value)}
                                    style={{ 
                                        backgroundColor: "rgba(255,255,255,0.05)",
                                        border: "1px solid rgba(255,255,255,0.1)",
                                        borderRadius: "12px",
                                        padding: "14px 16px",
                                        color: "#fff",
                                        fontSize: "14px",
                                        outline: "none"
                                    }}
                                />
                                <div 
                                    style={{ 
                                        display: "flex", 
                                        alignItems: "center", 
                                        backgroundColor: "rgba(255,255,255,0.05)", 
                                        border: "1px solid rgba(255,255,255,0.1)", 
                                        borderRadius: "12px", 
                                        padding: "14px 16px",
                                        color: "rgba(255,255,255,0.4)",
                                        fontSize: "12px"
                                    }}
                                >
                                    <ShieldCheck size={14} style={{ marginRight: "8px", color: "#c9a96e" }} />
                                    Verified Purchase Only
                                </div>
                            </div>
                            
                            <textarea 
                                required
                                rows={4}
                                placeholder="Your masterpiece experience..."
                                value={reviewComment}
                                onChange={(e) => setReviewComment(e.target.value)}
                                style={{ 
                                    width: "100%", 
                                    backgroundColor: "rgba(255,255,255,0.05)", 
                                    border: "1px solid rgba(255,255,255,0.1)", 
                                    borderRadius: "12px", 
                                    padding: "16px", 
                                    color: "#fff", 
                                    fontSize: "14px", 
                                    outline: "none",
                                    resize: "none"
                                }}
                            />

                            <button 
                                type="submit"
                                disabled={isSubmittingReview}
                                style={{ 
                                    width: "100%", 
                                    backgroundColor: "#c9a96e", 
                                    color: "#000", 
                                    fontWeight: "bold", 
                                    padding: "16px", 
                                    borderRadius: "12px", 
                                    display: "flex", 
                                    alignItems: "center", 
                                    justifyContent: "center", 
                                    gap: "8px", 
                                    border: "none",
                                    cursor: isSubmittingReview ? "not-allowed" : "pointer",
                                    opacity: isSubmittingReview ? 0.5 : 1,
                                    transition: "all 0.2s ease"
                                }}
                            >
                                {isSubmittingReview ? (
                                    <div style={{ width: "20px", height: "20px", border: "2px solid #000", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
                                ) : (
                                    <>
                                        Submit Review <Send size={16} />
                                    </>
                                )}
                            </button>
                        </motion.form>
                    )}
                </AnimatePresence>
            </div>
        </section>

        {/* Similar Masterpieces Section */}
        {similarProducts.length > 0 && (
          <section className="border-t flex justify-center border-white/5 relative" style={{ padding: "100px 24px" }}>
            <div className="max-w-[1560px] w-full mx-auto flex flex-col items-center justify-center relative z-10">
                <p className="text-gold tracking-[0.4em] text-xs font-semibold uppercase mb-4 opacity-80" style={{ textAlign: "center", width: "100%" }}>
                  Similar Masterpieces
                </p>
                <h2 className="font-serif text-4xl md:text-6xl text-white font-light mb-20 leading-tight" style={{ textAlign: "center", paddingTop: "10px", width: "100%" }}>
                  You Might Also Like
                </h2>
              
                <div className="flex flex-col items-center gap-16 w-full">
                    <div style={{ display: "flex", justifyContent: "center", flexWrap: "wrap", gap: "3rem", width: "100%", marginTop: "2rem" }}>
                    {similarProducts.slice(0, visibleSimilarCount).map((simProduct) => {
                        return (
                            <Link href={getProductHref(simProduct)} key={simProduct.id} style={{ width: "280px", display: "flex", flexDirection: "column", alignItems: "center" }} className="group cursor-pointer">
                            <div style={{ width: "100%", aspectRatio: "3 / 4", position: "relative", borderRadius: "1rem", overflow: "hidden", marginBottom: "1.5rem", border: "1px solid rgba(255,255,255,0.1)", background: "#111" }}>
                                {simProduct.imageUrl ? (
                                    <ProductImageWithSkeleton src={simProduct.imageUrl} alt={simProduct.name} className="object-cover group-hover:scale-105 transition-transform duration-700" onLoad={(event) => handleImageLoad(simProduct.imageUrl, event)} />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-xs text-gray-600 bg-dark">No Image</div>
                                )}
                                <div className="absolute inset-0 bg-linear-to-t from-black/60 via-black/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                <div className="absolute bottom-6 left-0 right-0 flex justify-center translate-y-8 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
                                    <span style={{padding: "10px"}} className="bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-gold hover:border-gold hover:text-black font-semibold text-xs tracking-widest uppercase px-8 py-3 rounded-full transition-colors shadow-xl">View Details</span>
                                </div>
                            </div>
                            <div className="text-center w-full">
                                <h3 className="font-serif text-white text-lg mb-1 group-hover:text-gold transition-colors">{simProduct.name}</h3>
                                <p className="text-gold text-sm tracking-wide">Rs. {simProduct.price?.toLocaleString()}</p>
                            </div>
                            </Link>
                        )
                    })}
                    </div>

                    {visibleSimilarCount < similarProducts.length && (
                        <div style={{ marginTop: "60px", marginBottom: "40px", display: "flex", justifyContent: "center" }}>
                            <button 
                                onClick={() => setVisibleSimilarCount(similarProducts.length)}
                                style={{
                                    padding: "16px 50px",
                                    backgroundColor: "transparent",
                                    border: "1px solid rgba(201,169,110,0.3)",
                                    color: "#c9a96e",
                                    borderRadius: "9999px",
                                    fontSize: "12px",
                                    fontWeight: "bold",
                                    textTransform: "uppercase",
                                    letterSpacing: "0.3em",
                                    cursor: "pointer",
                                    transition: "all 0.3s ease",
                                    boxShadow: "0 0 20px rgba(201,169,110,0.1)"
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.backgroundColor = "#c9a96e";
                                    e.currentTarget.style.color = "#000";
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.backgroundColor = "transparent";
                                    e.currentTarget.style.color = "#c9a96e";
                                }}
                            >
                                View More Recommended
                            </button>
                        </div>
                    )}
                </div>
            </div>
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
