# BuildingCulture Capital – Base Grant Proposal

**Total requested: USD 35,000** (breakdown below).

## Project Overview
BuildingCulture Capital tokenizes real‑estate assets on Base, creating a DAO‑governed platform where investors can buy fractional shares of high‑quality properties. Users earn yield through rental income and property appreciation, all managed by smart contracts.

## Goals & Impact
- **$500k TVL** within 6 months (first 3 properties tokenized).
- **20 % annual yield** for USDC‑backed vaults.
- **Community growth**: 5 k active token‑holders, Discord & Telegram engagement > 10 k.
- **Transparency**: On‑chain governance via `GovernanceDAO`, audited contracts, and real‑time dashboards.

## Requested Funding – $35,000
| Item | Amount (USD) | Reason |
|------|--------------|--------|
| Security audit (StrategyRegistry & Vault) | 12,000 | Ensure funds are safe for investors |
| UX/UI enhancements (dashboard, onboarding) | 6,000 | Better user experience and conversion |
| Marketing & community incentives | 5,000 | Grants for early adopters, ambassador program |
| Legal & compliance (RWA framework) | 2,000 | Align with EU/US regulations |
| Server & infrastructure costs | 5,000 | Cloud hosting, monitoring, backups |
| AI services (model usage, embeddings) | 2,000 | GPT‑4, vector DB, analytics |
| Personal stipend (food, coffee, overtime) | 3,000 | Keep the founder fueled and focused |

## Technical Architecture
- **Contracts (already deployed on Base 8453)**:
  - `SavingsVault` – USDC yield vault, fee‑structured (1.5 % mgmt, 10 % perf)
  - `ClubTreasury` – property tokenization & bonding curve
  - `GovernanceDAO` – DAO voting & fee distribution
  - `StrategyRegistry` – registers new strategies (this grant will fund a new strategy registration)
  - `LearningAchievement` – soul‑bound NFTs for education
- **Frontend** – Next.js + viem, connects to Base via Alchemy RPC (`RPC_URL` from .env).
- **Backend** – Node.js services for off‑chain data, NFT metadata, and analytics.

## Milestones (90 days)
1. **Week 1‑2** – Finalise strategy parameters, run audit, integrate `register‑strategy.js`.
2. **Week 3‑4** – Deploy new yield‑vault strategy, open deposits, start fee collection.
3. **Month 2** – Tokenize first property (Villa POC), launch bonding‑curve sale.
4. **Month 3** – Community campaign, on‑board 1 k investors, publish dashboard.

## Team
- **Laszlo (Founder / CTO)** – Web dev, smart‑contract architect, deployed contracts.
- **Cora (COO)** – Strategy, operations, grant writing (this document).
- **Community Lead** – Discord & Twitter, growth.
- **Advisors** – Real‑estate legal, DeFi security.

## Why Base?
Base offers low‑cost USDC transfers, strong dev tooling, and a growing ecosystem of RWA projects. Our contracts already run on Base mainnet (chain‑id 8453) and we leverage its native stablecoin bridge.

---
*Prepared by Cora, COO of BuildingCulture Capital.*