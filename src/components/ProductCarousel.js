"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useMotionValue, useTransform } from "framer-motion";
import { getProductHref } from "@/lib/productSlug";
import "./ProductCarousel.css";

const DRAG_BUFFER = 0;
const VELOCITY_THRESHOLD = 500;
const GAP = 16;
const CONTAINER_PADDING = 16;
const SPRING_OPTIONS = { type: "spring", stiffness: 300, damping: 30 };

function formatPrice(value) {
  if (value === undefined || value === null || value === "") return "";
  return `Rs. ${Number(value).toLocaleString("en-PK")}`;
}

function CarouselItem({ product, index, itemWidth, trackItemOffset, x, transition }) {
  const range = [-(index + 1) * trackItemOffset, -index * trackItemOffset, -(index - 1) * trackItemOffset];
  const rotateY = useTransform(x, range, [54, 0, -54], { clamp: false });
  const href = getProductHref(product);
  const price = product.discount > 0 && product.originalPrice ? product.originalPrice : product.price;
  const salePrice = product.discount > 0 ? product.price : null;

  return (
    <motion.div
      className="product-carousel-item"
      style={{ width: itemWidth, rotateY }}
      transition={transition}
    >
      <Link href={href} prefetch className="product-carousel-link">
        <div className="product-carousel-media">
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            sizes="(max-width: 767px) 78vw, 320px"
            className="product-carousel-image"
            priority={index < 2}
          />
          {!product.soldOut && product.discount > 0 && (
            <span className="product-carousel-badge">-{product.discount}%</span>
          )}
        </div>
        <div className="product-carousel-content">
          <h3>{product.name}</h3>
          <div className="product-carousel-price">
            {salePrice ? (
              <>
                <span>{formatPrice(salePrice)}</span>
                <s>{formatPrice(price)}</s>
              </>
            ) : (
              <span>{formatPrice(price)}</span>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

export default function ProductCarousel({
  products = [],
  baseWidth = 320,
  autoplay = true,
  autoplayDelay = 2800,
  pauseOnHover = true,
  loop = true,
  className = "",
}) {
  const safeProducts = useMemo(
    () => products.filter((product) => product?.id && product?.imageUrl),
    [products]
  );
  const itemWidth = baseWidth - CONTAINER_PADDING * 2;
  const trackItemOffset = itemWidth + GAP;
  const itemsForRender = useMemo(() => {
    if (!loop || safeProducts.length === 0) return safeProducts;
    return [safeProducts[safeProducts.length - 1], ...safeProducts, safeProducts[0]];
  }, [safeProducts, loop]);

  const [position, setPosition] = useState(loop ? 1 : 0);
  const [isHovered, setIsHovered] = useState(false);
  const [isJumping, setIsJumping] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const x = useMotionValue(-(loop ? 1 : 0) * trackItemOffset);
  const containerRef = useRef(null);

  useEffect(() => {
    const startingPosition = loop ? 1 : 0;
    setPosition(startingPosition);
    x.set(-startingPosition * trackItemOffset);
  }, [safeProducts.length, loop, trackItemOffset, x]);

  useEffect(() => {
    if (!autoplay || itemsForRender.length <= 1) return undefined;
    if (pauseOnHover && isHovered) return undefined;

    const timer = window.setInterval(() => {
      setPosition((current) => Math.min(current + 1, itemsForRender.length - 1));
    }, autoplayDelay);

    return () => window.clearInterval(timer);
  }, [autoplay, autoplayDelay, isHovered, itemsForRender.length, pauseOnHover]);

  if (safeProducts.length === 0) {
    return null;
  }

  const effectiveTransition = isJumping ? { duration: 0 } : SPRING_OPTIONS;
  const activeIndex =
    safeProducts.length === 0
      ? 0
      : loop
        ? (position - 1 + safeProducts.length) % safeProducts.length
        : Math.min(position, safeProducts.length - 1);

  const handleAnimationComplete = () => {
    if (!loop || itemsForRender.length <= 1) {
      setIsAnimating(false);
      return;
    }

    const lastCloneIndex = itemsForRender.length - 1;
    if (position === lastCloneIndex) {
      setIsJumping(true);
      setPosition(1);
      x.set(-trackItemOffset);
      requestAnimationFrame(() => {
        setIsJumping(false);
        setIsAnimating(false);
      });
      return;
    }

    if (position === 0) {
      const target = safeProducts.length;
      setIsJumping(true);
      setPosition(target);
      x.set(-target * trackItemOffset);
      requestAnimationFrame(() => {
        setIsJumping(false);
        setIsAnimating(false);
      });
      return;
    }

    setIsAnimating(false);
  };

  const handleDragEnd = (_, info) => {
    const { offset, velocity } = info;
    const direction =
      offset.x < -DRAG_BUFFER || velocity.x < -VELOCITY_THRESHOLD
        ? 1
        : offset.x > DRAG_BUFFER || velocity.x > VELOCITY_THRESHOLD
          ? -1
          : 0;

    if (direction === 0) return;

    setPosition((current) => {
      const next = current + direction;
      const max = itemsForRender.length - 1;
      return Math.max(0, Math.min(next, max));
    });
  };

  return (
    <div
      ref={containerRef}
      className={`product-carousel-container ${className}`}
      style={{ width: `min(100%, ${baseWidth}px)` }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      data-product-carousel
    >
      <motion.div
        className="product-carousel-track"
        drag={isAnimating ? false : "x"}
        dragConstraints={loop ? undefined : { left: -trackItemOffset * Math.max(itemsForRender.length - 1, 0), right: 0 }}
        style={{
          width: itemWidth,
          gap: `${GAP}px`,
          perspective: 1000,
          perspectiveOrigin: `${position * trackItemOffset + itemWidth / 2}px 50%`,
          x,
        }}
        onDragEnd={handleDragEnd}
        animate={{ x: -(position * trackItemOffset) }}
        transition={effectiveTransition}
        onAnimationStart={() => setIsAnimating(true)}
        onAnimationComplete={handleAnimationComplete}
      >
        {itemsForRender.map((product, index) => (
          <CarouselItem
            key={`${product.id}-${index}`}
            product={product}
            index={index}
            itemWidth={itemWidth}
            trackItemOffset={trackItemOffset}
            x={x}
            transition={effectiveTransition}
          />
        ))}
      </motion.div>
      <div className="product-carousel-indicators" aria-hidden="true">
        {safeProducts.map((product, index) => (
          <button
            key={product.id}
            type="button"
            className={activeIndex === index ? "active" : ""}
            onClick={() => setPosition(loop ? index + 1 : index)}
            aria-label={`Show ${product.name}`}
          />
        ))}
      </div>
    </div>
  );
}
