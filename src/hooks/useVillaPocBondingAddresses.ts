import { useMemo } from "react";
import { getClientContractAddresses } from "@/contracts/addresses";
import { useChainConfig } from "@/hooks/useChainData";

function isValidNonZeroAddr(a: string | null | undefined): a is `0x${string}` {
  if (!a || typeof a !== "string") return false;
  const t = a.trim();
  if (!/^0x[a-fA-F0-9]{40}$/i.test(t)) return false;
  return t.toLowerCase() !== "0x0000000000000000000000000000000000000000";
}

/**
 * Villa POC curve + optional USDC hint: prefer `GET /api/config` (`contracts.villaPocBondingCurve`)
 * so production can match the server without rebuilding with `VITE_*`. Falls back to
 * `VITE_VILLA_BONDING_CURVE_ADDRESS` / `VITE_VILLA_BONDING_USDC_ADDRESS` from the bundle.
 */
export function useVillaPocBondingAddresses() {
  const { data: cfg } = useChainConfig();

  return useMemo(() => {
    const vite = getClientContractAddresses();
    const apiCurve = cfg?.contracts?.villaPocBondingCurve ?? null;
    const apiUsdc = cfg?.contracts?.villaPocBondingUsdc ?? null;

    const curveAddress = isValidNonZeroAddr(apiCurve)
      ? apiCurve
      : isValidNonZeroAddr(vite.villaBondingCurve)
        ? (vite.villaBondingCurve as `0x${string}`)
        : undefined;

    const usdcAddressHint = isValidNonZeroAddr(apiUsdc)
      ? apiUsdc
      : isValidNonZeroAddr(vite.villaBondingUsdc)
        ? (vite.villaBondingUsdc as `0x${string}`)
        : undefined;

    const chainId = cfg?.chainId ?? vite.chainId;

    return { curveAddress, usdcAddressHint, chainId };
  }, [
    cfg?.chainId,
    cfg?.contracts?.villaPocBondingCurve,
    cfg?.contracts?.villaPocBondingUsdc,
  ]);
}
