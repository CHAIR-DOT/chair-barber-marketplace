"use client";

import { Scissors, X } from "lucide-react";
import { styles } from "@/lib/data";
import { useI18n } from "@/i18n/provider";
import { useStyleSelection } from "./style-selection-provider";

export function StyleSelectionBrief() {
  const { selection, clearSelection } = useStyleSelection();
  const { t, styleName } = useI18n();
  const hair = styles.find((style) => style.id === selection.hairStyleId);
  if (!selection.submitted || !hair) return null;

  return (
    <section
      className="style-selection-brief"
      aria-label={t("styleBrief.title")}
    >
      <span className="style-selection-brief-icon" aria-hidden="true">
        <Scissors size={19} />
      </span>
      <div className="style-selection-brief-copy">
        <span className="style-selection-brief-title">
          {t("styleBrief.title")}
        </span>
        <strong>
          {styleName(hair)} · {t(`hero.beard.${selection.beardStyleId}`)}
        </strong>
        <p>{t("styleBrief.preference")}</p>
      </div>
      <button
        type="button"
        className="style-selection-brief-clear"
        onClick={clearSelection}
        aria-label={t("styleBrief.clear")}
      >
        <X size={16} aria-hidden="true" />
      </button>
    </section>
  );
}
