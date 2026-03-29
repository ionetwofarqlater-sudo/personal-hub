"use client";
import Link from "next/link";
import { ArrowLeft, Zap } from "lucide-react";

export default function ForgotPasswordPage() {
  return (
    <div className="min-h-dvh bg-gray-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-gray-900/80 border border-gray-800 rounded-2xl p-8">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-blue-500 rounded-xl flex items-center justify-center">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-xl font-bold text-white">Personal Hub</h1>
        </div>
        <h2 className="text-2xl font-semibold text-white mb-2">Відновлення паролю</h2>
        <p className="text-gray-400 text-sm mb-6">
          Зверніться до адміністратора або змініть пароль у розділі{" "}
          <Link href="/dashboard/profile" className="text-violet-400 hover:text-violet-300">
            Профіль
          </Link>
          .
        </p>
        <Link
          href="/login"
          className="inline-flex items-center gap-2 text-gray-400 hover:text-white text-sm transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Назад до входу
        </Link>
      </div>
    </div>
  );
}
