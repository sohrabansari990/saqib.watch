"use client";

import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

export default function VideoModal({ isOpen, onClose, videoUrl }) {
    const overlayRef = useRef(null);
    const videoRef = useRef(null);
    const preloadType = videoUrl?.toLowerCase()?.endsWith(".mov") ? "video/quicktime" : "video/mp4";

    // Preload video as soon as component mounts (even before modal opens)
    useEffect(() => {
        if (videoUrl) {
            const link = document.createElement("link");
            link.rel = "preload";
            link.as = "video";
            link.href = videoUrl;
            link.type = preloadType;
            // Only add if not already present
            if (!document.querySelector(`link[href="${videoUrl}"]`)) {
                document.head.appendChild(link);
            }
        }
    }, [preloadType, videoUrl]);

    // Close on Escape key & lock body scroll
    useEffect(() => {
        const handleKey = (e) => {
            if (e.key === "Escape") onClose();
        };
        if (isOpen) {
            document.addEventListener("keydown", handleKey);
            document.body.style.overflow = "hidden";
            // When the modal opens, try to play immediately
            if (videoRef.current) {
                videoRef.current.play().catch(() => {});
            }
        }
        return () => {
            document.removeEventListener("keydown", handleKey);
            document.body.style.overflow = "";
        };
    }, [isOpen, onClose]);

    // Close on click outside
    const handleOverlayClick = (e) => {
        if (e.target === overlayRef.current) onClose();
    };

    return (
        <>
            {/* Hidden preload video element — browser caches it before modal opens */}
            <video
                preload="auto"
                src={videoUrl}
                muted
                style={{ display: "none" }}
                aria-hidden="true"
            />

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        ref={overlayRef}
                        onClick={handleOverlayClick}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="fixed inset-0 z-9999 flex items-center justify-center bg-black/80 backdrop-blur-md cursor-pointer"
                    >
                        <motion.div
                            initial={{ scale: 0.85, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.85, opacity: 0 }}
                            transition={{ duration: 0.3, ease: "easeOut" }}
                            className="relative w-[90vw] max-w-4xl md:aspect-video aspect-9/16 max-h-[85vh] bg-black rounded-lg overflow-hidden shadow-2xl cursor-default"
                        >
                            {/* Close button */}
                            <button
                                onClick={onClose}
                                className="absolute top-3 right-3 z-10 w-10 h-10 rounded-full bg-black/60 hover:bg-black/80 flex items-center justify-center text-white transition-colors cursor-pointer"
                            >
                                <X size={20} />
                            </button>

                            <video
                                ref={videoRef}
                                src={videoUrl}
                                controls
                                autoPlay
                                preload="auto"
                                playsInline
                                className="w-full h-full object-contain"
                            />
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
