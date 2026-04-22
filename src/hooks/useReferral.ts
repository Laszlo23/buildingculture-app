import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { chainApi, type RecordReferralResult, type ReferralStatsDto, type ReferralLeaderboardRowDto } from "@/lib/api";

const qk = { stats: (a: string) => ["referrals", a] as const, lb: () => ["referralLeaderboard"] as const };

export function useReferralStats(address: string | undefined) {
  return useQuery<ReferralStatsDto>({
    queryKey: address ? qk.stats(address) : (["referrals", "disconnected"] as const),
    queryFn: () => chainApi.getReferralStats(address!.toLowerCase()),
    enabled: Boolean(address),
  });
}

export function useRecordReferral() {
  const qc = useQueryClient();
  return useMutation<RecordReferralResult, Error, { inviter: `0x${string}`; invitee: `0x${string}` }>({
    mutationFn: (b) => chainApi.recordReferral(b),
    onSuccess: (_d, b) => {
      void qc.invalidateQueries({ queryKey: qk.stats(b.inviter) });
    },
  });
}

export function useReferralInvitesLeaderboard(limit = 30) {
  return useQuery<{ rows: ReferralLeaderboardRowDto[] }>({
    queryKey: [...qk.lb(), limit],
    queryFn: () => chainApi.getReferralLeaderboard(limit),
  });
}
