// =====================================================================
// 02i STREET DRESSING: the Glorieta and its statue, highway signs, street-name plates, checkpoints, parked cars
// =====================================================================
{ // ---------- the Glorieta
 anchor(0,0,()=>{put(M.flat,GEO.cyl12,0,0,0,0,7.4,.3,7.4,C.curb);put(M.flat,GEO.cyl12,0,.3,0,0,6.6,.07,6.6,0x6f9450);
   for(let a=0;a<40;a++){const an=a*TAU/40;put(M.flat,GEO.bag,Math.cos(an)*5.6,.37,Math.sin(an)*5.6,a,.2,.11,.2,a%2?0xc8362b:0xe2b93b);}
   for(let a=0;a<8;a++){const an=a*TAU/8+.3;put(M.flat,GEO.bag,Math.cos(an)*4.5,.37,Math.sin(an)*4.5,a,.5,.3,.5,0x4f8a3c);}
   put(M.flat,GEO.cyl8,0,.3,0,PI/8,2.6,.34,2.6,0xbdb4a2);put(M.flat,GEO.cyl8,0,.64,0,PI/8,2.1,.3,2.1,0xcfc6b4);put(M.flat,GEO.box,0,.94,0,0,2.1,2.5,2.1,0xd8d0c0);put(M.flat,GEO.box,0,3.44,0,0,2.4,.2,2.4,0xcfc6b4);
   // bronze figure with a raised arm (what the real statue depicts is not known to this map)
   const by=3.64,br=C.bronze,b2=shade(br,.86);
   put(M.flat,GEO.cyl8,-.17,by,0,0,.12,.92,.13,b2);put(M.flat,GEO.cyl8,.17,by,.04,0,.12,.92,.13,b2);put(M.flat,GEO.sphLo,-.17,by,-.06,0,.13,.08,.2,b2);put(M.flat,GEO.sphLo,.17,by,-.02,0,.13,.08,.2,b2);
   put(M.flat,GEO.taper,0,by+.86,0,0,.3,.78,.2,br);put(M.flat,GEO.sph,0,by+1.6,0,0,.3,.14,.2,br);put(M.flat,GEO.cyl8,0,by+1.66,0,0,.07,.14,.07,br);put(M.flat,GEO.sph,0,by+1.94,0,0,.15,.17,.16,br);
   put(M.flat,GEO.cyl8,-.33,by+1.58,0,0,.075,.72,.075,b2,0,2.95);put(M.flat,GEO.cyl8,.33,by+1.56,0,0,.075,.8,.075,b2,-.3,-.65);put(M.flat,GEO.sphLo,.83,by+2.3,-.26,0,.09,.09,.09,br);
   blob(0,0,3.6,3.6,.37);});
 solid(0,0,3.6,3.6,.9,0,5);solid(0,0,2.1,2.1,3.64);
 sign('CIUDAD INSURGENTES',0,2.1,1.07,0,1.8,.5,'#3a3128','#e2b93b',true);sign('CIUDAD INSURGENTES',0,2.1,-1.07,PI,1.8,.5,'#3a3128','#e2b93b',true);
 for(const p of [[-4.4,-4.4],[4.4,-4.4],[-4.4,4.4],[4.4,4.4]])palms.push(p);label(0,0,'GLORIETA',1);}
// ---------- highway signs
roadSign('↑ CENTRO · LA PURÍSIMA\n↑ PTO. A. LÓPEZ MATEOS\nLORETO →',6.5,60,0,8.6,3);
roadSign('↑ CD. CONSTITUCIÓN · LA PAZ\n← LORETO',-6.5,-52,PI,8.6,2.4);
roadSign('← CD. CONSTITUCIÓN · LA PAZ\nCENTRO · LA PURÍSIMA →',70,0,PI/2,12.8,2.4);
roadSign('↑ LA PURÍSIMA\n← PTO. A. LÓPEZ MATEOS',0,-985,0,12.8,2.4);
roadSign('↑ LORETO\nC.B.T.a. No. 27 →',1000,0,-PI/2,12.8,2.4);
post(-11.6,792,8.4,.25,0xf4f0e7);post(11.6,792,8.4,.25,0xf4f0e7);solid(-11.6,792,.5,.5,8.4);solid(11.6,792,.5,.5,8.4);
sign('BIENVENIDOS A CIUDAD INSURGENTES',0,7.1,792.3,0,23.2,2.6,'#f4f0e7','#1d3f7a');
// ---------- street-name plates, painted into spare atlas cells so they cost no draw calls
const plateUV={};
{const names=[];for(const k in NAME_X)names.push(NAME_X[k]);for(const k in NAME_Z)names.push(NAME_Z[k]);names.push('FCO. JAVIER MINA','16 DE SEPTIEMBRE','CARR. A LORETO');
 for(let c=0;c*4<names.length;c++){const ci=cell('street'+c,g=>{for(let j=0;j<4;j++){const nm=names[c*4+j];if(!nm)break;g.fillStyle='#1d3f7a';g.fillRect(0,j*64,256,64);g.strokeStyle='#f4f0e7';g.lineWidth=4;g.strokeRect(5,j*64+5,246,54);
       g.fillStyle='#f4f0e7';g.font='bold 30px "Arial Narrow",Arial,sans-serif';g.textAlign='center';g.textBaseline='middle';g.fillText(nm,128,j*64+33,232);}keep(g,0,0,256,256);});
   for(let j=0;j<4;j++){const nm=names[c*4+j];if(!nm)break;const u=cuv(ci),vh=(u[3]-u[1])/4;plateUV[nm]=[u[0],u[3]-(j+1)*vh+.0004,u[2],u[3]-j*vh-.0004];}}
 ATLAS.needsUpdate=true;}
function plateQ(name,x,y,z,alongX){const u=plateUV[name],a=.8,h=.4;if(!u)return;
  if(alongX){quadC(M.wall,[x-a,y,z+.02],[x+a,y,z+.02],[x+a,y+h,z+.02],[x-a,y+h,z+.02],0,0,1,0xffffff,u[0],u[1],u[2],u[3]);quadC(M.wall,[x+a,y,z-.02],[x-a,y,z-.02],[x-a,y+h,z-.02],[x+a,y+h,z-.02],0,0,-1,0xffffff,u[0],u[1],u[2],u[3]);}
  else{quadC(M.wall,[x+.02,y,z+a],[x+.02,y,z-a],[x+.02,y+h,z-a],[x+.02,y+h,z+a],1,0,0,0xffffff,u[0],u[1],u[2],u[3]);quadC(M.wall,[x-.02,y,z-a],[x-.02,y,z+a],[x-.02,y+h,z+a],[x-.02,y+h,z-a],-1,0,0,0xffffff,u[0],u[1],u[2],u[3]);}}
const SZALL=SZS.slice().reverse().concat(SZN);
const blockAt=(x,z)=>{for(const B of BLOCKS)if(B.kept&&Math.abs(x-B.cx)<B.w/2+7&&Math.abs(z-B.cz)<B.d/2+7)return B;return null;};
for(const x of AX)for(const z of SZALL){const nx=nameX(x,z),nz=nameZ(x,z);if(!nx&&!nz)continue;const px=x+hwX(x)+1,pz=z-7;if(!blockAt(px+3,pz-3))continue;
  anchor(px,pz,()=>{post(px,pz,3.5,.045,0x8c9396,PADY);if(nz)plateQ(nz,px,2.75,pz,true);if(nx)plateQ(nx,px,3.2,pz,false);});}

// ---------- checkpoints and cover along the route of the mission, then parked cars wherever there is room
[[6.5,345,6.4,1],[-6.5,335,6.4,1],[14,272,5,0],[14,238,5,0],[9,13,6,1],[-9,-13,6,1],[11.4,-9.5,5,0],[-11.4,9.5,5,0],[42,0,7.5,0],[6.5,-196,6.4,1],[-6.5,-244,6.4,1],
 [-13,-300,6,0],[6.5,-356,6.4,1],[21,-483.6,6,1],[70,-474,5,0],[176,-612,6,1],[238.6,-645.5,6,0],[196,-645.4,6,1],[226,-609,5,1]].forEach(s=>sandbags(s[0],s[1],s[2],!!s[3]));
[[6.5,378,1],[-6.5,388,1],[5,300,1],[-7,196,1],[7,112,1],[-6,60,1],[30,-3.4,0],[86,3.4,0],[-6.5,-96,1],[6,-150,1],[-6,-300,1],[6.2,-440,1],[-6.4,-510,1],
 [104,-483,0],[140,-477,0],[156.5,-530,1],[163.5,-570,1]].forEach(b=>barrier(b[0],b[1],!!b[2]));
[[9.6,9,1.2],[-9.6,-9,1.2],[9.8,10.3,.8],[8.6,222,1.1],[-8.8,-150,1.2],[4.6,470,.9],[-4.4,256,1.1],[4.2,305,1.2],[-8.9,430,1.2],[30,-475.3,1.2],[31.3,-475.3,1.2],[30.6,-476.6,1],
 [-9.4,-268,1.2],[9.2,-330,1.2],[181.4,-622,1.2],[235.6,-622.4,1.2],[225.6,-646.4,1.1]].forEach(c=>crate(c[0],c[1],c[2]));
park(-6.4,486,false,C.olive,'pickup');park(6.6,500,false,C.olive,'pickup');
[[5.4,404],[-6.8,352],[6.2,160],[-5.8,118],[6.4,-118],[-6,-164],[5.6,-236],[-6.6,-402],[6,-562],[-5.8,-640],[6,-760]].forEach(c=>park(c[0],c[1],false));
[[58,2.9],[118,-3.1],[206,2.7],[330,-2.9],[452,3],[610,-3]].forEach(c=>park(c[0],c[1],true));
for(const B of BLOCKS){if(!B.kept||kept[bkey(B)]!==1)continue;
  if(rnd()<.2)park(B.cx-B.w/2-2.4,B.cz+rr(-B.d/3,B.d/3),false);if(rnd()<.24)park(B.cx+rr(-B.w/3,B.w/3),B.cz+B.d/2+2.4,true);if(B.w>60&&rnd()<.1)park(B.cx+rr(-B.w/3,B.w/3),B.cz-B.d/2-2.4,true);
  if(Math.abs(B.cx+34)<1&&rnd()<.5)park(-8.6,B.cz+rr(-14,14),false);}
barrelSpots.push([9.4,333],[-9.6,-15.5],[44,4.8],[-9.4,-252],[9.4,-362],[26,-484.6],[186,-614],[238,-652],[9.6,240]);
// power lines: along the Loreto highway, the road north, and a few streets
for(let x=30;x<=1300;x+=45)poles.push([x,7.8,0]);for(let z=-1300;z<-970;z+=45)poles.push([7.6,z,1]);
for(const z of [-180,-360,-480,-720])for(let x=-340;x<=920;x+=48){if(Math.abs(x)<16)continue;let ok=true;for(const a of AX)if(Math.abs(x-a)<8)ok=false;if(ok&&blockAt(x,z-10))poles.push([x,z-7.2,0]);}
// spawn points: every street intersection
const SPN=[];for(const x of AX)for(const z of SZALL)if(blockAt(x+12,z-12)||blockAt(x-12,z+12))SPN.push([x,z]);
