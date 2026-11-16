import { workshops } from "@/lib/workshops";
import { WHATSAPP_NUMBER, WHATSAPP_URL } from "@/lib/site";
import { formatINR } from "@/lib/format";
import { publicPageRobots } from "@/lib/public-launch";
export const metadata = { title: "Workshops | The Brain Tea", description: "Upcoming workshops at The Brain Tea in Pune.", alternates: { canonical: "/workshops" }, robots: publicPageRobots };
export default function WorkshopsPage() {
 return <main className="mx-auto max-w-4xl px-6 pt-36 pb-24 text-forest-slate"><h1 className="font-cormorant text-5xl">Workshops</h1><p className="mt-5">Explore our upcoming workshops.</p>{workshops.length === 0 ? <p className="mt-8">December workshop details will be announced soon. <a className="underline" href={WHATSAPP_URL} data-track-position="page">Ask us on WhatsApp</a></p> : workshops.map(workshop => <article key={workshop.slug} className="mt-8 rounded-xl border border-sage/40 p-6"><h2 className="font-cormorant text-3xl">{workshop.title}</h2><p className="mt-3"><time dateTime={workshop.startsAt}>{new Date(workshop.startsAt).toLocaleString("en-IN", { timeZone: "Asia/Kolkata", dateStyle: "long", timeStyle: "short" })} IST</time></p><p>{formatINR(workshop.feeMinor)} · Capacity: {workshop.seats} seats</p><a className="mt-5 inline-block rounded-full bg-forest-slate text-white px-6 py-3" data-track-position="page" data-workshop-name={workshop.title} href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(`Hello! I’m interested in ${workshop.title}. Please share the details.`)}`}>Enquire on WhatsApp</a></article>)}</main>;
}
