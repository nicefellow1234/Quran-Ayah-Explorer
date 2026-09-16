"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { ArrowRight, BookOpenText, Search, X } from "lucide-react";
import { useRouter } from "next/navigation";

import { parseJumpInput } from "@/lib/quran/validation";

export function JumpForm({ compact = false }: { compact?: boolean }) {
  const router = useRouter();
  const [value, setValue] = useState("");
  const [message, setMessage] = useState("");
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!compact) return;
    const handleKeyboard = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen(true);
      }
      if (event.key === "Escape" && open) {
        setOpen(false);
        triggerRef.current?.focus();
      }
    };
    const handleOutsideClick = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("keydown", handleKeyboard);
    document.addEventListener("pointerdown", handleOutsideClick);
    return () => {
      document.removeEventListener("keydown", handleKeyboard);
      document.removeEventListener("pointerdown", handleOutsideClick);
    };
  }, [compact, open]);

  useEffect(() => {
    if (!open) return;
    const timer = window.setTimeout(() => inputRef.current?.focus(), 0);
    return () => window.clearTimeout(timer);
  }, [open]);

  function navigate(reference: string) {
    const result = parseJumpInput(reference);
    if (result.kind === "invalid") {
      setMessage("Enter a Surah number or an ayah reference such as 2:255.");
      return;
    }
    setMessage("");
    setValue("");
    setOpen(false);
    router.push(result.kind === "chapter" ? `/surah/${result.chapter}` : `/ayah/${result.chapter}:${result.verse}`);
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    navigate(value);
  }

  if (compact) {
    return (
      <div className="jump-navigator" ref={rootRef}>
        <button
          type="button"
          className="jump-navigator-trigger"
          aria-label="Open Quran navigator"
          aria-haspopup="dialog"
          aria-expanded={open}
          onClick={() => setOpen((visible) => !visible)}
          ref={triggerRef}
        >
          <span className="jump-navigator-icon" aria-hidden="true"><Search size={15} /></span>
          <span className="jump-navigator-copy"><strong>Quick navigate</strong><small>Surah or ayah</small></span>
          <kbd>Ctrl K</kbd>
        </button>
        {open ? (
          <section className="jump-popover" role="dialog" aria-modal="false" aria-labelledby="jump-popover-title">
            <div className="jump-popover-heading">
              <span aria-hidden="true"><BookOpenText size={17} /></span>
              <div><strong id="jump-popover-title">Go anywhere in the Quran</strong><small>Enter a Surah number or an ayah reference.</small></div>
              <button type="button" className="icon-button" aria-label="Close Quran navigator" onClick={() => setOpen(false)}><X size={15} aria-hidden="true" /></button>
            </div>
            <form className="jump-popover-form" onSubmit={submit} role="search">
              <label htmlFor="header-jump" className="sr-only">Jump to a Surah or ayah</label>
              <Search size={18} aria-hidden="true" />
              <input
                id="header-jump"
                ref={inputRef}
                value={value}
                onChange={(event) => { setValue(event.target.value); setMessage(""); }}
                placeholder="Try 2:255 or 36"
                autoComplete="off"
                inputMode="text"
              />
              <button type="submit" aria-label="Open Quran reference">Open <ArrowRight size={15} aria-hidden="true" /></button>
            </form>
            {message ? <p className="jump-popover-message" role="status">{message}</p> : null}
            <div className="jump-suggestions" aria-label="Popular Quran references">
              <span>Popular</span>
              <button type="button" onClick={() => navigate("1")}>Al-Fatihah <small>1</small></button>
              <button type="button" onClick={() => navigate("2:255")}>Ayat al-Kursi <small>2:255</small></button>
              <button type="button" onClick={() => navigate("36")}>Ya-Sin <small>36</small></button>
              <button type="button" onClick={() => navigate("67")}>Al-Mulk <small>67</small></button>
            </div>
            <p className="jump-popover-tip"><kbd>Enter</kbd> to open · <kbd>Esc</kbd> to close</p>
          </section>
        ) : null}
      </div>
    );
  }

  return (
    <form className="jump-form" onSubmit={submit} role="search">
      <label htmlFor="hero-jump" className="sr-only">Jump to a Surah or ayah</label>
      <Search size={17} aria-hidden="true" className="jump-icon" />
      <input
        id="hero-jump"
        value={value}
        onChange={(event) => setValue(event.target.value)}
        placeholder="Surah or ayah, e.g. 2:255"
        autoComplete="off"
        inputMode="text"
      />
      <button type="submit" className="icon-button jump-submit" aria-label="Go to reference">
        Go
      </button>
      {message ? <span className="form-message" role="status">{message}</span> : null}
    </form>
  );
}
