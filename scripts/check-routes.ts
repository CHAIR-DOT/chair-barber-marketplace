import { shops, barbers, styles } from "../src/lib/data";
import { readdir } from "node:fs/promises";
async function main() {
  const origin = (process.argv[2] ?? "http://127.0.0.1:3000").replace(
    /\/$/,
    "",
  );
  const routes = [
    "/",
    "/discover",
    "/shops",
    "/barbers",
    "/styles",
    "/booking",
    "/login",
    "/register",
    "/account",
    "/account/appointments",
    "/account/favorites",
    "/account/reviews",
    "/account/settings",
    "/barber/dashboard",
    "/barber/profile",
    "/barber/portfolio",
    "/barber/services",
    "/barber/schedule",
    "/about",
    ...shops.map((s) => `/shops/${s.slug}`),
    ...barbers.map((b) => `/barbers/${b.slug}`),
    ...styles.map((s) => `/styles/${s.slug}`),
  ];
  const failures: string[] = [];
  for (let start = 0; start < routes.length; start += 8) {
    await Promise.all(
      routes.slice(start, start + 8).map(async (path) => {
        const response = await fetch(origin + path);
        if (response.status !== 200)
          failures.push(`${path}: ${response.status}`);
      }),
    );
  }
  for (const path of [
    "/shops/not-a-shop",
    "/barbers/not-a-barber",
    "/styles/not-a-style",
    "/account/not-a-section",
    "/barber/not-a-section",
  ]) {
    const response = await fetch(origin + path);
    if (response.status !== 404)
      failures.push(`${path}: expected 404, got ${response.status}`);
  }
  const assets = (
    await readdir(`${process.cwd()}/public/images`, { recursive: true })
  )
    .filter((asset) => /\.(jpg|png|webp|svg)$/i.test(asset))
    .map((asset) => `/images/${asset}`);
  await Promise.all(
    assets.map(async (asset) => {
      const response = await fetch(`${origin}${asset}`);
      if (
        response.status !== 200 ||
        !response.headers.get("content-type")?.startsWith("image/")
      )
        failures.push(`Image ${asset}: ${response.status}`);
    }),
  );
  if (failures.length) {
    console.error(failures.join("\n"));
    process.exitCode = 1;
  } else {
    console.log(
      `PASS: ${routes.length} routes, 5 unknown-route responses and ${assets.length} local images.`,
    );
  }
}
void main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
