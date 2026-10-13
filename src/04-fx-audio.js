// =====================================================================
// 04 EFFECTS + AUDIO: sprites, tracers, decals, shells, debris, synthesised positional sound
// =====================================================================
const dot=tex(64,64,(g,w,h)=>{const gr=g.createRadialGradient(32,32,2,32,32,32);gr.addColorStop(0,'rgba(255,255,255,1)');gr.addColorStop(.4,'rgba(255,255,255,.6)');
  gr.addColorStop(1,'rgba(255,255,255,0)');g.fillStyle=gr;g.fillRect(0,0,w,h);});
const smokeTex=tex(64,64,(g,w,h)=>{for(let k=0;k<9;k++){const x=32+rr(-11,11),y=32+rr(-11,11),r=rr(12,20),gr=g.createRadialGradient(x,y,1,x,y,r);
  gr.addColorStop(0,'rgba(255,255,255,.5)');gr.addColorStop(1,'rgba(255,255,255,0)');g.fillStyle=gr;g.fillRect(0,0,w,h);}});
const SPR=[];for(let k=0;k<90;k++){const s=new T.Sprite(new T.SpriteMaterial({map:dot,transparent:true,depthWrite:false}));s.visible=false;scene.add(s);
  SPR.push({s,t:0,d:1,z0:1,z1:1,vx:0,vy:0,vz:0,a:1});}
let sprK=0;
// generic particle: colour, start/end size, duration, alpha, velocity, additive?, smoke texture?
function puff(x,y,z,col,z0,z1,dur,a,vx,vy,vz,add,smoky){const o=SPR[sprK=(sprK+1)%SPR.length],m=o.s.material;o.s.position.set(x,y,z);m.color.setHex(col);
  m.blending=add?T.AdditiveBlending:T.NormalBlending;m.map=smoky?smokeTex:dot;m.opacity=a;m.rotation=R()*TAU;o.s.scale.set(z0,z0,1);o.s.visible=true;
  o.t=o.d=dur;o.z0=z0;o.z1=z1;o.a=a;o.vx=vx||0;o.vy=vy||0;o.vz=vz||0;}
const dust=(x,y,z,n)=>{for(let k=0;k<(n||1);k++)puff(x,y,z,0xd9c39a,.18,.9,.45,.8,R2(-.5,.5),R2(.3,1),R2(-.5,.5),false,true);};
const spark=(x,y,z)=>{for(let k=0;k<3;k++)puff(x,y,z,0xffc45a,.12,.03,.16,1,R2(-3,3),R2(0,3),R2(-3,3),true);};
const bloodPuff=(x,y,z)=>puff(x,y,z,0x8a1f16,.14,.5,.26,.85,0,.3,0,false,true);
const smoke=(x,y,z,size,dur,col)=>puff(x,y,z,col||0x3a3632,size*.5,size*1.8,dur,.7,R2(-.4,.4),R2(.8,1.8),R2(-.4,.4),false,true);
const tracers=[];for(let k=0;k<44;k++){const g=new T.BufferGeometry();g.setAttribute('position',new T.BufferAttribute(new Float32Array(6),3));
  const l=new T.Line(g,new T.LineBasicMaterial({color:0xfff0b0,transparent:true}));l.frustumCulled=false;l.visible=false;scene.add(l);tracers.push({l,t:0});}
let trK=0;
function tracer(ax,ay,az,bx,by,bz,col){const o=tracers[trK=(trK+1)%tracers.length],a=o.l.geometry.attributes.position;
  a.setXYZ(0,ax,ay,az);a.setXYZ(1,bx,by,bz);a.needsUpdate=true;o.l.material.color.setHex(col);o.l.material.opacity=.9;o.l.visible=true;o.t=.07;}
// bullet-hole and scorch decals on axis-aligned surfaces
const holeTex=tex(32,32,(g,w,h)=>{const gr=g.createRadialGradient(16,16,1,16,16,15);gr.addColorStop(0,'rgba(10,8,6,.95)');gr.addColorStop(.45,'rgba(30,24,18,.6)');gr.addColorStop(1,'rgba(30,24,18,0)');g.fillStyle=gr;g.fillRect(0,0,w,h);});
const decals=[],decalGeo=new T.PlaneGeometry(1,1);for(let k=0;k<60;k++){const m=new T.Mesh(decalGeo,new T.MeshBasicMaterial({map:holeTex,transparent:true,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-4,polygonOffsetUnits:-4}));
  m.visible=false;scene.add(m);decals.push(m);}
let decK=0;
function decal(x,y,z,nx,ny,nz,size){const m=decals[decK=(decK+1)%decals.length];m.position.set(x+nx*.012,y+ny*.012,z+nz*.012);m.scale.set(size,size,1);
  m.rotation.set(0,0,0);if(ny>.5)m.rotation.x=-PI/2;else if(ny<-.5)m.rotation.x=PI/2;else if(nx>.5)m.rotation.y=PI/2;else if(nx<-.5)m.rotation.y=-PI/2;else if(nz<-.5)m.rotation.y=PI;
  m.rotation.z=R()*TAU;m.visible=true;}
// shell casings and explosion debris: tiny boxes with simple physics
const bits=[],bitGeo=new T.BoxGeometry(1,1,1),brass=L({color:0xc9a23a}),char=L({color:0x2a2622});
for(let k=0;k<34;k++){const m=new T.Mesh(bitGeo,brass);m.visible=false;scene.add(m);bits.push({m,t:0,vx:0,vy:0,vz:0,rx:0,rz:0});}
let bitK=0;
function bit(x,y,z,vx,vy,vz,sx,sy,sz,mat,life){const o=bits[bitK=(bitK+1)%bits.length];o.m.material=mat;o.m.position.set(x,y,z);o.m.scale.set(sx,sy,sz);o.m.visible=true;
  o.vx=vx;o.vy=vy;o.vz=vz;o.t=life;o.rx=R2(-9,9);o.rz=R2(-9,9);}
const fxLight=new T.PointLight(0xffc070,0,26,2);scene.add(fxLight);let fxLightT=0,shake=0;
function lightAt(x,y,z,power,dur){fxLight.position.set(x,y,z);fxLight.intensity=power;fxLightT=dur;}
function fxExplosion(x,y,z,rad){puff(x,y+.6,z,0xfff1c4,rad*.5,rad*1.5,.16,1,0,0,0,true);
  for(let k=0;k<7;k++)puff(x+R2(-1,1),y+R2(.3,1.4),z+R2(-1,1),0xff9a2e,rad*.25,rad*.7,R2(.25,.5),.95,R2(-2,2),R2(1,4),R2(-2,2),true,true);
  for(let k=0;k<9;k++)smoke(x+R2(-1.5,1.5),y+R2(.5,2),z+R2(-1.5,1.5),rad*.45,R2(1.6,3.4));
  for(let k=0;k<8;k++){const a=k/8*TAU;puff(x+Math.cos(a)*1.2,.25,z+Math.sin(a)*1.2,0xd9c39a,.6,rad*.6,.7,.7,Math.cos(a)*5,.5,Math.sin(a)*5,false,true);}
  for(let k=0;k<10;k++)bit(x,y+.4,z,R2(-7,7),R2(3,9),R2(-7,7),R2(.08,.22),R2(.08,.22),R2(.08,.22),char,R2(1.5,2.8));
  decal(x,.02,z,0,1,0,rad*.9);lightAt(x,y+1.5,z,3.2,.35);}
function fxUpdate(dt){
  for(let k=0;k<tracers.length;k++){const o=tracers[k];if(o.t>0){o.t-=dt;if(o.t<=0)o.l.visible=false;else o.l.material.opacity=o.t/.07*.9;}}
  for(let k=0;k<SPR.length;k++){const o=SPR[k];if(o.t>0){o.t-=dt;if(o.t<=0){o.s.visible=false;continue;}const f=1-o.t/o.d,s=o.z0+(o.z1-o.z0)*f;
    o.s.scale.set(s,s,1);o.s.material.opacity=o.a*(1-f*f);const p=o.s.position;p.x+=o.vx*dt;p.y+=o.vy*dt;p.z+=o.vz*dt;o.vx*=1-dt*1.5;o.vz*=1-dt*1.5;o.vy*=1-dt*.8;}}
  for(let k=0;k<bits.length;k++){const o=bits[k];if(o.t>0){o.t-=dt;if(o.t<=0){o.m.visible=false;continue;}const p=o.m.position;o.vy-=18*dt;p.x+=o.vx*dt;p.y+=o.vy*dt;p.z+=o.vz*dt;
    if(p.y<.03){p.y=.03;if(o.vy<-1.5){o.vy*=-.35;o.vx*=.5;o.vz*=.5;}else{o.vy=0;o.vx=0;o.vz=0;o.rx=0;o.rz=0;}}o.m.rotation.x+=o.rx*dt;o.m.rotation.z+=o.rz*dt;}}
  if(fxLightT>0){fxLightT-=dt;fxLight.intensity*=Math.max(0,1-dt*9);if(fxLightT<=0)fxLight.intensity=0;}
  if(shake>0)shake=Math.max(0,shake-dt*2.2);}

// ---------- audio
const AU={ctx:null,master:null,lp:null,noise:null,on:true,shots:0,heli:null};
function initAudio(){if(AU.ctx){if(AU.ctx.state==='suspended')AU.ctx.resume();return;}
  try{const C=window.AudioContext||window.webkitAudioContext,c=new C();AU.ctx=c;AU.master=c.createGain();AU.master.gain.value=AU.on?.85:0;
    AU.lp=c.createBiquadFilter();AU.lp.type='lowpass';AU.lp.frequency.value=18000;const comp=c.createDynamicsCompressor();
    AU.master.connect(AU.lp);AU.lp.connect(comp);comp.connect(c.destination);
    AU.noise=c.createBuffer(1,c.sampleRate,c.sampleRate);const d=AU.noise.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1;
    // quiet desert wind
    const w=c.createBufferSource();w.buffer=AU.noise;w.loop=true;const wf=c.createBiquadFilter();wf.type='lowpass';wf.frequency.value=320;const wg=c.createGain();wg.gain.value=.05;
    w.connect(wf);wf.connect(wg);wg.connect(AU.master);w.start();}catch(e){AU.ctx=null;}}
function setSound(on){AU.on=on;if(AU.ctx)AU.master.gain.value=on?.85:0;}
function aOut(vol,pan){const c=AU.ctx,g=c.createGain();g.gain.value=vol;if(c.createStereoPanner){const p=c.createStereoPanner();p.pan.value=clamp(pan||0,-1,1);g.connect(p);p.connect(AU.master);}
  else g.connect(AU.master);return g;}
const SP={vol:1,pan:0,lp:9000,d:0};
function spatial(x,z,ref){const dx=x-P.x,dz=z-P.z,d=Math.hypot(dx,dz);SP.d=d;SP.pan=d<.5?0:(dx*Math.cos(P.yaw)-dz*Math.sin(P.yaw))/d*.85;
  SP.vol=1/(1+d/(ref||12));SP.lp=clamp(9000-d*55,450,9000);return SP;}
function nz(o,dur,lp0,lp1,vol,hp,rate){const c=AU.ctx,t=c.currentTime,s=c.createBufferSource(),f=c.createBiquadFilter(),g=c.createGain();s.buffer=AU.noise;if(rate)s.playbackRate.value=rate;
  f.type=hp?'highpass':'lowpass';f.frequency.setValueAtTime(lp0,t);f.frequency.exponentialRampToValueAtTime(Math.max(40,lp1),t+dur);
  g.gain.setValueAtTime(vol,t);g.gain.exponentialRampToValueAtTime(.001,t+dur);s.connect(f);f.connect(g);g.connect(o);s.start(t,Math.random()*.6);s.stop(t+dur+.03);}
function osc(o,type,f0,f1,dur,vol,delay){const c=AU.ctx,t=c.currentTime+(delay||0),os=c.createOscillator(),g=c.createGain();os.type=type;os.frequency.setValueAtTime(f0,t);
  if(f1)os.frequency.exponentialRampToValueAtTime(f1,t+dur);g.gain.setValueAtTime(vol,t);g.gain.exponentialRampToValueAtTime(.001,t+dur);os.connect(g);g.connect(o);os.start(t);os.stop(t+dur+.03);}
const SHOT={m4:[.16,3200,150,1],ak:[.2,2400,120,1.1],smg:[.11,3800,190,.8],pistol:[.12,3000,170,.75],shotgun:[.34,1700,80,1.35],dmr:[.3,2600,95,1.3],lmg:[.2,2100,105,1.15]};
function sndShot(kind,x,z,own){if(!AU.ctx||!AU.on)return;if(!own){if(AU.shots>5)return;AU.shots++;}try{const W=SHOT[kind]||SHOT.m4,s=own?null:spatial(x,z,16);
  const o=aOut((own?.5:.6*s.vol)*W[3],own?0:s.pan),lp=own?W[1]:Math.min(W[1],s.lp);nz(o,W[0]*(own?1:1+s.d/120),lp,220,1);osc(o,'sine',W[2],W[2]*.35,.1,.9);
  if(own||s.d<40)nz(o,.03,5000,3000,.5,true);}catch(e){}}
function sndBoom(x,z){if(!AU.ctx)return;try{const s=spatial(x,z,30),o=aOut(Math.min(1,1.6*s.vol),s.pan);nz(o,1.1,Math.min(1400,s.lp),50,1,false,.6);osc(o,'sine',70,28,.9,1);nz(o,.12,3000,400,.8);
  if(s.d<14)deafen(1-s.d/14);}catch(e){}}
function deafen(k){if(!AU.ctx)return;const t=AU.ctx.currentTime,f=AU.lp.frequency;f.cancelScheduledValues(t);f.setValueAtTime(700-300*k,t);f.exponentialRampToValueAtTime(18000,t+2+2.5*k);
  osc(aOut(.05*k,0),'sine',4100,4100,2+2*k,1);}
function sndWhiz(){if(!AU.ctx)return;try{const o=aOut(.22,R2(-1,1));nz(o,.05,4000,2500,1,true);osc(o,'sawtooth',R2(1400,2000),500,.13,.25);}catch(e){}}
function sndUi(kind){if(!AU.ctx)return;try{const o=aOut(.5,0);
  if(kind==='hit')osc(o,'square',1150,900,.04,.12);else if(kind==='kill'){osc(o,'triangle',880,880,.07,.2);osc(o,'triangle',1320,1320,.12,.2,.07);}
  else if(kind==='radio'){osc(o,'square',1400,1400,.05,.08);osc(o,'square',1750,1750,.05,.08,.07);}
  else if(kind==='click')nz(o,.03,3500,1500,.5,true);else if(kind==='mag'){nz(o,.05,1800,700,.6);osc(o,'square',240,160,.05,.15);}
  else if(kind==='pick')osc(o,'sine',700,1200,.12,.2);else if(kind==='hurt'){osc(o,'sine',130,55,.16,.6);nz(o,.08,900,300,.4);}
  else if(kind==='empty')osc(o,'square',190,170,.04,.15);else if(kind==='obj'){osc(o,'triangle',660,660,.12,.22);osc(o,'triangle',880,880,.12,.22,.13);osc(o,'triangle',1100,1100,.22,.22,.26);}
  else if(kind==='pin'){nz(o,.04,5000,3000,.5,true);osc(o,'square',900,700,.03,.1,.05);}
  else if(kind==='knife')nz(o,.12,2500,600,.5,true,1.6);}catch(e){}}
function sndStep(hard,vol){if(!AU.ctx)return;try{const o=aOut(vol||.16,0);nz(o,.07,hard?1500:650,hard?500:220,1);if(hard)osc(o,'sine',120,70,.05,.3);}catch(e){}}
function sndStepAt(x,z){if(!AU.ctx)return;const s=spatial(x,z,5);if(s.d>26)return;try{nz(aOut(.14*s.vol,s.pan),.07,600,220,1);}catch(e){}}
function heliSound(on,x,z){if(!AU.ctx)return;try{if(on&&!AU.heli){const c=AU.ctx,s=c.createBufferSource();s.buffer=AU.noise;s.loop=true;const f=c.createBiquadFilter();f.type='lowpass';f.frequency.value=420;
      const g=c.createGain();g.gain.value=0;const l=c.createOscillator(),lg=c.createGain();l.frequency.value=13;lg.gain.value=.5;const m=c.createGain();m.gain.value=.5;
      l.connect(lg);lg.connect(m.gain);s.connect(f);f.connect(m);m.connect(g);g.connect(AU.master);s.start();l.start();AU.heli={s,l,g};}
    if(AU.heli){if(on){const sp=spatial(x,z,60);AU.heli.g.gain.value=Math.min(.9,1.4*sp.vol);}else{AU.heli.s.stop();AU.heli.l.stop();AU.heli=null;}}}catch(e){}}
