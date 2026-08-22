import type { Metadata } from "next";
import { Cormorant_Garamond, DM_Sans } from "next/font/google";
import "./globals.css";
import Header from "../components/Header";
import Footer from "../components/Footer";
import WhatsAppButton from "../components/WhatsAppButton";
import IntroOverlay from "../components/IntroOverlay";
import { SITE_URL } from "@/lib/site";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  variable: "--font-cormorant",
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
});

const dmsans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  weight: ["400", "500", "700"],
});

export const metadata: Metadata = {
  title: "The Brain Tea | Pune Therapy Clinic",
  description:
    "A compassionate, safe, and professional mental health practice in Pune, supporting individuals, couples, and families through evidence-based psychotherapy.",
  keywords: [
    "therapy clinic Pune",
    "mental health clinic Pune",
    "couples therapy Pune",
    "family therapy Pune",
    "psychotherapy Pune",
  ],
  metadataBase: new URL(SITE_URL),
  alternates: { canonical: "/" },
  icons: {
    icon: [{ url: "/tbt-logo.png", type: "image/png" }],
    shortcut: "/tbt-logo.png",
    apple: "/tbt-logo.png",
  },
  openGraph: {
    title: "The Brain Tea | Pune Therapy Clinic",
    description:
      "Compassionate, safe, and professional mental health support in Pune for individuals, couples, and families.",
    url: SITE_URL,
    siteName: "The Brain Tea",
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "The Brain Tea | Pune Therapy Clinic",
    description:
      "Evidence-based psychotherapy in Pune for individuals, couples, and families.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "The Brain Tea",
    url: SITE_URL,
    logo: `${SITE_URL}/tbt-logo.png`,
    email: "admin@thebraintea.co.in",
    description:
      "A compassionate, safe, and professional mental health practice in Pune, dedicated to supporting individuals, couples, and families through evidence-based psychotherapy.",
  };

  return (
    <html lang="en" className={`${cormorant.variable} ${dmsans.variable}`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
      </head>
      <body className="bg-ivory text-charcoal min-h-screen flex flex-col justify-between">
        <IntroOverlay />
        <Header />
        <main className="flex-grow">{children}</main>
        <Footer />
        <WhatsAppButton />
      </body>
    </html>
  );
}
