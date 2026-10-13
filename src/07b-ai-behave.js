// =====================================================================
// 07b AI BEHAVIOUR: guards, hunters, cover fighters, raiders, heavies, rooftop marksmen, squadmates
// =====================================================================
function coverCycle(s,t,dt,vis,d,canFire){const c=s.cover,K=s.K;
  if(s.phase==='move'){const dd=moveToward(s,c.x,c.z,K.spd*1.15,null);s.wantCrouch=false;s.moveT=(s.moveT||0)+dt;
    if(dd<.8){s.phase='hide';s.phaseT=R2(.4,1.2);s.moveT=0;}else if(s.moveT>6||(s.stuckN||0)>2){dropCover(s);s.coverT=1.5;s.moveT=0;s.stuckN=0;return;}
    if(vis&&canFire&&d<K.range)tryShoot(s,t,dt,d,true);}
  else if(s.phase==='hide'){s.wantCrouch=true;if(!c.low)moveToward(s,c.x,c.z,K.spd,null);s.phaseT-=dt*(s.supp>0?.45:1);
    if(s.phaseT<=0){s.phase='peek';s.phaseT=R2(1.2,2.5);s.burst=0;s.shootT=R2(.25,.5);}}
  else{s.wantCrouch=false;if(!c.low)moveToward(s,c.px,c.pz,K.spd,null);if(vis&&canFire&&s.crouch<.4)tryShoot(s,t,dt,d,false);
    s.phaseT-=dt;if(s.phaseT<=0&&s.burst<=0){s.phase='hide';s.phaseT=R2(1,2.6);}}}
function combat(s,t,dt,vis){const dx=t.x-s.x,dz=t.z-s.z,d=Math.hypot(dx,dz)||.01,K=s.K;s.lowered=false;
  const off=face(s,t.x,t.z,dt,s.kind==='heavy'?3:7),canFire=off<.25&&s.flinch<=0;
  s.aimP=clamp(Math.atan2((t===P?P.y+1.2:chestY(t))-(s.y0+1.3),d),-.6,.6);
  if(s.kind==='rush'){s.wantCrouch=false;s.strafeT-=dt;if(s.strafeT<=0){s.strafeT=R2(.5,1.2);s.strafe=-s.strafe;}
    if(d>7){moveToward(s,t.x,t.z,K.spd,vis?null:FE);s.mx+=-dz/d*s.strafe*.5;s.mz+=dx/d*s.strafe*.5;}else{s.mx=-dz/d*s.strafe;s.mz=dx/d*s.strafe;s.spd=2.4;}
    if(vis&&canFire&&d<K.range)tryShoot(s,t,dt,d,true);return;}
  if(s.kind==='heavy'){s.wantCrouch=false;if(d>16)moveToward(s,t.x,t.z,K.spd*(s.burst>0?.5:1),vis?null:FE);if(vis&&canFire&&d<K.range)tryShoot(s,t,dt,d,false);return;}
  if(s.coverT>0)s.coverT-=dt;s.pushT-=dt;
  if(s.cover&&(s.flanked||s.pushT<=0&&d>K.pref+6)){dropCover(s);s.coverT=.3;}
  if(!s.cover&&s.coverT<=0&&vis){if(G.budget>0){G.budget--;const push=s.pushT<=0&&d>K.pref,c=findCover(s,t.x,t.z,push?s.x+dx/d*11:s.x,push?s.z+dz/d*11:s.z);
      s.coverT=c?R2(9,15):1.4;if(s.pushT<=0)s.pushT=R2(8,14);if(c){s.cover=c;coverTaken.add(c.n);s.phase='move';s.moveT=0;}}}
  if(s.cover){coverCycle(s,t,dt,vis,d,canFire);}
  else{s.wantCrouch=d>12;s.strafeT-=dt;if(s.strafeT<=0){s.strafeT=R2(1,2.5);s.strafe=R()<.4?0:(R()<.5?-1:1);}
    if(d>K.pref+14){moveToward(s,t.x,t.z,K.spd,vis?null:FE);s.wantCrouch=false;}else if(s.strafe){s.mx=-dz/d*s.strafe;s.mz=dx/d*s.strafe;s.spd=1.6;}
    if(vis&&canFire&&d<K.range)tryShoot(s,t,dt,d,s.spd>0);}
  // a rifleman lobs a grenade at a player who stays put behind cover
  s.nadeT-=dt;if(t===P&&s.nadeT<=0&&G.nadeCD<=0&&P.stillT>5&&d>12&&d<36&&s.y0<.5&&s.flinch<=0){s.nadeT=R2(14,22);G.nadeCD=12;const Tm=1.35,ex=R2(-1.6,1.6),ez=R2(-1.6,1.6);
    const gn=spawnNade(s.x,1.5,s.z,(P.x+ex-s.x)/Tm,(P.y-1.5+.5*14*Tm*Tm)/Tm,(P.z+ez-s.z)/Tm,2.9,false);if(MP.on)mpNade(gn);if(allies.some(a=>a.alive))radio(allies.find(a=>a.alive).name,'Grenade! Move!');}}
function hunt(s,dt){s.wantCrouch=false;s.lowered=false;s.aimP=0;const shared=G.lkp.age<22,gx=shared?G.lkp.x:s.lkx,gz=shared?G.lkp.z:s.lkz,d=Math.hypot(gx-s.x,gz-s.z);
  if(s.goal){const dd=moveToward(s,s.goal.x,s.goal.z,s.K.spd*.7,null);s.goalT-=dt;if(dd<1.5||s.goalT<=0)s.goal=null;else face(s,s.x+s.mx*3,s.z+s.mz*3,dt,5);}
  else if(d>9){moveToward(s,gx,gz,s.K.spd*(s.kind==='rush'?1:.85),(shared&&FE.n>0)?FE:null);face(s,s.x+s.mx*3,s.z+s.mz*3,dt,5);}
  else{s.searchT-=dt;s.yaw+=dt*1.3;s.g.rotation.y=s.yaw;if(s.searchT<=0){s.searchT=R2(1.5,3);const a=R()*TAU,r=R2(8,22),x=gx+Math.cos(a)*r,z=gz+Math.sin(a)*r;if(freeSpot(x,z)){s.goal={x,z};s.goalT=6;}}}}
function updFoe(s,dt){if(s.flinch>0)s.flinch-=dt;if(s.supp>0)s.supp-=dt;if(s.revealT>0)s.revealT-=dt;
  s.percT-=dt;if(s.percT<=0){s.percT=.22;percFoe(s,.22);}
  s.mx=0;s.mz=0;s.spd=0;const t=s.target,ok=t&&(t===P?P.alive:t.alive),vis=ok&&s.seeT<.3;
  if(!s.aware){s.wantCrouch=false;s.lowered=true;s.patrolT-=dt;
    if(s.post2){if(s.patrolT<=0){const g=s.goingBack?s.post:s.post2,dd=moveToward(s,g.x,g.z,1.5,null);if(dd<1){s.goingBack=!s.goingBack;s.patrolT=R2(2,6);}else face(s,s.x+s.mx*3,s.z+s.mz*3,dt,3);}}
    else{if(s.patrolT<=0){s.patrolT=R2(2,5);s.lookYaw=s.yaw+R2(-1.2,1.2);}if(s.lookYaw!==undefined){s.yaw+=clamp(angDiff(s.lookYaw,s.yaw),-dt,dt);s.g.rotation.y=s.yaw;}}}
  else if(ok&&(vis||(s.cover&&s.seeT<7)))combat(s,t,dt,vis);
  else{if(s.cover)dropCover(s);hunt(s,dt);}
  s.crouch+=clamp((s.wantCrouch?1:0)-s.crouch,-dt*4.5,dt*4.5);stepSoldier(s,dt);animSoldier(s,dt);}
const laserMat=new T.LineBasicMaterial({color:0xff3b2e,transparent:true,opacity:.55});
function updMark(s,dt){if(s.flinch>0)s.flinch-=dt;if(s.revealT>0)s.revealT-=dt;s.percT-=dt;if(s.percT<=0){s.percT=.2;percFoe(s,.2);}
  const t=s.target,vis=t&&(t===P?P.alive:t.alive)&&s.seeT<.3;s.lowered=!s.aware;
  if(vis){const d=Math.hypot(t.x-s.x,t.z-s.z),ty=t===P?P.y+lerp(1.25,.8,P.crouch):chestY(t),off=face(s,t.x,t.z,dt,4);s.wantCrouch=false;
    s.aimP=clamp(Math.atan2(ty-(s.y0+1.4),d),-1,.5);if(off<.2&&s.flinch<=0)s.aimT+=dt;
    const fx=-Math.sin(s.yaw),fz=-Math.cos(s.yaw),mx=s.x+fx*.85,my=s.y0+1.4,mz=s.z+fz*.85;
    if(s.aimT>.25){if(!s.laser){const g=new T.BufferGeometry();g.setAttribute('position',new T.BufferAttribute(new Float32Array(6),3));s.laser=new T.Line(g,laserMat);s.laser.frustumCulled=false;scene.add(s.laser);}
      const a=s.laser.geometry.attributes.position;a.setXYZ(0,mx,my,mz);a.setXYZ(1,t.x,ty,t.z);a.needsUpdate=true;s.laser.visible=true;s.revealT=1;}
    if(s.aimT>(s.aimNeed||2)){s.aimT=0;s.aimNeed=R2(1.9,2.6);s.revealT=3;sndShot('dmr',s.x,s.z,false);puff(mx,my,mz,0xffc45a,.4,.08,.06,1,0,0,0,true);
      let p;if(t===P)p=.82*(P.speed>6?.3:P.speed>2.5?.55:1)*(P.crouch>.5?.85:1)*(s.vis===1?.5:1)*clamp(1.15-d/200,.4,1)*G.diff;
      else if(t.remote)p=.82*(t.speed>6?.3:t.speed>2.5?.55:1)*(t.crouch>.5?.85:1)*(s.vis===1?.5:1)*clamp(1.15-d/200,.4,1)*G.diff;else p=.5;
      if(R()<p){tracer(mx,my,mz,t.x,ty,t.z,0xfff6d0);if(t===P)hurt(s.K.dmg*R2(.9,1.1),s.x,s.z);else damageSoldier(t,s.K.dmg,1,s.x,s.z,false,false,null);if(MP.host)coFoeShot(s,t.x,ty,t.z,t,1);}
      else{let dx=t.x+R2(-1,1)-mx,dy=ty+R2(-.4,.8)-my,dz=t.z+R2(-1,1)-mz;const l=Math.hypot(dx,dy,dz);dx/=l;dy/=l;dz/=l;const tt=rayWorld(mx,my,mz,dx,dy,dz,l+40);
        tracer(mx,my,mz,mx+dx*tt,my+dy*tt,mz+dz*tt,0xfff6d0);dust(mx+dx*tt,my+dy*tt,mz+dz*tt,2);if(t===P)sndWhiz();if(MP.host)coFoeShot(s,mx+dx*tt,my+dy*tt,mz+dz*tt,t,0);}}}
  else{s.aimT=Math.max(0,s.aimT-dt*2);if(s.laser)s.laser.visible=false;s.wantCrouch=s.aware&&s.seeT>1.5;s.aimP=0;if(!s.aware||s.seeT>4){s.yaw+=Math.sin(G.time*.4+s.ph)*dt*.5;s.g.rotation.y=s.yaw;}
    else face(s,s.lkx,s.lkz,dt,2);}
  s.crouch+=clamp((s.wantCrouch?1:0)-s.crouch,-dt*4.5,dt*4.5);s.moveAmt=0;animSoldier(s,dt);}
function updAlly(s,dt,idx){
  if(s.down){s.downT-=dt*(Math.hypot(P.x-s.x,P.z-s.z)<3.5?3:1);s.crouch=Math.min(1,s.crouch+dt*4);s.lowered=true;s.moveAmt=0;s.up.rotation.z=.5;animSoldier(s,dt);
    if(s.downT<=0){s.down=false;s.alive=true;s.hp=s.maxHp*.6;s.up.rotation.z=0;radio(s.name,'Back in the fight.');}return;}
  if(s.flinch>0)s.flinch-=dt;if(s.hp<s.maxHp)s.hp=Math.min(s.maxHp,s.hp+5*dt);
  s.percT-=dt;if(s.percT<=0){s.percT=.25;percAlly(s,.25);}
  s.mx=0;s.mz=0;s.spd=0;const t=s.target,vis=t&&t.alive&&s.seeT<.35,pd=Math.hypot(P.x-s.x,P.z-s.z);
  if(pd>95){const bx=P.x+Math.sin(P.yaw)*9+R2(-3,3),bz=P.z+Math.cos(P.yaw)*9+R2(-3,3);if(freeSpot(bx,bz)){s.x=bx;s.z=bz;}}
  if(vis&&pd<48){const d=Math.hypot(t.x-s.x,t.z-s.z),off=face(s,t.x,t.z,dt,7);s.lowered=false;s.wantCrouch=d>10;s.aimP=clamp(Math.atan2(chestY(t)-(s.y0+1.3),d),-.6,.8);
    if(off<.25&&s.flinch<=0)tryShoot(s,t,dt,d,false);}
  else{const side=idx?1:-1,back=idx?4.8:3.2,cy=Math.cos(P.yaw),sy=Math.sin(P.yaw),gx=P.x+sy*back+cy*side*2.4,gz=P.z+cy*back-sy*side*2.4,d=Math.hypot(gx-s.x,gz-s.z);
    s.aimP=0;s.lowered=G.lkp.age>8;
    if(d>2.2){s.wantCrouch=false;moveToward(s,gx,gz,d>14?7.4:d>6?5.2:3.2,(d>9&&FA.n>0)?FA:null);face(s,s.x+s.mx*3,s.z+s.mz*3,dt,6);}
    else{s.wantCrouch=P.crouch>.5;s.yaw+=clamp(angDiff(P.yaw+side*.5,s.yaw),-dt*2,dt*2);s.g.rotation.y=s.yaw;}}
  s.crouch+=clamp((s.wantCrouch?1:0)-s.crouch,-dt*4.5,dt*4.5);stepSoldier(s,dt);animSoldier(s,dt);}
function updCorpse(s,dt){s.deadT+=dt;const k=Math.min(1,s.deadT/.42),e=k*k*(3-2*k);s.g.rotation.x=s.fall*e*1.5;s.g.position.y=s.y0+e*.13;
  s.aL.rotation.set(.4,0,-e*1.1);s.aR.rotation.set(.3,0,e*.9);s.fL.rotation.x=.2;s.fR.rotation.x=.3;s.lL.rotation.x=e*.3;s.kR.rotation.x=-e*.7;s.up.rotation.x=0;return s.deadT<1.2;}
function clearSoldiers(){for(const s of foes){removeSoldier(s);if(s.laser)scene.remove(s.laser);}foes.length=0;for(const s of corpses)removeSoldier(s);corpses.length=0;coverTaken.clear();}
function updAI(dt){G.budget=2;G.lkp.age+=dt;if(G.nadeCD>0)G.nadeCD-=dt;if(G.calloutT>0)G.calloutT-=dt;if(G.supp>0)G.supp=Math.max(0,G.supp-dt*.5);
  let hunters=0;for(let k=0;k<foes.length;k++){const s=foes[k];if(s.alive&&s.aware&&!s.isStatic)hunters++;}
  if(hunters&&G.lkp.age>13){const H=humans();if(H.length){const h=RP(H);G.lkp.x=h.x+R2(-14,14);G.lkp.z=h.z+R2(-14,14);G.lkp.age=5;}}
  feT-=dt;if(feT<=0&&hunters){feT=.5;flow(FE,G.lkp.x,G.lkp.z,110);}
  faT-=dt;if(faT<=0&&allies.length){faT=.5;flow(FA,P.x,P.z,60);}
  for(let k=foes.length-1;k>=0;k--){const s=foes[k];
    if(!s.alive){if(!updCorpse(s,dt)){foes.splice(k,1);corpses.push(s);if(corpses.length>10)removeSoldier(corpses.shift());}continue;}
    if(s.isStatic)updMark(s,dt);else updFoe(s,dt);}
  for(let k=0;k<allies.length;k++)updAlly(allies[k],dt,k);}
