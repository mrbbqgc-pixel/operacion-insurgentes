// =====================================================================
// 08g CO-OP: survival and the story mission for several players. The host's machine runs the hostile soldiers and the
// mission. Guests see the hostiles as stand-ins, report the hits they score, and are told when they are hit themselves.
// =====================================================================
const FKINDS=['rifle','rush','heavy','mark'];
MP.fshots=[];MP.fmap=new Map();MP.fseq=0;MP.allDeadT=0;
function coDiff(d){d=clamp(d|0,0,2);G.diff=[.55,.85,1.15][d];G.dmgK=[.8,1,1.15][d];} // for this game only: the single-player setting is not touched
function coRefill(){for(const w of P.slots){const D=WDEF[w.id];w.mag=D.mag;w.res=Math.max(w.res,Math.round(D.max*.55));}P.nades=Math.max(2,P.nades);}
// a place to stand near (x,z): never inside the Panteón, even when the team mate to join is standing there
function coSpot(x,z){return spotNear(x,z,6,30)||spotNear(x,z,45,60)||(inCemetery(x,z)?null:[x,z]);}
function coStartExtra(late){return{late:late?1:0,stage:late?Math.max(0,MS.i):clamp(MP.cfg.stage|0,0,ST.length-2),sx:Math.round(P.x),sz:Math.round(P.z)};}
function coBegin(X){X=X||{};coDiff(MP.cfg.diff);MP.fmap.clear();MP.fshots.length=0;MP.fseq=0;MP.allDeadT=0;const surv=MP.cfg.mode==='surv';
  if(MP.host){if(surv)startSurvival();else startMission(clamp(X.stage|0,0,ST.length-2));return;}
  // a guest starts in an empty town that the host then fills in
  G.mode=surv?'survival':'mission';resetWorldState();removeJammer(false);for(const a of allies)removeSoldier(a);allies.length=0;MS.st=null;MS.i=-1;MS.surv=null;MS.phase='';MS.defT=0;
  G.score=0;G.stats={kills:0,heads:0,shots:0,hits:0,deaths:0,time:0};giveLoadout();OBJ.show=false;OBJ.text='';OBJ.sub='';OBJ.prog=0;
  const sp=surv?[-4,16,0]:ST[clamp(X.stage|0,0,ST.length-2)].spawn,bx=X.late&&isFinite(+X.sx)?+X.sx:sp[0],bz=X.late&&isFinite(+X.sz)?+X.sz:sp[1],p=coSpot(bx,bz)||[sp[0],sp[1]];
  P.x=p[0];P.z=p[1];P.y=0;P.yaw=sp[2];P.spawnT=2;camera.rotation.z=0;}
function coStageRx(i,force){if(i===MS.i&&!force)return;MS.i=i;MS.st=i>=0&&i<ST.length?ST[i]:null;G.stage=Math.max(0,i);const st=MS.st;MS.phase='';
  if(!st||!(st.heli||st.type==='reach'))hideHeli();}

// ---------- host: what the guests need to know about the hostiles and the mission
function coFoeShot(s,hx,hy,hz,t,hit){if(!mpCoop()||MP.fshots.length>=16)return;MP.fshots.push([s.nid,Math.round(hx*10),Math.round(hy*10),Math.round(hz*10),t===P?MP.me:(t&&t.pid)||0,hit?1:0]);}
function coSnap(m){m[4]=0;m[5]=0;m[6]=0;
  if(snapN%2===0){const F=[];for(let k=0;k<foes.length;k++){const s=foes[k];if(!s.alive)continue;
      const fl=((s.wantCrouch||s.crouch>.5)?1:0)|(s.lowered?2:0)|(s.revealT>0?4:0)|(s.isStatic?8:0)|((s.laser&&s.laser.visible)?16:0),
        a=[s.nid,Math.max(0,FKINDS.indexOf(s.kind)),Math.round(s.x*10),Math.round(s.z*10),Math.round(s.y0*10),Math.round(angDiff(s.yaw,0)*100),fl,Math.round(clamp(s.aimP,-1,1)*100)];
      if(fl&16)a.push(s.target===P?MP.me:(s.target&&s.target.pid)||0);F.push(a);}m[4]=F;}
  if(MP.fshots.length){m[5]=MP.fshots;MP.fshots=[];}
  if(snapN%5===0){const S=MS.surv;m[6]=[G.mode==='survival'?1:0,MS.i,OBJ.text,OBJ.sub,Math.round(OBJ.prog*100),Math.round(OBJ.x),Math.round(OBJ.z),Math.round(OBJ.y*10),OBJ.show?1:0,
      (MS.jam?1:0)|(MS.phase==='defend'?2:0),Math.round(MS.defT*10),S?S.wave:0];}}
function coFoeKilled(s,by,head,pts){if(!mpCoop())return;const pl=MP.players.get(by|0);if(pl){pl.k++;pl.sc+=pts;}mpEvent('fk',0,[s.nid,s.fall,by|0,head?1:0,pts]);}
function coCrate(x,z){addPick('crate',x,z);if(MP.on&&MP.host)mpEvent('crate',0,[Math.round(x*10)/10,Math.round(z*10)/10]);}
function mpHurtMate(s,dmg,fx,fz){s.flinch=.22;mpEvent('ah',s.pid,[Math.round(dmg*10)/10,Math.round(fx),Math.round(fz)]);}
MPE.fh=(from,a)=>{if(!MP.host)return;const nid=a[0]|0;let s=null;for(let k=0;k<foes.length;k++)if(foes[k].nid===nid){s=foes[k];break;}if(!s||!s.alive)return;
  const pl=MP.players.get(from),w=a[4]|0;MP.hitBy=from;try{damageSoldier(s,clamp(+a[1]||0,0,400),a[2]|0,pl?pl.x:s.x,pl?pl.z:s.z,false,!!a[3],w<WIDS.length?WDEF[WIDS[w]]:null);}finally{MP.hitBy=0;}};
// everybody down at the same moment: back to the checkpoint in the mission, the end of the line in survival
function coWipe(){if(G.mode==='survival'){coFinish(false);return;}radio('COMMAND','Everyone is down. Regroup at the last checkpoint.');restartCheckpoint();camera.rotation.z=0;}
function coFinish(won){if(!MP.host||MP.phase!=='play')return;MP.phase='end';MP.ended=MP.round;const rows=Array.from(MP.players.values(),p=>[p.name,p.k,p.d,p.team,p.id,p.sc]);rows.sort((a,b)=>b[5]-a[5]);
  const Rr={title:won?'Mission complete':G.mode==='survival'?'Overrun at wave '+(MS.surv?MS.surv.wave:0):'Mission failed',rows,coop:1};
  for(const pl of MP.players.values())netTx(pl.conn,['end',Rr,MP.round]);mpBroadcastLobby();hideHeli();mpShowEnd(Rr);}
function coAfterDeath(){}
function coTick(dt,raw){
  if(MP.host){if(humans().length===0){MP.allDeadT+=raw;if(MP.allDeadT>2.4){MP.allDeadT=0;coWipe();}}else MP.allDeadT=0;return;}
  const st=MS.st;if(!st)return;
  if(st.heli){if(!heli.g)makeHeli();if(!heli.on){heli.on=true;heli.landed=false;heli.g.visible=true;MP.heliP=OBJ.prog;}MP.heliP+=(OBJ.prog-MP.heliP)*Math.min(1,dt*1.6);updHeli(dt,MP.heliP);} // the progress arrives in whole percent a few times a secondelse if(st.type==='reach'){if(!heli.g)makeHeli();heli.on=true;heli.g.visible=true;updHeli(dt,1);}
  if(st.type==='plant'&&P.alive){const d=Math.hypot(P.x-st.x,P.z-st.z);
    if(MS.phase===''&&MS.jam&&d<st.r)G.prompt='Hold <b>'+(isTouch?'USE':'F')+'</b> to plant the charge';else if(MS.phase==='defend'&&d<11&&MS.defT<8)G.prompt='Move away from the truck';}}
// down in co-op: back after a few seconds next to a team mate who is still standing
function coDead(dt){const H=humans();if(!H.length){G.prompt='Everyone is down';return;}if(MP.respT>0){G.prompt='Back in <b>'+Math.ceil(MP.respT)+'</b>';return;}
  let m=H[0],bd=1e9;for(const h of H){const d=Math.hypot(h.x-P.x,h.z-P.z);if(d<bd){bd=d;m=h;}}const p=coSpot(m.x,m.z);if(!p){G.prompt='Stand by';return;}
  plReset();coRefill();P.x=p[0];P.z=p[1];P.y=0;P.yaw=m.yaw||0;P.spawnT=2.5;camera.rotation.z=0;killFeed('','Back in the fight');}

// ---------- guest: the hostiles as the host reports them
function mpFoeHit(s,dmg,zone,D,explosive){G.hitT=.14;G.hitKill=false;sndUi('hit');s.flinch=.22;mpEvent('fh',1,[s.nid,Math.round(dmg*10)/10,zone,explosive?1:0,D?widx(curW().id):W_KNIFE]);}
MPE.ah=(from,a)=>{if(from!==1||!P.alive)return;P.lastBy=0;P.lastT=-99;hurt(clamp(+a[0]||0,0,300),isFinite(+a[1])?+a[1]:P.x,isFinite(+a[2])?+a[2]:P.z);};
MPE.fk=(from,a)=>{if(from!==1)return;const s=MP.fmap.get(a[0]|0);if(s&&s.alive){s.alive=false;s.deadT=0;s.fall=a[1]<0?-1:1;s.wp.scale.setScalar(.001);if(s.laser){scene.remove(s.laser);s.laser=null;}foeLoot(s);}
  const by=a[2]|0,pl=MP.players.get(by),pts=a[4]|0;if(pl){pl.k++;pl.sc+=pts;}
  if(by===MP.me){G.stats.kills++;if(a[3])G.stats.heads++;G.score+=pts;G.hitT=.2;G.hitKill=true;sndUi('kill');killFeed('+'+pts,a[3]?'Headshot':s?s.K.label:'Hostile');}};
MPE.crate=(from,a)=>{if(from===1&&isFinite(+a[0]+ +a[1]))addPick('crate',+a[0],+a[1]);};
MPE.rad=(from,a)=>{if(from===1)radio(String(a[0]).slice(0,16),String(a[1]).slice(0,240));};
MPE.ban=(from,a)=>{if(from!==1)return;const t=String(a[0]).slice(0,60);banner(t,String(a[1]||'').slice(0,90));if(/COMPLETE|CLEAR/.test(t))sndUi('obj');};
MPE.jam=from=>{if(from!==1)return;if(MS.jam)removeJammer(true,true);else explode(44,1.2,-478.5,9.5,200,true,true,0);};
MPE.ckpt=(from,a)=>{if(from!==1)return;resetWorldState();MP.fmap.clear();removeJammer(false);coStageRx(clamp(a[0]|0,0,ST.length-1),true);const sp=MS.st.spawn,p=spotNear(sp[0],sp[1],5,30)||sp;
  P.x=p[0];P.z=p[1];P.y=0;P.yaw=sp[2];coRefill();P.spawnT=2;camera.rotation.z=0;killFeed('','Back to the checkpoint');};
function coSnapRx(d){const now=performance.now(),F=d[4];
  if(Array.isArray(F)){MP.fseq++;
    for(const a of F){if(!Array.isArray(a))continue;const nid=a[0]|0,x=+a[2]/10,z=+a[3]/10,y0=+a[4]/10,yaw=+a[5]/100;if(!isFinite(x+z+y0+yaw)||Math.abs(x)>4000||Math.abs(z)>4000||y0<-20||y0>300||Math.abs(yaw)>4)continue;let s=MP.fmap.get(nid);
      if(!s){s=addSoldier(1,FKINDS[a[1]|0]||'rifle',x,z,{y0,yaw,aware:true,isStatic:!!(a[6]&8)});s.net=true;s.nid=nid;s.nb=[];s.lowered=false;MP.fmap.set(nid,s);}
      if(!s.alive)continue;s.seen=MP.fseq;s.nfl=a[6]|0;s.aimP=clamp((a[7]|0)/100,-1,1);s.ntp=a[8]|0;s.nb.push({t:now,x,z,y0,yaw});if(s.nb.length>6)s.nb.shift();if((s.nfl&4)&&s.revealT<.5)s.revealT=.5;}
    // a hostile the host no longer lists (cleared at a restart, say) goes from here as well
    for(const e of Array.from(MP.fmap)){const s=e[1];if(!s.alive){MP.fmap.delete(e[0]);continue;}
      if(MP.fseq-s.seen>12){MP.fmap.delete(e[0]);const i=foes.indexOf(s);if(i>=0)foes.splice(i,1);removeSoldier(s);if(s.laser){scene.remove(s.laser);s.laser=null;}}}}
  const SH=d[5];if(Array.isArray(SH))for(const q of SH)if(Array.isArray(q))coShowFoeShot(q);
  const O=d[6];if(Array.isArray(O)){G.mode=O[0]?'survival':'mission';coStageRx(O[1]|0,false);OBJ.text=String(O[2]).slice(0,120);OBJ.sub=String(O[3]).slice(0,120);OBJ.prog=clamp((O[4]|0)/100,0,1);
    OBJ.x=clamp(+O[5]||0,-4000,4000);OBJ.z=clamp(+O[6]||0,-4000,4000);OBJ.y=clamp((+O[7]||18)/10,0,300);OBJ.show=!!O[8];const fl=O[9]|0;MS.phase=(fl&2)?'defend':'';MS.defT=(+O[10]||0)/10;
    if((fl&1)&&!MS.jam)makeJammer();else if(!(fl&1)&&MS.jam)removeJammer(false);
    if(O[0]){if(!MS.surv)MS.surv={wave:0,t:0,live:false,left:0};MS.surv.wave=O[11]|0;}}}
function coShowFoeShot(q){const s=MP.fmap.get(q[0]|0);if(!s||!s.alive)return;const hx=+q[1]/10,hy=+q[2]/10,hz=+q[3]/10;if(!isFinite(hx+hy+hz)||Math.abs(hx)>5000||Math.abs(hy)>5000||Math.abs(hz)>5000)return;
  const fx=-Math.sin(s.yaw),fz=-Math.cos(s.yaw),mark=s.kind==='mark',mx=s.x+fx*.85,my=s.y0+(mark?1.4:(1.36-s.crouch*.42)*s.sc),mz=s.z+fz*.85;
  s.revealT=3;sndShot(s.K.snd,s.x,s.z,false);puff(mx,my,mz,0xffc45a,mark?.4:.26,.06,.05,1,0,0,0,true);if(mark||q[5]||R()<.6)tracer(mx,my,mz,hx,hy,hz,mark?0xfff6d0:0xffd27a);
  if(!q[5]&&Math.hypot(hx-P.x,hz-P.z)<45)dust(hx,hy,hz,1);if((q[4]|0)===MP.me&&!q[5]&&R()<.5){sndWhiz();G.supp=Math.min(1,G.supp+.22);}}
// guests run this instead of the hostiles' own thinking: glide each stand-in between the host's reports
function coPuppets(dt){const rt=performance.now()-150;if(G.supp>0)G.supp=Math.max(0,G.supp-dt*.5);G.lkp.age+=dt;
  for(let k=foes.length-1;k>=0;k--){const s=foes[k];
    if(!s.alive){if(!updCorpse(s,dt)){foes.splice(k,1);corpses.push(s);if(corpses.length>10)removeSoldier(corpses.shift());}continue;}
    if(s.flinch>0)s.flinch-=dt;if(s.revealT>0)s.revealT-=dt;const b=s.nb;if(!b||!b.length)continue;
    let i=b.length-1;while(i>0&&b[i-1].t>rt)i--;const c=b[i],a=b[i>0?i-1:0],u=c.t>a.t?clamp((rt-a.t)/(c.t-a.t),0,1.5):1,x=a.x+(c.x-a.x)*u,z=a.z+(c.z-a.z)*u,moved=Math.hypot(x-s.x,z-s.z),sp=moved/Math.max(dt,1e-4);
    s.x=x;s.z=z;s.y0=a.y0+(c.y0-a.y0)*u;s.yaw=a.yaw+angDiff(c.yaw,a.yaw)*u;s.crouch+=clamp(((s.nfl&1)?1:0)-s.crouch,-dt*4.5,dt*4.5);s.lowered=!!(s.nfl&2);
    s.moveAmt=lerp(s.moveAmt,clamp(sp/3,0,1),Math.min(1,dt*10));s.run=sp>4.6;if(moved>0&&moved<3){s.ph+=moved*(s.run?2.1:2.6);s.stepD+=moved;if(s.stepD>2.5){s.stepD=0;sndStepAt(x,z);}}
    animSoldier(s,dt);s.g.position.set(x,s.y0,z);s.g.rotation.y=s.yaw;
    // a marksman's sighting laser
    if(s.nfl&16){const tp=s.ntp|0,pl=MP.players.get(tp),tx=tp===MP.me?P.x:pl?pl.x:x,ty=tp===MP.me?P.y+1.2:pl?pl.y+1.2:1.2,tz=tp===MP.me?P.z:pl?pl.z:z,fx=-Math.sin(s.yaw),fz=-Math.cos(s.yaw);
      if(!s.laser){const g=new T.BufferGeometry();g.setAttribute('position',new T.BufferAttribute(new Float32Array(6),3));s.laser=new T.Line(g,laserMat);s.laser.frustumCulled=false;scene.add(s.laser);}
      const q=s.laser.geometry.attributes.position;q.setXYZ(0,x+fx*.85,s.y0+1.4,z+fz*.85);q.setXYZ(1,tx,ty,tz);q.needsUpdate=true;s.laser.visible=true;}
    else if(s.laser)s.laser.visible=false;}}
