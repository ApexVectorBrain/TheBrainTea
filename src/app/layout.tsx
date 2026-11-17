import type { Metadata } from "next";
import { Cormorant_Garamond, DM_Sans } from "next/font/google";
import "./globals.css";
import Header from "../components/Header";
import Footer from "../components/Footer";
import WhatsAppButton from "../components/WhatsAppButton";
import IntroOverlay from "../components/IntroOverlay";
import MarketingAnalytics from "../components/MarketingAnalytics";
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
  other: { "facebook-domain-verification": process.env.META_DOMAIN_VERIFICATION || "5togvgo3br4ztxntblgzpuvqcpnnjv" },
  icons: {
    icon: [{ url: "/tbt-logo.png", type: "image/png" }],
    shortcut: "/tbt-logo.png",
    apple: "/tbt-logo.png",
  },
  openGraph: {
    title: "The Brain Tea | Pune Therapy Clinic",
    description:
      "Compassionate, safe, and professional mental health support in Pune for individuals, couples, and families.",
    images: [{ url: "/social-share.jpg", width: 1200, height: 630, alt: "The Brain Tea counselling space" }],
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
    "@type": ["MedicalClinic", "LocalBusiness"],
    name: "The Brain Tea",
    url: SITE_URL,
    logo: `${SITE_URL}/tbt-logo.png`,
    email: "admin@thebraintea.co.in",
    telephone: "+91-93098-33817",
    address: { "@type": "PostalAddress", streetAddress: "Apartments 2, Flat No. 8, 5th Floor, Ward No. 8, Abhimanshree, above ICICI Direct, Sakal Nagar", addressLocality: "Aundh, Pune", addressRegion: "Maharashtra", postalCode: "411008", addressCountry: "IN" },
    geo: { "@type": "GeoCoordinates", latitude: 18.54569, longitude: 73.81698 },
    openingHoursSpecification: [{ "@type": "OpeningHoursSpecification", dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"], opens: "09:00", closes: "20:00" }, { "@type": "OpeningHoursSpecification", dayOfWeek: "Sunday", opens: "10:00", closes: "16:00" }],
    sameAs: ["https://www.instagram.com/thebraintea.community"],
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
        <MarketingAnalytics />
        <IntroOverlay />
        <Header />
        <main className="flex-grow">{children}</main>
        <Footer />
        <WhatsAppButton />
      </body>
    </html>
  );
}
