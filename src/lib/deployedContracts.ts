/**
 * Canonical list of Solidity contracts shipped in this repo + optional deployed addresses from `GET /api/config`.
 */

export type ApiDeployedContracts = {
  vault: string | null;
  treasury: string | null;
  dao: string | null;
  strategyRegistry: string | null;
  assetToken: string | null;
  learningNft: string | null;
  /** ClubCitizenPass — paid Citizen membership */
  membershipNft: string | null;
  villaPocBondingCurve: string | null;
  villaPocBondingUsdc: string | null;
};

export type DeployedContractKey = keyof ApiDeployedContracts;

export type DeployedContractDefinition = {
  key: DeployedContractKey;
  /** UI label */
  label: string;
  /** Source file in `contracts/` */
  solidity: string;
  /** One-line role */
  description: string;
};

export const DEPLOYED_CONTRACT_DEFINITIONS: readonly DeployedContractDefinition[] = [
  {
    key: "vault",
    label: "Savings vault",
    solidity: "SavingsVault.sol",
    description: "Member deposits, withdrawals, and yield accounting.",
  },
  {
    key: "treasury",
    label: "Club treasury",
    solidity: "ClubTreasury.sol",
    description: "DAO treasury asset accounting.",
  },
  {
    key: "dao",
    label: "Governance DAO",
    solidity: "GovernanceDAO.sol",
    description: "Proposals, votes, and owner-gated parameters.",
  },
  {
    key: "strategyRegistry",
    label: "Strategy registry",
    solidity: "StrategyRegistry.sol",
    description: "Strategy IDs, allocation bps, adapters, and TVL hints.",
  },
  {
    key: "assetToken",
    label: "Vault asset (ERC-20)",
    solidity: "—",
    description: "USDC or other token the vault accepts (not a club .sol file — typically canonical USDC).",
  },
  {
    key: "learningNft",
    label: "Learning achievements (NFT)",
    solidity: "LearningAchievement.sol",
    description: "Soulbound-style credentials for Academy routes.",
  },
  {
    key: "membershipNft",
    label: "Citizen membership (NFT)",
    solidity: "ClubCitizenPass.sol",
    description: "Paid Citizen pass; Club AI may require a balance when configured on the API.",
  },
  {
    key: "villaPocBondingCurve",
    label: "Villa Ebreichsdorf POC curve",
    solidity: "VillaPocBondingCurve.sol",
    description: "Optional unaudited USDC → receipt bonding curve for the villa POC.",
  },
  {
    key: "villaPocBondingUsdc",
    label: "Villa POC USDC",
    solidity: "—",
    description: "USDC token used by the villa bonding curve when configured.",
  },
] as const;

function isValidHexAddress(a: string | null | undefined): a is string {
  return typeof a === "string" && /^0x[a-fA-F0-9]{40}$/i.test(a.trim()) && a.trim().length === 42;
}

function isNonZeroAddress(a: string | null | undefined): boolean {
  if (!isValidHexAddress(a)) return false;
  return a.trim().toLowerCase() !== "0x0000000000000000000000000000000000000000";
}

/** Entries for `VerifyOnChainStrip` / quick links — only non-zero addresses. */
export function buildDeployedContractStripEntries(
  contracts: Partial<ApiDeployedContracts> | null | undefined,
): { label: string; address: string }[] {
  if (!contracts) return [];
  return DEPLOYED_CONTRACT_DEFINITIONS.flatMap(def => {
    const raw = contracts[def.key];
    if (!isNonZeroAddress(raw)) return [];
    return [{ label: def.label, address: raw.trim() }];
  });
}

/** Collapsible list rows — includes any valid 0x address (including zero placeholder) so devs see misconfiguration. */
export function buildContractAddressBlockEntries(
  contracts: Partial<ApiDeployedContracts> | null | undefined,
): { label: string; address: string | null | undefined }[] {
  if (!contracts) return [];
  return DEPLOYED_CONTRACT_DEFINITIONS.map(def => ({
    label: def.label,
    address: isValidHexAddress(contracts[def.key]) ? contracts[def.key]!.trim() : null,
  }));
}

export type DeployedContractCatalogRow = DeployedContractDefinition & {
  address: string | null;
  /** Has a non-zero address suitable for BaseScan. */
  linkable: boolean;
};

export function buildDeployedContractCatalog(
  contracts: Partial<ApiDeployedContracts> | null | undefined,
): DeployedContractCatalogRow[] {
  return DEPLOYED_CONTRACT_DEFINITIONS.map(def => {
    const raw = contracts?.[def.key];
    const address = isValidHexAddress(raw) ? raw.trim() : null;
    return {
      ...def,
      address,
      linkable: isNonZeroAddress(raw),
    };
  });
}
