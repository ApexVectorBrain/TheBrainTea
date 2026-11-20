import { workshops } from "@/lib/workshops";
import { WHATSAPP_NUMBER, WHATSAPP_URL } from "@/lib/site";
import { formatINR } from "@/lib/format";
import { publicPageRobots } from "@/lib/public-launch";

export const metadata = {
  title: "December Workshops | The Brain Tea",
  description: "Letter writing and vision board making for 2027, every weekend in December 2026 at The Brain Tea.",
  alternates: { canonical: "/workshops" },
  robots: publicPageRobots,
};

export default function WorkshopsPage() {
  return (
    <main className="mx-auto max-w-4xl px-6 pt-36 pb-24 text-forest-slate">
      <h1 className="font-cormorant text-5xl">December Workshops</h1>
      <p className="mt-5">Pause, reflect and look ahead to 2027 with our weekend workshops.</p>
      {workshops.length === 0 ? (
        <p className="mt-8">Workshop details will be announced soon. <a className="underline" href={WHATSAPP_URL} data-track-position="page">Ask us on WhatsApp</a></p>
      ) : workshops.map(workshop => (
        <article key={workshop.slug} className="mt-8 rounded-xl border border-sage/40 p-6 md:p-8">
          <h2 className="font-cormorant text-3xl">{workshop.title}</h2>
          <p className="mt-4 leading-relaxed">{workshop.description}</p>
          <p className="mt-5 font-semibold">{workshop.schedule}</p>
          <p className="mt-2">
            {workshop.startsAt ? (
              <time dateTime={workshop.startsAt}>{new Date(workshop.startsAt).toLocaleString("en-IN", { timeZone: "Asia/Kolkata", dateStyle: "long", timeStyle: "short" })} IST</time>
            ) : "Exact dates and times will be announced soon."}
          </p>
          <p className="mt-2">{workshop.feeMinor === null ? "Fee: please enquire on WhatsApp." : `Fee: ${formatINR(workshop.feeMinor)}`}</p>
          <p className="mt-2">{workshop.seats === null ? "Seat availability: please enquire on WhatsApp." : `Capacity: ${workshop.seats} seats`}</p>
          <a
            className="mt-6 inline-block rounded-full bg-forest-slate text-white px-6 py-3 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4"
            data-track-position="page"
            data-workshop-name={workshop.title}
            href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(`Hello! I’m interested in ${workshop.title}. Please share the dates, timings, fee and seat availability.`)}`}
          >Enquire on WhatsApp</a>
        </article>
      ))}
    </main>
  );
}
