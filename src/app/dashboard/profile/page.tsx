"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, KeyRound, LogOut, Save, ShieldCheck, UserCircle2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type SessionInfo = {
  id: string;
  createdAt: string;
  expiresAt: string;
  userAgent: string;
  ip: string;
};

export default function ProfilePage() {
  const supabase = createClient();
  const authEnabled = !!supabase;

  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [timezone, setTimezone] = useState("UTC");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [logoutAllLoading, setLogoutAllLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [sessions, setSessions] = useState<SessionInfo[]>([]);

  useEffect(() => {
    let active = true;

    async function loadProfile() {
      if (!supabase) {
        if (active) setLoadingProfile(false);
        return;
      }

      const [{ data: userData }, { data: sessionData }] = await Promise.all([
        supabase.auth.getUser(),
        supabase.auth.getSession(),
      ]);

      const user = userData.user;
      const session = sessionData.session;

      if (!active) return;

      if (user) {
        setEmail(user.email || "");
        setFullName((user.user_metadata?.full_name as string) || "");
        setAvatarUrl((user.user_metadata?.avatar_url as string) || "");
        setTimezone((user.user_metadata?.timezone as string) || Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC");
      }

      const sessionItems: SessionInfo[] = [];

      if (session) {
        sessionItems.push({
          id: "current-session",
          createdAt: new Date(session.expires_at ? (session.expires_at - 3600) * 1000 : Date.now()).toISOString(),
          expiresAt: new Date((session.expires_at || Math.floor(Date.now() / 1000)) * 1000).toISOString(),
          userAgent: typeof navigator !== "undefined" ? navigator.userAgent : "Unknown",
          ip: "Current device",
        });
      }

      if (user?.last_sign_in_at) {
        sessionItems.push({
          id: "last-sign-in",
          createdAt: user.last_sign_in_at,
          expiresAt: user.last_sign_in_at,
          userAgent: "Last sign-in event",
          ip: "Supabase Auth",
        });
      }

      setSessions(sessionItems);
      setLoadingProfile(false);
    }

    loadProfile();

    return () => {
      active = false;
    };
  }, [supabase]);

  const prettyTimezone = useMemo(() => timezone || "UTC", [timezone]);

  async function handleSaveProfile() {
    if (!supabase) {
      setError("Supabase не налаштований.");
      return;
    }

    setSavingProfile(true);
    setError(null);
    setSuccess(null);

    const { error: updateError } = await supabase.auth.updateUser({
      data: {
        full_name: fullName.trim(),
        avatar_url: avatarUrl.trim(),
        timezone: prettyTimezone,
      },
    });

    if (updateError) {
      setError(updateError.message);
    } else {
      setSuccess("Профіль оновлено.");
    }

    setSavingProfile(false);
  }

  async function handleChangePassword() {
    if (!supabase) {
      setError("Supabase не налаштований.");
      return;
    }

    if (newPassword.length < 8) {
      setError("Новий пароль має містити мінімум 8 символів.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Паролі не співпадають.");
      return;
    }

    setSavingPassword(true);
    setError(null);
    setSuccess(null);

    const { error: updateError } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (updateError) {
      setError(updateError.message);
    } else {
      setSuccess("Пароль змінено.");
      setNewPassword("");
      setConfirmPassword("");
    }

    setSavingPassword(false);
  }

  async function handleLogoutAllSessions() {
    if (!supabase) {
      setError("Supabase не налаштований.");
      return;
    }

    setLogoutAllLoading(true);
    setError(null);
    setSuccess(null);

    const { error: signOutError } = await supabase.auth.signOut({ scope: "global" });

    if (signOutError) {
      setError(signOutError.message);
      setLogoutAllLoading(false);
      return;
    }

    setSuccess("Виконано logout з усіх сесій.");
    window.location.href = "/login";
  }

  return (
    <div className="animate-fade-in space-y-6">
      <Link href="/dashboard" className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm">
        <ArrowLeft className="w-4 h-4" /> Назад
      </Link>

      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Профіль і акаунт</h1>
        <p className="text-gray-400">Профіль, безпека та активні сесії</p>
      </div>

      {error && <div className="bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl px-4 py-3 text-sm">{error}</div>}
      {success && <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 rounded-xl px-4 py-3 text-sm">{success}</div>}

      {!authEnabled && (
        <div className="bg-amber-500/10 border border-amber-500/30 text-amber-300 rounded-xl px-4 py-3 text-sm">
          Supabase не налаштований. Додай валідні `NEXT_PUBLIC_SUPABASE_URL` і `NEXT_PUBLIC_SUPABASE_ANON_KEY` у `.env.local`.
        </div>
      )}

      <section className="bg-gray-900/60 border border-gray-800 rounded-2xl p-6 space-y-5">
        <div className="flex items-center gap-2 text-white font-semibold">
          <UserCircle2 className="w-5 h-5 text-violet-300" />
          Профіль
        </div>

        {loadingProfile ? (
          <p className="text-sm text-gray-400">Завантаження профілю...</p>
        ) : (
          <>
            <div className="grid sm:grid-cols-2 gap-4">
              <label className="space-y-2">
                <span className="text-sm text-gray-300">Email</span>
                <input value={email} disabled className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2.5 text-sm text-gray-400" />
              </label>

              <label className="space-y-2">
                <span className="text-sm text-gray-300">Ім&apos;я</span>
                <input
                  value={fullName}
                  onChange={(event) => setFullName(event.target.value)}
                  placeholder="Твоє ім&apos;я"
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2.5 text-sm text-white placeholder-gray-500 outline-none focus:border-violet-500"
                />
              </label>

              <label className="space-y-2 sm:col-span-2">
                <span className="text-sm text-gray-300">Avatar URL</span>
                <input
                  value={avatarUrl}
                  onChange={(event) => setAvatarUrl(event.target.value)}
                  placeholder="https://..."
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2.5 text-sm text-white placeholder-gray-500 outline-none focus:border-violet-500"
                />
              </label>

              <label className="space-y-2">
                <span className="text-sm text-gray-300">Timezone</span>
                <input
                  value={timezone}
                  onChange={(event) => setTimezone(event.target.value)}
                  placeholder="Europe/Kyiv"
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2.5 text-sm text-white placeholder-gray-500 outline-none focus:border-violet-500"
                />
              </label>
            </div>

            <button
              type="button"
              onClick={handleSaveProfile}
              disabled={savingProfile || !authEnabled}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-500 hover:to-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl px-4 py-2.5 text-sm font-medium"
            >
              <Save className="w-4 h-4" />
              {savingProfile ? "Зберігаємо..." : "Зберегти профіль"}
            </button>
          </>
        )}
      </section>

      <section className="bg-gray-900/60 border border-gray-800 rounded-2xl p-6 space-y-5">
        <div className="flex items-center gap-2 text-white font-semibold">
          <ShieldCheck className="w-5 h-5 text-blue-300" />
          Безпека акаунту
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <label className="space-y-2">
            <span className="text-sm text-gray-300">Новий пароль</span>
            <input
              type="password"
              minLength={8}
              value={newPassword}
              onChange={(event) => setNewPassword(event.target.value)}
              placeholder="Мінімум 8 символів"
              className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2.5 text-sm text-white placeholder-gray-500 outline-none focus:border-violet-500"
            />
          </label>

          <label className="space-y-2">
            <span className="text-sm text-gray-300">Підтверди пароль</span>
            <input
              type="password"
              minLength={8}
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              placeholder="Повтори новий пароль"
              className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2.5 text-sm text-white placeholder-gray-500 outline-none focus:border-violet-500"
            />
          </label>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={handleChangePassword}
            disabled={savingPassword || !authEnabled}
            className="inline-flex items-center gap-2 bg-gray-800 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed text-gray-100 rounded-xl px-4 py-2.5 text-sm font-medium"
          >
            <KeyRound className="w-4 h-4" />
            {savingPassword ? "Оновлюємо..." : "Змінити пароль"}
          </button>

          <button
            type="button"
            onClick={handleLogoutAllSessions}
            disabled={logoutAllLoading || !authEnabled}
            className="inline-flex items-center gap-2 bg-red-500/20 hover:bg-red-500/30 disabled:opacity-50 disabled:cursor-not-allowed text-red-200 rounded-xl px-4 py-2.5 text-sm font-medium border border-red-500/30"
          >
            <LogOut className="w-4 h-4" />
            {logoutAllLoading ? "Виконуємо..." : "Logout з усіх сесій"}
          </button>
        </div>
      </section>

      <section className="bg-gray-900/60 border border-gray-800 rounded-2xl p-6 space-y-4">
        <h2 className="text-white font-semibold">Активні сесії</h2>
        {sessions.length === 0 ? (
          <p className="text-sm text-gray-400">Немає даних про сесії.</p>
        ) : (
          <div className="space-y-3">
            {sessions.map((session) => (
              <div key={session.id} className="rounded-xl border border-gray-700 bg-gray-800/50 px-4 py-3">
                <p className="text-sm text-gray-200">{session.userAgent}</p>
                <p className="text-xs text-gray-400 mt-1">Початок: {new Date(session.createdAt).toLocaleString()}</p>
                <p className="text-xs text-gray-400">Закінчення: {new Date(session.expiresAt).toLocaleString()}</p>
                <p className="text-xs text-gray-500 mt-1">{session.ip}</p>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
