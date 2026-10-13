// =====================================================================
// 02f LANDMARKS (3): civic buildings, clinics, bus terminal, water tower, cotton gin, stadium, cemetery
// =====================================================================
const SIDE_L='NSWE';
// a row of ordinary lots along the local front edge of a block, between local x0 and x1
function rowLots(F,LD,x0,x1,com,edge){let x=x0;while(x<x1-6){let w=Math.min(rr(8,13),x1-x);if(x1-x-w<6)w=x1-x;const d=rr(8,11);
    const shop=rnd()<com;F.build(x+w/2,LD/2-SW-d/2,w,d,rr(3.3,4),{front:1,kind:shop?'shop':(edge&&rnd()<.25?'block':'house'),sign:shop?(shopK++)%shopSigns.length:-1});x+=w+(rnd()<.3?rr(1.5,3):0);}}
// a public building on the local front edge of an ordinary block. o: w,d,h,lx,tint,band,bg,fg,fc,van,com
function civic(B,r,name,o){o=o||{};const F=TF(B.cx,B.cz,r),LW=r%2?B.d:B.w,LD=r%2?B.w:B.d,w=Math.min(o.w||20,LW-2*SW),d=o.d||12,h=o.h||4.4,lx=o.lx===undefined?0:clamp(o.lx,-LW/2+SW+w/2,LW/2-SW-w/2),v=sup(B.cx,B.cz);
  pad(B.cx,B.cz,B.w,B.d);blockHouses(B,v<.4?.1:v<.8?.25:.45,SIDE_L[F.s(1)],commerce(B),v>.6);
  hall(F,lx,LD/2-SW-d/2,w,d,h,o.tint===undefined?0xf2efe6:o.tint,{fc:o.fc||['winWide','doorGlass','winWide'],sc:['stucco','winBars'],band:o.band});
  F.sign(name,lx,PADY+h-1.75,LD/2-SW+.06,0,Math.min(w-3,name.length*.6+2),1.0,o.bg||'#f4f0e7',o.fg||'#1d3f7a',true);
  rowLots(F,LD,-LW/2+SW,lx-w/2-(o.van?4.6:1.5),o.com||.1,v>.6);rowLots(F,LD,lx+w/2+1.5,LW/2-SW,o.com||.1,v>.6);
  if(o.van){const p=F.p(lx-w/2-2.4,LD/2-SW-3.4);const c=park(p[0],p[1],r%2===1,0xf4f0e7,'van');}
  label(B.cx,B.cz,name,0);return F;}
// ---------- IMSS family clinic: a whole block with its car park
function clinic(B,r,name,short){const F=TF(B.cx,B.cz,r),LW=r%2?B.d:B.w,LD=r%2?B.w:B.d,hw=LW/2,hd=LD/2;pad(B.cx,B.cz,B.w,B.d);
  const bw=Math.min(LW-14,46);hall(F,-3,-hd+13,bw,20,4.6,0xf2efe6,{fc:['winWide','winWide','doorGlass','winWide'],sc:['stucco','winBars'],band:0x1f6b45});
  F.box(-3,3.2,-hd+24.2,10,.16,2.6,0xe9e4d8);for(const s of [-4.6,4.6])F.put(GEO.cyl8,-3+s,PADY,-hd+25.3,0,.1,3.1,.1,0xf4f0e7);
  F.sign(name,-3,PADY+3.6,-hd+23.07,0,Math.min(12,bw-6),1.1,'#f4f0e7','#1f5d3a',true);
  F.flat(M.asphaltO,-hw+3,-hd+28,hw-3,hd-2,PADY+.006,10);const n=Math.floor((LW-10)/3);for(let k=0;k<=n;k++)F.flat(M.lineW,-hw+5+k*3-.06,hd-8,-hw+5+k*3+.06,hd-2.8,PADY+.012,1);
  for(let k=0;k<n;k++)if(rnd()<.35)F.car(-hw+6.5+k*3,hd-5.4,false,k===1?0xf4f0e7:undefined,k===1?'van':undefined);
  for(const s of [-1,1])F.tree(s*(hw-5),-hd+30,1.1,0);F.palm(hw-6,-hd+8);flagpole(F,hw-9,hd-11,8);label(B.cx,B.cz,short||name,0);return F;}
// ---------- bus terminal on the boulevard. Local front (+z) faces the boulevard.
function terminal(B,r){const F=TF(B.cx,B.cz,r),LW=r%2?B.d:B.w,LD=r%2?B.w:B.d,hw=LW/2,hd=LD/2;pad(B.cx,B.cz,B.w,B.d,M.asphalt,true);
  hall(F,-hw+11,-hd+8.5,18,13,4.4,0xf2efe6,{fc:['glassFront','doorGlass','winWide'],sc:['stucco','winBars'],band:0x1d3f7a});
  F.sign('CENTRAL DE AUTOBUSES',-hw+11,PADY+3.5,-hd+15.07,0,13,1.1,'#1d3f7a','#f4f0e7',true);
  const kx=9,kz=-3;for(const a of [-1,1])for(const b of [-1,1]){F.put(GEO.cyl12,kx+a*7,PADY,kz+b*6,0,.2,4.2,.2,0xd9d9d2);F.solid(kx+a*7,kz+b*6,.45,.45,4.4);}
  const cb=F.b(kx,kz,16,14);anchor(cb[0],cb[1],()=>{F.box(kx,4.3,kz,16,.35,14,0xd9dcdc,0xb9bfc0);F.box(kx,4.2,kz,15.4,.1,13.4,0xe9e9e4);blob(cb[0],cb[1],cb[2]/2,cb[3]/2,PADY);});F.solid(kx,kz,16,14,.4,4.3);
  for(const s of [-3.4,3.4]){const p=F.p(kx+s,kz);bus(p[0],p[1],r%2===1);}
  for(let k=0;k<3;k++)bench(F,-hw+5+k*5,-hd+17.5,true);
  F.build(hw-8,hd-7,11,8,3.6,{front:1,kind:'shop',sign:14});label(B.cx,B.cz,'CENTRAL DE AUTOBUSES',0);return F;}
// ---------- water tower
function tower(x,z){anchor(x,z,()=>{for(const p of [[-2.3,-2.3],[2.3,-2.3],[-2.3,2.3],[2.3,2.3]]){put(M.flat,GEO.cyl8,x+p[0],0,z+p[1],0,.16,13,.16,C.steel);solid(x+p[0],z+p[1],.4,.4,13);}
    for(const y of [4,8.5,12.6]){boxC(M.flat,x,y,z-2.3,4.7,.14,.14,C.steel);boxC(M.flat,x,y,z+2.3,4.7,.14,.14,C.steel);boxC(M.flat,x-2.3,y,z,.14,.14,4.7,C.steel);boxC(M.flat,x+2.3,y,z,.14,.14,4.7,C.steel);}
    put(M.flat,GEO.cyl12,x,12.8,z,0,3.9,.3,3.9,0xb9bfc0);put(M.flat,GEO.cone8,x,17.7,z,0,3.9,1.5,3.9,0xb9bfc0);put(M.flat,GEO.box,x+2.3,0,z,0,.5,13,.06,0x777b7c);blob(x,z,4,4);});
  const t=new T.Mesh(new T.CylinderGeometry(3.7,3.7,4.6,20),new T.MeshLambertMaterial({map:tex(512,64,(g,w,h)=>{g.fillStyle='#e9edf0';g.fillRect(0,0,w,h);
    noise(g,w,h,600,.06);for(let k=0;k<12;k++){g.fillStyle='rgba(140,80,35,.18)';g.fillRect(rnd()*w,0,rr(3,9),h);}g.fillStyle='#1d3f7a';g.font='bold 30px Arial,sans-serif';g.textAlign='center';g.textBaseline='middle';
    g.fillText('CD. INSURGENTES',128,34);g.fillText('CD. INSURGENTES',384,34);})}));t.position.set(x,15.4,z);t.castShadow=true;addProp(t);}
// ---------- cotton gin: a tall corrugated shed with a cyclone and bales in the yard
function gin(B,r){const F=TF(B.cx,B.cz,r),LW=r%2?B.d:B.w,LD=r%2?B.w:B.d,hw=LW/2,hd=LD/2;pad(B.cx,B.cz,B.w,B.d,null,true);const bw=LW-12,bd=Math.min(24,LD-22),bz=-hd+3+bd/2,b=F.b(0,bz,bw,bd);
  anchor(b[0],b[1],()=>{for(let s=0;s<4;s++){const n=segs(s<2?bw:bd);F.side(0,bz,bw,bd,PADY,4-PADY,s,cyc(s===1?['corr','gate','corr']:['corr'],n),0xb9bfc0);F.side(0,bz,bw,bd,4,4,s,rep('corr',n),0xb9bfc0);}
    roofGable(b[0],b[1],b[2],b[3],8,2.6,0xa9b0b1,0xb9bfc0);shadeRect(b[0],b[1],b[2],b[3],PADY);
    F.put(GEO.cyl12,hw-5,PADY,bz-2,0,1.3,11,1.3,0xb3b9bb);F.put(GEO.cone8,hw-5,PADY+11,bz-2,0,1.3,1.6,1.3,0xb3b9bb);F.put(GEO.cyl8,hw-5,PADY+7,bz+2.2,0,.22,5,.22,0x8c9396);});
  F.solid(0,bz,bw,bd,9,0,1);F.solid(hw-5,bz-2,2.6,2.6,12);buildings.push({x:b[0],z:b[1],w:b[2],d:b[3],h:8,flat:false});
  F.sign('DESPEPITADORA',0,6.2,bz+bd/2+.08,0,14,1.8,'#f4f0e7','#15110c',true);
  for(const q of [[-12,8],[-10.4,8],[-11.2,9.6],[-3,11],[-1.4,11],[6,7],[7.6,7],[6.8,8.6],[14,12]]){const p=F.p(q[0],hd-22+q[1]);anchor(p[0],p[1],()=>{boxC(M.flat,p[0],PADY,p[1],1.5,1.3,1.5,0xf1eee6,0xe6e2d8);blob(p[0],p[1],1.3,1.3,PADY);});solid(p[0],p[1],1.5,1.5,1.42,0,5);lowCover.push(p);}
  label(B.cx,B.cz,'DESPEPITADORA',0);return F;}
// ---------- baseball stadium: a walled compound centred on (cx,cz)
function stadium(cx,cz){const S=53,F=TF(cx,cz,0);pad(cx,cz,106,106,M.grass,true);
  for(const s of [-1,1]){F.wall(-S/2-4,s*(S-.3),S-8,.5,2.6,0xe9e4d8,'block');F.wall(S/2+4,s*(S-.3),S-8,.5,2.6,0xe9e4d8,'block');F.wall(s*(S-.3),-S/2-4,.5,S-8,2.6,0xe9e4d8,'block');F.wall(s*(S-.3),S/2+4,.5,S-8,2.6,0xe9e4d8,'block');}
  // infield diamond in the south-west corner, grandstand behind home plate
  const hx=-30,hz=30;quad(M.infield,[cx+hx-4,PADY+.006,cz+hz+4],[cx+hx+28,PADY+.006,cz+hz+4],[cx+hx+28,PADY+.006,cz+hz-28],[cx+hx-4,PADY+.006,cz+hz-28],0,1,0,5,5);
  anchor(cx-30,cz+30,()=>{for(const b of [[0,0],[24,0],[24,-24],[0,-24]])F.box(hx+b[0],PADY+.01,hz+b[1],.7,.07,.7,0xf4f0e7);
    for(let k=0;k<5;k++){F.box(hx-8-k*1.1,PADY,hz-10,1.1,.5+k*.5,30,0xb4afa5,0xc9c4b8);F.box(hx+10,PADY,hz+8+k*1.1,30,.5+k*.5,1.1,0xb4afa5,0xc9c4b8);}
    F.box(hx-10,PADY+3.6,hz-10,6.5,.14,30,0xb9bfc0);F.box(hx+10,PADY+3.6,hz+10,30,.14,6.5,0xb9bfc0);
    for(const q of [-14,0,14]){F.post(hx-13,hz-10+q,3.6,.09,0x8c9396,PADY);F.post(hx+10+q,hz+13,3.6,.09,0x8c9396,PADY);}});
  for(let k=0;k<5;k++){F.solid(hx-8-k*1.1,hz-10,1.1,30,.62+k*.5);F.solid(hx+10,hz+8+k*1.1,30,1.1,.62+k*.5);}
  for(const p of [[-46,-46],[46,-46],[46,46],[-46,46]]){F.post(p[0],p[1],16,.22,0x8c9396);F.solid(p[0],p[1],.5,.5,16);F.box(p[0],15.2,p[1],3.2,1.5,.3,0x4a4c4c);for(let k=0;k<3;k++)F.box(p[0]-1+k,15.5,p[1]+.16,.7,.9,.06,0xf4f0e7);}
  F.build(hx+36,hz+6,10,3.4,2.4,{kind:'block',front:0,gable:false,noTank:true});F.build(hx-6,hz-36,3.4,10,2.4,{kind:'block',front:3,gable:false,noTank:true});
  F.box(30,PADY,-46,9,5,.5,0x23382c);F.sign('LOCAL   0\nVISITA  0',30,PADY+3,-45.7,0,7,3,'#1c2a22','#e2b93b',true);
  F.sign('ESTADIO DE BÉISBOL',0,3.3,-S+.02,PI,12,1.3,'#f4f0e7','#1d3f7a',true);label(cx,cz,'ESTADIO',0);}
