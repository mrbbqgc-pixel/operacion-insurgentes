// Awkward cases for the multiplayer code: bad numbers from the network, messages that overtake each other, a broker line that
// drops, a player whose game stops drawing, lost graphics, and what one round leaves behind for the next.
const {lab,sleep}=require('./mplab');
const tmo=(p,ms)=>Promise.race([p,new Promise(r=>setTimeout(()=>r('TIMEOUT'),ms))]);
(async()=>{const L=await lab(3);const {ev,st,ui,until,ok}=L;
  const inMatch=async ks=>{for(const k of ks)await until(k,"__game.G.state==='play'&&__game.MP.phase==='play'&&__game.P.alive",8000,'player '+k+' is in the match');};
  // kill player k on its own machine, as if player `by` had done it
  const kill=(k,by)=>ev(k,"(()=>{const g=__game,P=g.P;P.spawnT=0;P.lastBy="+by+";P.lastW=0;P.lastHead=false;P.lastT=g.G.time;g.hurt(999,P.x,P.z);return 1})()");
  // one of player 2's barrels is already gone before the game (as after a single-player game)
  const bar=await ev(2,"(()=>{const g=__game,c=g.colliders.find(c=>c.kind===3&&!c.off&&c.hp>0);g.startSurvival();g.enterPlay();g.damageProp(c,999);g.sim(40,.02);g.toMain();return [c.id,c.off]})()");
  await ev(0,"new Promise(r=>__game.mpCreate('ANA',e=>r(e)))");const code=await ev(0,'__game.NET.code');
  for(const k of [1,2])await ev(k,"new Promise(r=>__game.mpJoin('"+code+"','"+['','BETO','CARO'][k]+"',0,e=>r(e)))");
  await until(0,"__game.MP.players.size===3",8000,'three players in the lobby');
  await ev(0,"(__game.mpSetCfg('mode','tdm'),__game.mpSetCfg('kills',40),__game.mpStart(),1)");await inMatch([0,1,2]);

  console.log('--- what a round starts with');
  ok(bar[1]===true,'(the barrel was blown before the game)',bar);
  for(const k of [0,1])await until(k,"__game.colliders["+bar[0]+"].off===true",3000,'a barrel that was gone for one player is gone for player '+k);

  console.log('--- numbers from the network');
  await sleep(600);const yaw0=await ev(0,"__game.MP.players.get(2).nyaw");
  await ev(1,"(()=>{const g=__game;for(const y of [1e300,-1e300,'e5',null,[1,2],{a:1},1/0,0/0])g.NET.up.send(['s',100,0,100,y,0,1,0,100,0,++g.MP.txSeq]);g.NET.up.send(['s',1e300,0,'x',0,0,1,0,100,0,++g.MP.txSeq]);return 1})()");
  await sleep(500);const alive=await tmo(ev(0,"(()=>{const p=__game.MP.players.get(2);return [p.nyaw,p.s.yaw,p.nx,p.nz,p.x,p.z]})()"),4000);
  ok(alive!=='TIMEOUT'&&alive.every(v=>typeof v==='number'&&isFinite(v))&&Math.abs(alive[0])<=3300&&Math.abs(alive[1])<7,'a report with absurd numbers does not stall the host, and is not passed on',alive);
  const g2=await tmo(ev(2,"(()=>{const p=__game.MP.players.get(2);return [p.nyaw,p.s.yaw,p.x,p.z]})()"),4000);ok(g2!=='TIMEOUT'&&g2.every(v=>typeof v==='number'&&isFinite(v)),'the other guest is fine too',g2);
  // a report that was overtaken on the way is ignored
  const old=await ev(1,"(()=>{const g=__game;g.NET.up.send(['s',99900,0,99900,0,0,1,0,100,0,g.MP.txSeq-3]);return 1})()");await sleep(250);
  const px=await ev(0,"__game.MP.players.get(2).nx");ok(px!==99900,'a late copy of an old report is dropped',px);

  console.log('--- the host loses its line to the connection service for a moment');
  const before=await ev(0,"({nextId:__game.MP.nextId,team:__game.MP.players.get(1).team,n:__game.MP.players.size})");
  await ev(0,"(__game.NET.peer.disconnect(),1)");await sleep(4500);
  const after=await ev(0,"({phase:__game.MP.phase,state:__game.G.state,nextId:__game.MP.nextId,team:__game.MP.players.get(1).team,n:__game.MP.players.size,open:__game.NET.peer.open})");
  ok(after.phase==='play'&&after.state==='play'&&after.nextId===before.nextId&&after.team===before.team&&after.n===3,'the match goes on untouched',[before,after]);
  ok(after.open===true,'and the room can be found again',after.open);
  ok((await st(1)).phase==='play'&&(await st(2)).phase==='play','the guests noticed nothing');

  console.log('--- team totals');
  // teams: ANA 1, BETO 2, CARO 1.  CARO scores for team 1, then leaves.
  const teams=await ev(0,"Array.from(__game.MP.players.values(),p=>p.team)");ok(teams.join()==='1,2,1','teams are 1,2,1',teams);
  await kill(1,3);await until(0,"__game.MP.tk[1]===1&&__game.MP.players.get(3).k===1",3000,'the host counts CARO\'s kill for team 1');
  await until(1,"__game.MP.tk[1]===1",3000,'the victim counts it too');
  await ev(2,"(__game.mpLeave(),__game.toMain(),1)");await until(0,"__game.MP.players.size===2",5000,'CARO has left');await sleep(1300);
  const tk=[await ev(0,"__game.MP.tk.slice()"),await ev(1,"__game.MP.tk.slice()"),await ev(0,"__game.OBJ.sub"),await ev(1,"__game.OBJ.sub")];
  ok(tk[0][1]===1&&tk[1][1]===1&&/Your team 1 · Other team 0/.test(tk[2])&&/Your team 0 · Other team 1/.test(tk[3]),'team 1 keeps the kill of the player who left',tk);

  console.log('--- a player whose game has stopped drawing is killed');
  await until(1,"__game.P.alive",8000,'BETO is back');await sleep(300);
  await ev(1,"(()=>{__game.P.spawnT=0;window.__raf=window.requestAnimationFrame;window.requestAnimationFrame=cb=>{window.__cb=cb;return 0;};Object.defineProperty(document,'hidden',{get:()=>true,configurable:true});return 1})()");await sleep(400);
  await ev(0,"(__game.mpEvent('hit',2,[500,1,0,0,0]),1)");
  await until(0,"__game.MP.players.get(2).alive===false&&__game.MP.players.get(2).s.alive===false",2500,'the host shows him down at once');
  await sleep(3200);ok(await ev(0,"__game.MP.players.get(2).alive===false&&__game.MP.players.get(2).s.alive===false"),'and he stays down while his game stands still');
  ok(await ev(0,"__game.MP.players.get(2).d>=2&&__game.MP.tk[1]===2"),'the kill is scored',await ev(0,"[__game.MP.players.get(2).d,__game.MP.tk]"));
  // keys pressed while down must not act at the respawn
  await ev(1,"(()=>{for(const c of ['KeyG','KeyC','KeyR','KeyV','Space']){window.dispatchEvent(new KeyboardEvent('keydown',{code:c,bubbles:true}));document.dispatchEvent(new KeyboardEvent('keydown',{code:c,bubbles:true}));window.dispatchEvent(new KeyboardEvent('keyup',{code:c,bubbles:true}));document.dispatchEvent(new KeyboardEvent('keyup',{code:c,bubbles:true}));}return 1})()");
  await ev(1,"(()=>{delete document.hidden;window.requestAnimationFrame=window.__raf;window.__raf(window.__cb);return 1})()");
  await until(1,"__game.P.alive",9000,'he comes back when his game runs again');await sleep(500);
  const r1=await ev(1,"({nades:__game.P.nades,crouch:__game.P.crouching,live:__game.nades.length,y:__game.P.y})");ok(r1.nades===2&&!r1.crouch&&r1.live===0,'keys pressed while down did nothing at the respawn',r1);
  await until(0,"__game.MP.players.get(2).alive===true&&__game.MP.players.get(2).s.alive===true",3000,'and the host sees him up again');

  console.log('--- the difficulty menu during a round');
  const d0=await ev(1,"(()=>{const g=__game,o=document.getElementById('optDiff'),was=[g.G.dmgK,g.G.diff];o.value=o.value==='2'?'0':'2';o.dispatchEvent(new Event('change',{bubbles:true}));return [was,[g.G.dmgK,g.G.diff],g.SAVE.diff]})()");
  ok(d0[0][0]===1&&d0[1][0]===1&&d0[0][1]===d0[1][1],'changing it does not change the damage in a multiplayer round',d0);

  console.log('--- messages that overtake each other at the end of a round');
  // the guest gets "end" two seconds late, after "back to the lobby"
  await ev(1,"(()=>{const o=__game.NET.onData;window.__o=o;__game.NET.onData=(c,d)=>{if(Array.isArray(d)&&d[0]==='end')setTimeout(()=>o(c,d),2000);else o(c,d);};__game.P.ads=1;__game.camera.fov=15;return 1})()");
  await ev(0,"(__game.MP.tLeft=0.05,1)");await until(0,"__game.MP.phase==='end'&&__game.G.state==='win'",4000,'the host ends the round');
  let u=await ui(0);ok(/Team 1 wins/.test(u.title)&&/Team 1: 2 · Team 2: 0/.test(await ev(0,"document.getElementById('menuMsg').textContent")),'results give the teams\' totals',[u.title,await ev(0,"document.getElementById('menuMsg').textContent")]);
  await L.players[0].pg.click('#btnStart');await until(1,"__game.MP.phase==='lobby'&&__game.G.state==='menu'",4000,'the guest follows the host to the lobby');
  await sleep(2600);const s1=await st(1);u=await ui(1);ok(s1.phase==='lobby'&&s1.state==='menu'&&u.lobby&&u.title==='Multiplayer','a late "end" does not pull the guest out of the lobby',[s1.phase,s1.state,u.title]);
  ok(Math.abs(await ev(1,"__game.camera.fov-__game.P.baseFov"))<.01,'the camera is back to its normal field of view');
  await ev(1,"(__game.NET.onData=window.__o,1)");

  console.log('--- next round: nothing left over from the last one');
  await L.add();await ev(3,"new Promise(r=>__game.mpJoin('"+code+"','DANI',0,e=>r(e)))");await until(0,"__game.MP.players.size===3",8000,'a new player joined after the reconnect');
  ok(await ev(3,"__game.MP.me")===4,'and got a number of its own',await ev(3,"__game.MP.me"));
  await ev(1,"(()=>{const o=__game.NET.onData;window.__log=[];__game.NET.onData=(c,d)=>{if(Array.isArray(d)&&d[0]==='S'&&window.__log.length<3){const a=d[2].find(p=>p[0]===1);window.__log.push(a?a.slice(0,7):null);}o(c,d);};return 1})()");
  await ev(0,"(__game.mpSetCfg('mode','ffa'),__game.mpStart(),1)");await inMatch([0,1,3]);await sleep(500);
  const lg=await ev(1,"window.__log"),hp=await ev(0,"[__game.P.x,__game.P.z]");
  ok(lg.length>0&&lg.every(a=>a&&(!(a[6]&1)||Math.hypot(a[1]/100-hp[0],a[3]/100-hp[1])<25)),'the first snapshots do not replay last round\'s positions',[lg,hp]);
  ok(await ev(1,"__game.MP.tk[1]===0&&__game.MP.tk[2]===0"),'team totals start from zero');
  // the shooter stands exactly on the x=0 line: the damage arc must still point at him
  await ev(1,"(__t.tp(180,-650,0),__game.P.spawnT=0,__game.G.arcs.length=0,1)");await sleep(200);await ev(0,"(__game.mpEvent('hit',2,[5,1,0,0,-650]),1)");
  const arc=await until(1,"__game.G.arcs.length&&JSON.stringify(__game.G.arcs[0])",2000,'a damage arc shows');console.log('     arc '+arc);

  console.log('--- late joiner whose "start" arrives after the round has ended');
  await L.add();
  const jn=ev(4,"new Promise(r=>{__game.mpJoin('"+code+"','EVA',0,e=>r(e));const o=__game.NET.onData;__game.NET.onData=(c,d)=>{if(Array.isArray(d)&&d[0]==='start')setTimeout(()=>o(c,d),2500);else o(c,d);};})");
  await until(0,"__game.MP.players.size===4",8000,'EVA joined during the round');await jn;
  await ev(0,"(__game.MP.tLeft=0.05,1)");await until(0,"__game.MP.phase==='end'",4000,'the round ends before her "start" arrives');
  await sleep(3200);const s4=await st(4);ok(s4.state!=='play'&&s4.phase==='end','she is shown the results, not dropped into a finished round',[s4.state,s4.phase,(await ui(4)).title]);
  await L.players[0].pg.click('#btnStart');for(const k of [1,3,4])await until(k,"__game.MP.phase==='lobby'&&__game.G.state==='menu'",5000,'player '+k+' is back in the lobby');

  console.log('--- a phone reclaims the graphics while its player waits in the lobby');
  await ev(3,"(__game.renderer.domElement.dispatchEvent(new Event('webglcontextlost',{cancelable:true})),1)");await sleep(600);
  u=await ui(3);const s3=await st(3);ok(s3.state==='lost'&&!s3.on&&u.title==='Graphics were reset'&&u.btnStart==='Reload'&&!u.mpUi,'that player is told to reload, and has left the room',[s3.state,s3.on,u.title,u.btnStart,u.mpUi]);
  await until(0,"__game.MP.players.size===3",5000,'the host sees that player go');
  await ev(0,"(__game.mpStart(),1)");await inMatch([0,1,4]);ok((await st(3)).state==='lost','and the start of the next round leaves that page alone');
  ok((await st(0)).errN===0&&(await st(1)).errN===0&&(await st(4)).errN===0,'no errors inside the game loop');
  await L.close();
})().catch(e=>{console.error('FAIL',e);process.exit(1);});
