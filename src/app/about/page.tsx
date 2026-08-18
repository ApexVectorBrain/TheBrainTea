"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, Variants } from "framer-motion";
import { ShieldCheck, HeartHandshake, Award } from "lucide-react";
import { TEAM } from "@/lib/team-data";

const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" },
  },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
    },
  },
};

export default function About() {
  const values = [
    {
      icon: <ShieldCheck className="w-8 h-8 text-forest" />,
      title: "Confidentiality First",
      text: "We protect your stories with absolute discretion. Every conversation, record, and enquiry is guarded under strict clinical confidentiality guidelines, ensuring a completely safe space.",
    },
    {
      icon: <Award className="w-8 h-8 text-forest" />,
      title: "Evidence-Based Care",
      text: "Our methodologies are grounded in active research. We draw from a range of scientifically validated, trauma-informed approaches, thoughtfully tailored to support your recovery.",
    },
    {
      icon: <HeartHandshake className="w-8 h-8 text-forest" />,
      title: "Human-Centred Practice",
      text: "We believe in people over diagnoses. We never reduce you to a checklist of symptoms. Our therapy is customized to respect your personal history, pace, values, and individual agency.",
    },
  ];

  return (
    <div className="bg-ivory min-h-screen font-dmsans">
      {/* SECTION 1: PAGE HERO */}
      <section className="bg-warm-tan/30 pt-32 pb-20">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="text-[11px] font-bold tracking-[0.25em] text-teal-sage uppercase mb-4 block">
              Welcome to The Brain Tea
            </span>
            <h1 className="font-cormorant text-5xl md:text-6xl font-semibold text-forest-slate leading-tight mb-6">
              Your Approach to Whole-Person Wellness
            </h1>
            <p className="text-forest-slate/85 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed font-dmsans">
              True well-being is not a one-size-fits-all checklist. You are a
              complex, vibrant individual, and your path to growth should be
              just as unique as you are — a space where you can finally breathe,
              explore, and evolve.
            </p>
          </motion.div>
        </div>
      </section>

      {/* SECTION 2: OUR STORY */}
      <section className="py-24 max-w-7xl mx-auto px-6 md:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* Story Text */}
          <div className="lg:col-span-7 space-y-6">
            <h2 className="font-cormorant text-4xl md:text-[48px] font-semibold text-forest-slate mb-4">
              Our Story: Why &ldquo;The Brain Tea&rdquo;?
            </h2>
            <div className="text-forest-slate/90 text-base md:text-lg space-y-6 leading-relaxed font-dmsans">
              <p>
                Life often feels like a turbulent, cluttered brew of stress,
                expectations, and noise. For too long, the approach to mental
                health has been fragmented — treating the mind in one room, the
                body in another, and the career in a third.
              </p>
              <p>
                We named ourselves The Brain Tea because we view wellness as the
                process of letting that turbulence settle. Just as clear water
                emerges when the ingredients are given the right environment to
                rest, your mind finds clarity when the noise stops and you can
                finally process your experiences.
              </p>
              <p>
                Real transformation rarely happens by just sitting still and
                talking in a sterile, clinical room. It happens through an
                &ldquo;aha!&rdquo; moment — a physical resonance that occurs
                when you connect your thoughts to your body and your community.
              </p>
              <p>
                This is why we bridge the gap between talk therapy and active
                restoration. While our expert clinicians provide the
                foundational work of counseling and psychiatric support, we
                integrate movement, sensory grounding, and social interaction
                into the process. Whether it is the insight of traditional
                therapy, the release of a yoga session, the quiet focus of
                Reiki, or a fun workshop, we ensure your healing is holistic,
                grounded, and complete.
              </p>
            </div>
          </div>

          {/* Story image in an arch frame, with a small detail from the same
              room tucked into the lower corner — an editorial pairing rather
              than a gallery, so the space reads as lived-in without turning
              the section into a photo grid. */}
          <div className="lg:col-span-5 relative w-full max-w-md mx-auto">
            <div className="relative aspect-[4/5] rounded-t-full overflow-hidden shadow-warm-soft border border-muted-sage/25 bg-warm-tan">
              <Image
                src="/team/office.jpg"
                alt="The therapy room at The Brain Tea — soft seating and natural light through sheer curtains"
                fill
                sizes="(max-width: 1024px) 100vw, 35vw"
                className="object-cover transition-transform duration-700 hover:scale-105"
              />
            </div>
            <div className="hidden sm:block absolute -bottom-8 -left-6 lg:-left-10 w-32 lg:w-40 aspect-square rounded-2xl overflow-hidden shadow-warm-soft border-4 border-ivory bg-warm-tan">
              <Image
                src="/team/office5.jpg"
                alt="A small brass Buddha resting on a wooden stool in the corner of the room"
                fill
                sizes="160px"
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 3: OUR VALUES */}
      <section className="py-24 bg-muted-sage/20">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="font-cormorant text-4xl md:text-[48px] font-semibold text-forest-slate leading-tight mb-4">
              The Principles That Guide Us
            </h2>
            <p className="text-forest-slate/85 text-base md:text-lg">
              Our core values form the foundation of our clinical practice,
              dictating how we treat every individual who reaches out.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {values.map((v) => (
              <div
                key={v.title}
                className="bg-warm-sand p-8 rounded-2xl shadow-warm-soft border border-muted-sage/20 flex flex-col items-start"
              >
                <div className="mb-6 p-3 bg-teal-sage/10 rounded-xl text-teal-sage">
                  {v.icon}
                </div>
                <h3 className="font-cormorant text-2xl font-semibold text-forest-slate mb-4">
                  {v.title}
                </h3>
                <p className="text-sm text-forest-slate/80 leading-relaxed font-dmsans">
                  {v.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 4: THE TEAM */}
      <section id="meet-the-team" className="scroll-mt-24 py-24 bg-ivory">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          {/* Section Header */}
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-[11px] font-bold tracking-[0.25em] text-teal-sage uppercase mb-3 block">
              Our Practitioners
            </span>
            <h2 className="font-cormorant text-4xl md:text-[48px] font-semibold text-forest-slate mb-4">
              Meet Our Dedicated Team
            </h2>
            <p className="text-forest-slate/85 text-base md:text-lg">
              A collaborative, compassionate group of licensed professionals
              here to walk alongside you.
            </p>
          </div>

          {/* Compact, top-aligned cards keep profiles readable without making
              every card match the height of the longest biography. */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
            className={`grid items-start gap-8 justify-center ${
              TEAM.length === 1
                ? "grid-cols-1 max-w-md mx-auto"
                : TEAM.length === 2
                  ? "grid-cols-1 md:grid-cols-2 max-w-4xl mx-auto"
                  : "grid-cols-1 md:grid-cols-2 xl:grid-cols-3"
            }`}
          >
            {TEAM.map((t) => (
              <motion.div
                key={t.name}
                variants={fadeInUp}
                className="glass-card rounded-2xl overflow-hidden shadow-warm-soft border border-muted-sage/20 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 relative group"
              >
                {/* Visual hover border highlighter */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-transparent group-hover:bg-teal-sage transition-colors duration-300 z-10" />

                {/* Photo */}
                <div className="relative aspect-[4/3] w-full bg-warm-tan">
                  {t.photo ? (
                    <Image
                      src={t.photo}
                      alt={`${t.name} - ${t.role}`}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
                      className="object-cover object-center"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center font-cormorant text-7xl text-forest-slate/60">
                      {t.name
                        .split(" ")
                        .map((part) => part[0])
                        .join("")}
                    </div>
                  )}
                </div>

                {/* Info Content */}
                <div className="p-6 md:p-7">
                  <h3 className="font-cormorant text-2xl font-semibold text-forest-slate mb-1">
                    {t.name}
                  </h3>
                  <p className="font-dmsans text-xs text-teal-sage font-medium mb-3">
                    {t.role}
                  </p>
                  {t.qualification && (
                    <p className="font-dmsans text-xs text-forest-slate bg-muted-sage/15 border border-teal-sage/10 px-2.5 py-1 rounded-full inline-block">
                      {t.qualification}
                    </p>
                  )}

                  <details className="mt-5 border-t border-muted-sage/25 pt-4 group/profile">
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-4 rounded-lg py-1 text-sm font-semibold text-forest-slate transition-colors hover:text-teal-sage focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-sage/50 [&::-webkit-details-marker]:hidden">
                      <span>View full profile</span>
                      <span
                        aria-hidden="true"
                        className="text-xl font-light leading-none transition-transform duration-200 group-open/profile:rotate-45"
                      >
                        +
                      </span>
                    </summary>

                    <div className="pt-5">
                      <div className="space-y-4 text-sm text-forest-slate/85 leading-relaxed mb-6 font-dmsans">
                        {t.intro.map((paragraph) => (
                          <p key={paragraph}>{paragraph}</p>
                        ))}
                      </div>

                      {/* Specialisation tags */}
                      {t.specialisations.length > 0 && (
                        <div>
                          <p className="mb-2 text-[11px] font-bold uppercase tracking-wide text-charcoal/70">
                            Specialises In
                          </p>
                          <div className="border-t border-muted-sage/20 pt-4 flex flex-wrap gap-1.5">
                            {t.specialisations.map((tag) => (
                              <span
                                key={tag}
                                className="text-[11px] font-medium text-forest-slate bg-warm-tan/40 border border-muted-sage/20 px-2 py-0.5 rounded-full font-dmsans"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {t.approaches.length > 0 && (
                        <div className="mt-4">
                          <p className="mb-2 text-[11px] font-bold uppercase tracking-wide text-charcoal/70">
                            Therapeutic Approach
                          </p>
                          <div className="flex flex-wrap gap-1.5">
                            {t.approaches.map((approach) => (
                              <span
                                key={approach}
                                className="text-[11px] font-medium text-forest-slate bg-muted-sage/15 border border-teal-sage/10 px-2 py-0.5 rounded-full font-dmsans"
                              >
                                {approach}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </details>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* SECTION 5: APPOINTMENT PROMPT */}
      <section className="bg-warm-tan/30 py-16 text-center border-t border-muted-sage/20">
        <div className="max-w-2xl mx-auto px-6">
          <h2 className="font-cormorant text-3xl md:text-4xl font-semibold text-forest-slate mb-4">
            We are here to support your path forward.
          </h2>
          <p className="text-sm text-forest-slate/80 mb-8 font-dmsans">
            Speak with one of our coordinators to find the therapist best suited
            to your needs.
          </p>
          <Link
            href="/book"
            className="inline-block font-dmsans text-sm font-semibold bg-teal-sage hover:bg-forest-slate text-warm-sand px-8 py-3.5 rounded-full transition-all hover:shadow-lg btn-shimmer"
          >
            Schedule a Consultation
          </Link>
        </div>
      </section>
    </div>
  );
}
