// =====================================================================
// 06a WEAPONS: definitions, first-person models, explosions, destructible props, grenades, pickups
// =====================================================================
const G={state:'menu',mode:'mission',time:0,score:0,vig:0,flash:0,prompt:'',stage:0,stats:{kills:0,heads:0,shots:0,hits:0,deaths:0,time:0},
  lkp:{x:0,z:0,age:99},budget:0,arcs:[],toasts:[]};
const WDEF={
  m4:{name:'M4 CARBINE',auto:true,rate:.08,mag:30,max:210,dmg:34,head:3,rng:[45,110,.7],hip:.03,ads:.0035,kick:.0105,kickH:.005,adsFov:48,reload:2.1,pellets:1,speed:1,snd:'m4',adsT:.19,sight:.085,mz:-.6},
  ak:{name:'AK-47',auto:true,rate:.1,mag:30,max:180,dmg:42,head:3,rng:[40,100,.7],hip:.034,ads:.005,kick:.016,kickH:.008,adsFov:50,reload:2.5,pellets:1,speed:.98,snd:'ak',adsT:.21,sight:.08,mz:-.62},
  smg:{name:'MP5',auto:true,rate:.07,mag:30,max:180,dmg:24,head:2.5,rng:[18,50,.55],hip:.024,ads:.006,kick:.007,kickH:.005,adsFov:54,reload:1.9,pellets:1,speed:1.06,snd:'smg',adsT:.15,sight:.08,mz:-.42},
  pistol:{name:'M9 PISTOL',auto:false,rate:.13,mag:15,max:75,dmg:30,head:2.6,rng:[18,45,.55],hip:.02,ads:.006,kick:.014,kickH:.006,adsFov:58,reload:1.5,pellets:1,speed:1.08,snd:'pistol',adsT:.12,sight:.062,mz:-.2},
  shotgun:{name:'M870 SHOTGUN',auto:false,rate:.85,mag:6,max:36,dmg:15,head:1.6,rng:[9,26,.25],hip:.055,ads:.042,kick:.05,kickH:.012,adsFov:58,reload:.5,shell:true,pellets:9,speed:.97,snd:'shotgun',adsT:.2,sight:.07,mz:-.7},
  dmr:{name:'M14 DMR',auto:false,rate:.34,mag:10,max:60,dmg:92,head:2.5,rng:[120,220,.85],hip:.06,ads:.0006,kick:.03,kickH:.006,adsFov:15,reload:2.7,pellets:1,speed:.94,snd:'dmr',adsT:.28,sight:.11,mz:-.72,scope:true},
  lmg:{name:'M249 SAW',auto:true,rate:.075,mag:100,max:200,dmg:36,head:2.6,rng:[50,120,.7],hip:.045,ads:.007,kick:.009,kickH:.007,adsFov:52,reload:4.6,pellets:1,speed:.86,snd:'lmg',adsT:.32,sight:.1,mz:-.66}};
const gunRoot=new T.Group();camera.add(gunRoot);gunRoot.scale.setScalar(.8);
// First-person models: side profiles extruded to the gun's thickness, round barrels and scopes, gloved hands.
// Barrel points to -z; the line of sight is at height D.sight above the origin.
const VM={},GK=0x232528,GK2=0x3a3d41,WOOD=0x6b4426,TAN=0x8f8262,GLV=0x2b2a27;
function gprof(pts,wid){return profile(pts,wid,.005);}
function vmArms(b,gripZ,guardZ,two){b.add(GEO.ball,0,-.085,gripZ,0,0,0,.036,.05,.042,GLV);b.add(GEO.limb,.025,-.1,gripZ+.03,-1.15,-.12,0,.044,.34,.044,TAN);
  if(two){b.add(GEO.ball,-.008,-.05,guardZ,0,0,0,.04,.034,.05,GLV);b.add(GEO.limb,-.03,-.06,guardZ+.03,-1.02,.42,0,.043,.36,.043,TAN);}}
const fwd=(b,r,l,z,y,c,seg)=>b.add(seg||GEO.cyl8,0,y||0,z,-PI/2,0,0,r,l,r,c===undefined?GK:c); // a cylinder from z towards -z
{let b;
 b=new GB(); // M4 carbine
 b.add(gprof([[-.38,.03],[-.16,.03],[-.16,.045],[.17,.045],[.17,-.04],[.12,-.045],[.12,-.07],[.05,-.07],[.05,-.045],[-.16,-.045],[-.2,-.03],[-.33,-.1],[-.38,-.09]],.05),0,0,0,0,0,0,1,1,1,GK);
 b.add(gprof([[-.1,-.04],[-.05,-.04],[-.085,-.15],[-.135,-.15]],.036),0,0,0,0,0,0,1,1,1,GK2);b.add(gprof([[.055,-.06],[.115,-.06],[.1,-.25],[.03,-.235]],.026),0,0,0,0,0,0,1,1,1,GK2);
 fwd(b,.029,.26,-.17,.002,GK2);fwd(b,.011,.2,-.42,.002);fwd(b,.014,.045,-.6,.002);b.add(GEO.box,0,.03,-.445,0,0,0,.03,.03,.03,GK);b.add(GEO.box,0,.045,-.445,0,0,0,.008,.04,.01,GK);
 b.add(GEO.box,-.012,.045,.12,0,0,0,.007,.04,.012,GK);b.add(GEO.box,.012,.045,.12,0,0,0,.007,.04,.012,GK);b.add(GEO.box,0,.045,-.02,0,0,0,.03,.012,.26,GK2);vmArms(b,.1,-.28,true);VM.m4=b;
 b=new GB(); // AK-47
 b.add(gprof([[-.16,.035],[.18,.035],[.18,-.035],[.1,-.04],[-.16,-.04]],.05),0,0,0,0,0,0,1,1,1,GK);b.add(gprof([[-.4,.02],[-.16,.03],[-.16,-.04],[-.3,-.085],[-.4,-.1]],.042),0,0,0,0,0,0,1,1,1,WOOD);
 b.add(gprof([[-.11,-.035],[-.06,-.035],[-.095,-.14],[-.145,-.14]],.036),0,0,0,0,0,0,1,1,1,WOOD);
 b.add(gprof([[.03,-.035],[.1,-.035],[.14,-.14],[.2,-.23],[.14,-.26],[.07,-.16]],.03),0,0,0,0,0,0,1,1,1,GK2);
 fwd(b,.03,.2,-.18,-.006,WOOD);fwd(b,.011,.3,-.38,.0);fwd(b,.009,.2,-.2,.035,GK2);b.add(GEO.box,0,.0,-.6,0,0,0,.012,.075,.012,GK);b.add(GEO.box,0,.035,-.0,0,0,0,.03,.016,.03,GK);
 b.add(GEO.box,-.011,.045,-.0,0,0,0,.007,.035,.01,GK);b.add(GEO.box,.011,.045,-.0,0,0,0,.007,.035,.01,GK);vmArms(b,.11,-.27,true);VM.ak=b;
 b=new GB(); // MP5
 b.add(gprof([[-.14,.04],[.16,.04],[.16,-.035],[.08,-.04],[-.14,-.04]],.05),0,0,0,0,0,0,1,1,1,GK);b.add(gprof([[-.1,-.035],[-.05,-.035],[-.085,-.14],[-.135,-.14]],.036),0,0,0,0,0,0,1,1,1,GK2);
 b.add(gprof([[.02,-.035],[.07,-.035],[.1,-.2],[.05,-.21]],.026),0,0,0,0,0,0,1,1,1,GK2);fwd(b,.026,.13,-.16,.0,GK2);fwd(b,.011,.08,-.29,.0);b.add(GEO.box,0,-.01,.14,0,0,0,.028,.028,.22,GK2);b.add(GEO.box,0,-.07,.34,0,0,0,.03,.1,.03,GK2);
 b.add(GEO.box,-.011,.04,.06,0,0,0,.007,.04,.01,GK);b.add(GEO.box,.011,.04,.06,0,0,0,.007,.04,.01,GK);b.add(GEO.box,0,.03,-.27,0,0,0,.012,.05,.012,GK);vmArms(b,.1,-.2,true);VM.smg=b;
 b=new GB(); // M9
 b.add(gprof([[-.05,.045],[.2,.045],[.2,.0],[.05,-.005],[-.05,-.005]],.034),0,0,0,0,0,0,1,1,1,GK);b.add(gprof([[-.045,0],[.02,0],[-.005,-.12],[-.07,-.115]],.032),0,0,0,0,0,0,1,1,1,GK2);
 b.add(GEO.box,-.009,.045,.03,0,0,0,.006,.017,.01,GK);b.add(GEO.box,.009,.045,.03,0,0,0,.006,.017,.01,GK);b.add(GEO.box,0,.045,-.19,0,0,0,.007,.017,.008,GK);
 b.add(GEO.ball,0,-.06,.03,0,0,0,.038,.055,.045,GLV);b.add(GEO.limb,.02,-.1,.06,-1.1,-.1,0,.044,.34,.044,TAN);b.add(GEO.ball,-.02,-.075,.02,0,0,0,.036,.045,.045,GLV);b.add(GEO.limb,-.045,-.1,.05,-1.05,.4,0,.043,.34,.043,TAN);VM.pistol=b;
 b=new GB(); // M870
 b.add(gprof([[-.15,.04],[.16,.04],[.16,-.04],[-.15,-.04]],.055),0,0,0,0,0,0,1,1,1,GK);b.add(gprof([[-.42,.01],[-.15,.035],[-.15,-.04],[-.2,-.05],[-.32,-.09],[-.42,-.1]],.045),0,0,0,0,0,0,1,1,1,WOOD);
 fwd(b,.017,.52,-.16,.018);fwd(b,.016,.36,-.16,-.022,GK2);fwd(b,.03,.18,-.24,-.024,WOOD);b.add(GEO.box,0,.035,-.66,0,0,0,.01,.022,.01,GK);b.add(GEO.box,0,.04,.08,0,0,0,.03,.012,.03,GK);vmArms(b,.1,-.33,true);VM.shotgun=b;
 b=new GB(); // M14 DMR with scope
 b.add(gprof([[-.48,.0],[-.2,.03],[.3,.03],[.3,-.03],[.05,-.045],[-.1,-.045],[-.16,-.03],[-.3,-.1],[-.48,-.1]],.052),0,-.01,0,0,0,0,1,1,1,WOOD);
 b.add(gprof([[.0,-.045],[.07,-.045],[.06,-.17],[-.01,-.17]],.03),0,0,0,0,0,0,1,1,1,GK2);fwd(b,.012,.46,-.28,.012);fwd(b,.016,.05,-.74,.012);b.add(GEO.box,0,.03,.0,0,0,0,.045,.02,.2,GK);
 fwd(b,.021,.3,.13,.082,GK,GEO.cyl12);fwd(b,.03,.07,-.17,.082,GK,GEO.cyl12);fwd(b,.027,.05,.18,.082,GK,GEO.cyl12);b.add(GEO.box,0,.045,.05,0,0,0,.02,.03,.03,GK);b.add(GEO.box,0,.045,-.1,0,0,0,.02,.03,.03,GK);vmArms(b,.13,-.3,true);VM.dmr=b;
 b=new GB(); // M249 SAW
 b.add(gprof([[-.18,.05],[.2,.05],[.2,-.04],[-.18,-.05]],.07),0,0,0,0,0,0,1,1,1,GK);b.add(gprof([[-.42,.03],[-.18,.04],[-.18,-.05],[-.3,-.06],[-.42,-.1]],.05),0,0,0,0,0,0,1,1,1,GK);
 b.add(gprof([[-.12,-.045],[-.07,-.045],[-.1,-.15],[-.15,-.15]],.036),0,0,0,0,0,0,1,1,1,GK2);b.add(GEO.box,-.02,-.19,-.04,0,0,0,.12,.13,.14,0x4c5a3a);
 fwd(b,.034,.2,-.2,.0,GK2);fwd(b,.014,.36,-.3,.006);b.add(GEO.box,0,.05,.0,0,0,0,.04,.02,.22,GK2);b.add(GEO.box,0,.05,-.52,0,0,0,.012,.05,.012,GK);
 b.add(GEO.box,-.012,.07,.1,0,0,0,.007,.03,.01,GK);b.add(GEO.box,.012,.07,.1,0,0,0,.007,.03,.01,GK);for(const s of [-1,1])b.add(GEO.rod,s*.02,-.03,-.5,2.5,0,s*.3,.008,.26,.008,GK2);vmArms(b,.12,-.28,true);VM.lmg=b;}
const gunMat=new T.MeshPhongMaterial({vertexColors:true,shininess:34,specular:0x3a3a3a});
for(const k in VM){const m=new T.Mesh(VM[k].build(),gunMat);m.visible=false;gunRoot.add(m);VM[k]=m;}
const flash=new T.Sprite(new T.SpriteMaterial({map:dot,color:0xffc45a,transparent:true,depthWrite:false,blending:T.AdditiveBlending}));flash.scale.set(.3,.3,1);flash.visible=false;gunRoot.add(flash);

// ---------- explosions and destructible props
const pending=[],fires=[];
function damageProp(c,dmg){if(!c||!(c.hp>0))return;c.hp-=dmg;if(c.hp<=0){c.hp=0;pending.push({c,t:R2(.05,.3)});}
  else if(c.kind===2&&c.hp<90&&R()<.5)smoke((c.x0+c.x1)/2,1.4,(c.z0+c.z1)/2,.8,1.4);}
// rep: this is a copy of something that happened on another player's machine (owner), so it only shows and hurts me
function blowProp(c,rep,owner){const x=(c.x0+c.x1)/2,z=(c.z0+c.z1)/2;if(c.off||c.wrecked)return;c.hp=0;if(MP.on&&!rep)mpEvent('pb',0,[c.id]);
  if(c.kind===3||c.kind===4){c.off=true;if(c.ref)scene.remove(c.ref);const k=cellOf(x,z);if(k>=0)blocked[k]=0;explode(x,.6,z,c.kind===4?9:7.5,c.kind===4?175:150,true,rep,owner);if(c.kind===4)fires.push({x,y:.4,z,t:9,n:0});}
  else if(c.kind===2){c.wrecked=true;wreck(c.ref);explode(x,.8,z,6.5,130,true,rep,owner);fires.push({x,y:1,z,t:14,n:0});}}
function blownList(){const L=[];for(let k=0;k<colliders.length&&L.length<900;k++){const c=colliders[k];if((c.off||c.wrecked)&&c.kind>=2&&c.kind<=4)L.push(c.id);}return L;}
function blowQuiet(c){if(!c||c.off||c.wrecked||!(c.kind>=2&&c.kind<=4)||!c.ref)return;c.hp=0;
  if(c.kind===2){c.wrecked=true;wreck(c.ref);}else{c.off=true;scene.remove(c.ref);const k=cellOf((c.x0+c.x1)/2,(c.z0+c.z1)/2);if(k>=0)blocked[k]=0;}}
function explode(x,y,z,rad,dmg,byPlayer,rep,owner){fxExplosion(x,y,z,rad);sndBoom(x,z);const dp=Math.hypot(x-P.x,z-P.z);shake=Math.max(shake,clamp(1.3-dp/28,0,1));G.flash=Math.max(G.flash,clamp(.5-dp/40,0,.5));
  const hit=(tx,ty,tz)=>{const d=Math.hypot(tx-x,ty-y,tz-z);if(d>=rad)return 0;return(1-d/rad)*(los(x,y+.7,z,tx,ty,tz)?1:.25);};
  if(P.alive){const k=hit(P.x,P.y+1,P.z);if(k>0&&mpBlast(rep,owner))hurt(dmg*k*.7,x,z);}
  if(rep){noiseEvent(x,z,130);return;} // a copy: its owner's machine deals with soldiers and props
  for(const list of [foes,allies])for(let i=list.length-1;i>=0;i--){const s=list[i];if(!s.alive)continue;const k=hit(s.x,chestY(s),s.z);if(k>0)damageSoldier(s,dmg*k,1,x,z,byPlayer,true);}
  const st=++stamp,i0=clamp(Math.floor((x-rad-BX0)/BS),0,BW-1),i1=clamp(Math.floor((x+rad-BX0)/BS),0,BW-1),j0=clamp(Math.floor((z-rad-BZ0)/BS),0,BH-1),j1=clamp(Math.floor((z+rad-BZ0)/BS),0,BH-1);
  for(let j=j0;j<=j1;j++)for(let i=i0;i<=i1;i++){const l=bins[j*BW+i];for(let q=0;q<l.length;q++){const c=l[q];if(c.st===st||c.off||!(c.hp>0))continue;c.st=st;
    const d=Math.hypot(clamp(x,c.x0,c.x1)-x,clamp(z,c.z0,c.z1)-z);if(d<rad)damageProp(c,dmg*(1-d/rad)*1.4);}}
  noiseEvent(x,z,130);}
function updProps(dt){for(let k=pending.length-1;k>=0;k--){const p=pending[k];p.t-=dt;if(p.t<=0){pending.splice(k,1);blowProp(p.c);}}
  for(let k=fires.length-1;k>=0;k--){const f=fires[k];f.t-=dt;f.n-=dt;if(f.t<=0){fires.splice(k,1);continue;}
    if(f.n<=0){f.n=.11;puff(f.x+R2(-.7,.7),f.y+R2(0,.5),f.z+R2(-.7,.7),0xff8a24,.5,1.3,.5,.9,0,2.2,0,true,true);if(R()<.4)smoke(f.x,f.y+1.4,f.z,1.3,2.6);}}}

// ---------- grenades
const nades=[],nadeGeo=new T.SphereGeometry(.07,8,6),nadeMat=L({color:0x2c3323});
function spawnNade(x,y,z,vx,vy,vz,fuse,byPlayer){const m=new T.Mesh(nadeGeo,nadeMat),n={m,x,y,z,vx,vy,vz,fuse,byPlayer,rest:false,rep:false,by:0};m.position.set(x,y,z);scene.add(m);nades.push(n);return n;}
function updNades(dt){for(let k=nades.length-1;k>=0;k--){const n=nades[k];n.fuse-=dt;
  if(!n.rest){n.vy-=14*dt;let rem=dt;
    for(let it=0;it<3&&rem>1e-4;it++){const sp=Math.hypot(n.vx,n.vy,n.vz);if(sp<.05){n.rest=true;break;}const dx=n.vx/sp,dy=n.vy/sp,dz=n.vz/sp,step=sp*rem,t=rayWorld(n.x,n.y,n.z,dx,dy,dz,step+.08);
      if(t<step+.08){const nx=RHnx,ny=RHny,nzz=RHnz;if(!nx&&!ny&&!nzz){n.rest=true;break;}const tt=Math.max(0,t-.08);n.x+=dx*tt;n.y+=dy*tt;n.z+=dz*tt;
        const vn=n.vx*nx+n.vy*ny+n.vz*nzz;n.vx=(n.vx-1.38*vn*nx)*.74;n.vy=(n.vy-1.38*vn*ny)*.74;n.vz=(n.vz-1.38*vn*nzz)*.74;rem*=1-tt/Math.max(step,1e-5);
        if(sp>3)sndUi('pin');if(ny>.5&&Math.abs(n.vy)<1.3){n.vy=0;if(Math.hypot(n.vx,n.vz)<.6){n.rest=true;break;}}}
      else{n.x+=dx*step;n.y+=dy*step;n.z+=dz*step;rem=0;}}
    if(n.y<.07)n.y=.07;n.m.position.set(n.x,n.y,n.z);}
  if(n.fuse<=0){if(n.rep&&n.fuse>-1.5)continue; // a copy waits for its owner's word; it is tidied away if none comes
    scene.remove(n.m);nades.splice(k,1);if(!n.rep){explode(n.x,n.y,n.z,8.5,170,n.byPlayer);if(MP.on)mpBoom(n.x,n.y,n.z,8.5,170,n.byPlayer?0:1);}}}}

// ---------- pickups: dropped weapons, ammo, medkits, supply crates
const picks=[],pickGeo=new T.BoxGeometry(.5,.5,.5);
const pickMat={med:L({map:tex(64,64,(g,w,h)=>{g.fillStyle='#f4f0e7';g.fillRect(0,0,w,h);g.fillStyle='#2f7d4f';g.fillRect(24,10,16,44);g.fillRect(10,24,44,16);})}),
  ammo:L({map:tex(64,64,(g,w,h)=>{g.fillStyle='#5d6336';g.fillRect(0,0,w,h);g.strokeStyle='#2b2621';g.lineWidth=4;g.strokeRect(3,3,58,58);g.fillStyle='#ffb23e';
    g.font='bold 20px Arial,sans-serif';g.textAlign='center';g.textBaseline='middle';g.fillText('AMMO',32,33);})}),
  nade:L({color:0x2c3323}),crate:L({map:tex(64,64,(g,w,h)=>{g.fillStyle='#4c5a3a';g.fillRect(0,0,w,h);g.strokeStyle='#23291b';g.lineWidth=5;g.strokeRect(3,3,58,58);g.fillStyle='#f3e8d3';
    g.font='bold 15px Arial,sans-serif';g.textAlign='center';g.textBaseline='middle';g.fillText('SUPPLY',32,33);})})};
function addPick(kind,x,z,o){o=o||{};let m;
  if(kind==='w'){m=new T.Mesh(weaponGeo(o.id),solMat);m.scale.setScalar(1.25);m.castShadow=true;}
  else if(kind==='crate'){m=new T.Mesh(new T.BoxGeometry(1.3,.8,.9),pickMat.crate);m.castShadow=true;}
  else if(kind==='nade'){m=new T.Mesh(new T.SphereGeometry(.16,8,6),pickMat.nade);}
  else m=new T.Mesh(pickGeo,pickMat[kind]);
  m.position.set(x,kind==='crate'?.4:.55,z);scene.add(m);const p={kind,x,z,m,t:kind==='crate'?1e9:(o.life||50),id:o.id||'',mag:o.mag||0,res:o.res||0};picks.push(p);return p;}
function clearPicks(){for(const p of picks)scene.remove(p.m);picks.length=0;}
