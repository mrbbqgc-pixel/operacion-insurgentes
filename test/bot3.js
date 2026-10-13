window.__bot=function(seconds,opts){opts=opts||{};const g=window.__game,P=g.P,F=g.makeField();let t=0,ft=0;const log=[],dt=1/30,cl=(v,a,b)=>v<a?a:v>b?b:v,ad=(a,b)=>{let d=a-b;while(d>Math.PI)d-=2*Math.PI;while(d<-Math.PI)d+=2*Math.PI;return d;};
  g.BOT.on=true;let lastStage=g.MS.i,deaths=0,cur=null,acq=0,ey=0,ep=0,et=0,dmgT=0,lastHp=P.hp;const H=opts.human;
  while(t<seconds){
    if(g.G.state==='dead'){deaths++;log.push(['DEAD',Math.floor(t),g.MS.i,Math.round(P.x),Math.round(P.z),g.OBJ.sub]);if(!opts.retry)break;g.restartCheckpoint();g.G.state='play';lastHp=100;}
    if(g.G.state!=='play')break;
    let tgt=null,bd=opts.range||70;for(const f of g.foes){if(!f.alive)continue;const d=Math.hypot(f.x-P.x,f.z-P.z);if(d<bd&&g.los(P.x,P.y+1.6,P.z,f.x,g.chestY(f),f.z)){bd=d;tgt=f;}}
    if(tgt!==cur){cur=tgt;acq=0;}acq+=dt;et-=dt;if(et<=0&&H){et=.3;ey=(Math.random()-.5)*2*H.err;ep=(Math.random()-.5)*2*H.err;}
    if(tgt){const dx=tgt.x-P.x,dz=tgt.z-P.z,d=Math.hypot(dx,dz),wy=Math.atan2(-dx,-dz)+(H?ey:0),wp=Math.atan2(g.chestY(tgt)-(P.y+1.6),d)+(H?ep:0),sp=H?H.aim:(opts.aim||5);
      P.yaw+=cl(ad(wy,P.yaw),-sp*dt,sp*dt);P.pitch+=cl(wp-P.pitch,-sp*dt,sp*dt);g.BOT.f=0;g.BOT.s=0;g.BOT.sprint=false;
      const on=Math.abs(ad(wy,P.yaw))<.05&&Math.abs(wp-P.pitch)<.07&&(!H||(acq>H.react&&(acq%1)<.65));g.IN.fire=on;if(on)g.IN.firePressed=true;P.wantAds=d>25;
      if(opts.crouch&&!P.crouching)g.IN.crouchT=true;}
    else{g.IN.fire=false;P.wantAds=false;if(P.crouching)g.IN.crouchT=true;const away=g.MS.phase==='defend',hi=g.OBJ.y>3,gx=away?12:hi?g.OBJ.x+6:g.OBJ.x,gz=away?-452:hi?g.OBJ.z+34:g.OBJ.z;ft-=dt;if(ft<=0){ft=.5;g.flow(F,gx,gz,115);}
      const dO=Math.hypot(gx-P.x,gz-P.z),fd=g.flowDir(F,P.x,P.z),wy=Math.atan2(-fd.x,-fd.z);P.yaw+=cl(ad(wy,P.yaw),-5*dt,5*dt);P.pitch*=.9;
      g.BOT.f=dO>2.5?1:0;g.BOT.s=0;g.BOT.sprint=dO>40;g.IN.useHeld=!!g.G.prompt&&/plant/.test(g.G.prompt);if(g.G.prompt&&/swap/.test(g.G.prompt)&&opts.pick)g.IN.use=true;
      if(g.P.slots[g.P.cur].mag===0&&g.P.slots[g.P.cur].res===0)g.IN.swap=true;}
    g.sim(1,dt);t+=dt;if(P.hp<lastHp)dmgT+=lastHp-P.hp;lastHp=P.hp;
    if(g.MS.i!==lastStage){log.push(['STAGE',Math.floor(t),g.MS.i,g.OBJ.text,'score '+g.G.score,'kills '+g.G.stats.kills]);lastStage=g.MS.i;}
    if(Math.floor(t)!==Math.floor(t-dt)&&Math.floor(t)%(opts.every||10)===0)log.push([Math.floor(t),g.MS.i,Math.round(P.x),Math.round(P.z),Math.round(P.hp),g.foes.filter(f=>f.alive).length,g.foes.filter(f=>f.alive&&f.aware).length,g.OBJ.sub,g.allies.map(a=>a.down?'down':Math.round(a.hp)).join('/'),P.slots[P.cur].id+':'+P.slots[P.cur].mag+'/'+P.slots[P.cur].res]);
  }
  g.BOT.on=false;g.IN.fire=false;return {state:g.G.state,t:Math.round(t),stage:g.MS.i,deaths,dmgTaken:Math.round(dmgT),stats:g.G.stats,score:g.G.score,log};};
