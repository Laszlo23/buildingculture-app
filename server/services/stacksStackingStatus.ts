import type { StacksConfig } from "../lib/stacksEnv.js";
import { createStackingClient } from "./stacksClient.js";

export type StacksStackingStatusDto = {
  enabled: true;
  network: "mainnet" | "testnet";
  hiroBase: string;
  address: string;
  mode: "delegate" | "solo";
  btcRewardAddress: string;
  balanceMicroStx: string;
  lockedMicroStx: string;
  minAmountUstx: string;
  rewardCycleId: number;
  delegation: { delegated: boolean; delegateTo?: string; amountMicroStx?: string };
  stacker: { stacked: boolean; unlockHeight?: number };
};

export async function buildStackingStatusDto(cfg: StacksConfig): Promise<StacksStackingStatusDto> {
  const client = createStackingClient(cfg);
  const [pox, balance, locked, delegation, stacker] = await Promise.all([
    client.getPoxInfo(),
    client.getAccountBalance(),
    client.getAccountBalanceLocked(),
    client.getDelegationStatus(),
    client.getStatus(),
  ]);

  const del =
    delegation.delegated && "details" in delegation
      ? {
          delegated: true as const,
          delegateTo: delegation.details.delegated_to,
          amountMicroStx: delegation.details.amount_micro_stx.toString(),
        }
      : { delegated: false as const };

  const stk =
    stacker.stacked && "details" in stacker
      ? { stacked: true as const, unlockHeight: stacker.details.unlock_height }
      : { stacked: false as const };

  return {
    enabled: true,
    network: cfg.STACKS_NETWORK,
    hiroBase: cfg.hiroResolvedBase,
    address: cfg.STACKS_ADDRESS,
    mode: cfg.STACKS_MODE,
    btcRewardAddress: cfg.STACKS_BTC_REWARD_ADDRESS,
    balanceMicroStx: balance.toString(),
    lockedMicroStx: locked.toString(),
    minAmountUstx: String(pox.min_amount_ustx),
    rewardCycleId: pox.reward_cycle_id,
    delegation: del,
    stacker: stk,
  };
}
