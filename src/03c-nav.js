// =====================================================================
// 03c WORLD MESHES + NAVIGATION: chunk meshes and culling, spatial bins, rays, collision, flow fields, map image
// =====================================================================
const chunkMeshes=[];function freeArr(){this.array=null;}
// normals and colours of the static town are stored as bytes; the car paint stays in floats because wrecks rewrite it
function mkMesh(b,mat){const g=new T.BufferGeometry(),small=mat!==M.paint&&!!mat.userData.chunk;g.setAttribute('position',new T.Float32BufferAttribute(b.p,3));
  if(small){const n=new Int8Array(b.n.length);for(let i=0;i<n.length;i++)n[i]=Math.round(b.n[i]*127);g.setAttribute('normal',new T.BufferAttribute(n,3,true));}
  else g.setAttribute('normal',new T.Float32BufferAttribute(b.n,3));
  if(b.u.length)g.setAttribute('uv',new T.Float32BufferAttribute(b.u,2));
  if(b.c&&mat.vertexColors){if(small){const c=new Uint8Array(b.c.length);for(let i=0;i<c.length;i++)c[i]=Math.round(clamp(b.c[i],0,1)*255);g.setAttribute('color',new T.BufferAttribute(c,3,true));}
    else g.setAttribute('color',new T.Float32BufferAttribute(b.c,3));}
  g.setIndex(b.i);
  b.p=b.n=b.u=b.c=b.i=null;if(mat!==M.paint)for(const k in g.attributes)g.attributes[k].onUpload(freeArr);const m=new T.Mesh(g,mat);m.matrixAutoUpdate=false;return m;}
globals.forEach((b,mat)=>{const m=mkMesh(b,mat);m.receiveShadow=true;m.frustumCulled=false;scene.add(m);});
chunks.forEach(mm=>mm.forEach((b,mat)=>{if(!b.p.length)return;const m=mkMesh(b,mat);m.geometry.computeBoundingSphere();m.castShadow=!!mat.userData.cast;m.receiveShadow=mat!==M.shade;if(mat===M.shade)m.renderOrder=2;
  b.mesh=m;scene.add(m);chunkMeshes.push(m);}));
// hide chunks beyond the fog
let viewFar=Q.far;
// fog and draw distance: the menu flyover sees farther than the player on foot
function setView(far,nearK){if(far===viewFar&&scene.fog.near===far*nearK)return;viewFar=far;scene.fog.near=far*nearK;scene.fog.far=far;}
function cullChunks(x,z){for(let k=0;k<chunkMeshes.length;k++){const m=chunkMeshes[k],s=m.geometry.boundingSphere,dx=s.center.x-x,dz=s.center.z-z,r=viewFar+30+s.radius;m.visible=dx*dx+dz*dz<r*r;}
  const r2=(viewFar+40)*(viewFar+40);for(let k=0;k<farCull.length;k++){const m=farCull[k],dx=m.position.x-x,dz=m.position.z-z;if(m.parent)m.visible=dx*dx+dz*dz<r2;}}

// ---------- spatial bins (16 m cells) for rays and collision
const BS=16,BX0=-400,BZ0=-960,BW=93,BH=112,bins=[];for(let k=0;k<BW*BH;k++)bins.push([]);
function binAdd(c){c.st=0;const i0=clamp(Math.floor((c.x0-1-BX0)/BS),0,BW-1),i1=clamp(Math.floor((c.x1+1-BX0)/BS),0,BW-1),
  j0=clamp(Math.floor((c.z0-1-BZ0)/BS),0,BH-1),j1=clamp(Math.floor((c.z1+1-BZ0)/BS),0,BH-1);
  for(let j=j0;j<=j1;j++)for(let i=i0;i<=i1;i++)bins[j*BW+i].push(c);}
colliders.forEach(binAdd);
const binAt=(x,z)=>bins[clamp(Math.floor((z-BZ0)/BS),0,BH-1)*BW+clamp(Math.floor((x-BX0)/BS),0,BW-1)];
let RHc=null,RHnx=0,RHny=0,RHnz=0,stamp=1;
// nearest hit distance along a ray (maxT if none); sets RHc (collider or null for ground) and the hit normal
function rayWorld(ox,oy,oz,dx,dy,dz,maxT){let best=maxT;RHc=null;RHnx=0;RHny=0;RHnz=0;
  if(dy<-1e-9){const t=-oy/dy;if(t<best){best=t;RHny=1;}}
  let ci=clamp(Math.floor((ox-BX0)/BS),0,BW-1),cj=clamp(Math.floor((oz-BZ0)/BS),0,BH-1);
  const sx=dx>0?1:-1,sz=dz>0?1:-1,fx=Math.abs(dx)>1e-9,fz=Math.abs(dz)>1e-9,tdx=fx?BS/Math.abs(dx):1e30,tdz=fz?BS/Math.abs(dz):1e30;
  let tmx=fx?((BX0+(ci+(dx>0?1:0))*BS)-ox)/dx:1e30,tmz=fz?((BZ0+(cj+(dz>0?1:0))*BS)-oz)/dz:1e30;const st=++stamp;
  for(;;){const list=bins[cj*BW+ci];
    for(let k=0;k<list.length;k++){const c=list[k];if(c.st===st||c.off)continue;c.st=st;let t0=0,t1=best,ax=-1,a,b,s;
      if(!fx){if(ox<c.x0||ox>c.x1)continue;}else{a=(c.x0-ox)/dx;b=(c.x1-ox)/dx;if(a>b){s=a;a=b;b=s;}if(a>t0){t0=a;ax=0;}if(b<t1)t1=b;if(t0>t1)continue;}
      if(!fz){if(oz<c.z0||oz>c.z1)continue;}else{a=(c.z0-oz)/dz;b=(c.z1-oz)/dz;if(a>b){s=a;a=b;b=s;}if(a>t0){t0=a;ax=2;}if(b<t1)t1=b;if(t0>t1)continue;}
      if(dy>-1e-9&&dy<1e-9){if(oy<c.y0||oy>c.y1)continue;}else{a=(c.y0-oy)/dy;b=(c.y1-oy)/dy;if(a>b){s=a;a=b;b=s;}if(a>t0){t0=a;ax=1;}if(b<t1)t1=b;if(t0>t1)continue;}
      best=t0;RHc=c;RHnx=ax===0?-sx:0;RHnz=ax===2?-sz:0;RHny=ax===1?(dy>0?-1:1):0;}
    const te=tmx<tmz?tmx:tmz;if(best<=te)break;
    if(tmx<tmz){ci+=sx;tmx+=tdx;if(ci<0||ci>=BW)break;}else{cj+=sz;tmz+=tdz;if(cj<0||cj>=BH)break;}}
  return best;}
function los(ax,ay,az,bx,by,bz){const dx=bx-ax,dy=by-ay,dz=bz-az,d=Math.hypot(dx,dy,dz);if(d<.05)return true;
  return rayWorld(ax,ay,az,dx/d,dy/d,dz/d,d)>=d-.04;}
function pushOut(e,r,feet){const list=binAt(e.x,e.z);for(let k=0;k<list.length;k++){const c=list[k];if(c.off||c.y0>feet+1.7||c.y1<feet+.25)continue;
  const nx=Math.max(c.x0,Math.min(e.x,c.x1)),nz=Math.max(c.z0,Math.min(e.z,c.z1));const dx=e.x-nx,dz=e.z-nz,d2=dx*dx+dz*dz;if(d2>=r*r)continue;
  if(d2>1e-8){const d=Math.sqrt(d2);e.x=nx+dx/d*r;e.z=nz+dz/d*r;}
  else{const l=e.x-c.x0,rt=c.x1-e.x,u=e.z-c.z0,dn=c.z1-e.z,m=Math.min(l,rt,u,dn);if(m===l)e.x=c.x0-r;else if(m===rt)e.x=c.x1+r;else if(m===u)e.z=c.z0-r;else e.z=c.z1+r;}}}
function floorAt(x,z,feet){let f=0;const list=binAt(x,z);for(let k=0;k<list.length;k++){const c=list[k];
  if(!c.off&&c.y0===0&&c.y1<=feet+.3&&c.y1>f&&x>c.x0-.15&&x<c.x1+.15&&z>c.z0-.15&&z<c.z1+.15)f=c.y1;}return f;}

// ---------- navigation grid (3 m cells) with windowed flow fields
const CELL=3,NX0=-375,NZ0=-933,NW=476,NH=579,blocked=new Uint8Array(NW*NH);
function blockCollider(c){if(c.y0>1.2||c.y1<.5)return;const w=c.x1-c.x0,d=c.z1-c.z0;
  if(Math.max(w,d)<1.6)return;                       // posts, trunks, crates: walked around, not routed around
  const thin=Math.min(w,d)<1.6,m=thin?.05:.7;        // walls, sandbags and barriers block every cell they touch
  const i0=Math.max(0,Math.floor((c.x0-m-NX0)/CELL)),i1=Math.min(NW-1,Math.floor((c.x1+m-NX0)/CELL)),j0=Math.max(0,Math.floor((c.z0-m-NZ0)/CELL)),j1=Math.min(NH-1,Math.floor((c.z1+m-NZ0)/CELL));
  for(let j=j0;j<=j1;j++)for(let i=i0;i<=i1;i++){if(thin){blocked[j*NW+i]=1;continue;}
    const x=NX0+(i+.5)*CELL,z=NZ0+(j+.5)*CELL;if(x>c.x0-.7&&x<c.x1+.7&&z>c.z0-.7&&z<c.z1+.7)blocked[j*NW+i]=1;}}
colliders.forEach(blockCollider);
const cellOf=(x,z)=>{const i=Math.floor((x-NX0)/CELL),j=Math.floor((z-NZ0)/CELL);return(i<0||j<0||i>=NW||j>=NH)?-1:j*NW+i;};
function makeField(){return{d:new Int16Array(NW*NH).fill(-1),q:new Int32Array(42000),n:0,x:0,z:0};}
function flow(F,px,pz,maxD){const d=F.d,q=F.q;for(let k=0;k<F.n;k++)d[q[k]]=-1;F.n=0;F.x=px;F.z=pz;const s=cellOf(px,pz);if(s<0)return;
  let qh=0,qt=0;const cap=q.length-4;d[s]=0;q[qt++]=s;
  while(qh<qt){const c=q[qh++],dd=d[c]+1;if(dd>maxD||qt>cap)continue;const i=c%NW,j=(c-i)/NW;
    if(i>0&&d[c-1]<0&&!blocked[c-1]){d[c-1]=dd;q[qt++]=c-1;}
    if(i<NW-1&&d[c+1]<0&&!blocked[c+1]){d[c+1]=dd;q[qt++]=c+1;}
    if(j>0&&d[c-NW]<0&&!blocked[c-NW]){d[c-NW]=dd;q[qt++]=c-NW;}
    if(j<NH-1&&d[c+NW]<0&&!blocked[c+NW]){d[c+NW]=dd;q[qt++]=c+NW;}}
  F.n=qt;}
// unit direction that descends the field from (x,z); falls back to the straight line when off the field
const FD={x:0,z:0};
function flowDir(F,x,z){const c=cellOf(x,z),d=F.d;let bx=F.x-x,bz=F.z-z;const bl=Math.hypot(bx,bz)||1;bx/=bl;bz/=bl;
  if(c>=0){const i=c%NW,j=(c-i)/NW;let bd=d[c]<0?32767:d[c],bi=-1,bj=-1;
    for(let oj=-1;oj<=1;oj++)for(let oi=-1;oi<=1;oi++){if(!oi&&!oj)continue;const ni=i+oi,nj=j+oj;if(ni<0||nj<0||ni>=NW||nj>=NH)continue;
      const n=nj*NW+ni;if(blocked[n]||d[n]<0)continue;if(oi&&oj&&(blocked[j*NW+ni]||blocked[nj*NW+i]))continue;const dd=d[n]+(oi&&oj?.4:0);if(dd<bd){bd=dd;bi=ni;bj=nj;}}
    if(bi>=0){const tx=NX0+(bi+.5)*CELL-x,tz=NZ0+(bj+.5)*CELL-z,tl=Math.hypot(tx,tz)||1;bx=tx/tl;bz=tz/tl;}}
  FD.x=bx;FD.z=bz;return FD;}
// cells connected to the street network: nothing is ever spawned in a sealed yard
const reach=new Uint8Array(NW*NH);{const q=new Int32Array(NW*NH);let qh=0,qt=0;const s=cellOf(6.5,318);reach[s]=1;q[qt++]=s;
  while(qh<qt){const c=q[qh++],i=c%NW,j=(c-i)/NW;if(i>0&&!reach[c-1]&&!blocked[c-1]){reach[c-1]=1;q[qt++]=c-1;}if(i<NW-1&&!reach[c+1]&&!blocked[c+1]){reach[c+1]=1;q[qt++]=c+1;}
    if(j>0&&!reach[c-NW]&&!blocked[c-NW]){reach[c-NW]=1;q[qt++]=c-NW;}if(j<NH-1&&!reach[c+NW]&&!blocked[c+NW]){reach[c+NW]=1;q[qt++]=c+NW;}}}
const inCemetery=(x,z)=>x>930&&x<1042&&z>-912&&z<-828;
function freeSpot(x,z){const c=cellOf(x,z);return c>=0&&!blocked[c]&&reach[c]===1&&x>BOUND.x0&&x<BOUND.x1&&z>BOUND.z0&&z<BOUND.z1&&!inCemetery(x,z);}

// ---------- map image (1 px per metre) used by the minimap and the tactical map
const MX0=-400,MZ0=-960,MAPW=1460,MAPH=1780,mapC=document.createElement('canvas');mapC.width=MAPW;mapC.height=MAPH;
{const g=mapC.getContext('2d'),X=x=>x-MX0,Z=z=>z-MZ0;g.fillStyle='#c9ab7c';g.fillRect(0,0,MAPW,MAPH);
 FIELDS.forEach((f,k)=>{g.fillStyle=k%3===2?'#b2925f':'#7f9c58';g.fillRect(X(f[0]),Z(f[1]),f[2]-f[0],f[3]-f[1]);});
 g.fillStyle='#d6bc8c';for(const x of AX)if(x)g.fillRect(X(x-6),Z(-906),12,(southCol(x)?780:6)+906);
 for(const z of SZN)g.fillRect(X(-360),Z(z-6),1296,12);for(const z of SZS)g.fillRect(X(-360),Z(z-6),720,12);
 for(const B of BLOCKS){const k=kept[bkey(B)];if(!k)continue;g.fillStyle=k===2?'#c9ab7c':'#e6d6b4';g.fillRect(X(B.cx-B.w/2),Z(B.cz-B.d/2),B.w,B.d);}
 g.fillStyle='#8fb383';g.fillRect(X(203),Z(81),106,106);g.fillStyle='#d9c3ae';g.fillRect(X(166),Z(-654),84,48);g.fillStyle='#ddd8cc';g.fillRect(X(936),Z(-906),100,72);
 g.fillStyle='#6b6761';g.fillRect(X(154),Z(-726),12,720);g.fillRect(X(250),Z(-726),12,192);g.fillRect(X(10.5),Z(-486),156,12);g.fillRect(X(58),Z(-606),300,12);g.fillRect(X(154),Z(-666),108,12);
 g.fillStyle='#57534d';g.fillRect(X(-10.5),0,21,MAPH);g.fillRect(X(10.5),Z(-5.5),MAPW,11);
 g.fillStyle='#d9c9a6';g.fillRect(X(-2.5),Z(-900),5,1680);
 g.fillStyle='#8a6c4b';for(const c of colliders)if(c.kind===1)g.fillRect(X(c.x0),Z(c.z0),c.x1-c.x0,c.z1-c.z0);
 g.fillStyle='#9a968c';for(const c of colliders)if(c.kind===5&&inCemetery((c.x0+c.x1)/2,(c.z0+c.z1)/2))g.fillRect(X(c.x0),Z(c.z0),c.x1-c.x0,c.z1-c.z0);
 g.fillStyle='#6f8f5c';g.beginPath();g.arc(X(0),Z(0),7,0,7);g.fill();g.fillStyle='#7c6238';g.fillRect(X(-1.5),Z(-1.5),3,3);}
