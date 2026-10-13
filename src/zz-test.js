// TEMP test tail
function resize(){const w=innerWidth,h=innerHeight;renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix();}
resize();
window.__t={cam:(x,y,z,tx,ty,tz,nofog)=>{scene.fog.near=nofog?5000:110;scene.fog.far=nofog?9000:560;camera.position.set(x,y,z);camera.lookAt(tx,ty,tz);sky.position.copy(camera.position);sierra.position.set(x,0,z);
  sunSprite.position.copy(camera.position).addScaledVector(SUN,2000);sunFollow(tx,tz);viewFar=nofog?9000:560;cullChunks(x,z);renderer.render(scene,camera);},
  stats:()=>({buildMs:Math.round(performance.now()-T0),colliders:colliders.length,buildings:buildings.length,palms:palms.length,trees:trees.length,cars:cars.length,tinacos:tinacos.length,chunks:chunkMeshes.length,
    tris:renderer.info.render.triangles,calls:renderer.info.render.calls,kept:Object.keys(kept).length,
    verts:chunkMeshes.reduce((a,m)=>a+m.geometry.attributes.position.count,0),allTris:chunkMeshes.reduce((a,m)=>a+m.geometry.index.count/3,0)}),
  map:()=>mapC.toDataURL('image/png'),atlas:()=>atlasC.toDataURL('image/png')};
})();
