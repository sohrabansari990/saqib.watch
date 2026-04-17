"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Star } from "lucide-react";

const testimonials = [
  {
    quote:
      "Got my Tissot PRX from Saqib bhai, arrived next day. 100% original, price was unbeatable in Peshawar.",
    name: "Ali Hassan",
    city: "Peshawar",
  },
  {
    quote:
      "Ordered for my husband as a gift. The Cartier looked exactly like the picture. Very trustworthy seller!",
    name: "Ayesha Noor",
    city: "Islamabad",
  },
  {
    quote:
      "Bought the couples set. Both watches are perfect quality. Saqib Khan ki recommendation pe trust kiya aur sahi kiya.",
    name: "Bilal Rehman",
    city: "Lahore",
  },
];

function TestimonialCard({ testimonial, index }) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      className="flex h-full w-[85vw] sm:w-[50vw] md:w-auto shrink-0 snap-start"
    >
      <div className="flex-1 flex flex-col rounded-2xl border border-white/10 bg-[#141414] shadow-xl transition-all duration-300 hover:-translate-y-2 hover:border-gold/40 hover:shadow-gold/5" style={{ padding: "2rem" }}>
        <div className="flex items-center gap-1.5 text-gold mb-6">
          {Array.from({ length: 5 }).map((_, starIndex) => (
            <Star key={starIndex} size={18} fill="currentColor" strokeWidth={1} />
          ))}
        </div>

        <p className="text-base md:text-lg leading-relaxed text-gray-300 mb-8 italic">
          "{testimonial.quote}"
        </p>

        <div className="mt-auto pt-6 border-t border-white/10 flex items-center justify-between gap-4">
          <div>
            <p className="font-serif text-xl tracking-wide text-white">{testimonial.name}</p>
            <p className="text-[10px] sm:text-xs uppercase tracking-[0.25em] text-gold mt-1">
              {testimonial.city}
            </p>
          </div>

          <span className="rounded bg-emerald-500/10 px-3 py-1.5 text-[10px] font-bold text-emerald-400 border border-emerald-500/20 uppercase tracking-wider">
            Verified Buyer
          </span>
        </div>
      </div>
    </motion.article>
  );
}

export default function TestimonialsSection() {
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });

  return (
    <section ref={sectionRef} style={{ marginTop: "5vw", marginBottom: "2vw" }} className="bg-dark  px-6 flex flex-col items-center justify-center  py-32 md:px-12 md:py-48 2xl:px-20 overflow-hidden">
      <div className="w-full flex flex-col items-center justify-center ">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          className="w-full text-center mb-20"
        >
          <p className="text-gold text-xs font-medium uppercase tracking-[0.45em]">
            Testimonials
          </p>
          <h2 className="mt-4 font-serif text-4xl md:text-5xl lg:text-6xl font-light text-white">
            What Our Customers Say
          </h2>
          <div className="mt-6 w-16 h-px bg-gold mx-auto" />
        </motion.div>

        <div className="w-full flex items-center justify-center flex-col md:grid md:grid-cols-3  gap-6 lg:gap-10">
          {testimonials.map((testimonial, index) => (
            <TestimonialCard key={testimonial.name} testimonial={testimonial} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}