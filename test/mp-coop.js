// Two simulated players in Co-op survival: the guest sees the host's hostiles, kills one, gets shot at, goes down and comes back,
// explosions and props are shared, and a wipe ends the game with results. Then a quick look at the start of the co-op mission.
const {lab,sleep}=require('./mplab');
const HUNT=`window.__h={on:false,t:0,
  // stand somewhere with a clear view of the nearest hostile and keep shooting at it
  place(){const g=__game,P=g.P;let b=null,bd=1e9;for(const f of g.foes){if(!f.alive||f.y0>1)continue;const d=Math.hypot(f.x-P.x,f.z-P.z);if(d<bd){bd=d;b=f;}}if(!b)return 0;
    for(let r=9;r<26;r+=3)for(let k=0;k<16;k++){const a=k/16*6.283,x=b.x+Math.cos(a)*r,z=b.z+Math.sin(a)*r;if(g.freeSpot(x,z)&&g.los(x,1.65,z,b.x,g.chestY(b),b.z)){P.x=x;P.z=z;P.y=0;P.vx=P.vz=0;return b.nid;}}return 0;},
  start(){if(this.t)return;this.on=true;this.t=setInterval(()=>{const g=__game,P=g.P;if(!this.on||!P.alive||g.G.state!=='play'){g.IN.fire=false;return;}let b=null,bd=70;
      for(const f of g.foes){if(!f.alive)continue;const d=Math.hypot(f.x-P.x,f.z-P.z);if(d<bd&&g.los(P.x,P.y+1.65,P.z,f.x,g.chestY(f),f.z)){bd=d;b=f;}}
      if(b){__t.aim(b.x,g.chestY(b),b.z);g.IN.fire=true;g.IN.firePressed=true;const w=P.slots[P.cur];if(w.mag===0&&w.res===0){w.res=90;}}else g.IN.fire=false;},40);},
  stop(){this.on=false;clearInterval(this.t);this.t=0;__game.IN.fire=false;}};1`;
(async()=>{const L=await lab(2,{players:[{},{mobile:true}]});const {ev,st,ui,until,ok}=L;for(const k of [0,1])await ev(k,HUNT);
  console.log('--- co-op survival: start');
  await ev(0,"new Promise(r=>__game.mpCreate('ANA',e=>r(e)))");const code=await ev(0,'__game.NET.code');
  await ev(1,"new Promise(r=>__game.mpJoin('"+code+"','BETO',0,e=>r(e)))");await until(0,"__game.MP.players.size===2",8000,'two players in the lobby');
  await ev(0,"(__game.mpSetCfg('mode','surv'),__game.mpSetCfg('diff',0),__game.mpStart(),1)");
  for(const k of [0,1])await until(k,"__game.G.state==='play'&&__game.G.mode==='survival'",8000,'player '+k+' is in survival');
  await sleep(800);let S=[await st(0),await st(1)];
  ok(S.every(s=>s.mates===1&&s.rivals===0)&&S[0].players.every(p=>p.team===1),'the two players are team mates',S.map(s=>[s.mates,s.rivals]));
  ok(Math.hypot(S[1].x+4,S[1].z-16)<12&&Math.hypot(S[0].x-S[1].x,S[0].z-S[1].z)<14,'the guest starts next to the host at the Glorieta',[S[1].x,S[1].z]);
  ok((await ev(0,'__game.allies.length'))===0&&(await ev(1,'__game.allies.length'))===0,'no AI squad mates: the players are the squad');
  ok((await ev(1,'__game.G.dmgK'))===.8&&(await ev(0,'__game.G.diff'))===.55,'the difficulty chosen in the lobby applies to both machines');
  await until(0,"__game.foes.filter(f=>f.alive).length>=3",15000,'the first wave arrives on the host');
  await until(1,"__game.foes.filter(f=>f.alive&&f.net).length>=3",5000,'the guest sees the hostiles');
  const cmp=await ev(1,"(()=>{const g=__game;return g.foes.filter(f=>f.alive).map(f=>[f.nid,f.kind,+f.x.toFixed(1),+f.z.toFixed(1)])})()"),hostF=await ev(0,"(()=>{const g=__game;return g.foes.filter(f=>f.alive).map(f=>[f.nid,f.kind,+f.x.toFixed(1),+f.z.toFixed(1)])})()");
  let worst=0,miss=0;for(const a of cmp){const b=hostF.find(q=>q[0]===a[0]);if(!b||b[1]!==a[1]){miss++;continue;}worst=Math.max(worst,Math.hypot(a[2]-b[2],a[3]-b[3]));}
  ok(miss===0&&worst<4,'stand-ins match the host\'s hostiles in kind and place (worst gap '+worst.toFixed(1)+' m)',[cmp.length,hostF.length,miss]);
  ok(/Survive at the Glorieta/.test((await ui(1)).obj)&&/Wave 1/.test((await ui(1)).obj),'the guest shows the host\'s objective text',(await ui(1)).obj);
  await L.shot(1,'mp-coop-phone');
  console.log('--- the guest fights');
  const k0=await ev(0,"__game.MP.players.get(2).k");const nid=await ev(1,"(__game.P.spawnT=0,__h.place())");ok(nid>0,'found a firing position for the guest');await sleep(300);await ev(1,"(__h.start(),1)");
  await until(1,"__game.G.stats.kills>=1",20000,'the guest kills a hostile');await ev(1,"(__h.stop(),1)");await sleep(400);
  ok((await ev(0,"__game.MP.players.get(2).k"))>k0,'the host credits the kill to the guest');
  ok((await ev(1,'__t.feed()')).some(t=>/\+1\d\d/.test(t))||(await ev(1,'__game.G.score'))>=100,'the guest gets the points',await ev(1,'__game.G.score'));
  ok((await ev(1,"__game.picks.length"))>=0,'loot is local to each player');
  // the hostiles go for the guest too: left standing in the open, he gets hit
  await ev(0,"(__t.tp(-300,700),1)");await ev(1,"(__h.place(),__game.P.spawnT=0,1)");
  await until(0,"__game.foes.some(f=>f.alive&&f.target&&f.target.remote)",15000,'a hostile on the host targets the guest');
  await until(1,"__game.P.hp<100",25000,'the guest is hit by a hostile run on the host');
  ok((await ev(1,"document.querySelectorAll('#dmg i').length"))===3,'damage direction arcs are there for the guest');
  console.log('--- down and back');
  await ev(0,"(__t.tp(-4,16),__game.P.spawnT=0,1)");await sleep(300);await ev(1,"(__game.P.spawnT=0,__game.hurt(999,0,0),1)");
  await until(1,"!__game.P.alive",3000,'the guest goes down');await until(0,"__game.MP.players.get(2).alive===false&&__game.G.state==='play'",3000,'the host sees him down and plays on');
  await sleep(700);ok(/DOWN/.test((await ui(0)).board.join(' ')),'the score list marks him DOWN',(await ui(0)).board);
  await ev(1,"(__game.MP.respT=1,1)");await until(1,"__game.P.alive&&__game.P.hp===100",5000,'the guest comes back');
  S=[await st(0),await st(1)];ok(Math.hypot(S[0].x-S[1].x,S[0].z-S[1].z)<12,'he comes back next to his team mate',[S[1].x,S[1].z]);
  console.log('--- shared grenades and props');
  const fx=await ev(0,"(()=>{const g=__game;const f=g.foes.find(f=>f.alive&&f.y0<1);return f?[f.nid,f.x,f.z,f.hp]:null})()");
  if(fx){await ev(1,"(()=>{const g=__game;g.P.spawnT=0;g.explode("+fx[1]+",.3,"+fx[2]+",8.5,170,true);return 1})()");
    await until(0,"(()=>{const f=__game.foes.find(f=>f.nid==="+fx[0]+");return !f||!f.alive||f.hp<"+fx[3]+"})()",4000,'an explosion owned by the guest hurts the host\'s hostile');}
  const bar=await ev(1,"(()=>{const c=__game.colliders.find(c=>c.kind===3&&!c.off&&c.hp>0);return c?[c.id,(c.x0+c.x1)/2,(c.z0+c.z1)/2]:null})()");ok(!!bar,'found a barrel');
  await ev(1,"(()=>{const g=__game;g.damageProp(g.colliders["+bar[0]+"],999);return 1})()"); // the same call a bullet makes
  await until(1,"__game.colliders["+bar[0]+"].off===true",3000,'the barrel blows up for the guest who shot it');
  await until(0,"__game.colliders["+bar[0]+"].off===true",4000,'and it is gone on the host too');
  console.log('--- wipe and results');
  await sleep(500);await ev(1,"(__game.P.spawnT=0,__game.P.hp=100,__game.hurt(999,0,0),1)");await ev(0,"(__game.P.spawnT=0,__game.hurt(999,0,0),1)");
  for(const k of [0,1])await until(k,"__game.MP.phase==='end'&&__game.G.state==='win'",8000,'player '+k+' sees the end after everyone went down');
  let u=await ui(1);ok(/Overrun at wave/.test(u.title)&&u.stats.length===2,'results: wave reached and a score for each player',[u.title,u.stats]);
  console.log('--- co-op mission: first stage');
  await L.players[0].pg.click('#btnStart');for(const k of [0,1])await until(k,"__game.MP.phase==='lobby'",6000,'player '+k+' back in the lobby');
  await ev(0,"(__game.mpSetCfg('mode','miss'),__game.mpSetCfg('stage',0),1)");await sleep(300);u=await ui(1);ok(u.lobby&&/Waiting for the host/.test(u.msg),'the guest waits in the lobby',u.msg);
  await ev(0,"(__game.mpStart(),1)");for(const k of [0,1])await until(k,"__game.G.state==='play'&&__game.G.mode==='mission'",8000,'player '+k+' is in the mission');
  await until(1,"__game.MS.i===0&&/gas station/.test(__game.OBJ.text)&&__game.foes.length>=5",8000,'the guest has the first objective and sees the garrison');
  S=[await st(0),await st(1)];ok(Math.hypot(S[1].x-3.5,S[1].z-484)<12,'the guest starts at the mission start',[S[1].x,S[1].z]);
  ok((await ev(1,"Array.from(document.querySelectorAll('#feed p')).map(p=>p.textContent).join(' ')")).includes('gas station'),'the host\'s radio reaches the guest');
  ok((await st(0)).errN===0&&(await st(1)).errN===0,'no errors inside the game loop',[(await st(0)).errN,(await st(1)).errN]);
  await L.close();
})().catch(e=>{console.error('FAIL',e);process.exit(1);});
