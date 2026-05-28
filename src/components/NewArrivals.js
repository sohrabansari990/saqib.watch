"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import { collection, getDocs, limit, orderBy, query } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { cacheProducts, getCachedCatalog, getNewestProducts } from "@/lib/productCache";
import { getProductHref } from "@/lib/productSlug";
import LogoLoop from "./LogoLoop";
import CircularGallery from "./CircularGallery";
import ProductCarousel from "./ProductCarousel";
import "./NewArrivals.css";

const HOME_CRITICAL_READY_EVENT = "saqib:home-critical-ready";
const BASELINE_IMAGE_TIMEOUT_MS = 12000;
const WEBGL_READY_TIMEOUT_MS = 6000;

const brandLogos = [
  { src: "/brands/patek.avif", alt: "Patek Philippe" },
  { src: "/brands/seastar.jpg", alt: "Seastar" },
  { src: "/brands/curren.webp", alt: "Curren" },
  { src: "/brands/dsigner-log.jpeg", alt: "D-Ziner" },
  { src: "/brands/Audemars Piguet.jpg", alt: "Audemars Piguet" },
  { src: "/brands/Skmei.webp", alt: "Skmei" },
  { src: "/brands/pagani design.jpg", alt: "Pagani Design" },
  { src: "/brands/naviforce.jpg", alt: "Naviforce" },
  { src: "/brands/benyar.webp", alt: "Benyar" },
  { src: "/brands/rolex.avif", alt: "Rolex" },
  { src: "/brands/tissot.webp", alt: "Tissot" },
  { src: "/brands/rado.jpg", alt: "Rado" },
  { src: "/brands/hublot.png", alt: "Hublot" },
  { src: "/brands/franck-muller.png", alt: "Franck Muller" },
  { src: "/brands/elegance.png", alt: "Elegance" },
  { src: "/brands/citizen.png", alt: "Citizen" },
  { src: "/brands/cartier.webp", alt: "Cartier" },
  { src: "/brands/fitron.jpg", alt: "Fitron" },
];

function markHomeCriticalReady() {
  if (typeof window === "undefined") return;

  window.__saqibHomeCriticalReady = true;
  window.dispatchEvent(new Event(HOME_CRITICAL_READY_EVENT));
}

function preloadImage(src, timeoutMs = BASELINE_IMAGE_TIMEOUT_MS) {
  return new Promise((resolve) => {
    if (!src || typeof window === "undefined") {
      resolve(false);
      return;
    }

    const img = new window.Image();
    let settled = false;

    const finish = (loaded) => {
      if (settled) return;
      settled = true;
      window.clearTimeout(timeoutId);
      resolve(loaded);
    };

    const timeoutId = window.setTimeout(() => finish(false), timeoutMs);
    img.onload = () => finish(true);
    img.onerror = () => finish(false);
    img.src = src;
  });
}

function canUseWebGL() {
  if (typeof window === "undefined") return false;

  try {
    const canvas = document.createElement("canvas");
    return Boolean(canvas.getContext("webgl2") || canvas.getContext("webgl"));
  } catch {
    return false;
  }
}

function useDesktopViewport() {
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(min-width: 768px)");
    const update = () => setIsDesktop(mediaQuery.matches);
    update();
    mediaQuery.addEventListener("change", update);
    return () => mediaQuery.removeEventListener("change", update);
  }, []);

  return isDesktop;
}

function NewArrivalsSkeleton() {
  return (
    <div className="new-arrivals-loading-grid">
      {Array.from({ length: 4 }).map((_, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: index * 0.06 }}
          className="group"
        >
          <div className="new-arrivals-skeleton-card">
            <div className="skeleton-surface" />
          </div>
          <div className="skeleton-surface new-arrivals-skeleton-title" />
          <div className="skeleton-surface new-arrivals-skeleton-meta" />
        </motion.div>
      ))}
    </div>
  );
}

export default function NewArrivals() {
  const sectionRef = useRef(null);
  const preloadKeyRef = useRef("");
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });
  const isDesktop = useDesktopViewport();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [catalogReady, setCatalogReady] = useState(false);
  const [baselineReady, setBaselineReady] = useState(false);
  const [displayProducts, setDisplayProducts] = useState([]);
  const [webglSupported, setWebglSupported] = useState(false);
  const [webglStatus, setWebglStatus] = useState("disabled");

  const candidates = useMemo(
    () => products.filter((product) => product?.id && product?.imageUrl).slice(0, 12),
    [products]
  );

  const circularItems = useMemo(
    () =>
      displayProducts.slice(0, 6).map((product) => ({
        id: product.id,
        image: product.imageUrl,
        text: product.name.split(" ").slice(0, 2).join(" "),
      })),
    [displayProducts]
  );

  const shouldTryWebGL = isDesktop && webglSupported && baselineReady && circularItems.length >= 3;
  const showCircularGallery = shouldTryWebGL && webglStatus === "ready";
  const galleryState = !baselineReady ? "loading" : showCircularGallery ? "webgl-ready" : "carousel-ready";

  const handleGalleryClick = useCallback((item) => {
    const product = products.find((candidate) => candidate.id === item.id);
    if (product) {
      window.location.href = getProductHref(product);
    }
  }, [products]);

  const handleGalleryReady = useCallback((status) => {
    if (status?.failed) {
      setWebglStatus("failed");
      return;
    }
    setWebglStatus("ready");
  }, []);

  useEffect(() => {
    setWebglSupported(canUseWebGL());
  }, []);

  useEffect(() => {
    const cachedCatalog = getCachedCatalog();
    if (!cachedCatalog?.products?.length) {
      return;
    }

    const cachedProducts = getNewestProducts(
      cachedCatalog.products.filter((product) => !product.soldOut && product.imageUrl),
      12
    );
    setProducts(cachedProducts);
    setCatalogReady(true);
    setLoading(false);
  }, []);

  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      if (!db) {
        setCatalogReady(true);
        setLoading(false);
        return;
      }

      if (!getCachedCatalog()?.products?.length) {
        setLoading(true);
      }

      try {
        try {
          const snap = await getDocs(query(collection(db, "products"), orderBy("createdAt", "desc"), limit(12)));
          if (!isMounted) return;
          const nextProducts = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() })).filter((product) => !product.soldOut && product.imageUrl);
          setProducts(nextProducts);
          cacheProducts(nextProducts);
        } catch {
          const snap = await getDocs(query(collection(db, "products"), orderBy("name"), limit(12)));
          if (!isMounted) return;
          const nextProducts = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() })).filter((product) => !product.soldOut && product.imageUrl);
          setProducts(nextProducts);
          cacheProducts(nextProducts);
        }
      } catch (error) {
        console.error("New arrivals load failed", error);
      } finally {
        if (isMounted) {
          setCatalogReady(true);
          setLoading(false);
        }
      }
    };

    load();
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (loading || !catalogReady) return;

    const preloadKey = candidates.map((product) => product.imageUrl).join("|") || "empty";
    if (preloadKeyRef.current === preloadKey) return;
    preloadKeyRef.current = preloadKey;

    if (candidates.length === 0) {
      setDisplayProducts([]);
      setBaselineReady(true);
      markHomeCriticalReady();
      return;
    }

    let isActive = true;
    setBaselineReady(false);
    setWebglStatus("disabled");

    Promise.allSettled(candidates.map((product) => preloadImage(product.imageUrl))).then((results) => {
      if (!isActive) return;

      const loadedProducts = candidates.filter((_, index) => {
        const result = results[index];
        return result?.status === "fulfilled" && result.value;
      });
      const safeProducts = loadedProducts.length >= 3 ? loadedProducts : candidates;

      setDisplayProducts(safeProducts.slice(0, 8));
      setBaselineReady(true);
      markHomeCriticalReady();
    });

    return () => {
      isActive = false;
    };
  }, [candidates, catalogReady, loading]);

  useEffect(() => {
    if (!shouldTryWebGL) {
      setWebglStatus("disabled");
      return undefined;
    }

    setWebglStatus("loading");
    const timeoutId = window.setTimeout(() => {
      setWebglStatus((current) => (current === "ready" ? current : "failed"));
    }, WEBGL_READY_TIMEOUT_MS);

    return () => window.clearTimeout(timeoutId);
  }, [shouldTryWebGL, circularItems]);

  return (
    <section
      id="arrivals"
      ref={sectionRef}
      className="new-arrivals-section"
    >
      <div className="w-full">
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.3 }}
          style={{ padding: "0vw 0vw 2vw 0vw" }}
        >
          {loading ? (
            <NewArrivalsSkeleton />
          ) : products.length === 0 ? (
            <div className="text-center text-gray-500 py-10">No products available yet.</div>
          ) : (
            <>
              <div className="new-arrivals-title">
                <p>Discover</p>
                <h2>New Arrivals</h2>
                <div />
              </div>

              <div className="new-arrivals-gallery-shell" data-gallery-state={galleryState}>
                {!baselineReady ? (
                  <NewArrivalsSkeleton />
                ) : displayProducts.length > 0 ? (
                  <>
                    <div className={`new-arrivals-carousel-fallback ${showCircularGallery ? "is-hidden" : ""}`}>
                      <ProductCarousel
                        products={displayProducts.slice(0, 6)}
                        baseWidth={isDesktop ? 360 : 330}
                        autoplay
                        autoplayDelay={2600}
                        pauseOnHover
                        loop
                      />
                    </div>

                    {shouldTryWebGL && (
                      <div className={`new-arrivals-webgl-layer ${showCircularGallery ? "is-ready" : ""}`}>
                        <CircularGallery
                          items={circularItems}
                          onItemClick={handleGalleryClick}
                          onReady={handleGalleryReady}
                          bend={3}
                          textColor="#c9a96e"
                          font="bold 14px Georgia, serif"
                          borderRadius={0.05}
                          scrollSpeed={1.8}
                          scrollEase={0.04}
                        />
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-center text-gray-500 py-10">No products available yet.</div>
                )}
              </div>
            </>
          )}
        </motion.div>

        <div className="new-arrivals-brands">
          <p>Featured Brands</p>
          <div
            className="new-arrivals-brand-loop"
            style={{
              position: "relative",
              display: "flex",
              alignItems: "center",
              width: "100%",
              height: isDesktop ? 68 : 54,
              minHeight: isDesktop ? 68 : 54,
              overflow: "hidden",
            }}
          >
            <LogoLoop
              logos={brandLogos}
              speed={70}
              direction="left"
              logoHeight={isDesktop ? 44 : 38}
              gap={isDesktop ? 74 : 46}
              hoverSpeed={18}
              fadeOut
              fadeOutColor="#000000"
              scaleOnHover
              ariaLabel="Featured watch brands"
              renderItem={(brand) => (
                <img
                  className="featured-brand-logo"
                  src={brand.src}
                  alt={brand.alt}
                  title={brand.alt}
                  loading="lazy"
                  decoding="async"
                  draggable={false}
                  style={{
                    display: "block",
                    width: "auto",
                    maxWidth: isDesktop ? 148 : 124,
                    height: isDesktop ? 44 : 38,
                    objectFit: "contain",
                    background: "transparent",
                    border: 0,
                  }}
                />
              )}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
