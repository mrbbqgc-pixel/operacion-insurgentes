// Three simulated players: create a room, join by code, play Versus (hits, deaths, respawns, grenades, score, end), go back to the lobby, leave.
const {lab,sleep}=require('./mplab');
(async()=>{const L=await lab(3,{players:[{},{mobile:true},{}]});const {ev,st,ui,until,ok}=L;
  console.log('--- lobby');
  ok((await ui(0)).btnMp==='Multiplayer','the menu offers Multiplayer');
  await L.players[0].pg.click('#btnMp');await L.players[0].pg.fill('#mpName','ana');await L.players[0].pg.click('#btnMpCreate');
  await until(0,"__game.MP.phase==='lobby'",8000,'host reaches the lobby');
  const code=await ev(0,'__game.NET.code');ok(/^[A-Z2-9]{5}$/.test(code),'room code '+code);
  let u=await ui(0);ok(u.lobby&&u.code===code&&u.startDis,'host sees the lobby, code shown, Start disabled while alone',u);
  await L.players[1].pg.tap('#btnMp');await L.players[1].pg.fill('#mpName','Beto');await L.players[1].pg.fill('#mpCode',code.toLowerCase());await L.players[1].pg.tap('#btnMpJoin');
  await until(1,"__game.MP.phase==='lobby'&&__game.MP.players.size===2",10000,'guest 1 joins');
  await ev(2,"new Promise(r=>__game.mpJoin('"+code+"','Caro <b>',2,e=>r(e)))");
  await until(0,"__game.MP.players.size===3",8000,'host sees three players');await until(1,"__game.MP.players.size===3",8000,'guest 1 sees three players');
  u=await ui(0);ok(u.list.length===3&&/ANA|ana/i.test(u.list[0])&&!u.startDis,'lobby lists three players and Start is enabled',u.list);
  ok((await st(2)).players.find(p=>p.id===3).name==='CARO B','names are cleaned',(await st(2)).players);
  // a wrong code is refused with a plain message
  const bad=await L.add();await L.players[bad].pg.click('#btnMp');await L.players[bad].pg.fill('#mpCode','ZZZZ9');await L.players[bad].pg.click('#btnMpJoin');
  await until(bad,"/No game with that code/.test(document.getElementById('mpMsg').textContent)",15000,'a wrong code gives a clear message');
  console.log('--- start');
  await ev(0,"(__game.mpSetCfg('arena','plaza'),__game.mpSetCfg('kills',3),1)");await until(1,"__game.MP.cfg.kills===3",4000,'settings reach the guests');
  await L.players[0].pg.click('#btnMpStart');
  for(const k of [0,1,2])await until(k,"__game.G.state==='play'&&__game.MP.phase==='play'",8000,'player '+k+' is in the match');
  await sleep(1200);let S=[await st(0),await st(1),await st(2)];const A={x0:154,z0:-726,x1:358,z1:-594};
  ok(S.every(s=>s.alive&&s.hp===100&&s.x>A.x0&&s.x<A.x1&&s.z>A.z0&&s.z<A.z1),'everyone spawned alive inside the Plaza arena',S.map(s=>[s.x,s.z]));
  ok(Math.hypot(S[0].x-S[1].x,S[0].z-S[1].z)>20&&Math.hypot(S[0].x-S[2].x,S[0].z-S[2].z)>20,'first spawns are spread out');
  ok(S.every(s=>s.rivals===2&&s.mates===0),'in free-for-all everyone else is a rival');
  // replication: where player 1 sees player 0 is where player 0 really is
  const see=(i,j)=>{const p=S[i].players.find(p=>p.id===S[j].me);return Math.hypot(p.sx-S[j].x,p.sz-S[j].z);};
  ok(see(1,0)<1&&see(0,1)<1&&see(2,0)<1&&see(0,2)<1&&see(1,2)<1,'stand-ins sit where the real players are',[see(1,0),see(0,1),see(2,0),see(1,2)]);
  // movement replicates: player 0 walks, player 1 sees it move
  const x0=S[0].x,z0=S[0].z;await ev(0,"(__game.BOT.on=true,__game.BOT.f=1,1)");await sleep(1500);await ev(0,"(__game.BOT.f=0,__game.BOT.on=false,1)");await sleep(400);
  S=[await st(0),await st(1),await st(2)];ok(Math.hypot(S[0].x-x0,S[0].z-z0)>3&&see(1,0)<1.2,'a moving player is followed by its stand-in',[Math.hypot(S[0].x-x0,S[0].z-z0),see(1,0)]);
  console.log('--- combat');
  // put player 0 and player 1 on Calle Allende facing each other, player 2 well away
  await ev(0,"(__t.tp(186,-600),__game.P.spawnT=0,1)");await ev(1,"(__t.tp(200,-600),__game.P.spawnT=0,1)");await ev(2,"(__t.tp(340,-720),1)");await sleep(500);
  ok(await ev(1,"__game.los(200,1.65,-600,186,1.25,-600)"),'the two duellists can see each other');
  await ev(1,"(__t.aim(186,1.25,-600),__game.IN.fire=true,1)");
  const hit=await until(0,"__game.P.hp<100",4000,'player 0 takes damage from player 1');
  await until(0,"!__game.P.alive",6000,'player 0 dies');await ev(1,"(__game.IN.fire=false,1)");await sleep(400);
  S=[await st(0),await st(1),await st(2)];const sc=s=>s.players.map(p=>p.name+' '+p.k+'/'+p.d).join(', ');
  ok(S[0].players.find(p=>p.id===2).k===1&&S[0].players.find(p=>p.id===1).d===1,'the host scores it: BETO 1 kill, ANA 1 death',sc(S[0]));
  ok(S[1].players.find(p=>p.id===2).k===1&&S[2].players.find(p=>p.id===2).k===1,'both guests agree on the score',[sc(S[1]),sc(S[2])]);
  ok(S[1].players.find(p=>p.id===1).alive===false,'the dead player is shown down on the others\' machines');
  ok((await ev(1,'__t.feed()')).some(t=>/KILL|HEADSHOT/.test(t)&&/ANA/.test(t)),'the killer gets a kill confirmation',await ev(1,'__t.feed()'));
  ok((await ev(0,'__t.feed()')).some(t=>/Killed by BETO/.test(t)),'the victim is told who did it',await ev(0,'__t.feed()'));
  ok((await ev(2,'__t.feed()')).some(t=>/BETO killed ANA/.test(t)),'bystanders see the kill in the feed',await ev(2,'__t.feed()'));
  await until(0,"__game.P.alive&&__game.P.hp===100",6000,'player 0 respawns with full health');
  S=[await st(0),await st(1)];ok(Math.hypot(S[0].x-S[1].x,S[0].z-S[1].z)>18,'the respawn is away from the killer',[S[0].x,S[0].z]);
  await until(1,"__game.MP.players.get(1).alive&&__game.MP.players.get(1).s.g.visible",3000,'the others see the respawned player again');
  // spawn protection: shots in the first moments do nothing
  await ev(0,"(__t.tp(186,-600),1)");await ev(1,"(__t.aim(186,1.25,-600),__game.IN.fire=true,1)");await sleep(700);ok((await st(0)).hp===100,'a freshly spawned player is protected for a moment');
  await ev(1,"(__game.IN.fire=false,1)");
  // grenade: player 2 throws one at its own feet next to player 1 (who is not protected)
  await ev(1,"(__t.tp(300,-600),__game.P.spawnT=0,__game.P.hp=100,1)");await ev(2,"(__t.tp(303,-600),__game.P.spawnT=0,1)");await sleep(250);await ev(2,"(__t.aim(300,1,-600),__game.P.pitch=-1.45,__game.IN.nade=true,1)");
  await until(1,"__game.nades.length>0&&__game.nades[0].rep",3000,'the other players see the grenade in the air');
  await until(1,"__game.P.hp<100||!__game.P.alive",6000,'the grenade hurts the player it lands next to');
  ok((await ev(1,'__game.P.lastBy'))===3,'and the damage is put down to the thrower');
  await sleep(600);ok((await ev(1,'__game.nades.length'))===0,'the copy of the grenade is gone after the blast');
  console.log('--- pause menu, reach the kill limit, results');
  await ev(2,"(__game.pause(),1)");let s2=await st(2);ok(s2.state==='play'&&s2.menuUp&&(await ui(2)).btnQuit==='Leave game','the game menu opens without stopping the game',[s2.state,s2.menuUp,(await ui(2)).btnQuit]);
  await L.players[2].pg.click('#btnStart');ok(!(await st(2)).menuUp,'Resume closes the game menu');
  for(let r=0;r<2;r++){await until(0,"__game.P.alive",8000,'player 0 is alive for round '+(r+2));await ev(0,"(__t.tp(186,-600),__game.P.spawnT=0,1)");await ev(1,"(__game.P.alive||0,__t.tp(200,-600),__game.P.spawnT=0,__game.P.hp=100,1)");await sleep(350);
    await ev(1,"(__t.aim(186,1.25,-600),__game.IN.fire=true,1)");await until(0,"!__game.P.alive",7000,'player 0 dies again');await ev(1,"(__game.IN.fire=false,1)");await sleep(300);}
  for(const k of [0,1,2])await until(k,"__game.MP.phase==='end'&&__game.G.state==='win'",6000,'player '+k+' sees the end of the match');
  u=await ui(1);ok(/BETO wins/.test(u.title)&&u.stats.length===3&&/BETO/.test(u.stats[0])&&u.btnStart==='(hidden)'&&u.btnQuit==='Leave game','results for a guest: winner, table, only Leave',u);
  u=await ui(0);ok(u.btnStart==='Back to lobby','the host can take everyone back to the lobby',u.btnStart);
  await L.shot(0,'mp-results');
  await L.players[0].pg.click('#btnStart');for(const k of [0,1,2])await until(k,"__game.MP.phase==='lobby'&&__game.G.state==='menu'&&!document.getElementById('mpLobby').hidden",6000,'player '+k+' is back in the lobby');
  console.log('--- teams');
  await ev(0,"(__game.mpSetCfg('mode','tdm'),__game.mpSetCfg('kills',10),1)");await sleep(400);await L.players[0].pg.click('#btnMpStart');
  for(const k of [0,1,2])await until(k,"__game.G.state==='play'",8000,'player '+k+' is in the team match');await sleep(900);
  S=[await st(0),await st(1),await st(2)];const tm=S[0].players.map(p=>p.team);ok(tm.filter(t=>t===1).length>=1&&tm.filter(t=>t===2).length>=1,'two teams, neither empty',tm);
  const mateOf0=S[0].players.find(p=>p.id!==1&&p.team===S[0].players.find(q=>q.id===1).team);
  ok(S[0].mates===(mateOf0?1:0)&&S[0].rivals===(mateOf0?1:2),'team mates and rivals are told apart',[S[0].mates,S[0].rivals]);
  if(mateOf0){const m=mateOf0.id-1;await ev(0,"(__t.tp(186,-600),__game.P.spawnT=0,1)");await ev(m,"(__t.tp(200,-600),__game.P.spawnT=0,__t.aim(186,1.25,-600),__game.IN.fire=true,1)");await sleep(1500);await ev(m,"(__game.IN.fire=false,1)");
    ok((await st(0)).hp===100,'team mates cannot shoot each other');}
  await L.shot(1,'mp-play-phone');
  console.log('--- leaving');
  await ev(2,"(__game.pause(),1)");await L.players[2].pg.click('#btnQuit');await until(0,"__game.MP.players.size===2",6000,'the host notices a player leaving');
  ok((await st(2)).state==='menu'&&!(await st(2)).on,'the player who left is back at the main menu');
  await ev(0,"(__game.pause(),1)");await sleep(300);
  await L.players[0].pg.click('#btnQuit');
  await until(1,"!__game.MP.on&&__game.G.state==='menu'&&/host closed the game/i.test(document.getElementById('mpMsg').textContent)",8000,'when the host leaves, the guest is told and returned to the menu');
  ok(S.every(s=>s.errN===0)&&(await st(1)).errN===0,'no errors inside the game loop');
  await L.close();
})().catch(e=>{console.error('FAIL',e);process.exit(1);});
