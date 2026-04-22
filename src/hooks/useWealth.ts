import { useQuery } from "@tanstack/react-query";
import { chainApi, type WealthRange } from "@/lib/api";

export function useWealthQuery(address: string | undefined, range: WealthRange = "1Y") {
  return useQuery({
    queryKey: ["wealth", address ?? "", range] as const,
    queryFn: () => chainApi.getWealth(address!, range),
    enabled: Boolean(address && /^0x[a-fA-F0-9]{40}$/i.test(address)),
    retry: false,
  });
}

export function useLeaderboardQuery() {
  return useQuery({
    queryKey: ["leaderboard"] as const,
    queryFn: () => chainApi.getLeaderboard(),
    staleTime: 60_000,
  });
}
