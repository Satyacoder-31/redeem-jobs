import type { Metadata } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CustomCursor from "@/components/CustomCursor";
import ScrollEffects from "@/components/ScrollEffects";
import { AuthProvider } from "@/context/AuthContext";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "REDEEM JOBS — Training & Placement Solutions | Premier Job & Career Portal",
  description:
    "Official portal of REDEEM JOBS (RTP). Comprehensive training and placement solutions, AI resume matching, direct employer connections, and career opportunities across India.",
  keywords: [
    "Redeem Jobs",
    "RTP Redeem Jobs",
    "Training & Placement Solutions",
    "jobs India",
    "placement agency",
    "recruitment solutions",
    "career guidance",
  ],
  icons: {
    icon: "/brand/redeem-jobs-mark.svg",
    apple: "/brand/redeem-jobs-mark.svg",
  },
  openGraph: {
    title: "REDEEM JOBS — Training & Placement Solutions",
    description: "Empowering careers through certified training and direct placement solutions.",
    type: "website",
    images: ["/brand/redeem-jobs-banner.jpg"],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${jakarta.variable} ${inter.variable} h-full dark`}>
      <body className="min-h-full flex flex-col bg-[#060b13] text-slate-100 antialiased selection:bg-cyan-500 selection:text-black">
        <AuthProvider>
          <CustomCursor />
          <ScrollEffects />
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
