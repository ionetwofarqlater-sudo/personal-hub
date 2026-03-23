import Link from "next/link";
import { ShieldAlert } from "lucide-react";

export default function ForbiddenPage() {
  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-gray-900/80 border border-gray-800 rounded-2xl p-8 text-center">
        <div className="w-12 h-12 mx-auto rounded-xl bg-red-500/20 text-red-300 flex items-center justify-center mb-4">
          <ShieldAlert className="w-6 h-6" />
        </div>
        <h1 className="text-2xl font-bold text-white mb-2">403 — Доступ заборонено</h1>
        <p className="text-gray-400 text-sm mb-6">
          У тебе немає прав для перегляду цієї сторінки.
        </p>

        <div className="flex items-center justify-center gap-3">
          <Link href="/dashboard" className="rounded-xl bg-gray-800 hover:bg-gray-700 text-white text-sm px-4 py-2.5 transition-colors">
            До Dashboard
          </Link>
          <Link href="/login" className="rounded-xl border border-gray-700 hover:border-gray-600 text-gray-200 text-sm px-4 py-2.5 transition-colors">
            До входу
          </Link>
        </div>
      </div>
    </div>
  );
}
