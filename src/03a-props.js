// =====================================================================
// 03a PROPS: geometry builder, instanced vegetation and street furniture, destructible barrels and pumps, sky
// =====================================================================
// GB merges primitives into one vertex-coloured geometry. add(geo, x,y,z, rx,ry,rz, sx,sy,sz, colour, shadeFn)
function GB(){this.p=[];this.n=[];this.c=[];this.u=[];this.i=[];}
GB.prototype.add=function(geo,x,y,z,rx,ry,rz,sx,sy,sz,col,fn){_e.set(rx||0,ry||0,rz||0,'YXZ');_q.setFromEuler(_e);_p.set(x,y,z);_s.set(sx,sy===undefined?sx:sy,sz===undefined?sx:sz);_m4.compose(_p,_q,_s);_n3.getNormalMatrix(_m4);
  const P=geo.attributes.position,N=geo.attributes.normal,U=geo.attributes.uv,ix=geo.index,k=this.p.length/3,r=(col>>16&255)/255,g=(col>>8&255)/255,b=(col&255)/255;
  for(let i=0;i<P.count;i++){_v.fromBufferAttribute(P,i).applyMatrix4(_m4);this.p.push(_v.x,_v.y,_v.z);const f=fn?fn(_v.x,_v.y,_v.z):1;this.c.push(r*f,g*f,b*f);
    _v.fromBufferAttribute(N,i).applyMatrix3(_n3).normalize();this.n.push(_v.x,_v.y,_v.z);if(U)this.u.push(U.getX(i),U.getY(i));else this.u.push(0,0);}
  if(ix)for(let i=0;i<ix.count;i++)this.i.push(k+ix.getX(i));else for(let i=0;i<P.count;i++)this.i.push(k+i);return this;};
GB.prototype.build=function(){const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(this.p,3));g.setAttribute('normal',new T.Float32BufferAttribute(this.n,3));
  g.setAttribute('color',new T.Float32BufferAttribute(this.c,3));g.setAttribute('uv',new T.Float32BufferAttribute(this.u,2));g.setIndex(this.i);return g;};
const vcMat=L({vertexColors:true});
// static props are baked into the chunk batches so that they are culled with the rest of the town
const _o=new T.Object3D();
function bake(geo,mat,list,fn){list.forEach((p,k)=>{_o.position.set(0,0,0);_o.rotation.set(0,0,0);_o.scale.set(1,1,1);fn(_o,p,k);_o.updateMatrix();pushGeo(mat,geo,_o.matrix,0xffffff);});}
// ---------- date palms: ringed trunk and a crown of drooping, alpha-cut fronds
// the cut-out texture: a palm frond strip in the top half; chain link, bougainvillea (magenta, orange) and a potted plant below
const frondTex=tex(256,128,(g,w,hh)=>{const h=64;g.clearRect(0,0,w,hh);for(let x=4;x<w-2;x+=5){const t=x/w,len=(h/2-2)*Math.sin(Math.min(1,t*1.5)*PI*.5)*(1-.55*t*t)+2;
    for(const s of [-1,1]){g.fillStyle=pick(['#3c7a35','#356e30','#44883a','#2f6229','#4b8f3f']);g.beginPath();g.moveTo(x-2,h/2);g.lineTo(x+7+rnd()*3,h/2+s*len);g.lineTo(x+3,h/2);g.fill();}}
  g.fillStyle='#7d8a4a';g.fillRect(0,h/2-1.5,w,3);
  g.save();g.beginPath();g.rect(0,64,96,64);g.clip();g.strokeStyle='#c4c8cb';g.lineWidth=1.7;for(let k=-64;k<96;k+=7){g.beginPath();g.moveTo(k,64);g.lineTo(k+64,128);g.moveTo(k+64,64);g.lineTo(k,128);g.stroke();}
  g.fillStyle='#9aa1a3';g.fillRect(0,64,96,3);g.restore();
  const bush=(x0,x1,fl)=>{for(let k=0;k<26;k++){g.fillStyle=pick(['#2e5a2a','#3a6b32','#26491f']);g.beginPath();g.ellipse(rr(x0+6,x1-6),rr(72,122),rr(3,6),rr(2,4),rnd()*3,0,7);g.fill();}
    for(let k=0;k<(fl?44:0);k++){g.fillStyle=pick(fl);g.beginPath();g.ellipse(rr(x0+5,x1-5),rr(70,122),rr(2.5,5),rr(2,4),rnd()*3,0,7);g.fill();}};
  bush(96,160,['#e0308a','#f04aa0','#c81e78','#f27ab8']);bush(160,208,['#f0702a','#f4903a','#d8521c','#f7b060']);bush(208,240,null);
  for(let k=0;k<12;k++){g.fillStyle=pick(['#3a7a3a','#4a9a46','#2e6a2e']);g.beginPath();g.ellipse(rr(212,236),rr(70,100),rr(2,4),rr(6,12),rnd()*3,0,7);g.fill();}});
const CUT={link:[0,0,96/256,.5],boug:[96/256,0,160/256,.5],boug2:[160/256,0,208/256,.5],plant:[208/256,0,240/256,.5]};
M.frond=L({map:frondTex,alphaTest:.45,side:T.DoubleSide,vertexColors:true});M.frond.userData.chunk=1;M.frond.userData.cast=true;
function frondGeo(len,wid,rise,droop){const N=5,p=[],n=[],u=[],ix=[];for(let k=0;k<=N;k++){const t=k/N,x=len*t,y=rise*t-droop*t*t,w=wid*(.35+.65*Math.sin(Math.min(1,t*1.6)*PI*.5))*(1-.4*t*t);
    p.push(x,y+.12*w,-w,x,y,0,x,y+.12*w,w);for(let q=0;q<3;q++){n.push(0,1,0);}u.push(t,.5,t,.75,t,1);
    if(k<N){const a=k*3;ix.push(a,a+3,a+1,a+1,a+3,a+4,a+1,a+4,a+2,a+2,a+4,a+5);}}
  const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(p,3));g.setAttribute('normal',new T.Float32BufferAttribute(n,3));g.setAttribute('uv',new T.Float32BufferAttribute(u,2));g.setIndex(ix);return g;}
{const b=new GB(),f1=frondGeo(3.3,.62,1.5,2.3),f2=frondGeo(3,.55,.4,2.6);
 for(let k=0;k<8;k++)b.add(f1,0,0,0,rr(-.2,.2),k/8*TAU+rr(-.15,.15),0,rr(.85,1.1),1,1,0xffffff);
 for(let k=0;k<5;k++)b.add(f2,0,-.1,0,rr(-.2,.2),(k+.5)/5*TAU,0,rr(.8,1),1,1,0xc9d6a0);
 for(let k=0;k<3;k++)b.add(f1,0,.25,0,0,k/3*TAU+.4,.45,.7,1,.8,0xffffff);
 const crown=b.build();
 const tg=new T.CylinderGeometry(.15,.24,1,7,6,true);tg.translate(0,.5,0);
 {const P=tg.attributes.position;for(let i=0;i<P.count;i++){const y=P.getY(i);P.setX(i,P.getX(i)+.35*y*y);}tg.computeVertexNormals();}
 const t2=new GB();t2.add(tg,0,0,0,0,0,0,1,1,1,0x8a7355,(x,y,z)=>(Math.round(y*6)%2?.82:1.04)+rr(-.04,.04));t2.add(GEO.blob,.35,.97,0,0,0,0,.42,.05,.42,0x6a5a3a);const trunk=t2.build();
 palms.forEach(p=>{p[2]=rr(6.2,9.6);p[3]=rnd()*TAU;solid(p[0],p[1],.5,.5,p[2]);});
 bake(trunk,M.flat,palms,(o,p)=>{o.position.set(p[0],0,p[1]);o.rotation.y=p[3];o.scale.set(1,p[2],1);});
 bake(crown,M.frond,palms,(o,p,k)=>{o.position.set(p[0]+Math.cos(p[3])*.35,p[2],p[1]-Math.sin(p[3])*.35);o.rotation.y=k*1.7;const s=.85+(k%5)*.07;o.scale.set(s,s,s);});}
// ---------- shade trees (0: laurel-like round crown, 1: mesquite, low and wide) and wild scrub
function lumpy(geo,k){const g=geo.clone(),P=g.attributes.position,seen={};for(let i=0;i<P.count;i++){const key=Math.round(P.getX(i)*50)+','+Math.round(P.getY(i)*50)+','+Math.round(P.getZ(i)*50),f=seen[key]||(seen[key]=1+rr(-k,k));P.setXYZ(i,P.getX(i)*f,P.getY(i)*f,P.getZ(i)*f);}
  g.computeVertexNormals();return g;}
function treeGeo(type){const b=new GB(),g=type?0x6c7a3e:0x3f7d3a,BL=()=>lumpy(GEO.blob,.2);
  b.add(GEO.tube8,0,0,0,0,0,type?.12:0,.17,type?2.2:2.8,.17,0x6b5138);
  if(type){for(const q of [[-1.3,2.6,.3,2.4,1.1,2],[1.3,2.8,-.4,2.2,1,1.9],[.1,3.2,1,2,1,1.8]])b.add(BL(),q[0],q[1],q[2],0,rnd()*3,0,q[3],q[4],q[5],g,(x,y,z)=>.6+.4*clamp((y-1.8)/1.8,0,1)+rr(-.07,.07));}
  else for(const q of [[0,3.9,0,2.1,1.9,2.1],[-1.1,3.3,.6,1.5,1.3,1.5],[1,3.5,-.5,1.6,1.3,1.5]])b.add(BL(),q[0],q[1],q[2],0,rnd()*3,0,q[3],q[4],q[5],g,(x,y,z)=>.55+.45*clamp((y-2.2)/2.6,0,1)+rr(-.07,.07));
  return b.build();}
trees.forEach(t=>solid(t[0],t[1],.45,.45,2.6*t[2]));
for(const ty of [0,1])bake(treeGeo(ty),M.flat,trees.filter(t=>t[3]===ty),(o,p,k)=>{o.position.set(p[0],PADY*.5,p[1]);o.rotation.y=k*2.1;o.scale.setScalar(p[2]);});
const cacti=[],shrubs=[];
function inTown(x,z){if(x>930&&x<1042&&z>-912&&z<-828)return true;if(z<=6)return x>-362&&x<938&&z>-912;return x>-362&&x<362&&z<786;}
function wild(x,z){if(inTown(x,z))return false;if(Math.abs(x)<14||(x>0&&Math.abs(z)<9))return false;
  for(const f of FIELDS)if(x>f[0]-2&&x<f[2]+2&&z>f[1]-2&&z<f[3]+2)return false;return true;}
for(let k=0;k<3600&&shrubs.length<420;k++){const x=rr(-900,1400),z=rr(-1250,1150);if(wild(x,z))shrubs.push([x,z,rr(.6,1.5)]);}
// scrub on the empty lots inside town
for(const B of BLOCKS)if(!kept[bkey(B)]&&sup(B.cx,B.cz)<1.6)for(let k=0;k<5;k++)shrubs.push([B.cx+rr(-B.w/2,B.w/2),B.cz+rr(-B.d/2,B.d/2),rr(.5,1.2)]);
// ---------- CLUTTER: fences, yards, junk, roofs and signs, the lived-in look of a BCS town. All of it is baked into the chunk batches.
// A lot's front frame: u runs along the frontage, v outward from the front wall (the yard is v in 0..set, then the sidewalk).
// run(u0,u1,v) orders the two points so that a quad drawn from the first to the second faces the street.
function lotFrame(L){const s=SD[L.front],ax=L.front<2,fw=ax?L.w:L.d,dp=ax?L.d:L.w,flip=L.front===0||L.front===3,P=(u,v)=>ax?[L.x+u,L.z+s[1]*(dp/2+v)]:[L.x+s[0]*(dp/2+v),L.z+u];
  return{s,ax,fw,dp,P,ro:Math.atan2(s[0],s[1]),run:(u0,u1,v)=>flip?[P(u1,v),P(u0,v)]:[P(u0,v),P(u1,v)]};}
// chain link from a to b: posts every few metres and cut-out mesh quads between them (the collider is added by the caller)
function fenceLink(a,b,h,first){const l=Math.hypot(b[0]-a[0],b[1]-a[1]);if(l<.5)return;const n=Math.max(1,Math.round(l/3.6));
  for(let k=first?0:1;k<=n;k++){const t=k/n;put(M.flat,GEO.rod3,lerp(a[0],b[0],t),PADY,lerp(a[1],b[1],t),0,.035,h+.05,.035,0x7d8486);}
  for(let k=0;k<n;k++){const t0=k/n,t1=(k+1)/n;vq(M.frond,lerp(a[0],b[0],t0),lerp(a[1],b[1],t0),lerp(a[0],b[0],t1),lerp(a[1],b[1],t1),PADY+.03,PADY+h,0xd0d4d6,CUT.link);}}
// a plain wall from a to b, 0.2 m thick: two textured faces, a top and two ends. Cheaper than wallSeg; no collider of its own
function fenceWall(a,b,h,tint,cn){const dx=b[0]-a[0],dz=b[1]-a[1],l=Math.hypot(dx,dz);if(l<.5)return;const ux=dx/l,uz=dz/l,nx=-uz*.1,nz=ux*.1,c=cuv(CI[cn]),v1=c[1]+(c[3]-c[1])*Math.min(h,4)/4,n=Math.max(1,Math.round(l/4.5)),y0=PADY,y1=PADY+h,cs=shade(tint,.93);
  for(let k=0;k<n;k++){const t0=k/n,t1=(k+1)/n,x0=a[0]+dx*t0,z0=a[1]+dz*t0,x1=a[0]+dx*t1,z1=a[1]+dz*t1;
    quadC(M.wall,[x0+nx,y0,z0+nz],[x1+nx,y0,z1+nz],[x1+nx,y1,z1+nz],[x0+nx,y1,z0+nz],-uz,0,ux,tint,c[0],c[1],c[2],v1);quadC(M.wall,[x1-nx,y0,z1-nz],[x0-nx,y0,z0-nz],[x0-nx,y1,z0-nz],[x1-nx,y1,z1-nz],uz,0,-ux,cs,c[0],c[1],c[2],v1);}
  quadC(M.flat,[a[0]-nx,y1,a[1]-nz],[b[0]-nx,y1,b[1]-nz],[b[0]+nx,y1,b[1]+nz],[a[0]+nx,y1,a[1]+nz],0,1,0,shade(tint,.86));
  quadC(M.flat,[a[0]+nx,y0,a[1]+nz],[a[0]-nx,y0,a[1]-nz],[a[0]-nx,y1,a[1]-nz],[a[0]+nx,y1,a[1]+nz],-ux,0,-uz,cs);quadC(M.flat,[b[0]-nx,y0,b[1]-nz],[b[0]+nx,y0,b[1]+nz],[b[0]+nx,y1,b[1]+nz],[b[0]-nx,y1,b[1]-nz],ux,0,uz,cs);}
// collider along a run of fence or wall
function fenceSolid(a,b,h,low){const c=solid((a[0]+b[0])/2,(a[1]+b[1])/2,Math.abs(b[0]-a[0])+.2,Math.abs(b[1]-a[1])+.2,h,0,low?5:0);if(low)lowCover.push([c.x0/2+c.x1/2,c.z0/2+c.z1/2]);return c;}
const gateCols=[0x3b4a42,0x2b2621,0x6b2a22,0x8c9396,0x1d3f7a],clothCols=[0xf4f0e7,0xd8412f,0x1d6f9a,0xe2b93b,0x2f7d4f,0xf4f0e7,0xe889a8,0x4a4a48,0xd98a4e],fenceTints=[0xf2efe6,0xe3c35c,0x7fc4bd,0xe59a7a,0xd98a4e,0x9db7d6,0xf4f0e7,0xc96f55];
function gate(a,b,h,col){vq(M.flat,a[0],a[1],b[0],b[1],PADY+.08,PADY+h,col,null,true);}
// decal on one face of a box (side as in SD), u along the face from its centre, y up from the ground
function wallDecal(x,z,w,d,side,u,y,dw,dh,uv,tint){if(side>1&&tint!==undefined)tint=shade(tint,.93);const s=SD[side],ax=side<2,cx=x+s[0]*(w/2+.025)+(ax?u:0),cz=z+s[1]*(d/2+.025)+(ax?0:u),dx=s[1]*dw/2,dz=-s[0]*dw/2;
  vq(M.wall,cx-dx,cz-dz,cx+dx,cz+dz,y,y+dh,tint===undefined?0xffffff:tint,uv);}
// axis-aligned box whose faces show one atlas sub-rectangle (cardboard, blocks)
function texBoxU(x,y,z,w,h,d,u,t){const x0=x-w/2,x1=x+w/2,y1=y+h,z0=z-d/2,z1=z+d/2;t=t===undefined?0xffffff:t;
  quadC(M.wall,[x0,y,z1],[x1,y,z1],[x1,y1,z1],[x0,y1,z1],0,0,1,t,u[0],u[1],u[2],u[3]);quadC(M.wall,[x1,y,z0],[x0,y,z0],[x0,y1,z0],[x1,y1,z0],0,0,-1,t,u[0],u[1],u[2],u[3]);
  quadC(M.wall,[x1,y,z1],[x1,y,z0],[x1,y1,z0],[x1,y1,z1],1,0,0,t,u[0],u[1],u[2],u[3]);quadC(M.wall,[x0,y,z0],[x0,y,z1],[x0,y1,z1],[x0,y1,z0],-1,0,0,t,u[0],u[1],u[2],u[3]);
  quadC(M.wall,[x0,y1,z1],[x1,y1,z1],[x1,y1,z0],[x0,y1,z0],0,1,0,t,u[0],u[1],u[2],u[3]);}
// two crossed cut-out quads (a bush, a potted plant)
function cross(x,z,w,h,y,uv,col){const r=w/2;vq(M.frond,x-r,z-r*.3,x+r,z+r*.3,y,y+h,col,uv);vq(M.frond,x-r*.3,z+r,x+r*.3,z-r,y,y+h,col,uv);}
function boug(x,z,w,h){cross(x,z,w,h,PADY,rnd()<.68?CUT.boug:CUT.boug2,0xffffff);}
function pot(x,z,sc){put(M.flat,GEO.pot,x,PADY,z,0,.2*sc,.34*sc,.2*sc,pick([0xb8603a,0xb8603a,0xd9d2c4,0x2f7d4f]));cross(x,z,.7*sc,.85*sc,PADY+.28*sc,CUT.plant,0xffffff);}
function trashBags(x,z,n){for(let k=0;k<n;k++)put(M.flat,GEO.lump,x+rr(-.35,.35),PADY+.02,z+rr(-.3,.3),rnd()*3,rr(.26,.38),rr(.22,.32),rr(.26,.38),pick([0x1b1a19,0x2a2a2c,0x1b1a19,0xf4f0e7]));
  if(rnd()<.35)for(let k=0;k<2;k++)put(M.flat,GEO.rod3,x+rr(-.7,.7),PADY+.035,z+rr(-.6,.6),rnd()*3,.035,.13,.035,pick([0xb3261e,0xb3b9bb,0x1d6f9a]),0,PI/2);}
// scraps of paper, cans and bottles flattened into the dust: single quads
function litter(x,z,n,y){y=y===undefined?PADY+.012:y;for(let k=0;k<n;k++){const px=x+rr(-1.2,1.2),pz=z+rr(-1.2,1.2),a=rnd()*PI,w=rr(.08,.16),d=rr(.12,.3),c=Math.cos(a),sn=Math.sin(a),col=pick([0xf4f0e7,0xf4f0e7,0x1d6f9a,0xd8412f,0xb48a5a,0x2b2621,0xe2b93b]);
  quadC(M.flat,[px-w*c+d*sn,y,pz+w*sn+d*c],[px+w*c+d*sn,y,pz-w*sn+d*c],[px+w*c-d*sn,y,pz-w*sn-d*c],[px-w*c-d*sn,y,pz+w*sn-d*c],0,1,0,col);}}
function tire(x,z,y,ry,rz){put(M.flat,GEO.tube8,x,y,z,ry,.33,.2,.33,C.tire,0,rz||0);}
function bike(x,z,ry){const c=Math.cos(ry),s=Math.sin(ry),P=(lx,lz)=>[x+lx*c+lz*s,z-lx*s+lz*c],col=pick([0xb3261e,0x1d3f7a,0x2f7d4f,0x2b2621]);
  for(const q of [-.52,.52]){const p=P(0,q);put(M.flat,GEO.tube6,p[0],PADY+.33,p[1],ry,.33,.05,.33,0x2b2621,0,PI/2);}
  put(M.flat,GEO.rod3,P(0,-.25)[0],PADY+.3,P(0,-.25)[1],ry,.02,.6,.02,col,-.9,0);put(M.flat,GEO.rod3,P(0,.3)[0],PADY+.3,P(0,.3)[1],ry,.02,.55,.02,col,.6,0);
  const t=P(0,.05);put(M.flat,GEO.rod3,t[0],PADY+.78,t[1],ry,.02,.55,.02,col,PI/2,0);put(M.flat,GEO.box,P(0,-.3)[0],PADY+.86,P(0,-.3)[1],ry,.1,.05,.26,0x2b2621);}
function laundry(a,b,y){put(M.flat,GEO.rod3,a[0],PADY,a[1],0,.03,y,.03,0x8c9396);put(M.flat,GEO.rod3,b[0],PADY,b[1],0,.03,y,.03,0x8c9396);vq(M.flat,a[0],a[1],b[0],b[1],y-.03,y,0x4a4a48,null,true);
  const l=Math.hypot(b[0]-a[0],b[1]-a[1]),n=Math.floor(l/.9);for(let k=0;k<n;k++){const t=(k+.5)/n+rr(-.04,.04),w=rr(.18,.3),h=rr(.5,.85),cx=lerp(a[0],b[0],t),cz=lerp(a[1],b[1],t),dx=(b[0]-a[0])/l*w,dz=(b[1]-a[1])/l*w;
    vq(M.flat,cx-dx,cz-dz,cx+dx,cz+dz,y-h,y-.02,pick(clothCols),null,true);}}
function shadeCloth(c0,c1,c2,c3,y,posts){const col=pick([0x2f4a3a,0x2b2b2b,0x3a5a48,0x4a3a2a]);quadC(M.flat,[c0[0],y,c0[1]],[c1[0],y,c1[1]],[c2[0],y,c2[1]],[c3[0],y,c3[1]],0,1,0,col);quadC(M.flat,[c3[0],y,c3[1]],[c2[0],y,c2[1]],[c1[0],y,c1[1]],[c0[0],y,c0[1]],0,-1,0,shade(col,.7));
  for(const p of posts)put(M.flat,GEO.rod3,p[0],PADY,p[1],0,.03,y-PADY,.03,0x8c9396);}
function hammock(a,b,y){const col=pick(clothCols),m=[(a[0]+b[0])/2,(a[1]+b[1])/2],dx=(b[1]-a[1]),dz=-(b[0]-a[0]),l=Math.hypot(dx,dz)||1,ox=dx/l*.4,oz=dz/l*.4;
  for(const q of [[a,m,y,y-.6],[m,b,y-.6,y]]){const p=q[0],r=q[1];for(const f of [1,-1])quadC(M.flat,[p[0]-ox*f,q[2],p[1]-oz*f],[p[0]+ox*f,q[2],p[1]+oz*f],[r[0]+ox*f,q[3],r[1]+oz*f],[r[0]-ox*f,q[3],r[1]-oz*f],0,f,0,f>0?col:shade(col,.75));}}
const foodShops={'LONCHERÍA':1,'TAQUERÍA':1,'POLLOS ASADOS':1,'MARISCOS':1},tireShops={'LLANTERA':1,'TALLER MECÁNICO':1,'REFACCIONES':1};
let nUp=0;
for(const L of lots){const F=lotFrame(L),s=F.s,ax=F.ax,fw=F.fw,P=F.P,yard=L.set>=.8,sh=L.kind==='shop',house=L.kind==='house'||L.kind==='block',name=L.sign>=0?shopSigns[L.sign][0]:'';
  const sideK=ax?(rnd()<.5?2:3):(rnd()<.5?0:1),sideU=(ax?s[1]*(L.d/2-.8):s[0]*(L.w/2-.8));
  anchor(L.x,L.z,()=>{let fenced=0,cloth=false;
    if(yard&&!sh&&rnd()<.34){const r=rnd(),g=rr(1,1.3),a=P(-fw/2,L.set),b=P(fw/2,L.set),ga=P(-g/2,L.set),gb=P(g/2,L.set),ca=P(-fw/2,0),cb=P(fw/2,0),ret=L.set>1.4,gr=F.run(-g/2,g/2,L.set),shut=rnd()<.6;
      let h;if(r<.42){fenced=1;h=1.5;fenceLink(a,ga,h,true);fenceLink(gb,b,h,true);if(ret){fenceLink(a,ca,h,false);fenceLink(b,cb,h,false);}if(shut)gate(gr[0],gr[1],1.4,0x8c9396);}
      else{const low=r>.74,blk=!low&&rnd()<.55,tint=blk?0xffffff:pick(fenceTints),cn=blk?'block':'stucco';h=low?rr(.8,1.1):rr(1.7,2.3);fenced=low?3:2;
        fenceWall(a,ga,h,tint,cn);fenceWall(gb,b,h,tint,cn);if(ret){fenceWall(ca,a,h,tint,cn);fenceWall(cb,b,h,tint,cn);}if(shut)gate(gr[0],gr[1],low?1.3:h-.1,pick(gateCols));
        if(!low&&rnd()<.16){const u0=rr(-fw/2+.4,-g/2-2.2),d=F.run(u0,u0+1.8,L.set+.13);vq(M.wall,d[0][0],d[0][1],d[1][0],d[1][1],PADY+.25,PADY+1.05,tint,blk?DUV.tagB:DUV.tag);}}
      if(shut)fenceSolid(a,b,h,fenced===3);else{fenceSolid(a,ga,h,fenced===3);fenceSolid(gb,b,h,fenced===3);}if(ret){fenceSolid(ca,a,h,fenced===3);fenceSolid(cb,b,h,fenced===3);}}

    // the yard: washing, shade cloth, a hammock, pots and a bougainvillea
    if(yard&&L.set>=1.3&&rnd()<.14){const u0=rr(-fw/2+.5,Math.min(-1,fw/2-4.2)),u1=Math.min(fw/2-.5,u0+rr(3,4.5));laundry(P(u0,L.set*.55),P(u1,L.set*.55),1.9);}
    if(fenced&&L.set>=1.5&&rnd()<.22){cloth=true;shadeCloth(P(-fw/2+.3,.1),P(fw/2-.3,.1),P(fw/2-.3,L.set-.15),P(-fw/2+.3,L.set-.15),PADY+2.3,[P(-fw/2+.3,L.set-.15),P(fw/2-.3,L.set-.15)]);}
    if(yard&&L.set>=1.6&&!cloth&&rnd()<.12){const u=rr(-fw/2+1,fw/2-1),p=P(u,L.set-.35);put(M.flat,GEO.rod3,p[0],PADY,p[1],0,.035,1.8,.035,0x8c9396);hammock(P(u,.05),p,PADY+1.5);}
    if(house&&rnd()<.04){const n=rnd()<.3?2:1;for(let k=0;k<n;k++){const p=P(rr(-fw/2+.8,fw/2-.8),.32);pot(p[0],p[1],rr(.8,1.2));}}
    if(!L.two&&rnd()<.26){if(fenced===2&&rnd()<.5){const p=P(rr(-fw/2+1,fw/2-1),L.set-.25);boug(p[0],p[1],rr(1.6,2.4),rr(2.2,3.1));}else{const p=P((rnd()<.5?-1:1)*(fw/2-.8),.3);boug(p[0],p[1],rr(1.3,2.2),rr(1.8,2.9));}}
    if(house&&rnd()<.012){const p=P(rr(-fw/2+1,fw/2-1),.36);bike(p[0],p[1],F.ro+PI/2);}
    // the kerb: trash bags, a bin, boxes and tyres at the shops, tables outside the food places
    if(rnd()<.05){const p=P(rr(-fw/2+.8,fw/2-.8),L.set+SW-.45);trashBags(p[0],p[1],1+Math.floor(rnd()*3));litter(p[0],p[1],2);
      if(rnd()<.2){const q=P(rr(-fw/2+.8,fw/2-.8),L.set+SW-.45);put(M.flat,GEO.tube6,q[0],PADY,q[1],0,.3,.8,.3,pick([0x2f5d3a,0x1d3f7a,0x4a4a48]));put(M.flat,GEO.disc,q[0],PADY+.8,q[1],0,.3,.3,.3,0x2b2621,-PI/2);}}
    if(sh){if(rnd()<.26){const n=1+Math.floor(rnd()*2);for(let k=0;k<n;k++){const sz=rr(.4,.62),p=P(rr(-fw/2+.8,fw/2-.8),.35+sz/2);texBoxU(p[0],PADY,p[1],sz,sz*rr(.6,1),sz,DUV.box);}}
      if(tireShops[name]){for(let k=0;k<1;k++){const p=P((k?-1:1)*rr(1,fw/2-1),.55),n=1+Math.floor(rnd()*3);for(let j=0;j<n;j++)tire(p[0],p[1],PADY+j*.2,rnd()*3);}}
      if(foodShops[name]&&rnd()<.35){const p=P(rr(-fw/2+1.4,fw/2-1.4),.95);tableSet(p[0],p[1],F.ro,2);}
      if(rnd()<.3)wallDecal(L.x,L.z,L.w,L.d,sideK,sideU,PADY+1.6,.7,.45,DUV.abierto);if(rnd()<.35){const p=P(rr(-fw/2+1,fw/2-1),L.set+SW+.6);litter(p[0],p[1],2,.032);}}
    // walls: a SE VENDE board, a graffiti tag, a split air conditioner with its rust streak
    if(house&&rnd()<.055)wallDecal(L.x,L.z,L.w,L.d,L.front,rr(-fw/2+1,fw/2-1),2.3,.9,.42,rnd()<.65?DUV.vende:DUV.renta);
    if(house&&rnd()<.07)wallDecal(L.x,L.z,L.w,L.d,L.front,rr(-fw/2+1.2,fw/2-1.2),PADY+.08,rr(1.2,1.9),.64,DUV.tag,L.tint);
    if(rnd()<.06)wallDecal(L.x,L.z,L.w,L.d,sideK,sideU-(sideU>0?.6:-.6),PADY+.08,1.4,.64,DUV.tag,L.tint);
    if(rnd()<(sh?.16:.045)){const u=rr(-fw/2+1,fw/2-1),y=L.two?3.6:Math.min(L.h-.8,2.35),p=P(u,.16);boxC(M.flat,p[0],y,p[1],ax?.78:.3,.52,ax?.3:.78,0xd5d6d2,0xc9ccc8);
      if(rnd()<.5)wallDecal(L.x,L.z,L.w,L.d,L.front,u,y-.9,.5,.9,DUV.rust,L.tint);}
    // the roof: rebar waiting for the next floor, an unfinished block floor, a satellite dish
    if(L.flat&&!L.two&&L.kind!=='block'&&L.kind!=='shack'){
      if(rnd()<.09&&L.kind==='house'&&nUp<60){nUp++;const hu=rr(1.0,2.4);for(let k=0;k<4;k++)wallSide(L.x,L.z,L.w,L.d,L.h,hu,k,rep('block',segs(k<2?L.w:L.d)),0xffffff);
        for(const q of [[-1,-1],[1,1]])put(M.flat,GEO.rod3,L.x+q[0]*(L.w/2-.15),L.h+hu,L.z+q[1]*(L.d/2-.15),0,.022,rr(.5,.9),.022,0x6b4a32);solid(L.x,L.z,L.w,L.d,hu,L.h,0);}
      else if(rnd()<.08)for(const q of [[-1,-1],[1,-1],[-1,1],[1,1]])if(rnd()<.75)put(M.flat,GEO.rod3,L.x+q[0]*(L.w/2-.25),L.h,L.z+q[1]*(L.d/2-.25),0,.022,rr(.4,1.0),.022,0x6b4a32);}
    if(L.flat&&rnd()<.07){const p=P((rnd()<.5?-1:1)*(fw/2-.6),-.5),y=L.h;put(M.flat,GEO.rod3,p[0],y,p[1],0,.02,.85,.02,0x8c9396);put(M.flat,GEO.disc,p[0],y+.85,p[1],F.ro,.36,.36,.36,0xd9d9d2,-.55);}
  });}
// back yards inside the blocks: a washing line or a square of shade cloth
for(const Y of yards)anchor(Y[0],Y[1],()=>{if(Y[2])laundry([Y[0]-2.1,Y[1]],[Y[0]+2.1,Y[1]],1.9);
  else shadeCloth([Y[0]-2,Y[1]-2],[Y[0]+2,Y[1]-2],[Y[0]+2,Y[1]+2],[Y[0]-2,Y[1]+2],PADY+2.3,[[Y[0]-2,Y[1]-2],[Y[0]+2,Y[1]-2],[Y[0]+2,Y[1]+2],[Y[0]-2,Y[1]+2]]);});
// empty lots: a wall somebody started, a car body rusting away, junk, scrub
let nCar=0;
M.dirtO=M.dirt.clone();M.dirtO.polygonOffsetFactor=M.dirtO.polygonOffsetUnits=-2;
for(const V of vacants){const F=lotFrame(V),fw=F.fw,dp=F.dp,P=F.P,r=rnd();
  if(rnd()<.55){const a=P(rr(-fw/2+.5,-1),-rr(1,dp*.4)),b=P(rr(1,fw/2-.5),-rr(dp*.5,dp-.5));flat(M.dirtO,Math.min(a[0],b[0]),Math.min(a[1],b[1]),Math.max(a[0],b[0]),Math.max(a[1],b[1]),PADY+.007,10);}
  if(r>.4&&rnd()<.6)continue;
  anchor(V.x,V.z,()=>{if(rnd()<.5){const p=P(rr(-fw/2+1.5,fw/2-1.5),-rr(1.5,dp-1.5));litter(p[0],p[1],3);}
    if(r<.05){const u0=-fw/2+.6,len=fw*rr(.4,.8),h=rr(.6,1.4),a=P(u0,-.35),b=P(u0+len,-.35),c=P(u0,-rr(3,Math.min(6,dp-1)));fenceWall(a,b,h,0xffffff,'block');fenceWall(a,c,h,0xffffff,'block');fenceSolid(a,b,h,h<1.2);fenceSolid(a,c,h,h<1.2);
      for(let k=0;k<3;k++){const p=P(u0+len*(k+.5)/3,-.35);put(M.flat,GEO.rod3,p[0],h,p[1],0,.022,rr(.4,.8),.022,0x6b4a32);}
      const q=P(u0+len*.5+rr(-1,1),-rr(2,4));for(let k=0;k<3;k++)texBox(q[0]+(k<2?(k?.42:-.42):0),PADY+(k<2?0:.4),q[1],.8,.4,.4,'block',0xffffff);
      const sd=P(u0+len*.5+rr(1.5,3),-rr(1.5,3.5));put(M.flat,GEO.lump,sd[0],PADY,sd[1],0,1.3,.5,1.3,0xd2b27c);
      if(rnd()<.4){const u=rr(-fw/2+1,fw/2-1),sp=P(u,-.8),d=F.run(u-.45,u+.45,-.78);put(M.flat,GEO.rod3,sp[0],PADY,sp[1],0,.03,1.6,.03,0x8c9396);vq(M.wall,d[0][0],d[0][1],d[1][0],d[1][1],PADY+1.1,PADY+1.52,0xffffff,DUV.vende,true);}}
    else if(r<.08&&nCar<6){nCar++;const alongX=rnd()<.5,p=P(rr(-fw/2+3.2,fw/2-3.2),-rr(3.2,Math.max(3.3,dp-3)));const v=vehicle(rnd()<.5?'sedan':'pickup',p[0],p[1],alongX,pick([0x6e4630,0x7a5a3c,0x8a6a50,0x5a4a44]),1);
      solid(p[0],p[1],v.w,v.d,1.3,0,5);lowCover.push([p[0],p[1]]);for(let k=0;k<2;k++){const t=P(rr(-fw/2+1,fw/2-1),-rr(1,dp-1));tire(t[0],t[1],PADY,rnd()*3,rnd()<.5?0:PI/2);}}
    else if(r<.12){const p=P(rr(-fw/2+1.5,fw/2-1.5),-rr(1.5,dp-1.5)),ly=rnd()<.5;boxC(M.flat,p[0],PADY,p[1],ly?1.6:.7,ly?.7:1.6,.7,0xe9e5da,0xd9d5cb);
      const c=P(rr(-fw/2+1,fw/2-1),-rr(1,dp-1));chair(c[0],c[1],rnd()*TAU,pick(chairCols),true);for(let k=0;k<2;k++){const t=P(rr(-fw/2+1,fw/2-1),-rr(1,dp-1));tire(t[0],t[1],PADY,rnd()*3,rnd()<.5?0:PI/2);}
      if(rnd()<.5)shrubs.push([V.x+rr(-fw/3,fw/3),V.z+rr(-2,2),rr(.5,1)]);}
    else if(r<.16){const p=P(rr(-fw/2+1.5,fw/2-1.5),-rr(1.5,dp-1.5));trashBags(p[0],p[1],3+Math.floor(rnd()*2));}
    else if(rnd()<.5)shrubs.push([V.x+rr(-fw/3,fw/3),V.z+rr(-2,2),rr(.5,1.1)]);});}
for(let k=0;k<1800&&cacti.length<110;k++){const x=rr(-900,1400),z=rr(-1200,1100);if(wild(x,z)){const h=rr(.7,1.5);cacti.push([x,z,h]);
  if(x>BOUND.x0-10&&x<BOUND.x1+10&&z>BOUND.z0-10&&z<BOUND.z1+10)solid(x,z,.8,.8,5*h);}}
{const b=new GB();b.add(new T.SphereGeometry(1,5,3),0,.3,0,0,0,0,1,.62,1,0x7c8450,(x,y,z)=>.6+.5*clamp(y/.8,0,1)+rr(-.08,.08));
 bake(b.build(),M.flat,shrubs,(o,p,k)=>{o.position.set(p[0],0,p[1]);o.scale.setScalar(p[2]);o.rotation.y=k;});
 // cardon cactus: ribbed column with upturned arms
 const c=new GB(),col=0x5a7a44,rib=(x,y,z)=>.84+.16*Math.cos(Math.atan2(z,x)*8)+rr(-.03,.03);
 c.add(GEO.tube8,0,0,0,0,0,0,.26,4.6,.26,col,rib);c.add(GEO.blob,0,4.6,0,0,0,0,.26,.3,.26,col);
 for(const a of [[1,1.5,2.4,0],[-1,2.1,1.7,.5]]){const ax=Math.cos(a[3])*a[0],az=Math.sin(a[3])*a[0];c.add(GEO.tube6,ax*.2,a[1]-.02,az*.2,0,-a[3],-PI/2*Math.sign(a[0]),.16,.62,.16,col);
   c.add(GEO.tube8,ax*.76,a[1]-.16,az*.76,0,0,0,.17,a[2],.17,col,rib);c.add(GEO.blob,ax*.76,a[1]+a[2]-.16,az*.76,0,0,0,.17,.2,.17,col);}
 bake(c.build(),M.flat,cacti,(o,p,k)=>{o.position.set(p[0],0,p[1]);o.rotation.y=k*1.3;o.scale.setScalar(p[2]);});}
