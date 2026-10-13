// =====================================================================
// 02h CEMETERY + BLOCK ASSIGNMENT: which real landmark stands on which block
// =====================================================================
// small church on the local front edge of an ordinary block
function temple(B,r,name,lx){const F=TF(B.cx,B.cz,r),LW=r%2?B.d:B.w,LD=r%2?B.w:B.d,v=sup(B.cx,B.cz);lx=lx||0;
  pad(B.cx,B.cz,B.w,B.d);blockHouses(B,v<.4?.1:v<.8?.25:.45,SIDE_L[F.s(1)],commerce(B),v>.6);
  const p=F.p(lx,LD/2-SW-8.2);church(p[0],p[1],r,name,false);rowLots(F,LD,-LW/2+SW,lx-6.5,.06,v>.6);rowLots(F,LD,lx+6.5,LW/2-SW,.06,v>.6);}
// Panteon Municipal: walled, gate on the local front. Kept as a quiet landmark: nothing spawns or is fought over here.
const tombCols=[0xf4f0e7,0xe9e4d8,0xd9d5cb,0xcfe0ea,0xf0d7dc,0xc9c4b8,0xe6e0c8],flowerCols=[0xd8412f,0xe2b93b,0xe889a8,0xf4f0e7,0x9a6fc0,0xf08a3c];
function tomb(F,lx,lz){const t=rnd(),col=pick(tombCols),p=F.p(lx,lz);
  anchor(p[0],p[1],()=>{
    if(t<.07){const b=F.b(lx,lz,2.3,2.8);for(let s=0;s<4;s++)F.side(lx,lz,2.3,2.8,PADY,2.3,s,[s===1?'archDoor':'stucco'],col);roofGable(b[0],b[1],b[2],b[3],2.42,.7,pick([0xa8543a,0xb9bfc0,0xd9d5cb]),col);crossOn(F,lx,3.1,lz+1.2,.5,0x3a3632);F.solid(lx,lz,2.3,2.8,3);F.shade(lx,lz,2.3,2.8,PADY);return;}
    if(t<.3){F.put(GEO.sphLo,lx,PADY,lz,0,.55,.3,1.05,0xa98a5e);crossOn(F,lx,PADY+.1,lz-1.0,.62,0x6b5138);F.solid(lx,lz,1.1,2.2,.45,0,5);}
    else{const hi=t>.75?.85:.38;F.box(lx,PADY,lz,1.2,hi,2.3,col,shade(col,1.04));F.box(lx,PADY+hi,lz,1.0,.06,2.1,shade(col,.9));
      if(rnd()<.55)crossOn(F,lx,PADY+hi,lz-1.0,.68,rnd()<.5?0xf4f0e7:0x3a3632);else{F.box(lx,PADY+hi,lz-1.0,.8,.75,.16,col);F.put(GEO.cyl8,lx,PADY+hi+.75,lz-1.0,0,.4,.16,.08,col);}
      F.solid(lx,lz,1.2,2.3,hi+.5,0,5);F.shade(lx,lz,1.2,2.3,PADY,.5);}
    if(rnd()<.45){const n=1+Math.floor(rnd()*3);for(let k=0;k<n;k++)F.put(GEO.sphLo,lx+rr(-.35,.35),PADY+(t>=.3?(t>.75?.9:.44):.3),lz+rr(-.2,.8),0,.11,.1,.11,pick(flowerCols));}});}
function cemetery(x0,z0,x1,z1){const cx=(x0+x1)/2,cz=(z0+z1)/2,F=TF(cx,cz,3),LW=z1-z0,LD=x1-x0,hw=LW/2,hd=LD/2,white=0xf4f0e7;pad(cx,cz,x1-x0,z1-z0,null,true);
  compoundWall(F,LW,LD,1.9,white,5.2,'stucco');
  // gate: two pillars, a beam with the name and a cross
  const gz=hd-.6;for(const s of [-1,1])F.box(s*3.1,0,gz,1,3.5,1,white,0xe9e4d8);F.box(0,3.5,gz,7.4,.6,.9,white,0xe9e4d8);F.box(0,4.1,gz,3.4,.45,.8,white);crossOn(F,0,4.55,gz,1.1,0x3a3632);
  for(const s of [-1,1])F.solid(s*3.1,gz,1,1,3.5);F.sign('PANTEÓN MUNICIPAL',0,3.8,gz+.47,0,6.4,.5,'#f4f0e7','#3a3128',true);
  F.flat(M.walkO,-1.7,-hd+4,1.7,hd-.4,PADY+.006,4);F.flat(M.walkO,-hw+3,-1.5,-1.7,1.5,PADY+.006,4);F.flat(M.walkO,1.7,-1.5,hw-3,1.5,PADY+.006,4);
  // central cross
  F.put(GEO.cyl8,0,PADY,-hd+9,PI/8,1.9,.3,1.9,0xcfc6b4);F.put(GEO.cyl8,0,PADY+.3,-hd+9,PI/8,1.3,.3,1.3,0xd9d5cb);crossOn(F,0,PADY+.6,-hd+9,2.3,0xf4f0e7);F.solid(0,-hd+9,2.6,2.6,.72,0,5);
  for(let lz=-hd+15;lz<hd-5;lz+=4.5){if(Math.abs(lz)<4)continue;for(const s of [-1,1])for(let lx=4.2;lx<hw-3;lx+=3.1)if(rnd()<.74)tomb(F,s*lx+rr(-.15,.15),lz+rr(-.2,.2));}
  for(const q of [[-hw+5,-hd+5],[hw-5,-hd+5],[-hw+6,hd-7],[hw-6,hd-7],[-12,2.6],[14,-3],[-hw+4,-18],[hw-4,20]])F.tree(q[0],q[1],rr(1,1.4),1);
  for(const s of [-1,1]){F.palm(s*6,hd+2.2);bench(F,s*2.9,hd-6,false);}
  label(cx,cz,'PANTEÓN MUNICIPAL',1);}

const half=(B,side)=>({cx:B.cx+side*B.w/4,cz:B.cz,w:B.w/2,d:B.d});
const SPECIAL={
  '208,-630':B=>plaza(B),
  '208,-690':B=>{pad(B.cx,B.cz,B.w,B.d,M.plaza);const F=church(B.cx,B.cz,0,'PARROQUIA\nNTRA. SRA. DE FÁTIMA',true);hall(F,-29,-10,16,11,3.8,0xf2e6c8,{fc:['winBars','doorWood','winBars'],sc:['dado','winBars']});
    F.sign('CASA PARROQUIAL',-29,PADY+3.0,-4.44,0,6,.6,'#f4f0e7','#3a3128',true);for(const q of [[-34,16],[-22,17],[22,17],[34,16],[26,-4],[33,-14],[20,-16]])F.tree(q[0],q[1],rr(1,1.3),0);for(const s of [-1,1])F.palm(s*11,19);
    planter(F,27,6,7,5,false);bench(F,-18,12,false);bench(F,18,12,false);F.lamp(-9,20,1);F.lamp(9,20,1);},
  '304,-570':B=>clinic(B,3,'IMSS · UMF No. 3','IMSS UMF 3'),
  '304,-630':B=>{pad(B.cx,B.cz,B.w,B.d);kinder(half(B,-1),'J.N. BERTHA VON GLUMER',3);blockHouses(half(B,1),.15,'W',commerce(B),false);},
  '112,-750':B=>civic(B,0,'CENTRO DE SALUD',{lx:26,w:24,band:0x1f6b45,fg:'#1f5d3a',van:true}),
  '304,-690':B=>temple(B,2,'CENTRO DE AVIVAMIENTO',0),
  '400,-750':B=>temple(B,2,'COMPAÑERISMO CRISTIANO',28),
  '112,-510':B=>civic(B,0,'CRUZ ROJA MEXICANA',{lx:-10,w:16,d:10,fg:'#b3261e',band:0xb3261e,van:true}),
  '112,-390':B=>civic(B,0,'CORREOS DE MÉXICO',{lx:-30,w:16,d:10,fg:'#1f5d3a',band:0x1f6b45}),
  '112,-330':B=>civic(B,2,'GRUPO DE EMERGENCIAS',{lx:30,w:14,d:9,fg:'#b3261e',fc:['gate','doorMetal','gate'],van:true}),
  '208,-330':B=>civic(B,1,'BANCO DEL BIENESTAR',{lx:-10,w:18,d:12,fg:'#7a1f3d',band:0x7a1f3d,fc:['glassFront','doorGlass','glassFront']}),
  '112,-210':B=>school(B,'SEC. TÉCNICA No. 2',0),
  '-34,-90':B=>market(B,1),'-34,-330':B=>gas(B,1),'34,-390':B=>gas(B,3),'34,-450':B=>terminal(B,3),'34,254':B=>gas(B,3),
  '-34,27':B=>{pad(B.cx,B.cz,B.w,B.d);kinder(B,'J.N. EL CHAMIZAL',1);},
  '-34,94':B=>hotel(B,1),'-34,-270':B=>hotel(B,1,0xe59a7a),'304,-30':B=>hotel(B,0,0xf0d7a0),
  '-208,-270':B=>temple(B,0,'CAPILLA SANTA CRUZ',0),'-208,-390':B=>temple(B,0,'IGLESIA ADVENTISTA',6),
  '-208,-510':B=>school(B,'PRIM. DOMINGO CARBALLO F.',0),'112,-570':B=>school(B,'PRIM. PLUTARCO E. CALLES',1),'-208,334':B=>school(B,'PRIM. GPE. MONTES LÓPEZ',2),
  '-304,334':B=>civic(B,0,'CASA DE LA CULTURA',{lx:25,w:22,d:13,h:5,tint:0xe59a7a,fg:'#1d3f7a'}),
  '-304,414':B=>temple(B,0,'TEMPLO VALLE SARÓN',-25),
  '-208,734':B=>{pad(B.cx,B.cz,B.w,B.d);const F=church(B.cx-6,B.cz,3,'IGLESIA\nSAN JOSÉ',true);for(const q of [[-14,20],[14,20],[-12,-22],[12,-22]])F.tree(q[0],q[1],1.2,0);F.palm(-10,22);F.palm(10,22);},
  '-208,-810':B=>temple(B,0,'SALÓN DEL REINO',-10),
  '-112,-870':B=>civic(B,3,'ISSSTE · UMF',{w:20,d:12,band:0x7a1f3d,fg:'#7a1f3d',van:true}),
  '496,-330':B=>temple(B,2,'IGLESIA FUENTE DE MANÁ',0),
  '592,-30':B=>gas(B,0,0xb3261e),
  '784,-450':B=>school(B,'SEC. TÉCNICA No. 11',0),'784,-510':B=>school(B,'PRIM. CARLOS CORTÉS LEYVA',0,0xcfe0d2),
  '688,-750':B=>{pad(B.cx,B.cz,B.w,B.d);kinder(half(B,1),'J.N. VENUSTIANO CARRANZA',2);blockHouses(half(B,-1),.3,'E',commerce(B),true);},
  '-112,-150':B=>{pad(B.cx,B.cz,B.w,B.d);blockHouses(B,.35,'',commerce(B),false);tower(B.cx+2,B.cz);},
  '34,574':B=>gin(B,3)};
const STADIUM={'208,94':1,'304,94':1,'208,174':1,'304,174':1};
for(const B of BLOCKS){const key=bkey(B),t=SPECIAL[key];if(STADIUM[key]){kept[key]=2;continue;}
  const v=sup(B.cx,B.cz);if(!t&&v>1+rr(-.16,.08))continue;kept[key]=1;B.kept=true;
  if(t)t(B);else plainBlock(B,v);}
stadium(256,134);
cemetery(936,-906,1036,-834);
