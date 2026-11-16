import HomeClient from "./HomeClient";

export const metadata = {
  title: "Therapist in Pune, Aundh | The Brain Tea Counselling",
  description: "Counselling and psychotherapy in Pune for individuals, couples, families and teens. Book a session in person or online.",
  alternates: { canonical: "/" },
  openGraph: { url: "/", images: [{ url: "/social-share.jpg", width: 1200, height: 630 }] },
};

export default function HomePage() {
  return <HomeClient />;
}
