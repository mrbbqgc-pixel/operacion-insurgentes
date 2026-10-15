// =====================================================================
// 05 SOLDIERS: rounded articulated models (merged per body part), animation, hit volumes
// =====================================================================
const KIND={
  rifle:{hp:100,spd:3.6,acc:.42,dmg:13,range:75,rof:.11,burst:[3,5],pause:[.7,1.6],snd:'ak',pref:26,label:'Rifleman',drop:'ak'},
  rush:{hp:80,spd:5.4,acc:.3,dmg:8,range:28,rof:.075,burst:[5,9],pause:[.4,.9],snd:'smg',pref:8,label:'Raider',drop:'smg'},
  heavy:{hp:330,spd:2.3,acc:.34,dmg:10,range:70,rof:.09,burst:[9,15],pause:[1.2,2.2],snd:'lmg',pref:20,label:'Heavy gunner',drop:'lmg'},
  mark:{hp:90,spd:0,acc:.8,dmg:58,range:170,rof:1,burst:[1,1],pause:[2.6,3.6],snd:'dmr',pref:90,label:'Marksman',drop:'dmr'},
  ally:{hp:260,spd:4.6,acc:.5,dmg:30,range:80,rof:.1,burst:[3,5],pause:[.5,1.2],snd:'m4',pref:20,label:'',drop:null}};
// cloth weave and camouflage blotches, multiplied over the vertex colours
const solMat=L({vertexColors:true,map:tex(64,64,(g,w,h)=>{g.fillStyle='#d8d8d8';g.fillRect(0,0,w,h);for(let k=0;k<26;k++){g.fillStyle=rnd()<.5?'rgba(255,255,255,.3)':'rgba(0,0,0,.2)';g.beginPath();g.ellipse(rnd()*w,rnd()*h,rr(3,9),rr(2,6),rnd()*3,0,7);g.fill();}
  noise(g,w,h,500,.12);},true)});
GEO.limb=new T.CylinderGeometry(1,.8,1,8,1,true);GEO.limb.translate(0,-.5,0); // tapered, hangs down from its origin
GEO.ball=new T.SphereGeometry(1,8,6);GEO.cap=new T.SphereGeometry(1,10,5,0,TAU,0,PI/2);GEO.torso=new T.CylinderGeometry(1,.8,1,10,2);GEO.torso.translate(0,.5,0);
GEO.j6=new T.SphereGeometry(1,6,4);GEO.helm=new T.SphereGeometry(1,8,4,0,TAU,0,PI/2); // cheap joints; helmet shell
const UNI={ally:[0xb7a57c,0x6f7350,0x8f8660],rifle:[0x56606f,0x2b3037,0x3c434c],rush:[0x66513c,0x2b3037,0x4a3a2c],heavy:[0x66363a,0x1f2226,0x3b2224],mark:[0x646c46,0x3a3f2a,0x4f5638]};
const partGeo={};
// body parts of one kind of soldier, in one of four variants (headgear, vest shade, sleeves, pack). Origins sit on the joints.
function parts(kind,v){v=v|0;const key=kind+v;if(partGeo[key])return partGeo[key];const ally=kind==='ally',U=UNI[kind][0],V0=UNI[kind][1],U2=UNI[kind][2],
  V=[V0,shade(V0,.82),shade(V0,1.15),mixc(V0,U2,.5)][v],skin=[0xc49a72,0xa87b58,0xd3a67e,0x8f6a4b][(v+(ally?0:2))&3],mask=0x1d1c20,boot=0x1c1a18,glove=0x2a2825,patch=ally?0x2f6fb5:0xc8362b,
  dark=0x15151a,rolled=(v&1)===1&&kind!=='heavy',shem=!ally&&v===1,covered=!ally&&v!==3,o={};
  const s=(b,geo,x,y,z,sx,sy,sz,c,rx,ry,rz)=>b.add(geo,x,y,z,rx||0,ry||0,rz||0,sx,sy,sz,c);
  let b=new GB(); // upper body, origin at the waist
  b.add(GEO.torso,0,0,0,0,0,0,.235,.54,.15,U,(x,y)=>.84+y*.3);                            // tapered trunk, a little darker towards the belt
  s(b,GEO.j6,-.255,.49,0,.1,.085,.11,U);s(b,GEO.j6,.255,.49,0,.1,.085,.11,U);              // shoulders
  s(b,GEO.tube8,0,.52,0,.058,.1,.06,covered&&!shem?mask:skin);                               // neck
  s(b,GEO.torso,0,.09,-.005,.265,.41,.18,V);for(const x of[-.12,.12])s(b,GEO.box,x,.44,0,.06,.09,.19,V); // plate carrier and its shoulder straps
  for(const x of[-.14,0,.14])s(b,GEO.box,x,.11,-.2,.1,.15,.065,U2);                        // magazine pouches
  s(b,GEO.box,.17,.3,-.18,.075,.11,.05,dark);s(b,GEO.rod,.185,.4,-.18,.006,.17,.006,0x111114); // radio and its antenna
  s(b,GEO.box,-.17,.3,-.18,.07,.06,.04,U2);s(b,GEO.box,-.275,.1,.02,.055,.15,.13,U2);s(b,GEO.box,.275,.1,.02,.055,.15,.13,U2); // admin and side pouches
  if(kind!=='rush'&&!(v&1)){s(b,GEO.box,0,.06,.23,.3,.4,.16,shade(U2,.85));s(b,GEO.cyl8,.15,.5,.23,.07,.3,.07,shade(U,.8),0,0,PI/2);} // pack with a bed roll
  else if(kind!=='rush')s(b,GEO.box,0,.2,.2,.22,.26,.09,shade(U2,.85));                     // slim hydration pack
  if(kind==='heavy'){s(b,GEO.torso,0,.02,0,.3,.5,.2,0x1f2226);s(b,GEO.j6,0,.52,0,.2,.07,.16,0x1f2226);s(b,GEO.box,0,.56,-.1,.22,.05,.06,0x1f2226);} // extra plates and a collar
  s(b,GEO.ball,0,.69,0,.105,.125,.115,covered&&!shem?mask:skin);                             // head
  if(shem){s(b,GEO.j6,0,.6,-.01,.112,.058,.122,0x8a8370);s(b,GEO.j6,0,.55,.02,.14,.05,.14,0x8a8370);} // shemagh over the mouth and round the neck
  if(ally?!(v&1):true)s(b,GEO.box,0,.675,-.1,.17,.045,.04,ally||(v&1)?dark:0x9aa3aa);         // sunglasses, or goggles on the masked ones
  if(ally&&(v&1)){s(b,GEO.box,.11,.68,0,.035,.06,.05,0x1a1a1c);s(b,GEO.rod,.09,.66,-.05,.005,.1,.005,0x1a1a1c,-PI/2,.7);} // headset with its boom
  if(kind==='rush'&&v!==2){s(b,GEO.cap,0,.71,0,.115,.1,.125,0xc8362b,0,0,.22);s(b,GEO.box,-.07,.7,.05,.06,.03,.1,0xc8362b,.5,0,.4);}   // red beret, pulled to one side
  else if(kind==='mark'||(ally&&v===3)){const c=ally?0x9c8d68:U;s(b,GEO.cyl12,0,.74,0,.24,.02,.24,c);s(b,GEO.cap,0,.74,0,.12,.1,.13,c);} // boonie hat
  else if(!ally&&v===3)s(b,GEO.cap,0,.7,0,.115,.11,.125,0x2a2a2e);                             // beanie
  else if(ally&&v===1){s(b,GEO.cap,0,.72,0,.112,.08,.12,0x9c8d68);s(b,GEO.box,0,.75,-.13,.14,.015,.09,0x9c8d68,.15);} // patrol cap
  else{const hc=ally?0x9c8d68:V;s(b,GEO.helm,0,.7,0,.14,.15,.155,hc);s(b,GEO.tube8,0,.7,0,.145,.035,.162,shade(hc,.8)); // helmet: shell and rim
    s(b,GEO.box,0,.8,-.13,.04,.045,.03,dark);                                                // NVG mount
    if(!ally&&v!==1){s(b,GEO.box,0,.83,-.17,.03,.03,.09,dark,.7);for(const x of[-.02,.02])s(b,GEO.tube6,x,.82,-.17,.013,.07,.013,dark,-.85);} // night-vision tubes, flipped up
    else s(b,GEO.box,0,.77,-.13,.15,.045,.035,0x2a2a2e);                                       // goggles pushed up on the helmet
    if(kind==='heavy')s(b,GEO.box,0,.6,-.11,.2,.14,.03,dark);}                                 // face shield
  s(b,GEO.box,-.335,.38,0,.03,.11,.12,patch);s(b,GEO.box,.335,.38,0,.03,.11,.12,patch);o.up=b.build();
  b=new GB();b.add(GEO.torso,0,-.12,0,0,0,0,.215,.22,.145,U,(x,y)=>.9+y*.25);s(b,GEO.tube8,0,.03,0,.225,.05,.155,0x2a2622); // hips and belt
  s(b,GEO.box,.2,-.14,-.03,.07,.17,.1,U2);s(b,GEO.box,-.16,-.12,.12,.12,.12,.07,U2);o.hips=b.build();                           // holster, back pouch
  b=new GB();s(b,GEO.limb,0,0,0,.065,.36,.065,U);s(b,GEO.j6,0,-.36,0,.055,.055,.055,rolled?skin:shade(U,.9));if(rolled)s(b,GEO.tube8,0,-.31,0,.068,.07,.068,shade(U,.92));o.arm=b.build();
  b=new GB();s(b,GEO.limb,0,0,0,.052,.27,.052,rolled?skin:U);s(b,GEO.j6,0,-.3,0,.045,.05,.05,glove);s(b,GEO.box,0,-.39,-.015,.045,.04,.06,glove);o.fore=b.build();
  b=new GB();s(b,GEO.limb,0,.03,0,.095,.47,.1,U);s(b,GEO.box,.085,-.2,0,.03,.14,.1,shade(U,.92));s(b,GEO.j6,0,-.45,-.02,.075,.08,.075,U);s(b,GEO.box,0,-.51,-.075,.1,.1,.03,0x2a2826);o.thigh=b.build(); // cargo pocket, knee, pad
  b=new GB();s(b,GEO.limb,0,0,0,.07,.36,.075,U);s(b,GEO.limb,0,-.28,0,.065,.15,.072,boot);s(b,GEO.j6,0,-.43,0,.06,.05,.065,boot);
  s(b,GEO.box,0,-.465,-.07,.1,.06,.13,boot);s(b,GEO.box,0,-.47,-.03,.105,.025,.2,shade(boot,.6));o.shin=b.build();                 // boot: upper, ankle, toe cap, sole
  return partGeo[key]=o;}
// third-person and pick-up weapon models; the barrel points to -z, origin at the grip
const wGeo={};
function weaponGeo(id){if(wGeo[id])return wGeo[id];const b=new GB(),k=0x1c1c1e,k2=0x303236,wd=0x6b4a2a,gn=0x4c5a3a,tube=(r,l,z,y,c,g)=>b.add(g||GEO.tube6,0,y||0,z,-PI/2,0,0,r,l,r,c||k),
    bx=(x,y,z,w,h,d,c,rx,rz)=>b.add(GEO.box,x,y,z,rx||0,0,rz||0,w,h,d,c);
  if(id==='ak'){bx(0,-.045,.03,.05,.085,.3,k);bx(0,.04,.02,.044,.022,.24,k2);bx(0,-.08,.33,.04,.09,.26,wd,-.1);bx(0,-.12,.455,.046,.1,.02,k); // receiver, dust cover, stock, butt plate
    bx(0,-.15,.1,.038,.12,.05,wd,-.3);bx(0,-.07,0,.012,.012,.09,k);bx(0,-.065,0,.006,.025,.008,k);bx(.028,-.01,.02,.012,.012,.03,k2);  // grip, trigger guard, trigger, charging handle
    bx(0,-.17,-.06,.036,.13,.07,k2,.3);bx(0,-.28,-.1,.036,.11,.065,k2,.65);bx(0,-.04,-.27,.052,.06,.19,wd);bx(0,.03,-.27,.04,.03,.17,wd); // curved magazine, handguards
    tube(.009,.2,-.3,.045,k2);tube(.012,.3,-.37,.015);tube(.015,.05,-.63,.015,k2);bx(0,.03,-.57,.012,.05,.012,k);bx(0,.06,-.03,.03,.02,.05,k);} // gas tube, barrel, brake, sights
  else if(id==='smg'){bx(0,-.045,-.02,.05,.085,.3,k);bx(0,-.02,.14,.028,.028,.2,k2);bx(0,-.07,.33,.03,.1,.025,k2);for(const x of[-.012,.012])bx(x,-.01,.24,.006,.006,.2,k2); // receiver, stock rails and butt
    bx(0,-.15,.08,.038,.11,.05,k,-.25);bx(0,-.2,-.06,.034,.17,.045,k2,.12);bx(0,-.045,-.19,.048,.07,.1,k2);                       // grip, magazine, handguard
    tube(.02,.1,-.17,0,k2);tube(.011,.08,-.27,0);tube(.016,.03,-.27,.03,k2);bx(0,.045,.0,.03,.025,.04,k);bx(0,-.07,.0,.01,.012,.07,k);} // barrel shroud, barrel, front sight ring, rear sight, trigger guard
  else if(id==='lmg'){bx(0,-.05,0,.07,.11,.42,k);bx(0,.06,-.05,.06,.03,.3,k2);bx(0,.09,.05,.015,.03,.12,k);bx(0,-.07,.33,.05,.1,.25,k,-.05);bx(0,-.16,.13,.04,.12,.05,k,-.25); // receiver, feed cover, carry handle, stock, grip
    bx(-.03,-.2,-.05,.12,.13,.14,gn);bx(0,-.03,-.3,.055,.06,.2,k2);tube(.016,.4,-.21,0);tube(.03,.2,-.21,0,k2);tube(.02,.05,-.6,0,k2);   // box magazine, handguard, barrel and its shroud, flash hider
    bx(0,.03,-.52,.012,.05,.012,k);bx(0,.075,.1,.03,.02,.04,k);for(const s of[-1,1])b.add(GEO.rod,s*.02,-.03,-.5,2.5,0,s*.3,.008,.26,.008,k2);} // sights, bipod
  else if(id==='dmr'){bx(0,-.045,.05,.055,.075,.5,wd);bx(0,-.085,.38,.05,.1,.24,wd,-.1);bx(0,-.11,.5,.055,.12,.02,k);bx(0,-.01,-.02,.05,.07,.32,k); // wooden stock and fore-end, butt plate, receiver
    bx(0,-.15,-.06,.04,.11,.065,k2,.1);tube(.013,.46,-.21,.01);tube(.016,.05,-.66,.01,k2);bx(0,.025,-.63,.01,.045,.01,k);           // magazine, barrel, flash hider, front sight
    b.add(GEO.cyl8,0,.085,.12,-PI/2,0,0,.026,.3,.026,k);tube(.034,.06,-.18,.085,k,GEO.tube8);tube(.032,.05,.2,.085,k,GEO.tube8);bx(0,.03,.02,.02,.055,.03,k);bx(0,.03,-.1,.02,.055,.03,k);} // scope, bells, mounts
  else if(id==='shotgun'){bx(0,-.04,.02,.05,.08,.28,k);bx(0,-.085,.3,.045,.1,.28,wd,-.12);bx(0,-.12,.44,.05,.11,.02,k);bx(0,-.07,.02,.01,.012,.07,k); // receiver, stock, butt plate, trigger guard
    tube(.017,.5,-.12,.012);tube(.016,.34,-.14,-.03,k2);bx(0,-.07,-.34,.055,.055,.17,wd);for(const z of[-.3,-.38])bx(0,-.045,z,.058,.01,.012,k); // barrel, magazine tube, pump and its ribs
    bx(0,.03,-.6,.008,.015,.008,0xd8c070);bx(0,.04,.08,.04,.012,.1,k2);}                                                           // bead, receiver top
  else if(id==='pistol'){bx(0,.005,-.07,.032,.045,.19,k);bx(0,-.03,-.04,.03,.035,.12,k2);bx(0,-.12,0,.03,.11,.048,k2,.22);bx(0,-.03,.0,.008,.01,.04,k);tube(.007,.02,-.16,.02,k2);} // slide, frame, grip, trigger guard, muzzle
  else{bx(0,-.045,.01,.05,.085,.3,k);bx(0,.04,-.02,.04,.02,.26,k2);b.add(GEO.cyl8,0,-.02,.3,-PI/2,0,0,.02,.22,.02,k);bx(0,-.055,.36,.04,.1,.12,k);bx(0,-.06,.42,.045,.11,.02,k2); // receiver, rail, buffer tube, stock, butt
    bx(0,-.15,.1,.036,.12,.05,k,-.3);bx(0,-.07,0,.012,.012,.09,k);bx(0,-.22,-.05,.034,.17,.06,k2,.12);bx(0,-.04,-.27,.05,.07,.2,k2);for(const y of[.03,-.07])bx(0,y,-.27,.055,.008,.18,k); // grip, trigger guard, magazine, handguard with rails
    tube(.011,.2,-.39,-.005);tube(.014,.05,-.6,-.005,k2);bx(0,.03,-.56,.012,.05,.012,k);bx(0,.06,-.37,.02,.012,.04,k);bx(0,.06,.08,.03,.03,.06,k);bx(0,.09,.08,.012,.012,.08,k);} // barrel, flash hider, front sight, gas block, carry handle
  return wGeo[id]=b.build();}
const KW={rifle:'ak',rush:'smg',heavy:'lmg',mark:'dmr',ally:'m4'};
const footShade=new T.MeshBasicMaterial({transparent:true,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-4,polygonOffsetUnits:-4,map:M.shade.map}),
  footGeo=(()=>{const g=new T.PlaneGeometry(1.5,1.5);g.rotateX(-PI/2);const u=g.attributes.uv;for(let i=0;i<u.count;i++)u.setX(i,.02+u.getX(i)*.46);return g;})();
// One skinned mesh per soldier: every body part is rigidly bound to its joint, so a whole soldier is a single draw call.
const skinMat=L({vertexColors:true,map:solMat.map,skinning:true}),rigCache={};
const JOINT=[[0,0,0],[0,1,0],[-.3,.47,0],[0,-.36,0],[.3,.47,0],[0,-.36,0],[.12,.36,-.42],[-.12,.9,0],[0,-.46,0],[.12,.9,0],[0,-.46,0]],PARENT=[-1,0,1,2,1,4,1,0,7,0,9];
// bones: 0 body, 1 upper body, 2/3 left arm and forearm, 4/5 right, 6 weapon, 7/8 left thigh and shin, 9/10 right
function rigGeo(kind,wid,v){wid=wid||KW[kind];v=v|0;const key=kind+'/'+wid+'/'+v;if(rigCache[key])return rigCache[key];const G0=parts(kind,v),W=[];for(let k=0;k<11;k++){const p=JOINT[k].slice(),q=PARENT[k];if(q>=0){p[0]+=W[q][0];p[1]+=W[q][1];p[2]+=W[q][2];}W.push(p);}
  const list=[[G0.hips,0,[0,.98,0]],[G0.up,1],[G0.arm,2],[G0.fore,3],[G0.arm,4],[G0.fore,5],[weaponGeo(wid),6],[G0.thigh,7],[G0.shin,8],[G0.thigh,9],[G0.shin,10]];
  const p=[],n=[],c=[],u=[],si=[],sw=[],ix=[];
  for(const it of list){const g=it[0],b=it[1],o=it[2]||W[b],P=g.attributes.position,N=g.attributes.normal,Cc=g.attributes.color,U=g.attributes.uv,k=p.length/3;
    for(let i=0;i<P.count;i++){p.push(P.getX(i)+o[0],P.getY(i)+o[1],P.getZ(i)+o[2]);n.push(N.getX(i),N.getY(i),N.getZ(i));c.push(Cc.getX(i),Cc.getY(i),Cc.getZ(i));u.push(U.getX(i),U.getY(i));si.push(b,0,0,0);sw.push(1,0,0,0);}
    for(let i=0;i<g.index.count;i++)ix.push(k+g.index.getX(i));}
  const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(p,3));g.setAttribute('normal',new T.Float32BufferAttribute(n,3));g.setAttribute('color',new T.Float32BufferAttribute(c,3));
  g.setAttribute('uv',new T.Float32BufferAttribute(u,2));g.setAttribute('skinIndex',new T.Uint16BufferAttribute(si,4));g.setAttribute('skinWeight',new T.Float32BufferAttribute(sw,4));g.setIndex(ix);
  g.boundingSphere=new T.Sphere(new T.Vector3(0,1,0),2.2);return rigCache[key]=g;}
function buildSoldier(kind,wid,v){const g=new T.Group();g.rotation.order='YXZ';const B=[];
  for(let k=0;k<11;k++){const b=new T.Bone();b.position.set(JOINT[k][0],JOINT[k][1],JOINT[k][2]);B.push(b);if(PARENT[k]>=0)B[PARENT[k]].add(b);}
  g.add(B[0]);g.updateMatrixWorld(true);const mesh=new T.SkinnedMesh(rigGeo(kind,wid,v),skinMat);mesh.castShadow=true;g.add(mesh);mesh.bind(new T.Skeleton(B));
  const sh=new T.Mesh(footGeo,footShade);sh.position.y=.03;sh.renderOrder=2;g.add(sh);
  if(kind==='heavy')g.scale.setScalar(1.14);
  return{g,mesh,body:B[0],up:B[1],aL:B[2],fL:B[3],aR:B[4],fR:B[5],wp:B[6],lL:B[7],kL:B[8],lR:B[9],kR:B[10]};}
const allyMark=tex(32,32,(g,w,h)=>{g.fillStyle='#8ec1e6';g.strokeStyle='#15110c';g.lineWidth=3;g.beginPath();g.moveTo(16,27);g.lineTo(4,8);g.lineTo(28,8);g.closePath();g.fill();g.stroke();});
const foes=[],allies=[],corpses=[];let nidSeq=0;
function addSoldier(team,kind,x,z,o){o=o||{};const v=o.v===undefined?(nidSeq+1)&3:o.v&3,m=buildSoldier(kind,o.wid,v),K=KIND[kind];
  const s={team,kind,K,x,z,y0:o.y0||0,yaw:o.yaw===undefined?R()*TAU:o.yaw,hp:K.hp,maxHp:K.hp,alive:true,sc:kind==='heavy'?1.14:1,v,
    crouch:0,wantCrouch:false,ph:R()*6,moveAmt:0,mx:0,mz:0,run:false,aimP:0,lowered:!o.aware,
    aware:!!o.aware,spot:0,target:null,seeT:99,lkx:x,lkz:z,cover:null,coverT:0,phase:'hide',phaseT:R2(.3,1.2),pushT:R2(6,12),
    burst:0,burstT:0,shootT:R2(.4,1.2),reactT:0,flinch:0,stuckT:0,lastX:x,lastZ:z,strafe:R()<.5?-1:1,strafeT:R2(1,3),percT:R()*.25,
    post:o.post||{x,z},post2:o.post2||null,patrolT:R2(1,5),goingBack:false,isStatic:!!o.isStatic,aimT:0,nadeT:R2(8,16),revealT:0,
    name:o.name||'',downT:0,deadT:0,fall:1,goal:null,goalT:0,searchT:0,stepD:0,tag:o.tag||'',nid:++nidSeq,
    g:m.g,mesh:m.mesh,body:m.body,up:m.up,aL:m.aL,aR:m.aR,fL:m.fL,fR:m.fR,wp:m.wp,lL:m.lL,lR:m.lR,kL:m.kL,kR:m.kR,mark:null};
  s.g.position.set(x,s.y0,z);s.g.rotation.y=s.yaw;
  if(team===0){const sp=new T.Sprite(new T.SpriteMaterial({map:allyMark,depthTest:false,transparent:true,sizeAttenuation:false}));sp.scale.set(.028,.028,1);sp.position.y=2.25;sp.renderOrder=50;s.g.add(sp);s.mark=sp;}
  scene.add(s.g);(o.list||(team?foes:allies)).push(s);return s;}
// another weapon in the hands of a soldier that already exists (the stand-ins for other players swap weapons)
function setSoldierWeapon(s,wid){s.mesh.geometry=rigGeo(s.kind,wid,s.v);}
function removeSoldier(s){scene.remove(s.g);}
const ease=k=>k<0?0:k>1?1:k*k*(3-2*k);
// pose and limb animation; a dead soldier falls (three ways) and then lies still
function animSoldier(s,dt){if(!s.alive&&!s.down){animDeath(s);return;}
  const c=s.crouch,m=s.moveAmt,ph=s.ph,run=s.run?1:0,sw=Math.sin(ph)*(.65+run*.3)*m,t=G.time+s.ph*7,br=Math.sin(t*1.7)*(1-m*.7),g=s.g;
  g.rotation.x=0;g.rotation.z=0;
  const low=s.lowered?1:0,L0=s.up.userData.low===undefined?low:s.up.userData.low,lw=L0+(low-L0)*Math.min(1,dt*6);s.up.userData.low=lw;
  // hips: drop into the crouch, bob with the steps, sway and twist with the stride
  s.body.position.y=-.42*c+Math.abs(Math.sin(ph))*(.03+run*.02)*m;s.body.rotation.z=Math.sin(ph)*.05*m;s.body.rotation.y=Math.sin(ph)*.1*m*(1-c);
  // positive x rotation swings a hanging limb forward (towards -z)
  s.lL.rotation.x=1.15*c+sw;s.lR.rotation.x=1.15*c-sw;s.lL.rotation.z=.04+c*.3;s.lR.rotation.z=-.04-c*.3;
  s.kL.rotation.x=-2*c-Math.max(0,Math.sin(ph+PI*.5))*(.75+run*.4)*m;s.kR.rotation.x=-2*c-Math.max(0,Math.sin(ph+PI*1.5))*(.75+run*.4)*m;
  // chest: leans into a run, counter-twists the hips, breathes, flinches when hit
  const fl=s.flinch>0?Math.min(1,s.flinch*5):0;
  s.up.rotation.x=-.1*m*(1+run*1.4)-.22*c+s.aimP*(1-lw)-fl*.18+br*.012;s.up.rotation.y=-Math.sin(ph)*.12*m*(1-c)+fl*.12*(s.nid&1?1:-1);
  // arms: the weapon is shouldered when the soldier is ready and carried across the chest when it is lowered
  const swA=Math.sin(ph)*.18*m*lw;
  s.aR.rotation.set(.78+lw*.1+swA+br*.015,-.1*lw,-.08-lw*.15);s.fR.rotation.x=1.22-lw*.25;s.aL.rotation.set(1.22-lw*.45-swA,.1*lw,.48-lw*.15);s.fL.rotation.x=.32+lw*.5;
  s.wp.rotation.set(-lw*.5,lw*.42,lw*.15);s.wp.position.set(.12-lw*.06,.36-lw*.08+br*.004,-.42+lw*.08);}
// the fall: a hit from the front throws the soldier onto his back, one from behind drops him forward onto his knees or
// sideways; the pose is a function of the time since the hit, so it settles and never twitches
function animDeath(s){const e=ease(s.deadT/.5),e2=ease((s.deadT-.22)/.5),k=s.fall>0?0:(s.nid&1)?1:2,g=s.g,side=(s.nid&2)?1:-1;
  s.body.rotation.set(0,0,0);s.up.rotation.y=0;s.up.rotation.z=0;s.wp.rotation.set(0,0,0);
  if(k===0){g.rotation.x=1.52*e;g.rotation.z=0;g.position.y=s.y0+e*.14;s.body.position.y=0;                       // backwards, arms thrown out, one knee up
    s.up.rotation.x=.25*e-.1*e2;s.aL.rotation.set(1.5*e,0,-1.3*e);s.aR.rotation.set(1.2*e,0,1.1*e);s.fL.rotation.x=.4*e;s.fR.rotation.x=.9*e;
    s.lL.rotation.set(.35*e,0,.1*e);s.lR.rotation.set(.9*e,0,-.2*e);s.kL.rotation.x=-.3*e;s.kR.rotation.x=-1.4*e;}
  else if(k===1){const kn=ease(s.deadT/.3);g.rotation.z=0;g.rotation.x=-1.48*e2;g.position.y=s.y0+e2*.1-kn*.42*(1-e2*.6);s.body.position.y=0; // onto the knees, then face down
    s.lL.rotation.set(1.5*kn-1.4*e2,0,.08);s.lR.rotation.set(1.5*kn-1.3*e2,0,-.08);s.kL.rotation.x=-2.4*kn+2*e2;s.kR.rotation.x=-2.4*kn+2.1*e2;
    s.up.rotation.x=.5*kn-.2*e2;s.aL.rotation.set(.6+1.2*e2,0,-.4-.5*e2);s.aR.rotation.set(.4+1.6*e2,0,.5+.4*e2);s.fL.rotation.x=.6;s.fR.rotation.x=.3;}
  else{g.rotation.x=.2*e;g.rotation.z=side*1.5*e;g.position.y=s.y0+e*.12;s.body.position.y=0;                            // crumples sideways
    s.up.rotation.x=.35*e;s.aL.rotation.set(.9*e,0,side>0?-1.4*e:-.2*e);s.aR.rotation.set(.7*e,0,side>0?.2*e:1.4*e);s.fL.rotation.x=.8*e;s.fR.rotation.x=.9*e;
    s.lL.rotation.set(.9*e,0,.15*e);s.lR.rotation.set(.3*e,0,-.1*e);s.kL.rotation.x=-1.2*e;s.kR.rotation.x=-.5*e;}}
// ray against soldiers: head sphere, torso and leg cylinders. Result in RS.
const RS={s:null,t:0,zone:1};
function raySoldiers(list,ox,oy,oz,dx,dy,dz,maxT){let bt=maxT;RS.s=null;const a=dx*dx+dz*dz;
  for(let k=0;k<list.length;k++){const s=list[k];if(!s.alive)continue;const cx=ox-s.x,cz=oz-s.z,sc=s.sc,low=s.crouch*.45*sc;
    let cy=oy-(s.y0+1.67*sc-low),b=cx*dx+cy*dy+cz*dz,c=cx*cx+cy*cy+cz*cz-.046*sc*sc,disc=b*b-c;
    if(disc>0){const t=-b-Math.sqrt(disc);if(t>0&&t<bt){bt=t;RS.s=s;RS.zone=0;}}
    if(a>1e-9){b=cx*dx+cz*dz;c=cx*cx+cz*cz-.12*sc*sc;disc=b*b-a*c;
      if(disc>0){const t=(-b-Math.sqrt(disc))/a;if(t>0&&t<bt){const y=oy+dy*t-s.y0;if(y>0&&y<1.56*sc-low){bt=t;RS.s=s;RS.zone=y>(.9-s.crouch*.45)*sc?1:2;}}}}}
  RS.t=bt;return RS.s;}
const eyeY=s=>s.y0+(1.6-s.crouch*.5)*s.sc,chestY=s=>s.y0+(1.25-s.crouch*.42)*s.sc;
