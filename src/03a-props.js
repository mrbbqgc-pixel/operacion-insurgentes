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
const frondTex=tex(256,64,(g,w,h)=>{g.clearRect(0,0,w,h);for(let x=4;x<w-2;x+=5){const t=x/w,len=(h/2-2)*Math.sin(Math.min(1,t*1.5)*PI*.5)*(1-.55*t*t)+2;
    for(const s of [-1,1]){g.fillStyle=pick(['#3c7a35','#356e30','#44883a','#2f6229','#4b8f3f']);g.beginPath();g.moveTo(x-2,h/2);g.lineTo(x+7+rnd()*3,h/2+s*len);g.lineTo(x+3,h/2);g.fill();}}
  g.fillStyle='#7d8a4a';g.fillRect(0,h/2-1.5,w,3);});
M.frond=L({map:frondTex,alphaTest:.45,side:T.DoubleSide,vertexColors:true});M.frond.userData.chunk=1;M.frond.userData.cast=true;
function frondGeo(len,wid,rise,droop){const N=5,p=[],n=[],u=[],ix=[];for(let k=0;k<=N;k++){const t=k/N,x=len*t,y=rise*t-droop*t*t,w=wid*(.35+.65*Math.sin(Math.min(1,t*1.6)*PI*.5))*(1-.4*t*t);
    p.push(x,y+.12*w,-w,x,y,0,x,y+.12*w,w);for(let q=0;q<3;q++){n.push(0,1,0);}u.push(t,0,t,.5,t,1);
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
for(let k=0;k<1800&&cacti.length<110;k++){const x=rr(-900,1400),z=rr(-1200,1100);if(wild(x,z)){const h=rr(.7,1.5);cacti.push([x,z,h]);
  if(x>BOUND.x0-10&&x<BOUND.x1+10&&z>BOUND.z0-10&&z<BOUND.z1+10)solid(x,z,.8,.8,5*h);}}
{const b=new GB();b.add(GEO.bag,0,.3,0,0,0,0,1,.62,1,0x7c8450,(x,y,z)=>.6+.5*clamp(y/.8,0,1)+rr(-.08,.08));
 bake(b.build(),M.flat,shrubs,(o,p,k)=>{o.position.set(p[0],0,p[1]);o.scale.setScalar(p[2]);o.rotation.y=k;});
 // cardon cactus: ribbed column with upturned arms
 const c=new GB(),col=0x5a7a44,rib=(x,y,z)=>.84+.16*Math.cos(Math.atan2(z,x)*8)+rr(-.03,.03);
 c.add(GEO.tube8,0,0,0,0,0,0,.26,4.6,.26,col,rib);c.add(GEO.blob,0,4.6,0,0,0,0,.26,.3,.26,col);
 for(const a of [[1,1.5,2.4,0],[-1,2.1,1.7,.5]]){const ax=Math.cos(a[3])*a[0],az=Math.sin(a[3])*a[0];c.add(GEO.tube6,ax*.2,a[1]-.02,az*.2,0,-a[3],-PI/2*Math.sign(a[0]),.16,.62,.16,col);
   c.add(GEO.tube8,ax*.76,a[1]-.16,az*.76,0,0,0,.17,a[2],.17,col,rib);c.add(GEO.blob,ax*.76,a[1]+a[2]-.16,az*.76,0,0,0,.17,.2,.17,col);}
 bake(c.build(),M.flat,cacti,(o,p,k)=>{o.position.set(p[0],0,p[1]);o.rotation.y=k*1.3;o.scale.setScalar(p[2]);});}
