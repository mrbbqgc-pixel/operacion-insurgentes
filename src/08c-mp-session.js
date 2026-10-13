// =====================================================================
// 08c MULTIPLAYER SESSION: the room's players and settings, joining and leaving, and the routing of game events.
// The host numbers the players, owns the settings and the scores, and relays everything; guests talk to the host only.
// =====================================================================
const MODES={ffa:{name:'Versus · free-for-all',vs:true},tdm:{name:'Versus · two teams',vs:true,teams:true},
  surv:{name:'Co-op · survival',coop:true},miss:{name:'Co-op · story mission',coop:true}};
const MP={on:false,host:false,me:0,phase:'off',cfg:{mode:'ffa',arena:'plaza',kills:15,mins:8,diff:1,stage:0},players:new Map(),nextId:2,
  rivals:[],mates:[],rx:0,keepT:0,tLeft:0,lseq:0,round:0,ended:0,tk:[0,0,0],txSeq:0,rxSeq:0,snapSeq:0,pend:null,joinCb:null,away:false,hitBy:0,myShots:[],fireT:0,sendT:0,respT:0,oobT:0,sweepT:0,menuEv:null,endT:0,results:null};
// phase: off | lobby | play | end
const MPMAX=8,MPE={},MPH={}; // MPE: what an event does on a player's machine; MPH: the host's bookkeeping for it
const mpMode=()=>MODES[MP.cfg.mode]||MODES.ffa;
const mpVs=()=>MP.on&&!!mpMode().vs,mpCoop=()=>MP.on&&!!mpMode().coop;
const mpMe=()=>MP.players.get(MP.me);
const mpIsMate=pl=>pl.id!==MP.me&&pl.team!==0&&!!mpMe()&&pl.team===mpMe().team;
// in versus the hostiles are the other players; everywhere else they are the AI soldiers
const hostList=()=>(MP.on&&MP.phase==='play'&&mpMode().vs)?MP.rivals:foes;
// everyone the hostiles can go after: me, and (on the host's machine in co-op) the other players
function humans(){const L=[];if(P.alive)L.push(P);for(let k=0;k<MP.mates.length;k++)if(MP.mates[k].alive)L.push(MP.mates[k]);return L;}
// more players, more hostiles. Two players get the single-player numbers: the second one takes the place of the AI squad.
function coScale(){if(!mpCoop())return 1;const n=MP.players.size;return n<=2?1:Math.min(2,1+.22*(n-2));}
function foeCap(){if(!mpCoop())return Q.maxFoes;let base=Q.maxFoes;for(const p of MP.players.values())if(p.touch)base=Math.min(base,10); // a phone anywhere in the game sets the limit
  return base+Math.min(6,2*(MP.players.size-1));}
function cleanName(s){s=String(s==null?'':s).replace(/[^\w \-.áéíóúñÁÉÍÓÚÑüÜ]/g,'').trim().slice(0,12).toUpperCase();return s||'PLAYER';}
function mpPlayer(id,name){return{id,name:cleanName(name),team:0,cls:0,k:0,d:0,sc:0,alive:false,conn:null,rx:performance.now(),s:null,buf:[],hp:100,w:0,fl:0,x:0,y:0,z:0,
  nx:0,ny:0,nz:0,nyaw:0,npitch:0,out:[],reveal:0,use:false,seq:0,touch:false,dieT:0};}
// Messages can overtake each other on the way, so lobby states are numbered and rounds are counted: a late one never undoes a newer one.
const mpLobby=()=>[MP.cfg,MP.phase,Array.from(MP.players.values(),p=>[p.id,p.name,p.team,p.cls,p.k,p.d,p.sc]),MP.host?++MP.lseq:MP.lseq,MP.round];
function mpApplyLobby(L){if(!MP.host){if((L[3]|0)<MP.lseq)return;MP.lseq=L[3]|0;}Object.assign(MP.cfg,L[0]);MP.phase=L[1];const seen=new Set();
  for(const a of L[2]){let pl=MP.players.get(a[0]);if(!pl){pl=mpPlayer(a[0],a[1]);MP.players.set(a[0],pl);}
    pl.name=cleanName(a[1]);pl.team=a[2]|0;pl.cls=a[3]|0;pl.k=a[4]|0;pl.d=a[5]|0;pl.sc=a[6]|0;seen.add(a[0]);}
  for(const id of Array.from(MP.players.keys()))if(!seen.has(id)){mpForget(MP.players.get(id));MP.players.delete(id);}
  if(MP.phase==='play')mpRelist();mpUi();}
function mpSmallTeam(){let a=0,b=0;for(const p of MP.players.values()){if(p.team===1)a++;else if(p.team===2)b++;}return a<=b?1:2;}
function mpBroadcastLobby(){if(!MP.host)return;const L=mpLobby();for(const pl of MP.players.values())netTx(pl.conn,['lobby',L]);if(MP.phase==='play')mpRelist();mpUi();}
function mpReset(){for(const pl of MP.players.values())mpForget(pl);MP.players.clear();MP.rivals.length=0;MP.mates.length=0;MP.on=false;MP.host=false;MP.me=0;MP.phase='off';MP.lseq=0;MP.round=0;MP.ended=0;MP.rxSeq=0;MP.pend=null;MP.away=false;MP.joinCb=null;MP.results=null;
  NET.onOpen=NET.onFail=NET.onData=NET.onConn=NET.onGone=null;netClose();}

// ---------- host
function mpCreate(name,done){if(!NET.ok)return;mpReset();
  NET.onFail=m=>{mpReset();done(m);};
  NET.onOpen=()=>{MP.on=true;MP.host=true;MP.me=1;MP.phase='lobby';MP.nextId=2;const me=mpPlayer(1,name);me.touch=isTouch;MP.players.set(1,me);done('');};
  NET.onConn=c=>{c._pid=0;};NET.onData=mpHostRx;NET.onGone=c=>{if(c._pid)mpDrop(c._pid);};netHost();}
function mpHostRx(c,d){if(!Array.isArray(d)||!MP.host)return;const t=d[0];
  if(!c._pid){if(t!=='hello')return;
    if(d[1]!==PV){netTx(c,['no','That game runs a different version. Everyone should reload the page, then try again.']);return;}
    if(MP.players.size>=MPMAX){netTx(c,['no','That game is full.']);return;}
    const id=MP.nextId++,pl=mpPlayer(id,d[2]);pl.conn=c;c._pid=id;pl.cls=clamp(d[3]|0,0,CLS.length-1);pl.touch=!!d[4];pl.team=mpMode().teams?mpSmallTeam():mpMode().coop?1:0;MP.players.set(id,pl);
    netTx(c,['welcome',id,mpLobby()]);mpBroadcastLobby();if(MP.phase==='play')mpLateJoin(pl);return;}
  const pl=MP.players.get(c._pid);if(!pl)return;pl.rx=performance.now();
  try{if(t==='s')mpState(pl,d);
    else if(t==='e')mpRoute(pl.id,String(d[1]),d[2]|0,d.slice(3));
    else if(t==='me'){pl.name=cleanName(d[1]);pl.cls=clamp(d[2]|0,0,CLS.length-1);if(d[3]&&mpMode().teams&&MP.phase!=='play')pl.team=pl.team===1?2:1;mpBroadcastLobby();}
    else if(t==='bye')mpDrop(pl.id);
  }catch(e){if(!G.errN)console.error(e);G.errN=(G.errN||0)+1;}}
function mpDrop(id){const pl=MP.players.get(id);if(!pl||id===MP.me||!MP.host)return;const c=pl.conn;mpForget(pl);MP.players.delete(id);if(c){c._pid=0;setTimeout(()=>{try{c.close();}catch(e){}},300);}
  mpBroadcastLobby();if(MP.phase==='play'){mpRelist();mpRoute(MP.me,'left',0,[pl.name]);killFeed('',pl.name+' left the game');mpAfterLeave();}}
function mpSetCfg(k,v){if(!MP.host||MP.phase==='play')return;MP.cfg[k]=v;
  if(k==='mode'){const M=mpMode();let n=0;for(const pl of MP.players.values())pl.team=M.teams?1+(n++%2):M.coop?1:0;}mpBroadcastLobby();}
function mpStart(ev){if(!MP.host||MP.phase==='play')return;const M=mpMode();let n=0;
  for(const pl of MP.players.values()){pl.k=0;pl.d=0;pl.sc=0;if(M.teams){if(pl.team!==1&&pl.team!==2)pl.team=1+(n%2);}else pl.team=M.coop?1:0;n++;}
  if(M.teams&&n>1){let a=0;for(const pl of MP.players.values())if(pl.team===1)a++;if(a===0||a===n){n=0;for(const pl of MP.players.values())pl.team=1+(n++%2);}} // nobody plays a team match alone
  MP.phase='play';MP.round++;MP.menuEv=ev||null;const L=mpLobby(),X=mpStartExtra();for(const pl of MP.players.values())netTx(pl.conn,['start',L,X]);mpBegin(L,X);}
function mpToLobby(){if(!MP.host)return;MP.phase='lobby';MP.ended=MP.round;for(const pl of MP.players.values())netTx(pl.conn,['tolobby',MP.round]);mpBroadcastLobby();mpBackToLobby();}

// ---------- guest
function mpJoin(code,name,cls,done){if(!NET.ok)return;mpReset();MP.joinCb=done;const fin=m=>{const f=MP.joinCb;if(!f)return;MP.joinCb=null;if(m)mpReset();f(m);};
  NET.onFail=fin;
  NET.onOpen=()=>{MP.rx=performance.now();netTx(NET.up,['hello',PV,cleanName(name),cls|0,isTouch?1:0]);const p=NET.peer;
    setTimeout(()=>{if(NET.peer===p)fin('The host did not answer. Ask them to check that the game is still open.');},9000);}; // (an earlier attempt's timer must not end a later one)
  NET.onData=(c,d)=>{if(!Array.isArray(d))return;MP.rx=performance.now();const t=d[0];
    // nothing counts before the host's welcome; a start that overtook it waits for it
    if(!MP.on&&t!=='welcome'&&t!=='no'&&t!=='kick'){if(t==='start')MP.pend=d;return;}
    try{if(t==='S')mpSnapshot(d);
      else if(t==='e')mpHandle(String(d[1]),d[2]|0,d.slice(3));
      else if(t==='welcome'){MP.on=true;MP.host=false;MP.me=d[1]|0;MP.phase='lobby';MP.lseq=0;MP.round=d[2][4]|0;MP.ended=d[2][1]==='play'?MP.round-1:MP.round;mpApplyLobby(d[2]);fin('');
        const q=MP.pend;MP.pend=null;if(q&&(q[1][4]|0)>MP.ended){MP.round=q[1][4]|0;mpBegin(q[1],q[2]);}}
      else if(t==='lobby')mpApplyLobby(d[1]);
      else if(t==='start'){const r=d[1][4]|0;if(r>MP.ended&&(r>MP.round||G.state!=='play')){MP.round=r;mpBegin(d[1],d[2]);}} // a round that has already ended is never (re)started
      else if(t==='end'){const r=d[2]|0;if(r>MP.ended&&r>=MP.round){MP.round=r;MP.ended=r;mpShowEnd(d[1]);}}
      else if(t==='tolobby'){const r=d[1]|0;if(r>=MP.round&&(r>MP.ended||MP.phase!=='lobby')){MP.round=r;MP.ended=r;MP.phase='lobby';mpBackToLobby();}}
      else if(t==='no')fin(String(d[1]));
      else if(t==='kick')mpDropped(String(d[1]||'The host closed the game.'));
    }catch(e){if(!G.errN)console.error(e);G.errN=(G.errN||0)+1;}};
  NET.onGone=()=>{if(MP.on)mpDropped('The connection to the host was lost.');else fin('The connection to the host was lost.');};netJoin(String(code).toUpperCase().replace(/[^A-Z0-9]/g,''));}
function mpSetMe(name,cls,swap){const me=mpMe();if(!me)return;me.name=cleanName(name);me.cls=clamp(cls|0,0,CLS.length-1);
  if(MP.host){if(swap&&mpMode().teams&&MP.phase!=='play')me.team=me.team===1?2:1;mpBroadcastLobby();}else netTx(NET.up,['me',me.name,me.cls,swap?1:0]);}
// leave on purpose: tell the others, then drop the line a moment later so that the message gets out
function mpLeave(){if(!MP.on&&NET.state==='off')return;if(MP.on){if(MP.host){for(const pl of MP.players.values())netTx(pl.conn,['kick','The host closed the game.']);}else netTx(NET.up,['bye']);}
  const p=NET.peer;NET.peer=null;NET.state='off';NET.up=null;if(p)setTimeout(()=>{try{p.destroy();}catch(e){}},400);mpReset();}

// ---------- events: anything that happens once (a hit, a death, a grenade) as opposed to the steady stream of positions
function mpEvent(kind,to,a){if(!MP.on)return;if(MP.host)mpRoute(MP.me,kind,to,a);else netTx(NET.up,['e',kind,to].concat(a));}
function mpRoute(from,kind,to,a){const h=MPH[kind];if(h&&h(from,a)===false)return;const m=['e',kind,from].concat(a);
  if(to){if(to===MP.me){if(from!==MP.me)mpHandle(kind,from,a);}else{const pl=MP.players.get(to);if(pl)netTx(pl.conn,m);}}
  else{for(const pl of MP.players.values())if(pl.id!==from&&pl.id!==MP.me)netTx(pl.conn,m);if(from!==MP.me)mpHandle(kind,from,a);}}
function mpHandle(kind,from,a){const h=MPE[kind];if(h)h(from,a);}
MPE.left=(from,a)=>{killFeed('',cleanName(a[0])+' left the game');};

// ---------- keeping the line alive, and noticing when someone has gone
function mpFrame(raw){const now=performance.now();MP.keepT-=raw;
  // In the lobby people wander off to send the invite, so silence is forgiven for a long time there; in a match it is not.
  if(MP.host){if(MP.keepT<=0){MP.keepT=2;const lim=MP.phase==='play'?15000:150000;for(const pl of Array.from(MP.players.values())){if(pl.id!==MP.me&&now-pl.rx>lim)mpDrop(pl.id);else if(MP.phase!=='play'||G.state!=='play')netTx(pl.conn,['k']);}}}
  else{if(MP.keepT<=0){MP.keepT=2;if(MP.phase!=='play'||G.state!=='play')netTx(NET.up,['k']);}
    const aw=now-MP.rx>6000;if(aw!==MP.away){MP.away=aw;mpUi();}if(now-MP.rx>(MP.phase==='play'?20000:150000))mpDropped('The connection to the host was lost.');}}
// timers keep running in a tab that is not in front (on a computer at least), so the line stays up while that player's game stands still
setInterval(()=>{if(!MP.on||!document.hidden)return;const round=MP.phase==='play'&&G.state==='play';
  if(MP.host){if(round)mpSnap();else for(const pl of MP.players.values())netTx(pl.conn,['k']);}else netTx(NET.up,round?['s'].concat(mpPack(),[++MP.txSeq]):['k']);},1500);
window.addEventListener('pagehide',()=>{if(MP.on){if(MP.host){for(const pl of MP.players.values())netTx(pl.conn,['kick','The host closed the game.']);}else netTx(NET.up,['bye']);}});
