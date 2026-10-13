// =====================================================================
// 08d MULTIPLAYER REPLICATION: each player simulates only itself and reports where it is 20 times a second; the host
// gathers the reports into snapshots for everyone. Other players are drawn as soldiers gliding between snapshots.
// Hits are judged on the shooter's screen and applied by the victim, who then announces its own death.
// =====================================================================
const WIDS=['m4','ak','smg','pistol','shotgun','dmr','lmg'],widx=id=>Math.max(0,WIDS.indexOf(id));
const CLS=['m4','ak','smg','shotgun','dmr','lmg'],CLSN=['M4 carbine','AK-47','MP5 submachine gun','M870 shotgun','M14 marksman rifle','M249 machine gun']; // weapon classes offered in Versus
const W_KNIFE=7,W_NADE=8,W_WORLD=9,wName=i=>i===W_KNIFE?'knife':i===W_NADE?'grenade':i===W_WORLD?'':(WDEF[WIDS[i]]?WDEF[WIDS[i]].name:'');

// ---------- the soldiers that stand in for the other players
const tagTex={};
function mpTag(s,name){let t=tagTex[name];if(!t){t=tagTex[name]=tex(256,64,(g,w,h)=>{g.font='700 46px "Saira Condensed","Arial Narrow",Arial,sans-serif';g.textAlign='center';g.textBaseline='middle';
    g.lineWidth=8;g.strokeStyle='rgba(21,17,12,.9)';g.strokeText(name,w/2,h/2,w-12);g.fillStyle='#8ec1e6';g.fillText(name,w/2,h/2,w-12);});}
  const sp=new T.Sprite(new T.SpriteMaterial({map:t,depthTest:false,transparent:true,sizeAttenuation:false}));sp.scale.set(.2,.05,1);sp.position.y=2.6;sp.renderOrder=50;s.g.add(sp);}
function mpPuppet(pl){mpForget(pl);const mate=mpIsMate(pl),
  s=addSoldier(mate?0:1,mate?'ally':'rifle',pl.x,pl.z,{y0:pl.y,yaw:pl.yaw,aware:true,list:mate?MP.mates:MP.rivals,wid:WIDS[pl.w]||'m4',name:pl.name});
  s.remote=true;s.pid=pl.id;s.alive=pl.alive;s.g.visible=pl.alive;s.lowered=false;s.speed=0;s.revealT=0;if(mate)mpTag(s,pl.name);pl.s=s;return s;}
function mpForget(pl){const s=pl&&pl.s;if(!s)return;removeSoldier(s);let i=MP.rivals.indexOf(s);if(i>=0)MP.rivals.splice(i,1);i=MP.mates.indexOf(s);if(i>=0)MP.mates.splice(i,1);pl.s=null;}
// after the teams change, every stand-in must wear the right uniform and sit in the right list
function mpRelist(){for(const pl of MP.players.values()){if(pl.id===MP.me)continue;const s=pl.s;if(!s||(s.team===0)!==mpIsMate(pl))mpPuppet(pl);}}
function mpPuppetUp(pl){const s=pl.s;if(!s)return;s.alive=true;s.deadT=0;s.g.visible=true;s.g.rotation.x=0;s.wp.scale.setScalar(1);s.flinch=0;s.crouch=0;s.up.rotation.z=0;}
function mpPuppetDown(pl){const s=pl.s;if(!s||!s.alive)return;s.alive=false;s.deadT=0;s.fall=R()<.5?1:-1;s.wp.scale.setScalar(.001);}
function mpPuppets(dt){const rt=performance.now()-110;
  for(const pl of MP.players.values()){const s=pl.s;if(!s)continue;if(s.revealT>0)s.revealT-=dt;
    if(!s.alive){if(s.g.visible){if(s.deadT<1.2)updCorpse(s,dt);else{s.deadT+=dt;if(s.deadT>7)s.g.visible=false;}}continue;}
    const b=pl.buf;if(!b.length)continue;let i=b.length-1;while(i>0&&b[i-1].t>rt)i--;const c=b[i],a=b[i>0?i-1:0];
    const k=c.t>a.t?clamp((rt-a.t)/(c.t-a.t),0,1.7):1,x=a.x+(c.x-a.x)*k,y=a.y+(c.y-a.y)*k,z=a.z+(c.z-a.z)*k,yaw=a.yaw+angDiff(c.yaw,a.yaw)*k,pitch=a.pitch+(c.pitch-a.pitch)*k;
    const moved=Math.hypot(x-s.x,z-s.z),sp=moved/Math.max(dt,1e-4);s.x=x;s.z=z;s.y0=y;s.yaw=yaw;s.speed=sp;
    s.crouch+=clamp(((pl.fl&2)?1:0)-s.crouch,-dt*5.5,dt*5.5);s.run=!!(pl.fl&4);s.lowered=s.run;s.aimP=clamp(pitch,-.9,.9);
    s.moveAmt=lerp(s.moveAmt,clamp(sp/3,0,1),Math.min(1,dt*10));
    if(moved>0&&moved<3){s.ph+=moved*(s.run?2.1:2.6);s.stepD+=moved;if(s.stepD>2.4){s.stepD=0;sndStepAt(x,z);}}
    if(s.flinch>0)s.flinch-=dt;animSoldier(s,dt);s.g.position.set(x,y,z);s.g.rotation.y=yaw;}}

// ---------- my own state, 20 times a second
// flags: 1 alive, 2 crouched, 4 sprinting, 8 aiming, 16 fired a moment ago, 32 reloading, 64 holding USE, 128 on the ground, 256 just spawned
function mpPack(){const fl=(P.alive?1:0)|(P.crouch>.5?2:0)|(P.sprinting?4:0)|(P.ads>.5?8:0)|(MP.fireT>0?16:0)|(P.reloading?32:0)|(IN.useHeld?64:0)|(P.ground?128:0)|(P.spawnT>0?256:0);
  const a=[Math.round(P.x*100),Math.round(P.y*100),Math.round(P.z*100),Math.round(angDiff(P.yaw,0)*1000),Math.round(P.pitch*1000),fl,widx(curW().id),Math.max(0,Math.round(P.hp))];
  if(MP.myShots.length){a.push(MP.myShots);MP.myShots=[];}else a.push(0);return a;}
// a shot of mine, for the others to see and hear: where the round ended up
function mpShot(hx,hy,hz){MP.fireT=.4;if(MP.myShots.length<6)MP.myShots.push([Math.round(hx*10),Math.round(hy*10),Math.round(hz*10)]);}
// Every number that arrives is checked and bounded before it is used or passed on: nothing a player sends may stall another player's game.
function mpApply(pl,a,o){const nx=Math.round(+a[o]),ny=Math.round(+a[o+1]),nz=Math.round(+a[o+2]),nyaw=Math.round(+a[o+3]),npi=Math.round(+a[o+4]),was=pl.alive,now=performance.now();
  if(!isFinite(nx)||!isFinite(ny)||!isFinite(nz)||!isFinite(nyaw)||!isFinite(npi))return;
  if(nx<-4e5||nx>4e5||nz<-4e5||nz>4e5||ny<-2000||ny>30000||nyaw<-3300||nyaw>3300||npi<-3300||npi>3300)return;
  let fl=a[o+5]|0;if((fl&1)&&!was&&now-pl.dieT<900)fl&=~1; // a report from before the death that arrived after the news of it
  const x=nx/100,y=ny/100,z=nz/100;
  pl.nx=nx;pl.ny=ny;pl.nz=nz;pl.nyaw=nyaw;pl.npitch=npi;pl.fl=fl;pl.hp=clamp(a[o+7]|0,0,999);pl.alive=!!(fl&1);pl.use=!!(fl&64);
  const w=clamp(a[o+6]|0,0,WIDS.length-1);if(pl.w!==w){pl.w=w;if(pl.s)setSoldierWeapon(pl.s,WIDS[w]);}
  if(pl.alive&&!was){pl.buf.length=0;mpPuppetUp(pl);}else if(!pl.alive&&was)mpPuppetDown(pl);
  pl.buf.push({t:now,x,y,z,yaw:nyaw/1000,pitch:npi/1000});if(pl.buf.length>8)pl.buf.shift();pl.x=x;pl.y=y;pl.z=z;pl.yaw=nyaw/1000;
  const sh=a[o+8];if(Array.isArray(sh)){for(let k=0;k<sh.length&&k<6;k++){const q=sh[k];if(Array.isArray(q)){mpShowShot(pl,q);if(MP.host&&pl.out.length<8)pl.out.push(q);}}
    if(MP.host&&mpMode().coop)noiseEvent(x,z,90,true);}}
function mpShowShot(pl,q){const s=pl.s;if(!s||!s.alive)return;s.revealT=2.5;const now=performance.now(),loud=now-(pl.sndT||0)>55;pl.sndT=now;const hx=+q[0]/10,hy=+q[1]/10,hz=+q[2]/10,fx=-Math.sin(s.yaw),fz=-Math.cos(s.yaw),mx=s.x+fx*.85,my=s.y0+1.36-s.crouch*.42,mz=s.z+fz*.85;
  if(!isFinite(hx+hy+hz)||Math.abs(hx)>5000||Math.abs(hy)>5000||Math.abs(hz)>5000)return;tracer(mx,my,mz,hx,hy,hz,0xfff0b0);if(loud){puff(mx,my,mz,0xffc45a,.26,.06,.05,1,0,0,0,true);sndShot(WIDS[pl.w]||'m4',s.x,s.z,false);}
  if(Math.hypot(hx-P.x,hz-P.z)<40)dust(hx,hy,hz,1);
  // a round that passes close to my head is heard
  const dx=hx-mx,dy=hy-my,dz=hz-mz,l2=dx*dx+dy*dy+dz*dz;if(l2>1&&P.alive&&!mpIsMate(pl)){const ex=P.x-mx,ey=P.y+1.5-my,ez=P.z-mz,u=clamp((ex*dx+ey*dy+ez*dz)/l2,0,1);
    if(u>.02&&Math.hypot(ex-dx*u,ey-dy*u,ez-dz*u)<1.6&&R()<.6){sndWhiz();G.supp=Math.min(1,G.supp+.15);}}}
// host: a guest's report
function mpState(pl,d){const q=d[10]|0;if(q<=pl.seq)return;pl.seq=q;mpApply(pl,d,1);} // reports are numbered: one that was overtaken on the way is dropped
// host: one snapshot for everyone
let snapN=0;
function mpSnap(){const ps=[],me=mpPack();me.unshift(MP.me);ps.push(me);
  for(const pl of MP.players.values()){if(pl.id===MP.me)continue;const a=[pl.id,pl.nx,pl.ny,pl.nz,pl.nyaw,pl.npitch,pl.fl,pl.w,pl.hp];if(pl.out.length){a.push(pl.out);pl.out=[];}ps.push(a);}
  let sc=0;if(++snapN%20===0){sc=Array.from(MP.players.values(),p=>[p.id,p.k,p.d,p.sc]);sc.push([0,MP.tk[1],MP.tk[2],0]);} // id 0: the two teams' totals
  const m=['S',Math.round(MP.tLeft*10),ps,sc,0,0,0,++MP.snapSeq];mpSnapExtra(m);
  for(const pl of MP.players.values())netTx(pl.conn,m);}
// guest: the host's snapshot
function mpSnapshot(d){if(MP.phase!=='play')return;const q=d[7]|0;if(q<=MP.rxSeq)return;MP.rxSeq=q;MP.rxS=performance.now();MP.tLeft=(d[1]|0)/10;const ps=d[2];
  if(Array.isArray(ps))for(let k=0;k<ps.length;k++){const a=ps[k];if(!Array.isArray(a)||a[0]===MP.me)continue;const pl=MP.players.get(a[0]);if(pl)mpApply(pl,a,1);}
  const sc=d[3];if(Array.isArray(sc))for(const a of sc){if(!Array.isArray(a))continue;if(a[0]===0){MP.tk[1]=a[1]|0;MP.tk[2]=a[2]|0;continue;}const pl=MP.players.get(a[0]);if(pl){pl.k=a[1]|0;pl.d=a[2]|0;pl.sc=a[3]|0;}}
  mpSnapExtraRx(d);}

// ---------- hits and deaths
// I hit another player's stand-in: tell that player. The damage is worked out here, on the shooter's side.
function mpHitPlayer(s,dmg,zone,D,explosive){const m=explosive?1:zone===0?Math.min(D?D.head:2,2):zone===2?.75:1;G.hitT=.14;G.hitKill=false;sndUi('hit');s.flinch=.22;
  mpEvent('hit',s.pid,[Math.round(dmg*m),zone,D?widx(curW().id):W_KNIFE,Math.round(P.x),Math.round(P.z)]);}
MPE.hit=(from,a)=>{if(!P.alive||P.spawnT>0||G.state!=='play')return;const pl=MP.players.get(from);if(pl&&mpIsMate(pl))return;
  P.lastBy=from;P.lastHead=a[1]===0;P.lastW=a[2]|0;P.lastT=G.time;hurt(clamp(+a[0]||0,0,400),isFinite(+a[3])?+a[3]:P.x,isFinite(+a[4])?+a[4]:P.z);};
function plReset(){P.vx=P.vz=P.vy=0;P.hp=100;P.alive=true;P.stam=1;P.crouching=false;P.crouch=0;P.ads=0;P.wantAds=false;P.reloading=false;P.swapT=0;P.swapTo=-1;P.meleeT=0;P.recoil=0;P.pitch=0;P.punch=0;P.roll=0;P.hurtT=9;P.bloom=0;P.kick=0;
  IN.fire=false;IN.useHeld=false;IN.jump=IN.crouchT=IN.reload=IN.swap=IN.nade=IN.melee=IN.use=false;} // (a key pressed while down must not act at the respawn)
// I died: say who did it. The host keeps the score.
function mpDied(){const by=(P.lastBy&&G.time-P.lastT<8)?P.lastBy:0,me=mpMe(),kl=MP.players.get(by);P.deadT=0;MP.respT=mpMode().vs?3.5:8;IN.fire=false;P.wantAds=false;
  if(me)me.d++;if(kl&&kl!==me&&!MP.host&&mpMode().vs)mpKill(kl);mpEvent('die',0,[by,by?(P.lastW|0):W_WORLD,by&&P.lastHead?1:0]);
  killFeed('',kl?'Killed by '+kl.name+(wName(P.lastW|0)?' · '+wName(P.lastW|0):''):'You are down');}
// a kill in versus counts for the player and for the team; the team's total stays when that player leaves
function mpKill(k){k.k++;k.sc+=100;if(k.team===1||k.team===2)MP.tk[k.team]++;}
MPH.die=(from,a)=>{const v=MP.players.get(from),k=MP.players.get(a[0]|0);if(v&&from!==MP.me)v.d++;if(k&&k!==v&&mpMode().vs)mpKill(k);mpAfterDeath();};
MPE.die=(from,a)=>{const v=MP.players.get(from),by=a[0]|0,k=MP.players.get(by);if(!v)return;
  v.alive=false;v.fl&=~1;v.dieT=performance.now();mpPuppetDown(v); // the news of a death does not wait for that player's next report
  if(!MP.host){v.d++;if(k&&k!==v&&mpMode().vs)mpKill(k);}
  if(by===MP.me&&mpMode().vs){G.stats.kills++;if(a[2])G.stats.heads++;G.hitT=.3;G.hitKill=true;sndUi('kill');killFeed(a[2]?'HEADSHOT':'KILL',v.name);}
  else killFeed(k&&k!==v?k.name:'',k&&k!==v?'killed '+v.name:v.name+' is down');};
function mpDead(dt){P.deadT+=dt;IN.fire=false;camera.position.y+=(P.y+.35-camera.position.y)*Math.min(1,dt*3);camera.rotation.z+=(.9-camera.rotation.z)*Math.min(1,dt*2.5);gunRoot.visible=false;
  MP.respT-=dt;if(mpMode().vs){if(MP.respT>0)G.prompt='Back in <b>'+Math.ceil(MP.respT)+'</b>';else vsSpawn(false);}else coDead(dt);}

// ---------- grenades, explosions and destructible props
// The thrower's machine owns a grenade: it alone decides where and when it goes off, and tells the others.
function mpNade(n){mpEvent('nade',0,[Math.round(n.x*100),Math.round(n.y*100),Math.round(n.z*100),Math.round(n.vx*100),Math.round(n.vy*100),Math.round(n.vz*100),Math.round(n.fuse*100)]);}
MPE.nade=(from,a)=>{for(let k=0;k<7;k++)if(!isFinite(+a[k]))return;const n=spawnNade(a[0]/100,a[1]/100,a[2]/100,a[3]/100,a[4]/100,a[5]/100,clamp(a[6]/100,.1,6),false);n.rep=true;n.by=from;};
function mpBoom(x,y,z,rad,dmg,ai){mpEvent('boom',0,[Math.round(x*100),Math.round(y*100),Math.round(z*100),Math.round(rad*10),Math.round(dmg),ai?1:0]);} // ai: thrown by a hostile soldier on the host's machine
MPE.boom=(from,a)=>{const x=a[0]/100,y=a[1]/100,z=a[2]/100;if(!isFinite(x+y+z))return;let bi=-1,bd=1e9;
  for(let k=0;k<nades.length;k++){const n=nades[k];if(n.rep&&n.by===from){const d=Math.hypot(n.x-x,n.z-z);if(d<bd){bd=d;bi=k;}}}
  if(bi>=0){scene.remove(nades[bi].m);nades.splice(bi,1);}
  explode(x,y,z,clamp(a[3]/10,1,14),clamp(+a[4]||0,0,260),false,true,a[5]?0:from);};
MPE.pb=(from,a)=>{const c=colliders[a[0]|0];if(c&&c.kind>=2&&c.kind<=4&&c.ref)blowProp(c,true,from);};
// Barrels, fuel pumps and cars that are already gone on one machine (from an earlier round, or a single-player game before this one)
// go on the others too when a round starts, without the bang, so that everybody has the same cover.
function mpProps(L){const have=new Set();if(Array.isArray(L))for(let k=0;k<L.length&&k<900;k++){const c=colliders[L[k]|0];if(c){have.add(c.id);blowQuiet(c);}}
  if(!MP.host){const mine=blownList().filter(id=>!have.has(id));if(mine.length)mpEvent('pbs',0,mine);}}
MPE.pbs=(from,a)=>{for(let k=0;k<a.length&&k<900;k++)blowQuiet(colliders[a[k]|0]);};
// whose explosion is it, for the purposes of my own skin? 0 = nobody's (mine, or the world's). Team mates' explosions do not hurt.
function mpBlast(rep,owner){if(!MP.on)return true;const by=rep?owner|0:0,pl=MP.players.get(by);if(pl&&mpIsMate(pl))return false;P.lastBy=by;P.lastW=W_NADE;P.lastHead=false;P.lastT=G.time;return true;}

// ---------- starting a round, and the per-frame work while it runs
function mpBegin(L,X){if(G.state==='lost')return;mpApplyLobby(L);MP.phase='play';MP.results=null;MP.myShots=[];MP.respT=0;MP.oobT=0;MP.fireT=0;MP.sendT=0;MP.rxS=performance.now();P.lastBy=0;P.lastT=-99;P.spawnT=0;MP.tk[1]=MP.tk[2]=0;MP.heliP=0;
  for(const pl of MP.players.values()){pl.alive=false;pl.fl=0;pl.nx=pl.ny=pl.nz=pl.nyaw=pl.npitch=0;pl.hp=100;pl.dieT=0;pl.use=false;pl.buf.length=0;pl.out.length=0;if(pl.id!==MP.me&&!pl.s)mpPuppet(pl);if(pl.s){pl.s.alive=false;pl.s.g.visible=false;}}
  mpClose();clearFeeds();mpEl.mpBoard.hidden=false;mpEl.mpBoard._h='';mpProps(X&&X.props);
  if(mpMode().vs)vsBegin(X);else coBegin(X);
  enterPlay(MP.menuEv);MP.menuEv=null;}
function mpTick(dt,raw){if(MP.fireT>0)MP.fireT-=dt;if(P.spawnT>0)P.spawnT-=dt;mpPuppets(dt);
  if(mpMode().vs)vsTick(dt,raw);else coTick(dt,raw);
  MP.sendT-=raw;if(MP.sendT<=0){MP.sendT=.05;if(MP.host)mpSnap();else netTx(NET.up,['s'].concat(mpPack(),[++MP.txSeq]));}}
