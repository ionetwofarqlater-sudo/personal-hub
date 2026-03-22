"use client";

import { useEffect } from "react";
import { applyTheme, readSettings, SETTINGS_EVENT_NAME } from "@/lib/settings";

export default function SettingsHydrator() {
  useEffect(() => {
    applyTheme(readSettings().theme);

    function onSettingsChanged() {
      applyTheme(readSettings().theme);
    }

    window.addEventListener(SETTINGS_EVENT_NAME, onSettingsChanged);
    window.addEventListener("storage", onSettingsChanged);

    return () => {
      window.removeEventListener(SETTINGS_EVENT_NAME, onSettingsChanged);
      window.removeEventListener("storage", onSettingsChanged);
    };
  }, []);

  return null;
}
