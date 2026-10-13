// =====================================================================
// 02d LANDMARKS (1): local frames, the plaza, churches
// A landmark is written once in local coordinates with its front towards local +z, then turned in quarter turns:
// r=0 front faces south (+z), r=1 east (+x), r=2 north (-z), r=3 west (-x).
// =====================================================================
function TF(cx,cz,r){const c=[1,0,-1,0][r],s=[0,1,0,-1][r],F={cx,cz,r,ry:r*PI/2};
  F.p=(lx,lz)=>[cx+lx*c+lz*s,cz-lx*s+lz*c];
  F.b=(lx,lz,lw,ld)=>{const p=F.p(lx,lz);return r%2?[p[0],p[1],ld,lw]:[p[0],p[1],lw,ld];};
  const smap=[[0,1,2,3],[2,3,1,0],[1,0,3,2],[3,2,0,1]][r];F.s=k=>smap[k];
  F.build=(lx,lz,lw,ld,h,o)=>{const b=F.b(lx,lz,lw,ld);o=o||{};o.front=F.s(o.front===undefined?1:o.front);return building(b[0],b[1],b[2],b[3],h,o);};
  F.wall=(lx,lz,lw,ld,h,tint,cn,y0)=>{const b=F.b(lx,lz,lw,ld);wallSeg(b[0],b[1],b[2],b[3],h,tint,cn,y0);};
  F.box=(lx,y,lz,lw,h,ld,col,top)=>{const b=F.b(lx,lz,lw,ld);boxC(M.flat,b[0],y,b[1],b[2],h,b[3],col,top);};
  F.side=(lx,lz,lw,ld,y0,h,side,cells,tint)=>{const b=F.b(lx,lz,lw,ld);wallSide(b[0],b[1],b[2],b[3],y0,h,F.s(side),cells,tint);};
  F.put=(g,lx,y,lz,ry,sx,sy,sz,col,mat)=>{const p=F.p(lx,lz);put(mat||M.flat,g,p[0],y,p[1],(ry||0)+F.ry,sx,sy,sz,col);};
  F.post=(lx,lz,h,rad,col,y0)=>{const p=F.p(lx,lz);post(p[0],p[1],h,rad,col,y0);};
  F.solid=(lx,lz,lw,ld,h,y0,kind)=>{const b=F.b(lx,lz,lw,ld);return solid(b[0],b[1],b[2],b[3],h,y0,kind);};
  F.sign=(t,lx,y,lz,lry,w,h,bg,fg,flush)=>{const p=F.p(lx,lz);sign(t,p[0],y,p[1],(lry||0)+F.ry,w,h,bg,fg,flush);};
  F.flat=(mat,lx0,lz0,lx1,lz1,y,rp)=>{const a=F.p(lx0,lz0),b=F.p(lx1,lz1);flat(mat,Math.min(a[0],b[0]),Math.min(a[1],b[1]),Math.max(a[0],b[0]),Math.max(a[1],b[1]),y,rp);};
  F.car=(lx,lz,alongLX,col,type)=>{const p=F.p(lx,lz);return park(p[0],p[1],r%2?!alongLX:!!alongLX,col,type);};
  F.tree=(lx,lz,sc,ty)=>{const p=F.p(lx,lz);trees.push([p[0],p[1],sc||1,ty||0]);};F.palm=(lx,lz)=>{const p=F.p(lx,lz);palms.push([p[0],p[1]]);};
  F.lamp=(lx,lz,ty)=>{const p=F.p(lx,lz);lamps.push([p[0],p[1],ty||0,F.ry]);};
  F.cover=(lx,lz)=>{const p=F.p(lx,lz);lowCover.push(p);};F.barrel=(lx,lz)=>{const p=F.p(lx,lz);barrelSpots.push(p);};
  F.shade=(lx,lz,lw,ld,y)=>{const b=F.b(lx,lz,lw,ld);shadeRect(b[0],b[1],b[2],b[3],y);};
  return F;}
function roomFor(x,z,w,d){for(let k=0;k<colliders.length;k++){const c=colliders[k];if(c.y0<1.6&&x-w/2<c.x1+.4&&x+w/2>c.x0-.4&&z-d/2<c.z1+.4&&z+d/2>c.z0-.4)return false;}return true;}
function park(x,z,alongX,col,type){type=type||(rnd()<.45?'sedan':rnd()<.74?'pickup':'van');const V=VEH[type];if(roomFor(x,z,alongX?V.len:V.wid,alongX?V.wid:V.len))return car(x,z,alongX,col,type);return null;}
function bench(F,lx,lz,alongLX){const w=alongLX?2.2:.55,d=alongLX?.55:2.2;F.box(lx,PADY+.38,lz,w,.08,d,0x7a5a3a);F.box(lx+(alongLX?0:-.24),PADY+.46,lz+(alongLX?-.24:0),alongLX?w:.07,.42,alongLX?.07:d,0x7a5a3a);
  for(const e of [-1,1])F.box(lx+(alongLX?e*.9:0),PADY,lz+(alongLX?0:e*.9),alongLX?.08:.5,.38,alongLX?.5:.08,0x4a4a48);F.solid(lx,lz,w,d,.9,0,5);}
function planter(F,lx,lz,w,d,tree){F.box(lx,PADY,lz,w,.62,d,C.stone,0x6f8a4a);F.solid(lx,lz,w,d,.74,0,5);F.cover(lx,lz);F.shade(lx,lz,w,d,PADY);if(tree)F.tree(lx,lz,1.15,0);}
const flagTex=tex(96,54,(g,w,h)=>{g.fillStyle='#1f6b45';g.fillRect(0,0,32,h);g.fillStyle='#f4f0e7';g.fillRect(32,0,32,h);g.fillStyle='#b3261e';g.fillRect(64,0,32,h);g.fillStyle='#8a6a3a';g.beginPath();g.arc(48,27,7,0,7);g.fill();});
function flagpole(F,lx,lz,h){F.post(lx,lz,h,.07,0xd9d9d2,PADY);F.put(GEO.sph,lx,h+PADY,lz,0,.14,.14,.14,0xe2b93b);const p=F.p(lx,lz);
  const f=new T.Mesh(new T.PlaneGeometry(3,1.7),new T.MeshBasicMaterial({side:T.DoubleSide,map:flagTex}));f.position.set(p[0]+1.55,h-.9,p[1]);addProp(f);}
// ---------- Plaza Principal: a whole paved block with the kiosk in the middle
function plaza(B){const F=TF(B.cx,B.cz,0),hw=B.w/2,hd=B.d/2;pad(B.cx,B.cz,B.w,B.d,M.plaza,true);
  anchor(B.cx,B.cz,()=>{
    // kiosk: round stone base with steps, eight columns, tiled octagonal roof
    F.put(GEO.cyl12,0,PADY,0,0,5,.3,5,0xbdb4a2);F.put(GEO.cyl12,0,PADY+.3,0,0,4.5,.6,4.5,0xe9e4d8);
    for(let a=0;a<8;a++){const an=a*PI/4+PI/8,x=Math.cos(an)*4,z=Math.sin(an)*4;F.put(GEO.cyl8,x,PADY+.9,z,0,.12,2.9,.12,0xf4f0e7);F.put(GEO.cyl8,x,PADY+.9,z,0,.19,.22,.19,0xd9d3c6);
      const bn=an+PI/8,rx=Math.cos(bn)*3.98,rz=Math.sin(bn)*3.98;F.put(GEO.box,rx,PADY+1.72,rz,-bn,.08,.08,3.0,0x2b2621);F.put(GEO.box,rx,PADY+1.3,rz,-bn,.05,.05,3.0,0x2b2621);}
    F.put(GEO.cyl8,0,PADY+3.8,0,PI/8,5.1,.14,5.1,0xe9e4d8);F.put(GEO.cone8,0,PADY+3.94,0,PI/8,5.3,1.9,5.3,C.tile);F.put(GEO.cyl8,0,PADY+5.8,0,0,.5,.5,.5,0xe9e4d8);F.put(GEO.sph,0,PADY+6.55,0,0,.34,.34,.34,0xe2b93b);
    blob(B.cx,B.cz,6.4,6.4,PADY);
    // paths of a different paving run from the corners and the sides to the kiosk
    for(const s of [-1,1]){flat(M.walkO,B.cx-hw+2,B.cz+s*(hd-5)-1.2,B.cx+hw-2,B.cz+s*(hd-5)+1.2,PADY+.004,4);}
    for(const p of [[-22,-12],[22,-12],[-22,12],[22,12]])planter(F,p[0],p[1],6,5,true);
    for(const p of [[-33,0],[33,0]])planter(F,p[0],p[1],5,9,true);
    for(const b of [[-12,-19,1],[12,-19,1],[-12,19,1],[12,19,1],[-22,-5.5,1],[22,-5.5,1],[-22,5.5,1],[22,5.5,1],[-9,0,0],[9,0,0]])bench(F,b[0],b[1],!!b[2]);
    for(const p of [[-38,-20],[38,-20],[-38,20],[38,20],[-12,-12],[12,-12],[-12,12],[12,12],[0,-21],[0,21]])F.lamp(p[0],p[1],1);
    for(const p of [[-39,-10],[-39,10],[39,-10],[39,10],[-28,-21],[28,-21],[-28,21],[28,21],[-6,-21.5],[6,21.5]])F.palm(p[0],p[1]);
    flagpole(F,-14,-6,11);
    // founders' clock (monument to the forjadores)
    const mx=15,mz=-6;F.put(GEO.cyl8,mx,PADY,mz,PI/8,1.7,.5,1.7,C.stone);F.put(GEO.box,mx,PADY+.5,mz,0,1.15,5.4,1.15,0xf4f0e7);F.put(GEO.box,mx,PADY+5.9,mz,0,1.45,.16,1.45,0xd9d3c6);F.put(GEO.cone4,mx,PADY+6.06,mz,PI/4,1.05,1.2,1.05,C.tile);
    F.solid(mx,mz,3.2,3.2,.6,0,5);F.solid(mx,mz,1.15,1.15,7);});
  const cm=new T.MeshBasicMaterial({map:tex(64,64,(g,w,h)=>{g.fillStyle='#f4f0e7';g.fillRect(0,0,w,h);g.strokeStyle='#15110c';g.lineWidth=4;g.beginPath();g.arc(32,32,27,0,7);g.stroke();
    g.lineWidth=3;g.beginPath();g.moveTo(32,32);g.lineTo(32,13);g.moveTo(32,32);g.lineTo(45,38);g.stroke();for(let a=0;a<12;a++){g.fillStyle='#15110c';g.fillRect(31+Math.sin(a*PI/6)*23,31-Math.cos(a*PI/6)*23,2,2);}})});
  for(let a=0;a<4;a++){const c=new T.Mesh(new T.PlaneGeometry(.92,.92),cm);c.position.set(B.cx+15+Math.sin(a*PI/2)*.59,PADY+5.1,B.cz-6+Math.cos(a*PI/2)*.59);c.rotation.y=a*PI/2;addProp(c);}
  sign('A LOS FORJADORES DE\nCIUDAD INSURGENTES',B.cx+15,PADY+1.2,B.cz-6+.59,0,1.05,.5,'#3a3128','#e2b93b',true);
  F.solid(0,0,9,9,1,0,5);label(B.cx,B.cz,'PLAZA PRINCIPAL',1);}
// ---------- churches. Local front (+z) is the entrance.
const belfries=[];
GEO.cross=(()=>{const a=new T.BoxGeometry(.16,1.5,.16),b=new T.BoxGeometry(.9,.16,.16);a.translate(0,.75,0);b.translate(0,1.05,0);return[a,b];})();
function crossOn(F,lx,y,lz,sc,col){for(const g of GEO.cross)F.put(g,lx,y,lz,0,sc,sc,sc,col===undefined?0x2b2621:col);}
function church(cx,cz,r,name,big){const F=TF(cx,cz,r),tint=0xf4efe4;
  anchor(cx,cz,()=>{
    if(big){const Wn=14,Ln=30,Hn=9,fz=14; // nave from lz=fz-Ln to fz, facade at fz
      const nz=fz-Ln/2;for(const s of [2,3]){F.side(0,nz,Wn,Ln,PADY,4-PADY,s,rep('dado',8),tint);F.side(0,nz,Wn,Ln,4,4,s,['stucco','archWin','stucco','archWin','stucco','archWin','stucco','stucco'],tint);F.side(0,nz,Wn,Ln,8,Hn-8,s,rep('stucco',8),tint);}
      F.side(0,nz,Wn,Ln,PADY,Hn-PADY,0,rep('stucco',3),tint);
      const b=F.b(0,nz,Wn,Ln);roofGable(b[0],b[1],b[2],b[3],Hn,2.4,C.tile,tint);F.solid(0,nz,Wn,Ln,Hn+1,0,1);buildings.push({x:b[0],z:b[1],w:b[2],d:b[3],h:Hn,flat:false});F.shade(0,nz,Wn,Ln,PADY);
      // facade with the arched door, a window above and a curved gable
      const fzc=fz+.4;F.side(0,fzc,4,.8,PADY,4-PADY,1,['archDoor'],tint);F.side(0,fzc,4,.8,4,4,1,['archWin'],tint);F.side(0,fzc,4,.8,8,2.6,1,['stucco'],tint);
      for(const s of [-1,1]){F.side(s*2.75,fzc,1.5,.8,PADY,4-PADY,1,['dado'],tint);F.side(s*2.75,fzc,1.5,.8,4,4,1,['stucco'],tint);F.side(s*2.75,fzc,1.5,.8,8,2.6,1,['stucco'],tint);}
      F.box(0,10.6,fzc,7.3,.22,1,0xd9d3c6);F.box(0,10.82,fzc,4.6,.9,.8,tint);F.box(0,11.72,fzc,2.6,.8,.8,tint);crossOn(F,0,12.52,fzc,1.2);
      F.solid(0,fzc,7,.8,11,0,1);
      for(const s of [-1,1]){const tx=s*5.6,tz=fz-.9,Ht=12.5;for(let q=0;q<4;q++){F.side(tx,tz,4.2,4.2,PADY,4-PADY,q,['dado'],tint);F.side(tx,tz,4.2,4.2,4,4,q,[q===1?'archWin':'stucco'],tint);F.side(tx,tz,4.2,4.2,8,4.5,q,['stucco'],tint);}
        F.box(tx,Ht,tz,4.5,.25,4.5,0xd9d3c6);for(const px of [-1.75,1.75])for(const pz of [-1.75,1.75])F.put(GEO.cyl8,tx+px,Ht+.25,tz+pz,0,.26,2.5,.26,tint);
        F.box(tx,Ht+2.75,tz,4.5,.3,4.5,0xd9d3c6);F.put(GEO.dome,tx,Ht+3.05,tz,0,2.1,1.9,2.1,C.tile);crossOn(F,tx,Ht+4.9,tz,.9);F.put(GEO.cyl8,tx,Ht+1.3,tz,0,.5,.9,.5,0x6a5a3a);
        F.solid(tx,tz,4.2,4.2,Ht,0,1);F.shade(tx,tz,4.2,4.2,PADY);const p=F.p(tx,tz);belfries.push({x:p[0],y:Ht+.25,z:p[1]});}
      for(let k=0;k<3;k++){const dp=1.8-k*.5;F.box(0,PADY+k*.16,fz+.8+dp/2,6-k*.6,.16,dp,0xcfc6b4);}}
    else{const Wn=9,Ln=16,Hn=5.6,nz=-1;F.side(0,nz,Wn,Ln,PADY,4-PADY,2,rep('dado',4),tint);F.side(0,nz,Wn,Ln,PADY,4-PADY,3,rep('dado',4),tint);F.side(0,nz,Wn,Ln,PADY,4-PADY,0,rep('dado',2),tint);F.side(0,nz,Wn,Ln,PADY,4-PADY,1,['dado','archDoor','dado'],tint);
      for(let q=0;q<4;q++)F.side(0,nz,Wn,Ln,4,Hn-4,q,rep('stucco',q<2?2:4),tint);
      const b=F.b(0,nz,Wn,Ln);roofGable(b[0],b[1],b[2],b[3],Hn,1.7,pick([C.tile,0xb9bfc0,0x9c6f55]),tint);F.solid(0,nz,Wn,Ln,Hn+.8,0,1);buildings.push({x:b[0],z:b[1],w:b[2],d:b[3],h:Hn,flat:false});F.shade(0,nz,Wn,Ln,PADY);
      F.box(0,Hn,nz+Ln/2-.4,1.5,1.9,.8,tint);crossOn(F,0,Hn+1.9,nz+Ln/2-.4,1);}});
  if(name)F.sign(name,big?0:-3,big?PADY+5.2:PADY+3.1,big?15.25:7.06,0,big?5.4:2.6,big?1.5:.62,'#f4f0e7','#3a3128',true);
  label(cx,cz,(name||'TEMPLO').replace('\n',' '),big?1:0);return F;}
