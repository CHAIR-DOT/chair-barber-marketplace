import test from "node:test";
import assert from "node:assert/strict";
import { styles } from "../src/lib/data";
import {
  BEARD_STYLE_IDS,
  DEFAULT_STYLE_SELECTION,
  HAIR_STYLE_IDS,
  isBeardStyleId,
  isHairStyleId,
  normalizeStyleSelection,
  parseStyleSelection,
  serializeStyleSelection,
} from "../src/lib/style-selection";

test("hair inspiration maps to existing discoverable haircut IDs, independently of beard preferences", () => {
  assert.equal(HAIR_STYLE_IDS.length, 11);
  assert.ok(!isHairStyleId("beard-styles"));
  for (const id of HAIR_STYLE_IDS) {
    assert.ok(styles.some((style) => style.id === id));
    assert.ok(isHairStyleId(id));
  }
  assert.ok(BEARD_STYLE_IDS.every(isBeardStyleId));
  assert.ok(BEARD_STYLE_IDS.every((id) => !isHairStyleId(id)));
  assert.ok(!isHairStyleId("javascript:invalid"));
});

test("temporary style persistence round-trips canonical IDs and ignores locale and booking data", () => {
  const selection = {
    hairStyleId: "french-crop",
    beardStyleId: "goatee",
    submitted: true,
  } as const;
  assert.deepEqual(
    parseStyleSelection(serializeStyleSelection(selection)),
    selection,
  );
  const withExtraFields = {
    ...selection,
    locale: "ru",
    serviceId: "haircut-beard",
    price: 99,
  };
  assert.deepEqual(normalizeStyleSelection(withExtraFields), selection);
  assert.equal(
    Object.keys(parseStyleSelection(serializeStyleSelection(selection))).length,
    3,
  );
});

test("corrupt or obsolete session data safely returns defaults without a submitted brief", () => {
  for (const raw of [
    null,
    "",
    "not json",
    "null",
    "[]",
    "{}",
    '{"version":2,"selection":{}}',
  ])
    assert.deepEqual(parseStyleSelection(raw), DEFAULT_STYLE_SELECTION);

  const translatedIds = normalizeStyleSelection({
    hairStyleId: "Фейд",
    beardStyleId: "goatee",
    submitted: true,
  });
  assert.equal(translatedIds.hairStyleId, "skin-fade");
  assert.equal(translatedIds.beardStyleId, "goatee");
  assert.equal(translatedIds.submitted, false);

  assert.equal(
    normalizeStyleSelection({
      hairStyleId: "skin-fade",
      beardStyleId: "stubble",
      submitted: "true",
    }).submitted,
    false,
  );
  assert.equal(
    normalizeStyleSelection({
      hairStyleId: "skin-fade",
      beardStyleId: "unknown",
      submitted: true,
    }).submitted,
    false,
  );
});
