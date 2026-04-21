"use client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { FaPhoneAlt, FaEnvelope, FaWhatsapp, FaClock } from "react-icons/fa";
import emailjs from "@emailjs/browser";
import { toast } from "sonner";


export default function ContactPage() {


    function emailSend(e) {
        e.preventDefault();
        emailjs.sendForm(
            "service_v3f938c", "template_p0pf2le", e.target, "_B-DScnQtHlKbGAfi"
        )
        toast.success("Email sent successfully", {
            description: "we have reveived your email successfully, we'll reach out to you soon!",
            duration: 3000
        })
        e.target.reset();
    }

    return (
        <>
            <Header />
            <main className="pt-24 min-h-screen bg-dark" style={{ padding: "8vw 2vw 3vw 2vw" }}>
                <div className="w-full px-6 md:px-12 2xl:px-20 py-12 md:py-20">
                    <div className="text-center mb-16" style={{ marginBottom: "2vw" }}>
                        <p className="text-gold tracking-[0.4em] text-xs uppercase mb-3">
                            Get in Touch
                        </p>
                        <h1 className="font-serif text-4xl md:text-6xl text-white font-light">
                            Contact Us
                        </h1>
                        <div className="mt-6 w-16 h-px bg-gold mx-auto" />
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
                        {/* Contact Info */}
                        <div className="space-y-8">
                            <h2 className="font-serif text-3xl text-white">
                                We&apos;re here to help
                            </h2>
                            <p className="text-gray-muted text-lg leading-relaxed">
                                Have a question about our timepieces or need assistance with your
                                order? Our dedicated support team is available to assist you.
                            </p>

                            <div className="space-y-6 pt-4" style={{ paddingTop: "10px" }}>
                                <div className="flex items-center gap-4 bg-dark-card p-6 rounded-lg border border-white/5" style={{ marginBottom: "0.5vw", padding: "0.5vw" }}>
                                    <div className="w-12 h-12 rounded-full bg-gold/10 flex items-center justify-center text-gold text-xl">
                                        <FaPhoneAlt />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-muted uppercase tracking-wider mb-1">
                                            Call Us
                                        </p>
                                        <p className="text-white text-lg font-medium">
                                            +92 334 5062546
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4 bg-dark-card p-6 rounded-lg border border-white/5" style={{ marginBottom: "0.5vw", padding: "0.5vw" }}>
                                    <div className="w-12 h-12 rounded-full bg-gold/10 flex items-center justify-center text-gold text-xl">
                                        <FaWhatsapp />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-muted uppercase tracking-wider mb-1">
                                            WhatsApp
                                        </p>
                                        <p className="text-white text-lg font-medium">
                                            +92 334 5062546
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4 bg-dark-card p-6 rounded-lg border border-white/5" style={{ marginBottom: "0.5vw", padding: "0.5vw" }}>
                                    <div className="w-12 h-12 rounded-full bg-gold/10 flex items-center justify-center text-gold text-xl">
                                        <FaEnvelope />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-muted uppercase tracking-wider mb-1">
                                            Email Us
                                        </p>
                                        <p className="text-white text-lg font-medium">
                                            saqib.watches@gmail.com
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4 bg-dark-card p-6 rounded-lg border border-white/5" style={{ marginBottom: "0.5vw", padding: "0.5vw" }}>
                                    <div className="w-12 h-12 rounded-full bg-gold/10 flex items-center justify-center text-gold text-xl">
                                        <FaClock />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-muted uppercase tracking-wider mb-1">
                                            Store Hours
                                        </p>
                                        <p className="text-white font-medium text-sm md:text-base leading-relaxed">
                                            Monday – Saturday: 10:00 AM – 9:00 PM<br/>
                                            Sunday: 12:00 PM – 6:00 PM
                                        </p>
                                    </div>
                                </div>
                            </div>
                            
                            {/* Map Embed */}
                            <div className="pt-6 w-full">
                                <h3 className="text-gold uppercase tracking-widest text-sm font-semibold mb-4">FIND OUR STORE</h3>
                                <div className="border border-[#333] rounded-lg overflow-hidden w-full relative h-75">
                                    <iframe 
                                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3306.4!2d71.5785!3d34.0151!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x38d917b31a79e8b5%3A0x9f0a8ef17ec285c0!2sKhyber%20Bazaar%2C%20Peshawar!5e0!3m2!1sen!2s!4v1"
                                    width="100%" 
                                    height="100%" 
                                    className="absolute inset-0"
                                    style={{ border: 0 }} 
                                    allowFullScreen="" 
                                    loading="lazy"
                                    ></iframe>
                                </div>
                                <a 
                                    href="https://maps.google.com/?q=Khyber+Bazar+Peshawar+Pakistan" 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="mt-6 w-full inline-block text-center border-2 border-gold text-gold py-4 uppercase tracking-[0.2em] font-bold text-sm hover:bg-gold hover:text-black transition-colors"
                                >
                                    Get Directions
                                </a>
                            </div>
                        </div>

                        {/* Contact Form */}
                        <div className="bg-dark-card p-8 md:p-10 rounded-xl border border-white/5" style={{ padding: "1vw" }}>
                            <h3 className="font-serif text-2xl text-white mb-6">
                                Send us a message
                            </h3>
                            <form onSubmit={emailSend} target="/" className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-sm text-gray-muted uppercase tracking-wider">
                                            First Name
                                        </label>
                                        <input
                                            type="text"
                                            name="first_name"
                                            className="w-full bg-dark border border-white/10 rounded px-4 py-3 text-white focus:border-gold focus:outline-none transition-colors" style={{ padding: "0.5vw" }}
                                            placeholder="John"
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm text-gray-muted uppercase tracking-wider">
                                            Last Name
                                        </label>
                                        <input
                                            type="text"
                                            name="last_name"
                                            className="w-full bg-dark border border-white/10 rounded px-4 py-3 text-white focus:border-gold focus:outline-none transition-colors" style={{ padding: "0.5vw" }}
                                            placeholder="Doe"
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm text-gray-muted uppercase tracking-wider">
                                        Email
                                    </label>
                                    <input
                                        type="email"
                                        name="email"
                                        className="w-full bg-dark border border-white/10 rounded px-4 py-3 text-white focus:border-gold focus:outline-none transition-colors" style={{ padding: "0.5vw" }}
                                        placeholder="john@example.com"
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm text-gray-muted uppercase tracking-wider">
                                        Message
                                    </label>
                                    <textarea
                                        rows="4"
                                        name="message"
                                        className="w-full bg-dark border border-white/10 rounded px-4 py-3 text-white focus:border-gold focus:outline-none transition-colors resize-none" style={{ padding: "0.5vw" }}
                                        placeholder="How can we help you?"
                                        required
                                    ></textarea>
                                </div>
                                <button
                                    type="submit"
                                    className="w-full cursor-pointer py-4 bg-gold text-black font-bold  uppercase tracking-[0.2em] hover:bg-gold-light transition-colors"
                                    style={{ padding: "0.5vw" }}
                                >
                                    Send Message
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </>
    );
}
