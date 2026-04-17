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

function PromiseCard({ promise, index }) {
  const Icon = promise.icon;

  return (
    <motion.article
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: index * 0.08 }}
      className="group h-full flex"
    >
      <div className="flex-1 w-full rounded-2xl border border-white/10 bg-[#141414] transition-all duration-300 group-hover:-translate-y-2 group-hover:border-gold/40 shadow-lg flex flex-col items-center text-center" style={{ padding: "2rem" }}>
        <div className="flex h-16 w-16 mb-5 shrink-0 items-center justify-center rounded-full bg-gold/10 text-gold transition-colors duration-300 group-hover:bg-gold group-hover:text-black">
          <Icon size={28} strokeWidth={2} />
        </div>

        <h3 className="text-xl text-white font-serif tracking-wide mb-3">{promise.title}</h3>
        <p className="text-sm leading-relaxed text-gray-400">
          {promise.description}
        </p>
      </div>
    </motion.article>
  );
}

export default function PromiseSection() {
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });

  return (
    <section ref={sectionRef} style={{ marginTop: "5vw", marginBottom: "5vw" }} className="bg-dark  px-6 py-32 md:px-12 md:py-40 2xl:px-20 border-y border-white/5">
      <div className="w-full flex flex-col items-center">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          className="w-full text-center mb-20"
        >
          <p className="text-gold text-xs font-medium uppercase tracking-[0.45em]">
            Our Promise
          </p>
          <h2 className="mt-4 font-serif text-4xl md:text-5xl lg:text-6xl font-light text-white">
            Why Choose Saqib Watches
          </h2>
          <div className="mt-6 w-16 h-px bg-gold mx-auto" />
        </motion.div>

        <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-10">
          {promises.map((promise, index) => (
            <PromiseCard key={promise.title} promise={promise} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}