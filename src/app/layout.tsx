import type { Metadata } from "next";
import { Playfair_Display, Inter, Noto_Sans_Arabic } from "next/font/google";
import "./globals.css";
import { AppProvider } from "@/components/AppProvider";
import { LanguageProvider } from "@/lib/i18n/context";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-serif",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const notoSansArabic = Noto_Sans_Arabic({
  subsets: ["arabic"],
  variable: "--font-arabic",
  display: "swap",
});

export const metadata: Metadata = {
  title: "YR MULTICHARM store - Premium Beauty Devices",
  description:
    "Discover premium IPL and laser hair removal devices at YR MULTICHARM store. Shop the best beauty devices for home use.",
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
    <html lang="en" className={`${playfair.variable} ${inter.variable} ${notoSansArabic.variable}`} suppressHydrationWarning>
      <body className="flex min-h-screen flex-col font-sans antialiased">
        <LanguageProvider>
          <AppProvider>
            <Header />
            <main className="flex-1">{children}</main>
            <Footer />
          </AppProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
