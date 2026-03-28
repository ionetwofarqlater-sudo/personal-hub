"use client";

import { useEffect, useState } from "react";
import { Cloud, Sun, CloudRain, CloudSnow, Wind, Loader2 } from "lucide-react";
import { readSettings, SETTINGS_EVENT_NAME } from "@/lib/settings";

type WeatherData = {
  temp: number;
  description: string;
  icon: string;
  city: string;
};

function WeatherIcon({ icon, className }: { icon: string; className?: string }) {
  const cls = className || "w-4 h-4";
  if (icon.includes("01")) return <Sun className={`${cls} text-yellow-400`} />;
  if (icon.includes("09") || icon.includes("10"))
    return <CloudRain className={`${cls} text-blue-400`} />;
  if (icon.includes("13")) return <CloudSnow className={`${cls} text-sky-300`} />;
  if (icon.includes("50")) return <Wind className={`${cls} text-gray-400`} />;
  return <Cloud className={`${cls} text-gray-300`} />;
}

export default function WeatherWidget() {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [city, setCity] = useState(readSettings().weatherCity);
  const [locale, setLocale] = useState(readSettings().locale);

  useEffect(() => {
    async function fetchWeather() {
      setLoading(true);
      setError(false);

      const rawKey = process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY ?? "";
      const apiKey = rawKey.replace(/[\r\n]/g, "").trim();
      const language = locale.startsWith("uk") ? "uk" : "en";

      console.debug(
        "[WeatherWidget] rawKey length:",
        rawKey.length,
        "| codes:",
        Array.from(rawKey).map((c) => c.charCodeAt(0))
      );
      console.debug(
        "[WeatherWidget] apiKey after clean:",
        JSON.stringify(apiKey),
        "| length:",
        apiKey.length
      );

      if (!apiKey || apiKey === "your_openweathermap_api_key") {
        setWeather({
          temp: 18,
          description: language === "uk" ? "Хмарно" : "Cloudy",
          icon: "03d",
          city
        });
        setLoading(false);
        return;
      }

      try {
        const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${apiKey}&units=metric&lang=${language}`;
        console.debug("[WeatherWidget] fetching URL:", url);
        const res = await fetch(url);
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          console.error("[WeatherWidget] API error", res.status, body);
          console.error("[WeatherWidget] URL was:", url);
          throw new Error(`${res.status}`);
        }
        const data = await res.json();
        setWeather({
          temp: Math.round(data.main.temp),
          description: data.weather[0].description,
          icon: data.weather[0].icon,
          city: data.name || city
        });
      } catch (e) {
        console.error("[WeatherWidget] fetch failed", e);
        setError(true);
      } finally {
        setLoading(false);
      }
    }

    fetchWeather();
  }, [city, locale]);

  useEffect(() => {
    function syncFromSettings() {
      const settings = readSettings();
      setCity(settings.weatherCity);
      setLocale(settings.locale);
    }

    window.addEventListener(SETTINGS_EVENT_NAME, syncFromSettings);
    window.addEventListener("storage", syncFromSettings);

    return () => {
      window.removeEventListener(SETTINGS_EVENT_NAME, syncFromSettings);
      window.removeEventListener("storage", syncFromSettings);
    };
  }, []);

  if (loading) return <Loader2 className="w-4 h-4 text-gray-500 animate-spin" />;
  if (error) return <span className="text-red-400 text-xs">weather err</span>;
  if (!weather) return null;

  return (
    <div className="flex items-center gap-1.5 bg-gray-800/50 rounded-xl px-2.5 py-1.5 border border-gray-700/50">
      <WeatherIcon icon={weather.icon} />
      <span className="text-white text-sm font-medium">{weather.temp}°C</span>
      <span className="text-gray-400 text-xs hidden sm:block capitalize">
        {weather.description}
      </span>
    </div>
  );
}
