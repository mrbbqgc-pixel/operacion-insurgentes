// =====================================================================
// 06b PLAYER: movement, stance, stamina, aiming, firing, recoil, reload, grenades, knife, damage
// =====================================================================
const P={x:3.5,z:446,y:0,vx:0,vz:0,vy:0,yaw:0,pitch:0,hp:100,stam:1,stamT:0,crouching:false,crouch:0,sprinting:false,ads:0,wantAds:false,bob:0,stepD:0,
  recoil:0,bloom:0,hurtT:9,fireT:0,reloading:false,reloadT:0,swapT:0,swapTo:-1,meleeT:0,meleeHit:true,nadeT:0,nades:3,slots:[],cur:0,ground:true,speed:0,
  roll:0,punch:0,alive:true,sprintLock:0,kick:0,flashT:0,autoRl:0,stillT:0,stillX:0,stillZ:0,deadT:0,sens:1,baseFov:74};
const IN={f:0,s:0,fire:false,firePressed:false,touchFire:false,sprint:false,jump:false,crouchT:false,reload:false,swap:false,nade:false,melee:false,use:false,useHeld:false};
const curW=()=>P.slots[P.cur],curD=()=>WDEF[P.slots[P.cur].id];
function giveLoadout(){P.slots=[{id:'m4',mag:30,res:150},{id:'pistol',mag:15,res:45}];P.cur=0;P.nades=3;showWeapon();}
function showWeapon(){const id=curW().id;for(const k in VM)VM[k].visible=k===id;flash.position.set(0,.02,WDEF[id].mz-.06);}
function lookDir(){const cp=Math.cos(P.pitch);return[-Math.sin(P.yaw)*cp,Math.sin(P.pitch),-Math.cos(P.yaw)*cp];}
function toast(t,d){G.toasts.push({t,d:d||1.6});if(G.toasts.length>3)G.toasts.shift();}
function curSpread(D){const mv=clamp(P.speed/5.2,0,1.5);
  return(lerp(D.hip,D.ads,P.ads)*(P.crouch>.5?.72:1))+D.hip*1.2*mv*(1-P.ads*.65)+(P.ground?0:.05)+P.bloom*(1-P.ads*.55);}
function cancelReload(){P.reloading=false;P.reloadT=0;}
function startReload(){const w=curW(),D=WDEF[w.id];if(P.reloading||w.mag>=D.mag||w.res<=0||P.swapT>0||P.meleeT>0)return;
  P.reloading=true;P.reloadT=D.shell?D.reload:(w.mag===0?D.reload*1.12:D.reload);sndUi('mag');}
function finishReload(){const w=curW(),D=WDEF[w.id];
  if(D.shell){w.mag++;w.res--;sndUi('click');if(w.mag<D.mag&&w.res>0){P.reloadT=D.reload;return;}}
  else{const n=Math.min(D.mag-w.mag,w.res);w.mag+=n;w.res-=n;sndUi('mag');}
  P.reloading=false;}
const muz=new T.Vector3();
function fire(){const w=curW(),D=WDEF[w.id];if(P.swapT>0||P.meleeT>0||P.fireT>0)return;
  if(P.reloading){if(D.shell&&w.mag>0)P.reloading=false;else return;}
  if(P.sprinting){P.sprinting=false;P.sprintLock=.3;P.fireT=.14;return;}
  if(w.mag<=0){if(w.res>0)startReload();else{sndUi('empty');P.fireT=.3;toast('NO AMMO. SWAP WEAPON');}return;}
  w.mag--;P.fireT=D.rate;G.stats.shots++;P.spawnT=0;
  const f=lookDir(),spread=curSpread(D),ox=camera.position.x,oy=camera.position.y,oz=camera.position.z;
  camera.updateMatrixWorld();muz.set(0,.02,D.mz);gunRoot.localToWorld(muz);
  let any=false;
  for(let k=0;k<D.pellets;k++){let dx=f[0]+R2(-spread,spread),dy=f[1]+R2(-spread,spread),dz=f[2]+R2(-spread,spread);const l=Math.hypot(dx,dy,dz);dx/=l;dy/=l;dz/=l;
    const tw=rayWorld(ox,oy,oz,dx,dy,dz,320),wc=RHc,nx=RHnx,ny=RHny,nzz=RHnz,hs=raySoldiers(hostList(),ox,oy,oz,dx,dy,dz,tw),t=hs?RS.t:tw,hx=ox+dx*t,hy=oy+dy*t,hz=oz+dz*t;
    if(k%3===0){tracer(muz.x,muz.y,muz.z,hx,hy,hz,0xfff0b0);if(MP.on)mpShot(hx,hy,hz);}
    if(hs){const fall=lerp(1,D.rng[2],clamp((t-D.rng[0])/(D.rng[1]-D.rng[0]),0,1));bloodPuff(hx,hy,hz);any=true;
      damageSoldier(hs,D.dmg*fall,RS.zone,P.x,P.z,true,false,D);}
    else if(tw<320){if(wc&&wc.kind>=2&&wc.kind<=4){spark(hx,hy,hz);damageProp(wc,D.dmg);}else{dust(hx,hy,hz,1);if(!wc||wc.kind<2||wc.kind===5)decal(hx,hy,hz,nx,ny,nzz,R2(.1,.16));}}
    if(k===0)for(let i=0;i<foes.length;i++){const s=foes[i];if(!s.alive)continue;const px=s.x-ox,py=chestY(s)-oy,pz=s.z-oz,along=px*dx+py*dy+pz*dz;
      if(along>0&&along<t+2){const d2=px*px+py*py+pz*pz-along*along;if(d2<3.2)s.supp=1.5;}}}
  if(any)G.stats.hits++;
  const kk=D.kick*(1-P.ads*.3)*(P.crouch>.5?.8:1);P.pitch=Math.min(1.5,P.pitch+kk);P.recoil+=kk*.62;P.yaw+=(R()-.5)*2*D.kickH*(1-P.ads*.3);
  P.bloom=Math.min(.05,P.bloom+D.hip*.2);P.kick=Math.min(1,P.kick+.45+D.kick*9);P.flashT=.05;flash.material.rotation=R()*TAU;lightAt(muz.x,muz.y,muz.z,1.5,.06);
  sndShot(D.snd,0,0,true);
  if(!D.shell){const rx=Math.cos(P.yaw),rz=-Math.sin(P.yaw);bit(ox+f[0]*.35+rx*.16,oy-.1,oz+f[2]*.35+rz*.16,rx*R2(1.5,2.6)+P.vx,R2(1.5,2.6),rz*R2(1.5,2.6)+P.vz,.02,.02,.055,brass,2.4);}
  noiseEvent(P.x,P.z,90,true);if(w.mag===0&&w.res>0&&!D.shell)P.autoRl=.3;}
function meleeStrike(){const f=lookDir();let best=null,bd=2.4;
  for(const s of hostList()){if(!s.alive)continue;const dx=s.x-P.x,dz=s.z-P.z,d=Math.hypot(dx,dz);if(d<bd&&Math.abs(s.y0-P.y)<1.5&&(dx*f[0]+dz*f[2])/(d||1)>.55){bd=d;best=s;}}
  if(best){bloodPuff(best.x,chestY(best),best.z);damageSoldier(best,220,1,P.x,P.z,true,false,null);G.stats.hits++;}}
function throwNade(){if(P.nades<=0||P.nadeT>0||P.swapT>0)return;P.nades--;P.nadeT=1;const f=lookDir(),rx=Math.cos(P.yaw),rz=-Math.sin(P.yaw);
  const n=spawnNade(camera.position.x+f[0]*.5+rx*.2,camera.position.y-.1+f[1]*.5,camera.position.z+f[2]*.5+rz*.2,f[0]*16+P.vx*.5,f[1]*16+4.2,f[2]*16+P.vz*.5,2.5,true);if(MP.on)mpNade(n);sndUi('pin');P.kick=Math.min(1,P.kick+.6);}
function hurt(dmg,sx,sz){if(G.state!=='play'||!P.alive||(MP.on&&P.spawnT>0))return;dmg*=G.dmgK;P.hp-=dmg;P.hurtT=0;G.vig=Math.min(1,.35+dmg/40);P.punch+=R2(.008,.022)*Math.min(3,dmg/12);P.roll+=R2(-.03,.03);
  G.arcs.push({x:sx,z:sz,t:1.3});if(G.arcs.length>3)G.arcs.shift();sndUi('hurt');if(P.hp<=0){P.hp=0;P.alive=false;P.deadT=0;G.stats.deaths++;onPlayerDeath();}}
function takeWeapon(p){const w=curW();if(P.swapT>0)return;cancelReload();addPick('w',P.x+R2(-.6,.6),P.z+R2(-.6,.6),{id:w.id,mag:w.mag,res:w.res,life:90});
  P.slots[P.cur]={id:p.id,mag:p.mag,res:p.res};scene.remove(p.m);picks.splice(picks.indexOf(p),1);showWeapon();P.swapT=.3;P.swapTo=-1;sndUi('pick');toast(WDEF[p.id].name);}
function resupply(){for(const w of P.slots){const D=WDEF[w.id];w.mag=D.mag;w.res=Math.max(w.res,Math.round(D.max*.72));}P.nades=Math.max(P.nades,3);P.hp=100;sndUi('pick');toast('RESUPPLIED');}
function updPicks(dt){let near=null,nd=1.9;
  for(let k=picks.length-1;k>=0;k--){const p=picks[k];p.t-=dt;if(p.kind!=='crate'){p.m.rotation.y+=dt*1.6;p.m.position.y=.5+Math.sin(G.time*3+k)*.07;}
    const d=Math.hypot(p.x-P.x,p.z-P.z);let take=false;
    if(d<1.6&&P.alive){
      if(p.kind==='med'){if(P.hp<100){P.hp=Math.min(100,P.hp+50);toast('+50 HP');take=true;}}
      else if(p.kind==='ammo'){for(const w of P.slots){const D=WDEF[w.id];w.res=Math.min(D.max,w.res+D.mag*2);}toast('+AMMO');take=true;}
      else if(p.kind==='nade'){if(P.nades<4){P.nades++;toast('+GRENADE');take=true;}}
      else if(p.kind==='crate'){resupply();take=true;}
      else if(p.kind==='w'){const same=P.slots.find(w=>w.id===p.id);
        if(same){const D=WDEF[p.id],add=p.mag+p.res;if(same.res<D.max&&add>0){same.res=Math.min(D.max,same.res+add);toast('+'+D.name+' AMMO');take=true;}}
        else if(d<nd){nd=d;near=p;}}}
    if(take){sndUi('pick');scene.remove(p.m);picks.splice(k,1);}else if(p.t<=0){scene.remove(p.m);picks.splice(k,1);}}
  if(near){G.prompt='<b>'+(isTouch?'USE':'F')+'</b> swap '+curD().name+' for '+WDEF[near.id].name;if(IN.use){IN.use=false;takeWeapon(near);}}}
// touch only: the view is drawn gently towards a hostile that is already close to the sights
function aimAssist(dt){P.asT=(P.asT||0)-dt;const cx=camera.position.x,cy=camera.position.y,cz=camera.position.z;
  if(P.asT<=0){P.asT=.12;P.asTgt=null;const f=lookDir(),HL=hostList();let best=.13;for(let k=0;k<HL.length;k++){const s=HL[k];if(!s.alive)continue;const dx=s.x-cx,dy=chestY(s)-cy,dz=s.z-cz,d=Math.hypot(dx,dy,dz);if(d>75||d<1)continue;
      const ang=Math.acos(clamp((dx*f[0]+dy*f[1]+dz*f[2])/d,-1,1));if(ang<best&&los(cx,cy,cz,s.x,chestY(s),s.z)){best=ang;P.asTgt=s;}}}
  const s=P.asTgt;if(s&&s.alive){const dx=s.x-cx,dz=s.z-cz,d=Math.hypot(dx,dz),k=Math.min(1,dt*(IN.fire||P.ads>.5?3.2:1.5));P.yaw+=angDiff(Math.atan2(-dx,-dz),P.yaw)*k;P.pitch+=(Math.atan2(chestY(s)-cy,d)-P.pitch)*k;}}
function updPlayer(dt){const w=curW(),D=WDEF[w.id];
  if(IN.crouchT){IN.crouchT=false;P.crouching=!P.crouching;}
  let f=IN.f,s=IN.s;const m=Math.hypot(f,s);if(m>1){f/=m;s/=m;}
  if(P.sprintLock>0)P.sprintLock-=dt;
  const ws=IN.sprint&&f>.6&&!P.wantAds&&P.ground&&P.sprintLock<=0&&P.stam>(P.sprinting?.01:.15);
  P.sprinting=ws;
  if(ws){P.crouching=false;if(P.reloading)cancelReload();P.stam=Math.max(0,P.stam-dt/7);P.stamT=.9;}else if(P.stamT>0)P.stamT-=dt;else P.stam=Math.min(1,P.stam+dt/3.5);
  P.crouch+=clamp((P.crouching?1:0)-P.crouch,-dt*5.5,dt*5.5);
  const canAds=!P.sprinting&&!P.reloading&&P.swapT<=0&&P.meleeT<=0;P.ads+=clamp(((P.wantAds&&canAds)?1:0)-P.ads,-dt/D.adsT,dt/D.adsT);
  let sp=(P.sprinting?7.6:5.1)*D.speed;if(P.crouch>.5)sp=2.7;sp*=1-P.ads*.45;
  const sy=Math.sin(P.yaw),cy=Math.cos(P.yaw),tx=(-sy*f+cy*s)*sp,tz=(-cy*f-sy*s)*sp,acc=(P.ground?55:9)*dt;
  let ax=tx-P.vx,az=tz-P.vz;const al=Math.hypot(ax,az);if(al>acc){ax*=acc/al;az*=acc/al;}P.vx+=ax;P.vz+=az;
  const px=P.x,pz=P.z;P.x=clamp(P.x+P.vx*dt,BOUND.x0,BOUND.x1);P.z=clamp(P.z+P.vz*dt,BOUND.z0,BOUND.z1);pushOut(P,.45,P.y);
  const moved=Math.hypot(P.x-px,P.z-pz);P.speed=moved/Math.max(dt,1e-4);
  const fl=floorAt(P.x,P.z,P.y);P.vy-=16*dt;P.y+=P.vy*dt;if(P.y<=fl){P.y=fl;P.vy=0;P.ground=true;}else P.ground=false;
  if(IN.jump){IN.jump=false;if(P.ground){if(P.crouching)P.crouching=false;else{P.vy=5.4;P.ground=false;}}}
  if(P.ground&&moved>0){P.bob+=moved*(P.sprinting?1.9:2.3);P.stepD+=moved;
    if(P.stepD>(P.sprinting?2.6:2.1)){P.stepD=0;sndStep(Math.abs(P.x)<10.5||(P.x>0&&Math.abs(P.z)<5),P.crouch>.5?.05:P.sprinting?.24:.14);if(P.sprinting)noiseEvent(P.x,P.z,14,true);}}
  P.hurtT+=dt;if(P.hurtT>4.5&&P.hp<100)P.hp=Math.min(100,P.hp+20*dt);
  if(isTouch&&G.assist)aimAssist(dt);
  if(Math.hypot(P.x-P.stillX,P.z-P.stillZ)>3.5){P.stillX=P.x;P.stillZ=P.z;P.stillT=0;}else P.stillT+=dt;
  // weapon handling
  P.fireT-=dt;if(P.nadeT>0)P.nadeT-=dt;
  if(IN.swap){IN.swap=false;if(P.swapT<=0&&P.meleeT<=0){cancelReload();P.swapTo=1-P.cur;P.swapT=.42;sndUi('click');}}
  if(P.swapT>0){P.swapT-=dt;if(P.swapTo>=0&&P.swapT<=.21){P.cur=P.swapTo;P.swapTo=-1;showWeapon();}}
  if(IN.reload){IN.reload=false;startReload();}
  if(P.autoRl>0){P.autoRl-=dt;if(P.autoRl<=0&&curW().mag===0)startReload();}
  if(P.reloading){P.reloadT-=dt;if(P.reloadT<=0)finishReload();}
  if(IN.melee){IN.melee=false;if(P.meleeT<=0&&P.swapT<=0){cancelReload();P.meleeT=.5;P.meleeHit=false;sndUi('knife');}}
  if(P.meleeT>0){P.meleeT-=dt;if(!P.meleeHit&&P.meleeT<.36){P.meleeHit=true;meleeStrike();}}
  if(IN.nade){IN.nade=false;throwNade();}
  const D2=curD();let want=false;
  if(IN.fire)want=D2.auto||IN.firePressed||(IN.touchFire&&P.fireT<-D2.rate*.7);
  else if(isTouch&&G.assist&&P.fireT<-(D2.auto?0:D2.rate*.7)){const fd=lookDir(),tw=rayWorld(camera.position.x,camera.position.y,camera.position.z,fd[0],fd[1],fd[2],D2.rng[1]);
    if(raySoldiers(hostList(),camera.position.x,camera.position.y,camera.position.z,fd[0],fd[1],fd[2],tw))want=true;}
  IN.firePressed=false;if(want)fire();
  if(P.recoil>0){const r=Math.min(P.recoil,dt*.42);P.pitch-=r;P.recoil-=r;}
  P.bloom=Math.max(0,P.bloom-dt*.09);P.kick*=Math.exp(-dt*13);P.punch*=Math.exp(-dt*7);P.roll*=Math.exp(-dt*6);
  if(P.flashT>0){P.flashT-=dt;}flash.visible=P.flashT>0&&!(D2.scope&&P.ads>.9);}
function updCamera(dt){const D=curD(),eye=lerp(1.65,1.05,P.crouch),amp=(P.sprinting?.055:.03)*(1-P.ads*.75)*clamp(P.speed/4,0,1);
  camera.position.set(P.x+(shake?R2(-1,1)*shake*.07:0),P.y+eye+Math.sin(P.bob)*amp+(shake?R2(-1,1)*shake*.07:0),P.z+(shake?R2(-1,1)*shake*.07:0));
  camera.rotation.set(P.pitch+P.punch,P.yaw,P.roll+Math.sin(P.bob*.5)*amp*.25);
  const e=P.ads*P.ads*(3-2*P.ads),fov=lerp(P.baseFov+(P.sprinting?4:0),D.adsFov*(P.baseFov>80?1.15:1),e);
  if(Math.abs(camera.fov-fov)>.02){camera.fov+=(fov-camera.fov)*Math.min(1,dt*14);camera.updateProjectionMatrix();}
  // weapon pose: hip to sights, sprint lowers it, reload and swap dip it, knife jabs
  const rl=P.reloading?Math.sin(clamp(1-P.reloadT/(D.shell?D.reload:D.reload*1.05),0,1)*PI):0,sw=P.swapT>0?Math.sin(clamp(P.swapT/.42,0,1)*PI):0,
    spr=P.sprinting?1:0,ml=P.meleeT>0?Math.sin(clamp(P.meleeT/.5,0,1)*PI):0;
  gunRoot.userData.spr=lerp(gunRoot.userData.spr||0,spr,Math.min(1,dt*9));const sp=gunRoot.userData.spr,bobx=Math.cos(P.bob*.5)*amp*.5,boby=Math.sin(P.bob)*amp*.4;
  gunRoot.position.set(lerp(.2,0,e)+bobx*(1-e)+sp*.06-ml*.1,lerp(-.19,-D.sight*.8-.016,e)+boby*(1-e)-rl*.16-sw*.22-sp*.05,lerp(-.42,-.4,e)+P.kick*.07*(1-e*.5)-ml*.22);
  gunRoot.rotation.set(P.kick*.09*(1-e*.6)-rl*.85-sw*.9-sp*.25+ml*.5,sp*.55+ml*.7,rl*.35);
  gunRoot.visible=!(D.scope&&P.ads>.9);}
