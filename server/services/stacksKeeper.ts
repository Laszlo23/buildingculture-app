import { Pox4SignatureTopic } from "@stacks/stacking";
import { makeUnsignedContractCall, privateKeyToPublic } from "@stacks/transactions";
import type { StacksConfig } from "../lib/stacksEnv.js";
import { getStacksConfig } from "../lib/stacksEnv.js";
import { createStackingClient } from "./stacksClient.js";
import { insertStacksKeeperRun } from "./stacksKeeperPersist.js";

export type KeeperTickResult = {
  action: "none" | "delegate-stx" | "stack-stx" | "skipped";
  dryRun: boolean;
  txid?: string;
  unsignedTx?: string;
  message?: string;
  error?: string;
};

function planStackAmount(cfg: StacksConfig, balance: bigint, min: bigint): bigint | null {
  const reserve = cfg.STACKS_BALANCE_RESERVE_MICRO_STX;
  if (balance <= reserve) return null;
  let amount = balance - reserve;
  if (cfg.STACKS_DELEGATE_MICRO_STX_MAX != null && amount > cfg.STACKS_DELEGATE_MICRO_STX_MAX) {
    amount = cfg.STACKS_DELEGATE_MICRO_STX_MAX;
  }
  if (amount < min) return null;
  return amount;
}

export async function runStacksKeeperTick(opts: { argvDryRun?: boolean } = {}): Promise<KeeperTickResult> {
  const cfg = getStacksConfig();
  if (!cfg) {
    return { action: "none", dryRun: true, message: "STACKS_ENABLED is unset; nothing to do." };
  }

  const dryRun = Boolean(cfg.STACKS_KEEPER_DRY_RUN || opts.argvDryRun);
  const client = createStackingClient(cfg);

  if (cfg.STACKS_MODE === "delegate") {
    const delegation = await client.getDelegationStatus();
    if (delegation.delegated) {
      const msg = "Already delegated; no automatic extend in v1 (pool operator handles cycles).";
      insertStacksKeeperRun({ action: "delegate-stx", status: "skipped", dryRun, details: { reason: msg } });
      return { action: "skipped", dryRun, message: msg };
    }

    const poxInfo = await client.getPoxInfo();
    const min = BigInt(poxInfo.min_amount_ustx);
    const balance = await client.getAccountBalance();
    const amount = planStackAmount(cfg, balance, min);
    if (amount == null) {
      const msg =
        balance <= cfg.STACKS_BALANCE_RESERVE_MICRO_STX
          ? "Balance below fee reserve."
          : "Planned amount below network minimum.";
      insertStacksKeeperRun({
        action: "delegate-stx",
        status: "skipped",
        dryRun,
        details: { balance: balance.toString(), min: min.toString() },
      });
      return { action: "skipped", dryRun, message: msg };
    }

    if (dryRun) {
      insertStacksKeeperRun({
        action: "delegate-stx",
        status: "skipped",
        dryRun: true,
        details: { amountMicroStx: amount.toString(), delegateTo: cfg.STACKS_DELEGATE_TO },
      });
      return {
        action: "delegate-stx",
        dryRun: true,
        message: `Would delegate ${amount} micro-STX to ${cfg.STACKS_DELEGATE_TO} (dry run).`,
      };
    }

    if (cfg.STACKS_SIGNING_MODE === "export") {
      const poxOp = await client.getPoxOperationInfo(poxInfo);
      const contract = await client.getStackingContract(poxOp);
      const callOpts = client.getDelegateOptions({
        contract,
        amountMicroStx: amount,
        delegateTo: cfg.STACKS_DELEGATE_TO!,
        untilBurnBlockHeight: undefined,
        poxAddress: cfg.STACKS_BTC_REWARD_ADDRESS,
      });
      const pk = cfg.STACKS_SENDER_PUBLIC_KEY!.trim();
      const tx = await makeUnsignedContractCall({
        ...callOpts,
        publicKey: pk,
        senderAddress: cfg.STACKS_ADDRESS,
      });
      const unsignedTxHex = Buffer.from(tx.serialize()).toString("hex");
      insertStacksKeeperRun({
        action: "delegate-stx",
        status: "ok",
        dryRun: false,
        details: { unsignedTxHex, amountMicroStx: amount.toString() },
      });
      return {
        action: "delegate-stx",
        dryRun: false,
        unsignedTx: unsignedTxHex,
        message: "Unsigned delegate-stx (hex); sign and broadcast manually.",
      };
    }

    const res = await client.delegateStx({
      amountMicroStx: amount,
      delegateTo: cfg.STACKS_DELEGATE_TO!,
      poxAddress: cfg.STACKS_BTC_REWARD_ADDRESS,
      privateKey: cfg.STACKS_SECRET_KEY!,
    });
    const txid = "txid" in res ? res.txid : undefined;
    if (!txid) {
      const err = JSON.stringify(res);
      insertStacksKeeperRun({ action: "delegate-stx", status: "error", dryRun: false, error: err, details: res });
      return { action: "delegate-stx", dryRun: false, error: err };
    }
    insertStacksKeeperRun({ action: "delegate-stx", status: "ok", dryRun: false, txId: txid, details: { amountMicroStx: amount.toString() } });
    return { action: "delegate-stx", dryRun: false, txid, message: `Broadcast delegate-stx: ${txid}` };
  }

  /* solo */
  const stacker = await client.getStatus();
  if (stacker.stacked) {
    const msg = "Already stacked (solo); extend flow not automated in v1.";
    insertStacksKeeperRun({ action: "stack-stx", status: "skipped", dryRun, details: { reason: msg } });
    return { action: "skipped", dryRun, message: msg };
  }

  const poxInfo = await client.getPoxInfo();
  const min = BigInt(poxInfo.min_amount_ustx);
  const balance = await client.getAccountBalance();
  const amount = planStackAmount(cfg, balance, min);
  if (amount == null) {
    insertStacksKeeperRun({ action: "stack-stx", status: "skipped", dryRun, details: { balance: balance.toString(), min: min.toString() } });
    return { action: "skipped", dryRun, message: "Insufficient STX for solo minimum after reserve." };
  }

  const cycles = cfg.STACKS_SOLO_CYCLES;
  const can = await client.canStack({ poxAddress: cfg.STACKS_BTC_REWARD_ADDRESS, cycles });
  if (!can.eligible) {
    insertStacksKeeperRun({
      action: "stack-stx",
      status: "skipped",
      dryRun,
      details: { reason: can.reason ?? "not_eligible" },
    });
    return { action: "skipped", dryRun, message: `can-stack-stx not eligible: ${can.reason ?? "unknown"}` };
  }

  const burnBlockHeight = poxInfo.next_cycle.prepare_phase_start_block_height;
  const rewardCycle = poxInfo.reward_cycle_id;

  if (dryRun) {
    insertStacksKeeperRun({
      action: "stack-stx",
      status: "skipped",
      dryRun: true,
      details: { amountMicroStx: amount.toString(), cycles, burnBlockHeight, rewardCycle },
    });
    return {
      action: "stack-stx",
      dryRun: true,
      message: `Would stack ${amount} micro-STX for ${cycles} cycle(s) at burn height ${burnBlockHeight} (dry run).`,
    };
  }

  if (cfg.STACKS_SIGNING_MODE === "export") {
    insertStacksKeeperRun({
      action: "stack-stx",
      status: "skipped",
      dryRun: false,
      details: { reason: "solo_export_unsupported_v1" },
    });
    return {
      action: "skipped",
      dryRun: false,
      message:
        "Solo stack in export mode is not supported in v1 (PoX-4 needs a signed payload). Use delegate+export or solo+hot.",
    };
  }

  const sk = cfg.STACKS_SECRET_KEY!;
  const signerKey = privateKeyToPublic(sk);
  const sigHex = client.signPox4SignatureHash({
    topic: Pox4SignatureTopic.StackStx,
    poxAddress: cfg.STACKS_BTC_REWARD_ADDRESS,
    rewardCycle,
    period: cycles,
    signerPrivateKey: sk,
    maxAmount: amount,
    authId: 0n,
  });

  const res = await client.stack({
    amountMicroStx: amount,
    poxAddress: cfg.STACKS_BTC_REWARD_ADDRESS,
    cycles,
    burnBlockHeight,
    signerKey,
    signerSignature: sigHex,
    maxAmount: amount,
    authId: 0n,
    privateKey: sk,
  });
  const txid = "txid" in res ? res.txid : undefined;
  if (!txid) {
    const err = JSON.stringify(res);
    insertStacksKeeperRun({ action: "stack-stx", status: "error", dryRun: false, error: err, details: res });
    return { action: "stack-stx", dryRun: false, error: err };
  }
  insertStacksKeeperRun({ action: "stack-stx", status: "ok", dryRun: false, txId: txid, details: { amountMicroStx: amount.toString(), cycles } });
  return { action: "stack-stx", dryRun: false, txid, message: `Broadcast stack-stx: ${txid}` };
}
