// headless test of the built site: node play.js steps.json [--dir DIR] [--path /sub/] [--file] [--offline] [--mobile] [--ios|--android] [--portrait] [--w N --h N]
// Serves DIR (default: the repo root) over a local web server, or opens DIR/index.html as a file with --file, refuses every request
// that would leave it, runs the scripted steps and reports console errors and any outside request the page tried to make.
// A step {"eval":"BOTJS"} loads the player bot from bot3.js. Screenshots are written to the current directory.
// --artifact tests the page in the form the Claude artifact gets it (src/operacion-insurgentes.html, no PeerJS, three.js from the vendor folder).
const {chromium}=require('playwright-core');const fs=require('fs');const path=require('path');const http=require('http');
const arg=n=>{const i=process.argv.indexOf(n);return i<0?null:process.argv[i+1];},has=n=>process.argv.includes(n);
const TYPES={'.html':'text/html; charset=utf-8','.png':'image/png','.jpg':'image/jpeg','.webmanifest':'application/manifest+json','.js':'text/javascript'};
(async()=>{
  const dir=path.resolve(arg('--dir')||path.join(__dirname,'..'));let url,server=null;
  if(has('--file'))url='file://'+path.join(dir,'index.html');
  else{server=http.createServer((q,r)=>{let p=decodeURIComponent(q.url.split('?')[0]);if(p.endsWith('/'))p+='index.html';const f=path.join(dir,p);
      if(p==='/__artifact.html'){const h=fs.readFileSync(path.join(__dirname,'../src/operacion-insurgentes.html'),'utf8').replace('https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js','/web/vendor/three.min.js').replace(/<link rel="stylesheet"[^>]*>/,'');
        r.writeHead(200,{'Content-Type':TYPES['.html']});r.end('<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><style>body{margin:0;font:14px system-ui}[hidden]{display:none!important}</style></head><body>'+h+'</body></html>');return;}
      if(!f.startsWith(dir)||!fs.existsSync(f)){r.writeHead(404);r.end('not found');return;}r.writeHead(200,{'Content-Type':TYPES[path.extname(f)]||'application/octet-stream'});fs.createReadStream(f).pipe(r);});
    await new Promise(ok=>server.listen(0,'127.0.0.1',ok));url='http://127.0.0.1:'+server.address().port+(has('--artifact')?'/__artifact.html':arg('--path')||'/');}
  const b=await chromium.launch({executablePath:process.env.CHROME_PATH||'/opt/pw-browsers/chromium-1194/chrome-linux/chrome',args:['--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist','--autoplay-policy=no-user-gesture-required']});
  const mobile=has('--mobile')||has('--ios')||has('--android'),port=has('--portrait');
  const UA=has('--ios')?'Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Mobile/15E148 Safari/604.1'
    :has('--android')?'Mozilla/5.0 (Linux; Android 15; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Mobile Safari/537.36':undefined;
  const vp=mobile?(port?{width:390,height:844}:{width:+(arg('--w')||844),height:+(arg('--h')||390)}):{width:+(arg('--w')||1280),height:+(arg('--h')||720)};
  const ctx=await b.newContext(Object.assign({viewport:vp},mobile?{hasTouch:true,isMobile:true,deviceScaleFactor:2}:{},UA?{userAgent:UA}:{}));
  const pg=await ctx.newPage();
  const errs=[],outside=[];
  await pg.route('**/*',r=>{const u=r.request().url();if(u.startsWith('http://127.0.0.1')||u.startsWith('file://')||u.startsWith('data:')||u.startsWith('blob:'))return r.continue();outside.push(u);return r.abort();});
  pg.on('console',m=>{if(m.type()==='error'||(m.type()==='warning'&&!/GPU stall|GL Driver|AudioContext/.test(m.text())))errs.push(m.type()+': '+m.text());});
  pg.on('pageerror',e=>errs.push('PAGEERROR '+e.message+'\n'+(e.stack||'').split('\n').slice(0,4).join('\n')));
  if(has('--offline'))await ctx.setOffline(true);
  await pg.goto(url);
  await pg.waitForTimeout(5000);
  const steps=JSON.parse(fs.readFileSync(process.argv[2],'utf8')),bot=fs.readFileSync(path.join(__dirname,'bot3.js'),'utf8');
  for(const s of steps)if(s.eval==='BOTJS')s.eval=bot+';1';
  for(const s of steps){
    if(s.shot){await pg.screenshot(s.clip?{path:s.shot+'.png',clip:{x:s.clip[0],y:s.clip[1],width:s.clip[2],height:s.clip[3]}}:{path:s.shot+(s.jpg?'.jpg':'.png'),type:s.jpg?'jpeg':'png',quality:s.jpg||undefined});}
    else if(s.wait){await pg.waitForTimeout(s.wait);}
    else if(s.click){await pg.click(s.click);}
    else if(s.tap){await pg.tap(s.tap);}
    else if(s.key){await pg.keyboard.press(s.key);}
    else if(s.down){await pg.keyboard.down(s.down);}
    else if(s.up){await pg.keyboard.up(s.up);}
    else if(s.size){await pg.setViewportSize({width:s.size[0],height:s.size[1]});}
    else if(s.eval){const r=await pg.evaluate(s.eval);if(s.log)console.log(s.log+': '+JSON.stringify(r));}
    if(errs.length>20)break;
  }
  console.log(errs.slice(0,20).join('\n')||'no console errors');
  console.log(outside.length?'OUTSIDE REQUESTS: '+outside.join(' | '):'no outside requests');
  await b.close();if(server)server.close();
})().catch(e=>{console.error('FAIL',e);process.exit(1);});
