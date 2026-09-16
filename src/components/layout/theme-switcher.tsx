"use client";

import { Monitor, Moon, Sun } from "lucide-react";
import { useEffect, useId, useState } from "react";

type ThemePreference = "system" | "light" | "dark";

const THEME_STORAGE_KEY = "ayah-explorer.theme";
const THEME_OPTIONS = [
  { value: "system" as const, label: "System", Icon: Monitor },
  { value: "light" as const, label: "Light", Icon: Sun },
  { value: "dark" as const, label: "Dark", Icon: Moon },
];

function isThemePreference(value: string | null): value is ThemePreference {
  return value === "system" || value === "light" || value === "dark";
}

function applyTheme(preference: ThemePreference) {
  const resolved = preference === "system"
    ? window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
    : preference;
  document.documentElement.dataset.theme = resolved;
  document.documentElement.dataset.themePreference = preference;
  document.documentElement.style.colorScheme = resolved;
}

export function ThemeSwitcher() {
  const [preference, setPreference] = useState<ThemePreference>("system");
  const [ready, setReady] = useState(false);
  const groupName = useId();

  useEffect(() => {
    const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
    const timer = window.setTimeout(() => {
      setPreference(isThemePreference(stored) ? stored : "system");
      setReady(true);
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!ready) return;
    const colorScheme = window.matchMedia("(prefers-color-scheme: dark)");
    const syncTheme = () => applyTheme(preference);
    window.localStorage.setItem(THEME_STORAGE_KEY, preference);
    syncTheme();
    if (preference === "system") colorScheme.addEventListener("change", syncTheme);
    return () => colorScheme.removeEventListener("change", syncTheme);
  }, [preference, ready]);

  function cyclePreference() {
    const currentIndex = THEME_OPTIONS.findIndex((option) => option.value === preference);
    setPreference(THEME_OPTIONS[(currentIndex + 1) % THEME_OPTIONS.length].value);
  }

  const activeTheme = THEME_OPTIONS.find((option) => option.value === preference) ?? THEME_OPTIONS[0];
  const ActiveIcon = activeTheme.Icon;

  return (
    <div className="theme-switcher" data-preference={preference}>
      <div className="theme-switcher-desktop" role="radiogroup" aria-label="Color theme">
        <span className="theme-switcher-thumb" aria-hidden="true" />
        {THEME_OPTIONS.map(({ value, label, Icon }) => (
          <label className="theme-switcher-option" title={`${label} theme`} key={value}>
            <input
              type="radio"
              name={groupName}
              value={value}
              aria-label={label}
              checked={preference === value}
              onChange={() => setPreference(value)}
            />
            <span className="theme-switcher-option-content">
              <Icon size={15} aria-hidden="true" />
              <span className="theme-switcher-label">{label}</span>
            </span>
          </label>
        ))}
      </div>
      <button type="button" className="theme-switcher-mobile" onClick={cyclePreference} aria-label={`Color theme: ${activeTheme.label}. Switch theme`} title={`Color theme: ${activeTheme.label}. Click to switch`}>
        <ActiveIcon size={15} aria-hidden="true" />
      </button>
    </div>
  );
}
