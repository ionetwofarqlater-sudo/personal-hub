"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Mail, Lock, LogIn, Eye, EyeOff, Zap } from "lucide-react";

export default function LoginPage() {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    if (mode === "signup") {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase(), password })
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? "Помилка реєстрації.");
        setLoading(false);
        return;
      }
      setSuccess("Акаунт створено! Входимо...");
    }

    const result = await signIn("credentials", {
      email: email.trim().toLowerCase(),
      password,
      redirect: false
    });

    if (result?.error) {
      setError("Невірний email або пароль.");
      setLoading(false);
      return;
    }

    router.replace("/dashboard");
  }

  return (
    <div className="min-h-dvh bg-gray-950 flex items-center justify-center p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-violet-600/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md animate-slide-up">
        <div className="bg-gray-900/80 backdrop-blur-xl border border-gray-800 rounded-2xl p-8 shadow-2xl">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-blue-500 rounded-xl flex items-center justify-center shadow-lg shadow-violet-500/30">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Personal Hub</h1>
              <p className="text-xs text-gray-400">Твій цифровий простір</p>
            </div>
          </div>

          <h2 className="text-2xl font-semibold text-white mb-1">
            {mode === "signin" ? "З поверненням 👋" : "Реєстрація"}
          </h2>
          <p className="text-gray-400 text-sm mb-6">
            {mode === "signin" ? "Увійди у свій акаунт" : "Створи новий акаунт"}
          </p>

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl px-4 py-3 text-sm mb-4">
              {error}
            </div>
          )}
          {success && (
            <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 rounded-xl px-4 py-3 text-sm mb-4">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email@example.com"
                required
                className="w-full bg-gray-800/50 border border-gray-700 focus:border-violet-500 text-white placeholder-gray-500 rounded-xl pl-10 pr-4 py-3 text-base outline-none transition-colors"
              />
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type={showPass ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Пароль (мін. 8 символів)"
                required
                minLength={8}
                className="w-full bg-gray-800/50 border border-gray-700 focus:border-violet-500 text-white placeholder-gray-500 rounded-xl pl-10 pr-10 py-3 text-base outline-none transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
              >
                {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-500 hover:to-blue-500 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer text-white rounded-xl px-4 py-3 font-medium transition-all duration-200 shadow-lg shadow-violet-500/20"
            >
              <LogIn className="w-4 h-4" />
              {loading ? "Завантаження..." : mode === "signin" ? "Увійти" : "Зареєструватися"}
            </button>
          </form>

          <p className="text-center text-gray-500 text-sm mt-4">
            {mode === "signin" ? "Немає акаунту? " : "Вже є акаунт? "}
            <button
              onClick={() => {
                setMode(mode === "signin" ? "signup" : "signin");
                setError(null);
                setSuccess(null);
              }}
              className="text-violet-400 hover:text-violet-300 font-medium transition-colors cursor-pointer"
            >
              {mode === "signin" ? "Зареєструватися" : "Увійти"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
