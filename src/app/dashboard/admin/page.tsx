import Link from "next/link";
import { redirect } from "next/navigation";
import { Shield, Users, ScrollText } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getUserRole } from "@/lib/auth/roles";

export default async function AdminDashboardPage() {
  const supabase = await createClient();
  if (!supabase) {
    redirect("/login");
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const role = await getUserRole(supabase, user.id);
  if (role !== "admin") {
    redirect("/403");
  }

  return (
    <div className="animate-fade-in space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white mb-1">Admin Dashboard</h1>
        <p className="text-gray-400">Керування ролями і адмін-операціями.</p>
      </div>

      <section className="grid md:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-gray-800 bg-gray-900/60 p-5">
          <div className="w-10 h-10 rounded-xl bg-violet-500/20 text-violet-300 flex items-center justify-center mb-3">
            <Shield className="w-5 h-5" />
          </div>
          <h2 className="text-white font-semibold">Роль доступу</h2>
          <p className="text-sm text-gray-400 mt-1">Поточна роль: <span className="text-violet-300 font-medium">{role}</span></p>
        </div>

        <div className="rounded-2xl border border-gray-800 bg-gray-900/60 p-5">
          <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-300 flex items-center justify-center mb-3">
            <Users className="w-5 h-5" />
          </div>
          <h2 className="text-white font-semibold">Користувачі</h2>
          <p className="text-sm text-gray-400 mt-1">Базові admin-вʼю для користувачів підключимо наступним кроком.</p>
        </div>

        <div className="rounded-2xl border border-gray-800 bg-gray-900/60 p-5">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center mb-3">
            <ScrollText className="w-5 h-5" />
          </div>
          <h2 className="text-white font-semibold">Аудит дій</h2>
          <p className="text-sm text-gray-400 mt-1">Логи `admin_audit_logs` також винесемо в окрему таблицю перегляду.</p>
        </div>
      </section>

      <Link href="/dashboard" className="inline-flex text-sm text-gray-400 hover:text-white transition-colors">
        ← Назад у Dashboard
      </Link>
    </div>
  );
}
