import { createClient } from "@/lib/supabase/server";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import DashboardAuthGate from "@/components/auth/DashboardAuthGate";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = supabase
    ? await supabase.auth.getUser()
    : { data: { user: null } };

  return (
    <div className="min-h-screen bg-gray-950">
      <DashboardHeader user={user} />
      <DashboardAuthGate>
        <main className="pt-20 px-4 pb-8 max-w-6xl mx-auto">
          {children}
        </main>
      </DashboardAuthGate>
    </div>
  );
}
