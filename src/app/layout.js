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
    default: "Saqib Watches - Precious in Your Wrist",
    template: "%s | Saqib Watches",
  },
  description:
    "Discover Saqib Watches — premium luxury watches for men, women & couples. Elegant designs, affordable prices. Shop the finest watch collection in Pakistan.",
  keywords: [
    "Saqib",
    "Saqib Watches",
    "luxury watches Pakistan",
    "buy watches online Pakistan",
    "men watches",
    "women watches",
    "couple watches",
    "affordable luxury watches",
    "wrist watches Pakistan",
    "online watch store",
  ],
  authors: [{ name: "Saqib Watches" }],
  creator: "Saqib Watches",
  publisher: "Saqib Watches",
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "Saqib Watches",
    title: "Saqib | Timepieces - Precious in Your Wrist",
    description:
      "Discover Saqib Watches — premium luxury watches for men, women & couples. Elegant designs, affordable prices.",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Saqib Watches",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Saqib | Timepieces - Precious in Your Wrist",
    description:
      "Discover Saqib Watches — premium luxury watches for men, women & couples.",
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
