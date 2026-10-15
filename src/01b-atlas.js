// =====================================================================
// 01b FACADE ATLAS (part 1): one 2048 px texture of wall pieces, 256 px = 4 m per cell.
// Alpha is a tint mask: opaque pixels take the building's paint colour, half-alpha pixels (doors, glass, signs) keep their own.
// =====================================================================
const AS=2048,AC_=256,atlasC=document.createElement('canvas');atlasC.width=atlasC.height=AS;
const ag=atlasC.getContext('2d'),CELL_IX={};
let cellN=0;
function cell(name,fn){const i=cellN++,x=(i%8)*AC_,y=Math.floor(i/8)*AC_;CELL_IX[name]=i;ag.save();ag.beginPath();ag.rect(x,y,AC_,AC_);ag.clip();ag.translate(x,y);fn(ag);ag.restore();return i;}
// mark a rectangle of the current cell as "keeps its own colour"
function keep(g,x,y,w,h){g.save();g.globalCompositeOperation='destination-out';g.fillStyle='rgba(0,0,0,.5)';g.fillRect(x,y,w,h);g.restore();}
function cuv(i){const x=(i%8)*AC_,y=Math.floor(i/8)*AC_;return[(x+.7)/AS,1-(y+AC_-.7)/AS,(x+AC_-.7)/AS,1-(y+.7)/AS];}
const PXM=64; // pixels per metre
function stucco(g,base,dado){g.fillStyle=base||'#f3f0e9';g.fillRect(0,0,256,256);noise(g,256,256,900,.05);
  // rain streaks, splash dirt at the foot, a faint lighter band where the sun bleaches the top
  for(let k=0;k<7;k++){const x=rnd()*256,w=rr(3,9),gr=g.createLinearGradient(0,0,0,rr(70,170));gr.addColorStop(0,'rgba(70,55,40,.1)');gr.addColorStop(1,'rgba(70,55,40,0)');g.fillStyle=gr;g.fillRect(x,0,w,180);}
  if(dado){g.fillStyle='rgba(40,30,22,.2)';g.fillRect(0,256-dado,256,dado);g.fillStyle='rgba(255,255,255,.1)';g.fillRect(0,256-dado-2,256,2);}
  const gr=g.createLinearGradient(0,214,0,256);gr.addColorStop(0,'rgba(110,80,45,0)');gr.addColorStop(1,'rgba(110,80,45,.24)');g.fillStyle=gr;g.fillRect(0,222,256,34);}
function frameR(g,x,y,w,h,col,t){g.fillStyle=col;g.fillRect(x-t,y-t,w+2*t,h+2*t);}
function glass(g,x,y,w,h){const gr=g.createLinearGradient(x,y,x+w*.4,y+h);gr.addColorStop(0,'#3d5563');gr.addColorStop(.5,'#22323c');gr.addColorStop(1,'#18242c');g.fillStyle=gr;g.fillRect(x,y,w,h);
  g.fillStyle='rgba(190,220,235,.16)';g.beginPath();g.moveTo(x,y);g.lineTo(x+w*.55,y);g.lineTo(x+w*.2,y+h);g.lineTo(x,y+h);g.fill();}
function sillShadow(g,x,y,w){g.fillStyle='rgba(0,0,0,.2)';g.fillRect(x-4,y,w+8,5);}
// ---- plain walls (tinted)
cell('stucco',g=>stucco(g));
cell('dado',g=>stucco(g,null,58));
cell('stain',g=>{stucco(g);for(let k=0;k<5;k++){g.fillStyle='rgba('+(rnd()<.5?'255,255,255':'60,45,30')+','+rr(.06,.14).toFixed(2)+')';g.beginPath();g.ellipse(rnd()*256,rnd()*256,rr(14,44),rr(10,30),rnd()*3,0,7);g.fill();}
  g.strokeStyle='rgba(50,38,26,.22)';g.lineWidth=1;g.beginPath();let x=rr(40,200),y=0;g.moveTo(x,y);for(let s=0;s<7;s++){x+=rr(-12,12);y+=rr(14,30);g.lineTo(x,y);}g.stroke();});
cell('block',g=>{g.fillStyle='#c9c6bf';g.fillRect(0,0,256,256);noise(g,256,256,1500,.07);g.strokeStyle='rgba(60,55,48,.42)';g.lineWidth=1.4;
  for(let r=0;r<20;r++){const y=r*12.8;g.beginPath();g.moveTo(0,y);g.lineTo(256,y);g.stroke();for(let x=(r%2)*12.8;x<256;x+=25.6){g.beginPath();g.moveTo(x,y);g.lineTo(x,y+12.8);g.stroke();}}
  g.fillStyle='rgba(90,84,74,.3)';g.fillRect(0,0,256,14);g.fillRect(0,120,256,10);});
// ---- doors
function door(g,x,w,h,body,panel){const y=256-h;frameR(g,x,y,w,h,'#d9d3c6',5);g.fillStyle=body;g.fillRect(x,y,w,h);panel(g,x,y,w,h);
  g.fillStyle='rgba(0,0,0,.28)';g.fillRect(x,y,w,5);g.fillStyle='#8b8372';g.fillRect(x-7,252,w+14,4);keep(g,x-5,y-5,w+10,h+5);}
cell('doorWood',g=>{stucco(g,null,58);door(g,98,60,134,'#6a4a2d',(g,x,y,w,h)=>{g.strokeStyle='rgba(30,18,8,.55)';g.lineWidth=2;for(const p of [[8,10,44,48],[8,68,44,56]])g.strokeRect(x+p[0],y+p[1],p[2],p[3]);
  g.fillStyle='rgba(255,220,170,.1)';g.fillRect(x+10,y+12,40,44);g.fillStyle='#c8b06a';g.beginPath();g.arc(x+50,y+74,3,0,7);g.fill();});});
cell('doorMetal',g=>{stucco(g);door(g,96,64,136,'#e9e6de',(g,x,y,w,h)=>{g.fillStyle='#22323c';g.fillRect(x+8,y+10,48,54);g.strokeStyle='#15110c';g.lineWidth=2;
  for(let b=1;b<5;b++){g.beginPath();g.moveTo(x+8+b*9.6,y+10);g.lineTo(x+8+b*9.6,y+64);g.stroke();}g.beginPath();g.moveTo(x+8,y+37);g.lineTo(x+56,y+37);g.stroke();
  g.strokeStyle='rgba(0,0,0,.3)';g.strokeRect(x+8,y+74,48,52);g.fillStyle='#777';g.fillRect(x+52,y+70,5,9);});});
cell('doorDouble',g=>{stucco(g,null,58);door(g,80,96,140,'#3f6b63',(g,x,y,w,h)=>{g.strokeStyle='rgba(10,25,22,.6)';g.lineWidth=2;g.beginPath();g.moveTo(x+48,y);g.lineTo(x+48,y+h);g.stroke();
  for(const p of [[7,10],[55,10],[7,74],[55,74]])g.strokeRect(x+p[0],y+p[1],34,56);g.fillStyle='#c8b06a';g.fillRect(x+43,y+72,3,8);g.fillRect(x+50,y+72,3,8);});});
// ---- windows (sill at 1 m)
function win(g,x,y,w,h,fr,bars,curtain){frameR(g,x,y,w,h,fr,5);glass(g,x,y,w,h);
  if(curtain){g.fillStyle=curtain;g.fillRect(x,y,w*.34,h);g.fillRect(x+w*.7,y,w*.3,h);g.fillStyle='rgba(0,0,0,.14)';for(let k=0;k<4;k++)g.fillRect(x+k*w*.085,y,2,h);}
  g.strokeStyle=fr;g.lineWidth=3;g.beginPath();g.moveTo(x+w/2,y);g.lineTo(x+w/2,y+h);g.stroke();
  if(bars){g.strokeStyle='#15110c';g.lineWidth=2;for(let b=1;b<bars;b++){g.beginPath();g.moveTo(x+b*w/bars,y-2);g.lineTo(x+b*w/bars,y+h+2);g.stroke();}
    for(const f of [.25,.75]){g.beginPath();g.moveTo(x-2,y+h*f);g.lineTo(x+w+2,y+h*f);g.stroke();}}
  g.fillStyle='#cfc8b8';g.fillRect(x-9,y+h+5,w+18,6);sillShadow(g,x,y+h+11,w);keep(g,x-5,y-5,w+10,h+16);}
cell('winBars',g=>{stucco(g,null,58);win(g,84,118,88,70,'#ece6d6',7);});
cell('winCurtain',g=>{stucco(g);win(g,88,116,80,74,'#7a5a3a',0,'#d9c7a8');});
cell('winWide',g=>{stucco(g,null,58);win(g,56,120,144,68,'#b9bec0',0,'#c9d6dc');});
cell('winSmall',g=>{stucco(g);win(g,104,60,48,36,'#ece6d6',4);});
cell('winAC',g=>{stucco(g);win(g,70,114,82,72,'#ece6d6',0,'#b9c7b0');g.fillStyle='#d5d6d2';g.fillRect(170,150,50,36);g.fillStyle='#8f9390';for(let k=0;k<6;k++)g.fillRect(174,155+k*5,42,2);
  g.fillStyle='rgba(60,50,40,.3)';g.fillRect(190,186,6,50);keep(g,170,150,50,36);});
// ---- shop fronts
cell('shopOpen',g=>{stucco(g);const x=30,y=96,w=196,h=160;frameR(g,x,y,w,h,'#d9d3c6',6);const gr=g.createLinearGradient(0,y,0,256);gr.addColorStop(0,'#0e0c0a');gr.addColorStop(1,'#2a221a');g.fillStyle=gr;g.fillRect(x,y,w,h);
  // shelves and a counter glimpsed inside
  for(let r=0;r<3;r++){g.fillStyle='#4a3a2a';g.fillRect(x+10,y+34+r*26,w-20,3);for(let k=0;k<16;k++){g.fillStyle=pick(['#b3261e','#e2b93b','#2f7d4f','#e9e5da','#1d3f7a','#d98a4e']);g.globalAlpha=.6;g.fillRect(x+13+k*11.2,y+18+r*26+rnd()*4,8,16-rnd()*4);g.globalAlpha=1;}}
  g.fillStyle='#5b4632';g.fillRect(x+w*.5,y+112,w*.46,48);g.fillStyle='#7a8086';g.fillRect(x,y,w,12);g.fillStyle='rgba(0,0,0,.35)';for(let k=0;k<3;k++)g.fillRect(x,y+3+k*4,w,1);keep(g,x-6,y-6,w+12,h+6);});
cell('shopShut',g=>{stucco(g);const x=30,y=96,w=196,h=160;frameR(g,x,y,w,h,'#d9d3c6',6);g.fillStyle='#9aa3a6';g.fillRect(x,y,w,h);for(let r=0;r<h;r+=7){g.fillStyle='rgba(0,0,0,.22)';g.fillRect(x,y+r,w,2);g.fillStyle='rgba(255,255,255,.18)';g.fillRect(x,y+r+2,w,2);}
  g.fillStyle='rgba(120,70,30,.2)';g.fillRect(x,y+h-26,w,26);g.fillStyle='#55595c';g.fillRect(x+w/2-10,y+h-12,20,6);keep(g,x-6,y-6,w+12,h+6);});
cell('gate',g=>{stucco(g);const x=20,y=112,w=216,h=144;g.fillStyle='#3b4a42';g.fillRect(x,y,w,h);g.strokeStyle='rgba(0,0,0,.4)';g.lineWidth=2;for(let k=0;k<=8;k++){g.beginPath();g.moveTo(x+k*27,y);g.lineTo(x+k*27,y+h);g.stroke();}
  g.strokeRect(x+2,y+2,w/2-3,h-3);g.strokeRect(x+w/2+1,y+2,w/2-3,h-3);g.fillStyle='rgba(140,80,40,.25)';g.fillRect(x,y+h-30,w,30);keep(g,x,y,w,h);});
cell('doorGlass',g=>{stucco(g);const x=64,y=112,w=128,h=144;frameR(g,x,y,w,h,'#b9bec0',6);glass(g,x,y,w,h);g.strokeStyle='#b9bec0';g.lineWidth=5;g.beginPath();g.moveTo(x+w/2,y);g.lineTo(x+w/2,y+h);g.moveTo(x,y+26);g.lineTo(x+w,y+26);g.stroke();
  g.fillStyle='#d9d9d2';g.fillRect(x+w/2-12,y+84,7,22);g.fillRect(x+w/2+5,y+84,7,22);keep(g,x-6,y-6,w+12,h+6);});
// ---- upper floor
cell('upWin',g=>{stucco(g);g.fillStyle='rgba(0,0,0,.16)';g.fillRect(0,250,256,6);win(g,84,96,88,84,'#ece6d6',0,'#d7b9a0');
  g.strokeStyle='#15110c';g.lineWidth=2.5;g.strokeRect(62,170,132,54);for(let b=1;b<10;b++){g.beginPath();g.moveTo(62+b*13.2,170);g.lineTo(62+b*13.2,224);g.stroke();}g.fillStyle='#8b8372';g.fillRect(52,224,152,7);keep(g,52,168,152,64);});
cell('upPlain',g=>{stucco(g);g.fillStyle='rgba(0,0,0,.16)';g.fillRect(0,250,256,6);g.fillStyle='rgba(255,255,255,.12)';g.fillRect(0,244,256,6);});
