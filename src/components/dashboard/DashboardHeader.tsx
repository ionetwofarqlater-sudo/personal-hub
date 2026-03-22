"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { LogOut, Zap } from "lucide-react";
import WeatherWidget from "./WeatherWidget";
import type { User } from "@supabase/supabase-js";
import { readSettings, SETTINGS_EVENT_NAME } from "@/lib/settings";

export default function DashboardHeader({ user }: { user: User | null }) {
  const [time, setTime] = useState("");
  const [date, setDate] = useState("");
  const router = useRouter();
  const supabase = createClient();

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

  async function handleLogout() {
    if (!supabase) {
      router.push("/login");
      return;
    }
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  const avatar = user?.user_metadata?.avatar_url;
  const name = user?.user_metadata?.full_name || user?.email?.split("@")[0] || "Guest";
  const initials = name.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-gray-950/80 backdrop-blur-xl border-b border-gray-800/60">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-gradient-to-br from-violet-500 to-blue-500 rounded-lg flex items-center justify-center shadow-md shadow-violet-500/20">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <span className="font-semibold text-white hidden sm:block">Personal Hub</span>
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
          <WeatherWidget />

          <div className="hidden sm:flex flex-col items-end">
            <span className="text-white font-mono font-bold text-sm leading-none">{time}</span>
            <span className="text-gray-400 text-xs mt-0.5 capitalize">{date}</span>
          </div>
          <div className="sm:hidden text-white font-mono font-bold text-sm">{time}</div>

          <div className="flex items-center gap-2 pl-2 sm:pl-4 border-l border-gray-800">
            {avatar ? (
              <Image src={avatar} alt={name} width={32} height={32} className="w-8 h-8 rounded-full ring-2 ring-gray-700" />
            ) : (
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-blue-500 flex items-center justify-center text-xs font-bold text-white ring-2 ring-gray-700">
                {initials}
              </div>
            )}
            <span className="text-gray-300 text-sm hidden md:block">{name}</span>
            {user ? (
              <button onClick={handleLogout} className="p-1.5 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-400/10 transition-all" title="Вийти">
                <LogOut className="w-4 h-4" />
              </button>
            ) : null}
          </div>
        </div>
      </div>
    </header>
  );
}
