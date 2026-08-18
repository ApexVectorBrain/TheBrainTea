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
});
