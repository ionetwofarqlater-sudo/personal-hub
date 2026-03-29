import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Shield, Users, ScrollText } from "lucide-react";

export default async function AdminDashboardPage() {
  const session = await auth();
  if (!session) redirect("/login");
  if (session.user.role !== "admin") redirect("/403");

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
          <p className="text-sm text-gray-400 mt-1">
            Поточна роль: <span className="text-violet-300 font-medium">{session.user.role}</span>
          </p>
        </div>

        <div className="rounded-2xl border border-gray-800 bg-gray-900/60 p-5">
          <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-300 flex items-center justify-center mb-3">
            <Users className="w-5 h-5" />
          </div>
          <h2 className="text-white font-semibold">Користувачі</h2>
          <p className="text-sm text-gray-400 mt-1">
            Базові admin-в&apos;ю підключимо наступним кроком.
          </p>
        </div>

        <div className="rounded-2xl border border-gray-800 bg-gray-900/60 p-5">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center mb-3">
            <ScrollText className="w-5 h-5" />
          </div>
          <h2 className="text-white font-semibold">Аудит дій</h2>
          <p className="text-sm text-gray-400 mt-1">
            Логи admin_audit_logs винесемо в окрему таблицю.
          </p>
        </div>
      </section>

      <Link
        href="/dashboard"
        className="inline-flex text-sm text-gray-400 hover:text-white transition-colors"
      >
        ← Назад у Dashboard
      </Link>
    </div>
  );
}
