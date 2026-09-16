"use client";

import { FormEvent, useState } from "react";
import { ArrowRight, Search } from "lucide-react";
import { useRouter } from "next/navigation";

import { parseJumpInput } from "@/lib/quran/validation";

export function JumpForm({ compact = false }: { compact?: boolean }) {
  const router = useRouter();
  const [value, setValue] = useState("");
  const [message, setMessage] = useState("");

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const result = parseJumpInput(value);
    if (result.kind === "invalid") {
      setMessage("Try a Surah number or reference like 2:255.");
      return;
    }
    setMessage("");
    setValue("");
    router.push(result.kind === "chapter" ? `/surah/${result.chapter}` : `/ayah/${result.chapter}:${result.verse}`);
  }

  return (
    <form className={`jump-form ${compact ? "jump-form-compact" : ""}`} onSubmit={submit} role="search">
      <label htmlFor={compact ? "header-jump" : "hero-jump"} className="sr-only">Jump to a Surah or ayah</label>
      <Search size={17} aria-hidden="true" className="jump-icon" />
      <input
        id={compact ? "header-jump" : "hero-jump"}
        value={value}
        onChange={(event) => setValue(event.target.value)}
        placeholder={compact ? "Jump to…" : "Surah or ayah, e.g. 2:255"}
        autoComplete="off"
        inputMode="text"
      />
      <button type="submit" className="icon-button jump-submit" aria-label="Go to reference">
        {compact ? <ArrowRight size={16} aria-hidden="true" /> : "Go"}
      </button>
      {message ? <span className="form-message" role="status">{message}</span> : null}
    </form>
  );
}
