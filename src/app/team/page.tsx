import Image from "next/image";
import Link from "next/link";
import { Languages, Sparkles } from "lucide-react";
import Container from "@/components/ui/Container";
import Badge from "@/components/ui/Badge";
import SectionHeading from "@/components/ui/SectionHeading";
import { TEAM } from "@/lib/team-data";
import { SITE_TAGLINE } from "@/lib/site";

export const metadata = {
  title: "Our Team | The Brain Tea",
  description:
    "Meet the licensed practitioners at The Brain Tea — qualifications, specialisations, and approach to care.",
};

export default function TeamPage() {
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
          <p className="mx-auto max-w-2xl text-pretty text-lg leading-relaxed text-charcoal/80 md:text-xl">
            {SITE_TAGLINE}. A collaborative, compassionate group of licensed
            professionals here to walk alongside you.
          </p>
        </Container>
      </section>

      <section className="pb-24">
        {TEAM.map((member, index) => {
          const imageFirst = index % 2 === 0;
          return (
            <article
              key={member.slug}
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
                      className="object-cover object-center transition-transform duration-700 hover:scale-105"
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
                          <span className="rounded-full border border-muted-sage/20 bg-warm-tan/40 px-4 py-2 text-charcoal/75">
                            {member.experience}
                          </span>
                        ) : null}
                      </div>
                    ) : null}

                    <div className="max-w-2xl space-y-3 text-base leading-relaxed text-forest-slate/90 md:text-lg">
                      {member.intro.map((paragraph) => (
                        <p key={paragraph}>{paragraph}</p>
                      ))}
                    </div>

                    <div className="grid gap-5 border-t border-muted-sage/20 pt-5 sm:grid-cols-2">
                      {member.specialisations.length > 0 ? (
                        <div>
                          <div className="mb-2 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-charcoal/70">
                            <Sparkles className="h-3 w-3" /> Areas of focus
                          </div>
                          <div className="flex flex-wrap gap-1.5">
                            {member.specialisations.map((tag) => (
                              <span
                                key={tag}
                                className="rounded-full border border-muted-sage/20 bg-warm-tan/40 px-2.5 py-1 text-[11px] font-medium text-forest-slate"
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
                            <p className="text-[11px] font-bold uppercase tracking-wide text-charcoal/70">
                              Therapeutic approach
                            </p>
                            <p className="mt-1 text-sm leading-relaxed text-forest-slate/85">
                              {member.approaches.join(" · ")}
                            </p>
                          </div>
                        ) : null}
                        {member.languages?.length ? (
                          <div>
                            <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-charcoal/70">
                              <Languages className="h-3 w-3" /> Speaks
                            </div>
                            <p className="mt-1 text-sm text-forest-slate/85">
                              {member.languages.join(", ")}
                            </p>
                          </div>
                        ) : null}
                      </div>
                    </div>

                    {member.fee ? (
                      <p className="text-sm font-semibold text-forest-slate">
                        {member.fee}
                      </p>
                    ) : null}
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
