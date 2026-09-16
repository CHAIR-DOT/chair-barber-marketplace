import { styles } from "./data";

// These are inspiration preferences, not new marketplace services or filters.
export const BEARD_STYLE_IDS = [
  "clean-shaven",
  "stubble",
  "short-beard",
  "full-beard",
  "goatee",
  "defined",
] as const;
export type BeardStyleId = (typeof BEARD_STYLE_IDS)[number];

export const HAIR_STYLE_IDS = styles
  .filter((style) => style.id !== "beard-styles")
  .map((style) => style.id);
const hairStyleIds = new Set(HAIR_STYLE_IDS);
const beardStyleIds = new Set<string>(BEARD_STYLE_IDS);

export interface StyleSelection {
  hairStyleId: string;
  beardStyleId: BeardStyleId;
  submitted: boolean;
}

export const STYLE_SELECTION_STORAGE_KEY = "chair.style.v1";
export const DEFAULT_STYLE_SELECTION: Readonly<StyleSelection> = {
  hairStyleId: "skin-fade",
  beardStyleId: "stubble",
  submitted: false,
};

export function isHairStyleId(value: unknown): value is string {
  return typeof value === "string" && hairStyleIds.has(value);
}

export function isBeardStyleId(value: unknown): value is BeardStyleId {
  return typeof value === "string" && beardStyleIds.has(value);
}

export function normalizeStyleSelection(value: unknown): StyleSelection {
  if (!value || typeof value !== "object")
    return { ...DEFAULT_STYLE_SELECTION };
  const candidate = value as Record<string, unknown>;
  const validHair = isHairStyleId(candidate.hairStyleId);
  const validBeard = isBeardStyleId(candidate.beardStyleId);
  return {
    hairStyleId: validHair
      ? (candidate.hairStyleId as string)
      : DEFAULT_STYLE_SELECTION.hairStyleId,
    beardStyleId: validBeard
      ? (candidate.beardStyleId as BeardStyleId)
      : DEFAULT_STYLE_SELECTION.beardStyleId,
    // Invalid or obsolete preferences must not appear as a submitted brief.
    submitted: validHair && validBeard && candidate.submitted === true,
  };
}

export function parseStyleSelection(raw: string | null): StyleSelection {
  try {
    const stored: unknown = raw ? JSON.parse(raw) : null;
    if (
      stored &&
      typeof stored === "object" &&
      "version" in stored &&
      stored.version === 1
    )
      return normalizeStyleSelection(
        "selection" in stored ? stored.selection : null,
      );
  } catch {
    // An unavailable or stale session must never prevent discovery or booking.
  }
  return { ...DEFAULT_STYLE_SELECTION };
}

export function serializeStyleSelection(selection: StyleSelection): string {
  return JSON.stringify({
    version: 1,
    selection: normalizeStyleSelection(selection),
  });
}
