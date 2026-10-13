const {chromium}=require('playwright-core');const fs=require('fs');const path=require('path');
(async()=>{
  let html=fs.readFileSync(path.join(__dirname,'../src/test-static.html'),'utf8');
  html='<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><style>body{margin:0;font:14px system-ui}[hidden]{display:none!important}</style></head><body>'+html.replace('https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js','../web/vendor/three.min.js').replace(/<link rel="stylesheet"[^>]*>/,'')+'</body></html>';
  fs.writeFileSync(path.join(__dirname,'static.html'),html);
  const b=await chromium.launch({executablePath:process.env.CHROME_PATH||'/opt/pw-browsers/chromium-1194/chrome-linux/chrome',args:['--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});
  const pg=await b.newPage({viewport:{width:1280,height:800}});
  const errs=[];pg.on('console',m=>{if(m.type()==='error'||(m.type()==='warning'&&!/GPU stall|GL Driver/.test(m.text())))errs.push(m.type()+': '+m.text());});pg.on('pageerror',e=>errs.push('PAGEERROR '+e.message+'\n'+e.stack));
  await pg.goto('file://'+path.join(__dirname,'static.html'));
  await pg.waitForTimeout(4000);
  await pg.evaluate(()=>{document.getElementById('menu').hidden=true;});
  const shots=JSON.parse(process.argv[2]||'[]');
  for(const s of shots){await pg.evaluate(a=>window.__t.cam(...a),s.cam);await pg.waitForTimeout(300);await pg.screenshot({path:s.name+'.png'});}
  console.log(JSON.stringify(await pg.evaluate(()=>window.__t.stats())));console.log(JSON.stringify(await pg.evaluate(()=>window.__tm)));
  const url=await pg.evaluate(()=>window.__t.map());fs.writeFileSync('map3.png',Buffer.from(url.split(',')[1],'base64'));const au=await pg.evaluate(()=>window.__t.atlas());fs.writeFileSync('atlas3.png',Buffer.from(au.split(',')[1],'base64'));
  console.log(errs.slice(0,15).join('\n')||'no console errors');
  await b.close();
})().catch(e=>{console.error('FAIL',e);process.exit(1);});
