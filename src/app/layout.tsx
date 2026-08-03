import type { Metadata } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import "./globals.css";
import ThemeProvider from "@/components/provider/ThemeProvider";
import QueryProvider from "@/components/provider/QueryProvider";
import Header from "@/components/common/Header";
import Footer from "@/components/common/Footer";
import AuthHashRedirect from "@/components/common/AuthHashRedirect";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  weight: ["400", "500", "600", "700"],
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Vastrarupa | Premium Ethnic Fashion & Indian Luxury Wear",
  description:
    "Explore Vastrarupa's curated collection of premium Indian ethnic fashion. Handcrafted Chikankari kurtis, Banarasi silk kurta sets, royal velvet gowns, and fusion coordinates.",
  metadataBase: new URL("https://vastrarupa.vercel.app"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Vastrarupa | Premium Ethnic Fashion & Indian Luxury Wear",
    description:
      "Explore Vastrarupa's curated collection of premium Indian ethnic fashion. Handcrafted Chikankari kurtis, Banarasi silk kurta sets, royal velvet gowns, and fusion coordinates.",
    url: "https://vastrarupa.vercel.app",
    siteName: "Vastrarupa",
    images: [
      {
        url: "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?q=80&w=1200&auto=format&fit=crop",
        width: 1200,
        height: 630,
        alt: "Vastrarupa Premium Ethnic Wear",
      },
    ],
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Vastrarupa | Premium Ethnic Fashion",
    description: "Explore Vastrarupa's curated collection of premium Indian ethnic fashion.",
    images: ["https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?q=80&w=1200&auto=format&fit=crop"],
  },
  manifest: "/manifest.json",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${playfair.variable} ${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <QueryProvider>
          <ThemeProvider>
            <AuthHashRedirect />
            <Header />
            <main className="flex-1 flex flex-col">{children}</main>
            <Footer />
          </ThemeProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
