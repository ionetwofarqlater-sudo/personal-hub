export type AppRole = "admin" | "user";

export const ROLE_PERMISSIONS: Record<AppRole, readonly string[]> = {
  admin: ["admin:read", "admin:write", "admin:users"],
  user: []
};

export function isAdmin(role: string | undefined): boolean {
  return role === "admin";
}
