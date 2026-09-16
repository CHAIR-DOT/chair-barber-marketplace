# Human asset sources and reproducible base

Research and verification date: **16 September 2026**.

## Decision and quality limits

The current base uses a fixed MakeHuman identity, a clean core skin, separate brown eyes and corneas, eyebrows, and restrained eyelashes. It is a **temporary CC0 model**, chosen because its source files can be reproduced and redistributed, its head fits interchangeable grooms, and it does not require an account or a paid authoring application. MakeHuman documents its core asset license separately from its software licenses. [MakeHuman licensing](https://static.makehumancommunity.org/about/license.html)

The result does **not** match the photographic quality of the user's reference. The face and skin remain generic, the pore normal is authored noise rather than scanned skin detail, and the available hair cards have limited strand realism. A professionally surfaced human and a matched, optimized set of grooms remain the preferred replacement. Do not describe this interim model as a scan, a photorealistic digital human, or an accurate personal try-on.

### Sources considered

| Source | License and practical route | Assessment for this project |
| --- | --- | --- |
| [MPFB / MakeHuman](https://github.com/makehumancommunity/mpfb2) | MPFB code is GPL-3.0-or-later; bundled model assets are CC0. Blender can generate an identity and fit MHCLO assets before exporting GLB. | Selected temporary base. Reproducible, modular, and compact after cropping and baking; lower skin and groom quality than the reference. |
| [Blender Studio Einar](https://studio.blender.org/characters/einar/v1/) | CC-BY character, downloadable Blender source. Redistribution requires the specified credit. | Source downloaded and rendered during evaluation. Stronger detail, but the older, receding, injured face was the wrong identity; the large authoring scene also needs extensive surfacing and geometry preparation. Not included in the app. |
| [Blender realistic human base mesh](https://studio.blender.org/training/realistic-human-research/use-of-base-meshes/) | This linked male base is CC-BY and supplied as a Blender file. | Useful anatomy foundation; requires completed skin, eye, and groom work. This specific asset should not be confused with other Blender demo assets under CC0. |
| [Microsoft Rocketbox](https://github.com/microsoft/Microsoft-Rocketbox) | Repository now uses MIT; rigged avatars are supplied in FBX with textures and levels of detail. | Legally usable, but the older, lower-detail characters are a weak match for a close barber portrait. Not downloaded into the selected source set. |
| [3D Scan Store free head](https://www.3dscanstore.com/blog/Free-3D-Head-Model) | The free 1.9 GB sample lists personal use only. Includes head/eye components, Blender scene, and 8K texture maps. Commercial use requires contacting the supplier. | Good technical benchmark; not selected for this redistributable project. A professional replacement needs rights that cover the intended web delivery of its model and textures. |
| [MetaHuman](https://www.metahuman.com/license?lang=en-US) | Uses Epic's current Unreal Engine license. The official page permits use with other engines and creative software. Creator is supplied through Unreal Engine, with DCC export workflows. [Download workflow](https://www.metahuman.com/download?lang=en-US) | A possible professional pipeline. It is not a ready-to-ship GLB: the project would still need character authoring, material baking, optimized hair cards, and validation of the specific distribution terms. No Epic installation or assets were added. |
| [Daniel's textured male head](https://sketchfab.com/3d-models/male-head-textured-57058a999dee423899cc712099e328de) | The creator lists CC Attribution for this particular asset. | Semi-realistic and relatively small, but its baked hairstyle and head-only presentation do not provide the required independent groom system. Not selected. |

These are source assessments, not guarantees that every asset offered by a provider has the same license. The application contains only the selected assets and project-authored derivatives described below.

## Selected source provenance

The machine-readable [source manifest](source-manifest.json) records exact HTTPS URLs, byte counts, SHA-256 hashes, and CRC32 values for selected ZIP members. SHA-256 pins the downloaded bytes; ZIP CRC32 is an additional archive integrity check.

- **MPFB 2.0.17:** official Blender extension, 45,031,536-byte archive. Archive SHA-256: `4f0a879d64a39bf646fbf5f53601ac678855da329d650617dca5737548239a87`. Its code is GPL-3.0-or-later; its bundled meshes and targets use the separate [CC0 asset license](https://github.com/makehumancommunity/mpfb2/blob/v2.0.17/LICENSE.ASSETS.md). The authoring addon is not part of the browser bundle.
- **MakeHuman core system assets:** clean `young_caucasian_male2` skin and diffuse, high-poly eyes, brown eye texture/material, `eyebrow001`, and `eyelashes01`. The selected files come from the official [system asset pack](https://static.makehumancommunity.org/assets/assetpacks/makehuman_system_assets.html). Credits retained for MakeHuman Community, Data Collection AB, Joel Palmius, and Jonas Hauquier.
- **Short01 and Short02 hair:** CC0 core meshes, fitting definitions, materials, and strand textures from that same official system pack. Nine selected source files are pinned individually; the two source thumbnails are excluded. `hair_variants.py` fits both card grooms to the unchanged human before removing helpers, crops the Skin Fade sides, fits Taper Fade sides closer to the scalp, and adds deterministic fine transition fibers. Buzz Cut uses original generated short fibers and a feathered vertex-color density layer. The source hair images are unchanged; application thumbnails come from the final assembled model, not these source thumbnails.
- **Viking beard and moustache:** source files by RehmanPolanski from the official [bodyparts05 CC0 pack](https://static.makehumancommunity.org/assets/assetpacks/bodyparts05.html). The manifest selects only the two required directories, without thumbnails. The full archive was independently verified as 6,616,507 bytes, SHA-256 `262bba42246f85b2a91f493dd920296b258a3b4544eb495c91c4d08e57c528fd`; the fetcher verifies each selected member instead of downloading the whole pack. Shape fitting, shorter variants, tint, and stubble geometry are authored in the project pipeline.
- **Skin pore normal:** generated by the project from procedural noise and baked into a 2K tangent-space texture. It is not a third-party scan or an Aksel normal map.

The Aksel skin from the [skins02 pack](https://static.makehumancommunity.org/assets/assetpacks/skins02.html) was inspected and rejected: its actual diffuse includes facial injuries. Neither that diffuse nor its corresponding normal is in the selected source set. Do not restore it merely because its sample has stronger skin detail.

## Reproduce the base

Use Python 3.10 or newer, `curl`, and Blender **4.5.9 LTS**. The authoring run was tested with the official macOS arm64 build. Its DMG SHA-256 is `e3a3d7aac381fb4e4d05197f99cd8899484d7e8bc4497c134066e6733f372238`, matching the [official checksum file](https://download.blender.org/release/Blender4.5/blender-4.5.9.sha256). Other platforms should use their corresponding official Blender binary and checksum; the fetcher does not install Blender.

Run from the repository root. Replace `/path/to/blender` with the installed Blender executable.

```sh
python3 scripts/style-assets/fetch_sources.py
python3 scripts/style-assets/fetch_sources.py --verify-only

/path/to/blender --background --factory-startup --disable-autoexec --python-exit-code 1 \
  --python scripts/style-assets/base_builder.py -- \
  --asset-root .cache/style-assets \
  --authoring-output .cache/style-assets/generated/authoring.blend

/path/to/blender --background --factory-startup --disable-autoexec --python-exit-code 1 \
  --python scripts/style-assets/bake_skin.py -- \
  --asset-root .cache/style-assets
```

All scripts accept `--asset-root`; its default is `CHAIR_STYLE_ASSET_ROOT` when set, otherwise `.cache/style-assets`. That folder is ignored by Git. Paths are expanded and resolved, with no dependence on a particular temporary folder or username.

The cache layout is:

```text
asset-root/
  downloads/                 # Verified MPFB archive
  addon/mpfb/                # Extracted official addon
  assets/                    # Selected original pack paths
  runtime/                   # Isolated addon config, logs, and cache
  skin-micro-normal.png      # Authored 2K normal bake
  generated/
    authoring.blend          # Optional unbaked body and fitting helpers
    base.blend               # Cropped base with procedural skin material
    base-portable.blend      # Same base with baked normal and finished lashes
    base-portable.glb        # Uncompressed evaluation export
```

`fetch_sources.py` validates the addon archive before extracting it, uses HTTPS with system certificate verification, and verifies every selected asset's pinned bytes before writing it. `--verify-only` makes no network requests or writes. The source packs must continue supporting HTTP byte ranges; a changed or missing source fails validation instead of silently using a substitute.

The base builder loads the addon only in the running Blender process. It redirects both Blender's user-resource lookup and MPFB's extension paths to `asset-root/runtime`, disables online checks, and never saves Blender preferences. Running with `--factory-startup --disable-autoexec` also avoids loading personal startup scenes or executing scripts embedded in input files.

## Integration contract

`create_base(asset_root, add_assets=None)` resets the current Blender scene and returns the cropped `CHAIR_BaseHuman` mesh. Its optional `add_assets(human)` callback runs while the full body and fitting helpers still exist. Import hair or beard MHCLO assets inside that callback, then let the builder bake the chosen identity and remove helpers. Keep the returned head geometry fixed when producing all groom variants.

The identity parameters are gender `1.0`, age `0.37`, muscle `0.62`, weight `0.48`, proportions `0.65`, and the core caucasian macro at `1.0`. These are MakeHuman slider values, not literal years or physical measurements. The Blender scene uses meters; the cropped mesh spans approximately Z `1.14–1.586`, with eye surfaces around `1.464–1.495`. A portrait target near Z `1.455` correctly frames this identity. GLB export converts Blender's Z-up coordinates to glTF Y-up.

`bake_skin_normal(human, output_path, resolution=2048)` bakes the procedural material normal. `apply_portable_finish(human, asset_root, normal_path=None)` attaches that normal and softens the eyelashes. `bake_skin.py` exports meshes only, with applied modifiers, no animation, and no authoring morph targets. It does not add a cape, camera, lights, hair, or beard to its default output. Its optional `--preview` requires a camera and lights already present in the input scene.

### Reproduce the hair groups

`add_hair_variants(human, asset_root=None)` must run in `create_base`'s callback while the source body's full helper topology and identity shape keys remain intact. It returns `skin-fade`, `taper-fade`, and `buzz-cut` groups named `hair_skin-fade`, `hair_taper-fade`, and `hair_buzz-cut`. No facial geometry is changed. The standalone CLI performs this sequence and exports only the three groom groups:

```sh
/path/to/blender --background --factory-startup --disable-autoexec --python-exit-code 1 \
  --python scripts/style-assets/hair_variants.py -- \
  --asset-root .cache/style-assets
```

Output defaults to `ASSET_ROOT/generated/hair/hair-variants.glb`; `--output` overrides it and `--blend` optionally saves the authoring scene. The raw shared hair export is about 15.1 MB and is an intermediate file that must pass through the final scene optimizer. Its geometry exactly preserves the reviewed hair study; do not reduce or regenerate it after a final preview has been approved without regenerating matching previews.

Preserve these details when integrating or replacing the base:

- Keep the original eye UVs. The outer cornea faces use the bottom-right transparent UV island (`u > 0.89`, `v < 0.14`) and must have a separate transmissive surface; making them opaque produces black eyes. The iris/sclera material remains opaque.
- Retain `KHR_materials_transmission` and `KHR_materials_ior` support for clear corneas. The reviewed cornea has IOR `1.376` and roughness `0.035`.
- Treat the skin normal as non-color data. The authored skin uses roughness `0.56` and a Blender subsurface scale of `0.002` meters. Subsurface settings are authoring settings, not a portable glTF guarantee; inspect the real web renderer too.
- Beard color must survive export. The beard helper's `apply_exported_beard_tint(path)` patches the intended glTF base color factor because Blender's multiply node does not carry the tint into GLB automatically.
- The base export is an authoring/intermediate result. The final application composer must provide its own optimization, geometry budgets, camera, lighting, cape, and separately selectable grooms. Refer to the project's style asset guide for the final application contract.

## Verification performed

On 16 September 2026, the project copies of these scripts were exercised against a fresh isolated source folder:

- Downloaded and verified the pinned MPFB addon plus 14 core source files, then the 8 selected beard/moustache files.
- Re-ran `--verify-only` successfully against all 22 selected files and the extracted addon.
- Ran the actual base CLI with Blender 4.5.9, producing both the full authoring source and the cropped base.
- Ran the actual baking/export CLI, producing the 2K normal, portable Blender file, and a 7,608,012-byte GLB containing 45,608 triangles.
- Compared every exported mesh's position-buffer hash with the previously rendered and reviewed base: all matched. Verified the skin normal texture and the two cornea extensions in the fresh GLB.
- Confirmed the build did not create MPFB configuration in the user's Blender 4.5 support folder. Python compile checks passed without creating bytecode files in the repository.
- Ran the repository hair CLI against a separate normalized source cache. All six mesh POSITION-buffer hashes exactly matched the reviewed original hair export; the rebuilt GLB was 15,128,028 bytes. This verifies that fitting before helper removal preserves the scalp fibers and the two card meshes.
- Downloaded the nine pinned hair files into the isolated validation cache using the repository fetcher, then successfully re-ran `--verify-only` against the addon and all 31 selected source files. This extends the earlier 22-file base/beard check above.

These checks establish reproducible source preparation and base geometry. They do not claim that the photographic reference has been reached or replace visual checks of the composed scene in the application.
