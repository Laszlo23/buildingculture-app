/** @vitest-environment node */
import { describe, expect, it } from "vitest";
import { allocateBody, depositBody, voteBody, withdrawBody } from "./validation.ts";

describe("validation", () => {
  it("parses deposit body", () => {
    expect(depositBody.parse({ amount: "100.5" })).toEqual({ amount: "100.5", decimals: undefined });
    expect(depositBody.parse({ amount: "1", decimals: 18 })).toEqual({ amount: "1", decimals: 18 });
  });

  it("parses vote support", () => {
    expect(voteBody.parse({ proposalId: "42", support: 1 })).toEqual({ proposalId: "42", support: 1 });
    expect(() => voteBody.parse({ proposalId: "1", support: 5 })).toThrow();
  });

  it("parses allocate", () => {
    expect(allocateBody.parse({ strategyId: "3", bps: 5000 })).toEqual({ strategyId: "3", bps: 5000 });
    expect(() => allocateBody.parse({ strategyId: 1, bps: 20000 })).toThrow();
  });

  it("parses withdraw", () => {
    expect(withdrawBody.parse({ amount: "10" })).toEqual({ amount: "10", decimals: undefined });
  });
});
