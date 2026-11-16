"use client";

import React from "react";
import { HelpCircle } from "lucide-react";

function FAQItem({ question, answer }: { question: string; answer: string }) {
  return <details className="rounded-2xl px-6 md:px-8 mb-4 border border-muted-sage/30 bg-warm-sand/65">
    <summary className="cursor-pointer py-5 font-cormorant text-xl md:text-2xl font-semibold text-forest-slate">{question}</summary>
    <p className="text-sm md:text-base text-forest-slate leading-relaxed pb-6">{answer}</p>
  </details>;
}

export default function FAQ() {
  const faqs = [
    { question: "What is the free discovery call?", answer: "The free 10-minute discovery call helps us understand what support you are looking for and explain the next steps. We reserve a 15-minute slot for the call." },
    {
      question: "Is everything I share kept confidential?",
      answer:
        "Sessions are confidential. We explain the few safety exceptions in your first session. Information is only shared with your explicit written consent, except in rare circumstances mandated by law (such as immediate threat of serious harm to yourself or others).",
    },
    {
      question: "How do I know if therapy is right for me?",
      answer:
        "Therapy is beneficial for anyone experiencing emotional distress, navigating complex life transitions, struggling in relationships, or simply wanting to understand themselves better. You do not need to be in a crisis to seek therapy. If you feel stuck, overwhelmed, or want to make positive adjustments in your life, therapy can provide a structured, supportive space to do so.",
    },
    {
      question: "What happens in the first session?",
      answer:
        "The first session, often called an intake or initial evaluation, is a collaborative conversation. It is a space for us to get to know each other, discuss what brings you to therapy, explore your history, and discuss your goals. It is also an opportunity for you to ask questions and see if you feel comfortable working with your assigned therapist.",
    },
    {
      question: "How often will I need to come?",
      answer:
        "Generally, therapy is most effective when attended weekly, especially in the initial stages. This frequency helps establish a trust relationship and maintain therapeutic momentum. Over time, as you build tools and progress toward your goals, we may transition to bi-weekly sessions or occasional check-ins.",
    },
    {
      question: "Do you offer online sessions?",
      answer:
        "Yes, we offer online video consultations for clients who prefer the comfort and convenience of therapy from home. Online sessions are conducted via Google Meet. All you need is a stable internet connection and a quiet, private space.",
    },
    {
      question: "What is the cost per session?",
      answer:
        "Session fees vary by consultant and service. Please see the current fees on our services and team pages or in the booking flow.",
    },
    {
      question: "How do I cancel or reschedule?",
      answer:
        "Cancellations require at least 48 hours' notice, while rescheduling requires at least 24 hours' notice. If you don't stick to these windows, your session will be charged in full, as that hour was reserved specifically for you.",
    },
    {
      question: "Do you work with children?",
      answer:
        "Yes, we have specialists who work with children and adolescents (ages 6-18). Our approach combines age-appropriate talk therapy with play-integrated interventions and creative activities, helping younger clients process transitions, emotional changes, and school or family stressors.",
    },
    {
      question: "What therapeutic approaches do you use?",
      answer:
        "At The Brain Tea, we don't believe in a one-size-fits-all approach to therapy. Every individual is unique, which is why we tailor therapy to your needs, goals, personality, and life experiences. We practice integrative, evidence-based psychotherapy rather than following a single therapeutic model. This allows our psychologists to thoughtfully draw from different therapeutic approaches, based on their areas of expertise, to create a treatment plan that is best suited to you. As your needs evolve, therapy evolves with you, ensuring that the support you receive remains relevant throughout your journey.",
    },
    {
      question: "How long does therapy typically last?",
      answer:
        "The duration of therapy is highly individual. Some clients find that short-term, solution-focused therapy (8 to 12 sessions) is sufficient to address a specific issue. Others choose to engage in long-term therapy for deeper self-exploration and character work. We will regularly check in to review your goals and determine what is best for you.",
    },
  ];

  return (
    <div className="bg-warm-sand min-h-screen font-dmsans">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({ "@context": "https://schema.org", "@type": "FAQPage", mainEntity: faqs.map(f => ({ "@type": "Question", name: f.question, acceptedAnswer: { "@type": "Answer", text: f.answer } })) }).replace(/</g, "\\u003c") }} />
      {/* PAGE HERO */}
      <section className="bg-warm-tan/30 pt-32 pb-20 border-b border-muted-sage/20">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <span className="text-[11px] font-bold tracking-[0.25em] text-teal-sage uppercase mb-4 block">
            Got Questions?
          </span>
          <h1 className="font-cormorant text-5xl md:text-6xl font-semibold text-forest-slate leading-tight mb-6">
            Frequently Asked Questions
          </h1>
          <p className="text-forest-slate/85 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
            No question is too small. We are here to clarify any doubts you have
            about starting your mental health journey.
          </p>
        </div>
      </section>

      {/* ACCORDION FAQ SECTION */}
      <section className="py-24 max-w-4xl mx-auto px-6">
        <div className="flex flex-col">
          {faqs.map((faq, index) => (
            <FAQItem
              key={index}
              question={faq.question}
              answer={faq.answer}
            />
          ))}
        </div>
      </section>

      {/* CALL TO ACTION */}
      <section className="py-16 text-center bg-warm-tan/30 border-t border-muted-sage/20">
        <div className="max-w-2xl mx-auto px-6">
          <HelpCircle className="w-12 h-12 text-teal-sage mx-auto mb-4" />
          <h2 className="font-cormorant text-3xl font-semibold text-forest-slate mb-4">
            Still Have Questions?
          </h2>
          <p className="text-sm text-forest-slate/80 mb-8 max-w-md mx-auto">
            If you have any other concerns, feel free to drop us a line or
            connect via WhatsApp. We are happy to help.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="https://wa.me/919309833817?text=Hi!%20I%20have%20a%20few%20questions%20about%20your%20services."
              target="_blank"
              rel="noopener noreferrer"
              className="border border-teal-sage text-teal-sage hover:bg-teal-sage hover:text-warm-sand font-semibold px-8 py-3.5 rounded-full text-sm transition-all btn-shimmer"
            >
              Ask on WhatsApp
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
