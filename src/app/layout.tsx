import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import { Plus_Jakarta_Sans, Inter } from "next/font/google";
import "./globals.css";
import OrganizationSchema from "@/components/schema/OrganizationSchema";

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-plus-jakarta",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://www.atlaso.in"),
  title: {
    template: "%s | Atlaso",
    default: "Atlaso — Compare Travel Operators in India",
  },
  description:
    "India's first travel operator comparison platform. Compare verified operators, real prices and inclusions side by side. Book with confidence.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    siteName: "Atlaso",
    type: "website",
    locale: "en_IN",
    images: [
      {
        url: "/og-default.jpg",
        width: 1200,
        height: 630,
        alt: "Atlaso — Compare travel operators side by side",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${plusJakarta.variable} ${inter.variable} h-full`}
      data-scroll-behavior="smooth"
    >
      <body className="min-h-full flex flex-col font-sans antialiased bg-map-white">
        <OrganizationSchema />
        {children}
        <Analytics />
      </body>
    </html>
  );
}
