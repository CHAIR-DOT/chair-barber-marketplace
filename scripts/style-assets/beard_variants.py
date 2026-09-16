"""Fit and export the three beard variants using pinned local CC0 sources.

Run in Blender with --background --factory-startup --disable-autoexec.
add_beard_variants(human, asset_root=None) must run before deleting MakeHuman
helper vertices; base_builder.create_base supports an add_assets callback.
All generated objects use world-space coordinates and preserve the base face.
"""
import argparse
import bisect
import json
import math
import os
import random
import struct
import sys
from pathlib import Path

sys.dont_write_bytecode = True

def resolve_asset_root(asset_root=None):
    """Use the same cache layout as fetch_sources.py and base_builder.py."""
    return Path(asset_root or os.environ.get("CHAIR_STYLE_ASSET_ROOT", ".cache/style-assets")).expanduser().resolve()

def apply_exported_beard_tint(path):
    """Preserve the Blender Multiply tint as portable glTF baseColorFactor.

    Blender's glTF exporter drops this MixRGB tint; round-trip rendering
    confirmed the discrepancy. This changes JSON material factors only.
    """
    path=Path(path);data=path.read_bytes()
    if len(data)<20 or data[:4]!=b'glTF' or data[16:20]!=b'JSON':
        raise ValueError("Expected a binary glTF 2.0 file with a JSON first chunk")
    if struct.unpack_from('<I',data,4)[0]!=2 or struct.unpack_from('<I',data,8)[0]!=len(data):
        raise ValueError("Invalid binary glTF version or file length")
    size=struct.unpack_from('<I',data,12)[0]
    gltf=json.loads(data[20:20+size])
    for material in gltf.get('materials',[]):
        if material.get('name','').startswith('CHAIR_BeardCards_'):
            material.setdefault('pbrMetallicRoughness',{})['baseColorFactor']=[.33,.22,.15,1]
    body=json.dumps(gltf,separators=(',',':')).encode()
    body+=b' '*((-len(body))%4)
    remainder=data[20+size:]
    header=struct.pack('<4sII',b'glTF',2,20+len(body)+len(remainder))
    path.write_bytes(header+struct.pack('<I4s',len(body),b'JSON')+body+remainder)

def add_beard_variants(human, asset_root=None):
    """Return canonical-ID lists of fitted mesh objects without changing identity.

    Sources live under ASSET_ROOT/assets/clothes and are downloaded and hashed
    by fetch_sources.py. Run before base mesh helpers or shape targets are baked.
    These exact attachment heights belong to the fixed base_builder identity.
    """
    import bpy
    from mathutils.bvhtree import BVHTree
    from mathutils import Vector
    from mpfb.services.humanservice import HumanService
    ASSETS = resolve_asset_root(asset_root) / 'assets/clothes'
    for slug, texture in [
        ('rehmanpolanski_beard_viking', 'BeardViking.png'),
        ('rehmanpolanski_moustache_viking', 'MoustacheViking.png'),
    ]:
        for filename in (slug + '.mhclo', texture):
            if not (ASSETS / slug / filename).is_file():
                raise FileNotFoundError(f"Missing beard source {slug}/{filename}; run fetch_sources.py first")
    sources=[]
    for slug, texture, suffix in [
        ('rehmanpolanski_beard_viking','BeardViking.png','jaw'),
        ('rehmanpolanski_moustache_viking','MoustacheViking.png','moustache')]:
        obj=HumanService.add_mhclo_asset(str(ASSETS/slug/(slug+'.mhclo')),human,asset_type='Clothes',subdiv_levels=0,material_type='NONE',set_up_rigging=False)
        bpy.context.view_layer.update()
        mesh=bpy.data.meshes.new_from_object(obj.evaluated_get(bpy.context.evaluated_depsgraph_get()))
        matrix=obj.matrix_world.copy()
        obj.data=mesh
        obj.modifiers.clear()
        obj.parent=None
        obj.matrix_world=matrix
        # Store positions in the shared human's world coordinate system.
        for vertex in mesh.vertices: vertex.co=matrix @ vertex.co
        obj.matrix_world.identity()
        material=bpy.data.materials.new('CHAIR_BeardCards_'+suffix)
        material.use_nodes=True
        material.surface_render_method='DITHERED'
        material.use_backface_culling=False
        nodes=material.node_tree.nodes; links=material.node_tree.links
        bs=nodes.get('Principled BSDF')
        bs.inputs['Roughness'].default_value=.83
        bs.inputs['Specular IOR Level'].default_value=.2
        tex=nodes.new('ShaderNodeTexImage')
        tex.image=bpy.data.images.load(str(ASSETS/slug/texture),check_existing=True)
        # Image itself is unchanged; tint is part of the groom material.
        tint=nodes.new('ShaderNodeMixRGB');tint.blend_type='MULTIPLY'
        tint.inputs[0].default_value=1
        tint.inputs[2].default_value=(.33,.22,.15,1)
        links.new(tex.outputs['Color'],tint.inputs[1])
        links.new(tint.outputs[0],bs.inputs['Base Color'])
        links.new(tex.outputs['Alpha'],bs.inputs['Alpha'])
        mesh.materials.clear();mesh.materials.append(material)
        for p in mesh.polygons: p.use_smooth=True
        sources.append((obj,suffix))

    # The evaluated base has the helper mask applied, so nearest points are skin.
    bpy.context.view_layer.update()
    human_mesh=bpy.data.meshes.new_from_object(human.evaluated_get(bpy.context.evaluated_depsgraph_get()))
    matrix=human.matrix_world
    skin=BVHTree.FromPolygons([matrix@v.co for v in human_mesh.vertices],[list(p.vertices) for p in human_mesh.polygons])
    # Limit groom shortening to the jaw attachment, excluding the neck. Nearest
    # points on the neck would leave long Viking tips dangling after shortening.
    skin_points=[matrix@v.co for v in human_mesh.vertices]
    jaw_skin=BVHTree.FromPolygons(skin_points,[list(p.vertices) for p in human_mesh.polygons if min(skin_points[i].z for i in p.vertices)>1.355])
    variants={}
    for name, fraction, clearance in [('full-beard',.55,.0012),('short-beard',.23,.0008)]:
        parts=[]
        for source,suffix in sources:
            obj=source.copy();obj.data=source.data.copy();bpy.context.collection.objects.link(obj)
            obj.name='beard_'+name+'_'+suffix
            if fraction<1:
                for vertex in obj.data.vertices:
                    point,normal,_,distance=(jaw_skin if suffix=='jaw' else skin).find_nearest(vertex.co)
                    if point is not None:
                        vertex.co=point+(vertex.co-point)*fraction+normal*clearance
                        if name=='full-beard' and suffix=='jaw':
                            # A soft, rounded lower outline, with the chin center
                            # a little longer than its corners. No solid shell.
                            floor=1.336+.12*abs(vertex.co.x)
                            if vertex.co.z<floor+.008:
                                vertex.co.z=floor+.008*math.tanh((vertex.co.z-floor)/.008)
            obj.data.update()
            parts.append(obj)
            if name=='full-beard' and suffix=='jaw':
                # A second inset card layer gives the jaw optical density while
                # retaining alpha-separated fibers at its outer silhouette.
                inner=obj.copy();inner.data=obj.data.copy();bpy.context.collection.objects.link(inner)
                inner.name='beard_full-beard_jaw_density'
                for vertex in inner.data.vertices:
                    point,normal,_,_=jaw_skin.find_nearest(vertex.co)
                    if point is not None:
                        vertex.co=point+(vertex.co-point)*.88+normal*.0003
                        vertex.co.x+=.0007
                inner.data.update();parts.append(inner)
        variants[name]=parts
    # Stubble consists of individually tapered 1–2 mm hairs. Reusing compressed
    # beard cards proved patchy in the rendered study, so keep genuine lengths.
    rng = random.Random(1947)
    vertices=[];faces=[];occupied=set()
    for source,suffix in sources:
        mesh=source.data;mesh.calc_loop_triangles()
        triangles=list(mesh.loop_triangles)
        areas=[];total=0
        for triangle in triangles:
            total+=triangle.area;areas.append(total)
        uv=mesh.uv_layers.active.data
        image=next(n.image for n in mesh.materials[0].node_tree.nodes if n.type=='TEX_IMAGE')
        pixels=list(image.pixels);width,height=image.size
        wanted=4300 if suffix=='jaw' else 800
        placed=0
        for attempt in range(wanted*18):
            triangle=triangles[bisect.bisect_left(areas,rng.random()*total)]
            a,b,c=[mesh.vertices[i].co for i in triangle.vertices]
            root=math.sqrt(rng.random());ratio=rng.random()
            weights=(1-root,root*(1-ratio),root*ratio)
            uv_point=sum((uv[loop].uv*weight for loop,weight in zip(triangle.loops,weights)),Vector((0,0)))
            px=max(0,min(width-1,int(uv_point.x*width)));py=max(0,min(height-1,int(uv_point.y*height)))
            if pixels[(py*width+px)*4+3]<.3: continue
            origin=a*weights[0]+b*weights[1]+c*weights[2]
            point,normal,_,distance=skin.find_nearest(origin)
            if point is None or point.z<1.352 or normal.y>.35: continue
            key=tuple(round(v/.0008) for v in point)
            if key in occupied:continue
            occupied.add(key)
            down=Vector((rng.uniform(-.2,.2),0,-1))
            tangent=(down-normal*down.dot(normal)).normalized()
            direction=(normal*.48+tangent*.8).normalized()
            root_point=point+normal*.00012
            tip=root_point+direction*rng.uniform(.0008,.0018)
            side=normal.cross(direction).normalized()*rng.uniform(.000065,.00010)
            across=direction.cross(side).normalized()*side.length
            start=len(vertices)
            vertices.extend([root_point-side,root_point+side,tip,root_point-across,root_point+across,tip])
            faces.extend([(start,start+1,start+2),(start+3,start+4,start+5)])
            placed+=1
            if placed>=wanted:break
        print('STUBBLE_STRANDS',suffix,placed,flush=True)
    stubble_mesh=bpy.data.meshes.new('Stubble_tapered_fibers');stubble_mesh.from_pydata(vertices,[],faces);stubble_mesh.update()
    stubble=bpy.data.objects.new('beard_stubble_fibers',stubble_mesh);bpy.context.collection.objects.link(stubble)
    material=bpy.data.materials.new('CHAIR_Stubble_PBR');material.use_nodes=True
    bs=material.node_tree.nodes.get('Principled BSDF');bs.inputs['Base Color'].default_value=(.027,.018,.012,1);bs.inputs['Roughness'].default_value=.86
    stubble_mesh.materials.append(material)
    variants['stubble']=[stubble]
    for source,_ in sources: bpy.data.objects.remove(source,do_unlink=True)
    bpy.data.meshes.remove(human_mesh)
    return variants


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--asset-root', type=Path, help='Pinned source cache; defaults to CHAIR_STYLE_ASSET_ROOT or .cache/style-assets')
    parser.add_argument('--output-dir', type=Path, help='Defaults to ASSET_ROOT/generated/beards')
    parser.add_argument('--blend', type=Path, help='Optional authoring scene containing the base and all three variants')
    arguments = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else sys.argv[1:]
    args = parser.parse_args(arguments)
    import bpy
    sys.path.insert(0, str(Path(__file__).resolve().parent))
    from base_builder import create_base

    root = resolve_asset_root(args.asset_root)
    output = (args.output_dir or root / 'generated/beards').expanduser().resolve()
    output.mkdir(parents=True, exist_ok=True)
    variants = {}
    create_base(root, add_assets=lambda human: variants.update(add_beard_variants(human, root)))
    stats = {}
    for name, parts in variants.items():
        bpy.ops.object.select_all(action='DESELECT')
        for obj in parts:
            obj.hide_set(False)
            obj.hide_render = False
            obj.select_set(True)
        destination = output / (name + '.glb')
        bpy.ops.export_scene.gltf(filepath=str(destination), export_format='GLB', use_selection=True,
                                  export_apply=True, export_animations=False, export_morph=False)
        apply_exported_beard_tint(destination)
        stats[name] = {
            'file': destination.name,
            'bytes': destination.stat().st_size,
            'vertices': sum(len(obj.data.vertices) for obj in parts),
            'triangles': sum(len(p.vertices) - 2 for obj in parts for p in obj.data.polygons),
            'meshes': [obj.name for obj in parts],
        }
    (output / 'beard-stats.json').write_text(json.dumps(stats, indent=2) + '\n')
    if args.blend:
        destination = args.blend.expanduser().resolve()
        destination.parent.mkdir(parents=True, exist_ok=True)
        for name, parts in variants.items():
            for obj in parts:
                obj.hide_render = name != 'stubble'
                obj.hide_set(name != 'stubble')
        bpy.ops.wm.save_as_mainfile(filepath=str(destination))
    print(json.dumps(stats, indent=2))


if __name__ == '__main__':
    main()
