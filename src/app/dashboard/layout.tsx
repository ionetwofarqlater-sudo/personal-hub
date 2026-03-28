import { createClient } from "@/lib/supabase/server";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import DashboardAuthGate from "@/components/auth/DashboardAuthGate";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = supabase
    ? await supabase.auth.getUser()
    : { data: { user: null } };

  // Fetch saved count for the UserNav badge (best-effort — 0 on error)
  let savedCount = 0;
  if (supabase && user) {
    const { count } = await supabase
      .from('saved_items')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .is('deleted_at', null);
    savedCount = count ?? 0;
  }

  return (
    <div className="min-h-screen bg-gray-950">
      <DashboardHeader user={user} savedCount={savedCount} />
      <DashboardAuthGate>
        <main className="pt-20 px-4 pb-8 max-w-6xl mx-auto">
          {children}
        </main>
      </DashboardAuthGate>
    </div>
  );
}
