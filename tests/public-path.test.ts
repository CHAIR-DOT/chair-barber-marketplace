import test from "node:test";
import assert from "node:assert/strict";
import { publicPath } from "../src/lib/public-path";
import { barbers, shops } from "../src/lib/data";

test("deployment prefixes native URLs while preserving external uploads and canonical records", () => {
  const previous = process.env.NEXT_PUBLIC_BASE_PATH;
  const recordsBefore = JSON.stringify({ barbers, shops });
  try {
    for (const prefix of ["/chair-barber-marketplace", "/nested/site"]) {
      process.env.NEXT_PUBLIC_BASE_PATH = prefix;
      for (const path of [
        "/images/barber.jpg",
        "/favicon.svg",
        "/discover?service=haircut",
        "/",
      ]) {
        assert.equal(publicPath(path), `${prefix}${path}`);
        assert.equal(publicPath(publicPath(path)), `${prefix}${path}`);
      }
      for (const path of [
        undefined,
        "",
        "data:image/png;base64,example",
        "blob:https://example.com/image",
        "https://example.com/photo.jpg",
        "//cdn.example.com/photo.jpg",
        "images/photo.jpg",
        "#main",
      ])
        assert.equal(publicPath(path), path);
      // Calling the renderer on records must not mutate persisted canonical values.
      barbers.forEach((barber) => publicPath(barber.image));
      shops.forEach((shop) => publicPath(shop.image));
    }
    delete process.env.NEXT_PUBLIC_BASE_PATH;
    assert.equal(publicPath("/images/barber.jpg"), "/images/barber.jpg");
    assert.equal(publicPath("/discover"), "/discover");
    assert.equal(JSON.stringify({ barbers, shops }), recordsBefore);
  } finally {
    if (previous === undefined) delete process.env.NEXT_PUBLIC_BASE_PATH;
    else process.env.NEXT_PUBLIC_BASE_PATH = previous;
  }
});
