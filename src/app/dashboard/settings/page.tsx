"use client";
import { useEffect, useState } from "react";
import { ArrowLeft, RotateCcw, Save } from "lucide-react";
import Link from "next/link";
import { DEFAULT_SETTINGS, type AppLocale, type AppTheme, type TimeFormat, readSettings, saveSettings } from "@/lib/settings";
import { createClient } from "@/lib/supabase/client";

export default function SettingsPage() {
  const [theme, setTheme] = useState<AppTheme>(DEFAULT_SETTINGS.theme);
  const [locale, setLocale] = useState<AppLocale>(DEFAULT_SETTINGS.locale);
  const [weatherCity, setWeatherCity] = useState(DEFAULT_SETTINGS.weatherCity);
  const [timeFormat, setTimeFormat] = useState<TimeFormat>(DEFAULT_SETTINGS.timeFormat);
  const [saved, setSaved] = useState(false);
  const [mfaEnabled, setMfaEnabled] = useState(false);
  const [mfaLoading, setMfaLoading] = useState(false);
  const [mfaError, setMfaError] = useState<string | null>(null);
  const [mfaMessage, setMfaMessage] = useState<string | null>(null);
  const [totpFactorId, setTotpFactorId] = useState<string | null>(null);
  const [totpQrCode, setTotpQrCode] = useState<string | null>(null);
  const [totpCode, setTotpCode] = useState("");

  const supabase = createClient();
  const authEnabled = !!supabase;

  useEffect(() => {
    const settings = readSettings();
    setTheme(settings.theme);
    setLocale(settings.locale);
    setWeatherCity(settings.weatherCity);
    setTimeFormat(settings.timeFormat);
  }, []);

  useEffect(() => {
    let active = true;

    async function loadMfaState() {
      if (!supabase) return;

      const { data, error } = await supabase.auth.mfa.listFactors();
      if (!active) return;
      if (error) {
        setMfaError(error.message);
        return;
      }

      const factors = (data?.totp || []) as Array<{ id: string; status: string }>;
      const verified = factors.find((factor) => factor.status === "verified");
      const unverified = factors.find((factor) => factor.status !== "verified");

      setMfaEnabled(!!verified);
      setTotpFactorId(verified?.id || unverified?.id || null);
    }

    loadMfaState();

    return () => {
      active = false;
    };
  }, [supabase]);

  function handleSave() {
    saveSettings({
      theme,
      locale,
      weatherCity: weatherCity.trim() || DEFAULT_SETTINGS.weatherCity,
      timeFormat
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  }

  function handleReset() {
    setTheme(DEFAULT_SETTINGS.theme);
    setLocale(DEFAULT_SETTINGS.locale);
    setWeatherCity(DEFAULT_SETTINGS.weatherCity);
    setTimeFormat(DEFAULT_SETTINGS.timeFormat);
    saveSettings(DEFAULT_SETTINGS);
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  }

  async function handleEnableMfa() {
    if (!supabase) {
      setMfaError("Supabase не налаштований.");
      return;
    }

    setMfaLoading(true);
    setMfaError(null);
    setMfaMessage(null);

    const { data, error } = await supabase.auth.mfa.enroll({
      factorType: "totp",
      friendlyName: "Personal Hub TOTP",
    });

    if (error) {
      setMfaError(error.message);
      setMfaLoading(false);
      return;
    }

    setTotpFactorId(data?.id || null);
    setTotpQrCode((data?.totp as { qr_code?: string } | undefined)?.qr_code || null);
    setMfaMessage("Відскануй QR у Google Authenticator/Authy і введи код підтвердження.");
    setMfaLoading(false);
  }

  async function handleVerifyMfa() {
    if (!supabase || !totpFactorId) {
      setMfaError("Немає активного TOTP-фактора.");
      return;
    }

    if (!totpCode.trim()) {
      setMfaError("Введи код з Authenticator.");
      return;
    }

    setMfaLoading(true);
    setMfaError(null);
    setMfaMessage(null);

    const { data: challengeData, error: challengeError } = await supabase.auth.mfa.challenge({
      factorId: totpFactorId,
    });

    if (challengeError) {
      setMfaError(challengeError.message);
      setMfaLoading(false);
      return;
    }

    const { error: verifyError } = await supabase.auth.mfa.verify({
      factorId: totpFactorId,
      challengeId: challengeData.id,
      code: totpCode.trim(),
    });

    if (verifyError) {
      setMfaError(verifyError.message);
      setMfaLoading(false);
      return;
    }

    setMfaEnabled(true);
    setTotpCode("");
    setTotpQrCode(null);
    setMfaMessage("MFA (TOTP) успішно увімкнено.");
    setMfaLoading(false);
  }

  async function handleDisableMfa() {
    if (!supabase || !totpFactorId) {
      setMfaError("Немає TOTP-фактора для вимкнення.");
      return;
    }

    setMfaLoading(true);
    setMfaError(null);
    setMfaMessage(null);

    const { error } = await supabase.auth.mfa.unenroll({ factorId: totpFactorId });
    if (error) {
      setMfaError(error.message);
      setMfaLoading(false);
      return;
    }

    setMfaEnabled(false);
    setTotpFactorId(null);
    setTotpQrCode(null);
    setTotpCode("");
    setMfaMessage("MFA (TOTP) вимкнено.");
    setMfaLoading(false);
  }

  return (
    <div className="animate-fade-in">
      <Link href="/dashboard" className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors text-sm">
        <ArrowLeft className="w-4 h-4" /> Назад
      </Link>
      <h1 className="text-3xl font-bold text-white mb-2">Налаштування</h1>
      <p className="text-gray-400 mb-8">Тема, мова, погода та формат часу</p>

      <div className="bg-gray-900/60 border border-gray-800 rounded-2xl p-6 space-y-6">
        <div className="grid sm:grid-cols-2 gap-5">
          <label className="space-y-2">
            <span className="text-sm text-gray-300">Тема</span>
            <select
              value={theme}
              onChange={event => setTheme(event.target.value as AppTheme)}
              className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2.5 text-sm text-white outline-none focus:border-violet-500"
            >
              <option value="dark">Dark</option>
              <option value="amoled">AMOLED</option>
            </select>
          </label>

          <label className="space-y-2">
            <span className="text-sm text-gray-300">Мова / Locale</span>
            <select
              value={locale}
              onChange={event => setLocale(event.target.value as AppLocale)}
              className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2.5 text-sm text-white outline-none focus:border-violet-500"
            >
              <option value="uk-UA">Українська (uk-UA)</option>
              <option value="en-US">English (en-US)</option>
            </select>
          </label>

          <label className="space-y-2">
            <span className="text-sm text-gray-300">Місто для погоди (OpenWeather)</span>
            <input
              value={weatherCity}
              onChange={event => setWeatherCity(event.target.value)}
              placeholder="Наприклад: Yarmolyntsi"
              className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2.5 text-sm text-white placeholder-gray-500 outline-none focus:border-violet-500"
            />
          </label>

          <label className="space-y-2">
            <span className="text-sm text-gray-300">Формат часу</span>
            <select
              value={timeFormat}
              onChange={event => setTimeFormat(event.target.value as TimeFormat)}
              className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2.5 text-sm text-white outline-none focus:border-violet-500"
            >
              <option value="24h">24-годинний</option>
              <option value="12h">12-годинний</option>
            </select>
          </label>
        </div>

        <div className="flex items-center gap-3 pt-2">
          <button
            onClick={handleSave}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-500 hover:to-blue-500 text-white rounded-xl px-4 py-2.5 text-sm font-medium transition-colors"
          >
            <Save className="w-4 h-4" /> Зберегти
          </button>

          <button
            onClick={handleReset}
            className="inline-flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-gray-200 rounded-xl px-4 py-2.5 text-sm font-medium transition-colors"
          >
            <RotateCcw className="w-4 h-4" /> Скинути
          </button>

          {saved && <span className="text-emerald-400 text-sm">Збережено ✓</span>}
        </div>
      </div>

      <div className="bg-gray-900/60 border border-gray-800 rounded-2xl p-6 space-y-4 mt-6">
        <h2 className="text-xl font-semibold text-white">MFA (TOTP)</h2>
        <p className="text-sm text-gray-400">
          Додатковий захист входу через застосунок-автентифікатор.
        </p>

        {!authEnabled && (
          <div className="bg-amber-500/10 border border-amber-500/30 text-amber-300 rounded-xl px-4 py-3 text-sm">
            Supabase не налаштований. Увімкнути MFA неможливо.
          </div>
        )}

        {mfaError && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl px-4 py-3 text-sm">
            {mfaError}
          </div>
        )}

        {mfaMessage && (
          <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 rounded-xl px-4 py-3 text-sm">
            {mfaMessage}
          </div>
        )}

        <p className="text-sm text-gray-300">
          Статус: {mfaEnabled ? "Увімкнено" : "Вимкнено"}
        </p>

        {!mfaEnabled ? (
          <button
            type="button"
            onClick={handleEnableMfa}
            disabled={mfaLoading || !authEnabled}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-500 hover:to-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl px-4 py-2.5 text-sm font-medium"
          >
            {mfaLoading ? "Готуємо..." : "Увімкнути MFA"}
          </button>
        ) : (
          <button
            type="button"
            onClick={handleDisableMfa}
            disabled={mfaLoading || !authEnabled}
            className="inline-flex items-center gap-2 bg-red-500/20 hover:bg-red-500/30 disabled:opacity-50 disabled:cursor-not-allowed text-red-200 rounded-xl px-4 py-2.5 text-sm font-medium border border-red-500/30"
          >
            {mfaLoading ? "Оновлюємо..." : "Вимкнути MFA"}
          </button>
        )}

        {totpQrCode && !mfaEnabled && (
          <div className="space-y-3 pt-2">
            <div className="bg-white p-3 rounded-xl inline-block" dangerouslySetInnerHTML={{ __html: totpQrCode }} />
            <input
              value={totpCode}
              onChange={(event) => setTotpCode(event.target.value)}
              placeholder="6-значний код"
              className="w-full max-w-xs bg-gray-800 border border-gray-700 rounded-xl px-3 py-2.5 text-sm text-white placeholder-gray-500 outline-none focus:border-violet-500"
            />
            <button
              type="button"
              onClick={handleVerifyMfa}
              disabled={mfaLoading || !authEnabled}
              className="inline-flex items-center gap-2 bg-gray-800 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed text-gray-100 rounded-xl px-4 py-2.5 text-sm font-medium"
            >
              {mfaLoading ? "Перевіряємо..." : "Підтвердити код"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
