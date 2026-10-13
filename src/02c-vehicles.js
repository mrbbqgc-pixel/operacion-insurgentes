// =====================================================================
// 02c VEHICLES: side profiles extruded across the width, so cars have real hoods, cabins and wheel arches
// Local frame of a vehicle geometry: length along z, width along x, wheels on y=0.
// =====================================================================
function profile(pts,width,bevel,arches){const s=new T.Shape();s.moveTo(pts[0][0],pts[0][1]);for(let k=1;k<pts.length;k++)s.lineTo(pts[k][0],pts[k][1]);
  // the underside runs front to back with a round cut-out over each wheel
  if(arches){const y=pts[pts.length-1][1];for(const a of arches){s.lineTo(a+.43,y);s.absarc(a,y,.43,0,PI,false);}s.lineTo(pts[0][0],y);}
  s.closePath();const g=new T.ExtrudeGeometry(s,{depth:width-2*bevel,bevelEnabled:bevel>0,bevelSize:bevel,bevelThickness:bevel,bevelSegments:1,curveSegments:3});
  g.translate(0,0,-(width-2*bevel)/2);g.rotateY(PI/2);return weld(g);}
const VEH={};
{ // sedan: 4.5 m
  VEH.sedan={len:4.5,wid:1.82,h:1.45,
    body:profile([[-2.2,.3],[-2.25,.62],[-2.18,.9],[-1.5,.97],[1.0,.97],[1.75,.86],[2.2,.72],[2.25,.34]],1.82,.07,[1.38,-1.36]),
    glass:profile([[-1.72,.95],[-1.2,1.4],[.2,1.42],[.95,.95]],1.5,.05),roof:[-.5,1.41,1.4,1.5],wheels:[1.38,-1.36],wr:.33};
  // pickup: 5.2 m, cab forward of an open bed
  VEH.pickup={len:5.2,wid:1.92,h:1.72,
    body:profile([[-2.55,.42],[-2.6,.8],[-2.56,1.08],[-.35,1.08],[1.25,1.08],[1.9,1.0],[2.52,.9],[2.6,.44]],1.92,.07,[1.62,-1.52]),
    glass:profile([[-.38,1.06],[-.2,1.66],[.85,1.68],[1.42,1.06]],1.62,.05),roof:[.32,1.67,1.2,1.62],bed:[-1.45,1.085,1.95,1.6],wheels:[1.62,-1.52],wr:.4};
  // van (combi): 4.9 m one-box
  VEH.van={len:4.9,wid:1.9,h:1.95,
    body:profile([[-2.4,.36],[-2.45,.9],[-2.42,1.12],[1.7,1.12],[2.3,1.0],[2.45,.7],[2.45,.4]],1.9,.07,[1.5,-1.45]),
    glass:profile([[-2.36,1.1],[-2.3,1.86],[1.25,1.9],[1.78,1.1]],1.72,.06),roof:[-.5,1.89,3.5,1.7],wheels:[1.5,-1.45],wr:.36};
  // bus: 11 m
  VEH.bus={len:11,wid:2.6,h:3.1,
    body:profile([[-5.4,.5],[-5.5,1.2],[-5.46,1.5],[5.2,1.5],[5.5,1.2],[5.5,.5]],2.6,.08,[3.6,-3.4]),
    glass:profile([[-5.4,1.48],[-5.38,2.5],[5.0,2.5],[5.36,1.48]],2.5,.06),roof:[-.2,2.5,10.5,2.56],roofH:.5,wheels:[3.6,-3.4],wr:.5};
  GEO.wheel=new T.CylinderGeometry(1,1,1,9);GEO.wheel.rotateZ(PI/2);GEO.hub=new T.CylinderGeometry(1,1,1,6,1,true);GEO.hub.rotateZ(PI/2);}
const carCols=[0xb3261e,0xf4f0e7,0x2d4a6e,0x8a8f93,0x2b2621,0x3f6b4a,0xc9c2b0,0x7a3b1e,0xf4f0e7,0xd9d2c4,0x6d7f8c,0x9a2a22];
const cars=[];
// draws a vehicle into the paint batch of its chunk and remembers the vertex range, so a wreck can be recoloured in place
function vehicle(type,x,z,alongX,col,dir){const V=VEH[type],ry=(alongX?PI/2:0)+(dir<0?PI:0),B=bat(M.paint,x,z),v0=B.p.length/3;
  anchor(x,z,()=>{const P=(lx,ly,lz,g,sx,sy,sz,c)=>{const ca=Math.cos(ry),sa=Math.sin(ry);put(M.paint,g,x+lx*ca+lz*sa,ly,z-lx*sa+lz*ca,ry,sx,sy,sz,c);};
    P(0,0,0,V.body,1,1,1,col);P(0,0,0,V.glass,1,1,1,C.glass);
    const rf=V.roof;P(0,rf[1],-rf[0],GEO.box,rf[3],V.roofH||.05,rf[2],type==='bus'?0xf4f0e7:col);
    if(V.bed){const b=V.bed;P(0,b[1],-b[0],GEO.box,b[3],.02,b[2],0x1a1816);}
    for(const wz of V.wheels)for(const s of [-1,1]){P(s*(V.wid/2-.13),V.wr,-wz,GEO.wheel,.25,V.wr,V.wr,C.tire);P(s*(V.wid/2-.01),V.wr,-wz,GEO.hub,.03,V.wr*.5,V.wr*.5,0x9a9c9a);}
    const fz=V.len/2-.02,ly=type==='bus'?1.0:type==='sedan'?.68:.84;
    for(const s of [-1,1]){P(s*(V.wid/2-.32),ly,-fz,GEO.box,.34,.14,.06,0xf2ecd2);P(s*(V.wid/2-.3),ly,fz-.02,GEO.box,.3,.14,.06,0xa02018);}
    P(0,type==='bus'?.62:.4,-fz-.04,GEO.box,V.wid-.1,.16,.12,0x3a3b3c);P(0,type==='bus'?.62:.4,fz+.02,GEO.box,V.wid-.1,.16,.12,0x3a3b3c);
    blob(x,z,alongX?V.len*.6:V.wid*.75,alongX?V.wid*.75:V.len*.6);});
  return{B,v0,v1:B.p.length/3,x,z,w:alongX?V.len:V.wid,d:alongX?V.wid:V.len,h:V.h,type};}
function car(x,z,alongX,col,type){type=type||(rnd()<.45?'sedan':rnd()<.74?'pickup':'van');const V=VEH[type],r=vehicle(type,x,z,alongX,col===undefined?pick(carCols):col,rnd()<.5?1:-1);
  const c=solid(x,z,r.w,r.d,type==='van'?1.9:type==='pickup'?1.5:1.42,0,2);c.hp=260;c.ref=r;cars.push(c);return c;}
function bus(x,z,alongX){const r=vehicle('bus',x,z,alongX,0xe9e5da,1);solid(x,z,r.w,r.d,3,0,0);}
// burn a car out in place: char the paint and let the body sag
function wreck(r){const m=r.B.mesh;if(!m)return;const P=m.geometry.attributes.position,Cc=m.geometry.attributes.color;
  for(let i=r.v0;i<r.v1;i++){const k=.07+Math.random()*.1;Cc.setXYZ(i,k*1.15,k,k*.9);const y=P.getY(i);if(y>.5)P.setY(i,.5+(y-.5)*.8);}
  P.needsUpdate=true;Cc.needsUpdate=true;}
