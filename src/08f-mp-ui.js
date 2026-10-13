// =====================================================================
// 08f MULTIPLAYER UI: the create/join panel, the lobby, the in-game score list, results, and getting back to the menu
// =====================================================================
const mpEl={};['btnMp','mpUi','mpHome','mpLobby','mpName','mpCode','mpMsg','btnMpCreate','btnMpJoin','btnMpBack','mpCodeBig','btnMpShare','mpMode','mpArena','mpKills','mpMins','mpDiff','mpStage',
  'lArena','lKills','lMins','lDiff','lStage','lCls','mpList','mpCls','btnMpTeam','btnMpStart','mpBoard','card'].forEach(k=>mpEl[k]=$(k));
const mpSay=t=>{mpEl.mpMsg.textContent=t||'';};
function mpFill(sel,opts,val){sel.textContent='';for(const o of opts){const e=document.createElement('option');e.value=String(o[0]);e.textContent=o[1];sel.appendChild(e);}if(val!==undefined)sel.value=String(val);}
function mpOpen(code,note){if(!NET.ok||G.state==='lost')return;mpEl.card.classList.add('mp');mpEl.mpUi.hidden=false;el.menuTitle.textContent='Multiplayer';el.menu.hidden=false;el.menu.scrollTop=0;
  if(!mpEl.mpName.value)mpEl.mpName.value=SAVE.name||'';if(code)mpEl.mpCode.value=code;
  mpEl.mpHome.classList.toggle('inv',!!code);mpEl.btnMpJoin.className=code?'cta':'alt'; // someone who followed an invite link is here to join
  if(!mpEl.mpCls.options.length){mpFill(mpEl.mpCls,CLSN.map((n,k)=>[k,n]),SAVE.cls|0);
    mpFill(mpEl.mpMode,Object.keys(MODES).map(k=>[k,MODES[k].name]));mpFill(mpEl.mpArena,Object.keys(ARENAS).map(k=>[k,ARENAS[k].n]));
    mpFill(mpEl.mpKills,[[10,'10 kills'],[15,'15 kills'],[25,'25 kills'],[40,'40 kills']]);mpFill(mpEl.mpMins,[[5,'5 minutes'],[8,'8 minutes'],[12,'12 minutes'],[20,'20 minutes']]);
    mpFill(mpEl.mpDiff,[[0,'Recruit'],[1,'Regular'],[2,'Veteran']]);mpFill(mpEl.mpStage,ST.slice(0,ST.length-1).map((s,k)=>[k,(k+1)+'. '+s.title]));}
  mpSay(note||'');mpUi();}
function mpClose(){mpEl.card.classList.remove('mp','room');mpEl.mpUi.hidden=true;}
// draw the panel for whatever state the room is in
function mpUi(){if(mpEl.mpUi.hidden)return;const inRoom=MP.on&&(MP.phase==='lobby'||MP.phase==='end'||MP.phase==='play');mpEl.mpHome.hidden=inRoom;mpEl.mpLobby.hidden=!inRoom;mpEl.card.classList.toggle('room',inRoom);
  mpEl.btnMpBack.textContent=inRoom?'Leave':'Back';mpEl.btnMpStart.hidden=!inRoom||!MP.host;if(!inRoom)return;
  const M=mpMode(),C=MP.cfg,h=MP.host;mpEl.mpCodeBig.textContent=NET.code||'-----';
  for(const k of ['mpMode','mpArena','mpKills','mpMins','mpDiff','mpStage'])mpEl[k].disabled=!h;
  mpEl.mpMode.value=C.mode;mpEl.mpArena.value=C.arena;mpEl.mpKills.value=String(C.kills);mpEl.mpMins.value=String(C.mins);mpEl.mpDiff.value=String(C.diff);mpEl.mpStage.value=String(C.stage);
  mpEl.lArena.hidden=mpEl.lKills.hidden=mpEl.lMins.hidden=mpEl.lCls.hidden=!M.vs;mpEl.lDiff.hidden=!M.coop;mpEl.lStage.hidden=C.mode!=='miss';mpEl.btnMpTeam.hidden=!M.teams;
  const me=mpMe();if(me)mpEl.mpCls.value=String(me.cls);
  mpEl.mpList.textContent='';for(const p of MP.players.values()){const li=document.createElement('li'),b=document.createElement('b'),s=document.createElement('span');
    b.textContent=p.name+(p.id===MP.me?' (you)':'');s.textContent=(p.id===1?'Host':'')+(M.teams?(p.id===1?' · ':'')+'Team '+p.team:'');li.append(b,s);li.className=(M.teams?'t'+p.team:'')+(p.id===MP.me?' me':'');mpEl.mpList.appendChild(li);}
  const n=MP.players.size;mpEl.btnMpStart.disabled=M.vs&&n<2;
  if(!mpEl.mpMsg.textContent||mpEl.mpMsg._auto){mpEl.mpMsg._auto=true;mpEl.mpMsg.textContent=h?(M.vs&&n<2?'Send the invite. Versus needs at least two players.':n<2?'You can start alone, or send the invite and wait for the others.':n+' players are in. Start when everyone is here.')
    :MP.phase==='play'?'The game is under way.':MP.away?'The host is not answering. They may have put the game in the background.':'Waiting for the host to start.';}}
function mpNote(t){mpEl.mpMsg._auto=false;mpSay(t);}
function mpName(){const n=cleanName(mpEl.mpName.value);mpEl.mpName.value=n;SAVE.name=n;SAVE.cls=mpEl.mpCls.value|0;try{localStorage.setItem('opInsurgentes2',JSON.stringify(SAVE));}catch(e){}return n;}
function mpBusy(on){mpEl.btnMpCreate.disabled=mpEl.btnMpJoin.disabled=on;}
const mpLink=()=>location.origin+location.pathname+'?join='+NET.code;
if(NET.ok){
  mpEl.btnMp.addEventListener('click',()=>{initAudio();mpOpen();});
  mpEl.btnMpCreate.addEventListener('click',()=>{initAudio();mpBusy(true);mpNote('Creating the game…');mpCreate(mpName(),err=>{mpBusy(false);if(err){mpNote(err);return;}mpEl.mpMsg._auto=true;mpSay('');mpSetMe(mpName(),SAVE.cls|0,false);mpUi();});});
  mpEl.btnMpJoin.addEventListener('click',()=>{initAudio();const code=mpEl.mpCode.value.toUpperCase().replace(/[^A-Z0-9]/g,'');mpEl.mpCode.value=code;if(code.length!==5){mpNote('The room code has five letters or digits.');return;}
    mpBusy(true);mpNote('Joining room '+code+'…');mpJoin(code,mpName(),SAVE.cls|0,err=>{mpBusy(false);if(err){mpNote(err);return;}mpEl.mpMsg._auto=true;mpSay('');mpUi();});});
  mpEl.btnMpBack.addEventListener('click',()=>{if(MP.on||NET.state!=='off'){mpLeave();mpBusy(false);mpEl.mpMsg._auto=true;mpSay('');mpUi();}else{mpClose();toMain();}});
  mpEl.btnMpShare.addEventListener('click',()=>{const url=mpLink(),text='Join my game of Operación Insurgentes. Room code '+NET.code;
    if(navigator.share){navigator.share({title:'Operación Insurgentes',text,url}).catch(()=>{});}
    else if(navigator.clipboard&&navigator.clipboard.writeText){navigator.clipboard.writeText(url).then(()=>mpNote('Invite link copied. Paste it in a message to your friends.'),()=>mpNote('Invite link: '+url));}
    else mpNote('Invite link: '+url);});
  mpEl.mpMode.addEventListener('change',()=>mpSetCfg('mode',mpEl.mpMode.value));mpEl.mpArena.addEventListener('change',()=>mpSetCfg('arena',mpEl.mpArena.value));
  mpEl.mpKills.addEventListener('change',()=>mpSetCfg('kills',+mpEl.mpKills.value));mpEl.mpMins.addEventListener('change',()=>mpSetCfg('mins',+mpEl.mpMins.value));
  mpEl.mpDiff.addEventListener('change',()=>mpSetCfg('diff',+mpEl.mpDiff.value));mpEl.mpStage.addEventListener('change',()=>mpSetCfg('stage',+mpEl.mpStage.value));
  mpEl.mpCls.addEventListener('change',()=>{SAVE.cls=mpEl.mpCls.value|0;if(MP.on)mpSetMe(mpName(),SAVE.cls,false);});
  mpEl.mpName.addEventListener('change',()=>{const n=mpName();if(MP.on)mpSetMe(n,SAVE.cls|0,false);});
  mpEl.btnMpTeam.addEventListener('click',()=>mpSetMe(mpName(),SAVE.cls|0,true));
  mpEl.btnMpStart.addEventListener('click',ev=>{initAudio();mpStart(ev);});}
// an invite link opens the join panel with the code filled in
function mpAuto(){if(!NET.ok)return;let m=null;try{m=/[?&]join=([A-Za-z0-9]{5})/.exec(location.search);}catch(e){}if(m)mpOpen(m[1].toUpperCase(),'You are invited to room '+m[1].toUpperCase()+'. Enter your name and tap Join.');}

// ---------- in the game
function mpStatList(){const me=mpMe();return me&&mpMode().vs?[['Kills',me.k],['Deaths',me.d],['Players',MP.players.size]]:statList();}
let boardT=0;
function mpHud(dt){boardT-=dt;if(boardT>0)return;boardT=.4;const B=mpEl.mpBoard,rows=vsRows(),teams=!!mpMode().teams,vs=!!mpMode().vs;let h='';
  const my=mpMe(),mt=my?my.team:0;
  // a phone has room for five lines: the leaders, and my own line if I am not among them
  const n=Math.min(rows.length,8),lim=window.innerHeight<440?5:8,mi=rows.findIndex(r=>r[4]===MP.me),last=mi>=lim-1&&mi<n?mi:lim-1;
  for(let k=0;k<n;k++){if(n>lim&&k>=lim-1&&k!==last)continue;const r=rows[k];h+='<div class="'+(r[4]===MP.me?'me ':'')+(teams?(r[3]===mt?'t1':'t2'):'')+'"><span>'+esc(r[0])+'</span><span>'+(vs?r[1]+' / '+r[2]:(MP.players.get(r[4]).alive||r[4]===MP.me&&P.alive?'':'DOWN'))+'</span></div>';}
  if(!MP.host&&MP.rxS&&performance.now()-MP.rxS>2500)h+='<div><span>Waiting for the host…</span><span></span></div>';
  if(B._h!==h){B._h=h;B.innerHTML=h;}}
function mpWorldOff(){for(const pl of MP.players.values())mpForget(pl);MP.rivals.length=0;MP.mates.length=0;unlock();G.menuUp=false;G.state='menu';G.mode='mission';el.hud.hidden=true;mpEl.mpBoard.hidden=true;
  resetWorldState();removeJammer(false);for(const a of allies)a.g.visible=false;gunRoot.visible=false;clearFeeds();setDiff(SAVE.diff|0);camera.fov=P.baseFov;camera.updateProjectionMatrix();}
function mpShowEnd(Rr){if(G.state==='lost')return;MP.phase='end';MP.results=Rr;hideHeli();camera.fov=P.baseFov;camera.updateProjectionMatrix();for(const pl of MP.players.values())if(pl.s)pl.s.g.visible=false;unlock();G.menuUp=false;G.state='win';el.hud.hidden=true;gunRoot.visible=false;mpClose();
  const rows=Array.isArray(Rr.rows)?Rr.rows:[];const tk=Rr.teams&&Array.isArray(Rr.tk)?'Team 1: '+(Rr.tk[0]|0)+' · Team 2: '+(Rr.tk[1]|0)+'. ':'';
  showMenu('mpend',String(Rr.title||'Game over').slice(0,60),tk+(Rr.coop?'Score for each player. ':'Kills / deaths for each player. ')+(MP.host?'Go back to the lobby to play again or change the mode.':'The host can take everyone back to the lobby for another round.'),
    rows.slice(0,8).map((r,k)=>[(k+1)+'. '+cleanName(r[0])+(Rr.teams?' · T'+(r[3]|0):''),Rr.coop?String(r[5]|0):(r[1]|0)+' / '+(r[2]|0)]));}
function mpBackToLobby(){if(G.state==='lost')return;mpWorldOff();showMenu('main','Multiplayer','');mpEl.mpMsg._auto=true;mpSay('');mpOpen();}
function mpDropped(msg){mpReset();if(G.state==='lost')return;mpWorldOff();showMenu('main','Multiplayer','');mpOpen('',msg);mpEl.mpMsg._auto=false;}
