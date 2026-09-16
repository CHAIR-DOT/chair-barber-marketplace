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
its own lighting, framing, display material and interactive category highlights.
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

## Professional asset replacement

This is a realistic scanned base with a shaved scalp and facial stubble, not a
finished set of interchangeable haircut and beard meshes. Selections should
update the configuration and relevant category highlight; do not imply that the
scan predicts the selected haircut on the customer's face.

A later licensed professional asset may be placed in this directory, with its
own source, consent/license documentation, and optimized textures. Integrate it
through the scene's model-loading boundary, normalize its bounds/framing, and
define named hair/beard meshes or variants there. Preserve the canonical
selection IDs, accessible controls, discovery integration, loading state, and
WebGL fallback. Add attribution and changed-file details for any derived assets.
