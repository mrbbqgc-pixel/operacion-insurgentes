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
const UNI={ally:[0xb7a57c,0x6f7350,0x8f8660],rifle:[0x56606f,0x2b3037,0x3c434c],rush:[0x66513c,0x2b3037,0x4a3a2c],heavy:[0x66363a,0x1f2226,0x3b2224],mark:[0x646c46,0x3a3f2a,0x4f5638]};
const partGeo={};
// body parts of one kind of soldier. Origins sit on the joints.
function parts(kind){if(partGeo[kind])return partGeo[kind];const ally=kind==='ally',U=UNI[kind][0],V=UNI[kind][1],U2=UNI[kind][2],skin=ally?0xc49a72:0x1d1c20,boot=0x1c1a18,glove=0x24231f,patch=ally?0x2f6fb5:0xc8362b,o={};
  let b=new GB(); // upper body, origin at the waist
  b.add(GEO.torso,0,0,0,0,0,0,.25,.54,.15,U);b.add(GEO.ball,-.25,.47,0,0,0,0,.1,.09,.11,U);b.add(GEO.ball,.25,.47,0,0,0,0,.1,.09,.11,U);
  b.add(GEO.torso,0,.08,-.005,0,0,0,.265,.4,.175,V);                                   // plate carrier
  for(const x of [-.14,0,.14])b.add(GEO.box,x,.1,-.19,0,0,0,.1,.14,.06,U2);b.add(GEO.box,.17,.3,-.17,0,0,0,.08,.1,.05,0x15151a); // magazine pouches, radio
  if(kind!=='rush')b.add(GEO.ball,0,.3,.2,0,0,0,.19,.22,.1,V);                        // pack
  if(kind==='heavy'){b.add(GEO.torso,0,.02,0,0,0,0,.3,.5,.2,0x1f2226);b.add(GEO.ball,0,.52,0,0,0,0,.2,.08,.16,0x1f2226);}
  b.add(GEO.cyl8,0,.52,0,0,0,0,.06,.1,.065,skin);b.add(GEO.ball,0,.69,0,0,0,0,.105,.125,.115,skin);
  b.add(GEO.box,0,.66,-.1,0,0,0,.17,.05,.04,ally?0x15151a:0x9aa3aa);                   // goggles or visor
  if(kind==='rush'){b.add(GEO.cap,0,.71,0,0,0,0,.115,.1,.125,0xc8362b);b.add(GEO.box,0,.7,.1,.5,0,0,.07,.03,.14,0xc8362b);}
  else if(kind==='mark'){b.add(GEO.cyl12,0,.74,0,0,0,0,.24,.02,.24,U);b.add(GEO.cap,0,.74,0,0,0,0,.12,.1,.13,U);}
  else{b.add(GEO.cap,0,.69,0,0,0,0,.135,.14,.15,ally?0x9c8d68:V);b.add(GEO.cyl8,0,.68,0,0,0,0,.14,.03,.155,ally?0x8c7d5a:shade(V,.8));if(kind==='heavy')b.add(GEO.box,0,.6,-.11,0,0,0,.2,.14,.03,0x15151a);}
  b.add(GEO.box,-.335,.38,0,0,0,0,.03,.11,.12,patch);b.add(GEO.box,.335,.38,0,0,0,0,.03,.11,.12,patch);o.up=b.build();
  b=new GB();b.add(GEO.torso,0,-.1,0,0,0,0,.215,.2,.145,U);b.add(GEO.torso,0,.03,0,0,0,0,.225,.05,.155,0x2a2622);b.add(GEO.box,.22,-.06,-.02,0,0,0,.07,.16,.12,U2);o.hips=b.build();
  b=new GB();b.add(GEO.limb,0,0,0,0,0,0,.065,.36,.065,U);b.add(GEO.ball,0,-.36,0,0,0,0,.055,.055,.055,U2);o.arm=b.build();
  b=new GB();b.add(GEO.limb,0,0,0,0,0,0,.052,.27,.052,U);b.add(GEO.ball,0,-.31,0,0,0,0,.048,.065,.052,glove);o.fore=b.build();
  b=new GB();b.add(GEO.limb,0,.03,0,0,0,0,.095,.47,.1,U);b.add(GEO.ball,0,-.45,-.02,0,0,0,.075,.08,.075,V);o.thigh=b.build();
  b=new GB();b.add(GEO.limb,0,0,0,0,0,0,.07,.36,.075,U);b.add(GEO.limb,0,-.3,0,0,0,0,.062,.14,.07,boot);b.add(GEO.ball,0,-.435,-.05,0,0,0,.06,.05,.125,boot);o.shin=b.build();
  return partGeo[kind]=o;}
// third-person and pick-up weapon models; the barrel points to -z, origin at the grip
const wGeo={};
function weaponGeo(id){if(wGeo[id])return wGeo[id];const b=new GB(),k=0x1c1c1e,k2=0x303236,wd=0x6b4a2a,tube=(r,l,z,y,c)=>b.add(GEO.tube6,0,y||0,z,-PI/2,0,0,r,l,r,c||k);
  if(id==='ak'){b.add(GEO.box,0,-.04,.02,0,0,0,.05,.08,.32,k);b.add(GEO.box,0,-.035,-.27,0,0,0,.052,.06,.2,wd);tube(.012,.3,-.37,.015);tube(.009,.2,-.3,.045,k2);b.add(GEO.box,0,.03,-.62,0,0,0,.012,.05,.012,k);
    b.add(GEO.box,0,-.17,-.06,.3,0,0,.036,.13,.07,k2);b.add(GEO.box,0,-.27,-.11,.65,0,0,.036,.11,.065,k2);b.add(GEO.box,0,-.13,.1,-.25,0,0,.04,.11,.05,wd);b.add(GEO.box,0,-.06,.2,-.12,0,0,.04,.085,.26,wd);}
  else if(id==='smg'){b.add(GEO.box,0,-.04,-.02,0,0,0,.05,.085,.3,k);tube(.02,.1,-.17,.0,k2);tube(.011,.08,-.27,.0);b.add(GEO.box,0,-.2,-.06,.12,0,0,.034,.17,.045,k2);b.add(GEO.box,0,-.13,.08,-.25,0,0,.04,.1,.05,k);b.add(GEO.box,0,-.01,.13,0,0,0,.03,.03,.2,k2);b.add(GEO.box,0,-.07,.32,0,0,0,.03,.1,.03,k2);}
  else if(id==='lmg'){b.add(GEO.box,0,-.05,0,0,0,0,.07,.11,.42,k);tube(.016,.4,-.21,.0);tube(.03,.2,-.21,.0,k2);b.add(GEO.box,-.02,-.2,-.05,0,0,0,.12,.13,.14,0x4c5a3a);b.add(GEO.box,0,-.14,.12,-.25,0,0,.04,.1,.05,k);
    b.add(GEO.box,0,-.07,.21,-.08,0,0,.05,.1,.25,k);b.add(GEO.box,0,.05,-.05,0,0,0,.03,.03,.1,k2);for(const s of [-1,1])b.add(GEO.rod,s*.02,-.03,-.5,2.5,0,s*.3,.008,.26,.008,k2);}
  else if(id==='dmr'){b.add(GEO.box,0,-.045,.04,0,0,0,.055,.075,.5,wd);tube(.013,.46,-.21,.01);b.add(GEO.box,0,-.15,-.06,.1,0,0,.04,.12,.065,k2);b.add(GEO.box,0,-.07,.38,-.1,0,0,.05,.095,.24,wd);
    b.add(GEO.cyl8,0,.075,.12,-PI/2,0,0,.026,.3,.026,k);b.add(GEO.cyl8,0,.075,-.17,-PI/2,0,0,.033,.05,.033,k);b.add(GEO.box,0,.025,.02,0,0,0,.02,.04,.03,k);b.add(GEO.box,0,.025,-.1,0,0,0,.02,.04,.03,k);}
  else if(id==='shotgun'){b.add(GEO.box,0,-.04,.02,0,0,0,.05,.08,.28,k);tube(.017,.5,-.12,.012);tube(.016,.34,-.14,-.03,k2);b.add(GEO.box,0,-.07,-.34,0,0,0,.055,.05,.18,wd);b.add(GEO.box,0,-.075,.28,-.12,0,0,.045,.085,.26,wd);}
  else if(id==='pistol'){b.add(GEO.box,0,.005,-.07,0,0,0,.032,.045,.19,k);b.add(GEO.box,0,-.1,-.01,.22,0,0,.03,.11,.048,k2);}
  else{b.add(GEO.box,0,-.04,.01,0,0,0,.05,.085,.3,k);b.add(GEO.cyl8,0,-.005,-.39,-PI/2,0,0,.03,.24,.03,k2);tube(.011,.2,-.39,-.005);b.add(GEO.box,0,.05,-.56,0,0,0,.012,.05,.012,k);b.add(GEO.box,0,.03,.0,0,0,0,.03,.03,.14,k2);
    b.add(GEO.box,0,-.2,-.05,.12,0,0,.034,.17,.06,k2);b.add(GEO.box,0,-.13,.1,-.25,0,0,.04,.1,.05,k);b.add(GEO.cyl8,0,-.02,.42,-PI/2,0,0,.02,.22,.02,k);b.add(GEO.box,0,-.055,.36,0,0,0,.04,.1,.12,k);}
  return wGeo[id]=b.build();}
const KW={rifle:'ak',rush:'smg',heavy:'lmg',mark:'dmr',ally:'m4'};
const footShade=new T.MeshBasicMaterial({transparent:true,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-4,polygonOffsetUnits:-4,map:M.shade.map}),
  footGeo=(()=>{const g=new T.PlaneGeometry(1.5,1.5);g.rotateX(-PI/2);const u=g.attributes.uv;for(let i=0;i<u.count;i++)u.setX(i,.02+u.getX(i)*.46);return g;})();
// One skinned mesh per soldier: every body part is rigidly bound to its joint, so a whole soldier is a single draw call.
const skinMat=L({vertexColors:true,map:solMat.map,skinning:true}),rigCache={};
const JOINT=[[0,0,0],[0,1,0],[-.3,.47,0],[0,-.36,0],[.3,.47,0],[0,-.36,0],[.12,.36,-.42],[-.12,.9,0],[0,-.46,0],[.12,.9,0],[0,-.46,0]],PARENT=[-1,0,1,2,1,4,1,0,7,0,9];
// bones: 0 body, 1 upper body, 2/3 left arm and forearm, 4/5 right, 6 weapon, 7/8 left thigh and shin, 9/10 right
function rigGeo(kind,wid){wid=wid||KW[kind];const key=kind+'/'+wid;if(rigCache[key])return rigCache[key];const G0=parts(kind),W=[];for(let k=0;k<11;k++){const p=JOINT[k].slice(),q=PARENT[k];if(q>=0){p[0]+=W[q][0];p[1]+=W[q][1];p[2]+=W[q][2];}W.push(p);}
  const list=[[G0.hips,0,[0,.98,0]],[G0.up,1],[G0.arm,2],[G0.fore,3],[G0.arm,4],[G0.fore,5],[weaponGeo(wid),6],[G0.thigh,7],[G0.shin,8],[G0.thigh,9],[G0.shin,10]];
  const p=[],n=[],c=[],u=[],si=[],sw=[],ix=[];
  for(const it of list){const g=it[0],b=it[1],o=it[2]||W[b],P=g.attributes.position,N=g.attributes.normal,Cc=g.attributes.color,U=g.attributes.uv,k=p.length/3;
    for(let i=0;i<P.count;i++){p.push(P.getX(i)+o[0],P.getY(i)+o[1],P.getZ(i)+o[2]);n.push(N.getX(i),N.getY(i),N.getZ(i));c.push(Cc.getX(i),Cc.getY(i),Cc.getZ(i));u.push(U.getX(i),U.getY(i));si.push(b,0,0,0);sw.push(1,0,0,0);}
    for(let i=0;i<g.index.count;i++)ix.push(k+g.index.getX(i));}
  const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(p,3));g.setAttribute('normal',new T.Float32BufferAttribute(n,3));g.setAttribute('color',new T.Float32BufferAttribute(c,3));
  g.setAttribute('uv',new T.Float32BufferAttribute(u,2));g.setAttribute('skinIndex',new T.Uint16BufferAttribute(si,4));g.setAttribute('skinWeight',new T.Float32BufferAttribute(sw,4));g.setIndex(ix);
  g.boundingSphere=new T.Sphere(new T.Vector3(0,1,0),2.2);return rigCache[key]=g;}
function buildSoldier(kind,wid){const g=new T.Group();g.rotation.order='YXZ';const B=[];
  for(let k=0;k<11;k++){const b=new T.Bone();b.position.set(JOINT[k][0],JOINT[k][1],JOINT[k][2]);B.push(b);if(PARENT[k]>=0)B[PARENT[k]].add(b);}
  g.add(B[0]);g.updateMatrixWorld(true);const mesh=new T.SkinnedMesh(rigGeo(kind,wid),skinMat);mesh.castShadow=true;g.add(mesh);mesh.bind(new T.Skeleton(B));
  const sh=new T.Mesh(footGeo,footShade);sh.position.y=.03;sh.renderOrder=2;g.add(sh);
  if(kind==='heavy')g.scale.setScalar(1.14);
  return{g,mesh,body:B[0],up:B[1],aL:B[2],fL:B[3],aR:B[4],fR:B[5],wp:B[6],lL:B[7],kL:B[8],lR:B[9],kR:B[10]};}
const allyMark=tex(32,32,(g,w,h)=>{g.fillStyle='#8ec1e6';g.strokeStyle='#15110c';g.lineWidth=3;g.beginPath();g.moveTo(16,27);g.lineTo(4,8);g.lineTo(28,8);g.closePath();g.fill();g.stroke();});
const foes=[],allies=[],corpses=[];let nidSeq=0;
function addSoldier(team,kind,x,z,o){o=o||{};const m=buildSoldier(kind,o.wid),K=KIND[kind];
  const s={team,kind,K,x,z,y0:o.y0||0,yaw:o.yaw===undefined?R()*TAU:o.yaw,hp:K.hp,maxHp:K.hp,alive:true,sc:kind==='heavy'?1.14:1,
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
function setSoldierWeapon(s,wid){s.mesh.geometry=rigGeo(s.kind,wid);}
function removeSoldier(s){scene.remove(s.g);}
// pose and limb animation
function animSoldier(s,dt){const c=s.crouch,m=s.moveAmt,ph=s.ph,sw=Math.sin(ph)*(s.run?.95:.65)*m;
  s.body.position.y=-.42*c+Math.abs(Math.sin(ph))*.035*m;
  // positive x rotation swings a hanging limb forward (towards -z)
  s.lL.rotation.x=1.15*c+sw;s.lR.rotation.x=1.15*c-sw;
  s.kL.rotation.x=-2*c-Math.max(0,Math.sin(ph+PI*.5))*.75*m;s.kR.rotation.x=-2*c-Math.max(0,Math.sin(ph+PI*1.5))*.75*m;
  const low=s.lowered?1:0,L0=s.up.userData.low===undefined?low:s.up.userData.low,lw=L0+(low-L0)*Math.min(1,dt*6);s.up.userData.low=lw;
  s.up.rotation.x=-.1*m*(s.run?2.2:1)-.22*c+s.aimP*(1-lw)-(s.flinch>0?.18:0);
  s.aR.rotation.set(.75-lw*.35,0,-.1);s.fR.rotation.x=1.25-lw*.5;s.aL.rotation.set(1.2-lw*.5,0,.5);s.fL.rotation.x=.3;
  s.wp.rotation.x=-lw*.6;s.wp.position.y=.36-lw*.12;}
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
