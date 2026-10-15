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
// First-person models: side profiles extruded to the gun's thickness, round barrels and scopes, and the player's gloved hands.
// Each weapon is a group: the body (with the firing hand merged in), the magazine (or the pump), and the support hand, which
// moves on its own during a reload. The barrel points to -z; the line of sight is at height D.sight above the origin.
const VM={},GK=0x232528,GK2=0x3a3d41,WOOD=0x6b4426,TAN=UNI.ally[0],GLV=0x2b2a27,GLV2=0x3a3833;
function gprof(pts,wid){return profile(pts,wid,.005);}
const fwd=(b,r,l,z,y,c,seg)=>b.add(seg||GEO.cyl8,0,y||0,z,-PI/2,0,0,r,l,r,c===undefined?GK:c); // a cylinder from z towards -z
GEO.annulus=new T.RingGeometry(.65,1,8);
const ring=(b,r,t,z,y,c)=>{c=c===undefined?GK:c;b.add(GEO.tube8,0,y,z,-PI/2,0,0,r,t,r,c);b.add(GEO.annulus,0,y,z,0,0,0,r,r,1,c);}; // a sight hood or aperture on the barrel axis, with a face towards the eye
GEO.fore=new T.CylinderGeometry(.72,1,1,8,1,true);GEO.fore.translate(0,-.5,0);               // forearm: thin wrist at the origin
// append a geometry that carries its own vertex colours (GB.add paints with one colour)
function gbAddC(b,geo,x,y,z,rx,ry,rz){_e.set(rx||0,ry||0,rz||0,'YXZ');_q.setFromEuler(_e);_p.set(x,y,z);_s.set(1,1,1);_m4.compose(_p,_q,_s);_n3.getNormalMatrix(_m4);
  const P=geo.attributes.position,N=geo.attributes.normal,C=geo.attributes.color,ix=geo.index,k=b.p.length/3;
  for(let i=0;i<P.count;i++){_v.fromBufferAttribute(P,i).applyMatrix4(_m4);b.p.push(_v.x,_v.y,_v.z);_v.fromBufferAttribute(N,i).applyMatrix3(_n3).normalize();b.n.push(_v.x,_v.y,_v.z);b.c.push(C.getX(i),C.getY(i),C.getZ(i));b.u.push(0,0);}
  for(let i=0;i<ix.count;i++)b.i.push(k+ix.getX(i));}
// the firing hand round a pistol grip (origin at the grip's centre, palm on the right); m=-1 mirrors it for a support hand
function gripHand(m){const b=new GB(),bx=(x,y,z,w,h,d,c,rx,ry,rz)=>b.add(GEO.box,x*m,y,z,rx||0,(ry||0)*m,(rz||0)*m,w,h,d,c);
  bx(.034,-.04,.004,.026,.085,.066,GLV);bx(.0,-.004,-.036,.072,.03,.025,GLV2);bx(-.002,-.04,-.034,.07,.03,.024,GLV);bx(-.037,-.045,-.015,.02,.064,.044,GLV2); // palm, two rows of fingers, finger tips
  bx(-.012,.03,.012,.056,.02,.022,GLV,0,0,-.2);b.add(GEO.j6,.045*m,-.015,.042,0,0,0,.028,.032,.034,GLV);b.add(GEO.tube8,.047*m,-.045,.05,-1.15,0,-.2*m,.034,.05,.034,shade(TAN,.8)); // thumb, wrist, cuff
  b.add(GEO.fore,.047*m,-.02,.046,-1.15,0,-.22*m,.04,.34,.04,TAN);return b.build();}
// the support hand under a handguard (origin on the guard's underside, palm up, fingers curled round the left side)
const handL=(()=>{const b=new GB(),bx=(x,y,z,w,h,d,c,rx,ry,rz)=>b.add(GEO.box,x,y,z,rx||0,ry||0,rz||0,w,h,d,c);
  bx(0,-.062,0,.066,.024,.072,GLV);bx(-.042,-.04,-.004,.024,.07,.07,GLV2);bx(-.03,.012,.0,.046,.018,.064,GLV);bx(.036,-.045,.008,.02,.05,.026,GLV2);  // palm, fingers, finger tips over the top, thumb
  b.add(GEO.j6,-.012,-.075,.04,0,0,0,.03,.03,.034,GLV);b.add(GEO.tube8,-.014,-.1,.046,-1.05,0,.35,.036,.05,.036,shade(TAN,.8));b.add(GEO.fore,-.015,-.07,.045,-1.05,0,.35,.042,.36,.042,TAN);return b.build();})(),
  handR=gripHand(1),handRm=gripHand(-1);
const gunMat=new T.MeshPhongMaterial({vertexColors:true,shininess:34,specular:0x3a3a3a});
// o: hl support hand [x,y,z,rx,ry,rz]; grab: where the support hand takes hold of the magazine; rl: reload style ('mag', 'box', 'shell', 'pistol')
function vmMake(id,body,mag,o){const g=new T.Group();g.add(new T.Mesh(body.build(),gunMat));const mm=new T.Mesh(mag.build(),gunMat);g.add(mm);
  const hl=new T.Mesh(o.rl==='pistol'?handRm:handL,gunMat);hl.position.set(o.hl[0],o.hl[1],o.hl[2]);hl.rotation.set(o.hl[3]||0,o.hl[4]||0,o.hl[5]||0);g.add(hl);
  g.userData={mag:mm,hl,o};g.visible=false;gunRoot.add(g);VM[id]=g;}
{let b,m;
 b=new GB();m=new GB(); // M4 carbine: receiver with a flat-top rail, collapsible stock, railed handguard, flip-up sights
 b.add(gprof([[-.2,.03],[-.16,.03],[-.16,.05],[.17,.05],[.17,-.04],[.12,-.045],[.12,-.07],[.05,-.07],[.05,-.045],[-.16,-.045],[-.2,-.03]],.05),0,0,0,0,0,0,1,1,1,GK);
 b.add(gprof([[-.2,.015],[-.42,.02],[-.42,-.04],[-.36,-.09],[-.42,-.1],[-.3,-.1],[-.2,-.03]],.04),0,0,0,0,0,0,1,1,1,GK2);fwd(b,.016,.22,.2,-.005,GK2);                 // stock and buffer tube
 b.add(gprof([[-.1,-.04],[-.05,-.04],[-.085,-.15],[-.135,-.15]],.036),0,0,0,0,0,0,1,1,1,GK2);b.add(GEO.box,0,-.055,.0,0,0,0,.014,.012,.07,GK);                       // grip, trigger guard
 fwd(b,.029,.26,-.17,.002,GK2);for(const y of[.034,-.03])b.add(GEO.box,0,y,-.3,0,0,0,.034,.008,.22,GK);for(const x of[-.032,.032])b.add(GEO.box,x,-.002,-.3,0,0,0,.008,.034,.22,GK); // handguard with four rails
 fwd(b,.011,.2,-.42,.002);fwd(b,.016,.05,-.6,.002,GK2);b.add(GEO.box,0,.02,-.43,0,0,0,.03,.04,.03,GK);b.add(GEO.box,0,.055,-.43,0,0,0,.006,.03,.008,GK);ring(b,.02,.012,-.425,.085,GK2); // barrel, flash hider, front sight post in its hood
 for(let z=-.14;z<.16;z+=.04)b.add(GEO.box,0,.05,z,0,0,0,.034,.008,.02,GK2);b.add(GEO.box,0,.052,.11,0,0,0,.034,.014,.04,GK);ring(b,.018,.012,.11,.085,GK2); // top rail, rear sight base and aperture
 b.add(GEO.box,.026,-.01,.02,0,0,0,.012,.03,.016,GK);b.add(GEO.box,-.028,.0,.12,0,0,0,.01,.014,.05,GK2);gbAddC(b,handR,0,-.095,.095,-.3);              // mag release, charging handle, hand
 m.add(gprof([[.055,-.06],[.115,-.06],[.1,-.25],[.03,-.235]],.026),0,0,0,0,0,0,1,1,1,GK2);m.add(GEO.box,0,-.258,-.068,0,0,0,.03,.01,.072,GK);
 vmMake('m4',b,m,{hl:[0,-.038,-.3],grab:[0,-.255,-.068],rl:'mag'});
 b=new GB();m=new GB(); // AK-47: stamped receiver, wooden furniture, curved magazine
 b.add(gprof([[-.16,.035],[.18,.035],[.18,-.035],[.1,-.04],[-.16,-.04]],.05),0,0,0,0,0,0,1,1,1,GK);b.add(gprof([[-.4,.02],[-.16,.03],[-.16,-.04],[-.3,-.085],[-.4,-.1]],.042),0,0,0,0,0,0,1,1,1,WOOD);
 b.add(GEO.box,0,-.1,.4,0,0,0,.046,.12,.012,GK);b.add(gprof([[-.11,-.035],[-.06,-.035],[-.095,-.14],[-.145,-.14]],.036),0,0,0,0,0,0,1,1,1,WOOD);b.add(GEO.box,0,-.05,.0,0,0,0,.014,.012,.07,GK); // butt plate, grip, trigger guard
 fwd(b,.03,.2,-.18,-.006,WOOD);b.add(GEO.box,0,.02,-.28,0,0,0,.04,.028,.16,WOOD);fwd(b,.011,.3,-.38,.0);fwd(b,.009,.2,-.2,.035,GK2);fwd(b,.015,.05,-.63,.0,GK2);           // handguards, barrel, gas tube, muzzle brake
 b.add(GEO.box,0,.035,-.4,0,0,0,.03,.03,.03,GK);b.add(GEO.box,0,.0,-.6,0,0,0,.012,.08,.012,GK);ring(b,.018,.012,-.595,.08,GK2);                                           // gas block, front sight post and hood
 b.add(GEO.box,0,.035,.0,0,0,0,.03,.016,.05,GK);for(const x of[-.011,.011])b.add(GEO.box,x,.045,.0,0,0,0,.007,.035,.01,GK);b.add(GEO.box,0,.075,.0,0,0,0,.028,.005,.01,GK); // rear sight
 b.add(GEO.box,.027,.0,.06,0,0,0,.012,.014,.04,GK2);b.add(GEO.box,0,.04,.02,0,0,0,.044,.016,.3,GK2);gbAddC(b,handR,0,-.088,.1,-.3);                                 // charging handle, dust cover, hand
 m.add(gprof([[.03,-.035],[.1,-.035],[.14,-.14],[.2,-.23],[.14,-.26],[.07,-.16]],.03),0,0,0,0,0,0,1,1,1,GK2);m.add(gprof([[.1,-.04],[.14,-.14],[.17,-.2],[.13,-.2],[.1,-.11]],.032),0,0,0,0,0,0,1,1,1,GK);
 vmMake('ak',b,m,{hl:[0,-.038,-.28],grab:[0,-.245,-.17],rl:'mag'});
 b=new GB();m=new GB(); // MP5: tubular receiver, sliding stock, ringed front sight
 b.add(gprof([[-.14,.04],[.16,.04],[.16,-.035],[.08,-.04],[-.14,-.04]],.05),0,0,0,0,0,0,1,1,1,GK);b.add(gprof([[-.1,-.035],[-.05,-.035],[-.085,-.14],[-.135,-.14]],.036),0,0,0,0,0,0,1,1,1,GK2);
 b.add(GEO.box,0,-.05,.0,0,0,0,.014,.012,.07,GK);fwd(b,.026,.13,-.16,.0,GK2);fwd(b,.011,.08,-.29,.0);b.add(GEO.box,0,-.01,.14,0,0,0,.028,.028,.22,GK2);b.add(GEO.box,0,-.07,.34,0,0,0,.03,.1,.03,GK2); // trigger guard, handguard, barrel, stock
 for(const x of[-.012,.012])b.add(GEO.box,x,.0,.24,0,0,0,.006,.006,.2,GK2);ring(b,.02,.014,-.26,.08,GK2);b.add(GEO.box,0,.03,-.27,0,0,0,.006,.05,.006,GK);              // stock rails, front sight ring and post
 b.add(GEO.box,0,.04,.06,0,0,0,.03,.016,.04,GK);ring(b,.017,.012,.06,.08,GK2);b.add(GEO.box,.028,.01,-.04,0,0,0,.012,.012,.03,GK2);gbAddC(b,handR,0,-.088,.095,-.3);       // rear sight drum, charging handle, hand
 m.add(gprof([[.02,-.035],[.07,-.035],[.1,-.2],[.05,-.21]],.026),0,0,0,0,0,0,1,1,1,GK2);m.add(GEO.box,0,-.218,-.075,0,0,0,.03,.01,.05,GK);
 vmMake('smg',b,m,{hl:[0,-.028,-.22],grab:[0,-.215,-.075],rl:'mag'});
 b=new GB();m=new GB(); // M9 pistol: slide with a cut-out, frame, both hands
 b.add(gprof([[-.05,.045],[.2,.045],[.2,.005],[.05,.0],[-.05,.0]],.034),0,0,0,0,0,0,1,1,1,GK);b.add(gprof([[-.03,.0],[.2,.0],[.2,-.02],[.03,-.02],[.0,-.04],[-.045,-.04]],.032),0,0,0,0,0,0,1,1,1,GK2);
 b.add(gprof([[-.045,-.04],[.02,-.04],[-.005,-.125],[-.07,-.12]],.03),0,0,0,0,0,0,1,1,1,GK2);b.add(GEO.box,0,-.035,-.03,0,0,0,.012,.01,.05,GK);b.add(GEO.box,0,-.03,-.015,0,0,0,.005,.016,.006,GK); // grip, trigger guard, trigger
 b.add(GEO.box,.0,.032,.06,0,0,0,.028,.012,.07,GK2);fwd(b,.009,.02,-.19,.024,GK2);b.add(GEO.box,-.015,.012,.16,0,0,0,.006,.02,.02,GK);                                  // ejection port, muzzle, hammer
 for(const x of[-.009,.009])b.add(GEO.box,x,.045,.03,0,0,0,.006,.017,.01,GK);b.add(GEO.box,0,.045,-.19,0,0,0,.006,.017,.008,GK);gbAddC(b,handR,0,-.075,.02,-.28);  // sights, hand
 m.add(GEO.box,0,-.135,-.02,-.28,0,0,.026,.012,.05,GK);
 vmMake('pistol',b,m,{hl:[-.012,-.085,.0,-.28,0,.15],grab:[0,-.135,-.02],rl:'pistol'});
 b=new GB();m=new GB(); // M870 shotgun: receiver, wooden stock, ribbed pump on the magazine tube
 b.add(gprof([[-.15,.04],[.16,.04],[.16,-.04],[-.15,-.04]],.055),0,0,0,0,0,0,1,1,1,GK);b.add(gprof([[-.42,.01],[-.15,.035],[-.15,-.04],[-.2,-.05],[-.32,-.09],[-.42,-.1]],.045),0,0,0,0,0,0,1,1,1,WOOD);
 b.add(GEO.box,0,-.1,.42,0,0,0,.05,.11,.012,GK);b.add(GEO.box,0,-.055,.02,0,0,0,.014,.012,.07,GK);b.add(GEO.box,0,-.05,.06,0,0,0,.03,.012,.04,GK2);                 // butt plate, trigger guard, loading port
 fwd(b,.017,.52,-.16,.018);fwd(b,.016,.36,-.16,-.022,GK2);ring(b,.02,.02,-.16,.018,GK2);b.add(GEO.box,0,.058,-.66,0,0,0,.008,.016,.008,0xd8c070);b.add(GEO.box,0,.04,.0,0,0,0,.03,.01,.14,GK2); // barrel, tube, bead, receiver rib
 b.add(GEO.box,.03,.0,.08,0,0,0,.01,.014,.03,GK2);gbAddC(b,handR,0,-.05,.2,-.9);                                                                                      // ejection port, hand on the stock wrist
 m.add(GEO.cyl8,0,-.024,-.24,-PI/2,0,0,.03,.18,.03,WOOD);for(const z of[-.28,-.34,-.4])m.add(GEO.box,0,-.055,z,0,0,0,.062,.012,.016,shade(WOOD,.7));
 vmMake('shotgun',b,m,{hl:[0,-.054,-.33],grab:[0,-.06,.06],rl:'shell'});
 b=new GB();m=new GB(); // M14 DMR: full wooden stock, scope on rings
 b.add(gprof([[-.48,.0],[-.2,.03],[.3,.03],[.3,-.03],[.05,-.045],[-.1,-.045],[-.16,-.03],[-.3,-.1],[-.48,-.1]],.052),0,-.01,0,0,0,0,1,1,1,WOOD);
 b.add(GEO.box,0,.02,.03,0,0,0,.046,.025,.3,GK);b.add(GEO.box,0,-.11,.48,0,0,0,.052,.11,.012,GK);b.add(GEO.box,0,-.065,.0,0,0,0,.014,.012,.07,GK);                   // receiver top, butt plate, trigger guard
 fwd(b,.012,.46,-.28,.012);fwd(b,.016,.05,-.74,.012,GK2);b.add(GEO.box,0,.025,-.7,0,0,0,.01,.045,.01,GK);ring(b,.016,.01,-.695,.07);                                   // barrel, flash hider, front sight and hood
 fwd(b,.021,.3,.13,.082,GK,GEO.cyl12);fwd(b,.03,.07,-.17,.082,GK,GEO.cyl12);fwd(b,.027,.05,.18,.082,GK,GEO.cyl12);b.add(GEO.box,0,.04,.05,0,0,0,.02,.035,.03,GK);b.add(GEO.box,0,.04,-.1,0,0,0,.02,.035,.03,GK); // scope, bells, rings
 for(const z of[.05,-.1])b.add(GEO.tube8,0,.082,z,-PI/2,0,0,.025,.012,.025,GK2);b.add(GEO.box,.03,.0,.0,0,0,0,.012,.014,.04,GK2);gbAddC(b,handR,0,-.05,.14,-.95);  // ring clamps, bolt handle, hand on the stock wrist
 m.add(gprof([[.0,-.045],[.07,-.045],[.06,-.17],[-.01,-.17]],.03),0,0,0,0,0,0,1,1,1,GK2);m.add(GEO.box,0,-.178,-.025,0,0,0,.034,.01,.065,GK);
 vmMake('dmr',b,m,{hl:[0,-.05,-.27],grab:[0,-.175,-.025],rl:'mag'});
 b=new GB();m=new GB(); // M249 SAW: feed cover, carry handle, bipod, box magazine
 b.add(gprof([[-.18,.05],[.2,.05],[.2,-.04],[-.18,-.05]],.07),0,0,0,0,0,0,1,1,1,GK);b.add(gprof([[-.42,.03],[-.18,.04],[-.18,-.05],[-.3,-.06],[-.42,-.1]],.05),0,0,0,0,0,0,1,1,1,GK);
 b.add(gprof([[-.12,-.045],[-.07,-.045],[-.1,-.15],[-.15,-.15]],.036),0,0,0,0,0,0,1,1,1,GK2);b.add(GEO.box,0,-.055,-.02,0,0,0,.014,.012,.07,GK);b.add(GEO.box,0,.05,-.05,0,0,0,.064,.025,.26,GK2); // grip, trigger guard, feed cover
 b.add(GEO.box,0,.075,.02,0,0,0,.012,.03,.1,GK);b.add(GEO.box,0,.1,.02,0,0,0,.02,.012,.14,GK);fwd(b,.034,.2,-.2,.0,GK2);fwd(b,.014,.36,-.3,.006);fwd(b,.02,.05,-.62,.006,GK2); // carry handle, handguard, barrel, flash hider
 b.add(GEO.box,0,.04,-.5,0,0,0,.03,.03,.03,GK);b.add(GEO.box,0,.062,-.5,0,0,0,.006,.038,.008,GK);ring(b,.02,.012,-.495,.1,GK2);                                          // gas block, front sight and hood
 b.add(GEO.box,0,.075,.1,0,0,0,.03,.012,.04,GK);for(const x of[-.012,.012])b.add(GEO.box,x,.08,.1,0,0,0,.007,.03,.01,GK);b.add(GEO.box,0,.105,.1,0,0,0,.028,.005,.01,GK); // rear sight
 for(const s of[-1,1])b.add(GEO.rod,s*.02,-.03,-.5,2.5,0,s*.3,.008,.26,.008,GK2);b.add(GEO.box,.04,-.01,.06,0,0,0,.014,.016,.05,GK2);gbAddC(b,handR,0,-.1,.11,-.3);   // bipod, cocking handle, hand
 m.add(GEO.box,-.02,-.19,-.04,0,0,0,.12,.13,.14,0x4c5a3a);m.add(GEO.box,-.02,-.06,-.04,0,0,0,.08,.02,.1,0x3a4530);
 vmMake('lmg',b,m,{hl:[0,-.036,-.3],grab:[-.02,-.19,-.04],rl:'box'});}
// muzzle flash: a spiky star that spins and changes size with every shot, plus a short-lived light (lightAt) and a wisp of smoke
const flashTex=tex(64,64,(g,w,h)=>{g.translate(32,32);const gr=g.createRadialGradient(0,0,1,0,0,30);gr.addColorStop(0,'rgba(255,255,255,1)');gr.addColorStop(.25,'rgba(255,230,170,.85)');gr.addColorStop(1,'rgba(255,180,60,0)');
  g.fillStyle=gr;g.beginPath();for(let k=0;k<16;k++){const a=k/16*TAU,r=k%2?9:(k%4?22:31);g.lineTo(Math.cos(a)*r,Math.sin(a)*r);}g.closePath();g.fill();
  g.fillStyle='rgba(255,255,255,.95)';g.beginPath();g.arc(0,0,6,0,TAU);g.fill();});
const flash=new T.Sprite(new T.SpriteMaterial({map:flashTex,color:0xffd27a,transparent:true,depthWrite:false,blending:T.AdditiveBlending}));flash.scale.set(.3,.3,1);flash.visible=false;gunRoot.add(flash);

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
