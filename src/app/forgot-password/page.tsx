"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowLeft, Mail, Send, Zap } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [codeSent, setCodeSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const supabase = createClient();
  const authEnabled = !!supabase;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!supabase) {
      setError("Налаштуй Supabase у `.env.local`, щоб відновити пароль.");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    const rateResponse = await fetch("/api/auth/rate/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    if (!rateResponse.ok) {
      const payload = (await rateResponse.json().catch(() => ({}))) as { error?: string };
      setError(payload.error || "Забагато запитів. Спробуй пізніше.");
      setLoading(false);
      return;
    }

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${location.origin}/update-password`
    });

    if (error) {
      setError(error.message);
    } else {
      setCodeSent(true);
      setSuccess("Код для відновлення надіслано. Введи його нижче.");
    }

    setLoading(false);
  }

  async function handleVerifyCodeAndUpdatePassword(e: React.FormEvent) {
    e.preventDefault();

    if (!supabase) {
      setError("Налаштуй Supabase у `.env.local`, щоб змінити пароль.");
      return;
    }

    if (!email.trim() || !code.trim()) {
      setError("Вкажи email і код з листа.");
      return;
    }

    if (newPassword.length < 6) {
      setError("Пароль має містити мінімум 6 символів.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Паролі не співпадають.");
      return;
    }

    setVerifying(true);
    setError(null);
    setSuccess(null);

    const { error: verifyError } = await supabase.auth.verifyOtp({
      email: email.trim(),
      token: code.trim(),
      type: "recovery",
    });

    if (verifyError) {
      setError(verifyError.message);
      setVerifying(false);
      return;
    }

    const { error: updateError } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (updateError) {
      setError(updateError.message);
      setVerifying(false);
      return;
    }

    setSuccess("Пароль оновлено. Тепер увійди з новим паролем.");
    setCode("");
    setNewPassword("");
    setConfirmPassword("");
    setVerifying(false);
  }

  async function handleResendCode() {
    if (!email.trim()) {
      setError("Спочатку вкажи email.");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    const response = await fetch("/api/auth/resend-confirmation", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: email.trim(),
        origin: location.origin,
        type: "recovery",
      }),
    });

    const payload = (await response.json().catch(() => ({}))) as { error?: string };
    if (!response.ok) {
      setError(payload.error || "Не вдалося повторно надіслати код.");
    } else {
      setSuccess("Код для відновлення повторно надіслано.");
    }

    setLoading(false);
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
              <h1 className="text-xl font-bold text-white">Відновлення пароля</h1>
              <p className="text-xs text-gray-400">Personal Hub</p>
            </div>
          </div>

          <p className="text-gray-400 text-sm mb-6">Введи email, і ми надішлемо код для скидання пароля.</p>

          {error && <div className="bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl px-4 py-3 text-sm mb-4">{error}</div>}
          {success && <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 rounded-xl px-4 py-3 text-sm mb-4">{success}</div>}

          {!authEnabled && (
            <div className="bg-amber-500/10 border border-amber-500/30 text-amber-300 rounded-xl px-4 py-3 text-sm mb-4">
              Supabase не налаштований. Додай валідні `NEXT_PUBLIC_SUPABASE_URL` і `NEXT_PUBLIC_SUPABASE_ANON_KEY` у `.env.local`.
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="email@example.com"
                required
                className="w-full bg-gray-800/50 border border-gray-700 focus:border-violet-500 text-white placeholder-gray-500 rounded-xl pl-10 pr-4 py-3 text-sm outline-none transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={loading || !authEnabled}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-500 hover:to-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl px-4 py-3 font-medium transition-all duration-200 shadow-lg shadow-violet-500/20"
            >
              <Send className="w-4 h-4" />
              {loading ? "Надсилаємо..." : "Надіслати код"}
            </button>
          </form>

          {codeSent && (
            <form onSubmit={handleVerifyCodeAndUpdatePassword} className="space-y-4 mt-6 border-t border-gray-800 pt-5">
              <p className="text-sm text-blue-200">Введи код з email і встанови новий пароль.</p>

              <input
                type="text"
                value={code}
                onChange={(event) => setCode(event.target.value.replace(/\s+/g, ""))}
                placeholder="Код з листа"
                required
                className="w-full bg-gray-800/50 border border-gray-700 focus:border-violet-500 text-white placeholder-gray-500 rounded-xl px-3 py-3 text-sm outline-none transition-colors"
              />

              <input
                type="password"
                value={newPassword}
                onChange={(event) => setNewPassword(event.target.value)}
                placeholder="Новий пароль"
                minLength={6}
                required
                className="w-full bg-gray-800/50 border border-gray-700 focus:border-violet-500 text-white placeholder-gray-500 rounded-xl px-3 py-3 text-sm outline-none transition-colors"
              />

              <input
                type="password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                placeholder="Підтверди новий пароль"
                minLength={6}
                required
                className="w-full bg-gray-800/50 border border-gray-700 focus:border-violet-500 text-white placeholder-gray-500 rounded-xl px-3 py-3 text-sm outline-none transition-colors"
              />

              <button
                type="submit"
                disabled={verifying || !authEnabled}
                className="w-full flex items-center justify-center gap-2 bg-gray-800 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl px-4 py-3 font-medium transition-all duration-200"
              >
                {verifying ? "Перевіряємо..." : "Підтвердити код і змінити пароль"}
              </button>

              <button
                type="button"
                onClick={handleResendCode}
                disabled={loading || !authEnabled}
                className="w-full flex items-center justify-center gap-2 bg-transparent border border-gray-700 hover:border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed text-gray-200 rounded-xl px-4 py-3 font-medium transition-all duration-200"
              >
                {loading ? "Надсилаємо..." : "Надіслати код ще раз"}
              </button>
            </form>
          )}

          <Link href="/login" className="mt-5 inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Назад до входу
          </Link>
        </div>
      </div>
    </div>
  );
}
