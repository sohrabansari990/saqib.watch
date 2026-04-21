"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { BadgeCheck, MessageCircleMore, RotateCcw, Truck } from "lucide-react";

const promises = [
  {
    title: "Free Delivery",
    description: "Free delivery across all of Pakistan",
    icon: Truck,
  },
  {
    title: "100% Authentic",
    description: "Every watch is genuine and verified",
    icon: BadgeCheck,
  },
  {
    title: "Easy Returns",
    description: "Hassle-free 7-day return policy",
    icon: RotateCcw,
  },
  {
    title: "WhatsApp Support",
    description: "Order and get help via WhatsApp anytime",
    icon: MessageCircleMore,
  },
];

const highlights = [
  { label: "Delivery", value: "Across Pakistan" },
  { label: "Authenticity", value: "Verified pieces" },
  { label: "Returns", value: "7-day policy" },
  { label: "Support", value: "WhatsApp first" },
];

function PromiseCard({ promise, index, isInView }) {
  const Icon = promise.icon;

  return (
    <motion.article
    
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, delay: 0.12 + index * 0.08 }}
      whileHover={{ y: -6 }}
      className="group h-full"
    >
      <div style={{padding : "20px"}} className="relative h-full min-h-55 overflow-hidden rounded-3xl border border-white/10 bg-white/3 p-5 md:p-6 backdrop-blur-xl">
        <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.08),transparent_35%)] opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
        <div className="relative flex h-full flex-col justify-between gap-5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase tracking-[0.45em] text-gray-500">0{index + 1}</span>
            <motion.div
              animate={isInView ? { rotate: 360 } : {}}
              transition={{ duration: 16, repeat: Infinity, ease: "linear" }}
              className="flex h-11 w-11 items-center justify-center rounded-full border border-gold/20 bg-gold/10 text-gold shadow-[0_0_20px_rgba(201,169,76,0.08)]"
            >
              <Icon size={20} strokeWidth={2} />
            </motion.div>
          </div>

          <div className="space-y-3">
            <h3 className="font-serif text-2xl text-white tracking-wide">{promise.title}</h3>
            <p className="text-sm leading-7 text-gray-400">
            {promise.description}
            </p>
          </div>

          <div className="h-px w-full bg-linear-to-r from-gold/70 via-white/10 to-transparent" />
          <p className="text-[10px] uppercase tracking-[0.35em] text-gold/70">Saqib Watches</p>
        </div>
      </div>
    </motion.article>
  );
}

export default function PromiseSection() {
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-120px" });

  return (
    <section
      style={{marginTop: "30px", paddingTop : "10px"}}
      ref={sectionRef}
      className="relative overflow-hidden border-y border-white/5 bg-[#090909] flex items-center justify-center px-6 py-20 md:px-12 md:py-28 2xl:px-20"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(201,169,76,0.12),transparent_38%),radial-gradient(circle_at_bottom_right,rgba(255,255,255,0.04),transparent_30%)]" />
      <motion.div
        animate={{ x: [0, 20, 0], y: [0, -14, 0] }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -top-24 -right-24 h-80 w-80 rounded-full bg-gold/5 blur-3xl"
      />
      <motion.div
        animate={{ x: [0, -18, 0], y: [0, 12, 0] }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-0 -left-32 h-72 w-72 rounded-full bg-white/5 blur-3xl"
      />

      <div className="relative mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:items-start">
        <motion.div
          initial={{ opacity: 0, y: 26 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="relative overflow-hidden rounded-[28px] border border-white/10 bg-white/3 p-6 md:p-8 backdrop-blur-xl"
        >
          <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(201,169,76,0.08),transparent_40%)]" />
          <div style={{padding : "20px"}}
           className="relative flex flex-col gap-7">
            <div className="flex items-start gap-4 md:gap-5">
              <motion.div
                animate={isInView ? { rotate: 360 } : {}}
                transition={{ duration: 22, repeat: Infinity, ease: "linear" }}
                className="relative flex h-20 w-20 shrink-0 items-center justify-center rounded-full border border-gold/20 md:h-24 md:w-24"
              >
                <div className="absolute inset-2 rounded-full border border-white/10 md:inset-3" />
                <div className="absolute inset-5 rounded-full border border-gold/30 md:inset-6" />
                <div className="h-4 w-4 rounded-full bg-gold shadow-[0_0_24px_rgba(201,169,76,0.5)]" />
              </motion.div>
              <div className="pt-1">
                <p className="text-[10px] uppercase tracking-[0.45em] text-gold/80">Our Promise</p>
                <h2 className="mt-3 max-w-xl font-serif text-4xl md:text-5xl font-light text-white leading-[1.05]">
                  Why Choose Saqib Watches
                </h2>
              </div>
            </div>

            <p className="max-w-xl text-sm md:text-base leading-8 text-gray-400">
              Luxury should feel direct, verified, and effortless. We keep the process sharp: real products, fast delivery, and support that answers fast enough to matter.
            </p>

            <div style={{padding : "10px"}} 
            className="grid gap-3 sm:grid-cols-2">
              {highlights.map((item, index) => (
                <motion.div
                style={{padding : "10px"}}
                  key={item.label}
                  initial={{ opacity: 0, y: 12 }}
                  animate={isInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.5, delay: 0.15 + index * 0.05 }}
                  className="rounded-[18px] border border-white/8 bg-black/20 p-4"
                >
                  <p className="text-[10px] uppercase tracking-[0.35em] text-gray-500">{item.label}</p>
                  <p className="mt-2 font-serif text-lg text-white">{item.value}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

        <div  className="grid gap-4 sm:grid-cols-2 lg:self-start">
          {promises.map((promise, index) => (
            <PromiseCard  key={promise.title} promise={promise} index={index} isInView={isInView} />
          ))}
        </div>
      </div>
    </section>
  );
}