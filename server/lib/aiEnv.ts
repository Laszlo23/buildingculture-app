/**
 * BaseAI / Langbase are optional. Keys stay server-only (never VITE_*).
 * Merge values from `.env.baseai.example` into `.env` for local dev.
 */
export function isBuildingCultureAiConfigured(): boolean {
  return Boolean(process.env.LANGBASE_API_KEY?.trim());
}
