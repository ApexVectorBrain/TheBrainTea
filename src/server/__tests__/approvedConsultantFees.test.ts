import { createRequire } from "node:module";
import { describe, expect, it, vi } from "vitest";
const require = createRequire(import.meta.url);
const { syncApprovedFees } = require("../../../prisma/sync-approved-consultant-fees.js");
const fees = require("../../../prisma/approved-consultant-fees.json");
describe("approved consultant fee synchronization", () => {
  it("updates only consultant fees and paid-service overrides inside a transaction", async () => {
    const tx = { therapist: { updateMany: vi.fn() }, therapistServiceRate: { updateMany: vi.fn() } };
    const prisma = { $transaction: vi.fn(callback => callback(tx)) };
    await syncApprovedFees(prisma);
    expect(prisma.$transaction).toHaveBeenCalledOnce();
    expect(tx.therapist.updateMany).toHaveBeenCalledTimes(8);
    for (const [slug, feeMinor] of Object.entries(fees)) {
      expect(tx.therapist.updateMany).toHaveBeenCalledWith({ where: { slug }, data: { feeMinor } });
      expect(tx.therapistServiceRate.updateMany).toHaveBeenCalledWith({ where: { therapist: { slug }, service: { slug: { not: "free-15-minute-call" } } }, data: { feeMinor } });
    }
    expect(fees["krutika-a-sonigra"]).toBe(170000);
    expect(fees["sharayu-harpale"]).toBe(165000);
    expect(fees["madhumati-dhumak"]).toBe(180000);
    for (const slug of ["gauri-ghorpade", "shwetha-jayakrishnan", "ananya-saxena", "ananya-sunil-nair"]) expect(fees[slug]).toBe(160000);
  });
  it("propagates failure so a partially updated fee table is rolled back", async () => {
    const failure = new Error("database unavailable");
    const tx = { therapist: { updateMany: vi.fn().mockRejectedValue(failure) }, therapistServiceRate: { updateMany: vi.fn() } };
    await expect(syncApprovedFees({ $transaction: callback => callback(tx) })).rejects.toThrow(failure);
    expect(tx.therapistServiceRate.updateMany).not.toHaveBeenCalled();
  });
});
