import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { FaPhoneAlt, FaEnvelope, FaWhatsapp } from "react-icons/fa";

export default function ContactPage() {
    return (
        <>
            <Header />
            <main className="pt-24 min-h-screen bg-dark">
                <div className="w-full px-6 md:px-12 2xl:px-20 py-12 md:py-20">
                    <div className="text-center mb-16">
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
                                We're here to help
                            </h2>
                            <p className="text-gray-muted text-lg leading-relaxed">
                                Have a question about our timepieces or need assistance with your
                                order? Our dedicated support team is available to assist you.
                            </p>

                            <div className="space-y-6 pt-4">
                                <div className="flex items-center gap-4 bg-dark-card p-6 rounded-lg border border-white/5">
                                    <div className="w-12 h-12 rounded-full bg-gold/10 flex items-center justify-center text-gold text-xl">
                                        <FaPhoneAlt />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-muted uppercase tracking-wider mb-1">
                                            Call Us
                                        </p>
                                        <p className="text-white text-lg font-medium">
                                            +971 50 460 4904
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4 bg-dark-card p-6 rounded-lg border border-white/5">
                                    <div className="w-12 h-12 rounded-full bg-gold/10 flex items-center justify-center text-gold text-xl">
                                        <FaWhatsapp />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-muted uppercase tracking-wider mb-1">
                                            WhatsApp
                                        </p>
                                        <p className="text-white text-lg font-medium">
                                            +971 50 460 4904
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4 bg-dark-card p-6 rounded-lg border border-white/5">
                                    <div className="w-12 h-12 rounded-full bg-gold/10 flex items-center justify-center text-gold text-xl">
                                        <FaEnvelope />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-muted uppercase tracking-wider mb-1">
                                            Email Us
                                        </p>
                                        <p className="text-white text-lg font-medium">
                                            support@sveston.com
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Contact Form */}
                        <div className="bg-dark-card p-8 md:p-10 rounded-xl border border-white/5">
                            <h3 className="font-serif text-2xl text-white mb-6">
                                Send us a message
                            </h3>
                            <form className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-sm text-gray-muted uppercase tracking-wider">
                                            First Name
                                        </label>
                                        <input
                                            type="text"
                                            className="w-full bg-dark border border-white/10 rounded px-4 py-3 text-white focus:border-gold focus:outline-none transition-colors"
                                            placeholder="John"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm text-gray-muted uppercase tracking-wider">
                                            Last Name
                                        </label>
                                        <input
                                            type="text"
                                            className="w-full bg-dark border border-white/10 rounded px-4 py-3 text-white focus:border-gold focus:outline-none transition-colors"
                                            placeholder="Doe"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm text-gray-muted uppercase tracking-wider">
                                        Email
                                    </label>
                                    <input
                                        type="email"
                                        className="w-full bg-dark border border-white/10 rounded px-4 py-3 text-white focus:border-gold focus:outline-none transition-colors"
                                        placeholder="john@example.com"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm text-gray-muted uppercase tracking-wider">
                                        Message
                                    </label>
                                    <textarea
                                        rows="4"
                                        className="w-full bg-dark border border-white/10 rounded px-4 py-3 text-white focus:border-gold focus:outline-none transition-colors resize-none"
                                        placeholder="How can we help you?"
                                    ></textarea>
                                </div>
                                <button
                                    type="submit"
                                    className="w-full py-4 bg-gold text-black font-bold uppercase tracking-[0.2em] hover:bg-gold-light transition-colors"
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
