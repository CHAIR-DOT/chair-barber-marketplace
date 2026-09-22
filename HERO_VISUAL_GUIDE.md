# CHAIR. — Cinematic hero visual guide

## Current direction

The homepage hero is a **decorative CSS motion poster**. It depicts a black quilted leather barber chair with bronze metalwork, an arched mirror, warm lamps and an orderly grooming station with a towel, brush, spray bottle, clipper, comb and scissors. The visual is silent and non-interactive; the heading, supporting copy and captions remain ordinary accessible HTML. As of 22 September 2026, the hero contains no discovery or booking CTAs; its role is branding and atmosphere.

The user retired the mannequin direction on 16 September 2026. Do not restore grooming selectors, model rotation, hotspots or Photo View when changing this hero. The former GLB, combination previews, renderer, asset registry and Blender authoring pipeline were removed. Their historical implementation is available through Git history.

This approach uses one integrated photographic-style composition with restrained motion. It does not animate individual chair parts assembling or tools physically moving into place. That is an intentional visual choice within the requested motion-poster direction.

## Files

| File | Purpose |
| --- | --- |
| `src/components/barber-hero.tsx` | Hero structure, media state and animation lifecycle |
| `src/components/barber-hero.css` | Responsive framing, typography, overlays and keyframes |
| `src/i18n/messages/style-hero.ts` | `homeHero.*` copy in English, Georgian and Russian |
| `public/images/hero/barber-atelier.webp` | Main artwork, 1536 × 1024, 171,316 bytes |
| `public/images/hero/barber-atelier-mobile.webp` | Smaller rendition, 960 × 640, 60,692 bytes |
| `public/images/hero/barber-atelier-poster.webp` | Lightweight static rendition, 480 × 320, 14,518 bytes |
| `ASSET-SOURCES.md` | Current generated-artwork provenance and unchanged marketplace credits |
| `docs/hero-artwork-prompt.md` | Exact generation prompt for the current artwork |
| `VERIFICATION.md` | Actual verification results and limits |

The three renditions preserve the same 3:2 image composition. Their combined checked-in size is **246,526 bytes**. The browser chooses the appropriate main rendition; do not add the sizes together and describe that total as every visitor's image transfer. Layout cropping is controlled by the component CSS rather than baked into a separate mobile scene.

### SHA-256 inventory

```text
barber-atelier.webp
ad155b6fc190184f0ae20c4f3dcc0f4dd9390e9ede70b10805d4f19d09c3ea5b

barber-atelier-mobile.webp
8d449016982238939096af9a3e57d88b641196528c5340c1b2e473dfe81a3df5

barber-atelier-poster.webp
4ebd972126ccc6dc0ecf555f19421a24533515e3ac50467b42720a0393b96ec9
```

## Artwork provenance

The scene was generated specifically for this project with the built-in OpenAI image-generation tool on 16 September 2026. The exact prompt is preserved in [docs/hero-artwork-prompt.md](docs/hero-artwork-prompt.md); generation is not guaranteed to reproduce identical pixels, so the reviewed local WebP files are the current visual source of truth. It has no external photographer or stock-photo source. It is a fictional decorative interior, not a photograph of an actual marketplace salon or evidence of an endorsement. The retired human model's CC0 license does not describe this new artwork.

The web renditions contain no interface lettering, logos, watermarks or human likenesses. New captions and labels belong in the localization catalog, never baked into the artwork. The original stock imagery used in marketplace cards and galleries remains credited separately in `ASSET-SOURCES.md`.

## Motion and lifecycle

The hero uses CSS transforms and opacity with restrained warm light and atmospheric detail. No video asset, canvas renderer, animation library or sound track is involved. Three.js, its types, glTF Transform and Meshoptimizer were removed; `sharp` remains available for local image preparation.

The camera and light each use a 20-second `ease-in-out` alternate animation: 20 seconds forward and 20 seconds back, for a **40-second full cycle**. The camera moves from scale 1 to 1.035 with a −0.6% horizontal / 0.2% vertical drift. Three sparse dust points alternate over 10 seconds per direction, with staggered starting positions in their timelines. Each return follows the same path instead of snapping from the final transform back to the first. The component pauses animation when the hero is outside the viewport, the document is hidden, reduced motion is requested, or the main image has not loaded/has failed. It releases its observers/listeners when unmounted.

`prefers-reduced-motion: reduce` shows a still composition. Keep the heading and supporting text visible in that mode. Decorative imagery and effects must stay out of the accessibility tree and must not intercept clicks, keyboard focus or touch scrolling.

## Loading and fallback

The visual layers reserve their layout space immediately. A 480px CSS poster remains underneath the main picture. The picture uses the 960px rendition at viewport widths ≤800px and the 1536px rendition above that, with explicit image dimensions and high fetch priority. Its opacity becomes visible after the image load event with a 700ms fade; reduced motion removes this transition. Before that event, without JavaScript, or after a main-image error, the matching poster remains visible and the camera/light/dust stay paused.

If the poster also fails, a charcoal/bronze gradient and a faint CSS architectural arch remain. The failed foreground image stays transparent, preventing a broken-image icon over the composition. The heading, supporting copy and localized caption remain ordinary independent HTML throughout. There is no external asset request or loading spinner.

The section retains the `style-hero` class only as a compatibility hook for the unchanged language-selector styling. This is not retained mannequin behavior. Do not add retry/model controls or expose implementation details to visitors. The hero contains no links, buttons or configurator; the header and lower marketplace handle navigation. The existing `chair.style.v1` inspiration state remains available elsewhere in discovery and booking, and this hero neither clears nor changes it.

## Updating the visual

1. Read `PROJECT_MEMORY.md` and inspect the current component before editing. Keep the lower homepage, routes, mock data, search/filter rules, booking and improved flag language selector intact.
2. Generate or source one legally usable composition with dark copy space and a clear barber chair/station focal point. Inspect the actual output at large and phone sizes. Use image-generation/editing tools for changes to generated artwork; do not substitute unrelated stock imagery under the existing provenance.
3. Export matching local WebP renditions. Keep the same aspect ratio and visual identity between the main image and fallback, strip unnecessary metadata, and favor image quality over an arbitrary compression target. Preserve the current dimensions unless there is a measured reason to change them.
4. Update component source selection, reserved dimensions and responsive positions together. Maintain a stable first frame, restrained transforms and endpoint continuity. Do not lazily defer the main above-the-fold hero until it scrolls into view.
5. Add or change user-facing text through `homeHero.*` in all three languages. Retain the shared `hero.beard.*`, `styleBrief.*` and `homeFilters.*` labels used outside the removed mannequin.
6. Refresh this file's byte counts/hashes and `ASSET-SOURCES.md` when artwork changes. Keep raw generator downloads, caches and temporary inspection output outside the committed application.
7. Inspect 375, 430, 768, 1024, 1440 and 1920px in KA/EN/RU, including short heights. Check the chair/tools crop, loop return, loading/failure, reduced motion, offscreen/hidden pausing, title wrapping, balanced copy spacing, header/menu stacking and transition into the lower section.
8. Run the configured TypeScript, tests and production build, then route/asset checks against an owned local server. Record actual results in memory/verification, review the diff and staged files, commit and push to the existing public repository.

## Limits

The scene is generated artwork with a camera/light motion treatment, not live footage, a physical simulation or a multi-shot assembly sequence. Device-specific animation performance and formal accessibility acceptance require separate measured checks; do not infer them from file size or desktop screenshots. The site remains a mock frontend available locally and on GitHub Pages.
