// =====================================================================
// 08e VERSUS: players against players in one part of the town. Free-for-all or two teams, weapon classes,
// respawns away from the enemy, a kill limit and a clock (both kept by the host).
// =====================================================================
const ARENAS={plaza:{n:'Plaza Principal',x0:154,z0:-726,x1:358,z1:-594},glorieta:{n:'La Glorieta',x0:-70,z0:-126,x1:166,z1:134},
  blvd:{n:'Blvd. Benito Juárez',x0:-70,z0:-486,x1:70,z1:-234},centro:{n:'Centro (large)',x0:-70,z0:-726,x1:358,z1:-234}};
const arena=()=>ARENAS[MP.cfg.arena]||ARENAS.plaza;
function giveClass(c){const id=CLS[c]||'m4',D=WDEF[id];P.slots=[{id,mag:D.mag,res:Math.round(D.max*.72)},{id:'pistol',mag:15,res:45}];P.cur=0;P.nades=2;showWeapon();}
// street corners inside the arena, in order round its centre, so that the first spawns can be dealt out evenly
function arenaSpots(){const A=arena(),cx=(A.x0+A.x1)/2,cz=(A.z0+A.z1)/2,L=[];
  for(const s of SPN)for(const o of [[0,0],[9,9],[-9,9],[9,-9],[-9,-9]]){const x=s[0]+o[0],z=s[1]+o[1];if(x>A.x0+3&&x<A.x1-3&&z>A.z0+3&&z<A.z1-3&&freeSpot(x,z))L.push([x,z]);}
  L.sort((a,b)=>Math.atan2(a[1]-cz,a[0]-cx)-Math.atan2(b[1]-cz,b[0]-cx));return L;}
function vsSpawnPoint(first){const A=arena(),cx=(A.x0+A.x1)/2,cz=(A.z0+A.z1)/2,L=MP.spots,me=mpMe();
  if(first&&L.length&&me){const ids=Array.from(MP.players.keys()).sort((a,b)=>a-b);
    if(mpMode().teams){const side=L.filter(p=>me.team===1?p[0]<cx:p[0]>=cx),mine=ids.filter(id=>MP.players.get(id).team===me.team);if(side.length)return side[Math.floor((mine.indexOf(MP.me)+.5)/mine.length*side.length)%side.length];}
    return L[Math.floor(ids.indexOf(MP.me)/ids.length*L.length)%L.length];}
  let best=null,bs=-1e9;
  for(let k=0;k<44;k++){let x,z;if(k<24&&L.length){const s=RP(L);x=s[0]+R2(-3,3);z=s[1]+R2(-3,3);}else{x=R2(A.x0+4,A.x1-4);z=R2(A.z0+4,A.z1-4);}
    if(x<A.x0+3||x>A.x1-3||z<A.z0+3||z>A.z1-3||!freeSpot(x,z))continue;let dmin=1e9,seen=0;
    for(const s of MP.rivals){if(!s.alive)continue;const d=Math.hypot(s.x-x,s.z-z);if(d<dmin)dmin=d;if(d<110&&los(x,1.6,z,s.x,s.y0+1.5,s.z))seen++;}
    let sc=Math.min(dmin,75)-seen*45+R()*12;for(const s of MP.mates)if(s.alive&&Math.hypot(s.x-x,s.z-z)<45)sc+=8;
    if(sc>bs){bs=sc;best=[x,z];}}
  return best||[cx,cz];}
function vsSpawn(first){const A=arena(),p=vsSpawnPoint(first),me=mpMe();plReset();giveClass(me?me.cls:0);P.x=p[0];P.z=p[1];P.y=0;P.yaw=Math.atan2(-((A.x0+A.x1)/2-p[0]),-((A.z0+A.z1)/2-p[1]));
  P.spawnT=2.5;P.lastBy=0;P.lastT=-99;MP.oobT=0;pushOut(P,.45,0);camera.rotation.z=0;}
function vsBegin(X){G.mode='versus';resetWorldState();removeJammer(false);for(const a of allies)removeSoldier(a);allies.length=0;MS.st=null;MS.i=-1;MS.surv=null;
  G.dmgK=1;G.score=0;G.stats={kills:0,heads:0,shots:0,hits:0,deaths:0,time:0};MP.tLeft=X&&X.t>0?X.t:MP.cfg.mins*60;if(X&&Array.isArray(X.tk)){MP.tk[1]=X.tk[0]|0;MP.tk[2]=X.tk[1]|0;}MP.spots=arenaSpots();MP.sweepT=14;OBJ.show=false;
  vsSpawn(!(X&&X.late));banner(arena().n.toUpperCase(),(mpMode().teams?'TWO TEAMS':'FREE-FOR-ALL')+' · FIRST TO '+MP.cfg.kills);}
const vsTeamKills=t=>MP.tk[t]|0; // kept apart from the players' own counts, so a team keeps the kills of someone who left
function vsTick(dt,raw){const A=arena();
  if(P.alive){if(P.x<A.x0||P.x>A.x1||P.z<A.z0||P.z>A.z1){MP.oobT+=dt;G.prompt='Leaving the battle. Turn back: <b>'+Math.max(0,Math.ceil(6-MP.oobT))+'</b>';
      if(MP.oobT>6){P.lastBy=0;P.lastT=-99;P.spawnT=0;hurt(999,P.x,P.z);}}else MP.oobT=0;}
  // every so often everybody shows on the map for a moment, so that nobody can hide for the whole match
  MP.sweepT-=dt;if(MP.sweepT<=0){MP.sweepT=14;for(const s of MP.rivals)if(s.alive)s.revealT=Math.max(s.revealT,2.2);}
  if(MP.host){MP.tLeft-=raw;if(MP.tLeft<=0)vsEnd();}
  // objective panel: the score at a glance
  const me=mpMe(),K=MP.cfg.kills,t=Math.max(0,MP.tLeft),clock=Math.floor(t/60)+':'+String(Math.floor(t%60)).padStart(2,'0');
  if(mpMode().teams&&me){const a=vsTeamKills(me.team),b=vsTeamKills(me.team===1?2:1);OBJ.text='Two teams · first to '+K;OBJ.sub='Your team '+a+' · Other team '+b+' · '+clock;OBJ.prog=clamp(Math.max(a,b)/K,0,1);}
  else{let top=null;for(const p of MP.players.values())if(!top||p.k>top.k)top=p;OBJ.text='Free-for-all · first to '+K;
    OBJ.sub='You '+(me?me.k:0)+(top&&top!==me?' · '+top.name+' '+top.k:'')+' · '+clock;OBJ.prog=clamp((top?top.k:0)/K,0,1);}}
function vsRows(){const rows=Array.from(MP.players.values(),p=>[p.name,p.k,p.d,p.team,p.id]);rows.sort((a,b)=>b[1]-a[1]||a[2]-b[2]);return rows;}
function vsCheck(){if(!MP.host||MP.phase!=='play'||!mpMode().vs)return;const K=MP.cfg.kills;
  if(mpMode().teams){if(vsTeamKills(1)>=K||vsTeamKills(2)>=K)vsEnd();}else for(const p of MP.players.values())if(p.k>=K){vsEnd();return;}}
function vsEnd(){if(!MP.host||MP.phase!=='play')return;MP.phase='end';MP.ended=MP.round;const rows=vsRows();let title;
  if(mpMode().teams){const a=vsTeamKills(1),b=vsTeamKills(2);title=a===b?'Draw':'Team '+(a>b?1:2)+' wins';}
  else title=rows.length>1&&rows[0][1]===rows[1][1]?'Draw':rows[0][0]+' wins';
  const Rr={title,rows,teams:!!mpMode().teams,tk:[vsTeamKills(1),vsTeamKills(2)]};for(const pl of MP.players.values())netTx(pl.conn,['end',Rr,MP.round]);mpBroadcastLobby();mpShowEnd(Rr);}

// ---------- hooks the session layer calls; the co-op modes add to these in their own file
function mpStartExtra(){const X=mpMode().vs?{t:MP.cfg.mins*60}:coStartExtra();X.props=blownList();return X;}
function mpLateJoin(pl){if(mpMode().coop){for(const a of allies)removeSoldier(a);allies.length=0;} // the AI squad makes way for a second player
  const X=mpMode().vs?{t:MP.tLeft,late:1,tk:[MP.tk[1],MP.tk[2]]}:coStartExtra(true);X.props=blownList();netTx(pl.conn,['start',mpLobby(),X]);}
function mpAfterDeath(){if(mpMode().vs)vsCheck();else coAfterDeath();}
function mpAfterLeave(){if(mpMode().vs){let n=0;for(const p of MP.players.values())n++;if(n<2&&MP.phase==='play'){killFeed('','Everyone else has left');}}}
function mpSnapExtra(m){if(mpMode().coop)coSnap(m);}
function mpSnapExtraRx(d){if(mpMode().coop)coSnapRx(d);}
