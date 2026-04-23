import type { PipeI } from "@baseai/core";
import buildingCulturePipeFactory from "../../baseai/pipes/building-culture-club.ts";
import communityBuilderPipeFactory from "../../baseai/pipes/community-builder.ts";

/**
 * Registry of Langbase / BaseAI pipe factories exposed as HTTP agents.
 * Add a new pipe file under `baseai/pipes/`, import it here, and assign a URL-safe id (kebab-case).
 */
export const agentPipeFactories = {
  "building-culture-club": buildingCulturePipeFactory,
  "community-builder": communityBuilderPipeFactory,
} as const;

export type AgentPipeId = keyof typeof agentPipeFactories;

export function listAgentPipeIds(): AgentPipeId[] {
  return Object.keys(agentPipeFactories) as AgentPipeId[];
}

export function getAgentPipeFactory(id: string): (() => PipeI) | null {
  if (Object.prototype.hasOwnProperty.call(agentPipeFactories, id)) {
    return agentPipeFactories[id as AgentPipeId];
  }
  return null;
}
