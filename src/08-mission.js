// =====================================================================
// 08 MISSION: objectives through the real town, garrisons, reinforcements, checkpoints, helicopter, survival
// =====================================================================
const ST=[
 {key:'gas',title:'Secure the gas station on Blvd. Benito Juárez',x:24,z:254,r:26,type:'capture',spawn:[3.5,484,0],
  groups:[{x:0,z:345,r:16,units:{rifle:3}},{x:26,z:254,r:24,units:{rifle:4,rush:1}}],marks:0,reinf:{at:.4,n:3,kinds:['rifle','rush'],dir:[0,-1]},
  intro:['COMMAND','Halcón, hostiles hold the gas station ahead. Push up the boulevard and secure it.'],outro:['COMMAND','Gas station is ours. The Glorieta is three blocks north.']},
 {key:'glorieta',title:'Take the Glorieta',x:0,z:0,r:24,type:'capture',spawn:[18,286,0],
  groups:[{x:0,z:124,r:18,units:{rifle:2}},{x:0,z:6,r:24,units:{rifle:4,heavy:1,rush:1}},{x:44,z:0,r:10,units:{rifle:2}}],marks:1,reinf:{at:.45,n:4,kinds:['rifle','rifle','rush'],dir:[0,-1]},
  intro:['COMMAND','The statue marks the crossroads where Highway 1 turns for Loreto. Take it.'],outro:['COMMAND','Crossroads secured. Expect a counterattack from the Loreto road. Dig in.']},
 {key:'hold',title:'Hold the Glorieta',x:0,z:0,r:34,type:'hold',time:75,spawn:[-4,14,0],
  waves:[{t:3,n:5,kinds:['rifle','rifle','rush'],dir:[1,0]},{t:26,n:5,kinds:['rifle','rush','rush'],dir:[0,-1]},{t:48,n:6,kinds:['rifle','rifle','heavy','rush'],dir:[1,0]}],
  outro:['COMMAND','Counterattack broken. Move north up the boulevard to Calle Miguel Hidalgo.']},
 {key:'north',title:'Clear the boulevard up to Calle Miguel Hidalgo',x:0,z:-312,r:30,type:'capture',spawn:[4,-16,0],
  groups:[{x:-20,z:-90,r:22,units:{rifle:2}},{x:0,z:-200,r:18,units:{rifle:3,rush:1}},{x:-4,z:-300,r:26,units:{rifle:4}}],marks:1,reinf:{at:.5,n:4,kinds:['rifle','rush'],dir:[0,-1]},
  intro:['COMMAND','Supermarket on your left, then the hotel and the gas station. Watch the rooftops.'],outro:['COMMAND','Good work. A radio jammer is parked by the bus terminal, two blocks up at the corner of Pípila.']},
 {key:'jam',title:'Destroy the radio jammer at the bus terminal',x:44,z:-478.5,r:4.6,type:'plant',spawn:[4,-322,0],defend:24,
  groups:[{x:30,z:-466,r:24,units:{rifle:5,rush:1}}],marks:1,waves:[{t:2,n:4,kinds:['rifle','rush'],dir:[0,-1]},{t:12,n:4,kinds:['rifle','rifle','rush'],dir:[1,0]}],
  outro:['COMMAND','Jammer is down. Go east along Pípila to Avenida 20 de Noviembre, then north past Allende to the Plaza Principal.']},
 {key:'plaza',title:'Clear the Plaza Principal',x:208,z:-630,r:64,type:'eliminate',spawn:[30,-478,-1.57],
  groups:[{x:112,z:-480,r:16,units:{rifle:2}},{x:160,z:-548,r:16,units:{rifle:2,rush:1}},{x:208,z:-630,r:30,units:{rifle:5,heavy:1,rush:1}}],marks:0,belfry:true,
  intro:['COMMAND','Marksmen are in the bell towers of the parish. Use cover and take the plaza.'],outro:['COMMAND','Plaza is clear. Helicopter is inbound. Hold until it lands.']},
 {key:'exfil',title:'Hold the plaza until the helicopter lands',x:208,z:-630,r:46,type:'hold',time:55,spawn:[208,-612,0],heli:true,
  waves:[{t:3,n:5,kinds:['rifle','rush'],dir:[-1,0]},{t:22,n:5,kinds:['rifle','rifle','rush'],dir:[0,1]},{t:40,n:5,kinds:['rifle','heavy','rush'],dir:[1,0]}]},
 {key:'board',title:'Board the helicopter',x:256,z:-600,r:5.5,type:'reach',spawn:[208,-612,0],intro:['REYES','Bird is on the deck. Go, go!']}];
const MS={stall:0,tip:0,i:-1,st:null,prog:0,t:0,phase:'',init:1,reinfDone:false,waveK:0,done:false,nextT:0,plantT:0,defT:0,loadout:null,jam:null,surv:null};
const OBJ={text:'',sub:'',prog:0,x:0,z:0,y:1.8,show:false};
const TIPS=isTouch?['Tap AIM to look down the sights. CROUCH behind cars and sandbags; hostiles do the same.','Hostiles show on the minimap when they fire. Red arcs point to where shots come from.','NADE throws a grenade. USE swaps your weapon for one on the ground. Red barrels and fuel pumps explode.']
  :['Hold the right mouse button to aim down the sights. Crouch with C behind cars and sandbags; hostiles do the same.','Hostiles show on the minimap when they fire. Red arcs point to where shots come from.','G throws a grenade. F swaps your weapon for one on the ground. Red barrels and fuel pumps explode.'];
const waveQ=[];
function aliveFoes(tag){let n=0;for(let k=0;k<foes.length;k++)if(foes[k].alive&&(!tag||foes[k].tag===tag))n++;return n;}
function foesNear(x,z,r){let n=0;for(let k=0;k<foes.length;k++){const s=foes[k];if(s.alive&&s.y0<.5&&Math.hypot(s.x-x,s.z-z)<r)n++;}return n;}
function spotNear(x,z,r,tries){for(let k=0;k<(tries||30);k++){const a=R()*TAU,d=Math.sqrt(R())*r,px=x+Math.cos(a)*d,pz=z+Math.sin(a)*d;if(freeSpot(px,pz))return[px,pz];}return null;}
function garrison(grp,tag){const covers=lowCover.filter(c=>Math.hypot(c[0]-grp.x,c[1]-grp.z)<grp.r);
  for(const kind in grp.units)for(let k=0,n=Math.max(1,Math.round(grp.units[kind]*coScale()));k<n;k++){let p=null;if(covers.length&&R()<.7){const c=RP(covers);p=spotNear(c[0],c[1],2.6,12);}
    if(!p)p=spotNear(grp.x,grp.z,grp.r,40);if(!p)continue;const o={tag,post:{x:p[0],z:p[1]},yaw:Math.atan2(-(P.x-p[0]),-(P.z-p[1]))+R2(-1.2,1.2)};
    if(kind==='rifle'&&R()<.35){const q=spotNear(p[0],p[1],14,10);if(q)o.post2={x:q[0],z:q[1]};}addSoldier(1,kind,p[0],p[1],o);}}
function spawnMark(pos,tag){return addSoldier(1,'mark',pos.x,pos.z,{y0:pos.y,isStatic:true,tag,yaw:Math.atan2(-(P.x-pos.x),-(P.z-pos.z))});}
function roofSpot(x,z,minD,maxD){let best=null,bs=-1;for(let k=0;k<buildings.length;k++){const b=buildings[k];if(!b.flat||b.h<3.2||b.h>7)continue;const d=Math.hypot(b.x-x,b.z-z);if(d<minD||d>maxD)continue;
    const sc=R();if(sc>bs){bs=sc;best=b;}}
  return best?{x:clamp(x,best.x-best.w/2+.9,best.x+best.w/2-.9),y:best.h,z:clamp(z,best.z-best.d/2+.9,best.z+best.d/2-.9)}:null;}
// reinforcements arrive from a street corner out of the player's sight and head for (tx,tz)
function spawnWave(n,kinds,tx,tz,dir,tag){n=Math.min(Math.round(n*coScale()),foeCap()+2-aliveFoes());if(n<=0)return 0;const H=humans();let best=null,bs=-1e9;
  for(let k=0;k<50;k++){const s=RP(SPN);let dP=H.length?1e9:Math.hypot(s[0]-tx,s[1]-tz);for(const h of H)dP=Math.min(dP,Math.hypot(s[0]-h.x,s[1]-h.z));if(dP<55||dP>150||!freeSpot(s[0],s[1]))continue;
    let sc=-Math.abs(dP-95)*.02+R();if(dir){const dx=s[0]-tx,dz=s[1]-tz,l=Math.hypot(dx,dz)||1;sc+=(dx*dir[0]+dz*dir[1])/l*1.5;}
    for(const h of H)if(los(s[0],1.6,s[1],h.x,(h===P?P.y:h.y0)+1.6,h.z)){sc-=3;break;}if(sc>bs){bs=sc;best=s;}}
  if(!best)return 0;
  for(let k=0;k<n;k++){const p=spotNear(best[0],best[1],6,12)||best;waveQ.push({t:k*.35,kind:kinds[Math.floor(R()*kinds.length)],x:p[0],z:p[1],tag});}
  if(G.lkp.age>10){G.lkp.x=tx;G.lkp.z=tz;G.lkp.age=6;}return n;}
function updWaves(dt){for(let k=waveQ.length-1;k>=0;k--){const w=waveQ[k];w.t-=dt;if(w.t<=0){waveQ.splice(k,1);const s=addSoldier(1,w.kind,w.x,w.z,{aware:true,tag:w.tag});s.lkx=G.lkp.x;s.lkz=G.lkp.z;}}}
// the jammer truck (objective prop): cab, equipment shelter, mast and dish
let jamGeo=null;
function jammerGeo(){if(jamGeo)return jamGeo;const b=new GB(),ol=0x5b6140,ol2=0x4a5034,dk=0x24231f;
  b.add(GEO.box,0,.5,0,0,0,0,1.9,.3,5.8,dk);for(const z of [-2,.9,2.05])for(const s of [-1,1])b.add(GEO.wheel,s*.92,.5,z,0,0,0,.34,.5,.5,0x1b1a19);
  b.add(profile([[1.25,.8],[1.25,2.05],[1.95,2.05],[2.45,1.55],[2.9,1.45],[2.9,.8]],2.05,.06),0,0,0,0,0,0,1,1,1,ol);
  b.add(GEO.box,0,1.52,-2.2,-.72,0,0,1.8,.62,.04,0x1c2830);for(const s of [-1,1])b.add(GEO.box,s*1.035,1.5,-1.62,0,0,0,.02,.42,.5,0x1c2830);
  b.add(GEO.box,0,.8,.95,0,0,0,2.2,1.95,3.7,ol);b.add(GEO.box,0,2.75,.95,0,0,0,2.3,.08,3.8,ol2);for(const z of [-.2,.9,2])for(const s of [-1,1])b.add(GEO.box,s*1.11,1,z,0,0,0,.02,1.5,.06,ol2);
  b.add(GEO.box,-1.11,1.2,1.6,0,0,0,.03,1.2,.8,ol2);b.add(GEO.tube6,0,2.8,1.9,0,0,0,.06,4.6,.06,0x8c9396);b.add(GEO.cap,0,7.5,1.9,1.1,.4,0,.85,.3,.85,0xb3b9bb);b.add(GEO.tube6,0,7.5,1.9,1.1,.4,0,.03,.6,.03,0x8c9396);
  for(const q of [[.8,-.4],[-.8,.2]])b.add(GEO.rod,q[0],2.8,q[1],0,0,q[0]*.1,.018,2.6,.018,dk);b.add(GEO.box,.6,2.83,.2,0,0,0,.6,.35,.5,ol2);
  return jamGeo=b.build();}
function makeJammer(){removeJammer(false);const x=44,z=-478.5,g=new T.Mesh(jammerGeo(),vcMat);g.position.set(x,0,z);g.rotation.y=PI/2;g.castShadow=true;
  scene.add(g);const c=solid(x,z,5.9,2.3,2.8);binAdd(c);blockCollider(c);MS.jam={g,c,x,z};}
function removeJammer(boom,rep){const j=MS.jam;if(!j)return;scene.remove(j.g);j.c.off=true;MS.jam=null;
  if(boom){if(MP.on&&MP.host&&!rep)mpEvent('jam',0,[]);explode(j.x,1.2,j.z,9.5,200,true,rep,0);const w=new T.Mesh(jammerGeo(),char);w.position.set(j.x,-.12,j.z);w.rotation.y=PI/2;w.scale.set(1,.72,1);scene.add(w);fires.push({x:j.x,y:1.2,z:j.z,t:16,n:0});}}
// extraction helicopter
const heli={g:null,rot:null,tail:null,on:false,landed:false,x:0,y:0,z:0};
function makeHeli(){if(heli.g)return;const g=new T.Group(),b=new GB(),ol=0x4b5239,ol2=0x3c4230,gl=0x1c2830,dk=0x24231f;
  b.add(GEO.sph,0,1.95,-.3,0,0,0,1.15,1.05,2.7,ol);b.add(GEO.sph,0,1.72,-2.25,0,0,0,.98,.82,1.15,ol);b.add(GEO.sph,0,2.02,-2.5,0,0,0,.84,.6,.86,gl);
  for(const s of [-1,1]){b.add(GEO.sph,s*.93,2.12,-1.5,0,0,0,.2,.42,.55,gl);b.add(GEO.box,s*1.1,1.3,.25,0,0,0,.06,1.15,1.5,dk);b.add(GEO.tube6,s*1.15,.1,-2.3,PI/2,0,0,.06,4.6,.06,dk);b.add(GEO.tube6,s*1.15,.1,-2.3,2.5,0,0,.06,.5,.06,dk);
    for(const z of [-1.3,1.2])b.add(GEO.rod,s*1.15,.1,z,0,0,s*.32,.045,1.05,.045,dk);b.add(GEO.box,s*1.0,1.8,3.2,0,0,0,.05,.35,.5,0xe9e5da);}
  b.add(GEO.taper,0,2.3,1.9,PI/2,0,0,.44,5.3,.44,ol);b.add(GEO.box,0,2.3,6.4,-.5,0,0,.12,1.9,.85,ol);b.add(GEO.box,0,2.35,5.5,0,0,0,1.7,.06,.5,ol);
  b.add(GEO.sph,0,3.0,.35,0,0,0,.72,.42,1.35,ol2);b.add(GEO.tube6,0,2.95,1.4,PI/2,0,0,.2,.6,.2,dk);b.add(GEO.cyl8,0,3.2,0,0,0,0,.09,.42,.09,dk);b.add(GEO.cyl8,0,3.56,0,0,0,0,.22,.1,.22,dk);
  const body=new T.Mesh(b.build(),vcMat);body.castShadow=true;g.add(body);
  heli.rot=new T.Group();heli.rot.position.set(0,3.68,0);g.add(heli.rot);const bl=new T.Mesh(new T.BoxGeometry(11.6,.05,.36),M.dark);heli.rot.add(bl);const bl2=new T.Mesh(new T.BoxGeometry(.3,.05,1.6),M.dark);heli.rot.add(bl2);
  const disc=new T.Mesh(new T.CircleGeometry(5.8,24),new T.MeshBasicMaterial({color:0x15110c,transparent:true,opacity:.1,depthWrite:false,side:T.DoubleSide}));disc.rotation.x=-PI/2;heli.rot.add(disc);
  heli.tail=new T.Mesh(new T.BoxGeometry(.06,1.8,.18),M.dark);heli.tail.position.set(.22,3.15,6.75);g.add(heli.tail);heli.g=g;g.visible=false;scene.add(g);}
function updHeli(dt,p){if(!heli.g||!heli.on)return;const lx=256,lz=-600,e=clamp(p/.86,0,1),k=e*e*(3-2*e);
  heli.x=lerp(lx+520,lx,k);heli.z=lerp(lz-160,lz,k);heli.y=p<.86?lerp(70,26,k):lerp(26,.1,clamp((p-.86)/.14,0,1));
  heli.g.position.set(heli.x,heli.y,heli.z);heli.g.rotation.y=p<.86?-PI/2+.2:lerp(-PI/2+.2,0,clamp((p-.86)/.1,0,1));heli.g.rotation.z=p<.86?-.12*(1-k):0;
  heli.rot.rotation.y+=dt*26;heli.tail.rotation.x+=dt*40;heliSound(true,heli.x,heli.z);
  if(heli.y<14&&R()<.5){const a=R()*TAU;puff(heli.x+Math.cos(a)*5,.3,heli.z+Math.sin(a)*5,0xd9c39a,1,4,.9,.5,Math.cos(a)*6,.6,Math.sin(a)*6,false,true);}}
function hideHeli(){heli.on=false;if(heli.g)heli.g.visible=false;heliSound(false);}

function stageStart(i){MS.i=i;const st=ST[i];MS.st=st;MS.prog=0;MS.t=0;MS.stall=0;MS.tip=0;MS.lastN=-1;MS.hinted=false;MS.phase='';MS.reinfDone=false;MS.waveK=0;MS.done=false;MS.plantT=0;MS.defT=0;G.stage=i;
  MS.loadout={slots:P.slots.map(w=>({id:w.id,mag:w.mag,res:w.res})),cur:P.cur,nades:P.nades};saveGame();
  if(st.groups)st.groups.forEach(g=>garrison(g,st.key));
  if(st.belfry){const bl=belfries.filter(b=>Math.hypot(b.x-st.x,b.z-st.z)<120);if(bl.length)spawnMark(RP(bl),st.key);} // one marksman, in either tower
  for(let k=0;k<(st.marks||0);k++){const r=roofSpot(st.x,st.z,22,62);if(r)spawnMark(r,st.key);}
  MS.init=Math.max(1,aliveFoes(st.key));
  if(st.key==='jam')makeJammer();
  if(st.heli){makeHeli();heli.on=true;heli.landed=false;heli.g.visible=true;}
  OBJ.text=st.title;OBJ.sub='';OBJ.prog=0;OBJ.x=st.x;OBJ.z=st.z;OBJ.show=true;if(st.intro)radio(st.intro[0],st.intro[1]);}
function stageDone(){const st=MS.st;MS.done=true;MS.nextT=st.type==='reach'?.1:3.2;G.score+=500;sndUi('obj');if(st.type!=='reach')banner('OBJECTIVE COMPLETE',st.title.toUpperCase());
  if(st.outro)radio(st.outro[0],st.outro[1]);if(st.type!=='reach'&&st.key!=='exfil'){const p=spotNear(st.x,st.z,7,30);if(p)coCrate(p[0],p[1]);}
  for(const a of allies){if(a.down){a.down=false;a.alive=true;a.up.rotation.z=0;}a.hp=a.maxHp;}}
function stageUpdate(dt){const st=MS.st;if(!st)return;
  if(MS.done){MS.nextT-=dt;if(MS.nextT<=0){if(MS.i+1<ST.length)stageStart(MS.i+1);else missionWon();}return;}
  MS.t+=dt;const dMe=P.alive?Math.hypot(P.x-st.x,P.z-st.z):1e9;let dP=dMe;for(const m of MP.mates)if(m.alive)dP=Math.min(dP,Math.hypot(m.x-st.x,m.z-st.z)); // the nearest player counts
  const inZone=dP<st.r;OBJ.x=st.x;OBJ.z=st.z;OBJ.y=1.8;
  if(MS.i===0&&!SAVE.tips&&MS.tip<3&&MS.t>5+MS.tip*12){radio('TIP',TIPS[MS.tip++]);if(MS.tip>=3){SAVE.tips=true;saveGame();}}
  if(st.reinf&&!MS.reinfDone&&aliveFoes(st.key)<=MS.init*(1-st.reinf.at)){MS.reinfDone=true;spawnWave(st.reinf.n,st.reinf.kinds,st.x,st.z,st.reinf.dir,st.key);}
  if(st.type==='capture'){const near=foesNear(st.x,st.z,st.r+8);
    if(inZone&&near===0)MS.prog+=dt/6;else if(!inZone)MS.prog=Math.max(0,MS.prog-dt/12);
    // if the last defenders are hiding, mark them on the minimap
    if(inZone&&near>0){MS.stall+=dt;if(MS.stall>9)for(const s of foes)if(s.alive&&Math.hypot(s.x-st.x,s.z-st.z)<st.r+8&&s.revealT<1)s.revealT=1;}else MS.stall=0;
    OBJ.sub=near?'Hostiles in the area: '+near:inZone?'Securing the position':'Move to the marker';if(MS.prog>=1)stageDone();}
  else if(st.type==='hold'){if(inZone)MS.prog+=dt/st.time;const el=MS.prog*st.time;
    while(MS.waveK<st.waves.length&&el>=st.waves[MS.waveK].t){const w=st.waves[MS.waveK++];spawnWave(w.n,w.kinds,st.x,st.z,w.dir,st.key);}
    OBJ.sub=inZone?Math.max(0,Math.ceil(st.time-el))+' s to go':'Get back to the position';if(st.heli)updHeli(dt,MS.prog);if(MS.prog>=1){if(st.heli)heli.landed=true;stageDone();}}
  else if(st.type==='plant'){const j=MS.jam;
    if(MS.phase===''){OBJ.sub=foesNear(st.x,st.z,26)?'Fight through to the truck':'Plant the charge on the truck';
      if(j&&dP<st.r){if(dMe<st.r)G.prompt='Hold <b>'+(isTouch?'USE':'F')+'</b> to plant the charge';let planting=dMe<st.r&&IN.useHeld;
        if(!planting)for(const m of MP.mates){const pl=MP.players.get(m.pid);if(m.alive&&pl&&pl.use&&Math.hypot(m.x-st.x,m.z-st.z)<st.r){planting=true;break;}}
        if(planting){MS.plantT+=dt;OBJ.sub='Planting the charge';MS.prog=MS.plantT/2.2*.3;
          if(MS.plantT>=2.2){MS.phase='defend';MS.defT=st.defend;sndUi('pin');radio('COMMAND','Charge is set. '+st.defend+' seconds. Keep them off it and stay clear of the truck.');}}
        else MS.plantT=Math.max(0,MS.plantT-dt);}}
    else{MS.defT-=dt;const el=st.defend-MS.defT;while(MS.waveK<st.waves.length&&el>=st.waves[MS.waveK].t){const w=st.waves[MS.waveK++];spawnWave(w.n,w.kinds,st.x,st.z,w.dir,st.key);}
      MS.prog=.3+.7*el/st.defend;OBJ.sub='Detonation in '+Math.max(0,Math.ceil(MS.defT))+' s. '+(dP<11?'GET CLEAR OF THE TRUCK':'You are clear');if(dMe<11&&MS.defT<8)G.prompt='Move away from the truck';if(MS.defT<=0){removeJammer(true);stageDone();}}}
  else if(st.type==='eliminate'){const n=aliveFoes(st.key);MS.prog=1-n/MS.init;OBJ.sub='Hostiles remaining: '+n;if(n!==MS.lastN){MS.lastN=n;MS.stall=0;}else MS.stall+=dt;
    // point at the nearest one left once few remain or the hunt has stalled; a marker up in the air means a rooftop or bell tower
    if(n>0&&(n<=3||MS.stall>18)){let b=null,bd=1e9,high=0;for(const s of foes)if(s.alive&&s.tag===st.key){if(s.revealT<1)s.revealT=1;if(s.y0>2)high++;const d=Math.hypot(s.x-P.x,s.z-P.z);if(d<bd){bd=d;b=s;}}
      if(b){OBJ.x=b.x;OBJ.z=b.z;OBJ.y=b.y0+1.8;}if(high===n&&!MS.hinted){MS.hinted=true;radio('LUNA','Marksman up in the bell tower. Back off and aim high.');}}
    if(n===0)stageDone();}
  else if(st.type==='reach'){OBJ.sub='';updHeli(dt,1);if(inZone)stageDone();}
  OBJ.prog=clamp(MS.prog,0,1);}
function resetWorldState(){clearSoldiers();clearPicks();for(const n of nades)scene.remove(n.m);nades.length=0;waveQ.length=0;hideHeli();G.arcs.length=0;G.lkp.age=99;G.vig=0;G.supp=0;
  P.vx=P.vz=P.vy=0;P.hp=100;P.alive=true;P.stam=1;P.crouching=false;P.crouch=0;P.ads=0;P.wantAds=false;P.reloading=false;P.swapT=0;P.swapTo=-1;P.meleeT=0;P.recoil=0;P.pitch=0;P.punch=0;P.roll=0;P.hurtT=9;
  IN.fire=false;IN.useHeld=false;P.spawnT=0;}
function placeSquad(){if(MP.on&&(mpMode().vs||MP.players.size>1)){for(const a of allies)removeSoldier(a);allies.length=0;return;} // the other players are the squad
  const names=['REYES','LUNA'];while(allies.length<2){addSoldier(0,'ally',P.x,P.z,{name:names[allies.length],aware:true});}
  allies.forEach((a,k)=>{const p=spotNear(P.x+Math.sin(P.yaw)*4,P.z+Math.cos(P.yaw)*4,5,30)||[P.x,P.z];a.x=p[0];a.z=p[1];a.hp=a.maxHp;a.alive=true;a.down=false;a.target=null;a.up.rotation.z=0;a.g.position.set(a.x,0,a.z);a.g.visible=true;});}
function startMission(stage){G.mode='mission';resetWorldState();removeJammer(false);const st=ST[stage],sp=st.spawn;P.x=sp[0];P.z=sp[1];P.y=0;P.yaw=sp[2];
  giveLoadout();if(stage>0)for(const w of P.slots)w.res=Math.round(WDEF[w.id].max*.72);
  G.score=0;G.stats={kills:0,heads:0,shots:0,hits:0,deaths:0,time:0};placeSquad();stageStart(stage);
  banner('OPERACIÓN INSURGENTES','CIUDAD INSURGENTES, B.C.S. · FIRETEAM HALCÓN');}
function restartCheckpoint(){resetWorldState();removeJammer(false);const st=MS.st,sp=st.spawn,L0=MS.loadout;P.x=sp[0];P.z=sp[1];P.y=0;P.yaw=sp[2];
  P.slots=L0.slots.map(w=>({id:w.id,mag:WDEF[w.id].mag,res:Math.max(w.res,Math.round(WDEF[w.id].max*.6))}));P.cur=L0.cur;P.nades=Math.max(3,L0.nades);showWeapon();
  placeSquad();stageStart(MS.i);if(MP.on&&MP.host)mpEvent('ckpt',0,[MS.i]);}
function startSurvival(){G.mode='survival';resetWorldState();removeJammer(false);MS.st=null;MS.i=-1;P.x=-4;P.z=16;P.y=0;P.yaw=0;giveLoadout();
  G.score=0;G.stats={kills:0,heads:0,shots:0,hits:0,deaths:0,time:0};placeSquad();MS.surv={wave:0,t:4,live:false,left:0};
  OBJ.text='Survive at the Glorieta';OBJ.sub='';OBJ.prog=0;OBJ.x=0;OBJ.z=0;OBJ.show=false;banner('SURVIVAL','HOLD THE GLORIETA AS LONG AS YOU CAN');}
function survivalUpdate(dt){const S=MS.surv;if(!S)return;
  const H=humans();let cx=0,cz=0;for(const h of H){cx+=h.x/H.length;cz+=h.z/H.length;} // where the players are, or the Glorieta if nobody is standing
  if(!S.live){S.t-=dt;OBJ.sub='Next wave in '+Math.max(0,Math.ceil(S.t))+' s';if(S.t<=0){S.wave++;S.live=true;S.left=Math.round((4+S.wave*2)*coScale());S.st=0;banner('WAVE '+S.wave,'');
      if(S.wave>=4&&S.wave%2===0){const r=roofSpot(cx,cz,25,60);if(r)spawnMark(r,'sv');}}return;}
  S.st-=dt;if(S.left>0&&S.st<=0){S.st=3;const kinds=S.wave<2?['rifle']:S.wave<4?['rifle','rifle','rush']:['rifle','rifle','rush','heavy'];
    S.left-=spawnWave(Math.min(S.left,4),kinds,cx,cz,null,'sv');}
  const n=aliveFoes()+waveQ.length;OBJ.text='Survive at the Glorieta · Wave '+S.wave;OBJ.sub='Hostiles: '+(n+Math.max(0,S.left));
  if(S.left<=0&&n===0){S.live=false;S.t=7;G.score+=250*S.wave;sndUi('obj');banner('WAVE '+S.wave+' CLEAR','+'+250*S.wave);if(S.wave%2===0){const p=spotNear(cx,cz,8,30);if(p)coCrate(p[0],p[1]);}
    for(const a of allies){if(a.down){a.down=false;a.alive=true;a.up.rotation.z=0;}a.hp=a.maxHp;}}}
function missionUpdate(dt){updWaves(dt);if(G.mode==='mission')stageUpdate(dt);else survivalUpdate(dt);}
