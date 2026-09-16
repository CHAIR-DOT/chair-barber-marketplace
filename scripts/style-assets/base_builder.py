"""Build the same CC0 male identity and portable eye surfaces.

create_base(root_path, add_assets=None) resets the scene to empty and returns
its cropped, smooth human mesh. An optional add_assets(human) callback runs
before helper removal so MHCLO clothing/grooms can fit the same identity.
root_path contains addon/mpfb and assets/ downloaded from official sources.
All caches/logs remain under root_path/runtime; no user settings are saved.
"""
from pathlib import Path
import argparse
import os
import sys

sys.dont_write_bytecode = True

def create_base(root_path, add_assets=None):
    ROOT = Path(root_path).expanduser().resolve()
    if not (ROOT / "addon/mpfb/blender_manifest.toml").is_file():
        raise FileNotFoundError("Run fetch_sources.py before building the human")
    os.environ['BLENDER_USER_CONFIG'] = str(ROOT/'runtime/config')
    os.environ['BLENDER_USER_DATAFILES'] = str(ROOT/'runtime/datafiles')
    os.environ['BLENDER_USER_SCRIPTS'] = str(ROOT/'runtime/scripts')
    import bpy, addon_utils, bmesh
    bpy.ops.wm.read_factory_settings(use_empty=True)
    bpy.context.preferences.system.use_online_access = False
    bpy.context.preferences.filepaths.use_scripts_auto_execute = False
    sys.path.insert(0, str(ROOT/'addon'))
    # An unpacked official extension is run as a temporary local module. Keep every
    # cache and log in this experiment folder; do not install or save user settings.
    def extension_path_user(package, path='', create=False):
        p = ROOT/'runtime'/path
        if create: p.mkdir(parents=True,exist_ok=True)
        return str(p)
    bpy.utils.extension_path_user = extension_path_user
    original_resource_path = bpy.utils.resource_path
    bpy.utils.resource_path = lambda kind: str(ROOT/'runtime') if kind=='USER' else original_resource_path(kind)
    addon_utils.enable('mpfb', default_set=True, persistent=False)
    from mpfb.services.humanservice import HumanService
    from mpfb.services.targetservice import TargetService
    from mpfb.services.exportservice import ExportService

    macro = TargetService.get_default_macro_info_dict()
    macro.update(gender=1.0,age=0.37,muscle=0.62,weight=0.48,proportions=0.65)
    macro['race']={'caucasian':1.0,'asian':0.0,'african':0.0}
    human = HumanService.create_human(macro_detail_dict=macro)
    human.name='CHAIR_BaseHuman'
    skin_dir = ROOT/'assets/skins/young_caucasian_male2'
    HumanService.set_character_skin(str(skin_dir/'young_caucasian_male2.mhmat'), human, skin_type='GAMEENGINE')
    for directory, filename, kind in [
     ('eyes/high-poly','high-poly.mhclo','Eyes'),
     ('eyebrows/eyebrow001','eyebrow001.mhclo','Eyebrows'),
     ('eyelashes/eyelashes01','eyelashes01.mhclo','Eyelashes')]:
        HumanService.add_mhclo_asset(str(ROOT/'assets'/directory/filename), human, asset_type=kind, material_type='GAMEENGINE', set_up_rigging=False)
    if add_assets is not None:
        add_assets(human)

    # Bake the chosen identity into geometry; do not export thousands of authoring targets.
    for obj in list(bpy.context.scene.objects):
        if obj.type=='MESH':
            bpy.context.view_layer.objects.active=obj
            obj.select_set(True)
            if obj.data.shape_keys:
                bpy.ops.object.shape_key_add(from_mix=True)
                keep=obj.data.shape_keys.key_blocks[-1]
                for key in list(obj.data.shape_keys.key_blocks):
                    if key!=keep: obj.shape_key_remove(key)
                obj.shape_key_clear()
            obj.select_set(False)
    ExportService.bake_modifiers_remove_helpers(human,bake_masks=True,bake_subdiv=False,remove_helpers=True)

    # Use a simple portable material: albedo, tangent normal, roughness and soft SSS.
    skin=bpy.data.materials.new('CHAIR_Skin_PBR');skin.use_nodes=True
    nodes=skin.node_tree.nodes;links=skin.node_tree.links
    bs=nodes.get('Principled BSDF')
    bs.inputs['Roughness'].default_value=.56
    bs.inputs['Specular IOR Level'].default_value=.28
    bs.inputs['Subsurface Weight'].default_value=.10
    bs.inputs['Subsurface Radius'].default_value=(1.0,.45,.25)
    bs.inputs['Subsurface Scale'].default_value=.002
    albedo=nodes.new('ShaderNodeTexImage');albedo.image=bpy.data.images.load(str(skin_dir/'young_lightskinned_male_diffuse2.png'))
    links.new(albedo.outputs['Color'],bs.inputs['Base Color'])
    noise=nodes.new('ShaderNodeTexNoise');noise.inputs['Scale'].default_value=560;noise.inputs['Detail'].default_value=2
    bump=nodes.new('ShaderNodeBump');bump.inputs['Strength'].default_value=.20;bump.inputs['Distance'].default_value=.00016
    links.new(noise.outputs['Fac'],bump.inputs['Height']);links.new(bump.outputs['Normal'],bs.inputs['Normal'])
    human.data.materials.clear();human.data.materials.append(skin)
    for obj in list(bpy.context.scene.objects):
        if obj.type=='MESH':
            if 'high-poly' in obj.name:
                eye=bpy.data.materials.new('CHAIR_BrownEyes_PBR');eye.use_nodes=True
                bs_eye=eye.node_tree.nodes.get('Principled BSDF');bs_eye.inputs['Roughness'].default_value=.24
                tex=eye.node_tree.nodes.new('ShaderNodeTexImage');tex.image=bpy.data.images.load(str(ROOT/'assets/eyes/materials/brown_eye.png'))
                eye.node_tree.links.new(tex.outputs['Color'],bs_eye.inputs['Base Color'])
                obj.data.materials.clear();obj.data.materials.append(eye)
                cornea=bpy.data.materials.new('CHAIR_Cornea');cornea.use_nodes=True
                bs_cornea=cornea.node_tree.nodes.get('Principled BSDF')
                bs_cornea.inputs['Base Color'].default_value=(1,1,1,1)
                bs_cornea.inputs['Roughness'].default_value=.035
                bs_cornea.inputs['IOR'].default_value=1.376
                bs_cornea.inputs['Transmission Weight'].default_value=1
                obj.data.materials.append(cornea)
                uv_layer=obj.data.uv_layers.active
                for polygon in obj.data.polygons:
                    coords=[uv_layer.data[k].uv for k in polygon.loop_indices]
                    if all(uv.x>.89 and uv.y<.14 for uv in coords):polygon.material_index=1
            if 'eyebrow' in obj.name or 'eyelashes' in obj.name:
                for mat in obj.data.materials:
                    if not mat or not mat.use_nodes:continue
                    for node in mat.node_tree.nodes:
                        if node.type=='BSDF_PRINCIPLED':
                            for link in list(node.inputs['Normal'].links):mat.node_tree.links.remove(link)
            for p in obj.data.polygons:p.use_smooth=True
            if obj==human:
                # Crop at upper chest for a compact portrait-only base.
                bm=bmesh.new();bm.from_mesh(obj.data)
                bmesh.ops.delete(bm,geom=[v for v in bm.verts if v.co.z<1.14],context='VERTS')
                bm.to_mesh(obj.data);bm.free()
                sub=obj.modifiers.new('Portrait detail','SUBSURF');sub.levels=1;sub.render_levels=1
    return human

def apply_portable_finish(human, root_path, normal_path=None):
    """Apply the verified 2K pore normal and restrained lashes to this identity."""
    import bpy
    root = Path(root_path).expanduser().resolve()
    normal_path = Path(normal_path) if normal_path else root / 'skin-micro-normal.png'
    mat=human.data.materials[0]
    bs=mat.node_tree.nodes.get('Principled BSDF')
    bs.inputs['Subsurface Scale'].default_value=.002
    texture=mat.node_tree.nodes.new('ShaderNodeTexImage')
    texture.image=bpy.data.images.load(str(normal_path),check_existing=True)
    texture.image.colorspace_settings.name='Non-Color'
    normal=mat.node_tree.nodes.new('ShaderNodeNormalMap')
    for link in list(bs.inputs['Normal'].links):mat.node_tree.links.remove(link)
    mat.node_tree.links.new(texture.outputs['Color'],normal.inputs['Color'])
    mat.node_tree.links.new(normal.outputs['Normal'],bs.inputs['Normal'])
    for obj in bpy.context.scene.objects:
        if 'eyelashes' not in obj.name:continue
        lashes=bpy.data.materials.new('CHAIR_SubtleEyelashes');lashes.use_nodes=True
        l_bs=lashes.node_tree.nodes.get('Principled BSDF')
        l_bs.inputs['Base Color'].default_value=(.045,.028,.02,1)
        l_bs.inputs['Roughness'].default_value=.8
        tex=lashes.node_tree.nodes.new('ShaderNodeTexImage')
        tex.image=bpy.data.images.load(str(root/'assets/eyelashes/eyelashes01/eyelashes01.png'),check_existing=True)
        fade=lashes.node_tree.nodes.new('ShaderNodeMath');fade.operation='MULTIPLY';fade.inputs[1].default_value=.42
        lashes.node_tree.links.new(tex.outputs['Alpha'],fade.inputs[0])
        lashes.node_tree.links.new(fade.outputs[0],l_bs.inputs['Alpha'])
        obj.data.materials.clear();obj.data.materials.append(lashes)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--asset-root", type=Path, default=Path(os.environ.get("CHAIR_STYLE_ASSET_ROOT", ".cache/style-assets")))
    parser.add_argument("--output", type=Path, help="Base Blender file; defaults to ASSET_ROOT/generated/base.blend")
    parser.add_argument("--authoring-output", type=Path, help="Optional full authoring mesh before helper removal and cropping")
    parser.add_argument("--baked-normal", type=Path, help="Existing pore normal to apply instead of the procedural material")
    arguments = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else sys.argv[1:]
    args = parser.parse_args(arguments)
    import bpy
    root = args.asset_root.expanduser().resolve()
    output = (args.output or root / "generated/base.blend").expanduser().resolve()
    def save_authoring(human):
        if args.authoring_output:
            path = args.authoring_output.expanduser().resolve()
            path.parent.mkdir(parents=True, exist_ok=True)
            bpy.ops.wm.save_as_mainfile(filepath=str(path))
    human = create_base(root, add_assets=save_authoring)
    if args.baked_normal:
        apply_portable_finish(human, root, args.baked_normal.expanduser().resolve())
    output.parent.mkdir(parents=True, exist_ok=True)
    bpy.ops.wm.save_as_mainfile(filepath=str(output))
    print(f"Built the fixed CC0 male identity: {output}")


if __name__ == "__main__":
    main()
