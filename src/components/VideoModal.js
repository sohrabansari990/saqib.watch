"use client";

import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

export default function VideoModal({ isOpen, onClose, videoUrl }) {
    const overlayRef = useRef(null);
    const videoRef = useRef(null);

    useEffect(() => {
        const handleKey = (event) => {
            if (event.key === "Escape") onClose();
        };

        if (isOpen) {
            document.addEventListener("keydown", handleKey);
            document.body.style.overflow = "hidden";

            if (videoRef.current) {
                videoRef.current.play().catch(() => {});
            }
        }

        return () => {
            document.removeEventListener("keydown", handleKey);
            document.body.style.overflow = "";
        };
    }, [isOpen, onClose]);

    const handleOverlayClick = (event) => {
        if (event.target === overlayRef.current) onClose();
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    ref={overlayRef}
                    onClick={handleOverlayClick}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="fixed inset-0 z-9999 flex cursor-pointer items-center justify-center bg-black/80 backdrop-blur-md"
                >
                    <motion.div
                        initial={{ scale: 0.85, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.85, opacity: 0 }}
                        transition={{ duration: 0.3, ease: "easeOut" }}
                        className="relative aspect-9/16 max-h-[85vh] w-[90vw] max-w-4xl cursor-default overflow-hidden rounded-lg bg-black shadow-2xl md:aspect-video"
                    >
                        <button
                            onClick={onClose}
                            className="absolute top-3 right-3 z-10 flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-black/60 text-white transition-colors hover:bg-black/80"
                        >
                            <X size={20} />
                        </button>

                        <video
                            ref={videoRef}
                            src={videoUrl}
                            controls
                            autoPlay
                            preload="metadata"
                            playsInline
                            className="h-full w-full object-contain"
                        />
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
