// render icon.svg to the PNG icons at the repo root: NODE_PATH=../test/node_modules node mkicon.js
const {chromium}=require('playwright-core');const fs=require('fs');const path=require('path');
(async()=>{
  const svg=fs.readFileSync(path.join(__dirname,'icon.svg'),'utf8');
  const b=await chromium.launch({executablePath:process.env.CHROME_PATH||'/opt/pw-browsers/chromium-1194/chrome-linux/chrome'});
  for(const s of [180,64,192,512]){
    const pg=await b.newPage({viewport:{width:s,height:s},deviceScaleFactor:1});
    await pg.setContent('<style>html,body{margin:0;background:#15110c}svg{display:block;width:'+s+'px;height:'+s+'px}</style>'+svg);
    await pg.screenshot({path:path.join(__dirname,'..','icon-'+s+'.png'),clip:{x:0,y:0,width:s,height:s}});
    await pg.close();
  }
  await b.close();
})().catch(e=>{console.error('FAIL',e);process.exit(1);});
