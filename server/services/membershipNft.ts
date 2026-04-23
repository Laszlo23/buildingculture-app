import { clubCitizenPassAbi } from "../../src/contracts/abis.ts";
import { getPublicClient } from "../lib/chain.js";
import { getEnv } from "../lib/env.js";
import { contractAddresses } from "./addresses.ts";

const ZERO = "0x0000000000000000000000000000000000000000";

export function membershipNftConfigured(): boolean {
  const a = getEnv().MEMBERSHIP_NFT_CONTRACT?.toLowerCase();
  return Boolean(a && a !== ZERO);
}

export async function readCitizenPassBalance(holder: `0x${string}`): Promise<bigint> {
  if (!membershipNftConfigured()) return 0n;
  const publicClient = getPublicClient();
  const { membershipNft } = contractAddresses();
  return publicClient.readContract({
    address: membershipNft,
    abi: clubCitizenPassAbi,
    functionName: "balanceOf",
    args: [holder],
  }) as Promise<bigint>;
}

export async function readCitizenSaleParams(): Promise<{
  citizenPriceWei: bigint;
  maxCitizenSupply: bigint;
  citizensMinted: bigint;
  treasury: `0x${string}`;
}> {
  const publicClient = getPublicClient();
  const { membershipNft } = contractAddresses();
  const [citizenPriceWei, maxCitizenSupply, citizensMinted, treasury] = await Promise.all([
    publicClient.readContract({
      address: membershipNft,
      abi: clubCitizenPassAbi,
      functionName: "citizenPriceWei",
    }) as Promise<bigint>,
    publicClient.readContract({
      address: membershipNft,
      abi: clubCitizenPassAbi,
      functionName: "maxCitizenSupply",
    }) as Promise<bigint>,
    publicClient.readContract({
      address: membershipNft,
      abi: clubCitizenPassAbi,
      functionName: "citizensMinted",
    }) as Promise<bigint>,
    publicClient.readContract({
      address: membershipNft,
      abi: clubCitizenPassAbi,
      functionName: "treasury",
    }) as Promise<`0x${string}`>,
  ]);
  return { citizenPriceWei, maxCitizenSupply, citizensMinted, treasury };
}
