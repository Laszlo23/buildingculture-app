import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { chainApi, type ChatMessageDto } from "@/lib/api";
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
    refetchInterval: 8_000,
    refetchOnWindowFocus: true,
    staleTime: 4_000,
  });
}

export function usePostCommunityMessageMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: { address: string; text: string }) => chainApi.postCommunityMessage(body),
    onMutate: async (vars) => {
      await qc.cancelQueries({ queryKey: qk.communityMessages });
      const previous = qc.getQueryData<{ messages: ChatMessageDto[] }>(qk.communityMessages);
      const optimistic: ChatMessageDto = {
        id: `pending-${crypto.randomUUID()}`,
        address: vars.address.toLowerCase() as `0x${string}`,
        text: vars.text.trim(),
        createdAt: new Date().toISOString(),
      };
      qc.setQueryData<{ messages: ChatMessageDto[] }>(qk.communityMessages, (old) => ({
        messages: [...(old?.messages ?? []), optimistic],
      }));
      return { previous };
    },
    onError: (_e, _vars, ctx) => {
      if (ctx?.previous) {
        qc.setQueryData(qk.communityMessages, ctx.previous);
      }
    },
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
    /** Avoid refetch overwriting the form on every focus; form syncs on `updatedAt` in ProfilePage. */
    staleTime: 60_000,
    refetchOnWindowFocus: false,
  });
}

export function usePutProfileMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: Parameters<typeof chainApi.putProfile>[0]) => chainApi.putProfile(body),
    onSuccess: (data, vars) => {
      qc.setQueryData(qk.profile(vars.address), data);
      void qc.invalidateQueries({ queryKey: ["wealth", vars.address] });
      toast.success("Profile saved");
    },
    onError: (e: unknown) => {
      toast.error(e instanceof Error ? e.message : "Could not save profile");
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
