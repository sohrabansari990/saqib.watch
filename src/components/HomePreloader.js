"use client";

import { useEffect, useState } from "react";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";

const PRELOADER_ANIMATION =
  "https://lottie.host/4ebb8e27-9608-4fdd-ac0b-b3a77136b1ac/tZAOaJ6pgy.lottie";

export default function HomePreloader() {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = window.setTimeout(() => setVisible(false), 2500);
    return () => window.clearTimeout(timer);
  }, []);

  if (!visible) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 200,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
        background:
          "radial-gradient(circle at top, rgba(201,169,110,0.16), transparent 30%), #050505",
        color: "#f8f5ef",
      }}
    >
      <video
        src="/clock time.webm"
        autoPlay
        muted
        loop
        playsInline
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          opacity: 0.16,
          mixBlendMode: "screen",
          filter: "sepia(1) saturate(1.25) hue-rotate(350deg) brightness(0.82)",
        }}
      />

      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(180deg, rgba(5,5,5,0.48), rgba(5,5,5,0.9))",
          pointerEvents: "none",
        }}
      />

      <div
        style={{
          position: "relative",
          width: "min(82vw, 420px)",
          textAlign: "center",
          padding: "24px 20px",
        }}
      >
        <div
          style={{
            width: "min(68vw, 280px)",
            height: "min(68vw, 280px)",
            margin: "0 auto 18px",
            borderRadius: "999px",
            border: "1px solid rgba(201,169,110,0.34)",
            background:
              "radial-gradient(circle at center, rgba(201,169,110,0.1), rgba(5,5,5,0.72) 70%)",
            boxShadow:
              "0 0 0 1px rgba(201,169,110,0.12), 0 26px 80px rgba(0,0,0,0.55)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              width: "90%",
              height: "90%",
              filter:
                "brightness(0) saturate(100%) invert(77%) sepia(29%) saturate(673%) hue-rotate(356deg) brightness(94%) contrast(90%)",
              opacity: 0.98,
            }}
          >
            <DotLottieReact src={PRELOADER_ANIMATION} loop autoplay />
          </div>
        </div>

        <p
          style={{
            color: "#c9a96e",
            fontSize: "11px",
            fontWeight: 800,
            letterSpacing: "0.34em",
            textTransform: "uppercase",
          }}
        >
          Saqib Watches
        </p>
        <p
          style={{
            marginTop: "8px",
            color: "rgba(248,245,239,0.58)",
            fontSize: "12px",
            letterSpacing: "0.18em",
            textTransform: "uppercase",
          }}
        >
          Curating your collection
        </p>
        <div
          style={{
            margin: "18px auto 0",
            width: "190px",
            height: "3px",
            borderRadius: "999px",
            overflow: "hidden",
            background: "rgba(255,255,255,0.1)",
          }}
        >
          <div className="home-preloader-bar" />
        </div>
      </div>
    </div>
  );
}
