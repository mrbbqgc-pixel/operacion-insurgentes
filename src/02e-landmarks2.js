// =====================================================================
// 02e LANDMARKS (2): institutional halls, schools, kindergartens, gas stations, hotels, the supermarket
// =====================================================================
const cyc=(pat,n)=>{const a=[];for(let k=0;k<n;k++)a.push(pat[k%pat.length]);return a;};
// a plain institutional building in a local frame. o: front, fc/sc (cell patterns for the front and the other sides), up (upper-floor pattern), band, roof
function hall(F,lx,lz,lw,ld,h,tint,o){o=o||{};const front=o.front===undefined?1:o.front,fc=o.fc||['doorGlass','winWide'],sc=o.sc||['stucco','stucco','winSmall'],two=!!o.up,hg=two?3.4:h;
  const b=F.b(lx,lz,lw,ld);
  anchor(b[0],b[1],()=>{for(let s=0;s<4;s++){const n=segs(s<2?lw:ld);F.side(lx,lz,lw,ld,PADY,hg-PADY,s,cyc(s===front?fc:sc,n),tint);if(two)F.side(lx,lz,lw,ld,hg,h-hg,s,cyc(s===front?o.up:['upPlain','upWin'],n),tint);}
    roofFlat(b[0],b[1],b[2],b[3],h,o.roof||0xd9d2c4,o.band===undefined?shade(tint,.84):o.band);
    if(o.band!==undefined)boxC(M.flat,b[0],h-.95,b[1],b[2]+.12,.6,b[3]+.12,o.band);
    if(!o.noAC)for(let k=0;k<Math.round(lw*ld/90);k++)boxC(M.flat,b[0]+rr(-b[2]/3,b[2]/3),h,b[1]+rr(-b[3]/3,b[3]/3),1.1,.6,.8,0xc9ccc8,0xb3b6b2);
    shadeRect(b[0],b[1],b[2],b[3],PADY);});
  solid(b[0],b[1],b[2],b[3],h+.3,0,1);buildings.push({x:b[0],z:b[1],w:b[2],d:b[3],h,flat:true});}
// flat corridor roof on round posts along the local front of a hall
function corridor(F,lx,lz,lw,depth,y,col){F.box(lx,y-.16,lz,lw,.16,depth,col===undefined?0xe9e4d8:col);const n=Math.max(2,Math.round(lw/3.6));
  for(let k=0;k<n;k++)F.put(GEO.cyl8,lx-lw/2+.2+(lw-.4)*k/(n-1),PADY,lz+depth/2-.15,0,.08,y-.16-PADY,.08,0xf4f0e7);}
function hoop(F,lx,lz,dir){F.post(lx,lz,3.05,.07,0x8c9396,PADY);F.box(lx,PADY+2.6,lz+dir*.5,1.2,.9,.06,0xf4f0e7);F.put(GEO.cyl8,lx,PADY+2.75,lz+dir*.85,0,.24,.03,.24,0xd8412f);}
function compoundWall(F,LW,LD,h,tint,gate,cn){const hw=LW/2-.6,hd=LD/2-.6;F.wall(0,-hd,LW-1.2,.4,h,tint,cn);F.wall(-hw,0,.4,LD-1.6,h,tint,cn);F.wall(hw,0,.4,LD-1.6,h,tint,cn);
  const sl=(LW-1.2-gate)/2;F.wall(-(gate/2+sl/2),hd,sl,.4,h,tint,cn);F.wall(gate/2+sl/2,hd,sl,.4,h,tint,cn);
  for(const s of [-1,1]){F.box(s*(gate/2+.3),0,hd,.6,h+.5,.6,shade(tint,.9));}}
// ---------- school: a walled block with classroom wings, a court and a flagpole. Local front (+z) is the gate.
function school(B,name,r,tint){const F=TF(B.cx,B.cz,r),LW=r%2?B.d:B.w,LD=r%2?B.w:B.d,hw=LW/2,hd=LD/2;tint=tint||0xf2e6c8;pad(B.cx,B.cz,B.w,B.d);
  compoundWall(F,LW,LD,2.2,tint,6.6,'dado');
  const cl=Math.min(LW-14,60);hall(F,0,-hd+6.2,cl,7,3.7,tint,{fc:['schoolWin','schoolWin','doorMetal'],sc:['stucco'],band:0x1d5a8a,noAC:true});corridor(F,0,-hd+10.9,cl,2.4,3.1);
  const sl=LD-24;hall(F,-hw+6,-hd+12+sl/2,7,sl,3.7,tint,{front:3,fc:['schoolWin','doorMetal'],sc:['stucco'],band:0x1d5a8a,noAC:true});
  if(LW>60)hall(F,hw-7,-hd+12+sl/2,8,sl,3.7,tint,{front:2,fc:['schoolWin','doorMetal'],sc:['stucco'],band:0x1d5a8a,noAC:true});
  const cx0=LW>60?6:4,cw=Math.min(26,LW-34);F.flat(M.court,cx0-cw/2,-hd+15,cx0+cw/2,hd-5,PADY+.006,6);
  hoop(F,cx0,-hd+15.6,1);hoop(F,cx0,hd-5.6,-1);flagpole(F,-hw+14,hd-6,9);
  for(let k=0;k<4;k++)F.tree(-hw+11+k*((LW-22)/3),hd-3.2,rr(.9,1.2),0);
  F.sign(name,gateX(LW),PADY+1.45,hd-.37,0,Math.min(9.6,(LW-8)/2),1.3,'#f4f0e7','#1d3f7a',true);
  label(B.cx,B.cz,name,0);return F;}
const gateX=LW=>3.3+Math.min(9.6,(LW-8)/2)/2+.9;
// ---------- kindergarten: low colourful rooms, a play yard and a low painted wall
function kinder(B,name,r){const F=TF(B.cx,B.cz,r),LW=r%2?B.d:B.w,LD=r%2?B.w:B.d,hw=LW/2,hd=LD/2,tint=0xf3d98a;
  compoundWall(F,LW,LD,1.5,0x7fc4bd,6.2,'dado');
  hall(F,0,-hd+6,LW-10,7,3.3,tint,{fc:['schoolWin','doorMetal','schoolWin'],sc:['stucco'],band:0xd8603a,noAC:true});corridor(F,0,-hd+10.6,LW-10,2.2,2.9,0xf4f0e7);
  // play yard: slide, swings, sandbox
  const px=-hw+9,pz=hd-9;F.box(px,PADY,pz,5,.25,5,0xcdb58c,0xe2cf9a);F.solid(px,pz,5,5,.37,0,5);
  F.box(px+7,PADY+1.5,pz,1.2,.1,1.2,0xd8412f);for(const a of [-.5,.5])for(const b2 of [-.5,.5])F.post(px+7+a,pz+b2,1.5,.05,0x2f6fb5,PADY);F.put(GEO.box,px+9,PADY+.72,pz,0,.9,.08,3.2,0xe2b93b,M.flat);
  for(const s of [-1,1]){F.post(px+14+s*1.8,pz-1,2.3,.06,0x2f7d4f,PADY);F.post(px+14+s*1.8,pz+1,2.3,.06,0x2f7d4f,PADY);}F.box(px+14,PADY+2.3,pz,4,.1,.1,0x2f7d4f);
  for(const s of [-.8,.8]){F.box(px+14+s,PADY+.55,pz,.5,.05,.25,0xd8412f);}
  F.tree(hw-6,hd-6,1.1,0);F.tree(hw-14,hd-5,.9,0);flagpole(F,3.5,hd-5,7);
  F.sign(name,-(3.1+Math.min(8,(LW-8)/2)/2+.8),PADY+1.0,hd-.37,0,Math.min(8,(LW-8)/2),.9,'#f4f0e7','#b03a73',true);label(B.cx,B.cz,name,0);return F;}
// ---------- gas station. Local front (+z) is the road it serves.
const pumps=[];
function gas(B,r,brand){const F=TF(B.cx,B.cz,r),LW=r%2?B.d:B.w,LD=r%2?B.w:B.d,hd=LD/2,cz=hd-13,stripe=brand||0x1f6b45;pad(B.cx,B.cz,B.w,B.d,M.asphalt,true);
  const p0=F.p(0,cz);
  anchor(p0[0],p0[1],()=>{for(const a of [-1,1])for(const b of [-1,1]){F.put(GEO.cyl12,a*7,PADY,cz+b*3.6,0,.26,4.9,.26,0xf4f0e7);F.put(GEO.cyl12,a*7,PADY,cz+b*3.6,0,.42,.5,.42,stripe);F.solid(a*7,cz+b*3.6,.6,.6,5);}
    F.box(0,5,cz,17.4,.75,11.2,0xf4f0e7,0xd9d2c4);F.box(0,5.18,cz,17.6,.22,11.4,stripe);F.box(0,4.94,cz,16.6,.06,10.4,0xe9e9e4);F.solid(0,cz,17.4,11.2,.75,5);
    for(const s of [-3.6,3.6]){F.box(s,PADY,cz,1.4,.18,5.2,0xd9d3c6);F.box(s,PADY+.18,cz-2.2,.3,.9,.3,0xe2b93b);F.box(s,PADY+.18,cz+2.2,.3,.9,.3,0xe2b93b);const p=F.p(s,cz);pumps.push([p[0],p[1],r%2===0]);}
    const b=F.b(0,cz,17.4,11.2);blob(b[0],b[1],b[2]/2+1,b[3]/2+1,PADY);});
  const sw=Math.min(LW-8,26);hall(F,0,-hd+6.5,sw,9,4,0xf2efe6,{fc:['shopOpen','glassFront','doorGlass'],sc:['stucco','stain'],band:stripe});
  F.sign('GASOLINERA',0,PADY+3.55,-hd+11.07,0,Math.min(9,sw-4),1.0,css(stripe),'#f4f0e7',true);
  F.car(3.6+2.2,cz+1,false);const pp=F.p(LW/2-3,hd-3);pylon('GASOLINERA',pp[0],pp[1],F.ry,css(stripe));
  F.barrel(sw/2-1.5,-hd+12.2);F.barrel(sw/2-2.8,-hd+12.4);F.barrel(-LW/2+4,-hd+13);
  label(B.cx,B.cz,'GASOLINERA',0);return F;}
// ---------- hotel: two-storey wing with an outside gallery, an office and a car park
function hotel(B,r,tint){const F=TF(B.cx,B.cz,r),LW=r%2?B.d:B.w,LD=r%2?B.w:B.d,hw=LW/2,hd=LD/2;tint=tint||0xe8d9b8;pad(B.cx,B.cz,B.w,B.d);
  const ml=LW-8;hall(F,0,-hd+7,ml,9,6.8,tint,{fc:['doorWood','winCurtain'],up:['upWin','upPlain','upWin'],sc:['stucco','winSmall'],roof:0xd9d2c4});
  F.box(0,3.3,-hd+12.3,ml,.16,1.6,0xd9d3c6);for(let k=0;k<=Math.round(ml/3.4);k++){const x=-ml/2+.2+(ml-.4)*k/Math.round(ml/3.4);F.put(GEO.cyl8,x,PADY,-hd+12.95,0,.08,6.5,.08,0xf4f0e7);}
  F.box(0,3.46+.9,-hd+13.05,ml,.06,.06,0x2b2621);F.box(0,3.46+.45,-hd+13.05,ml,.04,.04,0x2b2621);F.box(0,6.6,-hd+12.3,ml+.2,.14,1.9,0xd9d3c6);
  hall(F,-hw+7.5,hd-9,11,10,3.5,shade(tint,.94),{front:3,fc:['doorGlass','winWide'],sc:['stucco','winBars']});
  F.flat(M.asphaltO,-hw+15,-hd+15,hw-2,hd-2,PADY+.006,10);
  const n=Math.floor((LW-22)/3);for(let k=0;k<=n;k++)F.flat(M.lineW,-hw+16+k*3-.06,hd-8.4,-hw+16+k*3+.06,hd-3.2,PADY+.012,1);
  for(let k=0;k<n;k++)if(rnd()<.45)F.car(-hw+17.5+k*3,hd-5.8,false);
  const pp=F.p(hw-3,hd-3);pylon('HOTEL',pp[0],pp[1],F.ry);F.palm(hw-5,-hd+16);F.palm(-hw+17,-hd+16.5);label(B.cx,B.cz,'HOTEL',0);return F;}
// ---------- supermarket with its car park in front
function market(B,r){const F=TF(B.cx,B.cz,r),LW=r%2?B.d:B.w,LD=r%2?B.w:B.d,hw=LW/2,hd=LD/2;pad(B.cx,B.cz,B.w,B.d,M.asphalt,true);
  const bw=LW-6,bd=Math.min(26,LD-20),bz=-hd+2+bd/2;hall(F,0,bz,bw,bd,7,0xf2efe6,{fc:['glassFront','glassFront','doorGlass','glassFront'],sc:['stucco','stain'],band:0xb3261e,roof:0xd9d2c4});
  F.sign('SUPERMERCADO',0,5.6,bz+bd/2+.1,0,Math.min(16,bw-6),1.5,'#b3261e','#f4f0e7',true);
  F.box(0,3.6,bz+bd/2+1.3,bw-4,.14,2.6,0xe9e4d8);for(let k=0;k<6;k++)F.put(GEO.cyl8,-bw/2+2.4+(bw-4.8)*k/5,PADY,bz+bd/2+2.45,0,.09,3.5,.09,0xd9d9d2);
  const z0=bz+bd/2+5,rows=Math.floor((LW-8)/2.9);
  for(let k=0;k<=rows;k++)F.flat(M.lineW,-hw+4+k*2.9-.06,z0,-hw+4+k*2.9+.06,z0+5.2,PADY+.012,1);
  for(let k=0;k<rows;k++)if(rnd()<.5)F.car(-hw+5.45+k*2.9,z0+2.6,false);
  for(const k of [-12,0,12]){F.put(GEO.cyl8,k,PADY,hd-2,0,.2,.9,.2,0xe2b93b);F.solid(k,hd-2,.5,.5,1,0,5);}
  label(B.cx,B.cz,'SUPERMERCADO',0);return F;}
