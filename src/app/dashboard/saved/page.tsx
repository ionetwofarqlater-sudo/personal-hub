import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import SavedClient from "./SavedClient";
import type { SavedItem } from "@/types/domain";

export const metadata = { title: "Saved — Personal Hub" };

export default async function SavedPage() {
  const supabase = await createClient();
  if (!supabase) redirect("/login");

  const {
    data: { user }
  } = await supabase.auth.getUser();

  // SSR auth can fail on Vercel if cookies aren't forwarded correctly.
  // Fall back to client-side hydration instead of hard redirect to avoid
  // the login→dashboard redirect loop.
  if (!user) {
    return <SavedClient initialItems={[]} userId="" dbError={null} />;
  }

  const { data: items, error: itemsError } = await supabase
    .from("saved_items")
    .select("*")
    .eq("user_id", user.id)
    .is("deleted_at", null)
    .order("created_at", { ascending: false })
    .limit(100);

  if (itemsError) {
    console.error("[SavedPage] DB error:", itemsError.message);
  }

  return (
    <SavedClient
      initialItems={(items ?? []) as SavedItem[]}
      userId={user.id}
      dbError={itemsError ? itemsError.message : null}
    />
  );
}
