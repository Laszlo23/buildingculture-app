const buckets = new Map<string, { count: number; windowStart: number }>();

/**
 * Simple fixed-window rate limit for AI pipe HTTP routes (per client key, e.g. IP).
 */
export function allowAiPipeRequest(key: string, maxPerWindow: number, windowMs: number): boolean {
	const now = Date.now();
	let b = buckets.get(key);
	if (!b || now - b.windowStart >= windowMs) {
		b = { count: 1, windowStart: now };
		buckets.set(key, b);
		return true;
	}
	if (b.count >= maxPerWindow) return false;
	b.count += 1;
	return true;
}

export function clientKeyFromRequest(getHeader: (name: string) => string | undefined): string {
	const fwd = getHeader("x-forwarded-for")?.split(",")[0]?.trim();
	if (fwd) return `ip:${fwd}`;
	const realIp = getHeader("x-real-ip")?.trim();
	if (realIp) return `ip:${realIp}`;
	return "ip:unknown";
}
