"use client";

import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from "react";
import { Check, ChevronDown, Search } from "lucide-react";

import type { ResourceOption } from "@/lib/quran/types";

const languageOrder = ["english", "arabic", "urdu", "bengali", "kurdish", "russian", "swahili"];

function languageLabel(languageName?: string) {
  return languageName?.trim() || "Other languages";
}

function languageRank(languageName: string) {
  const index = languageOrder.indexOf(languageName.toLowerCase());
  return index === -1 ? languageOrder.length : index;
}

export function TafsirResourcePicker({
  resources,
  value,
  onChange,
  idPrefix,
}: {
  resources: ResourceOption[];
  value?: number;
  onChange: (resourceId: number) => void;
  idPrefix: string;
}) {
  const pickerRef = useRef<HTMLDivElement | null>(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const selectedResource = resources.find((resource) => resource.id === value) ?? resources[0];
  const groups = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    const grouped = new Map<string, ResourceOption[]>();

    resources.forEach((resource) => {
      const language = languageLabel(resource.languageName);
      const searchable = [language, resource.name, resource.authorName].filter(Boolean).join(" ").toLowerCase();
      if (normalizedQuery && !searchable.includes(normalizedQuery)) return;
      grouped.set(language, [...(grouped.get(language) ?? []), resource]);
    });

    return [...grouped.entries()]
      .sort(([left], [right]) => languageRank(left) - languageRank(right) || left.localeCompare(right))
      .map(([language, options]) => ({ language, options }));
  }, [query, resources]);
  const visibleResources = useMemo(() => groups.flatMap((group) => group.options), [groups]);

  useEffect(() => {
    function closeOnOutsidePointer(event: PointerEvent) {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
        setOpen(false);
        setQuery("");
      }
    }

    document.addEventListener("pointerdown", closeOnOutsidePointer);
    return () => document.removeEventListener("pointerdown", closeOnOutsidePointer);
  }, []);

  function selectResource(resourceId: number) {
    onChange(resourceId);
    setOpen(false);
    setQuery("");
    setActiveIndex(0);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Escape") {
      setOpen(false);
      setQuery("");
      return;
    }
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setOpen(true);
      setActiveIndex((index) => Math.min(index + 1, Math.max(visibleResources.length - 1, 0)));
    }
    if (event.key === "ArrowUp") {
      event.preventDefault();
      setOpen(true);
      setActiveIndex((index) => Math.max(index - 1, 0));
    }
    if (event.key === "Enter" && open && visibleResources[activeIndex]) {
      event.preventDefault();
      selectResource(visibleResources[activeIndex].id);
    }
  }

  if (!selectedResource) return null;

  return (
    <div className={`tafsir-picker${open ? " is-open" : ""}`} ref={pickerRef}>
      <div className="tafsir-combobox">
        <Search size={15} aria-hidden="true" className="tafsir-search-icon" />
        <input
          id={`${idPrefix}-picker`}
          type="text"
          value={query}
          placeholder={selectedResource.name}
          onChange={(event) => { setQuery(event.target.value); setOpen(true); setActiveIndex(0); }}
          onFocus={() => setOpen(true)}
          onKeyDown={handleKeyDown}
          role="combobox"
          aria-label="Search and choose a tafsir resource"
          aria-controls={`${idPrefix}-list`}
          aria-expanded={open}
          aria-autocomplete="list"
          aria-activedescendant={open && visibleResources[activeIndex] ? `tafsir-resource-${visibleResources[activeIndex].id}` : undefined}
        />
        <button type="button" className="tafsir-menu-button" onClick={() => setOpen((isOpen) => !isOpen)} aria-label="Show tafsir resources" aria-expanded={open}>
          <ChevronDown size={16} aria-hidden="true" />
        </button>
      </div>

      {open ? (
        <div className="tafsir-menu" id={`${idPrefix}-list`} role="listbox" aria-label="Tafsir resources">
          <div className="tafsir-menu-meta"><span>{resources.length} resources</span><span>Grouped by language</span></div>
          {groups.length ? groups.map((group) => (
            <div className="tafsir-group" key={group.language}>
              <div className="tafsir-group-label"><span>{group.language}</span><small>{group.options.length}</small></div>
              {group.options.map((resource) => {
                const optionIndex = visibleResources.findIndex((item) => item.id === resource.id);
                return (
                  <button
                    type="button"
                    className={`tafsir-option${resource.id === selectedResource.id ? " is-selected" : ""}${optionIndex === activeIndex ? " is-active" : ""}`}
                    id={`${idPrefix}-resource-${resource.id}`}
                    key={resource.id}
                    role="option"
                    aria-selected={resource.id === selectedResource.id}
                    onClick={() => selectResource(resource.id)}
                  >
                    <span className="tafsir-option-copy"><strong>{resource.name}</strong><small>{resource.authorName ?? group.language}</small></span>
                    {resource.id === selectedResource.id ? <Check size={15} aria-hidden="true" /> : null}
                  </button>
                );
              })}
            </div>
          )) : <p className="tafsir-empty">No tafsir resources match “{query}”.</p>}
        </div>
      ) : null}
    </div>
  );
}
