"use client";

import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from "react";
import { ChevronDown, Plus, Search } from "lucide-react";

import type { ResourceOption } from "@/lib/quran/types";

const languageOrder = ["english", "arabic", "urdu", "bengali", "kurdish", "russian", "swahili"];

function languageLabel(languageName?: string) {
  return languageName?.trim() || "Other languages";
}

function languageRank(languageName: string) {
  const index = languageOrder.indexOf(languageName.toLowerCase());
  return index === -1 ? languageOrder.length : index;
}

export function TranslationPicker({
  resources,
  selectedIds,
  onAdd,
}: {
  resources: ResourceOption[];
  selectedIds: number[];
  onAdd: (resourceId: number) => void;
}) {
  const pickerRef = useRef<HTMLDivElement | null>(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const groups = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    const grouped = new Map<string, ResourceOption[]>();

    resources.forEach((resource) => {
      if (selectedIds.includes(resource.id)) return;
      const language = languageLabel(resource.languageName);
      const searchable = [language, resource.name, resource.authorName].filter(Boolean).join(" ").toLowerCase();
      if (normalizedQuery && !searchable.includes(normalizedQuery)) return;
      grouped.set(language, [...(grouped.get(language) ?? []), resource]);
    });

    return [...grouped.entries()]
      .sort(([left], [right]) => languageRank(left) - languageRank(right) || left.localeCompare(right))
      .map(([language, options]) => ({ language, options }));
  }, [query, resources, selectedIds]);
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
    onAdd(resourceId);
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

  return (
    <div className={`translation-picker${open ? " is-open" : ""}`} ref={pickerRef}>
      <div className="translation-combobox">
        <Search size={15} aria-hidden="true" className="translation-search-icon" />
        <input
          id="translation-resource-picker"
          type="text"
          value={query}
          placeholder="Add a translation"
          onChange={(event) => { setQuery(event.target.value); setOpen(true); setActiveIndex(0); }}
          onFocus={() => setOpen(true)}
          onKeyDown={handleKeyDown}
          role="combobox"
          aria-label="Search and add a translation"
          aria-controls="translation-resource-list"
          aria-expanded={open}
          aria-autocomplete="list"
          aria-activedescendant={open && visibleResources[activeIndex] ? `translation-resource-${visibleResources[activeIndex].id}` : undefined}
        />
        <button type="button" className="translation-menu-button" onClick={() => setOpen((isOpen) => !isOpen)} aria-label="Show available translations" aria-expanded={open}>
          <ChevronDown size={16} aria-hidden="true" />
        </button>
      </div>

      {open ? (
        <div className="translation-menu" id="translation-resource-list" role="listbox" aria-label="Available translations">
          <div className="translation-menu-meta"><span>{visibleResources.length} available</span><span>Grouped by language</span></div>
          {groups.length ? groups.map((group) => (
            <div className="translation-group" key={group.language}>
              <div className="translation-group-label"><span>{group.language}</span><small>{group.options.length}</small></div>
              {group.options.map((resource) => {
                const optionIndex = visibleResources.findIndex((item) => item.id === resource.id);
                return (
                  <button
                    type="button"
                    className={`translation-option${optionIndex === activeIndex ? " is-active" : ""}`}
                    id={`translation-resource-${resource.id}`}
                    key={resource.id}
                    role="option"
                    aria-selected={false}
                    onClick={() => selectResource(resource.id)}
                  >
                    <span className="translation-option-copy"><strong>{resource.name}</strong><small>{resource.authorName ?? group.language}</small></span>
                    <Plus size={15} aria-hidden="true" />
                  </button>
                );
              })}
            </div>
          )) : <p className="translation-empty">All available translations are already added.</p>}
        </div>
      ) : null}
    </div>
  );
}
