import type { Hono } from "hono";
import { buildPlatformAgentsPayload } from "../agents/platformAgents.js";

export function registerAgentRoutes(app: Hono) {
  app.get("/api/agents", (c) => {
    return c.json(buildPlatformAgentsPayload());
  });
}
