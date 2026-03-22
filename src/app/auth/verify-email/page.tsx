"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowLeft, MailCheck, RefreshCw, Zap } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function VerifyEmailPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const supabase = createClient();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const emailFromQuery = params.get("email");
    if (emailFromQuery) {
      setEmail(emailFromQuery);
    }
  }, []);

  async function handleResend() {
    if (!email.trim()) {
      setError("Вкажи email для повторної відправки.");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    const response = await fetch("/api/auth/resend-confirmation", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: email.trim(), origin: location.origin, type: "signup" }),
    });

    const payload = (await response.json().catch(() => ({}))) as { error?: string };

    if (!response.ok) {
      setError(payload.error || "Не вдалося повторно відправити лист.");
    } else {
      setSuccess("Лист підтвердження повторно надіслано. Перевір пошту.");
    }

    setLoading(false);
  }

  async function handleVerifyCode() {
    if (!supabase) {
      setError("Налаштуй Supabase у `.env.local`, щоб підтвердити код.");
      return;
    }

    if (!email.trim() || !code.trim()) {
      setError("Вкажи email і код з листа.");
      return;
    }

    setVerifying(true);
    setError(null);
    setSuccess(null);

    const { error: verifyError } = await supabase.auth.verifyOtp({
      email: email.trim(),
      token: code.trim(),
      type: "signup",
    });

    if (verifyError) {
      setError(verifyError.message);
      setVerifying(false);
      return;
    }

    setSuccess("Email успішно підтверджено. Тепер можеш увійти.");
    setCode("");
    setVerifying(false);
  }

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
      <div className="relative w-full max-w-md animate-slide-up">
        <div className="bg-gray-900/80 backdrop-blur-xl border border-gray-800 rounded-2xl p-8 shadow-2xl">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-blue-500 rounded-xl flex items-center justify-center shadow-lg shadow-violet-500/30">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Підтвердження email</h1>
              <p className="text-xs text-gray-400">Personal Hub</p>
            </div>
          </div>

          <div className="bg-blue-500/10 border border-blue-500/30 text-blue-200 rounded-xl px-4 py-3 text-sm mb-4 flex items-start gap-2">
            <MailCheck className="w-4 h-4 mt-0.5" />
            <p>
              Ми надіслали лист з кодом підтвердження. Введи код нижче, щоб активувати акаунт.
            </p>
          </div>

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

          <div className="space-y-3">
            <label className="space-y-2 block">
              <span className="text-sm text-gray-300">Email</span>
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="email@example.com"
                className="w-full bg-gray-800/50 border border-gray-700 focus:border-violet-500 text-white placeholder-gray-500 rounded-xl px-3 py-2.5 text-sm outline-none transition-colors"
              />
            </label>

            <label className="space-y-2 block">
              <span className="text-sm text-gray-300">Код підтвердження</span>
              <input
                type="text"
                value={code}
                onChange={(event) => setCode(event.target.value.replace(/\s+/g, ""))}
                placeholder="Введи код з email"
                className="w-full bg-gray-800/50 border border-gray-700 focus:border-violet-500 text-white placeholder-gray-500 rounded-xl px-3 py-2.5 text-sm outline-none transition-colors"
              />
            </label>

            <button
              type="button"
              onClick={handleVerifyCode}
              disabled={verifying}
              className="w-full inline-flex items-center justify-center gap-2 bg-gray-800 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl px-4 py-2.5 text-sm font-medium transition-colors"
            >
              {verifying ? "Перевіряємо..." : "Підтвердити код"}
            </button>

            <button
              type="button"
              onClick={handleResend}
              disabled={loading}
              className="w-full inline-flex items-center justify-center gap-2 bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-500 hover:to-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl px-4 py-2.5 text-sm font-medium transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              {loading ? "Надсилаємо..." : "Надіслати лист ще раз"}
            </button>
          </div>

          <Link href="/login" className="mt-5 inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Назад до входу
          </Link>
        </div>
      </div>
    </div>
  );
}
