import { Inter, Cormorant_Garamond } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/context/CartContext";
import { Toaster } from "sonner";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  variable: "--font-cormorant-garamond",
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

export const metadata = {
  icons: {
    icon: "/main_logo-removebg.png",
    shortcut: "/main_logo-removebg.png",
    apple: "/main_logo-removebg.png",
  },
  title: {
    default: "Saqib Watches — Premium Luxury Watches in Pakistan | Buy Online",
    template: "%s | Saqib Watches",
  },
  description:
    "Shop Saqib Watches — Pakistan's trusted online luxury watch store. 500+ premium watches for men, women & couples. Handpicked by champion Saqib Khan. Free delivery across Pakistan. COD available.",
  keywords: [
    "Saqib Watches",
    "Saqib Khan watches",
    "luxury watches Pakistan",
    "buy watches online Pakistan",
    "original watches Pakistan",
    "men watches online",
    "women watches Pakistan",
    "couple watches set",
    "affordable luxury watches",
    "wrist watches Pakistan",
    "online watch store Pakistan",
    "Peshawar watches",
    "branded watches Pakistan",
    "Tissot Pakistan",
    "Cartier Pakistan",
    "watch collection Pakistan",
    "best watches in Pakistan",
    "watches for gift Pakistan",
    "COD watches Pakistan",
    "premium watches online",
  ],
  authors: [{ name: "Saqib Watches", url: "https://saqib-watches.vercel.app" }],
  creator: "Saqib Watches",
  publisher: "Saqib Watches",
  robots: {
    index: true,
    follow: true,
    "max-image-preview": "large",
    "max-snippet": -1,
    "max-video-preview": -1,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
  alternates: {
    canonical: "https://saqib-watches.vercel.app",
    // When domain is ready: canonical: "https://saqib.watch",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "Saqib Watches",
    title: "Saqib Watches — Premium Luxury Watches in Pakistan",
    description:
      "500+ handpicked luxury watches for men, women & couples. Curated by Pakistan's Physique Champion. Free delivery. COD available.",
    url: "https://saqib-watches.vercel.app",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Saqib Watches — Premium Luxury Watches in Pakistan",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Saqib Watches — Premium Luxury Watches in Pakistan",
    description:
      "500+ handpicked luxury watches. Curated by champion Saqib Khan. Free delivery across Pakistan.",
    images: ["/og-image.jpg"],
  },
  // TODO: Change to https://saqib.watch when domain is ready
  metadataBase: new URL("https://saqib-watches.vercel.app"),
  verification: {
    google: "40VoPoHnY0Ojwsi",
  },
};

import { AuthProvider } from "@/context/AuthContext";
import { FavoritesProvider } from "@/context/FavoritesContext";

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${inter.variable} ${cormorant.variable}`}>
      <head>
        {/* DNS prefetch for image CDNs */}
        <link rel="dns-prefetch" href="https://firebasestorage.googleapis.com" />
        <link rel="preconnect" href="https://firebasestorage.googleapis.com" crossOrigin="anonymous" />
        {/* Preload intro video for instant playback */}
        <link rel="preload" href="/saqib_into.MOV" as="video" type="video/quicktime" />
        {/* JSON-LD Structured Data for Google Rich Results */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@graph": [
                {
                  "@type": "Organization",
                  "@id": "https://saqib-watches.vercel.app/#organization",
                  name: "Saqib Watches",
                  url: "https://saqib-watches.vercel.app",
                  logo: {
                    "@type": "ImageObject",
                    url: "https://saqib-watches.vercel.app/main_logo-removebg.png",
                  },
                  description:
                    "Pakistan's trusted online luxury watch store. 500+ premium watches for men, women & couples.",
                  address: {
                    "@type": "PostalAddress",
                    streetAddress: "01, Khyber Bazar",
                    addressLocality: "Peshawar",
                    addressCountry: "PK",
                  },
                  contactPoint: {
                    "@type": "ContactPoint",
                    telephone: "+92-317-5177780",
                    contactType: "sales",
                    areaServed: "PK",
                    availableLanguage: ["en", "ur"],
                  },
                  sameAs: [
                    "https://www.instagram.com/saqibkhan.champ/",
                    "https://www.tiktok.com/@saqibkhan0489",
                    "https://www.facebook.com/saqib.khan.723464/",
                  ],
                },
                {
                  "@type": "WebSite",
                  "@id": "https://saqib-watches.vercel.app/#website",
                  url: "https://saqib-watches.vercel.app",
                  name: "Saqib Watches",
                  publisher: {
                    "@id": "https://saqib-watches.vercel.app/#organization",
                  },
                  potentialAction: {
                    "@type": "SearchAction",
                    target: "https://saqib-watches.vercel.app/gallery?q={search_term_string}",
                    "query-input": "required name=search_term_string",
                  },
                },
              ],
            }),
          }}
        />
      </head>
      <body className="bg-dark text-foreground antialiased font-sans" suppressHydrationWarning suppressContentEditableWarning>
        <AuthProvider>
          <CartProvider>
            <FavoritesProvider>
              {children}
            </FavoritesProvider>
            <Toaster position="top-center" richColors theme="dark" />
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
