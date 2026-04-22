import { useQuery } from "@tanstack/react-query";
import { chainApi } from "@/lib/api";

export const farcasterKeys = {
  one: (a: string | undefined) => ["farcaster", a ?? ""] as const,
  batch: (addrs: string[]) => ["farcaster", "batch", [...new Set(addrs)].sort().join(",")] as const,
};

export function useFarcasterQuery(address: string | undefined) {
  return useQuery({
    queryKey: farcasterKeys.one(address),
    queryFn: () => chainApi.getFarcaster(address!),
    enabled: Boolean(address && /^0x[a-fA-F0-9]{40}$/i.test(address)),
    staleTime: 5 * 60_000,
  });
}

/** Unique 0x addresses (e.g. community chat participants). */
export function useFarcasterBatchQuery(addresses: string[]) {
  const key = [...new Set(addresses.map((a) => a.toLowerCase()))]
    .filter((a) => /^0x[a-f0-9]{40}$/i.test(a))
    .sort();
  return useQuery({
    queryKey: farcasterKeys.batch(key),
    queryFn: () => chainApi.getFarcasterBatch(key),
    enabled: key.length > 0,
    staleTime: 3 * 60_000,
  });
}
