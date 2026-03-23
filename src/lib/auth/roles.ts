import type { SupabaseClient } from "@supabase/supabase-js";

export type AppRole = "admin" | "user";

export const ROLE_PERMISSIONS: Record<AppRole, readonly string[]> = {
  admin: ["admin:read", "admin:write", "admin:users"],
  user: [],
};

export async function getUserRole(supabase: SupabaseClient, userId: string): Promise<AppRole> {
  const { data, error } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .maybeSingle<{ role: AppRole }>();

  if (error || !data?.role) return "user";
  return data.role === "admin" ? "admin" : "user";
}

export async function isUserAdmin(supabase: SupabaseClient, userId: string): Promise<boolean> {
  const role = await getUserRole(supabase, userId);
  return role === "admin";
}
