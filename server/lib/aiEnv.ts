/**
 * BaseAI / Langbase are optional. Keys stay server-only (never VITE_*).
 * Merge values from `.env.baseai.example` into `.env` for local dev.
 */
export function isAiConfigured(): boolean {
	return Boolean(process.env.LANGBASE_API_KEY?.trim());
}

/** @deprecated Use {@link isAiConfigured}; kept for call sites that name the Club pipe. */
export function isBuildingCultureAiConfigured(): boolean {
	return isAiConfigured();
}

/** When true, server may append one Community Builder message after each member chat post (requires LANGBASE_API_KEY). */
export function isCommunityAgentInChatEnabled(): boolean {
	const v = process.env.COMMUNITY_AGENT_IN_CHAT?.trim().toLowerCase();
	return v === "1" || v === "true" || v === "yes";
}
