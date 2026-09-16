"use client";

import { Check, ChevronDown, Monitor, Moon, Sun } from "lucide-react";
import { useEffect, useRef, useState } from "react";

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
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const selected = THEME_OPTIONS.find((option) => option.value === preference) ?? THEME_OPTIONS[0];
  const SelectedIcon = selected.Icon;

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

  useEffect(() => {
    if (!open) return;
    const closeOnOutsideClick = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", closeOnOutsideClick);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("pointerdown", closeOnOutsideClick);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [open]);

  function chooseTheme(nextPreference: ThemePreference) {
    setPreference(nextPreference);
    setOpen(false);
  }

  return (
    <div className="theme-switcher" ref={rootRef}>
      <button
        type="button"
        className="theme-switcher-trigger"
        aria-label={`Color theme: ${selected.label}`}
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((visible) => !visible)}
      >
        <SelectedIcon size={15} aria-hidden="true" />
        <span>{selected.label}</span>
        <ChevronDown className="theme-switcher-chevron" size={13} aria-hidden="true" />
      </button>
      {open ? (
        <div className="theme-switcher-menu" role="menu" aria-label="Choose color theme">
          <p>Appearance</p>
          {THEME_OPTIONS.map(({ value, label, Icon }) => (
            <button
              type="button"
              role="menuitemradio"
              aria-checked={preference === value}
              className={preference === value ? "is-selected" : ""}
              onClick={() => chooseTheme(value)}
              key={value}
            >
              <Icon size={16} aria-hidden="true" />
              <span>{label}</span>
              {preference === value ? <Check size={14} aria-hidden="true" /> : null}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
