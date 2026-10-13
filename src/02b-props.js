// =====================================================================
// 02b BLOCKS + STREET PROPS: kerbed block pads with sidewalks, rows of houses, walls, cover, signs
// =====================================================================
const SW=1.8; // sidewalk width
function pad(cx,cz,w,d,top,noWalk){const x0=cx-w/2,x1=cx+w/2,z0=cz-d/2,z1=cz+d/2,c=C.curb,y=PADY;
  quadC(M.flat,[x0,0,z1],[x1,0,z1],[x1,y,z1],[x0,y,z1],0,0,1,c);quadC(M.flat,[x1,0,z0],[x0,0,z0],[x0,y,z0],[x1,y,z0],0,0,-1,c);
  quadC(M.flat,[x1,0,z1],[x1,0,z0],[x1,y,z0],[x1,y,z1],1,0,0,c);quadC(M.flat,[x0,0,z0],[x0,0,z1],[x0,y,z1],[x0,y,z0],-1,0,0,c);
  if(noWalk){flat(top||M.pad,x0,z0,x1,z1,y,8);return;}
  flat(top||M.pad,x0+SW,z0+SW,x1-SW,z1-SW,y,8);flat(M.walk,x0,z0,x1,z0+SW,y,4);flat(M.walk,x0,z1-SW,x1,z1,y,4);flat(M.walk,x0,z0+SW,x0+SW,z1-SW,y,4);flat(M.walk,x1-SW,z0+SW,x1,z1-SW,y,4);}
// box whose faces each show one whole atlas cell
function texBox(x,y,z,w,h,d,cellName,tint){const c=cuv(CI[cellName]),x0=x-w/2,x1=x+w/2,y1=y+h,z0=z-d/2,z1=z+d/2,t=tint===undefined?0xffffff:tint;
  quadC(M.wall,[x0,y,z1],[x1,y,z1],[x1,y1,z1],[x0,y1,z1],0,0,1,t,c[0],c[1],c[2],c[3]);quadC(M.wall,[x1,y,z0],[x0,y,z0],[x0,y1,z0],[x1,y1,z0],0,0,-1,t,c[0],c[1],c[2],c[3]);
  quadC(M.wall,[x1,y,z1],[x1,y,z0],[x1,y1,z0],[x1,y1,z1],1,0,0,t,c[0],c[1],c[2],c[3]);quadC(M.wall,[x0,y,z0],[x0,y,z1],[x0,y1,z1],[x0,y1,z0],-1,0,0,t,c[0],c[1],c[2],c[3]);
  quadC(M.wall,[x0,y1,z1],[x1,y1,z1],[x1,y1,z0],[x0,y1,z0],0,1,0,t,c[0],c[1],c[2],c[3]);}
// free-standing wall with a cap (compounds, schools, the cemetery)
function wallSeg(x,z,w,d,h,tint,cellName,y0){tint=tint===undefined?0xf2efe6:tint;cellName=cellName||'stucco';y0=y0||0;const ax=w>=d,len=ax?w:d,n=segs(len);
  anchor(x,z,()=>{wallSide(x,z,w,d,y0,h,ax?0:2,rep(cellName,n),tint);wallSide(x,z,w,d,y0,h,ax?1:3,rep(cellName,n),tint);wallSide(x,z,w,d,y0,h,ax?2:0,[cellName],tint);wallSide(x,z,w,d,y0,h,ax?3:1,[cellName],tint);
    boxC(M.flat,x,y0+h,z,w+.1,.07,d+.1,shade(tint,.86));});
  solid(x,z,w,d,h+.07,y0);}
GEO.bag=new T.SphereGeometry(1,6,4);
function sandbags(x,z,len,alongX){const n=Math.max(2,Math.round(len/.74)),bl=len/n;
  anchor(x,z,()=>{for(let ly=0;ly<4;ly++)for(let k=0;k<n-(ly%2);k++){const u=-len/2+bl*(k+.5+(ly%2)*.5),col=shade(0xb9a47a,rr(.86,1.08));
      put(M.flat,GEO.bag,alongX?x+u:x+rr(-.04,.04),.16+ly*.27,alongX?z+rr(-.04,.04):z+u,alongX?0:PI/2,bl*.56,.17,.3,col);}blob(x,z,alongX?len/2+.5:.9,alongX?.9:len/2+.5);});
  solid(x,z,alongX?len:.8,alongX?.8:len,1.1,0,5);lowCover.push([x,z]);}
{const s=new T.Shape();s.moveTo(-.3,0);s.lineTo(.3,0);s.lineTo(.3,.08);s.lineTo(.2,.26);s.lineTo(.1,.5);s.lineTo(.08,1.05);s.lineTo(-.08,1.05);s.lineTo(-.1,.5);s.lineTo(-.2,.26);s.lineTo(-.3,.08);s.closePath();
  GEO.jersey=new T.ExtrudeGeometry(s,{depth:3.2,bevelEnabled:false});GEO.jersey.translate(0,0,-1.6);}
function barrier(x,z,alongX){put(M.flat,GEO.jersey,x,0,z,alongX?PI/2:0,1,1,1,shade(0xb4afa5,rr(.9,1.05)));anchor(x,z,()=>blob(x,z,alongX?2:.7,alongX?.7:2));
  solid(x,z,alongX?3.2:.6,alongX?.6:3.2,1.05,0,5);lowCover.push([x,z]);}
function crate(x,z,s,tint){anchor(x,z,()=>{texBox(x,0,z,s,s,s,'planks',tint);blob(x,z,s*.8,s*.8);});solid(x,z,s,s,s,0,5);if(s>.9)lowCover.push([x,z]);}

// ---------- signs (each is its own small textured mesh)
function sign(text,x,y,z,ry,w,h,bg,fg,flush){const m=new T.MeshBasicMaterial({polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-2,map:tex(512,Math.max(32,Math.round(512*h/w)),(g,W,H)=>{
    g.fillStyle=bg;g.fillRect(0,0,W,H);g.strokeStyle=fg;g.lineWidth=6;g.strokeRect(7,7,W-14,H-14);g.fillStyle=fg;g.textAlign='center';g.textBaseline='middle';
    const ls=text.split('\n'),fs=Math.min((H-24)/ls.length/1.1,84);g.font='bold '+fs+'px Arial,sans-serif';
    ls.forEach((s,k)=>g.fillText(s,W/2,H/2+(k-(ls.length-1)/2)*fs*1.1,W-44));})});
  const p=new T.Mesh(new T.PlaneGeometry(w,h),m);p.position.set(x,y,z);p.rotation.y=ry;addProp(p);
  if(!flush){const b=new T.Mesh(p.geometry,M.dark);b.position.copy(p.position);b.rotation.y=ry+PI;addProp(b);}}
const post=(x,z,h,r,col,y0)=>put(M.flat,GEO.tube6,x,y0||0,z,0,r,h,r,col===undefined?C.steel:col);
// overhead highway sign on two posts; ry=0 faces +z (read by traffic heading -z)
function roadSign(text,x,z,ry,w,h){const ax=Math.cos(ry)*(w/2-.3),az=-Math.sin(ry)*(w/2-.3);
  post(x-ax,z-az,5.2+h,.14);post(x+ax,z+az,5.2+h,.14);solid(x-ax,z-az,.3,.3,5.2+h);solid(x+ax,z+az,.3,.3,5.2+h);
  sign(text,x+Math.sin(ry)*.2,5.2+h/2,z+Math.cos(ry)*.2,ry,w,h,'#1f6b45','#f4f0e7');}
function pylon(text,x,z,ry,bg){post(x,z,7.4,.17,0xd9d9d2);solid(x,z,.35,.35,7.4);
  sign(text,x+Math.sin(ry)*.2,8.2,z+Math.cos(ry)*.2,ry,4.6,1.5,bg||'#b3261e','#f4f0e7');sign(text,x-Math.sin(ry)*.2,8.2,z-Math.cos(ry)*.2,ry+PI,4.6,1.5,bg||'#b3261e','#f4f0e7');}
function label(x,z,t,k){labels.push({x,z,t,k:k||0});}

// ---------- rows of houses around the edge of a block
// B = {cx,cz,w,d}; skip: sides left free ('N','S','W','E'); com: chance of a shop on each side [N,S,W,E]; edge: rougher outskirts
let shopK=0;
function lot(bx,bz,w,d,front,com,edge){const shop=rnd()<com,two=rnd()<(shop?.16:.09),r=rnd();
  const kind=shop?'shop':(edge&&r<.26)?'block':(r<.1?'block':(edge&&r>.9?'shack':'house'));
  building(bx,bz,w,d,two?6.6:kind==='shack'?rr(2.5,2.9):rr(3.3,4),{front,kind,two,sign:shop?(shopK++)%shopSigns.length:-1});}
// ew: the block fronts a north-south street (the boulevard), so the west and east rows run the full depth
function blockHouses(B,empty,skip,com,edge,ew){skip=skip||'';com=com||[0,0,0,0];const hw=B.w/2-SW,hd=B.d/2-SW,deep=B.d>60?13:11.5;
  const xa=ew?-hw+deep+2.2:-hw,xb=-xa,za=ew?-hd:-hd+deep+2.2,zb=-za;
  for(const s of [-1,1]){if(skip.indexOf(s<0?'N':'S')>=0)continue;let x=xa;
    while(x<xb-6){let w=Math.min(rr(8,14),xb-x);if(xb-x-w<6)w=xb-x;if(w<6)break;const d=rr(8,deep),set=rnd()<.3?rr(.4,1.6):0;
      if(rnd()>empty)lot(B.cx+x+w/2,B.cz+s*(hd-set-d/2),w,d,s<0?0:1,com[s<0?0:1],edge);
      x+=w+(rnd()<.3?rr(1.6,4):0);}}
  for(const s of [-1,1]){if(skip.indexOf(s<0?'W':'E')>=0)continue;let z=za;
    while(z<zb-5){let d=Math.min(rr(7,ew?13:12),zb-z);if(zb-z-d<5)d=zb-z;if(d<5)break;const w=rr(8,11),set=ew&&rnd()<.25?rr(.4,1.4):0;
      if(rnd()>empty)lot(B.cx+s*(hw-set-w/2),B.cz+z+d/2,w,d,s<0?2:3,com[s<0?2:3],edge);
      z+=d+(rnd()<.3?rr(1.2,3):0);}}
  // back yards: sheds and shade trees
  const iw=hw-deep-4,id=hd-deep-3;
  if(iw>6&&id>2){const n=Math.floor(rr(.4,3.2));for(let k=0;k<n;k++){const tx=B.cx+rr(-iw,iw),tz=B.cz+rr(-id,id);if(rnd()<.3)building(tx,tz,rr(3,4.4),rr(3,4.4),rr(2.3,2.7),{kind:'shack',front:Math.floor(rnd()*4),noTank:true});
      else trees.push([tx,tz,rr(.8,1.3),rnd()<.25?1:0]);}}}
