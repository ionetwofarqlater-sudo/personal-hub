import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { sql } from "@/lib/db";
import SavedClient from "./SavedClient";
import type { SavedItem } from "@/types/domain";

export const metadata = { title: "Saved — Personal Hub" };

export default async function SavedPage() {
  const session = await auth();
  if (!session) redirect("/login");

  let items: SavedItem[] = [];
  let dbError: string | null = null;

  try {
    const rows = await sql`
      SELECT * FROM saved_items
      WHERE user_id = ${session.user.id} AND deleted_at IS NULL
      ORDER BY is_pinned DESC, created_at DESC
      LIMIT 100
    `;
    items = rows as unknown as SavedItem[];
  } catch (e) {
    dbError = e instanceof Error ? e.message : "DB error";
    console.error("[SavedPage] DB error:", dbError);
  }

  return <SavedClient initialItems={items} userId={session.user.id} dbError={dbError} />;
}
