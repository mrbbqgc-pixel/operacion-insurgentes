// Multiplayer test lab: several players, each in a headless browser of its own (tabs of one browser are throttled),
// playing the built site through a local PeerServer. Drawing is switched off so that every page runs in real time.
const {chromium}=require('playwright-core');const {PeerServer}=require('peer');const fs=require('fs'),path=require('path'),http=require('http'),net=require('net');
const CHROME=process.env.CHROME_PATH||'/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const TYPES={'.html':'text/html; charset=utf-8','.png':'image/png','.jpg':'image/jpeg','.webmanifest':'application/manifest+json','.js':'text/javascript'};
const freePort=()=>new Promise(ok=>{const s=net.createServer();s.listen(0,'127.0.0.1',()=>{const p=s.address().port;s.close(()=>ok(p));});});
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
// helpers that every page gets: teleport, aim, a summary of the state
const HELPERS=`window.__t={
  tp(x,z,yaw){const P=__game.P;P.x=x;P.z=z;P.y=0;P.vx=P.vz=P.vy=0;if(yaw!==undefined)P.yaw=yaw;return 1;},
  aim(x,y,z){const P=__game.P,dx=x-P.x,dz=z-P.z,d=Math.hypot(dx,dz);P.yaw=Math.atan2(-dx,-dz);P.pitch=Math.atan2(y-(P.y+1.65),d);P.recoil=0;return 1;},
  st(){const g=__game,P=g.P,M=g.MP;return{state:g.G.state,mode:g.G.mode,phase:M.phase,on:M.on,me:M.me,host:M.host,alive:P.alive,hp:Math.round(P.hp),x:+P.x.toFixed(1),z:+P.z.toFixed(1),menuUp:!!g.G.menuUp,tLeft:Math.round(M.tLeft),
    w:P.slots[P.cur]?P.slots[P.cur].id:'',players:Array.from(M.players.values(),p=>({id:p.id,name:p.name,team:p.team,k:p.k,d:p.d,alive:p.alive,sx:p.s?+p.s.x.toFixed(1):null,sz:p.s?+p.s.z.toFixed(1):null,vis:p.s?p.s.g.visible:null,kind:p.s?p.s.kind:null})),
    rivals:M.rivals.length,mates:M.mates.length,errN:g.G.errN||0};},
  feed(){return Array.from(document.querySelectorAll('#kills p')).map(p=>p.textContent);},
  ui(){const v=id=>{const e=document.getElementById(id);return e?(e.hidden?'(hidden)':(e.value!==undefined&&e.tagName!=='BUTTON'?e.value:e.textContent)):null;};
    return{menu:!document.getElementById('menu').hidden,title:v('menuTitle'),mpUi:!document.getElementById('mpUi').hidden,home:!document.getElementById('mpHome').hidden,lobby:!document.getElementById('mpLobby').hidden,
      code:v('mpCodeBig'),msg:v('mpMsg'),start:v('btnMpStart'),startDis:document.getElementById('btnMpStart').disabled,list:Array.from(document.querySelectorAll('#mpList li')).map(l=>l.textContent),
      btnStart:v('btnStart'),btnQuit:v('btnQuit'),btnMp:v('btnMp'),stats:Array.from(document.querySelectorAll('#menuStats div')).map(d=>d.textContent),board:Array.from(document.querySelectorAll('#mpBoard div')).map(d=>d.textContent),obj:v('objText')};}
};1`;
async function lab(n,opt){opt=opt||{};const dir=path.resolve(opt.dir||path.join(__dirname,'..'));
  const srv=http.createServer((q,r)=>{let p=decodeURIComponent(q.url.split('?')[0]);if(p.endsWith('/'))p+='index.html';const f=path.join(dir,p);
    if(!f.startsWith(dir)||!fs.existsSync(f)){r.writeHead(404);r.end('not found');return;}r.writeHead(200,{'Content-Type':TYPES[path.extname(f)]||'application/octet-stream'});fs.createReadStream(f).pipe(r);});
  await new Promise(ok=>srv.listen(0,'127.0.0.1',ok));const port=srv.address().port,psPort=await freePort();
  const ps=PeerServer({port:psPort,path:'/',host:'127.0.0.1'});await sleep(300);
  const base='http://127.0.0.1:'+port+'/?ps=127.0.0.1:'+psPort,players=[];let fails=0,checks=0;
  const L={players,base,port,psPort,
    async add(o){o=o||{};const k=players.length,b=await chromium.launch({executablePath:CHROME,args:['--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist','--autoplay-policy=no-user-gesture-required']});
      const ctx=await b.newContext(o.mobile?{viewport:{width:844,height:390},hasTouch:true,isMobile:true,deviceScaleFactor:2}:{viewport:{width:960,height:540}});const pg=await ctx.newPage(),errs=[];
      pg.on('console',m=>{if(m.type()==='error'||(m.type()==='warning'&&!/GPU stall|GL Driver|AudioContext/.test(m.text())))errs.push(m.type()+': '+m.text());});
      pg.on('pageerror',e=>errs.push('PAGEERROR '+e.message+'\n'+(e.stack||'').split('\n').slice(0,4).join('\n')));
      await pg.goto(base+(o.query||''));await pg.waitForFunction("window.__game&&!document.getElementById('btnStart').disabled",null,{timeout:40000});
      await pg.evaluate("(()=>{const g=window.__game;g.__render=g.renderer.render;g.renderer.render=function(){};g.setShadows(false);})()");await pg.evaluate(HELPERS);
      players.push({b,pg,errs,k});return k;},
    ev:(k,code)=>players[k].pg.evaluate(code),
    st:k=>players[k].pg.evaluate('__t.st()'),ui:k=>players[k].pg.evaluate('__t.ui()'),
    // wait until an expression is truthy on player k's page
    async until(k,code,ms,label){const t0=Date.now();for(;;){let v;try{v=await players[k].pg.evaluate(code);}catch(e){v=false;}if(v)return v;
        if(Date.now()-t0>(ms||8000)){fails++;checks++;console.log('  FAIL (timeout) P'+k+': '+(label||code));return null;}await sleep(60);}},
    ok(cond,label,detail){checks++;if(cond)console.log('  ok   '+label);else{fails++;console.log('  FAIL '+label+(detail!==undefined?'  -> '+JSON.stringify(detail):''));}return !!cond;},
    // a real picture from player k: drawing is switched back on for a moment
    async shot(k,name){const pg=players[k].pg;await pg.evaluate("(()=>{const g=window.__game;g.renderer.render=g.__render;})()");await sleep(1500);await pg.screenshot({path:name+'.png'});await pg.evaluate("(()=>{const g=window.__game;g.renderer.render=function(){};})()");},
    sleep,
    async close(){let bad=0;for(const p of players){if(p.errs.length){bad+=p.errs.length;console.log('  console P'+p.k+': '+p.errs.slice(0,6).join(' | '));}try{await p.b.close();}catch(e){}}
      srv.close();console.log(bad?'CONSOLE ERRORS: '+bad:'no console errors');console.log((fails?'FAILED ':'PASSED ')+(checks-fails)+'/'+checks+' checks');setTimeout(()=>process.exit(fails||bad?1:0),200);}};
  for(let k=0;k<n;k++)await L.add(opt.players&&opt.players[k]);return L;}
module.exports={lab,sleep};
