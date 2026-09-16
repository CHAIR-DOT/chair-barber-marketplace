# CHAIR. style asset guide

## Current result and boundary

The former Lee Perry-Smith scan and runtime procedural styles have been replaced by one **temporary MakeHuman/MPFB CC0 human** with open eyes, a black barber cape and six separately fitted grooming groups. The scene is an illustrative generic person, not a customer face scan. **It does not yet meet the photorealism of the supplied reference.** Skin detail, hairlines and strand cards need a professional asset upgrade. The correct selection/preview architecture is now in place.

Initial hair styles: **Skin Fade, Taper Fade, Buzz Cut**. Beard styles: **Stubble, Short beard, Full beard**. These are nine combinations of the same face, eyes and body. Other marketplace styles remain available in discovery; they are not advertised as 3D choices.

## File map

| File | Role |
| --- | --- |
| `src/lib/style-assets.ts` | Authoritative runtime registry: canonical IDs, translated label keys, group names, model and preview paths, supported selection resolution and thumbnail lookup |
| `scripts/style-assets/build-contract.json` | Small Python-readable copy of IDs/groups, checked against the registry by optimizer and tests |
| `src/components/style-scene.ts` | Lazy GLTFLoader, local Meshopt decoder, unchanged shared human, independent group visibility, camera, lighting, interaction and resource cleanup |
| `src/components/interactive-style-hero.tsx` | Localized controls, combination thumbnails, mode/failure handling and existing discovery handoff |
| `public/models/human/chair-human.glb` | One compressed model with embedded WebP textures and all six groups |
| `public/models/human/asset-report.json` | Output sizes, hashes, compression and preview inventory |
| `public/style-previews/combinations/{hair}--{beard}.webp` | Nine 640×800 transparent renders, also used as thumbnails |
| `scripts/style-assets/source-manifest.json` | Pinned official sources, licenses, authors, sizes and checksums |
| `scripts/style-assets/SOURCES.md` | Research, source decisions, licenses and verified reproduction details |
| `tests/style-assets.test.ts`, `tests/style-model.test.ts` | Registry, actual decoded model, texture, preview and budget contracts |

The runtime contains no source downloads, Blender addon, external decoder URL or stock face substituted for a selected style. The existing credited `shop-1.jpg` supplies the blurred barber-room background.

## Geometry and material contract

The shared meshes include `CHAIR_BaseHuman`, separate eyes/corneas, eyebrows/lashes and `Body_BarberCape`. Exact variant roots are:

```text
hair_skin-fade       beard_stubble
hair_taper-fade      beard_short-beard
hair_buzz-cut        beard_full-beard
```

Each root owns its full independent groom. Export every root, including currently hidden variants. The viewer loads the GLB once, validates required roots/textures and toggles exactly one root per category. Selection made during loading is applied before the first ready frame. It never rebuilds head geometry on a click.

Do not flatten, join, merge across or rename these group boundaries during optimization. Keep the face/camera/scale unchanged for every combination. Original authoring axes are Blender Z-up with face toward -Y; GLB is Y-up, face toward +Z. Base identity sliders are fixed in `base_builder.py`. Hair/beard fitting runs before MakeHuman helper removal. The composer crops the chest under its cape without changing the face.

Skin uses its own albedo, baked tangent normal and roughness. Eye white/iris is opaque; the separate cornea uses transmission and IOR 1.376. Alpha strand cards use a common cutoff. Preserve individual materials and normal color-space rules. Do not replace the whole model with one skin material. The offline renderer and WebGL use different lighting engines, so their shading is not pixel-identical.

## Rebuild the shipped assets

Ordinary app development needs only Node and the checked-in production assets. Rebuilding requires Python 3.10+, curl, Blender **4.5.9 LTS**, and installed npm development dependencies. Use an official Blender distribution. This pipeline does not install Blender or modify saved Blender preferences.

From the repository root, replace `/path/to/blender` with the actual executable:

```sh
python3 scripts/style-assets/fetch_sources.py
python3 scripts/style-assets/fetch_sources.py --verify-only
/path/to/blender --background --factory-startup --disable-autoexec --python-exit-code 1 --python scripts/style-assets/base_builder.py --
/path/to/blender --background --factory-startup --disable-autoexec --python-exit-code 1 --python scripts/style-assets/bake_skin.py --
/path/to/blender --background --factory-startup --disable-autoexec --python-exit-code 1 --python scripts/style-assets/hair_variants.py --
/path/to/blender --background --factory-startup --disable-autoexec --python-exit-code 1 --python scripts/style-assets/beard_variants.py --
/path/to/blender --background --factory-startup --disable-autoexec --python-exit-code 1 --python scripts/style-assets/assemble.py --
node --import tsx scripts/style-assets/optimize.ts
npm test
```

Python scripts accept `--asset-root` after Blender's `--` separator, defaulting to `CHAIR_STYLE_ASSET_ROOT` or `.cache/style-assets`. If using a custom root, pass its `generated/assembled` directory to `optimize.ts`. Its final output always goes to the repository's `public/` directories. Run from the repository root.

The source fetcher checks HTTPS downloads and every pinned checksum, and fails on changed inputs. All authoring files, downloaded addon code, caches and renders remain in the ignored cache. The generated layout is:

```text
.cache/style-assets/generated/
  base.blend, base-portable.blend, base-portable.glb
  hair/hair-variants.glb
  beards/stubble.glb, short-beard.glb, full-beard.glb
  assembled/chair-human-raw.glb, figure.blend, {hair}--{beard}.png
```

`assemble.py` exports all geometry, applies the portable material factors, imports that exported GLB back into Blender, then renders every pair using one camera and one lighting setup. This roundtrip prevents previews of Blender-only surfaces being mistaken for the exported geometry. `--skip-previews` is for a quick geometry check; it does not produce a complete deployable asset update. Default preview quality is 40 denoised Cycles samples. Inspect all nine before optimization.

`optimize.ts` validates the build contract; deduplicates; encodes Meshopt with 16-bit positions; compresses color textures to WebP and the normal losslessly; writes nine WebPs and a hash report. No silhouette simplification is performed. Tests decode the final model and textures, not only the source manifest.

## Adding a style

1. Confirm commercial use and redistribution rights for the exact model, textures and derivative groom. Add source URLs, authors, license and pinned hashes to `source-manifest.json`; document any restrictions in `SOURCES.md`. Do not infer rights from a free download button.
2. Use an existing canonical hair ID from `style-selection.ts`, or explicitly extend its domain contract and relevant data when requested. Add a new beard ID there if needed. Do not invent barber eligibility, prices or service IDs merely to display a groom.
3. Fit the groom to the same full authoring body with `create_base(..., add_assets=...)`. Keep all face/eye vertices, transforms and scale unchanged. The hair/beard helpers demonstrate this callback. Remove temporary source/reference objects from exported selections.
4. Add the entry to `STYLE_ASSET_MANIFEST` with its label key and exact root name. Add all KA/EN/RU translations. Update the checked build contract. Register the new geometry in the appropriate builder and assembler input workflow.
5. Render the **entire Cartesian product** again. A fourth hair style means 12 combination previews. Use the same camera, lights, transparent background and exported material roundtrip. Do not use an unrelated face or a generic category photo.
6. Run optimization and the actual asset tests. Check that only the intended groom changes, every thumbnail path resolves, selection persists through locale/reload, and failed model loading still displays the correct pair.
7. Inspect front and both rotation limits for scalp/ear/lip/neck clipping and floating strands; inspect desktop and mobile. Review texture/geometry memory and transfer sizes. Current guardrails: model ≤8 MiB, all cached triangles ≤300k, any visible combination ≤150k, textures ≤2K, all previews ≤512 KiB. Reassess deliberately before increasing them.
8. Update this guide, asset/license report, verification and `PROJECT_MEMORY.md`; review staged files and commit/push to the existing repository. Keep large Blender/source caches out of Git.

## Photo View, errors and performance

The selected pair's same-human WebP is shown while 3D loads. Manual Photo View disposes the renderer. Import/model/texture/context failure or a 12-second deadline switches automatically to Photo View. Save-Data and reported device memory ≤2 GB initially choose Photo View; users can explicitly retry 3D. Browsers that do not expose those hints use the normal lazy-load path.

Photo mode retains the same selectors and discovery CTA. A missing preview shows a localized unavailable message and retry button. It never substitutes a different person. Returning to 3D restores the selected pair; the mode itself is per component session and is not saved across reload. An unsupported older stored style is preserved in storage until deliberate selection/CTA, with an explicit localized supported-preview notice.

3D renders on demand, pauses offscreen/when the document is hidden, caps pixel ratio at 1.25 on narrow viewports and 1.5 elsewhere, respects reduced motion and disposes GPU resources. All variants are cached in the one 7,556,172-byte model; only one hair/beard pair is visible (maximum 133,528 triangles). Nine previews total 225,666 bytes. These are asset budgets, not a measured real-phone FPS or GPU-memory guarantee.
