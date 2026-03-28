"use client";

import { useState, useEffect } from "react";
import { Zap } from "lucide-react";
import WeatherWidget from "./WeatherWidget";
import UserNav from "./UserNav";
import type { User } from "@supabase/supabase-js";
import { readSettings, SETTINGS_EVENT_NAME } from "@/lib/settings";
import { createClient } from "@/lib/supabase/client";

const SHA = process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA;
const DEPLOY_URL = process.env.NEXT_PUBLIC_VERCEL_URL;

function BuildBadge() {
  if (!SHA) return null;
  const short = SHA.slice(0, 7);
  const href = DEPLOY_URL ? `https://${DEPLOY_URL}` : undefined;
  const inner = (
    <span className="hidden sm:inline-flex items-center gap-1 font-mono text-[10px] text-gray-600 hover:text-gray-400 transition-colors leading-none mt-0.5">
      <span className="w-1.5 h-1.5 rounded-full bg-green-500/70 inline-block" />
      {short}
    </span>
  );
  return href ? <a href={href} target="_blank" rel="noopener noreferrer">{inner}</a> : inner;
}

export default function DashboardHeader({ user: initialUser, savedCount: initialSavedCount }: { user: User | null; savedCount: number }) {
  const [time, setTime] = useState("");
  const [date, setDate] = useState("");
  const [user, setUser] = useState<User | null>(initialUser);
  const [savedCount, setSavedCount] = useState(initialSavedCount);

  // Fallback: якщо серверний user не прийшов — читаємо сесію на клієнті
  useEffect(() => {
    if (initialUser) return;
    const supabase = createClient();
    if (!supabase) return;
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) setUser(data.user);
    });
    supabase
      .from('saved_items')
      .select('*', { count: 'exact', head: true })
      .is('deleted_at', null)
      .then(({ count }) => setSavedCount(count ?? 0));
  }, [initialUser]);

  useEffect(() => {
    let activeSettings = readSettings();

    function updateClock() {
      const now = new Date();
      setTime(
        now.toLocaleTimeString(activeSettings.locale, {
          hour: "2-digit",
          minute: "2-digit",
          hour12: activeSettings.timeFormat === "12h"
        })
      );
      setDate(
        now.toLocaleDateString(activeSettings.locale, {
          weekday: "short",
          day: "numeric",
          month: "short"
        })
      );
    }

    function onSettingsChanged() {
      activeSettings = readSettings();
      updateClock();
    }

    updateClock();
    const id = setInterval(updateClock, 1000);
    window.addEventListener(SETTINGS_EVENT_NAME, onSettingsChanged);
    window.addEventListener("storage", onSettingsChanged);

    return () => {
      clearInterval(id);
      window.removeEventListener(SETTINGS_EVENT_NAME, onSettingsChanged);
      window.removeEventListener("storage", onSettingsChanged);
    };
  }, []);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-gray-950/80 backdrop-blur-xl border-b border-gray-800/60">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-gradient-to-br from-violet-500 to-blue-500 rounded-lg flex items-center justify-center shadow-md shadow-violet-500/20">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="font-semibold text-white hidden sm:block leading-none">Personal Hub</span>
            <BuildBadge />
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
          <WeatherWidget />

          <div className="hidden sm:flex flex-col items-end">
            <span className="text-white font-mono font-bold text-sm leading-none">{time}</span>
            <span className="text-gray-400 text-xs mt-0.5 capitalize">{date}</span>
          </div>
          <div className="sm:hidden text-white font-mono font-bold text-sm">{time}</div>

          {user ? (
            <UserNav user={user} savedCount={savedCount} />
          ) : (
            <div className="flex items-center gap-2 pl-2 sm:pl-3 border-l border-gray-800">
              <div className="w-8 h-8 rounded-full bg-gray-700 animate-pulse" />
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
