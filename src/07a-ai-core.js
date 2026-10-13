// =====================================================================
// 07a AI CORE: hearing, sight, damage, death, shooting, cover search
// =====================================================================
const FE=makeField(),FA=makeField();let feT=0,faT=0;
const coverTaken=new Set();
G.diff=.85;G.dmgK=1;G.nadeCD=6;G.calloutT=0;G.supp=0;G.hitT=0;G.hitKill=false;G.assist=true;G.onKill=null;
const WIND=['north','north-east','east','south-east','south','south-west','west','north-west'];
function bearingOf(dx,dz){return((Math.atan2(dx,-dz)*180/PI+ROT_DEG)%360+360)%360;}
const windName=(dx,dz)=>WIND[Math.round(bearingOf(dx,dz)/45)%8];
// gunfire, explosions and running feet: hostiles in earshot become alert and guess at the source
function noiseEvent(x,z,rad,fromPlayer){for(let k=0;k<foes.length;k++){const s=foes[k];if(!s.alive)continue;const d=Math.hypot(s.x-x,s.z-z);if(d>rad)continue;
    if(!s.aware){s.aware=true;s.lowered=false;s.reactT=R2(.5,1.1);}if(fromPlayer&&s.seeT>1){const e=Math.min(10,d*.12);s.lkx=x+R2(-e,e);s.lkz=z+R2(-e,e);}}
  if(fromPlayer&&rad>30){G.lkp.x=x;G.lkp.z=z;G.lkp.age=0;}}
function alertNear(s,rad){for(let k=0;k<foes.length;k++){const o=foes[k];if(o!==s&&o.alive&&!o.aware&&Math.hypot(o.x-s.x,o.z-s.z)<rad){o.aware=true;o.lowered=false;o.reactT=R2(.8,1.6);o.lkx=s.lkx;o.lkz=s.lkz;}}}
// 0 = cannot see, 1 = only the head shows, 2 = body in view
function seeTarget(s,t,range){const dx=t.x-s.x,dz=t.z-s.z,d=Math.hypot(dx,dz);if(d>range)return 0;const isP=t===P;
  if(!s.aware&&d>6){if((dx*-Math.sin(s.yaw)+dz*-Math.cos(s.yaw))/d<.42)return 0;}
  const ey=eyeY(s),y1=isP?P.y+lerp(1.25,.8,P.crouch):chestY(t),y2=isP?P.y+lerp(1.6,1.02,P.crouch):eyeY(t);
  if(los(s.x,ey,s.z,t.x,y1,t.z))return 2;if(los(s.x,ey,s.z,t.x,y2,t.z))return 1;return 0;}
function percFoe(s,tick){let best=null,bd=1e9,bv=0;
  if(P.alive){const v=seeTarget(s,P,s.aware?s.K.range+40:75);if(v){best=P;bd=Math.hypot(P.x-s.x,P.z-s.z);bv=v;}}
  for(let k=0;k<MP.mates.length;k++){const a=MP.mates[k];if(!a.alive)continue;const d=Math.hypot(a.x-s.x,a.z-s.z);if(d<bd){const v=seeTarget(s,a,s.aware?s.K.range+40:75);if(v){best=a;bd=d;bv=v;}}} // the other players
  for(let k=0;k<allies.length;k++){const a=allies[k];if(!a.alive)continue;const d=Math.hypot(a.x-s.x,a.z-s.z)*1.25;if(d<bd){const v=seeTarget(s,a,s.aware?s.K.range+20:60);if(v){best=a;bd=d;bv=v;}}}
  if(best){const hum=best===P||!!best.remote,hc=best===P?P.crouch:best.crouch,hs=best===P?P.speed:(best.speed||0);
    if(!s.aware){s.spot+=tick*(bd<14?5:bd<40?1.7:.85)*((hum&&hc>.5)?.55:1)*((hum&&hs>4)?1.3:1);
      if(s.spot<1){s.target=null;return;}s.aware=true;s.lowered=false;s.reactT=R2(.35,.8);alertNear(s,45);}
    if(s.target!==best)s.reactT=Math.max(s.reactT,R2(.25,.55));
    s.target=best;s.vis=bv;s.seeT=0;s.lkx=best.x;s.lkz=best.z;if(s.revealT<.6)s.revealT=.6;
    if(hum){G.lkp.x=best.x;G.lkp.z=best.z;G.lkp.age=0;}
    if(s.cover&&s.phase==='hide'&&Math.hypot(s.cover.x-s.x,s.cover.z-s.z)<1.3){const ty=best===P?P.y+lerp(1.6,1.02,P.crouch):eyeY(best);if(los(best.x,ty,best.z,s.x,s.y0+.85,s.z))s.flanked=true;}}
  else{s.seeT+=tick;s.vis=0;if(!s.aware)s.spot=Math.max(0,s.spot-tick*.4);}}
function percAlly(s,tick){let best=null,bd=1e9;for(let k=0;k<foes.length;k++){const f=foes[k];if(!f.alive)continue;const d=Math.hypot(f.x-s.x,f.z-s.z);if(d<bd&&d<85&&los(s.x,eyeY(s),s.z,f.x,chestY(f),f.z)){best=f;bd=d;}}
  if(best){if(!s.target&&G.calloutT<=0&&P.alive){G.calloutT=10;radio(s.name,'Contact, '+windName(best.x-P.x,best.z-P.z)+'!');}s.target=best;s.seeT=0;s.vis=2;best.revealT=Math.max(best.revealT,1.5);}
  else{s.seeT+=tick;if(s.seeT>1.5)s.target=null;}}
function dropCover(s){if(s.cover){coverTaken.delete(s.cover.n);s.cover=null;}s.flanked=false;}
function damageSoldier(s,dmg,zone,fx,fz,byPlayer,explosive,D){if(!s.alive)return;
  // stand-ins for other players, and (on a guest's machine) for the host's soldiers: the damage is theirs to apply
  if(s.remote){if(s.team===1){if(byPlayer)mpHitPlayer(s,dmg,zone,D,explosive);}else if(!byPlayer)mpHurtMate(s,dmg,fx,fz);return;}
  if(s.net){if(byPlayer)mpFoeHit(s,dmg,zone,D,explosive,fx,fz);return;}
  if(s.team===0&&byPlayer&&!explosive)return;
  let m=1;if(!explosive){if(zone===0)m=s.kind==='heavy'?1.5:(D?D.head:3);else if(zone===2)m=.75;}if(s.team===0&&byPlayer)m*=.3;
  s.hp-=dmg*m;s.flinch=.22;
  if(s.team===1){if(!s.aware){s.aware=true;s.lowered=false;s.reactT=.3;alertNear(s,30);}if(s.seeT>.5){s.lkx=fx;s.lkz=fz;}
    if(byPlayer){G.hitT=.14;G.hitKill=s.hp<=0;if(s.hp>0)sndUi('hit');}}
  if(s.hp<=0){if(s.team===0)downAlly(s);else killFoe(s,fx,fz,byPlayer,zone===0&&!explosive);}}
function killFoe(s,fx,fz,byPlayer,head){s.alive=false;s.deadT=0;dropCover(s);const hx=s.x-fx,hz=s.z-fz;s.fall=(hx*-Math.sin(s.yaw)+hz*-Math.cos(s.yaw))<0?1:-1;s.wp.scale.setScalar(.001);
  if(s.laser){scene.remove(s.laser);s.laser=null;}
  foeLoot(s);const pts=(head?150:100)+(s.kind==='heavy'?100:s.kind==='mark'?50:0);
  if(byPlayer){G.stats.kills++;if(head)G.stats.heads++;G.score+=pts;killFeed('+'+pts,head?'Headshot':s.K.label);sndUi('kill');}
  else if(!MP.hitBy)G.stats.allyKills=(G.stats.allyKills||0)+1;
  if(MP.on&&MP.host)coFoeKilled(s,byPlayer?MP.me:MP.hitBy,head,pts);
  alertNear(s,28);if(G.onKill)G.onKill(s);}
// what a fallen hostile leaves behind (in multiplayer every player finds his own)
function foeLoot(s){if(s.y0>=.5)return;const K=s.K;if(R()<.62)addPick('w',s.x+R2(-.5,.5),s.z+R2(-.5,.5),{id:K.drop,mag:Math.round(R2(.3,1)*WDEF[K.drop].mag),res:Math.round(R2(0,1)*WDEF[K.drop].mag)});
  const r=R();if(r<.1)addPick('med',s.x+R2(-.8,.8),s.z+R2(-.8,.8));else if(r<.18)addPick('nade',s.x+R2(-.8,.8),s.z+R2(-.8,.8));else if(r<.42)addPick('ammo',s.x+R2(-.8,.8),s.z+R2(-.8,.8));}
function downAlly(s){s.alive=false;s.down=true;s.downT=16;s.hp=0;s.target=null;dropCover(s);radio('COMMAND',s.name+' is hit. Cover him until he is back up.');}
function face(s,tx,tz,dt,rate){const want=Math.atan2(-(tx-s.x),-(tz-s.z)),d=angDiff(want,s.yaw);s.yaw+=clamp(d,-rate*dt,rate*dt);s.g.rotation.y=s.yaw;return Math.abs(d);}
function moveToward(s,tx,tz,speed,F){const dx=tx-s.x,dz=tz-s.z,d=Math.hypot(dx,dz);if(d<.45){s.mx=0;s.mz=0;s.spd=0;return d;}
  if(F){const f=flowDir(F,s.x,s.z);s.mx=f.x;s.mz=f.z;}else{s.mx=dx/d;s.mz=dz/d;}s.spd=speed;return d;}
function stepSoldier(s,dt){let mx=s.mx,mz=s.mz;const sp=s.spd||0;
  if(s.unstick>0){s.unstick-=dt;mx=s.ux;mz=s.uz;}
  const lst=s.team?foes:allies;for(let k=0;k<lst.length;k++){const o=lst[k];if(o===s||!o.alive)continue;const ax=s.x-o.x,az=s.z-o.z,a2=ax*ax+az*az;if(a2<1.1&&a2>1e-4){const a=Math.sqrt(a2);mx+=ax/a*.7;mz+=az/a*.7;}}
  let px=0,pz=0;if(s.team===0){const ax=s.x-P.x,az=s.z-P.z,a2=ax*ax+az*az;if(a2<1.3&&a2>1e-4){const a=Math.sqrt(a2);px=ax/a*2.4;pz=az/a*2.4;}}
  const ox=s.x,oz=s.z;if(sp>0&&(mx||mz)){s.x+=mx*sp*dt;s.z+=mz*sp*dt;}if(px||pz){s.x+=px*dt;s.z+=pz*dt;}
  if(s.x!==ox||s.z!==oz){if(s.y0<.5)pushOut(s,.38,0);s.x=clamp(s.x,BOUND.x0,BOUND.x1);s.z=clamp(s.z,BOUND.z0,BOUND.z1);}
  const moved=Math.hypot(s.x-ox,s.z-oz);if(s.team===1&&moved>0){s.stepD+=moved;if(s.stepD>2.5){s.stepD=0;sndStepAt(s.x,s.z);}}s.moveAmt=lerp(s.moveAmt,clamp(moved/Math.max(dt,1e-4)/3,0,1),Math.min(1,dt*10));s.run=sp>4.6;if(moved>0)s.ph+=moved*(s.run?2.1:2.6);
  if(sp>0&&Math.hypot(s.mx,s.mz)>.5){s.stuckT+=dt;if(s.stuckT>1){if(Math.hypot(s.x-s.lastX,s.z-s.lastZ)<.5){s.unstick=.6;const a=R()*TAU;s.ux=Math.cos(a);s.uz=Math.sin(a);s.stuckN=(s.stuckN||0)+1;}else s.stuckN=0;
      s.stuckT=0;s.lastX=s.x;s.lastZ=s.z;}}else s.stuckT=0;
  s.g.position.set(s.x,s.g.position.y,s.z);}
// one round fired by an AI soldier at target t (the player or another soldier)
function shootAt(s,t,d,moving){const fx=-Math.sin(s.yaw),fz=-Math.cos(s.yaw),my=s.y0+(1.36-s.crouch*.42)*s.sc,mx=s.x+fx*.85,mz=s.z+fz*.85,isP=t===P;
  s.revealT=3;sndShot(s.K.snd,s.x,s.z,false);puff(mx,my,mz,0xffc45a,.26,.06,.05,1,0,0,0,true);
  let p=s.K.acc*clamp(1-Math.pow(d/s.K.range,1.3),.08,1)*(moving?.55:1)*(s.supp>0?.6:1),ty;
  if(isP){ty=P.y+lerp(1.25,.8,P.crouch);p*=(P.crouch>.5?.68:1)*(P.speed>6?.6:P.speed>2?.82:1)*(P.ground?1:.7)*(s.vis===1?.35:1)*G.diff;}
  else if(t.remote){ty=chestY(t);p*=(t.crouch>.5?.68:1)*(t.speed>6?.6:t.speed>2?.82:1)*(s.vis===1?.35:1)*G.diff;} // another player: judged like the player himself
  else{ty=chestY(t);p*=(t.crouch>.5?.7:1)*((t.cover&&t.phase==='hide')?.15:1)*(s.team===0?.55:.8);}
  if(R()<p){tracer(mx,my,mz,t.x,ty,t.z,0xffd27a);const dmg=s.K.dmg*R2(.8,1.2);if(isP)hurt(dmg,s.x,s.z);else{const r=R();bloodPuff(t.x,ty,t.z);damageSoldier(t,dmg,r<.1?0:r<.78?1:2,s.x,s.z,false,false,null);}
    if(MP.host)coFoeShot(s,t.x,ty,t.z,t,1);}
  else{const off=R2(.5,1.8)*(R()<.5?-1:1),bx0=t.x-mx,bz0=t.z-mz,l=Math.hypot(bx0,bz0)||1;let dx=bx0-bz0/l*off,dy=ty+R2(-.5,.9)-my,dz=bz0+bx0/l*off;
    const n=Math.hypot(dx,dy,dz)||1;dx/=n;dy/=n;dz/=n;const tt=rayWorld(mx,my,mz,dx,dy,dz,l+45),hx=mx+dx*tt,hy=my+dy*tt,hz=mz+dz*tt;
    if(R()<.6)tracer(mx,my,mz,hx,hy,hz,0xffd27a);if(tt<l+45&&Math.hypot(hx-P.x,hz-P.z)<45)dust(hx,hy,hz,1);if(MP.host)coFoeShot(s,hx,hy,hz,t,0);
    if(isP&&R()<.5){sndWhiz();G.supp=Math.min(1,G.supp+.22);}}}
function tryShoot(s,t,dt,d,moving){if(s.reactT>0){s.reactT-=dt;return;}
  if(s.burst>0){s.burstT-=dt;if(s.burstT<=0){s.burst--;s.burstT=s.K.rof;shootAt(s,t,d,moving);}}
  else{s.shootT-=dt;if(s.shootT<=0){const b=s.K.burst;s.burst=b[0]+Math.floor(R()*(b[1]-b[0]+1));s.burstT=0;s.shootT=R2(s.K.pause[0],s.K.pause[1])*(s.supp>0?1.6:1);}}}
// look for a spot near (cx,cz) that hides a crouching soldier from the target but lets him shoot by standing or stepping out
function findCover(s,tx,tz,cx,cz){const ci=Math.floor((cx-NX0)/CELL),cj=Math.floor((cz-NZ0)/CELL),cand=[];
  for(let oj=-4;oj<=4;oj++)for(let oi=-4;oi<=4;oi++){const i=ci+oi,j=cj+oj;if(i<1||j<1||i>=NW-1||j>=NH-1)continue;const n=j*NW+i;if(blocked[n]||coverTaken.has(n))continue;
    const x=NX0+(i+.5)*CELL,z=NZ0+(j+.5)*CELL,dx=tx-x,dz=tz-z,d=Math.hypot(dx,dz);if(d<9||d>s.K.range*.8)continue;
    const n1=cellOf(x+dx/d*CELL*1.15,z+dz/d*CELL*1.15);if(n1<0||!blocked[n1])continue;
    cand.push({x,z,n,ux:dx/d,uz:dz/d,sc:-Math.hypot(x-s.x,z-s.z)-Math.abs(d-s.K.pref)*.25});}
  cand.sort((a,b)=>b.sc-a.sc);
  for(let k=0;k<cand.length&&k<5;k++){const c=cand[k];if(los(c.x,.92,c.z,tx,1.25,tz))continue;
    if(los(c.x,1.55,c.z,tx,1.25,tz))return{x:c.x,z:c.z,n:c.n,low:true,px:c.x,pz:c.z};
    for(const sd of [-1,1]){const px=c.x-c.uz*sd*CELL,pz=c.z+c.ux*sd*CELL,pn=cellOf(px,pz);if(pn>=0&&!blocked[pn]&&los(px,1.55,pz,tx,1.25,tz))return{x:c.x,z:c.z,n:c.n,low:false,px,pz};}}
  return null;}
