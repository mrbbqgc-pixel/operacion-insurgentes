(function(){'use strict';
// =====================================================================
// 01 CORE: renderer, helpers, chunked static-geometry batching, colliders
// =====================================================================
const $=id=>document.getElementById(id),T0=performance.now();
function fail(msg){$('menuMsg').textContent=msg;$('btnStart').hidden=true;$('btnSurvival').hidden=true;$('btnMapMenu').hidden=true;}
if(!window.THREE){fail('The 3D engine could not load. Check your connection, then reload the page.');return;}
const T=THREE,PI=Math.PI,TAU=PI*2;
let seed=20261012;
function rnd(){seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;}
const rr=(a,b)=>a+rnd()*(b-a),pick=a=>a[Math.floor(rnd()*a.length)];
const R=Math.random,R2=(a,b)=>a+R()*(b-a),RP=a=>a[Math.floor(R()*a.length)];
const clamp=(v,a,b)=>v<a?a:v>b?b:v,lerp=(a,b,t)=>a+(b-a)*t;
function angDiff(a,b){let d=a-b;if(d>64||d<-64)d-=TAU*Math.round(d/TAU);while(d>PI)d-=TAU;while(d<-PI)d+=TAU;return d;}

const canvas=$('view');
let renderer;
try{renderer=new T.WebGLRenderer({canvas,antialias:true,powerPreference:'high-performance'});}
catch(e){fail('This browser could not start 3D graphics. Try a current version of Chrome or Safari.');return;}
const isTouch=('ontouchstart' in window)||navigator.maxTouchPoints>0;
if(isTouch)document.body.classList.add('touch');
const Q={shadows:!isTouch,pr:Math.min(window.devicePixelRatio||1,isTouch?1.5:2),maxFoes:isTouch?10:14,far:isTouch?430:560};
renderer.setPixelRatio(Q.pr);
if(Q.shadows){renderer.shadowMap.enabled=true;renderer.shadowMap.type=T.PCFSoftShadowMap;}
const scene=new T.Scene();
scene.fog=new T.Fog(0xe3c7a0,Q.far*.2,Q.far);
const camera=new T.PerspectiveCamera(74,1,0.08,2600);
camera.rotation.order='YXZ';
scene.add(camera);
const hemi=new T.HemisphereLight(0xfff6e6,0xc7a67c,0.72);scene.add(hemi);
// late-afternoon sun from the west-southwest (in the town's rotated frame that is mostly -x)
const SUN=new T.Vector3(-0.74,0.62,0.26).normalize();
const sun=new T.DirectionalLight(0xffe9c4,0.56);scene.add(sun);scene.add(sun.target);
if(Q.shadows){sun.castShadow=true;const s=sun.shadow;s.mapSize.set(2048,2048);s.camera.left=-110;s.camera.right=110;s.camera.top=110;s.camera.bottom=-110;
  s.camera.near=20;s.camera.far=520;s.bias=-0.0004;s.normalBias=0.5;}
function sunFollow(x,z){const gx=Math.round(x/6)*6,gz=Math.round(z/6)*6;sun.position.set(gx+SUN.x*260,SUN.y*260,gz+SUN.z*260);sun.target.position.set(gx,0,gz);sun.target.updateMatrixWorld();}
sunFollow(0,0);

const MAXA=Math.min(8,renderer.capabilities.getMaxAnisotropy());
function tex(w,h,draw,rep){const c=document.createElement('canvas');c.width=w;c.height=h;draw(c.getContext('2d'),w,h);
  const t=new T.CanvasTexture(c);if(rep)t.wrapS=t.wrapT=T.RepeatWrapping;t.anisotropy=MAXA;return t;}
function noise(g,w,h,n,a,x0,y0){x0=x0||0;y0=y0||0;for(let k=0;k<n;k++){g.fillStyle='rgba('+(rnd()<.5?'0,0,0,':'255,255,255,')+(rnd()*a).toFixed(3)+')';
  g.fillRect(x0+rnd()*w,y0+rnd()*h,1+rnd()*2,1+rnd()*2);}}
const L=o=>new T.MeshLambertMaterial(o);
// colour helpers: hex int -> shaded hex int
function shade(h,k){return(clamp(Math.round((h>>16&255)*k),0,255)<<16)|(clamp(Math.round((h>>8&255)*k),0,255)<<8)|clamp(Math.round((h&255)*k),0,255);}
function mixc(a,b,t){return(Math.round(lerp(a>>16&255,b>>16&255,t))<<16)|(Math.round(lerp(a>>8&255,b>>8&255,t))<<8)|Math.round(lerp(a&255,b&255,t));}
const css=h=>'#'+('00000'+h.toString(16)).slice(-6);

// ---------- static geometry
// Ground materials tile and are batched once for the whole map. Everything else is vertex-coloured and
// batched per 128 m chunk and material, so distant chunks are culled.
const CH=128,chunks=new Map(),globals=new Map();
let ANCH=null; // while set, all chunked geometry goes to the chunk of this point (keeps one object in one buffer)
// A material may be an alias of another (plain colours ride in the facade material, on a white texel), so they share buffers.
const WU=.003,WV=.003;
function bat(mat,x,z){
  if(!mat.userData.chunk){let b=globals.get(mat);if(!b){b={p:[],n:[],u:[],i:[]};globals.set(mat,b);}return b;}
  if(mat.userData.alias)mat=mat.userData.alias;
  if(ANCH){x=ANCH[0];z=ANCH[1];}
  const key=Math.floor(x/CH)+','+Math.floor(z/CH);let m=chunks.get(key);if(!m){m=new Map();chunks.set(key,m);}
  let b=m.get(mat);if(!b){b={p:[],n:[],u:[],c:[],i:[],mesh:null,uv:!!mat.map};m.set(mat,b);}return b;}
function anchor(x,z,fn){const o=ANCH;ANCH=[x,z];try{return fn();}finally{ANCH=o;}}
// tiling ground quad (global batch)
function quad(mat,a,b,c,d,nx,ny,nz,u1,v1){const B=bat(mat,a[0],a[2]),k=B.p.length/3;
  B.p.push(a[0],a[1],a[2],b[0],b[1],b[2],c[0],c[1],c[2],d[0],d[1],d[2]);
  for(let q=0;q<4;q++)B.n.push(nx,ny,nz);
  B.u.push(0,0,u1,0,u1,v1,0,v1);B.i.push(k,k+1,k+2,k,k+2,k+3);}
// ground rectangle; large ones are cut into pieces of at most 160 m so that no triangle is huge
function flat(mat,x0,z0,x1,z1,y,rep){const nx=Math.max(1,Math.ceil((x1-x0)/160)),nz=Math.max(1,Math.ceil((z1-z0)/160));
  for(let i=0;i<nx;i++)for(let j=0;j<nz;j++){const a=lerp(x0,x1,i/nx),b=lerp(x0,x1,(i+1)/nx),c=lerp(z0,z1,j/nz),d=lerp(z0,z1,(j+1)/nz);
    quad(mat,[a,y,d],[b,y,d],[b,y,c],[a,y,c],0,1,0,(b-a)/rep,(d-c)/rep);}}
// vertex-coloured quad in a chunk batch; uv = atlas rectangle (u0,v0)-(u1,v1) when the material is textured
function quadC(mat,a,b,c,d,nx,ny,nz,col,u0,v0,u1,v1){const B=bat(mat,a[0],a[2]),k=B.p.length/3,r=(col>>16&255)/255,g=(col>>8&255)/255,bl=(col&255)/255;
  B.p.push(a[0],a[1],a[2],b[0],b[1],b[2],c[0],c[1],c[2],d[0],d[1],d[2]);
  B.n.push(nx,ny,nz,nx,ny,nz,nx,ny,nz,nx,ny,nz);B.c.push(r,g,bl,r,g,bl,r,g,bl,r,g,bl);
  if(B.uv){if(mat.map&&u0!==undefined)B.u.push(u0,v0,u1,v0,u1,v1,u0,v1);else B.u.push(WU,WV,WU,WV,WU,WV,WU,WV);}
  B.i.push(k,k+1,k+2,k,k+2,k+3);}
// vertex-coloured box with its base at y (no bottom face); top can take its own colour
function boxC(mat,x,y,z,w,h,d,col,top,skip){const x0=x-w/2,x1=x+w/2,y1=y+h,z0=z-d/2,z1=z+d/2,cs=shade(col,.93);
  if(skip!==1)quadC(mat,[x0,y,z1],[x1,y,z1],[x1,y1,z1],[x0,y1,z1],0,0,1,col);if(skip!==0)quadC(mat,[x1,y,z0],[x0,y,z0],[x0,y1,z0],[x1,y1,z0],0,0,-1,col);
  if(skip!==3)quadC(mat,[x1,y,z1],[x1,y,z0],[x1,y1,z0],[x1,y1,z1],1,0,0,cs);if(skip!==2)quadC(mat,[x0,y,z0],[x0,y,z1],[x0,y1,z1],[x0,y1,z0],-1,0,0,cs);
  quadC(mat,[x0,y1,z1],[x1,y1,z1],[x1,y1,z0],[x0,y1,z0],0,1,0,top===undefined?col:top);}
// append any BufferGeometry, transformed, with one colour (multiplied by the geometry's own vertex colours if present)
const _m4=new T.Matrix4(),_n3=new T.Matrix3(),_v=new T.Vector3(),_q=new T.Quaternion(),_e=new T.Euler(),_s=new T.Vector3(),_p=new T.Vector3();
function pushGeo(mat,geo,m4,col){_n3.getNormalMatrix(m4);const P=geo.attributes.position,N=geo.attributes.normal,U=geo.attributes.uv,Cc=geo.attributes.color,ix=geo.index;
  _v.setFromMatrixPosition(m4);const B=bat(mat,_v.x,_v.z),k=B.p.length/3,r=(col>>16&255)/255,g=(col>>8&255)/255,bl=(col&255)/255,tx=B.uv,own=!!mat.map&&!!U;
  for(let i=0;i<P.count;i++){_v.fromBufferAttribute(P,i).applyMatrix4(m4);B.p.push(_v.x,_v.y,_v.z);_v.fromBufferAttribute(N,i).applyMatrix3(_n3).normalize();B.n.push(_v.x,_v.y,_v.z);
    if(Cc)B.c.push(r*Cc.getX(i),g*Cc.getY(i),bl*Cc.getZ(i));else B.c.push(r,g,bl);if(tx){if(own)B.u.push(U.getX(i),U.getY(i));else B.u.push(WU,WV);}}
  if(ix)for(let i=0;i<ix.count;i++)B.i.push(k+ix.getX(i));else for(let i=0;i<P.count;i++)B.i.push(k+i);}
// convenience: place a geometry with position, y-rotation and scale (rx/rz optional)
function put(mat,geo,x,y,z,ry,sx,sy,sz,col,rx,rz){_e.set(rx||0,ry||0,rz||0,'YXZ');_q.setFromEuler(_e);_p.set(x,y,z);_s.set(sx,sy===undefined?sx:sy,sz===undefined?sx:sz);
  _m4.compose(_p,_q,_s);pushGeo(mat,geo,_m4,col);}

// ---------- colliders (axis-aligned boxes in the town frame)
// kind: 0 generic, 1 building, 2 car, 3 barrel, 4 fuel pump, 5 low cover
const colliders=[],farCull=[];
// small stand-alone meshes (signs, flags, barrels) are hidden beyond the fog like the chunks
function addProp(m){scene.add(m);farCull.push(m);return m;}
function solid(x,z,w,d,h,y0,kind){const c={x0:x-w/2,x1:x+w/2,z0:z-d/2,z1:z+d/2,y0:y0||0,y1:(y0||0)+h,kind:kind||0,off:false,hp:0,ref:null,id:colliders.length};
  colliders.push(c);return c;}

// merge identical vertices of a non-indexed geometry (extrusions and polyhedra come without an index)
function weld(g){const P=g.attributes.position,N=g.attributes.normal,U=g.attributes.uv,map=new Map(),p=[],n=[],u=[],ix=[],id=g.index,cnt=id?id.count:P.count;
  for(let i=0;i<cnt;i++){const k=id?id.getX(i):i,key=Math.round(P.getX(k)*400)+','+Math.round(P.getY(k)*400)+','+Math.round(P.getZ(k)*400)+','+Math.round(N.getX(k)*30)+','+Math.round(N.getY(k)*30)+','+Math.round(N.getZ(k)*30);
    let j=map.get(key);if(j===undefined){j=p.length/3;map.set(key,j);p.push(P.getX(k),P.getY(k),P.getZ(k));n.push(N.getX(k),N.getY(k),N.getZ(k));if(U)u.push(U.getX(k),U.getY(k));}ix.push(j);}
  const o=new T.BufferGeometry();o.setAttribute('position',new T.Float32BufferAttribute(p,3));o.setAttribute('normal',new T.Float32BufferAttribute(n,3));if(U)o.setAttribute('uv',new T.Float32BufferAttribute(u,2));o.setIndex(ix);return o;}
// shared unit geometries for props (bases at y=0 unless noted)
function cylG(rt,rb,h,seg,open){const g=new T.CylinderGeometry(rt,rb,h,seg,1,!!open);g.translate(0,h/2,0);return g;}
const GEO={cyl8:cylG(1,1,1,8),cyl12:cylG(1,1,1,12),cyl6:cylG(1,1,1,6),taper:cylG(.7,1,1,8),cone8:new T.ConeGeometry(1,1,8),cone4:new T.ConeGeometry(1,1,4),
  sph:new T.SphereGeometry(1,10,7),sphLo:new T.SphereGeometry(1,7,5),dome:new T.SphereGeometry(1,12,6,0,TAU,0,PI/2),box:new T.BoxGeometry(1,1,1),
  tube8:cylG(1,1,1,8,true),tube6:cylG(1,1,1,6,true),rod:cylG(1,1,1,5,true),blob:new T.SphereGeometry(1,7,5),coneO:new T.ConeGeometry(1,1,8,1,true)};
GEO.coneO.translate(0,.5,0);
GEO.cone8.translate(0,.5,0);GEO.cone4.translate(0,.5,0);GEO.box.translate(0,.5,0);
