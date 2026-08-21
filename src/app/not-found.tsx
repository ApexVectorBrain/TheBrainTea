import Link from "next/link";
import { ArrowLeft, CalendarDays, Compass } from "lucide-react";

export default function NotFound() {
  return (
    <section className="relative isolate min-h-[72dvh] overflow-hidden bg-warm-white px-6 pb-16 pt-32 md:px-12 md:pb-24 md:pt-40">
      <div
        aria-hidden="true"
        className="absolute -left-28 top-24 h-72 w-72 rounded-full border border-muted-sage/35 md:-left-20 md:h-[30rem] md:w-[30rem]"
      />
      <div
        aria-hidden="true"
        className="absolute -right-24 bottom-[-9rem] h-80 w-80 rounded-full bg-warm-sand/45 md:-right-12 md:h-[34rem] md:w-[34rem]"
      />

      <div className="relative mx-auto grid max-w-5xl items-center gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20">
        <div className="relative mx-auto flex aspect-square w-full max-w-[340px] items-center justify-center rounded-t-full border border-muted-sage/40 bg-warm-sand/50 shadow-warm-soft">
          <div className="absolute inset-5 rounded-t-full border border-teal-sage/25" />
          <div className="relative flex h-24 w-24 items-center justify-center rounded-full bg-teal-sage text-warm-white shadow-lg">
            <Compass aria-hidden="true" className="h-11 w-11" strokeWidth={1.5} />
          </div>
          <span className="absolute bottom-12 font-cormorant text-[100px] font-semibold leading-none text-forest-slate/15 md:text-[132px]">
            404
          </span>
        </div>

        <div className="max-w-xl text-center lg:text-left">
          <p className="mb-4 text-[11px] font-bold uppercase tracking-[0.26em] text-teal-sage">
            A gentle detour
          </p>
          <h1 className="text-balance font-cormorant text-5xl font-semibold leading-[0.98] text-forest-slate md:text-6xl">
            This page seems to have wandered off.
          </h1>
          <p className="mx-auto mt-6 max-w-lg text-base leading-relaxed text-forest-slate/85 lg:mx-0">
            The link may be out of date, or the page may have moved. Let&apos;s
            help you find your way back to The Brain Tea.
          </p>

          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row lg:justify-start">
            <Link
              href="/"
              className="btn-shimmer inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-teal-sage px-6 py-3 text-sm font-semibold text-warm-white shadow-md transition-all duration-200 hover:-translate-y-0.5 hover:bg-forest-slate hover:shadow-warm-soft focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-teal-sage"
            >
              <ArrowLeft aria-hidden="true" className="h-4 w-4" />
              Back to home
            </Link>
            <Link
              href="/book"
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-teal-sage/35 px-6 py-3 text-sm font-semibold text-teal-sage transition-colors duration-200 hover:bg-teal-sage hover:text-warm-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-teal-sage"
            >
              <CalendarDays aria-hidden="true" className="h-4 w-4" />
              Book a consultation
            </Link>
          </div>

          <nav aria-label="Helpful links" className="mt-8 flex flex-wrap justify-center gap-x-5 gap-y-3 text-sm font-medium lg:justify-start">
            <Link className="text-forest-slate/80 underline decoration-muted-sage underline-offset-4 transition-colors hover:text-teal-sage" href="/services">
              Explore services
            </Link>
            <Link className="text-forest-slate/80 underline decoration-muted-sage underline-offset-4 transition-colors hover:text-teal-sage" href="/about">
              About the practice
            </Link>
            <Link className="text-forest-slate/80 underline decoration-muted-sage underline-offset-4 transition-colors hover:text-teal-sage" href="/contact">
              Contact us
            </Link>
          </nav>
        </div>
      </div>
    </section>
  );
}
