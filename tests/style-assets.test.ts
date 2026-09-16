import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { messages } from "../src/i18n/messages";
import { BEARD_STYLE_IDS, HAIR_STYLE_IDS } from "../src/lib/style-selection";
import {
  STYLE_ASSET_MANIFEST,
  STYLE_COMBINATIONS,
  getStyleCombination,
  getStyleThumbnail,
  resolveStudioSelection,
} from "../src/lib/style-assets";

test("Blender's build contract exactly matches the runtime registry IDs and groups", () => {
  const contract = JSON.parse(
    readFileSync("scripts/style-assets/build-contract.json", "utf8"),
  );
  assert.equal(contract.schemaVersion, 1);
  for (const category of ["hairStyles", "beardStyles"] as const) {
    assert.deepEqual(
      contract[category],
      STYLE_ASSET_MANIFEST[category].map(({ id, groupName }) => ({
        id,
        groupName,
      })),
      `${category} must not drift between authored assets and the displayed selector`,
    );
  }
});

test("studio registry contains three canonical hair and beard choices with localized labels and unique groups", () => {
  assert.equal(STYLE_ASSET_MANIFEST.hairStyles.length, 3);
  assert.equal(STYLE_ASSET_MANIFEST.beardStyles.length, 3);
  const entries = [
    ...STYLE_ASSET_MANIFEST.hairStyles,
    ...STYLE_ASSET_MANIFEST.beardStyles,
  ];
  assert.equal(new Set(entries.map((entry) => entry.groupName)).size, 6);
  for (const entry of STYLE_ASSET_MANIFEST.hairStyles)
    assert.ok(HAIR_STYLE_IDS.includes(entry.id));
  for (const entry of STYLE_ASSET_MANIFEST.beardStyles)
    assert.ok(BEARD_STYLE_IDS.includes(entry.id));
  for (const entry of entries)
    for (const locale of ["ka", "en", "ru"] as const)
      assert.ok(messages[locale][entry.labelKey]);
  assert.equal(
    HAIR_STYLE_IDS.length,
    11,
    "the full marketplace taxonomy remains available",
  );
  assert.equal(BEARD_STYLE_IDS.length, 6);
});

test("all nine combinations use one human and pair-specific local previews, including opposite-current thumbnails", () => {
  assert.equal(STYLE_COMBINATIONS.length, 9);
  assert.equal(new Set(STYLE_COMBINATIONS.map((entry) => entry.id)).size, 9);
  assert.equal(
    new Set(STYLE_COMBINATIONS.map((entry) => entry.previewSrc)).size,
    9,
  );
  for (const hair of STYLE_ASSET_MANIFEST.hairStyles)
    for (const beard of STYLE_ASSET_MANIFEST.beardStyles) {
      const selection = { hairStyleId: hair.id, beardStyleId: beard.id };
      const pair = getStyleCombination(selection);
      assert.equal(pair.modelSrc, STYLE_ASSET_MANIFEST.model.src);
      assert.equal(pair.hairGroupName, hair.groupName);
      assert.equal(pair.beardGroupName, beard.groupName);
      assert.equal(
        pair.previewSrc,
        `/style-previews/combinations/${hair.id}--${beard.id}.webp`,
      );
      assert.equal(
        getStyleThumbnail("hair", hair.id, {
          hairStyleId: "buzz-cut",
          beardStyleId: beard.id,
        }),
        pair.previewSrc,
      );
      assert.equal(
        getStyleThumbnail("beard", beard.id, {
          hairStyleId: hair.id,
          beardStyleId: "stubble",
        }),
        pair.previewSrc,
      );
    }
});

test("unsupported saved marketplace styles are reported without mutating or silently replacing persisted preferences", () => {
  const existing = Object.freeze({
    hairStyleId: "french-crop",
    beardStyleId: "goatee",
    submitted: true,
  });
  assert.deepEqual(resolveStudioSelection(existing), {
    hairStyleId: "skin-fade",
    beardStyleId: "stubble",
    isExactMatch: false,
    unsupportedHairStyleId: "french-crop",
    unsupportedBeardStyleId: "goatee",
  });
  assert.deepEqual(existing, {
    hairStyleId: "french-crop",
    beardStyleId: "goatee",
    submitted: true,
  });
  assert.deepEqual(
    resolveStudioSelection({
      hairStyleId: "buzz-cut",
      beardStyleId: "full-beard",
    }),
    {
      hairStyleId: "buzz-cut",
      beardStyleId: "full-beard",
      isExactMatch: true,
      unsupportedHairStyleId: null,
      unsupportedBeardStyleId: null,
    },
  );
});
