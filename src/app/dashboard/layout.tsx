import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import DashboardHeader from "@/components/dashboard/DashboardHeader";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = supabase
    ? await supabase.auth.getUser()
    : { data: { user: null } };

  if (supabase && !user) redirect("/login");

  return (
    <div className="min-h-screen bg-gray-950">
      <DashboardHeader user={user} />
      <main className="pt-20 px-4 pb-8 max-w-6xl mx-auto">
        {children}
      </main>
    </div>
  );
}
