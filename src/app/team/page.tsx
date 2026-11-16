import Image from "next/image";
import Link from "next/link";
import { Languages, Sparkles } from "lucide-react";
import Container from "@/components/ui/Container";
import Badge from "@/components/ui/Badge";
import SectionHeading from "@/components/ui/SectionHeading";
import { TEAM } from "@/lib/team-data";
import { prisma } from "@/lib/db";
import { formatINR } from "@/lib/format";
import { SITE_TAGLINE } from "@/lib/site";

export const metadata = {
  title: "Our Psychologists in Pune | The Brain Tea",
  description:
    "Meet the psychologists at The Brain Tea, their qualifications, areas of focus, languages and approach to care.",
};

export const dynamic = "force-dynamic";

export default async function TeamPage() {
  const consultants = await prisma.therapist.findMany({
    where: { status: "APPROVED", isActive: true },
    select: { slug: true, feeMinor: true, services: { where: { isActive: true }, select: { id: true, name: true, slug: true } }, serviceRates: { select: { serviceId: true, feeMinor: true } } },
  });
  const bySlug = new Map<string, { feeMinor: number; services: { id: string; name: string; slug: string }[]; serviceRates: { serviceId: string; feeMinor: number }[] }>(consultants.map(c => [c.slug.replace(/^dr-madhumati-dhumak$/, "madhumati-dhumak"), c]));
  return (
    <div className="min-h-screen bg-ivory font-dmsans">
      <section className="pt-36 pb-20">
        <Container className="text-center">
          <Badge tone="ocean" className="mb-4">
            Our Practitioners
          </Badge>
          <h1 className="mb-6 font-cormorant text-5xl font-semibold leading-tight text-forest-slate text-balance md:text-6xl">
            Meet Our Team
          </h1>
          <p className="mx-auto max-w-2xl text-pretty text-lg leading-relaxed text-charcoal md:text-xl">
            {SITE_TAGLINE}. A collaborative, compassionate group of practitioners here to walk alongside you.
          </p>
        </Container>
      </section>

      <section className="pb-24">
        {TEAM.map((member, index) => {
          const imageFirst = index % 2 === 0;
          const consultant = bySlug.get(member.slug);
          return (
            <article
              key={member.slug}
              id={member.slug}
              className={`relative overflow-hidden border-y border-muted-sage/15 py-16 md:py-24 ${
                imageFirst ? "bg-ivory" : "bg-warm-sand/20"
              }`}
            >
              <Container>
                <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12 lg:gap-16">
                  <div
                    className={`relative mx-auto aspect-[4/5] w-full max-w-sm overflow-hidden rounded-t-full border border-muted-sage/25 bg-warm-tan shadow-warm-soft ${
                      imageFirst
                        ? "lg:order-1 lg:col-span-5"
                        : "lg:order-2 lg:col-span-5"
                    }`}
                  >
                    <Image
                      src={member.photo}
                      alt={`${member.name}, ${member.role} at The Brain Tea`}
                      fill
                      sizes="(max-width: 1024px) 100vw, 35vw"
                      className="object-cover transition-transform duration-700 hover:scale-105"
                      style={{
                        objectPosition: member.photoPosition ?? "50% 50%",
                      }}
                    />
                  </div>

                  <div
                    className={`space-y-6 ${
                      imageFirst
                        ? "lg:order-2 lg:col-span-7"
                        : "lg:order-1 lg:col-span-7"
                    }`}
                  >
                    {index === 0 ? <Badge tone="ocean">Founder</Badge> : null}
                    <div>
                      <h2 className="font-cormorant text-4xl font-semibold leading-tight text-forest-slate md:text-5xl">
                        {member.name}
                      </h2>
                      <p className="mt-2 text-sm font-semibold text-teal-sage">
                        {member.role}
                      </p>
                    </div>

                    {member.qualification || member.experience ? (
                      <div className="flex flex-wrap gap-2 text-xs">
                        {member.qualification ? (
                          <span className="rounded-full border border-teal-sage/10 bg-muted-sage/20 px-4 py-2 font-medium text-forest-slate">
                            {member.qualification}
                          </span>
                        ) : null}
                        {member.experience ? (
                          <span className="rounded-full border border-muted-sage/20 bg-warm-tan/40 px-4 py-2 text-charcoal">
                            {member.experience}
                          </span>
                        ) : null}
                      </div>
                    ) : null}

                    <div className="max-w-2xl space-y-3 text-base leading-relaxed text-forest-slate md:text-lg">
                      {member.intro.map((paragraph) => (
                        <p key={paragraph}>{paragraph}</p>
                      ))}
                    </div>

                    <div className="grid gap-5 border-t border-muted-sage/20 pt-5 sm:grid-cols-2">
                      {member.specialisations.length > 0 ? (
                        <div>
                          <div className="mb-2 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-charcoal">
                            <Sparkles className="h-3 w-3" /> Areas of focus
                          </div>
                          <div className="flex flex-wrap gap-1.5">
                            {member.specialisations.map((tag) => (
                              <span
                                key={tag}
                                className="rounded-full border border-muted-sage/20 bg-warm-tan/40 px-2.5 py-1 text-xs font-medium text-forest-slate"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      ) : null}

                      <div className="space-y-3">
                        {member.approaches.length > 0 ? (
                          <div>
                            <p className="text-xs font-bold uppercase tracking-wide text-charcoal">
                              Therapeutic approach
                            </p>
                            <p className="mt-1 text-sm leading-relaxed text-forest-slate">
                              {member.approaches.join(" · ")}
                            </p>
                          </div>
                        ) : null}
                        {member.languages?.length ? (
                          <div>
                            <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-charcoal">
                              <Languages className="h-3 w-3" /> Speaks
                            </div>
                            <p className="mt-1 text-sm text-forest-slate">
                              {member.languages.join(", ")}
                            </p>
                          </div>
                        ) : <p className="text-sm text-forest-slate">Languages: please confirm with the clinic.</p>}
                      </div>
                    </div>

                    {consultant && consultant.services.length > 0 && (
                      <div className="text-sm text-forest-slate">
                        <p className="font-semibold">Session fees</p>
                        <ul>{consultant.services.map(service => {
                          const fee = service.slug === "free-15-minute-call" ? 0 : consultant.serviceRates.find(rate => rate.serviceId === service.id)?.feeMinor ?? consultant.feeMinor;
                          return <li key={service.id}>{service.name}: {formatINR(fee)}</li>;
                        })}</ul>
                      </div>
                    )}
                  </div>
                </div>
              </Container>
            </article>
          );
        })}
      </section>

      <section className="pb-24">
        <Container className="mx-auto max-w-2xl text-center">
          <SectionHeading
            eyebrow="Ready When You Are"
            title="Start your journey"
            description="Book a consultation and we’ll match you with the right practitioner for your needs."
          />
          <Link
            href="/book"
            className="mt-8 inline-flex items-center justify-center rounded-full bg-teal-sage px-8 py-3.5 font-semibold text-white shadow-warm-soft transition-all hover:bg-forest-slate hover:shadow-warm-soft"
          >
            Book a Consultation
          </Link>
        </Container>
      </section>
    </div>
  );
}
