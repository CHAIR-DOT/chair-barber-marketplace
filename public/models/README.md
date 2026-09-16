# Local hero model

## Included scan and attribution

**Infinite, 3D Head Scan — Lee Perry-Smith**, based on a work at
[triplegangers.com](https://www.triplegangers.com/), distributed under
[Creative Commons Attribution 3.0 Unported](https://creativecommons.org/licenses/by/3.0/).

Downloaded 16 September 2026 from the
[official Three.js example assets](https://github.com/mrdoob/three.js/tree/8f24439631c052231f9661b81633e7ab514f25a5/examples/models/gltf/LeePerrySmith),
pinned to commit `8f24439631c052231f9661b81633e7ab514f25a5`.
The asset-specific [original license notice](lee-perry-smith/LeePerrySmith_License.txt)
and [full CC BY 3.0 license](lee-perry-smith/CC-BY-3.0.txt) accompany the files.
The model's license is distinct from the Three.js library license.

The included geometry and textures are unmodified upstream files. CHAIR. supplies
its own lighting, framing, display material, category highlights and original procedural hair/beard child meshes.
The scan is an illustrative model, not an identity or endorsement of a fictional
marketplace barber. Keep visible attribution near the model and retain these
notices when redistributing the assets.

## Runtime assets

| File | Bytes | Purpose |
| --- | ---: | --- |
| `lee-perry-smith/LeePerrySmith.glb` | 404,976 | Single scanned head mesh; 9,279 vertices / 17,684 triangles |
| `lee-perry-smith/Map-COL.jpg` | 148,269 | 1024 × 1024 color texture |
| `lee-perry-smith/Infinite-Level_02_Tangent_SmoothUV.jpg` | 146,793 | 1024 × 1024 tangent normal texture |

Total runtime files: **700,038 bytes** (about 684 KiB), served locally. The larger
specular and displacement files from upstream are deliberately omitted. No
Draco decoder, rig, animations, external texture URL or hidden model dependency
is required. The GLB uses glTF 2.0 with embedded geometry; its textures must be
assigned by the scene.

SHA-256 checksums:

```text
402b8a8ac9f03232e6d64b5962929703a069daf99d3c49ac8eb0e48bedc9c576  LeePerrySmith.glb
e976d73b31407f8d0967412bf468019ed26a5d5a32cf5811aabff7e816458a65  Map-COL.jpg
36925e51ad9b324b94e8faf4692da1b4132809f2762bb8d5bd549ffd215d4ca6  Infinite-Level_02_Tangent_SmoothUV.jpg
7cf4da43a6ae6d32f7f7d063fe129a19468af6f4fe7c53b937f83959709fcb50  LeePerrySmith_License.txt
```

## Fitted style variants

The upstream GLB contains one static scan, with no interchangeable nodes or morph
attributes. CHAIR. generates original, illustrative geometry around that scan:

- `style-hair-variants.ts`: eleven canonical hairstyle groups under `hair-variants`,
  each named by the existing hair ID. A shared radial field raycasts the skull;
  fitted shells, tapered flowing strands, curls and long locks create different
  silhouettes. Materials and a small procedural fiber texture are shared.
- `style-beard-variants.ts`: six groups named `beard-<canonical-id>` under
  `chair-beard-variants`. Barycentric samples of the scan's UV triangles position
  cheeks/chin/moustache shells and instanced strands. Lip/cheek boundaries clip
  triangles precisely. Stubble is strands only; clean-shaven adds no geometry.
- `style-scene.ts` attaches both groups to the scan mesh after assigning its skin
  material. `setSelection` remembers choices during loading, then changes group
  visibility and requests a render. There is no scene reload or per-choice fetch.
  Dispose variant resources before traversing the remaining model.

All variants are cached at first load. Hair creation is roughly 1.1 seconds and
beard creation about 0.1 seconds in local Node geometry tests; these are setup
measurements, not a mobile benchmark. The scan and three runtime asset files stay
unchanged. New geometry is authored in source rather than downloaded.

## Remaining limitations and professional replacement

Styles are sculpted illustrations, not professional groomed assets or a prediction
on the customer's face. The scan has closed eyes and baked subtle facial stubble;
clean-shaven removes added meshes but does not erase that texture. These scalp and
UV masks are fitted to this scan specifically, not a general-purpose human rig.

A later licensed professional model may replace the scan/variant boundary with
properly named hair and beard nodes. Document its source/license, normalize its
bounds/framing and reauthor the fitting rules if keeping procedural variants.
Preserve canonical IDs, accessible controls, attribution, reduced motion,
automatic WebGL fallback and existing discovery/booking integration.
