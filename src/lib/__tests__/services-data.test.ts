import { describe, expect, it } from "vitest";
import { SERVICES } from "../services-data";

describe("public service presentation", () => {
  it("marks every service as available online and in person", () => {
    for (const service of SERVICES) {
      expect(service.availability, service.slug).toEqual(["Online", "Offline"]);
    }
  });
});
