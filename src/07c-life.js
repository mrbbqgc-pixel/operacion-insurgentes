// =====================================================================
// 07c LIFE: civilians, street dogs, a little traffic, birds and ambient sound. Single-player only (!MP.on):
// nothing here exists in a multiplayer game, lifeReset() clears it and lifeUpdate() runs it from simStep.
// =====================================================================
const civs=[],dogs=[],traffic=[],LIFE={on:false,alarm:99,nx:0,nz:0,hurtN:0,killN:0,stage:-2,failT:0,spawnT:0,ambT:6,screamT:0,shots:0,hum:null,civN:isTouch?7:11,dogN:isTouch?2:3,music:null};
const lifeNoise=(x,z,rad)=>{if(!LIFE.on||rad<30)return;LIFE.alarm=0;LIFE.nx=x;LIFE.nz=z;};   // hook called from noiseEvent (gunfire, explosions)
// ---------- the street graph the civilians walk: every intersection, joined to its neighbours along the grid
const LG=[],LGk=new Map();
for(const p of SPN){LGk.set(p[0]+','+p[1],LG.length);LG.push({x:p[0],z:p[1],nb:[]});}
for(const n of LG){const i=AX.indexOf(n.x),j=SZALL.indexOf(n.z);for(const q of [[i-1,j],[i+1,j],[i,j-1],[i,j+1]]){if(q[0]<0||q[1]<0||q[0]>=AX.length||q[1]>=SZALL.length)continue;
  const k=LGk.get(AX[q[0]]+','+SZALL[q[1]]);if(k!==undefined)n.nb.push(k);}}
const PLZ={x:208,z:-630,w:84,d:48},PLZ_IN=[LGk.get('160,-600'),LGk.get('256,-600'),LGk.get('160,-660'),LGk.get('256,-660')].filter(k=>k!==undefined);
const inPlaza=(x,z)=>Math.abs(x-PLZ.x)<PLZ.w/2&&Math.abs(z-PLZ.z)<PLZ.d/2;
function plazaSpot(){for(let k=0;k<20;k++){const x=PLZ.x+R2(-PLZ.w/2+4,PLZ.w/2-4),z=PLZ.z+R2(-PLZ.d/2+4,PLZ.d/2-4);if(freeSpot(x,z))return[x,z];}return[PLZ.x+20,PLZ.z+18];}
// a corner of the sidewalk at a node: sx/sz pick the side of the street
const corner=(n,sx,sz)=>[n.x+sx*(hwX(n.x)+.9),n.z+sz*6.9];
function onStreet(x,z){for(const a of AX)if(Math.abs(x-a)<hwX(a)+.3)return true;for(const s of SZALL)if(Math.abs(z-s)<6.3)return true;return Math.abs(z)<5.8&&x>10;}
const padY=(x,z)=>(inPlaza(x,z)||(!onStreet(x,z)&&blockAt(x,z)))?PADY:0;
// out of the player's sight: behind the camera or hidden by the town
function unseen(x,z){const dx=x-P.x,dz=z-P.z,d=Math.hypot(dx,dz)||1;if((dx*-Math.sin(P.yaw)+dz*-Math.cos(P.yaw))/d<.1)return true;return!los(P.x,P.y+1.6,P.z,x,1.2,z);}
// benches (from their colliders) and which way a sitter faces
const benches=[];for(const c of colliders){if(c.kind!==5||c.y1!==.9)continue;const w=c.x1-c.x0,d=c.z1-c.z0,ax=Math.abs(w-2.2)<.01&&Math.abs(d-.55)<.01;if(!ax&&!(Math.abs(d-2.2)<.01&&Math.abs(w-.55)<.01))continue;
  const x=(c.x0+c.x1)/2,z=(c.z0+c.z1)/2;if(inCemetery(x,z))continue;let fx=ax?0:1,fz=ax?1:0;if(!freeSpot(x+fx*1.5,z+fz*1.5)){fx=-fx;fz=-fz;}benches.push({x,z,ax,fx,fz,used:0});}

// ---------- civilian looks: shirts, jeans or skirts, caps or straw hats, a bag now and then
const CIVL=[],civRig={};
{const shirts=[0xf4f0e7,0x8fb7d6,0xc8362b,0xe3c35c,0x4f8a3c,0x2d4a6e,0xe59a7a,0xf2efe6,0x7a3b5e,0x3a3a3e,0xd98a4e,0xb9d6a1],pants=[0x3a4e6e,0x2f3f58,0x9c8b6a,0x2a2a2e,0x5a5a60],skirts=[0xc8362b,0x1d3f7a,0xe2b93b,0x2f7d4f,0x8a4a7a],skins=[0xc49a72,0xa97a55,0x8d5f3f,0xd9b08c,0x6e4630];
 for(let k=0;k<10;k++)CIVL.push({shirt:shirts[k%shirts.length],pants:pants[(k*3)%pants.length],skirt:k%3===1?skirts[k%skirts.length]:0,hat:k%4===0?'straw':k%4===2?'cap':'',bag:k%3===2,skin:skins[(k*7)%skins.length],hair:k%5===4?0x6b4a2a:0x1d1c20,short:k%2===0});}
function civParts(L0){const o={},skin=L0.skin,shoe=0x2a2622,sleeve=L0.short?skin:L0.shirt;let b=new GB();
  b.add(GEO.torso,0,0,0,0,0,0,.22,.52,.14,L0.shirt);b.add(GEO.blob,-.22,.46,0,0,0,0,.09,.08,.1,L0.shirt);b.add(GEO.blob,.22,.46,0,0,0,0,.09,.08,.1,L0.shirt);
  b.add(GEO.cyl8,0,.5,0,0,0,0,.055,.1,.06,skin);b.add(GEO.ball,0,.69,0,0,0,0,.1,.12,.11,skin);
  if(L0.skirt)b.add(GEO.ball,0,.66,.02,0,0,0,.11,.15,.12,L0.hair);else b.add(GEO.cap,0,.7,0,0,0,0,.105,.1,.115,L0.hair);
  if(L0.hat==='straw'){b.add(GEO.cap,0,.74,0,0,0,0,.11,.09,.12,0xd9c38a);b.add(GEO.cyl12,0,.76,0,0,0,0,.24,.02,.24,0xd2bc84);}
  else if(L0.hat==='cap'){b.add(GEO.cap,0,.72,0,0,0,0,.11,.09,.12,L0.pants===0x3a4e6e?0xc8362b:0x2d4a6e);b.add(GEO.box,0,.74,-.13,0,0,0,.12,.02,.1,L0.pants===0x3a4e6e?0xc8362b:0x2d4a6e);}
  o.up=b.build();
  b=new GB();if(L0.skirt){b.add(GEO.torso,0,-.1,0,0,0,0,.2,.16,.14,L0.skirt);b.add(GEO.taper,0,-.55,0,0,0,0,.26,.5,.2,L0.skirt);}
  else{b.add(GEO.torso,0,-.1,0,0,0,0,.2,.2,.14,L0.pants);b.add(GEO.torso,0,.02,0,0,0,0,.21,.05,.15,0x3a2a1a);}o.hips=b.build();
  b=new GB();b.add(GEO.limb,0,0,0,0,0,0,.06,.34,.06,sleeve);b.add(GEO.blob,0,-.34,0,0,0,0,.05,.05,.05,sleeve);o.arm=b.build();
  b=new GB();b.add(GEO.limb,0,0,0,0,0,0,.048,.27,.048,skin);b.add(GEO.blob,0,-.3,0,0,0,0,.045,.06,.045,skin);o.fore=b.build();
  b=new GB();b.add(GEO.limb,0,0,0,0,0,0,.048,.27,.048,skin);b.add(GEO.blob,0,-.3,0,0,0,0,.045,.06,.045,skin);b.add(GEO.box,.02,-.6,0,0,0,0,.22,.28,.1,0xf4f0e7);b.add(GEO.rod,.02,-.33,0,0,0,.3,.01,.3,.01,0xf4f0e7);o.foreBag=b.build();
  const leg=L0.skirt?skin:L0.pants;b=new GB();b.add(GEO.limb,0,.03,0,0,0,0,.085,.46,.09,leg);b.add(GEO.blob,0,-.44,0,0,0,0,.07,.07,.07,leg);o.thigh=b.build();
  b=new GB();b.add(GEO.limb,0,0,0,0,0,0,.065,.4,.07,leg);b.add(GEO.blob,0,-.44,-.05,0,0,0,.055,.045,.12,shoe);o.shin=b.build();return o;}
// the soldier rig (same bones, so animSoldier, raySoldiers and updCorpse work) without a weapon
function civGeo(k){if(civRig[k])return civRig[k];const G0=civParts(CIVL[k]),W=[];for(let q=0;q<11;q++){const p=JOINT[q].slice(),pr=PARENT[q];if(pr>=0){p[0]+=W[pr][0];p[1]+=W[pr][1];p[2]+=W[pr][2];}W.push(p);}
  const list=[[G0.hips,0,[0,.98,0]],[G0.up,1],[G0.arm,2],[G0.fore,3],[G0.arm,4],[CIVL[k].bag?G0.foreBag:G0.fore,5],[G0.thigh,7],[G0.shin,8],[G0.thigh,9],[G0.shin,10]];
  const p=[],n=[],c=[],u=[],si=[],sw=[],ix=[];
  for(const it of list){const g=it[0],b=it[1],o=it[2]||W[b],Pp=g.attributes.position,N=g.attributes.normal,Cc=g.attributes.color,U=g.attributes.uv,k0=p.length/3;
    for(let i=0;i<Pp.count;i++){p.push(Pp.getX(i)+o[0],Pp.getY(i)+o[1],Pp.getZ(i)+o[2]);n.push(N.getX(i),N.getY(i),N.getZ(i));c.push(Cc.getX(i),Cc.getY(i),Cc.getZ(i));u.push(U.getX(i),U.getY(i));si.push(b,0,0,0);sw.push(1,0,0,0);}
    for(let i=0;i<g.index.count;i++)ix.push(k0+g.index.getX(i));}
  const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(p,3));g.setAttribute('normal',new T.Float32BufferAttribute(n,3));g.setAttribute('color',new T.Float32BufferAttribute(c,3));
  g.setAttribute('uv',new T.Float32BufferAttribute(u,2));g.setAttribute('skinIndex',new T.Uint16BufferAttribute(si,4));g.setAttribute('skinWeight',new T.Float32BufferAttribute(sw,4));g.setIndex(ix);
  g.boundingSphere=new T.Sphere(new T.Vector3(0,1,0),2);return civRig[k]=g;}
function addCiv(x,z,look){const g=new T.Group();g.rotation.order='YXZ';const B=[];
  for(let k=0;k<11;k++){const b=new T.Bone();b.position.set(JOINT[k][0],JOINT[k][1],JOINT[k][2]);B.push(b);if(PARENT[k]>=0)B[PARENT[k]].add(b);}
  g.add(B[0]);g.updateMatrixWorld(true);const mesh=new T.SkinnedMesh(civGeo(look),skinMat);mesh.castShadow=true;g.add(mesh);mesh.bind(new T.Skeleton(B));
  const c={civ:true,team:2,x,z,y0:0,yaw:R()*TAU,hp:60,alive:true,sc:CIVL[look].skirt?.94:1,crouch:0,ph:R()*6,moveAmt:0,run:false,lowered:true,aimP:0,flinch:0,spd:0,mx:0,mz:0,state:'walk',t:R2(2,9),
    node:-1,tx:x,tz:z,sx:R()<.5?-1:1,sz:R()<.5?-1:1,dx:0,dz:0,look,deadT:0,fall:1,stuckT:0,lastX:x,lastZ:z,hurt:false,mate:null,bench:null,padT:0,g,mesh,body:B[0],up:B[1],aL:B[2],fL:B[3],aR:B[4],fR:B[5],wp:B[6],lL:B[7],kL:B[8],lR:B[9],kR:B[10]};
  g.scale.setScalar(c.sc);g.position.set(x,0,z);g.rotation.y=c.yaw;scene.add(g);civs.push(c);return c;}
function removeCiv(c){scene.remove(c.g);if(c.mate){c.mate.mate=null;c.mate=null;}if(c.bench){c.bench.used--;c.bench=null;}}
// ---------- civilian sounds
function sndScream(x,z,hi){if(!AU.ctx||!AU.on||LIFE.screamT>0)return;LIFE.screamT=.35;try{const s=spatial(x,z,14),o=aOut(.4*s.vol,s.pan),c=AU.ctx,t=c.currentTime,os=c.createOscillator(),f=c.createBiquadFilter(),g=c.createGain(),f0=hi?820:560;
  os.type='sawtooth';os.frequency.setValueAtTime(f0*.8,t);os.frequency.linearRampToValueAtTime(f0*1.15,t+.08);for(let k=1;k<7;k++)os.frequency.linearRampToValueAtTime(f0*(1+(k%2?.06:-.04))*(1-k*.03),t+.08+k*.055);
  f.type='lowpass';f.frequency.value=Math.min(2200,s.lp);g.gain.setValueAtTime(.001,t);g.gain.exponentialRampToValueAtTime(1,t+.03);g.gain.setValueAtTime(1,t+.3);g.gain.exponentialRampToValueAtTime(.001,t+.48);
  os.connect(f);f.connect(g);g.connect(o);os.start(t);os.stop(t+.5);}catch(e){}}
function sndBark(x,z,n,far){if(!AU.ctx||!AU.on)return;try{const s=spatial(x,z,far?40:10);if(s.d>160)return;const o=aOut((far?.12:.3)*s.vol,s.pan);
  for(let k=0;k<n;k++){const d=k*R2(.22,.34);osc(o,'sawtooth',far?260:340,far?150:200,.1,.5,d);osc(o,'square',far?130:170,far?90:120,.09,.25,d);}}catch(e){}}
function sndHorn(x,z){if(!AU.ctx||!AU.on)return;try{const s=spatial(x,z,20),o=aOut(.25*s.vol,s.pan);osc(o,'square',392,392,.45,.3);osc(o,'square',494,494,.45,.22);}catch(e){}}

// ---------- civilian behaviour: strolling the sidewalks and the plaza, pausing at shop fronts, chatting, sitting; running from gunfire
function nearNode(x,z){let b=-1,bd=1e9;for(let k=0;k<LG.length;k++){const n=LG[k],d=(n.x-x)*(n.x-x)+(n.z-z)*(n.z-z);if(d<bd){bd=d;b=k;}}return b;}
function civGoto(c,k){c.node=k;const n=LG[k];if(R()<.15)c.sx=-c.sx;if(R()<.15)c.sz=-c.sz;const p=corner(n,c.sx,c.sz);c.tx=p[0];c.tz=p[1];c.plaza=false;}
function civNext(c){if(c.plaza){if(R()<.25||!inPlaza(c.x,c.z)){civGoto(c,RP(PLZ_IN));return;}const p=plazaSpot();c.tx=p[0];c.tz=p[1];return;}
  const n=LG[c.node];if(PLZ_IN.indexOf(c.node)>=0&&R()<.45){c.plaza=true;const p=plazaSpot();c.tx=p[0];c.tz=p[1];return;}
  if(!n.nb.length){civGoto(c,nearNode(c.x,c.z));return;}
  // keep going the way we were, mostly
  let best=null,bs=-1e9;for(const k of n.nb){const m=LG[k],dx=m.x-n.x,dz=m.z-n.z,l=Math.hypot(dx,dz)||1,sc=(dx*c.dx+dz*c.dz)/l+R()*1.4-Math.hypot(m.x-P.x,m.z-P.z)*.004;if(sc>bs){bs=sc;best=k;}}
  c.dx=LG[best].x-n.x;c.dz=LG[best].z-n.z;civGoto(c,best);}
// run away from the noise, preferring the side streets
function civFlee(c){const n=LG[nearNode(c.x,c.z)];let best=null,bs=-1e9;const ax=c.x-LIFE.nx,az=c.z-LIFE.nz,al=Math.hypot(ax,az)||1;
  for(const k of n.nb){const m=LG[k],dx=m.x-n.x,dz=m.z-n.z,l=Math.hypot(dx,dz)||1,away=(dx*ax+dz*az)/(l*al),d=Math.hypot(m.x-LIFE.nx,m.z-LIFE.nz),sc=away*2+(1-Math.abs(away))*1.2+d*.01+R()*.5;if(sc>bs){bs=sc;best=k;}}
  if(best===null){c.tx=c.x+ax/al*30;c.tz=c.z+az/al*30;}else{c.node=best;c.tx=LG[best].x+R2(-3,3);c.tz=LG[best].z+R2(-3,3);}c.plaza=false;c.state='flee';c.t=R2(4,7);c.run=true;}
function civAlarm(c){if(c.state==='flee'||c.state==='hide')return;if(c.bench){c.bench.used--;c.bench=null;}if(c.mate){c.mate.mate=null;c.mate=null;}
  const d=Math.hypot(c.x-LIFE.nx,c.z-LIFE.nz);if(d<60&&R()<.6)sndScream(c.x,c.z,!!CIVL[c.look].skirt);c.react=R2(.1,.7);c.state='startle';}
function stepCiv(c,dt){let mx=c.mx,mz=c.mz;const sp=c.spd;
  for(let k=0;k<civs.length;k++){const o=civs[k];if(o===c||!o.alive)continue;const ax=c.x-o.x,az=c.z-o.z,a2=ax*ax+az*az;if(a2<.8&&a2>1e-4){const a=Math.sqrt(a2);mx+=ax/a*.6;mz+=az/a*.6;}}
  let px=0,pz=0;{const ax=c.x-P.x,az=c.z-P.z,a2=ax*ax+az*az;if(a2<4.4&&a2>1e-4&&c.state!=='sit'){const a=Math.sqrt(a2);px=ax/a*2.6;pz=az/a*2.6;}} // step aside for the player
  for(const lst of [allies,foes])for(let k=0;k<lst.length;k++){const o=lst[k];if(!o.alive)continue;const ax=c.x-o.x,az=c.z-o.z,a2=ax*ax+az*az;if(a2<1.4&&a2>1e-4){const a=Math.sqrt(a2);px+=ax/a*1.6;pz+=az/a*1.6;}}
  for(let k=0;k<traffic.length;k++)carPush(traffic[k],c,.5);
  const ox=c.x,oz=c.z;if(sp>0&&(mx||mz)){c.x+=mx*sp*dt;c.z+=mz*sp*dt;}if(px||pz){c.x+=px*dt;c.z+=pz*dt;}
  if(c.x!==ox||c.z!==oz){pushOut(c,.36,0);c.x=clamp(c.x,BOUND.x0,BOUND.x1);c.z=clamp(c.z,BOUND.z0,BOUND.z1);}
  const moved=Math.hypot(c.x-ox,c.z-oz);c.moveAmt=lerp(c.moveAmt,clamp(moved/Math.max(dt,1e-4)/3,0,1),Math.min(1,dt*10));if(moved>0)c.ph+=moved*(c.run?2.1:2.7);
  if(sp>0){c.stuckT+=dt;if(c.stuckT>1.2){if(Math.hypot(c.x-c.lastX,c.z-c.lastZ)<.4){c.stuckN=(c.stuckN||0)+1;const a=R()*TAU;c.x+=Math.cos(a)*.5;c.z+=Math.sin(a)*.5;if(c.stuckN>2){c.stuckN=0;c.state==='flee'?civFlee(c):civNext(c);}}else c.stuckN=0;c.stuckT=0;c.lastX=c.x;c.lastZ=c.z;}}else c.stuckT=0;
  c.padT-=dt;if(c.padT<=0){c.padT=.2;c.padY=padY(c.x,c.z);}c.y0+=(c.padY-c.y0)*Math.min(1,dt*8);c.g.position.set(c.x,c.y0,c.z);}
function animCiv(c,dt){animSoldier(c,dt);const m=c.moveAmt,sw=Math.sin(c.ph)*(c.run?.9:.5)*m,bag=CIVL[c.look].bag;
  c.aL.rotation.set(-sw,0,.12);c.aR.rotation.set(bag?.05:sw,0,-.12);c.fL.rotation.x=.25+Math.max(0,-sw)*.5+(c.run?.6:0);c.fR.rotation.x=bag?0:.25+Math.max(0,sw)*.5+(c.run?.6:0);c.wp.rotation.x=0;
  if(c.state==='chat'){c.up.rotation.x=Math.sin(G.time*2.3+c.ph)*.04;c.aR.rotation.x=.5+Math.sin(G.time*3+c.ph)*.3;c.fR.rotation.x=1.2;}
  else if(c.state==='sit'){c.body.position.y=-.33;c.lL.rotation.x=c.lR.rotation.x=1.45;c.kL.rotation.x=c.kR.rotation.x=-1.4;c.aL.rotation.set(.6,0,.15);c.aR.rotation.set(.6,0,-.15);c.fL.rotation.x=c.fR.rotation.x=.9;c.up.rotation.x=.12;}
  else if(c.state==='hide'){c.up.rotation.x=.3;c.aL.rotation.set(2.6,0,.4);c.aR.rotation.set(2.6,0,-.4);c.fL.rotation.x=c.fR.rotation.x=1.6;}}
function updCiv(c,dt){if(c.flinch>0)c.flinch-=dt;c.mx=0;c.mz=0;c.spd=0;const alarm=LIFE.alarm<14,dn=Math.hypot(c.x-LIFE.nx,c.z-LIFE.nz);
  if(alarm&&dn<110&&c.state!=='flee'&&c.state!=='hide'&&c.state!=='startle')civAlarm(c);
  if(c.state==='startle'){c.react-=dt;face(c,LIFE.nx,LIFE.nz,dt,8);if(c.react<=0)civFlee(c);}
  else if(c.state==='flee'){const d=Math.hypot(c.tx-c.x,c.tz-c.z);c.run=true;c.wantCrouch=false;
    if(d<2){if(dn>75||!alarm){c.state='hide';c.t=R2(6,12);c.run=false;}else civFlee(c);}else{c.mx=(c.tx-c.x)/d;c.mz=(c.tz-c.z)/d;c.spd=5.2;face(c,c.tx,c.tz,dt,9);}}
  else if(c.state==='hide'){c.crouch=Math.min(1,c.crouch+dt*3);face(c,LIFE.nx,LIFE.nz,dt,3);c.t-=dt;if(alarm&&dn<45)civFlee(c);else if(!alarm&&c.t<=0){c.crouch=0;c.state='walk';c.run=false;civGoto(c,nearNode(c.x,c.z));}}
  else if(c.state==='walk'){c.run=false;const d=Math.hypot(c.tx-c.x,c.tz-c.z);
    if(d<1.2){const inP=c.plaza;civNext(c);const r=R()*(inP?.6:1);
        if(r<.22){let na=1e9;for(const a of AX)na=Math.min(na,Math.abs(c.x-a));const av=na<13;c.state='pause';c.pt=R2(3,7);c.lookX=c.x+(av?c.sx*4:0);c.lookZ=c.z+(av?0:c.sz*4);}
        else if(r<.38&&!c.mate){let o=null;for(const q of civs)if(q!==c&&q.alive&&q.state==='walk'&&!q.mate&&Math.hypot(q.x-c.x,q.z-c.z)<7){o=q;break;}
          if(o){c.mate=o;o.mate=c;c.state=o.state='chat';c.pt=o.pt=R2(6,14);o.spd=0;}}
        else if(r<.55){let b=null,bd=1e9;for(const q of benches){if(q.used>1)continue;const dd=Math.hypot(q.x-c.x,q.z-c.z);if(dd<bd&&dd<30){bd=dd;b=q;}}
          if(b){c.bench=b;b.used++;c.state='tobench';c.tx=b.x+b.fx*.75+(b.ax?(b.used>1?-.55:.55):0);c.tz=b.z+b.fz*.75+(b.ax?0:(b.used>1?-.55:.55));c.pt=R2(12,30);}}}
    else{c.mx=(c.tx-c.x)/d;c.mz=(c.tz-c.z)/d;c.spd=1.35+(c.look%3)*.15;face(c,c.tx,c.tz,dt,5);}}
  else if(c.state==='pause'){c.pt-=dt;face(c,c.lookX,c.lookZ,dt,3);if(c.pt<=0)c.state='walk';}
  else if(c.state==='chat'){const o=c.mate;if(!o||!o.alive||o.state!=='chat'){c.state='walk';c.mate=null;}else{c.pt-=dt;face(c,o.x,o.z,dt,4);if(c.pt<=0){c.state=o.state='walk';c.mate=o.mate=null;}}}
  else if(c.state==='tobench'){const d=Math.hypot(c.tx-c.x,c.tz-c.z);if(d<.5||c.stuckN>1){c.state='sit';c.x=c.tx-c.bench.fx*.45;c.z=c.tz-c.bench.fz*.45;c.yaw=Math.atan2(-c.bench.fx,-c.bench.fz);c.g.rotation.y=c.yaw;}
    else{c.mx=(c.tx-c.x)/d;c.mz=(c.tz-c.z)/d;c.spd=1.3;face(c,c.tx,c.tz,dt,5);}}
  else if(c.state==='sit'){c.pt-=dt;if(c.pt<=0){c.state='walk';c.bench.used--;c.bench=null;civGoto(c,nearNode(c.x,c.z));}}
  if(c.state!=='hide')c.crouch=Math.max(0,c.crouch-dt*4);stepCiv(c,dt);animCiv(c,dt);}
// spawn out of sight at a street corner 45 to 95 m away, despawn far away
function civLook(){const used=new Set(civs.map(c=>c.look));for(let k=0;k<6;k++){const l=Math.floor(R()*CIVL.length);if(!used.has(l))return l;}return Math.floor(R()*CIVL.length);}
function spawnCivs(){let n=0;for(const c of civs)if(c.alive)n++;if(n>=LIFE.civN)return;
  // round the plaza, people are spawned on it: out of sight behind the kiosk, the planters and the trees
  if(Math.hypot(PLZ.x-P.x,PLZ.z-P.z)<90&&R()<.5){for(let k=0;k<10;k++){const p=plazaSpot();if(Math.hypot(p[0]-P.x,p[1]-P.z)<22||!unseen(p[0],p[1]))continue;if(LIFE.alarm<14&&Math.hypot(p[0]-LIFE.nx,p[1]-LIFE.nz)<70)continue;
      const c=addCiv(p[0],p[1],civLook());c.node=RP(PLZ_IN);c.plaza=true;const q=plazaSpot();c.tx=q[0];c.tz=q[1];return;}}
  for(let k=0;k<24;k++){const nd=LG[Math.floor(R()*LG.length)],d=Math.hypot(nd.x-P.x,nd.z-P.z);if(d<45||d>95)continue;if(LIFE.alarm<14&&Math.hypot(nd.x-LIFE.nx,nd.z-LIFE.nz)<70)continue;
    const sx=R()<.5?-1:1,sz=R()<.5?-1:1,p=corner(nd,sx,sz);if(!unseen(p[0],p[1])||!freeSpot(p[0],p[1]))continue;
    const c=addCiv(p[0],p[1],civLook());c.sx=sx;c.sz=sz;c.node=LGk.get(nd.x+','+nd.z);c.t=R2(1,6);civNext(c);
    if(R()<.3&&n+1<LIFE.civN){const o=addCiv(p[0]+R2(-.8,.8),p[1]+R2(-.8,.8),civLook());o.sx=sx;o.sz=sz;o.node=c.node;o.mate=c;c.mate=o;c.state=o.state='chat';c.pt=o.pt=R2(6,14);}
    return;}}
// the player hurt a civilian: reprimand, score, and the stage fails on the third one killed
function civHurt(c,dmg,fx,fz,byPlayer,explosive){if(!c.alive)return;c.hp-=dmg;c.flinch=.3;if(c.state!=='flee')civAlarm(c);
  if(byPlayer&&!c.hurt){c.hurt=true;LIFE.hurtN++;LIFE.hurtAll=(LIFE.hurtAll||0)+1;G.score-=200;killFeed('-200','Civilian casualty');
    radio('COMMAND',RP(['Halcón, that was a civilian! Check your fire.','Civilians in the street, Halcón. Watch your targets.','Negative, Halcón, that was a civilian. Identify before you shoot.']));}
  if(c.hp<=0){c.alive=false;c.deadT=0;const hx=c.x-fx,hz=c.z-fz;c.fall=(hx*-Math.sin(c.yaw)+hz*-Math.cos(c.yaw))<0?1:-1;c.crouch=0;c.body.position.y=0;c.lL.rotation.x=c.lR.rotation.x=c.kL.rotation.x=0;
    if(c.mate){c.mate.mate=null;c.mate=null;}if(c.bench){c.bench.used--;c.bench=null;}if(byPlayer){LIFE.killN++;LIFE.killAll=(LIFE.killAll||0)+1;if(LIFE.killN>=3&&G.mode==='mission'&&LIFE.failT<=0){LIFE.failT=2;LIFE.failN=(LIFE.failN||0)+1;banner('MISSION FAILED','CIVILIAN CASUALTIES');}}}}
// hooks for fire() and explode()
function lifeRay(ox,oy,oz,dx,dy,dz,maxT){if(!LIFE.on||!civs.length)return null;return raySoldiers(civs,ox,oy,oz,dx,dy,dz,maxT);}
function lifeBlast(x,y,z,rad,dmg,byPlayer){if(!LIFE.on)return;for(let i=civs.length-1;i>=0;i--){const c=civs[i];if(!c.alive)continue;const d=Math.hypot(c.x-x,chestY(c)-y,c.z-z);if(d>=rad)continue;
    const k=(1-d/rad)*(los(x,y+.7,z,c.x,chestY(c),c.z)?1:.25);if(k>0)civHurt(c,dmg*k,x,z,byPlayer,true);}}

// ---------- street dogs: one skinned mesh for all of them (root, body, head, four legs, tail per dog)
const DOG={mesh:null,bones:[],cols:[0xc49a5a,0x2a2622,0xe9e2d2,0x8a6a44]},DJ=[[0,0,0],[0,0,0],[0,.52,-.3],[-.08,.42,-.2],[.08,.42,-.2],[-.08,.42,.2],[.08,.42,.2],[0,.5,.28]];
function dogGeo(){const p=[],n=[],c=[],u=[],si=[],sw=[],ix=[];
  const add=(g,bone,x,y,z,rx,sx,sy,sz,col)=>{_e.set(rx||0,0,0,'YXZ');_q.setFromEuler(_e);_p.set(x,y,z);_s.set(sx,sy,sz);_m4.compose(_p,_q,_s);_n3.getNormalMatrix(_m4);
    const Pp=g.attributes.position,N=g.attributes.normal,k0=p.length/3,r=(col>>16&255)/255,gg=(col>>8&255)/255,b=(col&255)/255;
    for(let i=0;i<Pp.count;i++){_v.fromBufferAttribute(Pp,i).applyMatrix4(_m4);p.push(_v.x,_v.y,_v.z);_v.fromBufferAttribute(N,i).applyMatrix3(_n3).normalize();n.push(_v.x,_v.y,_v.z);c.push(r,gg,b);u.push(.5,.5);si.push(bone,0,0,0);sw.push(1,0,0,0);}
    if(g.index)for(let i=0;i<g.index.count;i++)ix.push(k0+g.index.getX(i));else for(let i=0;i<Pp.count;i++)ix.push(k0+i);};
  // vertices are stored in mesh space (the bind pose), so each part is shifted to its joint: DJ lists the joints of one dog
  for(let d=0;d<LIFE.dogN;d++){const b0=d*8,col=DOG.cols[d%DOG.cols.length],c2=shade(col,.8),J=(k,g,x,y,z,rx,sx,sy,sz,c)=>add(g,b0+k,x+DJ[k][0],y+DJ[k][1],z+DJ[k][2],rx,sx,sy,sz,c);
    J(1,GEO.ball,0,.42,0,0,.13,.14,.3,col);J(1,GEO.ball,0,.46,-.24,0,.1,.1,.1,col);                                   // body, chest
    J(2,GEO.ball,0,0,-.06,0,.09,.085,.1,col);J(2,GEO.box,0,-.04,-.17,0,.07,.06,.12,c2);J(2,GEO.blob,0,-.02,-.235,0,.025,.02,.025,0x1d1c1a); // head, snout, nose
    for(const s of [-1,1])J(2,GEO.box,s*.07,.06,-.02,-.4,.035,.09,.02,c2);                                            // ears
    for(let l=0;l<4;l++)J(3+l,GEO.limb,0,0,0,0,.03,.4,.03,l<2?col:c2);                                                // legs hang from their joints
    J(7,GEO.rod,0,0,0,.7,.02,.26,.02,col);}                                                                           // tail
  const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(p,3));g.setAttribute('normal',new T.Float32BufferAttribute(n,3));g.setAttribute('color',new T.Float32BufferAttribute(c,3));
  g.setAttribute('uv',new T.Float32BufferAttribute(u,2));g.setAttribute('skinIndex',new T.Uint16BufferAttribute(si,4));g.setAttribute('skinWeight',new T.Float32BufferAttribute(sw,4));g.setIndex(ix);return g;}
function makeDogs(){if(DOG.mesh)return;const B=[],roots=[];
  for(let d=0;d<LIFE.dogN;d++){const r=new T.Bone(),bd=new T.Bone(),hd=new T.Bone(),tl=new T.Bone();hd.position.set(DJ[2][0],DJ[2][1],DJ[2][2]);tl.position.set(DJ[7][0],DJ[7][1],DJ[7][2]);r.add(bd);bd.add(hd);bd.add(tl);
    const legs=[];for(let l0=3;l0<7;l0++){const l=new T.Bone();l.position.set(DJ[l0][0],DJ[l0][1],DJ[l0][2]);bd.add(l);legs.push(l);}
    B.push(r,bd,hd,legs[0],legs[1],legs[2],legs[3],tl);roots.push({r,bd,hd,legs,tl});}
  const m=new T.SkinnedMesh(dogGeo(),skinMat);for(const o of roots)m.add(o.r);m.updateMatrixWorld(true);m.bind(new T.Skeleton(B));m.frustumCulled=false;m.castShadow=true;m.visible=false;scene.add(m);DOG.mesh=m;DOG.bones=roots;}
function dogSpot(){for(let k=0;k<30;k++){const a=R()*TAU,d=R2(35,70),x=P.x+Math.cos(a)*d,z=P.z+Math.sin(a)*d;if(freeSpot(x,z)&&unseen(x,z))return[x,z];}return null;}
function placeDogs(){makeDogs();dogs.length=0;for(let d=0;d<LIFE.dogN;d++){const p=dogSpot()||[P.x+40,P.z];dogs.push({x:p[0],z:p[1],yaw:R()*TAU,state:'sniff',t:R2(1,4),tx:p[0],tz:p[1],ph:R()*6,moveAmt:0,spd:0,barkT:0,lie:0,b:DOG.bones[d],g:{rotation:{y:0}},stuckT:0,lastX:p[0],lastZ:p[1]});}
  DOG.mesh.visible=true;}
function updDog(d,dt){const dp=Math.hypot(d.x-P.x,d.z-P.z),alarm=LIFE.alarm<10,dn=Math.hypot(d.x-LIFE.nx,d.z-LIFE.nz);let sp=0;
  if(dp>150&&unseen(d.x,d.z)){const p=dogSpot();if(p){d.x=p[0];d.z=p[1];d.state='sniff';d.t=2;}}
  if(alarm&&dn<70&&d.state!=='flee'){d.state='flee';d.lie=0;const ax=d.x-LIFE.nx,az=d.z-LIFE.nz,al=Math.hypot(ax,az)||1;d.tx=d.x+ax/al*45+R2(-8,8);d.tz=d.z+az/al*45+R2(-8,8);d.t=6;}
  if(d.state==='flee'){const dd=Math.hypot(d.tx-d.x,d.tz-d.z);d.t-=dt;if(dd<2||d.t<=0){d.state='sniff';d.t=R2(2,4);}else{sp=5.5;face(d,d.tx,d.tz,dt,10);}}
  else if(dp<7&&d.state!=='lie'&&P.alive){d.state='bark';face(d,P.x,P.z,dt,6);d.barkT-=dt;if(d.barkT<=0){d.barkT=R2(1.2,3);sndBark(d.x,d.z,R()<.5?2:3,false);d.hop=.3;}if(dp<3.5)sp=-1.2;}
  else if(d.state==='bark'){d.state='sniff';d.t=R2(1,3);}
  else if(d.state==='trot'){const dd=Math.hypot(d.tx-d.x,d.tz-d.z);if(dd<1.2||d.stuckN>1){d.stuckN=0;d.state=R()<.3?'lie':'sniff';d.t=d.state==='lie'?R2(10,25):R2(2,5);}else{sp=2.4;face(d,d.tx,d.tz,dt,5);}}
  else{d.t-=dt;if(d.t<=0){d.state='trot';for(let k=0;k<12;k++){const a=R()*TAU,r=R2(8,26),x=d.x+Math.cos(a)*r,z=d.z+Math.sin(a)*r;if(freeSpot(x,z)&&Math.hypot(x-P.x,z-P.z)<80){d.tx=x;d.tz=z;break;}}}}
  const ox=d.x,oz=d.z;if(sp){d.x+=-Math.sin(d.yaw)*sp*dt;d.z+=-Math.cos(d.yaw)*sp*dt;pushOut(d,.25,0);d.x=clamp(d.x,BOUND.x0,BOUND.x1);d.z=clamp(d.z,BOUND.z0,BOUND.z1);}
  for(let k=0;k<traffic.length;k++)carPush(traffic[k],d,.3);
  const moved=Math.hypot(d.x-ox,d.z-oz);d.moveAmt=lerp(d.moveAmt,clamp(moved/Math.max(dt,1e-4)/2.4,0,1.4),Math.min(1,dt*10));if(moved>0)d.ph+=moved*5.5;
  if(sp>0){d.stuckT+=dt;if(d.stuckT>1){if(Math.hypot(d.x-d.lastX,d.z-d.lastZ)<.4)d.stuckN=(d.stuckN||0)+1;else d.stuckN=0;d.stuckT=0;d.lastX=d.x;d.lastZ=d.z;}}
  d.lie+=clamp((d.state==='lie'?1:0)-d.lie,-dt*2,dt*2);if(d.hop>0)d.hop-=dt;
  // pose: trot swing, head down to sniff, flat on the ground when lying, a small hop when barking
  const b=d.b,m=d.moveAmt,L0=d.lie,sw=Math.sin(d.ph)*.6*m,ys=d.state==='sniff'?-.6:d.state==='bark'?.35:0;
  b.r.position.set(d.x,padY(d.x,d.z)+Math.abs(Math.sin(d.ph))*.02*m+(d.hop>0?Math.sin(d.hop/.3*PI)*.06:0),d.z);b.r.rotation.y=d.yaw;
  b.bd.position.y=-.22*L0;b.bd.rotation.z=L0*.5;b.hd.rotation.x=ys*(1-L0)+Math.sin(G.time*1.7+d.ph)*.05;b.hd.position.y=.52-.12*L0;
  b.legs[0].rotation.x=sw+L0*1.4;b.legs[1].rotation.x=-sw+L0*1.4;b.legs[2].rotation.x=-sw-L0*1.4;b.legs[3].rotation.x=sw-L0*1.4;
  b.tl.rotation.y=Math.sin(G.time*(d.state==='bark'?14:3)+d.ph)*(d.state==='bark'?.6:.25)*(1-L0);b.tl.rotation.x=L0*.9;}

// ---------- traffic: four cars on the boulevard, the Loreto highway and round the plaza, stopping for people and gunfire
// A two-way route is a loop: out on the right-hand lane, back on the other, turning round where the median is cut at a cross street.
// The boulevard routes stop short of the checkpoints, the highway lanes run between the cars parked along it.
const RT=[];function twoWay(ax,bx,az,bz,off){const dx=bx-ax,dz=bz-az,l=Math.hypot(dx,dz),rx=-dz/l*off,rz=dx/l*off;RT.push({pts:[[ax+rx,az+rz],[bx+rx,bz+rz],[bx-rx,bz-rz],[ax-rx,az-rz]],two:true});}
twoWay(0,0,454,374,3.4);twoWay(0,0,294,54,3.4);twoWay(0,0,-60,-180,3.4);twoWay(50,940,0,0,1.2);
RT.push({pts:[[157,-663],[157,-597],[259,-597],[259,-663]],two:false});
const carGeoCache={};
function carGeo(type,col){const key=type+'/'+col;if(carGeoCache[key])return carGeoCache[key];const V=VEH[type],b=new GB(),A=(g,x,y,z,sx,sy,sz,c)=>b.add(g,x,y,z,0,0,0,sx,sy,sz,c);
  A(V.body,0,0,0,1,1,1,col);A(V.glass,0,0,0,1,1,1,C.glass);const rf=V.roof;A(GEO.box,0,rf[1],-rf[0],rf[3],V.roofH||.05,rf[2],col);if(V.bed)A(GEO.box,0,V.bed[1],-V.bed[0],V.bed[3],.02,V.bed[2],0x1a1816);
  for(const wz of V.wheels)for(const s of [-1,1]){A(GEO.wheel,s*(V.wid/2-.13),V.wr,-wz,.25,V.wr,V.wr,C.tire);A(GEO.hub,s*(V.wid/2-.01),V.wr,-wz,.03,V.wr*.5,V.wr*.5,0x9a9c9a);}
  const fz=V.len/2-.02,ly=type==='sedan'?.68:.84;for(const s of [-1,1]){A(GEO.box,s*(V.wid/2-.32),ly,-fz,.34,.14,.06,0xf2ecd2);A(GEO.box,s*(V.wid/2-.3),ly,fz-.02,.3,.14,.06,0xa02018);}
  A(GEO.box,0,.4,-fz-.04,V.wid-.1,.16,.12,0x3a3b3c);A(GEO.box,0,.4,fz+.02,V.wid-.1,.16,.12,0x3a3b3c);return carGeoCache[key]=b.build();}
function makeTraffic(){for(const c of traffic)scene.remove(c.m);traffic.length=0;const types=['sedan','pickup','van','sedan'];
  for(let k=0;k<4;k++){const type=types[k],m=new T.Mesh(carGeo(type,carCols[(k*5+3)%carCols.length]),vcMat);m.castShadow=true;m.visible=false;scene.add(m);
    traffic.push({m,type,V:VEH[type],x:0,z:0,yaw:0,spd:0,r:-1,wp:0,blockT:0,ghost:0,hornT:0,wait:0,far:true});}}
function carPlace(c,r){const R0=RT[r];let i=Math.floor(R()*R0.pts.length);for(let k=0;k<R0.pts.length;k++)for(let q=0;q<4;q++){const a=R0.pts[(i+k)%R0.pts.length],b=R0.pts[(i+k+1)%R0.pts.length],t=R(),x=lerp(a[0],b[0],t),z=lerp(a[1],b[1],t),d=Math.hypot(x-P.x,z-P.z);
    if(d>55&&d<240&&unseen(x,z)){c.r=r;c.x=x;c.z=z;c.wp=(i+k+1)%R0.pts.length;c.yaw=Math.atan2(-(b[0]-a[0]),-(b[1]-a[1]));c.spd=0;c.m.visible=true;c.far=false;return true;}}return false;}
// push an entity out of the car's two end circles
function carPush(c,e,r){if(!c.m.visible)return;const fx=-Math.sin(c.yaw),fz=-Math.cos(c.yaw),L0=c.V.len/4,rr0=c.V.wid/2+r;
  for(const s of [-1,1]){const cx=c.x+fx*L0*s,cz=c.z+fz*L0*s,dx=e.x-cx,dz=e.z-cz,d2=dx*dx+dz*dz;if(d2<rr0*rr0&&d2>1e-6){const d=Math.sqrt(d2);e.x=cx+dx/d*rr0;e.z=cz+dz/d*rr0;}}}
function ahead(c,e,len,hw){const fx=-Math.sin(c.yaw),fz=-Math.cos(c.yaw),dx=e.x-c.x,dz=e.z-c.z,a=dx*fx+dz*fz,s=Math.abs(-dx*fz+dz*fx);return a>c.V.len*.4&&a<len&&s<hw;}
function updCar(c,dt){if(c.r<0){c.retry=(c.retry||0)-dt;if(c.retry<=0){c.retry=1;for(const r of nearRoutes())if(carPlace(c,r))break;}return;}
  const R0=RT[c.r],tp=R0.pts[c.wp],dx=tp[0]-c.x,dz=tp[1]-c.z,d=Math.hypot(dx,dz),want=Math.atan2(-dx,-dz),off=angDiff(want,c.yaw),dp=Math.hypot(c.x-P.x,c.z-P.z);
  if(dp>300&&unseen(c.x,c.z)){c.far=true;c.m.visible=false;c.r=-1;carUnblock(c);return;} // gone: it comes back on a route near the player
  if(d<2.5){c.wp=(c.wp+1)%R0.pts.length;}
  // what is in the way: people (wait), gunfire nearby (the driver stays put), colliders (turn round)
  let stop=0,who=0;const near=dp<70&&LIFE.alarm<10;if(near)stop=1;
  if(!stop){const lists=[civs,foes,allies];for(const L1 of lists)for(let k=0;k<L1.length;k++){const e=L1[k];if(e.alive&&ahead(c,e,8.5,1.9)){stop=1;who=1;break;}}
    if(!stop&&P.alive&&ahead(c,P,8.5,1.9)){stop=1;who=1;}if(!stop)for(let k=0;k<dogs.length;k++)if(ahead(c,dogs[k],9,1.5)){stop=1;who=1;break;}}
  if(!stop&&c.ghost<=0){const fx=-Math.sin(c.yaw),fz=-Math.cos(c.yaw),rx=-fz,rz=fx;const rl=Math.abs(off)>.35?4:9;for(const s of [-.7,0,.7]){const t=rayWorld(c.x+fx*c.V.len*.5+rx*s,.55,c.z+fz*c.V.len*.5+rz*s,fx,0,fz,rl);if(t<rl&&RHc){stop=2;break;}}}
  if(stop===2){c.blockT+=dt;if(c.blockT>1.5){c.blockT=0;c.ghost=5;}}else c.blockT=0;
  if(c.ghost>0)c.ghost-=dt;
  if(who){c.wait+=dt;if(c.wait>4&&c.hornT<=0){c.hornT=R2(5,9);sndHorn(c.x,c.z);}}else c.wait=0;if(c.hornT>0)c.hornT-=dt;
  const target=stop?0:Math.abs(off)>.35?3:d<8?4:9;c.spd+=clamp(target-c.spd,-dt*9,dt*3.2);
  if(c.spd>.1){c.yaw+=clamp(off,-dt*1.3*Math.min(1,c.spd/3),dt*1.3*Math.min(1,c.spd/3));c.x+=-Math.sin(c.yaw)*c.spd*dt;c.z+=-Math.cos(c.yaw)*c.spd*dt;}
  c.m.position.set(c.x,.03,c.z);c.m.rotation.y=c.yaw;if(P.alive)carPush(c,P,.45);for(const L1 of [allies,foes])for(let k=0;k<L1.length;k++)if(L1[k].alive&&L1[k].y0<.5)carPush(c,L1[k],.4);
  // a car that has stopped takes its cells off the navigation grid, so soldiers and the bot route round it instead of walking into it
  if(c.spd<.3&&!c.cells){c.cells=[];const fx=-Math.sin(c.yaw),fz=-Math.cos(c.yaw);for(const s of [-1,0,1]){const k=cellOf(c.x+fx*s*c.V.len*.33,c.z+fz*s*c.V.len*.33);if(k>=0&&!blocked[k]&&c.cells.indexOf(k)<0){blocked[k]=1;c.cells.push(k);}}}
  else if(c.spd>=.3&&c.cells)carUnblock(c);}
function carUnblock(c){if(c.cells){for(const k of c.cells)blocked[k]=0;c.cells=null;}}
function nearRoutes(){const L1=[];for(let r=0;r<RT.length;r++){if(traffic.some(c=>c.r===r))continue;let bd=1e9;for(const p of RT[r].pts)bd=Math.min(bd,Math.hypot(p[0]-P.x,p[1]-P.z));if(bd<240)L1.push([bd,r]);}
  L1.sort((a,b)=>a[0]-b[0]);return L1.map(a=>a[1]);}
// one engine hum for the nearest moving car; it fades by itself if the game stops updating it
function carHum(){if(!AU.ctx||!AU.on)return;let best=null,bv=0;for(const c of traffic){if(c.far||c.spd<.5)continue;const s=spatial(c.x,c.z,18),v=s.vol*Math.min(1,c.spd/6);if(v>bv){bv=v;best=s.pan;}}
  try{const t=AU.ctx.currentTime;if(!LIFE.hum){const cc=AU.ctx,s=cc.createBufferSource();s.buffer=AU.noise;s.loop=true;const f=cc.createBiquadFilter();f.type='lowpass';f.frequency.value=220;const o=cc.createOscillator();o.type='sawtooth';o.frequency.value=58;
      const og=cc.createGain();og.gain.value=.35;const g=cc.createGain();g.gain.value=0;s.connect(f);f.connect(g);o.connect(og);og.connect(g);const pn=cc.createStereoPanner?cc.createStereoPanner():null;if(pn){g.connect(pn);pn.connect(AU.master);}else g.connect(AU.master);s.start();o.start();LIFE.hum={g,pn};}
    const g=LIFE.hum.g.gain;g.cancelScheduledValues(t);g.setTargetAtTime(Math.min(.3,bv*.4),t,.1);g.setTargetAtTime(0,t+.4,.15);if(LIFE.hum.pn&&best!==null)LIFE.hum.pn.pan.setTargetAtTime(best,t,.1);}catch(e){}}

// ---------- birds: one Points cloud of grackles that peck on the ground or sit on a wire, and scatter at gunshots
const BIRD={n:isTouch?10:14,pts:null,pos:null,state:'ground',cx:0,cz:0,t:0,fly:0,wire:null,b:[]};
const birdTex=tex(32,32,(g,w,h)=>{g.clearRect(0,0,w,h);g.fillStyle='#1b1816';g.beginPath();g.ellipse(16,17,5,3.2,0,0,7);g.fill();g.beginPath();g.moveTo(3,13);g.quadraticCurveTo(10,9,16,16);g.quadraticCurveTo(22,9,29,13);g.lineTo(27,17);g.quadraticCurveTo(16,21,5,17);g.closePath();g.fill();g.fillRect(14,19,2,4);});
function makeBirds(){if(BIRD.pts)return;const g=new T.BufferGeometry();BIRD.pos=new Float32Array(BIRD.n*3);g.setAttribute('position',new T.BufferAttribute(BIRD.pos,3));
  const m=new T.PointsMaterial({map:birdTex,size:.34,transparent:true,alphaTest:.4,depthWrite:false,color:0xffffff});const p=new T.Points(g,m);p.frustumCulled=false;p.visible=false;scene.add(p);BIRD.pts=p;
  for(let k=0;k<BIRD.n;k++)BIRD.b.push({x:0,y:0,z:0,tx:0,tz:0,t:R2(.5,3),ph:R()*TAU,r:R2(5,12),h:R2(5,11)});}
function birdSpot(){const wires=[];for(let k=0;k<poles.length-1;k++){const A=poles[k],B=poles[k+1];if(A[2]!==B[2]||Math.hypot(A[0]-B[0],A[1]-B[1])>50)continue;const mx=(A[0]+B[0])/2,mz=(A[1]+B[1])/2;if(Math.hypot(mx-P.x,mz-P.z)<70)wires.push([A,B]);}
  if(wires.length&&R()<.5){const w=RP(wires);BIRD.wire=w;BIRD.state='wire';BIRD.cx=(w[0][0]+w[1][0])/2;BIRD.cz=(w[0][1]+w[1][1])/2;}
  else{BIRD.wire=null;BIRD.state='ground';for(let k=0;k<20;k++){const a=R()*TAU,d=R2(20,55),x=P.x+Math.cos(a)*d,z=P.z+Math.sin(a)*d;if(freeSpot(x,z)){BIRD.cx=x;BIRD.cz=z;break;}}}
  BIRD.t=R2(20,50);for(const b of BIRD.b)birdPerch(b);}
function birdPerch(b){if(BIRD.state==='wire'){const A=BIRD.wire[0],B=BIRD.wire[1],t=R2(.1,.9),s=RP([-1,0,1]);b.tx=lerp(A[0],B[0],t)+(A[2]?s:0);b.tz=lerp(A[1],B[1],t)+(A[2]?0:s);b.ty=8.15-1.98*t*(1-t)+.14;}
  else{b.tx=BIRD.cx+R2(-3.5,3.5);b.tz=BIRD.cz+R2(-3.5,3.5);b.ty=padY(b.tx,b.tz)+.15;}}
function updBirds(dt){if(!BIRD.pts.visible)return;const alarm=LIFE.alarm<1&&Math.hypot(BIRD.cx-LIFE.nx,BIRD.cz-LIFE.nz)<80;
  if(alarm&&BIRD.fly<=0){BIRD.fly=R2(7,11);for(const b of BIRD.b){b.ph=R()*TAU;b.x=b.tx;b.z=b.tz;b.y=b.ty;}}
  BIRD.t-=dt;if(Math.hypot(BIRD.cx-P.x,BIRD.cz-P.z)>110||(BIRD.t<=0&&BIRD.fly<=0&&unseen(BIRD.cx,BIRD.cz)))birdSpot();
  const pos=BIRD.pos;
  if(BIRD.fly>0){BIRD.fly-=dt;
    for(let i=0;i<BIRD.n;i++){const b=BIRD.b[i];b.ph+=dt*(1.1+i*.03);const r=b.r*Math.min(1,BIRD.fly),gx=BIRD.cx+Math.cos(b.ph)*r,gz=BIRD.cz+Math.sin(b.ph)*r,gy=b.ty+b.h*Math.min(1,BIRD.fly/2);
      const land=BIRD.fly<1.5;b.x+=((land?b.tx:gx)-b.x)*Math.min(1,dt*(land?3:2.5));b.z+=((land?b.tz:gz)-b.z)*Math.min(1,dt*(land?3:2.5));b.y+=((land?b.ty:gy)-b.y)*Math.min(1,dt*2.5)+Math.sin(G.time*16+b.ph)*.02;
      pos[i*3]=b.x;pos[i*3+1]=b.y;pos[i*3+2]=b.z;}
    if(BIRD.fly<=0)for(const b of BIRD.b){b.x=b.tx;b.z=b.tz;b.y=b.ty;}}
  else for(let i=0;i<BIRD.n;i++){const b=BIRD.b[i];b.t-=dt;if(b.t<=0){b.t=R2(.8,4);if(BIRD.state==='ground'&&R()<.6){b.tx+=R2(-.5,.5);b.tz+=R2(-.5,.5);}}
    b.x+=(b.tx-b.x)*Math.min(1,dt*3);b.z+=(b.tz-b.z)*Math.min(1,dt*3);b.y=b.ty+(BIRD.state==='ground'&&b.t<.15?.08:0);pos[i*3]=b.x;pos[i*3+1]=b.y;pos[i*3+2]=b.z;}
  BIRD.pts.geometry.attributes.position.needsUpdate=true;}

// ---------- ambient sound: a dog far off, a rooster, a gust, a radio playing in a house
const TUNE=[0,4,7,12,7,4,0,-5,0,4,7,4,0,-1,0,-5];
function ambient(dt){LIFE.ambT-=dt;if(LIFE.music){const m=LIFE.music;m.t-=dt;if(m.t<=0){m.t=.28;if(m.k>=TUNE.length*3){LIFE.music=null;}else{try{const s=spatial(m.x,m.z,14),o=aOut(.09*s.vol,s.pan),f=220*Math.pow(2,TUNE[m.k%TUNE.length]/12);
          osc(o,'triangle',f,f,.25,1);osc(o,'triangle',f*1.5,f*1.5,.22,.3);if(m.k%4===0)nz(o,.05,2000,800,.4);}catch(e){}m.k++;}}}
  if(LIFE.ambT>0||!AU.ctx||!AU.on)return;LIFE.ambT=R2(7,18);const r=R(),a=R()*TAU,d=R2(40,120),x=P.x+Math.cos(a)*d,z=P.z+Math.sin(a)*d;
  try{if(r<.3)sndBark(x,z,2+Math.floor(R()*3),true);
    else if(r<.5){const s=spatial(x,z,30),o=aOut(.22*s.vol,s.pan),c=AU.ctx,t=c.currentTime,os=c.createOscillator(),g=c.createGain(),f=c.createBiquadFilter();os.type='sawtooth';f.type='lowpass';f.frequency.value=Math.min(1800,s.lp);
      os.frequency.setValueAtTime(620,t);os.frequency.linearRampToValueAtTime(880,t+.25);os.frequency.setValueAtTime(760,t+.3);os.frequency.linearRampToValueAtTime(980,t+.55);os.frequency.setValueAtTime(900,t+.6);os.frequency.exponentialRampToValueAtTime(520,t+1.3);
      g.gain.setValueAtTime(.001,t);g.gain.exponentialRampToValueAtTime(.6,t+.05);g.gain.setValueAtTime(.6,t+.9);g.gain.exponentialRampToValueAtTime(.001,t+1.35);os.connect(f);f.connect(g);g.connect(o);os.start(t);os.stop(t+1.4);}
    else if(r<.75){const o=aOut(.16,R2(-.6,.6)),c=AU.ctx,t=c.currentTime,s=c.createBufferSource(),f=c.createBiquadFilter(),g=c.createGain();s.buffer=AU.noise;s.loop=true;f.type='lowpass';f.frequency.setValueAtTime(240,t);f.frequency.linearRampToValueAtTime(900,t+1.6);f.frequency.linearRampToValueAtTime(200,t+3.4);
      g.gain.setValueAtTime(.001,t);g.gain.linearRampToValueAtTime(1,t+1.5);g.gain.linearRampToValueAtTime(.001,t+3.5);s.connect(f);f.connect(g);g.connect(o);s.start(t);s.stop(t+3.6);}
    else if(!LIFE.music){let bx=x,bz=z;for(let k=0;k<10;k++){const a2=R()*TAU,d2=R2(18,40),px=P.x+Math.cos(a2)*d2,pz=P.z+Math.sin(a2)*d2;if(blockAt(px,pz)&&!onStreet(px,pz)){bx=px;bz=pz;break;}}LIFE.music={x:bx,z:bz,k:0,t:0};}}catch(e){}}

// ---------- entry points
function lifeReset(){for(const c of civs)removeCiv(c);civs.length=0;dogs.length=0;if(DOG.mesh)DOG.mesh.visible=false;for(const c of traffic){c.m.visible=false;c.r=-1;c.far=true;carUnblock(c);}if(BIRD.pts)BIRD.pts.visible=false;
  LIFE.on=false;LIFE.alarm=99;LIFE.hurtN=0;LIFE.killN=0;LIFE.stage=-2;LIFE.failT=0;LIFE.music=null;LIFE.spawnT=0;}
function lifeStart(){if(MP.on)return;LIFE.on=true;LIFE.alarm=99;if(!traffic.length)makeTraffic();placeDogs();makeBirds();BIRD.pts.visible=true;birdSpot();LIFE.spawnT=0;}
function lifeUpdate(dt){if(MP.on){if(LIFE.on)lifeReset();return;}if(!LIFE.on)lifeStart();
  LIFE.alarm+=dt;if(LIFE.screamT>0)LIFE.screamT-=dt;if(MS.i!==LIFE.stage){LIFE.stage=MS.i;LIFE.hurtN=0;LIFE.killN=0;}
  if(LIFE.failT>0){LIFE.failT-=dt;if(LIFE.failT<=0){restartCheckpoint();return;}}
  // soldiers firing count as noise too (the player's own shots and explosions arrive through noiseEvent)
  for(const L1 of [foes,allies])for(let k=0;k<L1.length;k++){const s=L1[k];if(s.alive&&((s.burst>0&&s.burstT===s.K.rof)||(s.isStatic&&s.revealT===3))){LIFE.alarm=0;LIFE.nx=s.x;LIFE.nz=s.z;break;}}
  LIFE.spawnT-=dt;if(LIFE.spawnT<=0){LIFE.spawnT=.5;spawnCivs();}
  for(let k=civs.length-1;k>=0;k--){const c=civs[k];
    if(!c.alive){if(!updCorpse(c,dt)){civs.splice(k,1);if(c.mate){c.mate.mate=null;}corpses.push(c);if(corpses.length>10)removeSoldier(corpses.shift());}continue;}
    if(Math.hypot(c.x-P.x,c.z-P.z)>130){removeCiv(c);civs.splice(k,1);continue;}updCiv(c,dt);}
  for(let k=0;k<dogs.length;k++)updDog(dogs[k],dt);
  for(let k=0;k<traffic.length;k++)updCar(traffic[k],dt);carHum();
  updBirds(dt);ambient(dt);}
