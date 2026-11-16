import Link from "next/link";
import { WHATSAPP_URL } from "@/lib/site";

// Draft copy: marketing and the clinic must approve before indexing or advertising.
export const metadata = { title: "Counselling for anxiety and overthinking in Pune | The Brain Tea", robots: { index: false, follow: false }, alternates: { canonical: "/anxiety-counselling-pune" } };
export default function CampaignPage() {
  return <article className="mx-auto max-w-4xl px-6 pt-36 pb-24 text-forest-slate">
    <h1 className="font-cormorant text-4xl md:text-6xl font-semibold">Counselling for anxiety and overthinking in Pune</h1>
    <p className="mt-6 max-w-2xl text-lg">Speak with our team about the support that may be right for you.</p>
    <div className="mt-8 flex flex-wrap gap-4"><Link href="/book?service=free-15-minute-call" className="rounded-full bg-forest-slate px-6 py-3 text-white">Book a free 15-minute call</Link><a href={WHATSAPP_URL} className="rounded-full border border-forest-slate px-6 py-3">WhatsApp us</a></div>
    <section className="mt-20"><h2 className="font-cormorant text-3xl">How to get started</h2><p className="mt-4">Choose an introductory call or explore the services available to book online.</p><Link href="/services" className="mt-4 inline-block underline">Explore services and fees</Link></section>
    <section className="mt-16"><h2 className="font-cormorant text-3xl">Meet our team</h2><p className="mt-4">Learn about our practitioners and their areas of focus.</p><Link href="/team" className="mt-4 inline-block underline">Meet the team</Link></section>
    <section className="mt-16"><h2 className="font-cormorant text-3xl">Questions?</h2><p className="mt-4">Find information about appointments and online sessions.</p><Link href="/faq" className="mt-4 inline-block underline">Read frequently asked questions</Link></section>
  </article>;
}
