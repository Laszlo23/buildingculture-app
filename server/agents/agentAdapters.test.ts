import { describe, expect, it } from "vitest";
import { agentPipeFactories, getAgentPipeFactory, listAgentPipeIds } from "./agentAdapters.ts";

describe("agentAdapters", () => {
  it("lists stable ids", () => {
    const ids = listAgentPipeIds().sort();
    expect(ids).toEqual(["building-culture-club", "community-builder"].sort());
  });

  it("resolves known factories", () => {
    expect(getAgentPipeFactory("community-builder")).toBe(agentPipeFactories["community-builder"]);
    expect(getAgentPipeFactory("unknown-agent")).toBeNull();
  });
});
