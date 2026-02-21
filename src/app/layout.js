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
    icon: "/lahza-logo.png",
    shortcut: "/lahza-logo.png",
    apple: "/lahza-logo.png",
  },
  title: {
    default: "LAHZA | Timepieces - Precious in Your Wrist",
    template: "%s | LAHZA Timepieces",
  },
  description:
    "Discover LAHZA Timepieces — premium luxury watches for men, women & couples. Elegant designs, affordable prices. Shop the finest watch collection in Pakistan.",
  keywords: [
    "LAHZA",
    "LAHZA Timepieces",
    "luxury watches Pakistan",
    "buy watches online Pakistan",
    "men watches",
    "women watches",
    "couple watches",
    "affordable luxury watches",
    "wrist watches Pakistan",
    "online watch store",
  ],
  authors: [{ name: "LAHZA Timepieces" }],
  creator: "LAHZA Timepieces",
  publisher: "LAHZA Timepieces",
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "LAHZA Timepieces",
    title: "LAHZA | Timepieces - Precious in Your Wrist",
    description:
      "Discover LAHZA Timepieces — premium luxury watches for men, women & couples. Elegant designs, affordable prices.",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "LAHZA Timepieces",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "LAHZA | Timepieces - Precious in Your Wrist",
    description:
      "Discover LAHZA Timepieces — premium luxury watches for men, women & couples.",
    images: ["/og-image.jpg"],
  },
  metadataBase: new URL("https://lahza.watch"),
};

import { AuthProvider } from "@/context/AuthContext";
import { FavoritesProvider } from "@/context/FavoritesContext";

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${inter.variable} ${cormorant.variable}`}>
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
