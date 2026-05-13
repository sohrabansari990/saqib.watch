"use client";

import { useEffect, useState } from "react";

const PRELOADER_DURATION_MS = 2200;
const PRELOADER_EXIT_DELAY_MS = 180;
const RING_SIZE = 250;
const STROKE_WIDTH = 8;
const RADIUS = (RING_SIZE - STROKE_WIDTH) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export default function HomePreloader() {
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(true);
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    let frameId = 0;
    let finished = false;
    const startTime = performance.now();

    const tick = (now) => {
      const elapsed = now - startTime;
      const rawProgress = Math.min(elapsed / PRELOADER_DURATION_MS, 1);
      const easedProgress = 1 - Math.pow(1 - rawProgress, 2.25);
      const nextValue = Math.min(Math.round(easedProgress * 100), 100);

      setProgress(nextValue);

      if (rawProgress < 1) {
        frameId = window.requestAnimationFrame(tick);
        return;
      }

      if (!finished) {
        finished = true;
        setExiting(true);
        window.setTimeout(() => setVisible(false), PRELOADER_EXIT_DELAY_MS);
      }
    };

    frameId = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(frameId);
  }, []);

  if (!visible) return null;

  const dashOffset = CIRCUMFERENCE - (progress / 100) * CIRCUMFERENCE;

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
          "radial-gradient(circle at center, rgba(201,169,110,0.14), transparent 24%), radial-gradient(circle at top, rgba(201,169,110,0.08), transparent 30%), #050505",
        color: "#f8f5ef",
        opacity: exiting ? 0 : 1,
        transition: `opacity ${PRELOADER_EXIT_DELAY_MS}ms ease`,
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(180deg, rgba(5,5,5,0.2), rgba(5,5,5,0.84))",
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
            width: `${RING_SIZE}px`,
            height: `${RING_SIZE}px`,
            maxWidth: "68vw",
            maxHeight: "68vw",
            margin: "0 auto 18px",
            position: "relative",
            display: "grid",
            placeItems: "center",
          }}
        >
          <svg
            viewBox={`0 0 ${RING_SIZE} ${RING_SIZE}`}
            style={{
              width: "100%",
              height: "100%",
              overflow: "visible",
              transform: "rotate(-90deg)",
              filter: "drop-shadow(0 0 28px rgba(201,169,110,0.18))",
            }}
          >
            <circle
              cx={RING_SIZE / 2}
              cy={RING_SIZE / 2}
              r={RADIUS}
              fill="transparent"
              stroke="rgba(255,255,255,0.08)"
              strokeWidth={STROKE_WIDTH}
            />
            <circle
              cx={RING_SIZE / 2}
              cy={RING_SIZE / 2}
              r={RADIUS}
              fill="transparent"
              stroke="#c9a96e"
              strokeWidth={STROKE_WIDTH}
              strokeLinecap="round"
              strokeDasharray={CIRCUMFERENCE}
              strokeDashoffset={dashOffset}
            />
          </svg>

          <div
            style={{
              position: "absolute",
              inset: "11%",
              borderRadius: "999px",
              border: "1px solid rgba(201,169,110,0.24)",
              background:
                "radial-gradient(circle at center, rgba(201,169,110,0.08), rgba(10,10,10,0.9) 68%)",
              boxShadow:
                "inset 0 0 40px rgba(201,169,110,0.08), 0 18px 60px rgba(0,0,0,0.45)",
            }}
          />

          <div
            style={{
              position: "absolute",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: "6px",
            }}
          >
            <span
              style={{
                color: "#c9a96e",
                fontSize: "clamp(34px, 7vw, 52px)",
                lineHeight: 1,
                fontWeight: 700,
                fontFamily: "var(--font-cormorant-garamond), Georgia, serif",
              }}
            >
              {progress}
            </span>
            <span
              style={{
                color: "rgba(248,245,239,0.78)",
                fontSize: "12px",
                fontWeight: 800,
                letterSpacing: "0.22em",
                textTransform: "uppercase",
              }}
            >
              Percent
            </span>
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
            color: "rgba(248,245,239,0.62)",
            fontSize: "12px",
            letterSpacing: "0.16em",
            textTransform: "uppercase",
          }}
        >
          Loading, almost there
        </p>
      </div>
    </div>
  );
}
