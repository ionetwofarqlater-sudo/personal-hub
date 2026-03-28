"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Mail, Lock, LogIn, Chrome, Eye, EyeOff, Zap, Github } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getSupabaseRateLimitHint, isSupabaseEmailRateLimitError } from "@/lib/auth/supabaseErrors";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [verifyingCode, setVerifyingCode] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [pendingVerificationEmail, setPendingVerificationEmail] = useState<string | null>(null);
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const supabase = createClient();
  const authEnabled = !!supabase;
  const router = useRouter();

  useEffect(() => {
    const hash = window.location.hash;
    const search = new URLSearchParams(window.location.search);

    const hashParams = new URLSearchParams(hash.startsWith("#") ? hash.slice(1) : hash);
    const hashType = hashParams.get("type");
    const searchType = search.get("type");
    const flowType = hashType || searchType;

    if (flowType === "recovery") {
      const hashSuffix = hash ? hash : "";
      router.replace(`/update-password${hashSuffix}`);
      return;
    }

    let active = true;

    async function checkSession() {
      if (!supabase) return;
      const { data } = await supabase.auth.getSession();
      if (active && data.session) {
        router.replace("/dashboard");
      }
    }

    checkSession();
    return () => {
      active = false;
    };
  }, [router, supabase]);

  async function checkRateLimit(endpoint: string, submittedEmail: string) {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: submittedEmail })
    });

    if (!response.ok) {
      const payload = (await response.json().catch(() => ({}))) as { error?: string };
      throw new Error(payload.error || "Тимчасово недоступно. Спробуй пізніше.");
    }
  }

  async function handleEmailAuth(e: React.FormEvent) {
    e.preventDefault();
    if (!supabase) {
      setError("Налаштуй Supabase у `.env.local`, щоб увійти.");
      return;
    }
    setLoading(true);
    setError(null);
    setSuccess(null);
    setPendingVerificationEmail(null);

    try {
      if (mode === "signin") {
        await checkRateLimit("/api/auth/rate/login", email);
      }
    } catch (rateLimitError) {
      setLoading(false);
      setError(rateLimitError instanceof Error ? rateLimitError.message : "Забагато спроб входу.");
      return;
    }

    const action =
      mode === "signin"
        ? supabase.auth.signInWithPassword({ email, password })
        : supabase.auth.signUp({
            email,
            password,
            options: { emailRedirectTo: `${location.origin}/auth/callback?next=/dashboard` }
          });
    const { data, error } = await action;
    if (error) {
      if (mode === "signup" && isSupabaseEmailRateLimitError(error.message)) {
        const normalizedEmail = email.trim();
        setPendingVerificationEmail(normalizedEmail);
        setSuccess(getSupabaseRateLimitHint());
        setLoading(false);
        return;
      }

      setError(error.message);
      if (mode === "signin" && /confirm|verified|email/i.test(error.message)) {
        setPendingVerificationEmail(email.trim());
      }
    } else if (mode === "signin") {
      window.location.href = "/dashboard";
    } else {
      const identities = data?.user?.identities;
      if (Array.isArray(identities) && identities.length === 0) {
        setError("Ця пошта вже зареєстрована. Увійди або віднови пароль.");
        setLoading(false);
        return;
      }

      const normalizedEmail = email.trim();
      setPendingVerificationEmail(normalizedEmail);
      setSuccess("Код підтвердження надіслано на email. Введи його нижче.");
    }
    setLoading(false);
  }

  async function handleVerifySignupCode() {
    if (!supabase) {
      setError("Налаштуй Supabase у `.env.local`, щоб підтвердити код.");
      return;
    }

    if (!pendingVerificationEmail?.trim()) {
      setError("Не знайдено email для підтвердження.");
      return;
    }

    if (!verificationCode.trim()) {
      setError("Введи код з листа.");
      return;
    }

    setVerifyingCode(true);
    setError(null);
    setSuccess(null);

    const { error: verifyError } = await supabase.auth.verifyOtp({
      email: pendingVerificationEmail.trim(),
      token: verificationCode.trim(),
      type: "signup"
    });

    if (verifyError) {
      setError(verifyError.message);
      setVerifyingCode(false);
      return;
    }

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: pendingVerificationEmail.trim(),
      password
    });

    if (signInError) {
      setSuccess("Код підтверджено. Тепер увійди в акаунт.");
      setMode("signin");
      setVerificationCode("");
      setVerifyingCode(false);
      return;
    }

    window.location.href = "/dashboard";
  }

  async function handleOAuth(provider: "google" | "github") {
    if (!supabase) {
      setError("Налаштуй Supabase у `.env.local`, щоб увійти через OAuth.");
      return;
    }
    await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: `${location.origin}/auth/callback` }
    });
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

          {!authEnabled && (
            <div className="bg-amber-500/10 border border-amber-500/30 text-amber-300 rounded-xl px-4 py-3 text-sm mb-4">
              Supabase не налаштований. Додай валідні `NEXT_PUBLIC_SUPABASE_URL` і
              `NEXT_PUBLIC_SUPABASE_ANON_KEY` у `.env.local`.
            </div>
          )}

          <button
            onClick={() => handleOAuth("google")}
            disabled={!authEnabled}
            className="w-full flex items-center justify-center gap-3 bg-white/5 hover:bg-white/10 active:scale-95 border border-gray-700 hover:border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer text-white rounded-xl px-4 py-3 font-medium transition-all duration-200 mb-3"
          >
            <Chrome className="w-5 h-5" />
            Увійти через Google
          </button>

          <button
            onClick={() => handleOAuth("github")}
            disabled={!authEnabled}
            className="w-full flex items-center justify-center gap-3 bg-white/5 hover:bg-white/10 active:scale-95 border border-gray-700 hover:border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer text-white rounded-xl px-4 py-3 font-medium transition-all duration-200 mb-4"
          >
            <Github className="w-5 h-5" />
            Увійти через GitHub
          </button>

          <div className="flex items-center gap-3 mb-4">
            <div className="flex-1 h-px bg-gray-800" />
            <span className="text-gray-500 text-xs">або</span>
            <div className="flex-1 h-px bg-gray-800" />
          </div>

          <form onSubmit={handleEmailAuth} className="space-y-4">
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
                placeholder="Пароль"
                required
                minLength={6}
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
              disabled={loading || !authEnabled}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-500 hover:to-blue-500 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer text-white rounded-xl px-4 py-3 font-medium transition-all duration-200 shadow-lg shadow-violet-500/20"
            >
              <LogIn className="w-4 h-4" />
              {loading ? "Завантаження..." : mode === "signin" ? "Увійти" : "Зареєструватися"}
            </button>

            {mode === "signin" && (
              <div className="text-right">
                <Link
                  href="/forgot-password"
                  className="text-xs text-gray-400 hover:text-violet-300 transition-colors"
                >
                  Забув(ла) пароль?
                </Link>
              </div>
            )}
          </form>

          {pendingVerificationEmail && (
            <div className="mt-4 bg-blue-500/10 border border-blue-500/30 text-blue-200 rounded-xl px-4 py-3 text-sm">
              <p className="mb-3">Підтвердження через код (OTP)</p>

              <div className="flex flex-col sm:flex-row gap-2 mb-2">
                <input
                  type="text"
                  inputMode="numeric"
                  value={verificationCode}
                  onChange={(event) => setVerificationCode(event.target.value.replace(/\s+/g, ""))}
                  placeholder="Введи код з email"
                  className="flex-1 bg-gray-900/70 border border-gray-700 focus:border-violet-500 text-white placeholder-gray-500 rounded-xl px-3 py-2 text-base outline-none transition-colors"
                />
                <button
                  type="button"
                  onClick={handleVerifySignupCode}
                  disabled={verifyingCode || !authEnabled}
                  className="bg-violet-600 hover:bg-violet-500 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer text-white rounded-xl px-4 py-2 text-sm font-medium transition-transform"
                >
                  {verifyingCode ? "Перевіряємо..." : "Підтвердити код"}
                </button>
              </div>

              <Link
                href={`/auth/verify-email?email=${encodeURIComponent(pendingVerificationEmail)}`}
                className="underline underline-offset-2 hover:text-blue-100"
              >
                Надіслати код ще раз
              </Link>
            </div>
          )}

          <p className="text-center text-gray-500 text-sm mt-4">
            {mode === "signin" ? "Немає акаунту? " : "Вже є акаунт? "}
            <button
              onClick={() => {
                setMode(mode === "signin" ? "signup" : "signin");
                setError(null);
                setSuccess(null);
                setPendingVerificationEmail(null);
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
