import { Inter, Cormorant_Garamond } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
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
    "Saqib Watches", "Saqib Khan watches", "Saqib Khan Peshawar",
    "saqib champ watches", "saqib bodybuilder watches", 
    "saqib champion watch", "saqib physique champion",
    "saqib khan champ watch", "luxury watches Pakistan",
    "buy watches online Pakistan", "original watches Pakistan",
    "men watches online Pakistan", "women watches Pakistan",
    "couple watches Pakistan", "affordable luxury watches",
    "wrist watches Pakistan", "online watch store Pakistan",
    "Peshawar watches", "Khyber Bazar watches",
    "branded watches Pakistan", "Tissot Pakistan",
    "Cartier Pakistan", "watch collection Pakistan",
    "best watches Pakistan", "watches gift Pakistan",
    "COD watches Pakistan", "cash on delivery watches",
    "free delivery watches Pakistan", "saqibkhan.champ",
    "saqibkhan0489 watches"
  ],
  authors: [{ name: "Saqib Watches", url: "https://saqib.watch" }],
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
    canonical: "https://saqib.watch",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "Saqib Watches",
    title: "Saqib Watches — Premium Luxury Watches in Pakistan",
    description:
      "500+ handpicked luxury watches for men, women & couples. Curated by Pakistan's Physique Champion. Free delivery. COD available.",
    url: "https://saqib.watch",
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
  metadataBase: new URL("https://saqib.watch"),
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
        {/* JSON-LD Structured Data for Google Rich Results */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@graph": [
                {
                  "@type": "Organization",
                  "@id": "https://saqib.watch/#organization",
                  name: "Saqib Watches",
                  url: "https://saqib.watch",
                  logo: {
                    "@type": "ImageObject",
                    url: "https://saqib.watch/main_logo-removebg.png",
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
                  "@id": "https://saqib.watch/#website",
                  url: "https://saqib.watch",
                  name: "Saqib Watches",
                  publisher: {
                    "@id": "https://saqib.watch/#organization",
                  },
                  potentialAction: {
                    "@type": "SearchAction",
                    target: "https://saqib.watch/gallery?q={search_term_string}",
                    "query-input": "required name=search_term_string",
                  },
                },
                {
                  "@type": "Person",
                  "@id": "https://saqib.watch/#saqibkhan",
                  name: "Saqib Khan",
                  alternateName: ["Saqib Champ", "saqibkhan.champ", "Saqib Khan Champion"],
                  description: "Pakistani National Physique Champion, Personal Trainer, and Founder of Saqib Watches",
                  jobTitle: ["Physique Champion", "Personal Trainer", "Entrepreneur"],
                  address: {
                    "@type": "PostalAddress",
                    addressLocality: "Peshawar",
                    addressCountry: "PK"
                  },
                  sameAs: [
                    "https://www.instagram.com/saqibkhan.champ/",
                    "https://www.tiktok.com/@saqibkhan0489",
                    "https://www.facebook.com/saqib.khan.723464/"
                  ],
                  url: "https://saqib.watch/about",
                  worksFor: {
                    "@id": "https://saqib.watch/#organization"
                  }
                },
                {
                  "@type": "LocalBusiness",
                  "@id": "https://saqib.watch/#localbusiness",
                  name: "Saqib Watches",
                  description: "Premium luxury watches store in Peshawar, Pakistan. Curated by National Physique Champion Saqib Khan.",
                  url: "https://saqib.watch",
                  telephone: "+92-334-5062546",
                  priceRange: "PKR 3000 - PKR 20000",
                  currenciesAccepted: "PKR",
                  paymentAccepted: "Cash, EasyPaisa, JazzCash",
                  openingHoursSpecification: [
                    {
                      "@type": "OpeningHoursSpecification",
                      dayOfWeek: ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"],
                      opens: "10:00",
                      closes: "21:00"
                    },
                    {
                      "@type": "OpeningHoursSpecification",
                      dayOfWeek: "Sunday",
                      opens: "12:00",
                      closes: "18:00"
                    }
                  ],
                  address: {
                    "@type": "PostalAddress",
                    streetAddress: "01, Saddar Bazar",
                    addressLocality: "Peshawar",
                    addressRegion: "Saddar Rd, Peshawar Cantonment, Peshawar, Pakistan",
                    addressCountry: "PK"
                  },
                  geo: {
                    "@type": "GeoCoordinates",
                    latitude: 34.0151,
                    longitude: 71.5785
                  },
                  founder: {
                    "@id": "https://saqib.watch/#saqibkhan"
                  }
                }
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
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
