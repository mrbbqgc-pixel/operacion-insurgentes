// Two bots play the whole story mission together, host and guest, at about four times real time.
// node mp-mission.js [acc] [minutes] [first stage]     (acc 0 = real time)
const {lab,sleep}=require('./mplab');const fs=require('fs'),path=require('path');
(async()=>{const acc=process.argv[2]===undefined?3:+process.argv[2],mins=+(process.argv[3]||7);
  const L=await lab(2,{players:[{},{mobile:true}]});const {ev,st,ui,until,ok}=L,bot=fs.readFileSync(path.join(__dirname,'botmp.js'),'utf8');for(const k of [0,1])await ev(k,bot);
  await ev(0,"new Promise(r=>__game.mpCreate('ANA',e=>r(e)))");const code=await ev(0,'__game.NET.code');
  await ev(1,"new Promise(r=>__game.mpJoin('"+code+"','BETO',0,e=>r(e)))");await until(0,"__game.MP.players.size===2",8000,'two players in the lobby');
  await ev(0,"(__game.mpSetCfg('mode','miss'),__game.mpSetCfg('diff',0),__game.mpSetCfg('stage',"+(+process.argv[4]||0)+"),__game.mpStart(),1)");
  for(const k of [0,1])await until(k,"__game.G.state==='play'&&__game.G.mode==='mission'",8000,'player '+k+' is in the mission');
  const O="{acc:"+acc+",human:{react:.35,err:.012,aim:3},pick:true,crouch:true}";for(const k of [0,1])await ev(k,"(__botmp.start("+O+"),1)");
  const t0=Date.now(),seen=[new Set(),new Set()],flags={jamGuest:false,jamGone:false,heliGuest:false,plantSub:false,ckpt:0};let last='';
  while(Date.now()-t0<mins*60000){await sleep(1500);const a=await ev(0,"({ph:__game.MP.phase,i:__game.MS.i,sub:__game.OBJ.sub,jam:!!__game.MS.jam,foes:__game.foes.filter(f=>f.alive).length,alive:__game.P.alive,err:__game.G.errN||0,be:__botmp.err||''})"),
      b=await ev(1,"({ph:__game.MP.phase,i:__game.MS.i,sub:__game.OBJ.sub,jam:!!__game.MS.jam,heli:!!(__game.scene.children.length&&__game.MS.st&&(__game.MS.st.heli||__game.MS.st.type==='reach')),foes:__game.foes.filter(f=>f.alive).length,alive:__game.P.alive,err:__game.G.errN||0,be:__botmp.err||'',feed:__t.feed().join('|')})");
    seen[0].add(a.i);seen[1].add(b.i);if(b.i===4&&b.jam)flags.jamGuest=true;if(flags.jamGuest&&b.i>=5&&!b.jam)flags.jamGone=true;if(b.i>=6&&b.heli)flags.heliGuest=true;if(/Planting|Detonation/.test(b.sub))flags.plantSub=true;
    if(/Back to the checkpoint/.test(b.feed))flags.ckpt++;
    const line='stage '+a.i+'/'+b.i+' | '+a.sub+' | foes '+a.foes+'/'+b.foes+' | alive '+(a.alive?1:0)+(b.alive?1:0);if(line!==last){console.log('  '+String(Math.round((Date.now()-t0)/1000)).padStart(4)+'s  '+line);last=line;}
    if(a.err||b.err||a.be||b.be){console.log('  errors',a.err,b.err,a.be,b.be);break;}if(a.ph==='end'&&b.ph==='end')break;}
  const u0=await ui(0),u1=await ui(1);
  ok(u0.title==='Mission complete'&&u1.title==='Mission complete','both players see "Mission complete"',[u0.title,u1.title]);
  ok([0,1,2,3,4,5,6].every(i=>seen[1].has(i)),'the guest went through every stage',Array.from(seen[1]));
  ok(flags.jamGuest&&flags.jamGone,'the guest saw the jammer truck, and saw it gone after the charge',flags);
  ok(flags.plantSub,'the guest followed the planting and the countdown');ok(flags.heliGuest,'the guest got the helicopter stages');
  ok(u1.stats.length===2,'results list both players',u1.stats);
  const h1=await ev(1,"({on:__game.heli.on,vis:!!(__game.heli.g&&__game.heli.g.visible)})");ok(!h1.on&&!h1.vis,'the helicopter is put away on the guest\'s results screen',h1);
  console.log('  host log: '+JSON.stringify(await ev(0,'__botmp.log')).slice(0,900));console.log('  guest log: '+JSON.stringify(await ev(1,'__botmp.log')).slice(0,900));
  console.log('  host table: '+JSON.stringify(await ev(0,"Array.from(__game.MP.players.values(),p=>[p.name,p.k,p.d,p.sc])"))+'  checkpoint restarts seen by the guest: '+flags.ckpt);
  ok((await st(0)).errN===0&&(await st(1)).errN===0,'no errors inside the game loop');
  await L.close();
})().catch(e=>{console.error('FAIL',e);process.exit(1);});
