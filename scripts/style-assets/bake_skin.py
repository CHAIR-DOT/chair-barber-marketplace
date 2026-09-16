"""Bake authored micropores into a portable tangent-space normal and export the base.

Run inside Blender with --background --factory-startup --disable-autoexec.
The input must contain CHAIR_BaseHuman with its procedural pore material.
"""

import argparse
import os
from pathlib import Path
import sys

sys.dont_write_bytecode = True


def bake_skin_normal(human, output_path, resolution=2048):
    """Bake the current material's normal, preserving geometry and the identity."""
    import bpy

    material = human.data.materials[0]
    image = bpy.data.images.new("CHAIR_Skin_Micro_Normal", width=resolution, height=resolution, alpha=False)
    image.colorspace_settings.name = "Non-Color"
    image.generated_color = (0.5, 0.5, 1, 1)
    texture = material.node_tree.nodes.new("ShaderNodeTexImage")
    texture.image = image
    material.node_tree.nodes.active = texture
    bpy.ops.object.select_all(action="DESELECT")
    human.select_set(True)
    bpy.context.view_layer.objects.active = human
    scene = bpy.context.scene
    scene.render.engine = "CYCLES"
    previous_samples = scene.cycles.samples
    scene.cycles.samples = 1
    scene.render.bake.margin = 8
    scene.render.bake.use_clear = True
    scene.render.bake.normal_space = "TANGENT"
    bpy.ops.object.bake(type="NORMAL")
    output_path = Path(output_path).expanduser().resolve()
    output_path.parent.mkdir(parents=True, exist_ok=True)
    image.filepath_raw = str(output_path)
    image.file_format = "PNG"
    image.save()
    scene.cycles.samples = previous_samples
    return output_path


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--asset-root", type=Path, default=Path(os.environ.get("CHAIR_STYLE_ASSET_ROOT", ".cache/style-assets")))
    parser.add_argument("--input", type=Path, help="Defaults to ASSET_ROOT/generated/base.blend")
    parser.add_argument("--output", type=Path, help="Defaults to ASSET_ROOT/generated/base-portable.blend")
    parser.add_argument("--glb", type=Path, help="Defaults to ASSET_ROOT/generated/base-portable.glb")
    parser.add_argument("--normal-output", type=Path, help="Defaults to ASSET_ROOT/skin-micro-normal.png")
    parser.add_argument("--resolution", type=int, choices=(512, 1024, 2048), default=2048)
    parser.add_argument("--preview", type=Path, help="Optional render path; input must already contain a camera and lights")
    parser.add_argument("--samples", type=int, default=32)
    arguments = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else sys.argv[1:]
    args = parser.parse_args(arguments)
    if args.samples < 1:
        parser.error("--samples must be positive")

    import bpy
    sys.path.insert(0, str(Path(__file__).resolve().parent))
    from base_builder import apply_portable_finish

    root = args.asset_root.expanduser().resolve()
    source = (args.input or root / "generated/base.blend").expanduser().resolve()
    output = (args.output or root / "generated/base-portable.blend").expanduser().resolve()
    glb = (args.glb or root / "generated/base-portable.glb").expanduser().resolve()
    normal = (args.normal_output or root / "skin-micro-normal.png").expanduser().resolve()
    bpy.context.preferences.filepaths.use_scripts_auto_execute = False
    bpy.ops.wm.open_mainfile(filepath=str(source), load_ui=False)
    human = bpy.data.objects.get("CHAIR_BaseHuman")
    if human is None:
        raise ValueError("Input has no CHAIR_BaseHuman object")
    if args.preview and bpy.context.scene.camera is None:
        raise ValueError("A preview requires a camera and lights in the input Blender file")

    bake_skin_normal(human, normal, args.resolution)
    apply_portable_finish(human, root, normal)
    bpy.context.scene.cycles.samples = args.samples
    output.parent.mkdir(parents=True, exist_ok=True)
    glb.parent.mkdir(parents=True, exist_ok=True)
    bpy.ops.wm.save_as_mainfile(filepath=str(output))
    for obj in bpy.context.scene.objects:
        obj.select_set(obj.type == "MESH")
    bpy.ops.export_scene.gltf(
        filepath=str(glb), export_format="GLB", use_selection=True,
        export_apply=True, export_animations=False, export_morph=False,
    )
    if args.preview:
        preview = args.preview.expanduser().resolve()
        preview.parent.mkdir(parents=True, exist_ok=True)
        bpy.context.scene.render.filepath = str(preview)
        bpy.context.scene.render.image_settings.file_format = "PNG"
        bpy.ops.render.render(write_still=True)
    print(f"Baked normal: {normal}\nPortable scene: {output}\nGLB: {glb}")


if __name__ == "__main__":
    main()
