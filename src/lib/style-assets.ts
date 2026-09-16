import type { BeardStyleId } from "./style-selection";

/** The studio's supported assets, independent of the broader marketplace taxonomy. */
export const STYLE_ASSET_MANIFEST = {
  model: { src: "/models/human/chair-human.glb" },
  previewDirectory: "/style-previews/combinations",
  hairStyles: [
    {
      id: "skin-fade",
      labelKey: "data.styles.skin-fade.name",
      groupName: "hair_skin-fade",
    },
    {
      id: "taper-fade",
      labelKey: "data.styles.taper-fade.name",
      groupName: "hair_taper-fade",
    },
    {
      id: "buzz-cut",
      labelKey: "data.styles.buzz-cut.name",
      groupName: "hair_buzz-cut",
    },
  ],
  beardStyles: [
    {
      id: "stubble",
      labelKey: "hero.beard.stubble",
      groupName: "beard_stubble",
    },
    {
      id: "short-beard",
      labelKey: "hero.beard.short-beard",
      groupName: "beard_short-beard",
    },
    {
      id: "full-beard",
      labelKey: "hero.beard.full-beard",
      groupName: "beard_full-beard",
    },
  ] satisfies readonly {
    id: BeardStyleId;
    labelKey: string;
    groupName: string;
  }[],
} as const;

export type StudioHairStyleId =
  (typeof STYLE_ASSET_MANIFEST.hairStyles)[number]["id"];
export type StudioBeardStyleId =
  (typeof STYLE_ASSET_MANIFEST.beardStyles)[number]["id"];
export interface StudioStyleSelection {
  hairStyleId: StudioHairStyleId;
  beardStyleId: StudioBeardStyleId;
}
type RequestedSelection = Readonly<{
  hairStyleId: string;
  beardStyleId: string;
}>;

export const STYLE_COMBINATIONS = STYLE_ASSET_MANIFEST.hairStyles.flatMap(
  (hair) =>
    STYLE_ASSET_MANIFEST.beardStyles.map((beard) => ({
      id: `${hair.id}--${beard.id}`,
      hairStyleId: hair.id,
      beardStyleId: beard.id,
      modelSrc: STYLE_ASSET_MANIFEST.model.src,
      hairGroupName: hair.groupName,
      beardGroupName: beard.groupName,
      previewSrc: `${STYLE_ASSET_MANIFEST.previewDirectory}/${hair.id}--${beard.id}.webp`,
    })),
);
export type StyleCombination = (typeof STYLE_COMBINATIONS)[number];

export function isStudioHairStyleId(value: string): value is StudioHairStyleId {
  return STYLE_ASSET_MANIFEST.hairStyles.some((style) => style.id === value);
}
export function isStudioBeardStyleId(
  value: string,
): value is StudioBeardStyleId {
  return STYLE_ASSET_MANIFEST.beardStyles.some((style) => style.id === value);
}

/**
 * Resolve display assets only. Never write this result to persistence implicitly:
 * callers must explain an unsupported saved choice and wait for a deliberate choice/CTA.
 */
export function resolveStudioSelection(
  selection: RequestedSelection,
): StudioStyleSelection & {
  isExactMatch: boolean;
  unsupportedHairStyleId: string | null;
  unsupportedBeardStyleId: string | null;
} {
  const validHair = isStudioHairStyleId(selection.hairStyleId);
  const validBeard = isStudioBeardStyleId(selection.beardStyleId);
  return {
    hairStyleId: validHair
      ? (selection.hairStyleId as StudioHairStyleId)
      : STYLE_ASSET_MANIFEST.hairStyles[0].id,
    beardStyleId: validBeard
      ? (selection.beardStyleId as StudioBeardStyleId)
      : STYLE_ASSET_MANIFEST.beardStyles[0].id,
    isExactMatch: validHair && validBeard,
    unsupportedHairStyleId: validHair ? null : selection.hairStyleId,
    unsupportedBeardStyleId: validBeard ? null : selection.beardStyleId,
  };
}

/** One pair determines both visible mesh groups and the matching rendered fallback. */
export function getStyleCombination(
  selection: StudioStyleSelection,
): StyleCombination {
  const combination = STYLE_COMBINATIONS.find(
    (entry) =>
      entry.hairStyleId === selection.hairStyleId &&
      entry.beardStyleId === selection.beardStyleId,
  );
  if (!combination) throw new Error("Unsupported studio asset combination");
  return combination;
}

export function getStyleThumbnail(
  category: "hair",
  id: StudioHairStyleId,
  selection: StudioStyleSelection,
): string;
export function getStyleThumbnail(
  category: "beard",
  id: StudioBeardStyleId,
  selection: StudioStyleSelection,
): string;
export function getStyleThumbnail(
  category: "hair" | "beard",
  id: StudioHairStyleId | StudioBeardStyleId,
  selection: StudioStyleSelection,
): string {
  const pair =
    category === "hair"
      ? { ...selection, hairStyleId: id as StudioHairStyleId }
      : { ...selection, beardStyleId: id as StudioBeardStyleId };
  return getStyleCombination(pair).previewSrc;
}
