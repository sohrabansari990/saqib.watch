"use client";

import { FaWhatsapp } from "react-icons/fa";
import { buildWhatsAppUrl } from "@/lib/order";

const DEFAULT_MESSAGE =
  "Hi! I'd like to ask about Saqib Watches. Please share the available options.";

export default function FloatingWhatsApp() {
  return (
    <a
      href={buildWhatsAppUrl(DEFAULT_MESSAGE)}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat on WhatsApp"
      className="fixed bottom-5 right-5 z-[90] flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-[0_14px_34px_rgba(0,0,0,0.35)] ring-4 ring-white/10 transition-all duration-300 hover:-translate-y-1 hover:bg-white hover:text-[#25D366] md:bottom-7 md:right-7 md:h-16 md:w-16"
    >
      <FaWhatsapp className="h-8 w-8 md:h-9 md:w-9" />
    </a>
  );
}
