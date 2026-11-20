import Link from "next/link";
import { WHATSAPP_URL } from "@/lib/site";
import { campaigns, campaignFaqAnswers } from "@/lib/campaign-data";
export default function CampaignPage({ slug }: { slug: keyof typeof campaigns }) {
  const page = campaigns[slug];
  return <article className="mx-auto max-w-4xl px-6 pt-32 pb-24 text-forest-slate">
    <h1 className="font-cormorant text-4xl md:text-6xl font-semibold">{page.title}</h1>
    <p className="mt-6 text-lg">{page.line}</p>
    <div className="mt-8 flex flex-wrap gap-4"><Link href="/book?service=free-15-minute-call" className="rounded-full bg-forest-slate px-6 py-3 text-white">Book a free discovery call</Link><a data-track-position="hero" href={WHATSAPP_URL} className="rounded-full border border-forest-slate px-6 py-3">WhatsApp us</a></div>
    <section className="mt-16"><h2 className="font-cormorant text-3xl">Who comes to us for this</h2><ul className="mt-4 list-disc pl-6 space-y-3">{page.audiences.map(item => <li key={item}>{item}</li>)}</ul></section>
    <section className="mt-16"><h2 className="font-cormorant text-3xl">How it works</h2><ol className="mt-4 list-decimal pl-6 space-y-3"><li>Message us on WhatsApp or book a free 10-minute discovery call.</li><li>We ask a few short questions and match you with the right psychologist.</li><li>Your first session, in Aundh or online, at a time that suits you.</li></ol></section>
    <section className="mt-16"><h2 className="font-cormorant text-3xl">Who you’ll see</h2>{page.practitioners.length > 0 ? <><ul className="mt-4 space-y-2">{page.practitioners.map(name => <li key={name}>{name}{slug === "teen-counselling-pune" ? " — works with adolescents" : ""}</li>)}</ul><p className="mt-3 text-sm">Practitioner availability and suitability will be confirmed by the clinic.</p></> : <p className="mt-4">The clinic will confirm who leads career counselling.</p>}<Link href="/team" className="mt-3 inline-block underline">Meet our psychologists and see session fees</Link></section>
    <section className="mt-16"><h2 className="font-cormorant text-3xl">Your questions</h2>{page.questions.map(question => <details key={question} className="border-b border-sage/40 py-5"><summary className="cursor-pointer font-semibold">{question}</summary><p className="mt-3">{campaignFaqAnswers[question]}</p></details>)}</section>
  </article>;
}
