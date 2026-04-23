import { StackingClient } from "@stacks/stacking";
import type { StacksConfig } from "../lib/stacksEnv.js";

export function createStackingClient(cfg: StacksConfig): StackingClient {
  return new StackingClient({
    address: cfg.STACKS_ADDRESS,
    network: cfg.STACKS_NETWORK,
    client: {
      baseUrl: cfg.hiroResolvedBase,
      fetch: globalThis.fetch.bind(globalThis),
    },
  });
}
