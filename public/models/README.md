# Local human model

`human/chair-human.glb` replaces the former Lee Perry-Smith scan. It contains one temporary MakeHuman/MPFB human with open eyes, a barber cape, three hair groups and three beard groups. It remains illustrative; it does not meet the supplied photographic reference.

## Rights and sources

The selected MakeHuman core human, clean young-caucasian-male2 skin, eyes, brows, lashes and Short01/Short02 hair assets are **CC0-1.0**. The beard/moustache sources by **RehmanPolanski** are the CC0 files in the official bodyparts05 pack. CHAIR. adds fitted derivatives, short fibers, a baked pore normal and the cape. The GPL authoring addon is not shipped as browser code. Retain the source record when replacing or redistributing assets.

- [MakeHuman asset license](https://static.makehumancommunity.org/about/license.html)
- [CC0 legal text](https://creativecommons.org/publicdomain/zero/1.0/legalcode)
- [Pinned sources, authors and hashes](../../scripts/style-assets/source-manifest.json)
- [Research and detailed source/license decisions](../../scripts/style-assets/SOURCES.md)
- [Rebuild and adding-style instructions](../../STYLE_ASSET_GUIDE.md)

## Packaged output

| Asset | Size / details |
| --- | --- |
| `human/chair-human.glb` | 7,556,172 bytes; 239,004 triangles across all cached variants; maximum 133,528 visible |
| `../style-previews/combinations/*.webp` | Nine distinct same-human 640×800 transparent renders, 225,666 bytes total |
| `human/asset-report.json` | Exact output SHA-256 hashes, byte sizes, group inventory and compression |

Meshopt geometry compression and embedded WebP textures (≤2K, lossless normal) are decoded locally. The model has independent skin, eye/cornea and groom materials. Runtime geometry and preview renders share the same exported source model; offline and browser shading differ. No animations, paid/private source files or runtime asset hotlinks are included.

Use the actual registry in `src/lib/style-assets.ts` for selection/group/preview correspondence. Do not revive the removed scan assets or the former 11-hair/6-beard procedural hero. The broader marketplace catalog is independent and remains intact.
