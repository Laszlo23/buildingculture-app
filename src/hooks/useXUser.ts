import { useQuery } from "@tanstack/react-query";
import { chainApi } from "@/lib/api";

export function useXUserQuery(username: string | null) {
  const u = username?.trim() || null;
  return useQuery({
    queryKey: ["social", "x", "user", u] as const,
    queryFn: () => chainApi.getSocialXUser(u!),
    enabled: Boolean(u && /^[A-Za-z0-9_]{1,15}$/.test(u)),
    staleTime: 5 * 60_000,
  });
}
