"""Build the reviewed three hair variants from pinned CC0 MakeHuman sources.

add_hair_variants(human, asset_root=None) runs inside base_builder.create_base's
add_assets callback, before helper removal and identity shape-key baking.
Run the CLI with Blender --background --factory-startup --disable-autoexec.
"""
import argparse
import os
from pathlib import Path
import sys

sys.dont_write_bytecode = True


def resolve_asset_root(asset_root=None):
    return Path(asset_root or os.environ.get("CHAIR_STYLE_ASSET_ROOT", ".cache/style-assets")).expanduser().resolve()


def add_hair_variants(human, asset_root=None):
    """Return canonical hair-ID groups without modifying the fixed human face.

    The exact scalp thresholds and seed belong to the base_builder identity.
    Do not use a cropped or shape-key-baked replacement as the source body.
    """
    import bpy, bmesh, math, random
    from mathutils import Vector
    from mathutils.bvhtree import BVHTree
    from mpfb.services.humanservice import HumanService

    root = resolve_asset_root(asset_root)
    assets = root / "assets/hair"
    if human.data.shape_keys is None:
        raise ValueError("Hair fitting requires the full unbaked identity and helpers; use create_base's add_assets callback")
    fitted = {}
    for name in ("short01", "short02"):
        path = assets / name / (name + ".mhclo")
        if not path.is_file():
            raise FileNotFoundError(f"Missing {path}; run fetch_sources.py first")
        fitted[name] = HumanService.add_mhclo_asset(
            str(path), human, asset_type="Hair", material_type="GAMEENGINE", set_up_rigging=False,
        )
    # Freeze already fitted hair, without touching the human identity.
    bpy.context.view_layer.update()
    dg=bpy.context.evaluated_depsgraph_get()
    mesh=human.evaluated_get(dg).to_mesh()
    vertices=[human.matrix_world @ v.co for v in mesh.vertices]
    polygons=[list(p.vertices) for p in mesh.polygons]
    bvh=BVHTree.FromPolygons(vertices,polygons)

    mat=bpy.data.materials.new('Hair_fine_fibers');mat.use_nodes=True
    bs=mat.node_tree.nodes.get('Principled BSDF');bs.inputs['Base Color'].default_value=(.022,.014,.009,1);bs.inputs['Roughness'].default_value=.7;bs.inputs['Specular IOR Level'].default_value=.25

    def lower_boundary(p):
        front=max(0,min(1,(-p.y-.003)/.14))
        return 1.451+.079*front**1.7

    def fibers(name, length, total, faded=False):
        rng=random.Random(404); mesh.calc_loop_triangles()
        triangles=[];areas=[];area=0
        for t in mesh.loop_triangles:
            points=[vertices[i] for i in t.vertices];c=sum(points,Vector())/3
            if c.z < lower_boundary(c) or c.z<1.46 or (abs(c.x)>.067 and c.z<1.515):continue
            a=(points[1]-points[0]).cross(points[2]-points[0]);ar=a.length/2
            if ar<1e-10:continue
            area+=ar;areas.append(area);triangles.append((points,a.normalized()))
        import bisect
        vs=[];fs=[]
        for i in range(total):
            pts,n=triangles[bisect.bisect_left(areas,rng.random()*area)];u=math.sqrt(rng.random());v=rng.random();p=pts[0]*(1-u)+pts[1]*u*(1-v)+pts[2]*u*v
            if p.z<lower_boundary(p):continue
            if faded:
                density=max(0,min(1,(p.z-lower_boundary(p))/.045))
                if rng.random()>density:continue
            # Fine crossed tapered ribbons have individual geometry, no solid scalp cap.
            root=p+n*.00010;L=length*(.65+rng.random()*.65)
            direction=(n*.8+Vector((.15,.1,-.5))).normalized()
            tip=root+direction*L
            tangent=n.cross(Vector((0,0,1)))
            if tangent.length<.01:tangent=Vector((1,0,0))
            tangent.normalize();other=direction.cross(tangent).normalized()
            width=.00015*(.7+rng.random()*.5)
            for axis in [tangent,other]:
                base=len(vs);vs.extend([root-axis*width,root+axis*width,tip+axis*width*.18,tip-axis*width*.18]);fs.append((base,base+1,base+2,base+3))
        me=bpy.data.meshes.new(name);me.from_pydata(vs,[],fs);me.update();o=bpy.data.objects.new(name,me);bpy.context.collection.objects.link(o);me.materials.append(mat)
        for p in me.polygons:p.use_smooth=True
        return o

    def group(name):
        o=bpy.data.objects.new(name,None);bpy.context.collection.objects.link(o);return o

    fade=group('hair_skin-fade');taper=group('hair_taper-fade');buzz=group('hair_buzz-cut')
    for source,target in [('short01',fade),('short02',taper)]:
        o=fitted[source]
        world=o.matrix_world.copy();o.parent=None;o.matrix_world=world
        # The fit is already in the common human space; geometry is not regenerated at runtime.
        o.name=source+'_cards';bm=bmesh.new();bm.from_mesh(o.data)
        threshold=1.505 if source=='short01' else 1.465
        bmesh.ops.delete(bm,geom=[v for v in bm.verts if (world@v.co).z<threshold],context='VERTS')
        if source=='short02':
            for v in bm.verts:
                p=world@v.co;hit=bvh.find_nearest(p)
                if hit[0] is None:continue
                factor=max(0,min(1,(1.553-p.z)/.08))*.82
                if abs(p.x)>.035 or p.y>-.055:
                    p=p.lerp(hit[0]+hit[1]*.0025,factor);v.co=world.inverted()@p
        bm.to_mesh(o.data);bm.free()
        for p in o.data.polygons:p.use_smooth=True
        # Same natural brown palette throughout; alpha comes from the licensed strand atlas.
        for material in o.data.materials:
            if material and material.use_nodes:
                shader=material.node_tree.nodes.get('Principled BSDF')
                if shader:shader.inputs['Roughness'].default_value=.74;shader.inputs['Specular IOR Level'].default_value=.05
        o.parent=target
        fibers(source+'_transition',.0018 if source=='short01' else .0024,12000,True).parent=target
    # Short-hair density beneath individual buzz fibers, with a feathered hairline.
    scalp_vertices=[];scalp_faces=[];colors=[]
    for tri in mesh.loop_triangles:
     pts=[vertices[i] for i in tri.vertices]
     if not all(p.z>lower_boundary(p) and p.z>1.46 and not(abs(p.x)>.067 and p.z<1.515) for p in pts):continue
     ids=[]
     for index,p in zip(tri.vertices,pts):
      n=mesh.vertices[index].normal;ids.append(len(scalp_vertices));scalp_vertices.append(p+n*.00018)
      colors.append((.022,.014,.009,min(.92,max(0,(p.z-lower_boundary(p))/.014))))
     scalp_faces.append(ids)
    sm=bpy.data.meshes.new('buzz_density');sm.from_pydata(scalp_vertices,[],scalp_faces);sm.update()
    color=sm.color_attributes.new(name='COLOR_0',type='FLOAT_COLOR',domain='POINT')
    for i,c in enumerate(colors):color.data[i].color=c
    scalp=bpy.data.objects.new('buzz_density',sm);bpy.context.collection.objects.link(scalp);scalp.parent=buzz
    scalpmat=mat.copy();scalpmat.name='Hair_buzz_density';n=scalpmat.node_tree.nodes;links=scalpmat.node_tree.links;shader=n.get('Principled BSDF');shader.inputs['Roughness'].default_value=.95;shader.inputs['Specular IOR Level'].default_value=.08
    attribute=n.new('ShaderNodeVertexColor');attribute.layer_name='COLOR_0';links.new(attribute.outputs['Color'],shader.inputs['Base Color']);links.new(attribute.outputs['Alpha'],shader.inputs['Alpha']);sm.materials.append(scalpmat)
    for polygon in sm.polygons:polygon.use_smooth=True
    fibers('buzz_individual_fibers',.0028,19000).parent=buzz
    human.evaluated_get(dg).to_mesh_clear()
    return {"skin-fade": fade, "taper-fade": taper, "buzz-cut": buzz}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--asset-root", type=Path, help="Defaults to CHAIR_STYLE_ASSET_ROOT or .cache/style-assets")
    parser.add_argument("--output", type=Path, help="Combined groom GLB; defaults to ASSET_ROOT/generated/hair/hair-variants.glb")
    parser.add_argument("--blend", type=Path, help="Optional authoring scene containing the base and three hair groups")
    arguments = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else sys.argv[1:]
    args = parser.parse_args(arguments)
    import bpy, json
    sys.path.insert(0, str(Path(__file__).resolve().parent))
    from base_builder import create_base
    root = resolve_asset_root(args.asset_root)
    destination = (args.output or root / "generated/hair/hair-variants.glb").expanduser().resolve()
    destination.parent.mkdir(parents=True, exist_ok=True)
    groups = {}
    create_base(root, add_assets=lambda human: groups.update(add_hair_variants(human, root)))
    bpy.ops.object.select_all(action="DESELECT")
    for group in groups.values():
        group.select_set(True)
        for obj in group.children:
            obj.select_set(True)
    bpy.ops.export_scene.gltf(filepath=str(destination), export_format="GLB", use_selection=True,
                              export_apply=True, export_animations=False, export_morph=False)
    if args.blend:
        output = args.blend.expanduser().resolve()
        output.parent.mkdir(parents=True, exist_ok=True)
        bpy.ops.wm.save_as_mainfile(filepath=str(output))
    stats = {name: {"group": group.name, "meshes": [{"name": obj.name, "vertices": len(obj.data.vertices),
             "triangles": sum(len(p.vertices)-2 for p in obj.data.polygons)} for obj in group.children]}
             for name, group in groups.items()}
    print(json.dumps({"file": str(destination), "bytes": destination.stat().st_size, "styles": stats}, indent=2))


if __name__ == "__main__":
    main()
