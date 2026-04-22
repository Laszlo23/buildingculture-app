import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { chainApi } from "@/lib/api";
import { fetchWeb3BioUniversalProfile } from "@/lib/web3bioFetch";

export const qk = {
  communityMessages: ["community", "messages"] as const,
  profile: (address: string | undefined) => ["community", "profile", address ?? ""] as const,
  dailyTasks: (address: string | undefined) => ["community", "dailyTasks", address ?? ""] as const,
};

export function useCommunityMessagesQuery() {
  return useQuery({
    queryKey: qk.communityMessages,
    queryFn: () => chainApi.communityMessages(),
    refetchInterval: 12_000,
  });
}

export function usePostCommunityMessageMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: { address: string; text: string }) => chainApi.postCommunityMessage(body),
    onSuccess: (_data, vars) => {
      void qc.invalidateQueries({ queryKey: qk.communityMessages });
      void qc.invalidateQueries({ queryKey: qk.dailyTasks(vars.address) });
    },
  });
}

export function useMemberProfileQuery(address: string | undefined) {
  return useQuery({
    queryKey: qk.profile(address),
    queryFn: () => chainApi.getProfile(address!),
    enabled: Boolean(address && /^0x[a-fA-F0-9]{40}$/i.test(address)),
  });
}

export function usePutProfileMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: Parameters<typeof chainApi.putProfile>[0]) => chainApi.putProfile(body),
    onSuccess: (_data, vars) => {
      void qc.invalidateQueries({ queryKey: qk.profile(vars.address) });
      void qc.invalidateQueries({ queryKey: ["wealth", vars.address] });
    },
  });
}

/** Web3.bio universal profile (`GET https://api.web3.bio/profile/:address`). Auth via vite.config `define` from WEB3_BIO_API_KEY / BEARER_TOKEN etc. */
export function useWeb3BioProfileQuery(address: string | undefined) {
  const enabled = Boolean(address && /^0x[a-fA-F0-9]{40}$/i.test(address));
  return useQuery({
    queryKey: ["web3bio", "universal", address ?? ""] as const,
    queryFn: () => fetchWeb3BioUniversalProfile(address!),
    enabled,
    retry: 1,
    staleTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}

export function useDailyTasksQuery(address: string | undefined) {
  return useQuery({
    queryKey: qk.dailyTasks(address),
    queryFn: () => chainApi.getDailyTasks(address!),
    enabled: Boolean(address && /^0x[a-fA-F0-9]{40}$/i.test(address)),
  });
}

export function useCompleteDailyTaskMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: { address: string; taskId: import("@/lib/api").DailyTaskId }) =>
      chainApi.completeDailyTask(body),
    onSuccess: (_data, vars) => {
      void qc.invalidateQueries({ queryKey: qk.dailyTasks(vars.address) });
    },
  });
}
