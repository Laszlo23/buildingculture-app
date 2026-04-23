# Stacks PoX stacking automation (DAO)

This app’s primary chain is **Base (EVM)**. Stacks stacking is a **separate custody domain**: native **STX** on Stacks L1, Proof-of-Transfer (PoX), and **BTC rewards** to a configured **Bitcoin reward address**.

## Participation modes

| Mode | When to use | Keeper behaviour (v1) |
|------|----------------|------------------------|
| **delegate** | DAO delegates STX to a vetted pool operator (`delegate-stx`). Pool handles reward-cycle mechanics. | One-shot `delegate-stx` when not already delegated and balance ≥ network minimum. |
| **solo** | DAO locks STX directly in PoX (`stack-stx`). Full control; must satisfy **PoX-4** signer args (public key + signature + max amount + auth id). | `stack-stx` with `signPox4SignatureHash` when eligible and not already stacked. |

Default recommendation for most DAOs: **delegate** first, with caps in env (`STACKS_DELEGATE_MICRO_STX_MAX`).

## Environment variables

Set `STACKS_ENABLED=1` for any Stacks keeper or API status route.

| Variable | Required | Description |
|----------|------------|-------------|
| `STACKS_ENABLED` | For keeper/API | `1` / `true` to enable. |
| `STACKS_NETWORK` | Yes | `mainnet` or `testnet`. |
| `STACKS_HIRO_API_BASE` | No | Default `https://api.hiro.so` (mainnet) or `https://api.testnet.hiro.so`. |
| `STACKS_ADDRESS` | Yes | DAO **Stacks principal** (`SP…` or `ST…`). |
| `STACKS_MODE` | Yes | `delegate` or `solo`. |
| `STACKS_BTC_REWARD_ADDRESS` | Yes | BTC address for PoX rewards (segwit / legacy per current PoX rules). |
| `STACKS_DELEGATE_TO` | If `delegate` | Pool operator Stacks address. |
| `STACKS_DELEGATE_MICRO_STX_MAX` | No | Cap on delegated micro-STX (defaults to full balance minus reserve). |
| `STACKS_BALANCE_RESERVE_MICRO_STX` | No | Micro-STX left for fees (default `5000000` ≈ 5 STX). |
| `STACKS_SOLO_CYCLES` | If `solo` | Lock cycles count (default `1`). |
| `STACKS_SIGNING_MODE` | Yes | `hot` (sign + broadcast) or `export` (build unsigned hex, no broadcast). |
| `STACKS_SECRET_KEY` | If `hot` | **Stacks** private key (hex). **Never reuse Base `PRIVATE_KEY` unless intentional.** Rotate and restrict caps. |
| `STACKS_SENDER_PUBLIC_KEY` | If `export` | Compressed secp256k1 public key hex (33 bytes) for the sender; used to build unsigned contract calls. |
| `STACKS_KEEPER_DRY_RUN` | No | `1` logs actions only; no tx build that needs key in hot mode still skips broadcast. |

## Signing and custody

- **hot**: Keeper signs with `STACKS_SECRET_KEY`. Acceptable only for testnets or very small caps with monitoring.
- **export**: Keeper builds a contract-call payload and writes **unsigned** transaction hex to logs / DB for multisig or Leather import; operators broadcast manually after review.

## Testnet rehearsal

1. Create a testnet wallet; fund with faucet STX.
2. Set `STACKS_NETWORK=testnet`, `STACKS_HIRO_API_BASE=https://api.testnet.hiro.so`, `STACKS_ADDRESS=…`, `STACKS_MODE=delegate`, `STACKS_DELEGATE_TO=<known test pool if available>`, `STACKS_BTC_REWARD_ADDRESS=<test btc addr>`.
3. Run `npm run stacks:keeper -- --dry-run` (or `STACKS_KEEPER_DRY_RUN=1`) and confirm logs.
4. Run without dry-run on testnet with `STACKS_SIGNING_MODE=hot` and minimal STX.
5. Verify delegation on [Stacks Explorer testnet](https://explorer.hiro.so/?chain=testnet).

## Operational risks

- **PoX upgrades** change contract IDs and arg shapes; pin `@stacks/stacking` and re-test after network upgrades.
- **Wrong BTC reward address** misattributes yield permanently.
- **Locked STX** is illiquid for full reward cycles after solo stack; delegation terms depend on the pool.

## Commands

- **Keeper (cron-friendly):** `npm run stacks:keeper`
- **Read-only status (via API):** `GET /api/stacks/stacking-status` when `STACKS_ENABLED=1`
