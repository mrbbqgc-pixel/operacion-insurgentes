// =====================================================================
// 02a BUILDINGS: textured wall runs, roofs, porches, awnings, generic houses and shops
// Frame: the boulevard runs along z (real bearing 334.8 deg is -z), the Loreto highway along +x.
// Sides: 0 = north face (-z), 1 = south face (+z), 2 = west face (-x), 3 = east face (+x)
// =====================================================================
const ROT_DEG=334.8,PADY=.12;
const palms=[],trees=[],lamps=[],poles=[],tinacos=[],buildings=[],labels=[],barrelSpots=[],lowCover=[];
function triC(mat,a,b,c,nx,ny,nz,col){const B=bat(mat,a[0],a[2]),k=B.p.length/3,r=(col>>16&255)/255,g=(col>>8&255)/255,bl=(col&255)/255;
  B.p.push(a[0],a[1],a[2],b[0],b[1],b[2],c[0],c[1],c[2]);B.n.push(nx,ny,nz,nx,ny,nz,nx,ny,nz);B.c.push(r,g,bl,r,g,bl,r,g,bl);if(B.uv)B.u.push(WU,WV,WU,WV,WU,WV);B.i.push(k,k+1,k+2);}
// one face of a box, split into equal segments that each show an atlas cell (cells listed left to right as seen from outside)
function wallSide(x,z,w,d,y0,h,side,cells,tint){const n=cells.length,x0=x-w/2,x1=x+w/2,z0=z-d/2,z1=z+d/2,y1=y0+h,vk=Math.min(h,4)/4;
  for(let k=0;k<n;k++){const c=cuv(CI[cells[k]]),f0=k/n,f1=(k+1)/n,v1=c[1]+(c[3]-c[1])*vk;let a,b,nx=0,nz=0;
    if(side===1){a=[lerp(x0,x1,f0),z1];b=[lerp(x0,x1,f1),z1];nz=1;}else if(side===0){a=[lerp(x1,x0,f0),z0];b=[lerp(x1,x0,f1),z0];nz=-1;}
    else if(side===3){a=[x1,lerp(z1,z0,f0)];b=[x1,lerp(z1,z0,f1)];nx=1;}else{a=[x0,lerp(z0,z1,f0)];b=[x0,lerp(z0,z1,f1)];nx=-1;}
    quadC(M.wall,[a[0],y0,a[1]],[b[0],y0,b[1]],[b[0],y1,b[1]],[a[0],y1,a[1]],nx,0,nz,side>1?shade(tint,.93):tint,c[0],c[1],c[2],v1);}}
const segs=L0=>Math.max(1,Math.round(L0/3.5));
function rep(name,n){const a=[];for(let k=0;k<n;k++)a.push(name);return a;}
// soft dark strips on the ground around a footprint
function shadeRect(x,z,w,d,y,r){y=(y||0)+.012;r=r||1.2;const x0=x-w/2,x1=x+w/2,z0=z-d/2,z1=z+d/2,u0=.53,u1=.97;
  quadC(M.shade,[x0,y,z1],[x1,y,z1],[x1,y,z1+r],[x0,y,z1+r],0,1,0,0,u0,.02,u1,.98);quadC(M.shade,[x1,y,z0],[x0,y,z0],[x0,y,z0-r],[x1,y,z0-r],0,1,0,0,u0,.02,u1,.98);
  quadC(M.shade,[x1,y,z1],[x1,y,z0],[x1+r,y,z0],[x1+r,y,z1],0,1,0,0,u0,.02,u1,.98);quadC(M.shade,[x0,y,z0],[x0,y,z1],[x0-r,y,z1],[x0-r,y,z0],0,1,0,0,u0,.02,u1,.98);}
function blob(x,z,rx,rz,y){y=(y||0)+.014;quadC(M.shade,[x-rx,y,z+rz],[x+rx,y,z+rz],[x+rx,y,z-rz],[x-rx,y,z-rz],0,1,0,0,.02,.02,.48,.98);}
// flat roof with a projecting cornice
function roofFlat(x,z,w,d,h,col,corn){boxC(M.flat,x,h-.2,z,w+.24,.2,d+.24,corn,col);}
// corrugated gable roof; ridge along the long axis
function roofGable(x,z,w,d,h,rise,tint,wallTint){const ov=.45,c=cuv(CI.corr),x0=x-w/2-ov,x1=x+w/2+ov,z0=z-d/2-ov,z1=z+d/2+ov,e=h-.06,t=h+rise;
  if(w>=d){const n=Math.hypot(rise,d/2+ov),ny=(d/2+ov)/n,nz=rise/n,ur=Math.max(1,Math.round(w/4));
    for(let k=0;k<ur;k++){const xa=lerp(x0,x1,k/ur),xb=lerp(x0,x1,(k+1)/ur);
      quadC(M.wall,[xa,e,z1],[xb,e,z1],[xb,t,z],[xa,t,z],0,ny,nz,tint,c[0],c[1],c[2],c[3]);quadC(M.wall,[xb,e,z0],[xa,e,z0],[xa,t,z],[xb,t,z],0,ny,-nz,shade(tint,.9),c[0],c[1],c[2],c[3]);}
    triC(M.flat,[x+w/2,h,z+d/2],[x+w/2,h,z-d/2],[x+w/2,t-.04,z],1,0,0,shade(wallTint,.9));triC(M.flat,[x-w/2,h,z-d/2],[x-w/2,h,z+d/2],[x-w/2,t-.04,z],-1,0,0,shade(wallTint,.9));}
  else{const n=Math.hypot(rise,w/2+ov),ny=(w/2+ov)/n,nx=rise/n,ur=Math.max(1,Math.round(d/4));
    for(let k=0;k<ur;k++){const za=lerp(z0,z1,k/ur),zb=lerp(z0,z1,(k+1)/ur);
      quadC(M.wall,[x1,e,zb],[x1,e,za],[x,t,za],[x,t,zb],nx,ny,0,tint,c[0],c[1],c[2],c[3]);quadC(M.wall,[x0,e,za],[x0,e,zb],[x,t,zb],[x,t,za],-nx,ny,0,shade(tint,.9),c[0],c[1],c[2],c[3]);}
    triC(M.flat,[x-w/2,h,z+d/2],[x+w/2,h,z+d/2],[x,t-.04,z+d/2],0,0,1,wallTint);triC(M.flat,[x+w/2,h,z-d/2],[x-w/2,h,z-d/2],[x,t-.04,z-d/2],0,0,-1,wallTint);}}
const SD=[[0,-1],[0,1],[-1,0],[1,0]]; // outward direction of each side
// roof slab on round posts in front of a wall (porch or shop arcade)
function porch(x,z,w,d,side,depth,len,y,col,lam){const s=SD[side],ax=side<2,cx=x+s[0]*(w/2+depth/2),cz=z+s[1]*(d/2+depth/2),pw=ax?len:depth,pd=ax?depth:len;
  if(lam){const c=cuv(CI.corr),o=depth/2+.15,hl=len/2,yb=y-.35;const P=(u,v,yy)=>ax?[cx+u,yy,cz+s[1]*v]:[cx+s[0]*v,yy,cz+u];
    const a=P(-hl,-o+.15,y),b=P(hl,-o+.15,y),c2=P(hl,o,yb),d2=P(-hl,o,yb);
    if(side===1||side===2){quadC(M.wall,d2,c2,b,a,0,1,0,col,c[0],c[1],c[2],c[3]);quadC(M.wall,a,b,c2,d2,0,-1,0,shade(col,.6),c[0],c[1],c[2],c[3]);}
    else{quadC(M.wall,a,b,c2,d2,0,1,0,col,c[0],c[1],c[2],c[3]);quadC(M.wall,d2,c2,b,a,0,-1,0,shade(col,.6),c[0],c[1],c[2],c[3]);}}
  else boxC(M.flat,cx,y-.16,cz,pw+.1,.16,pd+.1,col);
  const n=Math.max(2,Math.round(len/3.2)),py=lam?y-.35:y-.16;
  for(let k=0;k<n;k++){const u=-len/2+.15+(len-.3)*k/(n-1),px=ax?cx+u:cx+s[0]*(depth/2-.12),pz=ax?cz+s[1]*(depth/2-.12):cz+u;put(M.flat,GEO.rod,px,PADY,pz,0,.075,py-PADY,.075,0xe9e4d8);}}
const awnCols=[0xb3261e,0x2f7d4f,0x1d3f7a,0xe2b93b,0xf4f0e7,0xd98a4e];
function awning(x,z,w,d,side,len){const s=SD[side],ax=side<2,col=pick(awnCols),o=1.25,hl=len/2,y1=2.95,y0=2.5;
  const P=(u,v,yy)=>ax?[x+u,yy,z+s[1]*(d/2+v)]:[x+s[0]*(w/2+v),yy,z+u];const a=P(-hl,0,y1),b=P(hl,0,y1),c=P(hl,o,y0),e=P(-hl,o,y0),f=P(hl,o,y0-.22),g2=P(-hl,o,y0-.22);
  const flip=side===0||side===3;
  if(flip){quadC(M.flat,a,b,c,e,0,.94,0,col);quadC(M.flat,e,c,b,a,0,-1,0,shade(col,.6));quadC(M.flat,g2,f,c,e,s[0],0,s[1],shade(col,.85));}
  else{quadC(M.flat,e,c,b,a,0,.94,0,col);quadC(M.flat,a,b,c,e,0,-1,0,shade(col,.6));quadC(M.flat,e,c,f,g2,s[0],0,s[1],shade(col,.85));}}
// sign board from the atlas on a projecting fascia above a shop front
function fascia(x,z,w,d,side,len,y,k){const s=SD[side],ax=side<2,t=.14,cx=x+s[0]*(w/2+t/2),cz=z+s[1]*(d/2+t/2),uv=signUV(k);
  boxC(M.flat,cx,y,cz,ax?len:t,1,ax?t:len,0xd9d3c6,undefined,side);const o=t/2,hl=len/2; // the board itself is the front face of the box
  const a=ax?[cx+(side===1?-hl:hl),y,cz+s[1]*o]:[cx+s[0]*o,y,cz+(side===3?hl:-hl)],b=ax?[cx+(side===1?hl:-hl),y,cz+s[1]*o]:[cx+s[0]*o,y,cz+(side===3?-hl:hl)];
  quadC(M.wall,a,b,[b[0],y+1,b[2]],[a[0],y+1,a[2]],s[0],0,s[1],0xffffff,uv[0],uv[1],uv[2],uv[3]);}
// ---------- a generic building. o: front (side), kind: 'house' | 'shop' | 'block' | 'shack', two, tint, sign
function building(x,z,w,d,h,o){o=o||{};const front=o.front===undefined?1:o.front,kind=o.kind||'house',tint=o.tint===undefined?pick(wallCols):o.tint,two=!!o.two,hg=two?3.3:h;
  const A=rnd()<.5,blank=kind==='block'?'block':A?'dado':(rnd()<.3?'stain':'stucco'),doorC=kind==='block'?'doorMetal':A?(rnd()<.3?'doorDouble':'doorWood'):'doorMetal',
    wins=kind==='block'?['winBars','winSmall']:A?['winBars','winWide','winBars']:['winCurtain','winAC','winCurtain','winSmall'];
  const roofC=pick(C.roofs),gable=!two&&kind!=='shop'&&(o.gable===undefined?rnd()<(kind==='shack'?.9:.3):o.gable);
  anchor(x,z,()=>{for(let s=0;s<4;s++){const len=s<2?w:d,n=segs(len);let cells;
      if(s===front){if(kind==='shop'){cells=[];for(let k=0;k<n;k++)cells.push(rnd()<.72?'shopOpen':'shopShut');if(n>2&&rnd()<.5)cells[Math.floor(rnd()*n)]=blank;}
        else{cells=[];for(let k=0;k<n;k++)cells.push(rnd()<.78?pick(wins):blank);cells[Math.floor(rnd()*n)]=doorC;if(kind==='house'&&n>3&&rnd()<.25)cells[0]='gate';}}
      else{cells=[];for(let k=0;k<n;k++)cells.push(rnd()<(kind==='shop'?.12:.3)?pick(wins):(rnd()<.2&&kind!=='block'?'stain':blank));if(kind==='shop'&&s!==(front^1)&&rnd()<.3)cells[Math.floor(rnd()*n)]='adWall';}
      wallSide(x,z,w,d,PADY,hg-PADY,s,cells,tint);
      if(two){const up=[];for(let k=0;k<n;k++)up.push(rnd()<(s===front?.75:.3)?'upWin':'upPlain');wallSide(x,z,w,d,hg,h-hg,s,up,tint);}}
    if(gable)roofGable(x,z,w,d,h,rr(.8,1.3),pick([0xb9bfc0,0xa9b0b1,0x9c6f55,0xb24a3a,0x7f9a8a,0xc9c4b6]),tint);
    else{roofFlat(x,z,w,d,h,roofC,kind==='block'?0xa9a59c:shade(tint,rnd()<.5?1.08:.8));
      if(kind==='block'&&rnd()<.7)for(const p of [[-1,-1],[1,-1],[-1,1],[1,1]])put(M.flat,GEO.rod,x+p[0]*(w/2-.2),h,z+p[1]*(d/2-.2),0,.03,rr(.5,1.1),.03,0x5a4a3c);
      if(!o.noTank&&rnd()<.3)tinacos.push([x+rr(-w/4,w/4),h,z+rr(-d/4,d/4)]);
      if(rnd()<.12)boxC(M.flat,x+rr(-w/4,w/4),h,z+rr(-d/4,d/4),.9,.55,.7,0xc9ccc8,0xb3b6b2);}
    const flen=(front<2?w:d);
    if(kind==='shop'){if(o.sign!==undefined&&o.sign>=0)fascia(x,z,w,d,front,Math.min(4,flen-.6),two?hg-.2:h-1.12,o.sign);
      if(rnd()<.55)awning(x,z,w,d,front,flen*rr(.6,.9));else if(rnd()<.5)porch(x,z,w,d,front,2,flen-.4,2.9,0xd9d3c6,rnd()<.5);}
    else if(kind!=='shack'&&!two&&rnd()<.34)porch(x,z,w,d,front,rr(1.6,2.2),flen*rr(.5,.95),Math.min(h-.3,2.9),rnd()<.5?shade(tint,1.05):0xd9d3c6,rnd()<.45);
    else if(two&&rnd()<.6){const s=SD[front],ax=front<2;boxC(M.flat,x+s[0]*(w/2+.5),hg-.14,z+s[1]*(d/2+.5),ax?w*.7:1,.14,ax?1:d*.7,0xd9d3c6);}
    shadeRect(x,z,w,d,PADY);});
  solid(x,z,w,d,h+(two?0:.4),0,1);buildings.push({x,z,w,d,h,flat:!gable});return tint;}
