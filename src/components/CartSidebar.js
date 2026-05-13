"use client";

import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { X, Trash2, ShoppingBag, Truck, Minus, Plus } from "lucide-react";
import { useCart } from "@/context/CartContext";
import {
  formatPrice,
  getItemDisplayColor,
  getItemDisplayImageUrl,
  getItemVariantLabel,
} from "@/lib/order";

function getLineTotal(item) {
  const price =
    typeof item?.price === "number"
      ? item.price
      : Number(String(item?.price ?? 0).replace(/[^0-9.-]+/g, ""));
  return (Number.isFinite(price) ? price : 0) * (item?.quantity ?? 1);
}

export default function CartSidebar({ open, onClose }) {
  const { cart, removeFromCart, updateQuantity, getCartTotal } = useCart();
  const subtotal = getCartTotal();
  const itemCount = cart.reduce((total, item) => total + item.quantity, 0);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.button
            aria-label="Close cart"
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 95,
              background: "rgba(0,0,0,0.68)",
              backdropFilter: "blur(2px)",
              border: 0,
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.aside
            role="dialog"
            aria-modal="true"
            aria-label="Shopping cart"
            style={{
              position: "fixed",
              top: 0,
              right: 0,
              zIndex: 100,
              width: "min(100vw, 480px)",
              height: "100dvh",
              display: "flex",
              flexDirection: "column",
              background: "#101010",
              color: "#f8f5ef",
              boxShadow: "-24px 0 70px rgba(0,0,0,0.35)",
            }}
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", bounce: 0, duration: 0.38 }}
          >
            <div
              style={{
                padding: "24px 28px 18px",
                borderBottom: "1px solid rgba(201,169,110,0.18)",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "20px",
              }}
            >
              <div>
                <p style={{ fontSize: "10px", fontWeight: 800, letterSpacing: "0.28em", textTransform: "uppercase", color: "rgba(201,169,110,0.72)" }}>
                  Shopping Cart
                </p>
                <h2 style={{ marginTop: "4px", fontSize: "22px", lineHeight: 1.1, fontWeight: 900 }}>
                  {itemCount} {itemCount === 1 ? "Item" : "Items"}
                </h2>
              </div>
              <button
                onClick={onClose}
                aria-label="Close cart"
                style={{
                  width: "44px",
                  height: "44px",
                  borderRadius: "999px",
                  border: "1px solid rgba(255,255,255,0.14)",
                  background: "transparent",
                  color: "#f8f5ef",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                }}
              >
                <X size={21} />
              </button>
            </div>

            {cart.length > 0 && (
              <div style={{ padding: "18px 28px", borderBottom: "1px solid rgba(201,169,110,0.14)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <div style={{ height: "6px", flex: 1, overflow: "hidden", borderRadius: "999px", background: "rgba(255,255,255,0.12)" }}>
                    <div style={{ height: "100%", width: "100%", borderRadius: "999px", background: "#c9a96e" }} />
                  </div>
                  <span
                    style={{
                      width: "36px",
                      height: "36px",
                      borderRadius: "999px",
                      border: "1px solid rgba(201,169,110,0.5)",
                      color: "#c9a96e",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Truck size={17} />
                  </span>
                </div>
                <p style={{ marginTop: "12px", fontSize: "14px", color: "rgba(248,245,239,0.64)" }}>
                  Congratulations! You have got free shipping.
                </p>
              </div>
            )}

            <div style={{ flex: 1, minHeight: 0, overflowY: "auto", padding: cart.length > 0 ? "22px 28px" : "28px" }}>
              {cart.length === 0 ? (
                <div style={{ minHeight: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center" }}>
                  <div style={{ width: "68px", height: "68px", borderRadius: "999px", background: "rgba(201,169,110,0.1)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "20px" }}>
                    <ShoppingBag color="#c9a96e" size={28} />
                  </div>
                  <h3 style={{ fontSize: "18px", fontWeight: 800 }}>Your cart is empty</h3>
                  <p style={{ marginTop: "8px", maxWidth: "270px", color: "rgba(248,245,239,0.62)", fontSize: "14px", lineHeight: 1.65 }}>
                    Add a watch from the gallery and it will show here with full details.
                  </p>
                  <Link
                    href="/gallery"
                    onClick={onClose}
                    style={{
                      marginTop: "26px",
                      padding: "13px 26px",
                      borderRadius: "999px",
                      background: "#c9a96e",
                      color: "#050505",
                      fontSize: "12px",
                      fontWeight: 900,
                      letterSpacing: "0.16em",
                      textTransform: "uppercase",
                      textDecoration: "none",
                    }}
                  >
                    Browse Gallery
                  </Link>
                </div>
              ) : (
                <div style={{ display: "grid", gap: "18px" }}>
                  <p style={{ fontSize: "14px", fontWeight: 800, color: "rgba(248,245,239,0.86)" }}>
                    Checkout now to reserve your selection.
                  </p>
                  {cart.map((item) => {
                    const imageUrl = getItemDisplayImageUrl(item);
                    const cartKey = item.cartKey || item.id;
                    return (
                      <div
                        key={cartKey}
                        style={{
                          display: "grid",
                          gridTemplateColumns: "94px minmax(0, 1fr) 28px",
                          gap: "14px",
                          alignItems: "start",
                        }}
                      >
                        <Link
                          href={`/product/${item.id}`}
                          onClick={onClose}
                          style={{
                            width: "94px",
                            height: "94px",
                            position: "relative",
                            overflow: "hidden",
                            borderRadius: "8px",
                            background: "rgba(255,255,255,0.05)",
                            textDecoration: "none",
                          }}
                        >
                          {imageUrl ? (
                            <Image src={imageUrl} alt={item.name} fill sizes="94px" className="object-cover" />
                          ) : (
                            <div style={{ width: "100%", height: "100%", backgroundColor: getItemDisplayColor(item) || "#e5e0d8" }} />
                          )}
                        </Link>
                        <div style={{ minWidth: 0 }}>
                          <Link
                            href={`/product/${item.id}`}
                            onClick={onClose}
                            style={{
                              display: "block",
                              color: "#f8f5ef",
                              fontSize: "15px",
                              lineHeight: 1.2,
                              fontWeight: 900,
                              textDecoration: "none",
                            }}
                          >
                            {item.name}
                          </Link>
                          {getItemVariantLabel(item) && (
                            <p style={{ marginTop: "4px", color: "rgba(248,245,239,0.58)", fontSize: "13px" }}>
                              Colour: {getItemVariantLabel(item)}
                            </p>
                          )}
                          <p style={{ marginTop: "3px", color: "rgba(248,245,239,0.58)", fontSize: "13px" }}>
                            Line total: Rs. {formatPrice(getLineTotal(item))}
                          </p>
                          <div
                            style={{
                              marginTop: "10px",
                              display: "inline-flex",
                              height: "36px",
                              alignItems: "center",
                              borderRadius: "999px",
                              border: "1px solid rgba(255,255,255,0.12)",
                              background: "#050505",
                            }}
                          >
                            <button
                              onClick={() => updateQuantity(cartKey, item.quantity - 1)}
                              disabled={item.quantity <= 1}
                              aria-label="Decrease quantity"
                            style={{ width: "38px", height: "34px", border: 0, background: "transparent", color: "#f8f5ef", opacity: item.quantity <= 1 ? 0.3 : 1, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}
                            >
                              <Minus size={14} />
                            </button>
                            <span style={{ width: "30px", textAlign: "center", fontSize: "13px", fontWeight: 900, color: "#f8f5ef" }}>{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity(cartKey, item.quantity + 1)}
                              aria-label="Increase quantity"
                              style={{ width: "38px", height: "34px", border: 0, background: "transparent", color: "#f8f5ef", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}
                            >
                              <Plus size={14} />
                            </button>
                          </div>
                        </div>
                        <button
                          onClick={() => removeFromCart(cartKey)}
                          aria-label={`Remove ${item.name}`}
                          style={{
                            width: "28px",
                            height: "28px",
                            border: 0,
                            background: "transparent",
                            color: "rgba(248,245,239,0.45)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            cursor: "pointer",
                          }}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {cart.length > 0 && (
              <div style={{ padding: "18px 28px 22px", borderTop: "1px solid rgba(201,169,110,0.18)", background: "#101010" }}>
                <div style={{ marginBottom: "14px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span style={{ fontSize: "18px", fontWeight: 900 }}>Subtotal</span>
                  <span style={{ fontSize: "18px", fontWeight: 900 }}>Rs. {formatPrice(subtotal)}</span>
                </div>
                <Link
                  href="/cart"
                  onClick={onClose}
                  style={{
                    height: "52px",
                    marginBottom: "10px",
                    borderRadius: "999px",
                    border: "1px solid rgba(201,169,110,0.7)",
                    color: "#f8f5ef",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "14px",
                    fontWeight: 900,
                    textDecoration: "none",
                  }}
                >
                  View Cart
                </Link>
                <Link
                  href="/checkout"
                  onClick={onClose}
                  style={{
                    height: "52px",
                    borderRadius: "999px",
                    background: "#c9a96e",
                    color: "#050505",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "14px",
                    fontWeight: 900,
                    textDecoration: "none",
                  }}
                >
                  Checkout
                </Link>
              </div>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
