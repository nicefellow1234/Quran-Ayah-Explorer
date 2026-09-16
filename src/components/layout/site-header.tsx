import Link from "next/link";
import { BookOpenText } from "lucide-react";

import type { ResourceOption } from "@/lib/quran/types";

import { JumpForm } from "../navigation/jump-form";
import { ReaderModeToggle } from "../navigation/reader-mode-toggle";
import { SettingsDialog } from "../settings/settings-dialog";
import { ThemeSwitcher } from "./theme-switcher";

type SiteHeaderProps = {
  translations?: ResourceOption[];
  selectedTranslationIds?: number[];
  showReaderMode?: boolean;
};

export function SiteHeader({ translations = [], selectedTranslationIds, showReaderMode = false }: SiteHeaderProps) {
  return (
    <header className="site-header">
      <div className="shell header-inner">
        <Link href="/" className="brand" aria-label="Ayah Explorer home">
          <span className="brand-mark" aria-hidden="true"><BookOpenText size={19} strokeWidth={1.8} /></span>
          <span>
            <span className="brand-name">Ayah Explorer</span>
            <span className="brand-caption">Read · listen · reflect</span>
          </span>
        </Link>
        <div className="header-tools">
          {showReaderMode ? <ReaderModeToggle /> : null}
          <JumpForm compact />
          <ThemeSwitcher />
          {translations.length > 0 ? (
            <SettingsDialog
              translations={translations}
              selectedTranslationIds={selectedTranslationIds}
            />
          ) : null}
        </div>
      </div>
    </header>
  );
}
