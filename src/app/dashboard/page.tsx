import AppGrid from "@/components/dashboard/AppGrid";
import Link from "next/link";
import { PlusSquare, Cloud, FileText, UserCircle2, Shield } from "lucide-react";

export default function DashboardPage() {
  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-1">Мій Хаб</h1>
        <p className="text-gray-400">Що робимо сьогодні?</p>
      </div>

      <section className="mb-8 bg-gray-900/60 border border-gray-800 rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <PlusSquare className="w-4 h-4 text-violet-400" />
          <h2 className="text-sm font-semibold text-gray-300 uppercase tracking-wider">Quick Actions</h2>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <Link
            href="/dashboard/notes"
            className="flex items-center gap-3 rounded-xl border border-gray-700 bg-gray-800/40 hover:bg-gray-800/70 px-4 py-3 transition-colors"
          >
            <div className="w-9 h-9 rounded-lg bg-amber-500/20 text-amber-300 flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <p className="text-white text-sm font-medium">Нова нотатка</p>
              <p className="text-gray-500 text-xs">Швидко додати думку або план</p>
            </div>
          </Link>

          <Link
            href="/dashboard/clouddrop"
            className="flex items-center gap-3 rounded-xl border border-gray-700 bg-gray-800/40 hover:bg-gray-800/70 px-4 py-3 transition-colors"
          >
            <div className="w-9 h-9 rounded-lg bg-blue-500/20 text-blue-300 flex items-center justify-center">
              <Cloud className="w-4 h-4" />
            </div>
            <div>
              <p className="text-white text-sm font-medium">Новий CloudDrop</p>
              <p className="text-gray-500 text-xs">Зберегти текст, лінк або фрагмент коду</p>
            </div>
          </Link>

          <Link
            href="/dashboard/profile"
            className="flex items-center gap-3 rounded-xl border border-gray-700 bg-gray-800/40 hover:bg-gray-800/70 px-4 py-3 transition-colors"
          >
            <div className="w-9 h-9 rounded-lg bg-violet-500/20 text-violet-300 flex items-center justify-center">
              <UserCircle2 className="w-4 h-4" />
            </div>
            <div>
              <p className="text-white text-sm font-medium">Профіль і безпека</p>
              <p className="text-gray-500 text-xs">Керувати акаунтом, паролем і сесіями</p>
            </div>
          </Link>

          <Link
            href="/dashboard/admin"
            className="flex items-center gap-3 rounded-xl border border-gray-700 bg-gray-800/40 hover:bg-gray-800/70 px-4 py-3 transition-colors"
          >
            <div className="w-9 h-9 rounded-lg bg-red-500/20 text-red-300 flex items-center justify-center">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <p className="text-white text-sm font-medium">Admin Dashboard</p>
              <p className="text-gray-500 text-xs">Доступно лише для користувачів з роллю admin</p>
            </div>
          </Link>
        </div>
      </section>

      <AppGrid />
    </div>
  );
}
