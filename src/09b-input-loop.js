// =====================================================================
// 09b INPUT + LOOP: saving, options, menus, keyboard/mouse/touch, frame loop
// =====================================================================
const SAVE={stage:0,sens:100,snd:true,shadow:Q.shadows,best:0,diff:isTouch?0:1};
try{Object.assign(SAVE,JSON.parse(localStorage.getItem('opInsurgentes2')||'{}'));}catch(e){}
function saveGame(){if(G.mode==='mission'&&MS.i>=0&&G.state!=='menu'&&!MP.on)SAVE.stage=MS.i;try{localStorage.setItem('opInsurgentes2',JSON.stringify(SAVE));}catch(e){}}
function setShadows(on){Q.shadows=on;renderer.shadowMap.enabled=on;sun.castShadow=on;if(on&&!sun.shadow.map){const s=sun.shadow;s.mapSize.set(isTouch?1024:2048,isTouch?1024:2048);
    s.camera.left=-110;s.camera.right=110;s.camera.top=110;s.camera.bottom=-110;s.camera.near=20;s.camera.far=520;s.bias=-0.0004;s.normalBias=0.5;s.camera.updateProjectionMatrix();}
  scene.traverse(o=>{if(o.material){if(Array.isArray(o.material))o.material.forEach(m=>m.needsUpdate=true);else o.material.needsUpdate=true;}});}
el.optSens.value=SAVE.sens;el.optSnd.checked=SAVE.snd;el.optShadow.checked=SAVE.shadow;P.sens=SAVE.sens/100;AU.on=SAVE.snd;if(SAVE.shadow!==Q.shadows)setShadows(SAVE.shadow);
const optDiff=$('optDiff');function setDiff(d){SAVE.diff=d;if(MP.on&&MP.phase==='play')return;G.diff=[.55,.85,1.15][d];G.dmgK=[.8,1,1.15][d];} // a multiplayer round keeps the difficulty its host chose
optDiff.value=String(SAVE.diff);setDiff(SAVE.diff|0);optDiff.addEventListener('change',()=>{setDiff(+optDiff.value);saveGame();});
el.optSens.addEventListener('input',()=>{SAVE.sens=+el.optSens.value;P.sens=SAVE.sens/100;saveGame();});
el.optSnd.addEventListener('change',()=>{SAVE.snd=el.optSnd.checked;setSound(SAVE.snd);saveGame();});
el.optShadow.addEventListener('change',()=>{SAVE.shadow=el.optShadow.checked;setShadows(SAVE.shadow);saveGame();});

let locked=false,wasLocked=false,last=performance.now(),frame=0,menuT=0,slowT=0,slowN=0;
const still=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
function lock(){if(canvas.requestPointerLock){try{const p=canvas.requestPointerLock();if(p&&p.catch)p.catch(()=>{});}catch(e){}}}
function unlock(){if(document.pointerLockElement&&document.exitPointerLock)document.exitPointerLock();}
function enterPlay(ev){el.menu.hidden=true;el.mapOver.hidden=true;el.hud.hidden=false;G.state='play';G.menuUp=false;last=performance.now();initAudio();
  if(ev&&(ev.pointerType?ev.pointerType==='mouse':!isTouch))lock();}
function pause(){if(G.state!=='play')return;
  // a multiplayer game cannot stop for one player: the menu opens over it and the game goes on
  if(MP.on){unlock();if(!G.menuUp){G.menuUp=true;IN.fire=false;IN.useHeld=false;P.wantAds=false;el.hud.hidden=true;showMenu('pause','Game menu','The game goes on while this menu is open.',mpStatList());}return;}
  G.state='pause';IN.fire=false;IN.useHeld=false;el.hud.hidden=true;showMenu('pause','Paused',G.mode==='mission'?OBJ.text+'.':'Survival, wave '+(MS.surv?MS.surv.wave:0)+'.',statList());}
function toMain(){unlock();G.state='menu';G.menuUp=false;G.mode='mission';setDiff(SAVE.diff|0);mpEl.mpBoard.hidden=true;el.hud.hidden=true;resetWorldState();removeJammer(false);for(const a of allies)a.g.visible=false;gunRoot.visible=false;clearFeeds();camera.fov=P.baseFov;camera.updateProjectionMatrix();
  showMenu('main','Operación Insurgentes','A mercenary force has seized the town and the crossroads where Highway 1 turns east for Loreto. Lead fireteam Halcón up Blvd. Benito Juárez, take the Glorieta, and clear the Plaza Principal.');}
function onPlayerDeath(){if(MP.on){mpDied();return;}G.state='dead';IN.fire=false;unlock();saveGame();}
function missionWon(){if(MP.on){coFinish(true);return;}G.state='win';unlock();hideHeli();SAVE.stage=0;if(G.score>SAVE.best)SAVE.best=G.score;saveGame();el.hud.hidden=true;gunRoot.visible=false;
  showMenu('win','Mission complete','Fireteam Halcón is out. Ciudad Insurgentes and the Highway 1 crossroads are back in friendly hands.',statList().concat([['Best',SAVE.best]]));}
el.btnStart.addEventListener('click',ev=>{if(menuMode==='lost'){location.reload();return;}initAudio();
  if(menuMode==='pause'){enterPlay(ev);return;}
  if(menuMode==='mpend'){mpToLobby();return;}
  clearFeeds();if(menuMode==='dead'){if(G.mode==='mission')restartCheckpoint();else startSurvival();}
  else startMission(menuMode==='main'?clamp(SAVE.stage|0,0,ST.length-2):0);
  enterPlay(ev);});
el.btnSurvival.addEventListener('click',ev=>{initAudio();clearFeeds();if(menuMode==='pause')restartCheckpoint();else startSurvival();enterPlay(ev);});
el.btnQuit.addEventListener('click',ev=>{if(menuMode==='main'){initAudio();clearFeeds();SAVE.stage=0;startMission(0);enterPlay(ev);}else{if(MP.on)mpLeave();toMain();}});
function openMap(){const inGame=G.state==='play'||G.state==='pause';if(G.state==='play')pause();drawBigMap();el.mapOver.hidden=false;
  // start the scroll on the player (or on the Glorieta from the main menu)
  const w=$('mapWrap'),cw=el.bigmap.clientWidth,ch=el.bigmap.clientHeight,tx=inGame?P.x:60,tz=inGame?P.z:-300;w.scrollLeft=(tx-MX0)/MAPW*cw-w.clientWidth/2;w.scrollTop=(tz-MZ0)/MAPH*ch-w.clientHeight/2;}
el.btnMapMenu.addEventListener('click',openMap);$('btnMapClose').addEventListener('click',()=>{el.mapOver.hidden=true;});

// ---------- keyboard and mouse
const keys={};
function look(dx,dy,k){const r=k*P.sens*(camera.fov/P.baseFov);P.yaw-=dx*r;P.pitch=clamp(P.pitch-dy*r,-1.5,1.5);}
document.addEventListener('pointerlockchange',()=>{locked=document.pointerLockElement===canvas;if(!locked&&wasLocked&&G.state==='play')pause();wasLocked=locked;});
canvas.addEventListener('mousedown',e=>{if(G.state!=='play'||G.menuUp)return;if(!locked)lock();if(e.button===0){IN.fire=true;IN.firePressed=true;IN.touchFire=false;}else if(e.button===2)P.wantAds=true;});
window.addEventListener('mouseup',e=>{if(e.button===0)IN.fire=false;else if(e.button===2)P.wantAds=false;});
canvas.addEventListener('contextmenu',e=>e.preventDefault());
document.addEventListener('mousemove',e=>{if(G.state==='play'&&!G.menuUp&&(locked||(e.buttons&1)))look(e.movementX||0,e.movementY||0,.0023);});
canvas.addEventListener('wheel',e=>{if(G.state==='play'){IN.swap=true;e.preventDefault();}},{passive:false});
window.addEventListener('keydown',e=>{if(e.repeat){if(G.state==='play'&&(e.code==='Space'||e.code.indexOf('Arrow')===0||e.code==='Tab'))e.preventDefault();return;}keys[e.code]=true;
  if(e.code==='KeyM'){if(!el.mapOver.hidden)el.mapOver.hidden=true;else if(G.state==='play'||G.state==='pause'){unlock();openMap();}return;}
  if(G.state!=='play'||G.menuUp)return;const c=e.code;
  if(c==='Space'){IN.jump=true;e.preventDefault();}else if(c==='KeyR')IN.reload=true;else if(c==='KeyQ'||c==='Digit1'||c==='Digit2'){if(c==='KeyQ'||(c==='Digit1')!==(P.cur===0))IN.swap=true;}
  else if(c==='KeyC'||c==='ControlLeft')IN.crouchT=true;else if(c==='KeyG')IN.nade=true;else if(c==='KeyV')IN.melee=true;else if(c==='KeyF'||c==='KeyE'){IN.use=true;IN.useHeld=true;}
  else if(c==='KeyP'){unlock();pause();}else if(c==='Escape'&&!locked)pause();else if(c.indexOf('Arrow')===0||c==='Tab')e.preventDefault();});
window.addEventListener('keyup',e=>{keys[e.code]=false;if(e.code==='KeyF'||e.code==='KeyE')IN.useHeld=false;});
window.addEventListener('blur',()=>{for(const k in keys)keys[k]=false;IN.fire=false;IN.useHeld=false;P.wantAds=false;});
document.addEventListener('visibilitychange',()=>{if(document.hidden)pause();});
// ---------- touch
const touch={move:null,look:null,fire:null,mx:0,my:0};
canvas.addEventListener('touchstart',e=>{if(G.state!=='play'||G.menuUp)return;e.preventDefault();
  for(const t of e.changedTouches){if(t.clientX<window.innerWidth*.42&&!touch.move){touch.move={id:t.identifier,x:t.clientX,y:t.clientY};
      el.stick.hidden=false;el.stick.style.left=t.clientX+'px';el.stick.style.top=t.clientY+'px';el.knob.style.transform='';}
    else if(!touch.look)touch.look={id:t.identifier,x:t.clientX,y:t.clientY};}},{passive:false});
const fireBtn=$('btnFire');
fireBtn.addEventListener('touchstart',e=>{e.preventDefault();if(G.state!=='play'||G.menuUp)return;const t=e.changedTouches[0];touch.fire={id:t.identifier,x:t.clientX,y:t.clientY};IN.fire=true;IN.firePressed=true;IN.touchFire=true;},{passive:false});
document.addEventListener('touchmove',e=>{if(G.state!=='play'||G.menuUp)return;e.preventDefault();
  for(const t of e.changedTouches){const m=touch.move,l=touch.look,f=touch.fire;
    if(m&&t.identifier===m.id){let dx=t.clientX-m.x,dy=t.clientY-m.y;const d=Math.hypot(dx,dy),Rr=52;if(d>Rr){dx*=Rr/d;dy*=Rr/d;}touch.mx=dx/Rr;touch.my=dy/Rr;el.knob.style.transform='translate('+dx+'px,'+dy+'px)';}
    else if(l&&t.identifier===l.id){look(t.clientX-l.x,t.clientY-l.y,.0052);l.x=t.clientX;l.y=t.clientY;}
    else if(f&&t.identifier===f.id){look(t.clientX-f.x,t.clientY-f.y,.0052);f.x=t.clientX;f.y=t.clientY;}}},{passive:false});
function touchEnd(e){for(const t of e.changedTouches){
  if(touch.move&&t.identifier===touch.move.id){touch.move=null;touch.mx=touch.my=0;el.stick.hidden=true;}
  else if(touch.look&&t.identifier===touch.look.id)touch.look=null;
  else if(touch.fire&&t.identifier===touch.fire.id){touch.fire=null;IN.fire=false;}}}
document.addEventListener('touchend',touchEnd);document.addEventListener('touchcancel',touchEnd);
function tap(id,fn,up){const b=$(id);b.addEventListener('touchstart',e=>{e.preventDefault();e.stopPropagation();fn();},{passive:false});if(up){b.addEventListener('touchend',up);b.addEventListener('touchcancel',up);}
  b.addEventListener('mousedown',e=>{e.preventDefault();fn();});if(up)b.addEventListener('mouseup',up);}
tap('btnReload',()=>{IN.reload=true;});tap('btnSwap',()=>{IN.swap=true;});tap('btnJump',()=>{IN.jump=true;});tap('btnCrouch',()=>{IN.crouchT=true;});tap('btnNade',()=>{IN.nade=true;});
tap('btnAds',()=>{P.wantAds=!P.wantAds;});tap('btnUse',()=>{IN.use=true;IN.useHeld=true;},()=>{IN.useHeld=false;});
tap('btnPause',()=>{unlock();pause();});tap('btnMap',()=>{unlock();openMap();});

// ---------- frame loop
function resize(){const w=window.innerWidth||640,h=window.innerHeight||360;renderer.setSize(w,h,false);camera.aspect=w/h;P.baseFov=w<h?88:74;if(G.state!=='play'){camera.fov=P.baseFov;}camera.updateProjectionMatrix();}
window.addEventListener('resize',resize);resize();
// the static town is uploaded once and its buffers are then released, so a lost graphics context means a reload
canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();saveGame();unlock();G.state='lost';menuMode='lost';G.menuUp=false;if(MP.on||NET.state!=='off')mpLeave();mpClose();mpEl.btnMp.hidden=true;mpEl.mpBoard.hidden=true;el.hud.hidden=true;el.mapOver.hidden=true;el.menuTitle.textContent='Graphics were reset';
  el.menuMsg.textContent='Your device reclaimed the graphics memory. Reload the page to carry on from your last checkpoint.';el.menuStats.hidden=true;el.btnStart.textContent='Reload';el.btnStart.hidden=false;
  el.btnSurvival.hidden=true;el.btnQuit.hidden=true;el.btnMapMenu.hidden=true;el.controls.hidden=true;el.menu.hidden=false;});
const BOT={on:false,f:0,s:0,sprint:false};
function gatherInput(){if(BOT.on){IN.f=BOT.f;IN.s=BOT.s;IN.sprint=BOT.sprint;return;}if(G.menuUp){IN.f=0;IN.s=0;IN.sprint=false;IN.fire=false;return;}let f=0,s=0;if(keys.KeyW||keys.ArrowUp)f+=1;if(keys.KeyS||keys.ArrowDown)f-=1;if(keys.KeyD||keys.ArrowRight)s+=1;if(keys.KeyA||keys.ArrowLeft)s-=1;
  f-=touch.my;s+=touch.mx;IN.f=f;IN.s=s;IN.sprint=!!(keys.ShiftLeft||keys.ShiftRight)||(touch.move&&Math.hypot(touch.mx,touch.my)>.96&&touch.my<-.75);
  if(isTouch){const a=P.wantAds;if(el.btnAds._on!==a){el.btnAds._on=a;el.btnAds.classList.toggle('on',a);}const c=P.crouching;if(el.btnCrouch._on!==c){el.btnCrouch._on=c;el.btnCrouch.classList.toggle('on',c);}}}
function simStep(dt,raw){G.time+=dt;G.stats.time+=dt;G.prompt='';if(frame%6===0)AU.shots=0;
  const guest=MP.on&&!MP.host&&mpMode().coop; // a co-op guest: the host runs the hostiles and the mission
  if(MP.on&&!P.alive)mpDead(dt);else{gatherInput();updPlayer(dt);updCamera(dt);}
  if(guest)coPuppets(dt);else updAI(dt);updNades(dt);updProps(dt);updPicks(dt);if(!guest)missionUpdate(dt);if(MP.on)mpTick(dt,raw);
  if(G.state==='play'||G.state==='dead')hud(dt);IN.use=false;
  {const lowHp=P.hp<30;if(lowHp!==G.lowHp&&AU.ctx){G.lowHp=lowHp;try{AU.lp.frequency.cancelScheduledValues(AU.ctx.currentTime);AU.lp.frequency.setTargetAtTime(lowHp?1300:18000,AU.ctx.currentTime,.25);}catch(e){}}}
  // drop quality once if the frame rate stays low
  slowT+=raw;slowN++;if(slowN>=90){const avg=slowT/slowN;slowT=0;slowN=0;if(avg>.034){if(Q.pr>1){Q.pr=Math.max(1,Q.pr-.25);renderer.setPixelRatio(Q.pr);resize();}else if(Q.shadows){el.optShadow.checked=false;SAVE.shadow=false;setShadows(false);}
      else if(Q.far>330)Q.far=Math.max(330,Q.far-60);}}}
function tick(now){requestAnimationFrame(tick);if(G.state==='lost')return;const raw=(now-last)/1000,dt=clamp(raw,0,.05);last=now;frame++;if(MP.on)mpFrame(raw);
  if(G.state==='menu'||G.state==='win')setView(isTouch?600:820,.42);else setView(Q.far,.2);
  if(G.state==='menu'||G.state==='win'){if(!still)menuT+=dt;const a=.5+menuT*.04;camera.position.set(110+Math.sin(a)*250,80,-430+Math.cos(a)*250);camera.lookAt(110,4,-440);}
  else if(G.state==='play'){try{simStep(dt,raw);}catch(e){if(!G.errN)console.error(e);G.errN=(G.errN||0)+1;}}
  else if(G.state==='dead'){P.deadT+=raw;G.time+=dt;camera.position.y+=(P.y+.35-camera.position.y)*Math.min(1,dt*3);camera.rotation.z+=(.9-camera.rotation.z)*Math.min(1,dt*2.5);gunRoot.visible=false;
    updAI(dt);updNades(dt);updProps(dt);if(P.deadT>1.7&&el.menu.hidden){el.hud.hidden=true;
      showMenu('dead','You are down',G.mode==='mission'?'Halcón, regroup. You restart at the last checkpoint with your squad.':'You held the Glorieta through wave '+(MS.surv?MS.surv.wave:0)+'.',statList());}}
  fxUpdate(dt);sky.position.copy(camera.position);sierra.position.set(camera.position.x,0,camera.position.z);sunSprite.position.copy(camera.position).addScaledVector(SUN,2000);if(Q.shadows)sunFollow(camera.position.x,camera.position.z);
  cullChunks(camera.position.x,camera.position.z);renderer.render(scene,camera);}
window.__game={buildMs:Math.round(performance.now()-T0),sim:(n,dt)=>{for(let i=0;i<n;i++){frame++;if(G.state==='play')simStep(dt,.01);else if(G.state==='dead'){updAI(dt);updNades(dt);updProps(dt);}fxUpdate(dt);}},setShadows,BOT,makeField,flow,flowDir,los,eyeY,chestY,camera,renderer,scene,belfries,buildings,lowCover,G,P,MS,OBJ,foes,allies,ST,IN,startMission,startSurvival,stageStart,stageDone,enterPlay,MP,NET,ARENAS,mpCreate,mpJoin,mpStart,mpSetCfg,mpSetMe,mpLeave,mpEvent,mpOpen,hurt,toMain,pause,explode,humans,damageProp,picks,nades,colliders,Q,WDEF,addPick,explode,spawnWave,restartCheckpoint,SAVE,showWeapon,addSoldier,animSoldier,clearSoldiers,gunRoot,updCamera,cullChunks,cars,BLOCKS,chunkMeshes,freeSpot,heli,
  cam:(x,y,z,tx,ty,tz)=>{camera.position.set(x,y,z);camera.lookAt(tx,ty,tz);}};
el.btnStart.disabled=false;el.btnMapMenu.hidden=false;toMain();mpAuto();requestAnimationFrame(tick);
})();
