import { describe, expect, it } from "vitest";
import { TEAM } from "../team-data";

describe("public practitioner roster", () => {
  it("includes Ananya as a counseling psychologist with her updated bio", () => {
    const ananya = TEAM.find((member) => member.slug === "ananya-sunil-nair");

    expect(ananya).toMatchObject({
      name: "Ananya Sunil Nair",
      role: "Counseling Psychologist",
    });
    expect(ananya?.intro.join(" ")).toContain(
      "Ananya takes a client-centered, integrative approach",
    );
  });

  it("gives Madhumati every requested specialisation tag", () => {
    const madhumati = TEAM.find(
      (member) => member.slug === "madhumati-dhumak",
    );

    expect(madhumati?.specialisations).toEqual([
      "Adults",
      "Adolescents",
      "Anxiety",
      "Depression",
      "Relationship Challenges",
      "Trauma",
      "Emotional Regulation",
      "Life Transition",
      "Self-Esteem",
      "Grief",
      "Burnout",
      "Attachment Concerns",
      "Interpersonal Difficulties",
      "Neurodivergent Individual",
    ]);
    expect(madhumati?.intro[0]).toContain(
      "meaningful healing begins when people feel genuinely seen, heard, and understood",
    );
  });

  it("includes Gauri's portrait, focus areas, and therapeutic approaches", () => {
    const gauri = TEAM.find((member) => member.slug === "gauri-ghorpade");

    expect(gauri).toMatchObject({
      name: "Gauri Ghorpade",
      role: "Psychologist",
      photo: "/team/gauri-ghorpade.png",
      specialisations: [
        "Anxiety, Stress & Emotional Wellbeing",
        "Relationships, Self-Worth & Personal Challenges",
        "Life Transitions, Trauma & Growth",
      ],
      approaches: [
        "Integrative & Evidence-Based",
        "Person-Centred",
        "Trauma-Informed",
        "LGBTQ+ Affirmative",
        "CBT & REBT-Informed",
        "Strengths-Based",
      ],
    });
  });

  it("includes Krutika's supplied profile without unsupported metadata", () => {
    const krutika = TEAM.find(
      (member) => member.slug === "krutika-a-sonigra",
    );

    expect(krutika).toMatchObject({
      name: "Krutika A. Sonigra",
      role: "Psychologist, Counselor & Art Therapy Practitioner",
      photo: "/team/krutika-a-sonigra.png",
      specialisations: [
        "Anxiety",
        "Stress Management",
        "Self-Esteem",
        "Interpersonal Dynamics",
        "Personal Growth",
      ],
      approaches: [
        "Holistic Practice",
        "Evidence-Based Traditional Therapy",
        "Expressive Arts",
        "Relational Frameworks",
      ],
      intro: [
        "Krutika A. Sonigra is a psychologist, counselor, and art therapy practitioner dedicated to creating a safe, non-judgmental space where clients feel truly heard, understood, and supported. Rejecting a rigid, one-size-fits-all model, Krutika tailors each session to the individual’s unique personality, challenges, and goals.",
        "Her holistic practice integrates evidence-based traditional therapy with expressive arts and relational frameworks. This creative, multi-modal approach enables clients, both individuals and couples to process complex emotions, strengthen relationship bonds, and access deeper self-awareness beyond verbal expression. Krutika collaborates with clients across a range of focus areas, including anxiety, stress management, self-esteem, interpersonal dynamics, and personal growth.",
        "Ultimately, her mission is to equip clients with effective coping strategies and tools for sustainable emotional well-being.",
      ],
    });
    expect(krutika).not.toHaveProperty("qualification");
    expect(krutika).not.toHaveProperty("experience");
    expect(krutika).not.toHaveProperty("languages");
    expect(krutika).not.toHaveProperty("fee");
  });
});
