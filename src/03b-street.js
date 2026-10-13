// =====================================================================
// 03b STREET FURNITURE + SKY: lamps, power lines, roof tanks, barrels, fuel pumps, the Sierra, sky and sun
// =====================================================================
{ // boulevard lamp: tapered pole with two curved arms; plaza lamp: short post with a globe
 const a=new GB(),steel=0x9aa1a3;a.add(GEO.tube6,0,0,0,0,0,0,.1,8,.1,steel);a.add(GEO.tube6,0,0,0,0,0,0,.2,.5,.2,0x6f7577);
 for(const s of [-1,1]){for(let k=0;k<4;k++){const t=k/4,an=t*1.2;a.add(GEO.tube6,s*(Math.sin(an)*1.7),8+(1-Math.cos(an))*-.1+Math.sin(an)*.5-.02,0,0,0,-s*(PI/2-.5+an*.5),.05,.62,.05,steel);}
   a.add(GEO.box,s*2.15,8.55,0,0,0,0,.75,.12,.3,0x5a5f61);a.add(GEO.box,s*2.15,8.5,0,0,0,0,.6,.05,.22,0xf6efcf);}
 bake(a.build(),M.flat,lamps.filter(l=>!l[2]),(o,p)=>{o.position.set(p[0],.2,p[1]);o.rotation.y=p[3]||0;});
 const b=new GB();b.add(GEO.tube6,0,0,0,0,0,0,.14,.5,.14,0x2b2621);b.add(GEO.rod,0,.5,0,0,0,0,.055,3,.055,0x2b2621);b.add(GEO.cyl6,0,3.5,0,0,0,0,.16,.1,.16,0x2b2621);b.add(GEO.blob,0,3.86,0,0,0,0,.3,.3,.3,0xf6efcf);
 bake(b.build(),M.flat,lamps.filter(l=>l[2]===1),(o,p)=>o.position.set(p[0],PADY,p[1]));
 lamps.forEach(l=>solid(l[0],l[1],.3,.3,l[2]?4:8));}
{ // wooden power poles with a crossarm and insulators; wires sag between neighbours
 const b=new GB(),w=0x6b5138;b.add(GEO.tube6,0,0,0,0,0,0,.13,8.8,.13,w);b.add(GEO.box,0,7.9,0,0,0,0,.12,.12,2.3,w);b.add(GEO.box,0,7.2,0,0,0,0,.1,.1,1.5,w);
 for(const s of [-1,0,1])b.add(GEO.rod,0,8.02,s*1,0,0,0,.05,.16,.05,0xd9d9d2);for(const s of [-.6,.6])b.add(GEO.rod,0,7.3,s,0,0,0,.05,.14,.05,0xd9d9d2);b.add(GEO.cyl6,.22,5.6,0,0,0,0,.2,.7,.2,0x8c9396);
 bake(b.build(),M.flat,poles,(o,p)=>{o.position.set(p[0],0,p[1]);o.rotation.y=p[2]?PI/2:0;});
 const pts=[];for(let k=0;k<poles.length-1;k++){const A=poles[k],B=poles[k+1];if(A[2]!==B[2]||Math.hypot(A[0]-B[0],A[1]-B[1])>50)continue;
   for(const s of [-1,0,1])for(let q=0;q<4;q++){const t0=q/4,t1=(q+1)/4,sag=t=>8.15-1.1*4*t*(1-t)*.45,ox=A[2]?s:0,oz=A[2]?0:s;
     pts.push(lerp(A[0],B[0],t0)+ox,sag(t0),lerp(A[1],B[1],t0)+oz,lerp(A[0],B[0],t1)+ox,sag(t1),lerp(A[1],B[1],t1)+oz);}}
 const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(pts,3));const ln=new T.LineSegments(g,new T.LineBasicMaterial({color:0x2b2621}));ln.frustumCulled=false;scene.add(ln);}
{ // black plastic water tanks on the roofs
 const b=new GB(),k=0x1d1c1a;b.add(GEO.tube8,0,0,0,0,0,0,.56,1.0,.56,k);b.add(GEO.coneO,0,1,0,0,0,0,.56,.34,.56,0x262422);
 bake(b.build(),M.flat,tinacos,(o,p)=>o.position.set(p[0],p[1],p[2]));}
// explosive barrels and fuel pumps are separate objects so they can be destroyed
{const pts=[];for(const q of [[0,0],[.4,0],[.42,.03],[.42,.36],[.44,.38],[.42,.4],[.42,.74],[.44,.76],[.42,.78],[.42,1.12],[.4,1.15],[.34,1.15],[.34,1.12],[0,1.12]])pts.push(new T.Vector2(q[0],q[1]));
 const barrelGeo=new T.LatheGeometry(pts,12),barrelMat=L({color:0xb3261e});
 for(const s of barrelSpots){const m=new T.Mesh(barrelGeo,barrelMat);m.position.set(s[0],0,s[1]);m.castShadow=true;addProp(m);const c=solid(s[0],s[1],.84,.84,1.15,0,3);c.hp=40;c.ref=m;}
 const b=new GB();b.add(GEO.box,0,0,0,0,0,0,.62,1.5,.42,0x2f7d4f);b.add(GEO.box,0,1.5,0,0,0,0,.7,.34,.5,0xf4f0e7);b.add(GEO.box,0,.95,.215,0,0,0,.46,.36,.02,0x15110c);b.add(GEO.box,0,.95,-.215,0,0,0,.46,.36,.02,0x15110c);
 b.add(GEO.box,0,.5,.215,0,0,0,.5,.3,.02,0xe9e5da);b.add(GEO.box,0,.5,-.215,0,0,0,.5,.3,.02,0xe9e5da);b.add(GEO.cyl6,.36,.5,0,0,0,0,.035,.8,.035,0x1b1a19);b.add(GEO.cyl6,-.36,.5,0,0,0,0,.035,.8,.035,0x1b1a19);
 b.add(GEO.box,0,0,0,0,0,0,.66,.12,.46,0xb3261e);const pumpGeo=b.build();
 for(const p of pumps){const m=new T.Mesh(pumpGeo,vcMat);m.position.set(p[0],PADY+.18,p[1]);m.rotation.y=p[2]?PI/2:0;m.castShadow=true;addProp(m);
   const c=solid(p[0],p[1],p[2]?.5:.7,p[2]?.7:.5,2.1,0,4);c.hp=90;c.ref=m;}}
// Sierra de la Giganta: layered ridges on the eastern horizon (real bearings 20 to 140 degrees). They ride with the camera like the sky.
const sierra=new T.Group();scene.add(sierra);
for(const lay of [[1700,0xbcaebb,40,110,1],[1560,0xa99bae,45,150,2],[1420,0x9c8c9e,20,80,3]]){const p=[],ix=[];let h=lay[3]*.6,n=0;
  for(let b=14;b<=146;b+=1.5,n++){const f=(b-ROT_DEG)*PI/180,x=lay[0]*Math.sin(f),z=-lay[0]*Math.cos(f),edge=clamp(Math.min(b-14,146-b)/26,0,1);
    h=clamp(h+rr(-16,16),lay[2],lay[3]);p.push(x,-12,z,x,h*edge+2,z);if(b<146){const a=n*2;ix.push(a,a+1,a+2,a+1,a+3,a+2);}}
  const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(p,3));g.setIndex(ix);
  const m=new T.Mesh(g,new T.MeshBasicMaterial({color:lay[1],fog:false,side:T.DoubleSide,depthWrite:false}));m.renderOrder=-9+lay[4];m.frustumCulled=false;sierra.add(m);}
const sky=new T.Mesh(new T.SphereGeometry(2400,32,16),new T.MeshBasicMaterial({side:T.BackSide,fog:false,depthWrite:false,
  map:tex(1024,512,(g,w,h)=>{const gr=g.createLinearGradient(0,0,0,h);gr.addColorStop(0,'#2a66ad');gr.addColorStop(.3,'#6fa4d2');gr.addColorStop(.44,'#c9d3d2');gr.addColorStop(.485,'#e6cfa8');
    gr.addColorStop(.5,'#e3c7a0');gr.addColorStop(1,'#e3c7a0');g.fillStyle=gr;g.fillRect(0,0,w,h);
    for(let k=0;k<26;k++){const cx=rnd()*w,cy=h*rr(.25,.43),rx=rr(40,130),ry=rr(5,13);for(let q=0;q<7;q++){const x=cx+rr(-rx,rx),y=cy+rr(-ry,ry),r=rr(18,46);
      for(const ox of [-w,0,w]){const cg=g.createRadialGradient(x+ox,y,1,x+ox,y,r);cg.addColorStop(0,'rgba(255,250,240,.2)');cg.addColorStop(1,'rgba(255,250,240,0)');g.fillStyle=cg;g.fillRect(x+ox-r,y-r,2*r,2*r);}}}})}));
sky.renderOrder=-10;scene.add(sky);
const glow=tex(128,128,(g,w,h)=>{const gr=g.createRadialGradient(64,64,2,64,64,64);gr.addColorStop(0,'rgba(255,255,255,1)');gr.addColorStop(.12,'rgba(255,244,214,.95)');
  gr.addColorStop(.4,'rgba(255,220,160,.25)');gr.addColorStop(1,'rgba(255,220,160,0)');g.fillStyle=gr;g.fillRect(0,0,w,h);});
const sunSprite=new T.Sprite(new T.SpriteMaterial({map:glow,fog:false,depthWrite:false,transparent:true}));sunSprite.scale.set(520,520,1);scene.add(sunSprite);
