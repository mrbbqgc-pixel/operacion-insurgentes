// =====================================================================
// 01c FACADE ATLAS (part 2) + MATERIALS
// =====================================================================
cell('corr',g=>{g.fillStyle='#d7dbdc';g.fillRect(0,0,256,256);for(let x=0;x<256;x+=8){g.fillStyle='rgba(0,0,0,.16)';g.fillRect(x,0,3,256);g.fillStyle='rgba(255,255,255,.2)';g.fillRect(x+4,0,2,256);}
  noise(g,256,256,500,.06);for(let k=0;k<9;k++){const x=rnd()*256,gr=g.createLinearGradient(0,0,0,rr(60,200));gr.addColorStop(0,'rgba(140,80,35,.3)');gr.addColorStop(1,'rgba(140,80,35,0)');g.fillStyle=gr;g.fillRect(x,0,rr(4,14),200);}
  g.fillStyle='rgba(0,0,0,.2)';g.fillRect(0,126,256,3);});
cell('stone',g=>{g.fillStyle='#d8d0c0';g.fillRect(0,0,256,256);noise(g,256,256,1300,.08);g.strokeStyle='rgba(70,60,45,.35)';g.lineWidth=1.5;
  for(let r=0;r<8;r++){const y=r*32;g.beginPath();g.moveTo(0,y);g.lineTo(256,y);g.stroke();for(let x=(r%2)*32+rr(-4,4);x<256;x+=64){g.beginPath();g.moveTo(x,y);g.lineTo(x,y+32);g.stroke();}}});
cell('brick',g=>{g.fillStyle='#c98f6f';g.fillRect(0,0,256,256);for(let r=0;r<32;r++)for(let x=(r%2)*16-16;x<256;x+=32){g.fillStyle='rgba('+(rnd()<.5?'60,25,10':'255,220,190')+','+rr(.03,.16).toFixed(2)+')';g.fillRect(x+1,r*8+1,30,6);}
  g.strokeStyle='rgba(235,225,210,.5)';g.lineWidth=1;for(let r=0;r<=32;r++){g.beginPath();g.moveTo(0,r*8);g.lineTo(256,r*8);g.stroke();}noise(g,256,256,500,.06);});
function arch(g,x,w,h,rise,fill){const y=256-h;g.beginPath();g.moveTo(x,256);g.lineTo(x,y+rise);g.quadraticCurveTo(x,y,x+w/2,y);g.quadraticCurveTo(x+w,y,x+w,y+rise);g.lineTo(x+w,256);g.closePath();fill();}
cell('archDoor',g=>{stucco(g);arch(g,58,140,214,70,()=>{g.fillStyle='#d2c9b6';g.fill();});arch(g,70,116,202,62,()=>{g.fillStyle='#5a3c22';g.fill();});
  g.strokeStyle='rgba(20,10,4,.6)';g.lineWidth=2;g.beginPath();g.moveTo(128,56);g.lineTo(128,256);g.stroke();for(const p of [[80,120,40,56],[136,120,40,56],[80,186,40,60],[136,186,40,60]])g.strokeRect(p[0],p[1],p[2],p[3]);
  g.fillStyle='#c8b06a';g.fillRect(120,170,4,12);g.fillRect(132,170,4,12);keep(g,58,42,140,214);});
cell('archWin',g=>{stucco(g);g.save();g.translate(0,-70);arch(g,92,72,150,36,()=>{g.fillStyle='#d2c9b6';g.fill();});arch(g,100,56,142,30,()=>{g.fillStyle='#25343e';g.fill();});g.restore();
  g.fillStyle='rgba(230,190,90,.5)';g.fillRect(104,70,22,40);g.fillStyle='rgba(120,160,210,.5)';g.fillRect(130,70,22,40);g.fillStyle='rgba(190,80,70,.45)';g.fillRect(104,114,48,30);
  g.strokeStyle='#1b1712';g.lineWidth=2;g.beginPath();g.moveTo(128,46);g.lineTo(128,186);g.moveTo(100,112);g.lineTo(156,112);g.stroke();keep(g,92,36,72,152);});
cell('glassFront',g=>{stucco(g);const y=92,h=164;g.fillStyle='#b9bec0';g.fillRect(0,y-6,256,h+6);glass(g,6,y,116,h-10);glass(g,134,y,116,h-10);
  for(const p of [[18,150,40,56,'#e2b93b'],[70,160,36,44,'#f4f0e7'],[150,146,44,60,'#b3261e'],[204,166,34,40,'#f4f0e7']]){g.fillStyle=p[4];g.globalAlpha=.85;g.fillRect(p[0],p[1],p[2],p[3]);g.globalAlpha=1;g.fillStyle='rgba(0,0,0,.4)';for(let k=0;k<3;k++)g.fillRect(p[0]+5,p[1]+10+k*10,p[2]-10,3);}
  keep(g,0,y-6,256,h+6);});
cell('schoolWin',g=>{stucco(g,null,70);const x=24,y=96,w=208,h=62;frameR(g,x,y,w,h,'#ece6d6',5);glass(g,x,y,w,h);g.strokeStyle='#ece6d6';g.lineWidth=3;for(let k=1;k<4;k++){g.beginPath();g.moveTo(x+k*w/4,y);g.lineTo(x+k*w/4,y+h);g.stroke();}
  g.strokeStyle='rgba(236,230,214,.7)';g.lineWidth=1.5;for(let k=1;k<6;k++){g.beginPath();g.moveTo(x,y+k*h/6);g.lineTo(x+w,y+k*h/6);g.stroke();}g.fillStyle='#cfc8b8';g.fillRect(x-8,y+h+5,w+16,6);keep(g,x-5,y-5,w+10,h+16);});
cell('planks',g=>{g.fillStyle='#8a6a45';g.fillRect(0,0,256,256);for(let r=0;r<8;r++){g.fillStyle='rgba('+(rnd()<.5?'0,0,0':'255,230,190')+','+rr(.04,.14).toFixed(2)+')';g.fillRect(0,r*32,256,30);g.fillStyle='rgba(30,18,8,.5)';g.fillRect(0,r*32+30,256,2);}
  noise(g,256,256,700,.08);g.strokeStyle='rgba(30,18,8,.6)';g.lineWidth=10;g.strokeRect(5,5,246,246);g.beginPath();g.moveTo(8,8);g.lineTo(248,248);g.stroke();keep(g,0,0,256,256);});
cell('sandbag',g=>{g.fillStyle='#b9a47a';g.fillRect(0,0,256,256);noise(g,256,256,1400,.09);for(let r=0;r<8;r++)for(let x=(r%2)*32-32;x<256;x+=64){g.strokeStyle='rgba(60,45,25,.55)';g.lineWidth=2.5;g.beginPath();g.ellipse(x+32,r*32+16,31,15,0,0,7);g.stroke();
    g.fillStyle='rgba(255,240,200,.08)';g.beginPath();g.ellipse(x+32,r*32+11,22,6,0,0,7);g.fill();}keep(g,0,0,256,256);});
cell('adWall',g=>{stucco(g);g.fillStyle='#f6f1e4';g.fillRect(14,60,228,120);g.fillStyle='#b3261e';g.font='900 46px "Arial Narrow",Arial,sans-serif';g.textAlign='center';g.textBaseline='middle';g.fillText('HIELO',128,96,200);
  g.fillStyle='#1d3f7a';g.font='900 34px "Arial Narrow",Arial,sans-serif';g.fillText('REFRESCOS',128,146,206);noise(g,228,120,300,.1,14,60);keep(g,14,60,228,120);});
cell('tomb',g=>{g.fillStyle='#d9d5cb';g.fillRect(0,0,256,256);noise(g,256,256,1500,.07);g.strokeStyle='rgba(70,65,55,.5)';g.lineWidth=5;g.strokeRect(14,14,228,228);
  g.fillStyle='rgba(60,55,45,.55)';g.fillRect(118,50,20,130);g.fillRect(86,84,84,20);keep(g,0,0,256,256);});
// shop signs: 4 strips of 256 x 64 px (4 m x 1 m) per cell
const shopSigns=[['ABARROTES','#b3261e'],['TORTILLERÍA','#1f5d3a'],['TAQUERÍA','#b3261e'],['FERRETERÍA','#1d3f7a'],['FARMACIA','#1f5d3a'],['LLANTERA','#15110c'],['AGROQUÍMICOS','#1f5d3a'],['REFACCIONES','#1d3f7a'],
  ['PALETERÍA','#b03a73'],['CARNICERÍA','#b3261e'],['MARISCOS','#1d3f7a'],['TALLER MECÁNICO','#15110c'],['PANADERÍA','#8a4b12'],['PAPELERÍA','#1d3f7a'],['LONCHERÍA','#b3261e'],['MINI SÚPER','#1f5d3a'],
  ['AGUA PURIFICADA','#1d6f9a'],['ESTÉTICA','#b03a73'],['POLLOS ASADOS','#b3261e'],['MATERIALES','#15110c']];
const signCell0=cellN;
for(let c=0;c<5;c++)cell('signs'+c,g=>{for(let j=0;j<4;j++){const s=shopSigns[c*4+j],inv=(c*4+j)%3===1;g.fillStyle=inv?s[1]:'#f6f1e4';g.fillRect(0,j*64,256,64);g.strokeStyle=inv?'#f6f1e4':s[1];g.lineWidth=4;g.strokeRect(5,j*64+5,246,54);
    g.fillStyle=inv?'#f6f1e4':s[1];g.font='900 40px "Arial Narrow",Arial,sans-serif';g.textAlign='center';g.textBaseline='middle';g.fillText(s[0],128,j*64+34,226);}noise(g,256,256,300,.05);keep(g,0,0,256,256);});
function signUV(k){const c=cuv(signCell0+(k>>2)),j=k&3,vh=(c[3]-c[1])/4;return[c[0],c[3]-(j+1)*vh+.0004,c[2],c[3]-j*vh-.0004];}
ag.fillStyle='#fff';ag.fillRect(0,AS-24,24,24); // white texel for plain vertex-coloured geometry (see WU, WV)
const ATLAS=new T.CanvasTexture(atlasC);ATLAS.anisotropy=MAXA;
const CI=CELL_IX;

// ---------- materials
function ground(col,n,a,extra,sz){sz=sz||128;return L({polygonOffset:true,polygonOffsetFactor:-1,polygonOffsetUnits:-1,
  map:tex(sz,sz,(g,w,h)=>{g.fillStyle=col;g.fillRect(0,0,w,h);noise(g,w,h,n,a);if(extra)extra(g,w,h);},true)});}
const ruts=v=>(g,w,h)=>{g.strokeStyle='rgba(90,65,35,.13)';g.lineWidth=7;for(const q of [78,178]){g.beginPath();if(v){g.moveTo(q,0);g.lineTo(q,h);}else{g.moveTo(0,q);g.lineTo(w,q);}g.stroke();}
  for(let k=0;k<40;k++){g.fillStyle='rgba(110,85,50,'+rr(.08,.2).toFixed(2)+')';g.beginPath();g.arc(rnd()*w,rnd()*h,rr(.6,2.2),0,7);g.fill();}};
const M={
  sand:L({map:tex(256,256,(g,w,h)=>{g.fillStyle='#cdab77';g.fillRect(0,0,w,h);noise(g,w,h,5000,.1);
    for(let k=0;k<90;k++){g.fillStyle='rgba(120,90,50,'+rr(.08,.2).toFixed(2)+')';g.beginPath();g.arc(rnd()*w,rnd()*h,rr(.6,2),0,7);g.fill();}
    for(let k=0;k<14;k++){g.fillStyle='rgba(235,210,160,.12)';g.beginPath();g.ellipse(rnd()*w,rnd()*h,rr(14,40),rr(6,16),rnd()*3,0,7);g.fill();}},true)}),
  pad:ground('#d6bf98',1800,.07,(g,w,h)=>{for(let k=0;k<30;k++){g.fillStyle='rgba(120,95,60,.14)';g.beginPath();g.arc(rnd()*w,rnd()*h,rr(1,3),0,7);g.fill();}},256),
  walk:ground('#bfb9ab',1500,.07,(g,w,h)=>{g.strokeStyle='rgba(70,65,55,.35)';g.lineWidth=1.5;for(let k=0;k<=w;k+=64){g.beginPath();g.moveTo(k,0);g.lineTo(k,h);g.moveTo(0,k);g.lineTo(w,k);g.stroke();}
    for(let k=0;k<4;k++){g.strokeStyle='rgba(50,45,38,.3)';g.lineWidth=1;g.beginPath();let x=rnd()*w,y=rnd()*h;g.moveTo(x,y);for(let s=0;s<4;s++){x+=rr(-20,20);y+=rr(-20,20);g.lineTo(x,y);}g.stroke();}},256),
  asphalt:ground('#4c4945',5000,.11,(g,w,h)=>{for(let k=0;k<9;k++){g.strokeStyle='rgba(20,18,16,.4)';g.lineWidth=1.3;g.beginPath();let x=rnd()*w,y=rnd()*h;g.moveTo(x,y);for(let s=0;s<6;s++){x+=rr(-26,26);y+=rr(-26,26);g.lineTo(x,y);}g.stroke();}
    for(let k=0;k<4;k++){g.fillStyle='rgba(30,28,26,.12)';g.beginPath();g.ellipse(rnd()*w,rnd()*h,rr(8,18),rr(5,10),rnd()*3,0,7);g.fill();}
    for(let k=0;k<5;k++){g.fillStyle='rgba(120,112,100,.12)';g.fillRect(rnd()*w,rnd()*h,rr(14,40),rr(10,26));}},256),
  dirt:ground('#bf9f6c',4000,.09,ruts(true),256),dirtX:ground('#bf9f6c',4000,.09,ruts(false),256),
  court:ground('#7d8f88',500,.06),plaza:ground('#d7b79f',1400,.07,(g,w,h)=>{g.strokeStyle='rgba(120,80,60,.3)';g.lineWidth=1.5;for(let k=0;k<=w;k+=32){g.beginPath();g.moveTo(k,0);g.lineTo(k,h);g.moveTo(0,k);g.lineTo(w,k);g.stroke();}
    for(let i=0;i<4;i++)for(let j=0;j<4;j++)if((i+j)%2){g.fillStyle='rgba(150,95,70,.16)';g.fillRect(i*32,j*32,32,32);}}),
  grass:ground('#6f9450',2400,.1,null,256),infield:ground('#b98a5a',700,.08),
  line:L({color:0xe2b93b,polygonOffset:true,polygonOffsetFactor:-3,polygonOffsetUnits:-3}),
  lineW:L({color:0xe9e5da,polygonOffset:true,polygonOffsetFactor:-3,polygonOffsetUnits:-3}),
  field:L({polygonOffset:true,polygonOffsetFactor:-1,polygonOffsetUnits:-1,map:tex(64,64,(g,w,h)=>{g.fillStyle='#6f8f45';g.fillRect(0,0,w,h);g.fillStyle='#4f7335';for(let x=0;x<w;x+=8)g.fillRect(x,0,4,h);noise(g,w,h,240,.08);},true)}),
  fallow:L({polygonOffset:true,polygonOffsetFactor:-1,polygonOffsetUnits:-1,map:tex(64,64,(g,w,h)=>{g.fillStyle='#a98556';g.fillRect(0,0,w,h);g.fillStyle='#96744a';for(let x=0;x<w;x+=8)g.fillRect(x,0,3,h);noise(g,w,h,240,.08);},true)}),
  // dynamic objects
  white:L({color:0xf4f0e7}),dark:L({color:0x2b2621}),metal:L({color:0xb3b9bb}),wood:L({color:0x6b5138}),concrete:L({color:0xa9a59c}),red:L({color:0xb3261e}),green:L({color:0x2f7d4f}),
  blue:L({color:0x1d3f7a}),yellow:L({color:0xe2b93b}),bronze:L({color:0x7c6238}),olive:L({color:0x5b6140})};
// overlays that lie on top of another ground surface get a stronger depth offset than the surface below
for(const k of ['walk','asphalt']){const m=M[k].clone();m.polygonOffsetFactor=m.polygonOffsetUnits=-2;M[k+'O']=m;}
for(const k of ['court','infield'])M[k].polygonOffsetFactor=M[k].polygonOffsetUnits=-2;
// chunked, vertex-coloured materials
M.wall=L({map:ATLAS,vertexColors:true});
M.wall.onBeforeCompile=s=>{s.fragmentShader=s.fragmentShader.replace('#include <map_fragment>','vec4 texelColor=texture2D(map,vUv);float tintK=clamp(texelColor.a*2.0-1.0,0.0,1.0);diffuseColor.rgb*=texelColor.rgb;')
  .replace('#include <color_fragment>','diffuseColor.rgb*=mix(vec3(1.0),vColor,tintK);');};
M.flat=L({vertexColors:true});M.flat.userData.alias=M.wall;
M.paint=new T.MeshPhongMaterial({vertexColors:true,shininess:55,specular:0x4a4a4a});
// soft contact shadows: left half of the texture is a round blob, right half a strip that is dark along v=0
M.shade=new T.MeshBasicMaterial({transparent:true,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-4,polygonOffsetUnits:-4,map:tex(128,64,(g,w,h)=>{
  const gr=g.createRadialGradient(32,32,2,32,32,31);gr.addColorStop(0,'rgba(20,14,8,.5)');gr.addColorStop(.55,'rgba(20,14,8,.3)');gr.addColorStop(1,'rgba(20,14,8,0)');g.fillStyle=gr;g.fillRect(0,0,64,64);
  const g2=g.createLinearGradient(0,64,0,0);g2.addColorStop(0,'rgba(20,14,8,.42)');g2.addColorStop(.35,'rgba(20,14,8,.16)');g2.addColorStop(1,'rgba(20,14,8,0)');g.fillStyle=g2;g.fillRect(66,0,60,64);})});
for(const k of ['wall','flat','paint','shade']){M[k].userData.chunk=1;M[k].userData.cast=k!=='shade';}
const C={white:0xf4f0e7,dark:0x2b2621,metal:0xb3b9bb,steel:0x8c9396,wood:0x6b5138,concrete:0xa9a59c,red:0xb3261e,green:0x2f7d4f,blue:0x1d3f7a,yellow:0xe2b93b,bronze:0x7c6238,olive:0x5b6140,
  stone:0xcfc6b4,curb:0xb9b1a2,glass:0x1c2830,tire:0x1d1c1b,rust:0x8a5a3c,roofs:[0xbcb09e,0xc9c0ae,0xd9d2c4,0xa7826a,0xb9a58c],tile:0xa8543a,lamina:0xa9b0b1};
const wallCols=[0xe8d9b8,0x7fc4bd,0xe59a7a,0xe3c35c,0xe7a9b5,0xf2efe6,0xb9d6a1,0x9db7d6,0xd98a4e,0xc8b3d6,0xf0d7a0,0x8fb7a5,0xd7c2a3,0xe2e0d6,0xf2efe6,0xeadfc8,0xc96f55,0x6fa3c7,0xf6e3b0,0xcfe0d2];
