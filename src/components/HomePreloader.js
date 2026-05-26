"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

const PRELOADER_MIN_DURATION_MS = 1600;
const PRELOADER_MAX_DURATION_MS = 2600;
const PRELOADER_EXIT_DELAY_MS = 180;
const HOME_CRITICAL_READY_EVENT = "saqib:home-critical-ready";
const GAUGE_SIZE = 320;
const CENTER = GAUGE_SIZE / 2;
const STROKE_WIDTH = 3;
const RADIUS = 122;
const GOLD = "#d5ad5f";
const WHITE = "#f8f5ef";
const TICKS = Array.from({ length: 60 }, (_, index) => {
  const angle = index * 6 - 90;
  const radians = (angle * Math.PI) / 180;
  const isMajor = index % 5 === 0;
  const isQuarter = index % 15 === 0;
  const outer = isQuarter ? 141 : isMajor ? 136 : 130;
  const inner = isQuarter ? 124 : isMajor ? 126 : 122;

  return {
    index,
    isMajor,
    x1: CENTER + Math.cos(radians) * inner,
    y1: CENTER + Math.sin(radians) * inner,
    x2: CENTER + Math.cos(radians) * outer,
    y2: CENTER + Math.sin(radians) * outer,
  };
});

const NUMBERS = Array.from({ length: 11 }, (_, index) => {
  const value = (index + 1) * 5;
  const dialIndex = index + 1;
  const angle = dialIndex * 30 - 90;
  const radians = (angle * Math.PI) / 180;

  return {
    value,
    x: CENTER + Math.cos(radians) * 103,
    y: CENTER + Math.sin(radians) * 103,
    angle,
  };
});

export default function HomePreloader() {
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(true);
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    let frameId = 0;
    let minTimePassed = false;
    let criticalAssetsReady = Boolean(window.__saqibHomeCriticalReady);
    let finished = false;
    const startTime = performance.now();
    const maxDurationTimerId = window.setTimeout(() => {
      criticalAssetsReady = true;
      window.__saqibHomeCriticalReady = true;
      maybeFinish();
    }, PRELOADER_MAX_DURATION_MS);

    const finish = () => {
      if (finished) return;
      finished = true;
      window.clearTimeout(maxDurationTimerId);
      setProgress(100);
      setExiting(true);
      window.setTimeout(() => setVisible(false), PRELOADER_EXIT_DELAY_MS);
    };

    const maybeFinish = () => {
      if (minTimePassed && criticalAssetsReady) {
        finish();
      }
    };

    const handleCriticalReady = () => {
      criticalAssetsReady = true;
      window.__saqibHomeCriticalReady = true;
      maybeFinish();
    };

    window.addEventListener(HOME_CRITICAL_READY_EVENT, handleCriticalReady);

    const tick = (now) => {
      const elapsed = now - startTime;
      const rawProgress = Math.min(elapsed / PRELOADER_MIN_DURATION_MS, 1);
      const easedProgress = 1 - Math.pow(1 - rawProgress, 2.25);
      const progressCap = criticalAssetsReady ? 100 : 96;
      const nextValue = Math.min(Math.round(easedProgress * progressCap), progressCap);

      setProgress(nextValue);

      if (rawProgress >= 1) {
        minTimePassed = true;
        maybeFinish();
      }

      if (!finished) {
        frameId = window.requestAnimationFrame(tick);
      }
    };

    frameId = window.requestAnimationFrame(tick);
    return () => {
      window.clearTimeout(maxDurationTimerId);
      window.cancelAnimationFrame(frameId);
      window.removeEventListener(HOME_CRITICAL_READY_EVENT, handleCriticalReady);
    };
  }, []);

  if (!visible) return null;

  const needleRotation = progress * 3.6;

  return (
    <div
      data-home-preloader
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 200,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
        background:
          "radial-gradient(circle at 50% 50%, rgba(213,173,95,0.11), transparent 20%), radial-gradient(circle at 50% 72%, rgba(213,173,95,0.08), transparent 30%), #030302",
        color: WHITE,
        opacity: exiting ? 0 : 1,
        transition: `opacity ${PRELOADER_EXIT_DELAY_MS}ms ease`,
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(135deg, rgba(255,255,255,0.035), transparent 30%, rgba(213,173,95,0.035) 58%, transparent 76%), radial-gradient(circle at center, transparent 0 30%, rgba(0,0,0,0.72) 70%)",
          pointerEvents: "none",
        }}
      />

      <motion.div
        initial={false}
        animate={{ scale: exiting ? 0.985 : 1 }}
        transition={{ duration: 0.18, ease: "easeOut" }}
        style={{
          position: "relative",
          width: "min(64vw, 330px)",
          minWidth: "220px",
          maxWidth: "330px",
          aspectRatio: "1 / 1",
          textAlign: "center",
          display: "grid",
          placeItems: "center",
        }}
      >
        <motion.div
          aria-label="Loading"
          role="status"
          style={{
            width: "100%",
            aspectRatio: "1 / 1",
            position: "relative",
            display: "grid",
            placeItems: "center",
          }}
        >
          <svg
            viewBox={`0 0 ${GAUGE_SIZE} ${GAUGE_SIZE}`}
            style={{
              width: "100%",
              height: "100%",
              overflow: "visible",
              filter: "drop-shadow(0 0 28px rgba(213,173,95,0.18))",
            }}
          >
            <defs>
              <filter id="needle-glow" x="-70%" y="-70%" width="240%" height="240%">
                <feGaussianBlur stdDeviation="3.6" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
              <radialGradient id="gauge-face" cx="50%" cy="50%" r="55%">
                <stop offset="0%" stopColor="rgba(213,173,95,0.1)" />
                <stop offset="62%" stopColor="rgba(10,10,10,0.86)" />
                <stop offset="100%" stopColor="rgba(0,0,0,0.96)" />
              </radialGradient>
            </defs>

            <circle
              cx={CENTER}
              cy={CENTER}
              r="116"
              fill="url(#gauge-face)"
              stroke="rgba(213,173,95,0.18)"
              strokeWidth="1"
            />

            <circle
              cx={CENTER}
              cy={CENTER}
              r="146"
              fill="none"
              stroke="rgba(248,245,239,0.12)"
              strokeWidth="1"
            />

            <circle
              cx={CENTER}
              cy={CENTER}
              r={RADIUS}
              fill="none"
              stroke="rgba(255,255,255,0.08)"
              strokeWidth={STROKE_WIDTH}
            />

            {TICKS.map((tick) => (
              <line
                key={tick.index}
                x1={tick.x1}
                y1={tick.y1}
                x2={tick.x2}
                y2={tick.y2}
                stroke={tick.isMajor ? WHITE : "rgba(248,245,239,0.46)"}
                strokeWidth={tick.isMajor ? 2 : 1}
                strokeLinecap="round"
              />
            ))}

            {NUMBERS.map((number) => (
              <text
                key={number.value}
                x={number.x}
                y={number.y}
                fill="rgba(248,245,239,0.78)"
                fontSize="10"
                fontWeight="800"
                textAnchor="middle"
                dominantBaseline="middle"
                transform={`rotate(${number.angle + 90} ${number.x} ${number.y})`}
              >
                {number.value}
              </text>
            ))}

            <g
              filter="url(#needle-glow)"
              transform={`rotate(${needleRotation} ${CENTER} ${CENTER})`}
            >
              <polygon
                points={`${CENTER - 3.5},${CENTER + 14} ${CENTER + 3.5},${CENTER + 14} ${CENTER + 2.25},${CENTER - 106} ${CENTER},${CENTER - 122} ${CENTER - 2.25},${CENTER - 106}`}
                fill={GOLD}
                opacity="0.95"
              />
              <line
                x1={CENTER}
                y1={CENTER + 12}
                x2={CENTER}
                y2={CENTER - 112}
                stroke={WHITE}
                strokeWidth="1.25"
                strokeLinecap="round"
              />
              <line
                x1={CENTER}
                y1={CENTER + 10}
                x2={CENTER}
                y2={CENTER + 44}
                stroke={GOLD}
                strokeWidth="2.5"
                strokeLinecap="round"
                opacity="0.45"
              />
              <circle cx={CENTER} cy={CENTER - 113} r="4.6" fill={GOLD} stroke={WHITE} strokeWidth="1.1" />
            </g>

            <circle cx={CENTER} cy={CENTER} r="13" fill="#050505" stroke={GOLD} strokeWidth="4" />
            <circle cx={CENTER} cy={CENTER} r="4" fill={WHITE} />
          </svg>
        </motion.div>
      </motion.div>
    </div>
  );
}
