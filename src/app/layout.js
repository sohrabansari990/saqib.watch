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
  title: "SVESTON | Luxury Timepieces",
  description: "Experience the perfect blend of luxury, beauty, and elegance with Sveston timepieces.",
};

import { AuthProvider } from "@/context/AuthContext";

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${inter.variable} ${cormorant.variable}`}>
      <body className="bg-dark text-foreground antialiased font-sans" suppressHydrationWarning suppressContentEditableWarning>
        <AuthProvider>
          <CartProvider>
            {children}
            <Toaster position="top-center" richColors theme="dark" />
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  ); // Keep the closing brace for the function
}
