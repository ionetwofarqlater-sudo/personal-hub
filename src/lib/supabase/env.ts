function isValidHttpUrl(value: string | undefined) {
  if (!value) return false;
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

function normalizeEnvValue(value: string | undefined) {
  if (!value) return "";

  let normalized = value.trim();

  if (
    (normalized.startsWith('"') && normalized.endsWith('"')) ||
    (normalized.startsWith("'") && normalized.endsWith("'"))
  ) {
    normalized = normalized.slice(1, -1);
  }

  normalized = normalized.replace(/\\r\\n|\\n|\\r/g, "").trim();
  return normalized;
}

export type SupabaseEnv = {
  url: string;
  anonKey: string;
};

export function getSupabaseEnv(): SupabaseEnv | null {
  const rawUrl = normalizeEnvValue(process.env.NEXT_PUBLIC_SUPABASE_URL);
  const rawAnonKey = normalizeEnvValue(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

  if (!rawUrl || !isValidHttpUrl(rawUrl)) return null;
  if (!rawAnonKey || rawAnonKey.includes("your_supabase_anon_key")) return null;
  if (rawUrl.includes("your_supabase_project_url")) return null;

  return { url: rawUrl, anonKey: rawAnonKey };
}

export function hasSupabaseEnv() {
  return !!getSupabaseEnv();
}
