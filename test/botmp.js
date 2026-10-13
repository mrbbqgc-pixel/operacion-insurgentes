// A player bot for multiplayer tests. Unlike bot3.js it does not own the game loop: it thinks once per step and lets the page
// run, so the network keeps flowing. `acc` extra steps per tick speed the game up (acc 3 = about four times real time).
window.__botmp={t:0,log:[],n:0,opts:null,
  start(opts){if(this.t)return;opts=this.opts=opts||{};const g=window.__game,P=g.P,F=g.makeField(),dt=1/30,cl=(v,a,b)=>v<a?a:v>b?b:v,ad=(a,b)=>{let d=a-b;while(d>Math.PI)d-=2*Math.PI;while(d<-Math.PI)d+=2*Math.PI;return d;};
    let cur=null,acq=0,ey=0,ep=0,et=0,ft=0,lastStage=-9,gt=0,wasAlive=true;const H=opts.human,log=this.log,self=this;g.BOT.on=true;
    const think=()=>{gt+=dt;if(g.G.state!=='play'||g.G.menuUp){g.IN.fire=false;return;}
      if(g.MS.i!==lastStage){lastStage=g.MS.i;log.push(['STAGE',Math.round(gt),g.MS.i,g.OBJ.text]);}
      if(P.alive!==wasAlive){wasAlive=P.alive;log.push([P.alive?'UP':'DOWN',Math.round(gt),g.MS.i,Math.round(P.x),Math.round(P.z)]);}
      if(!P.alive){g.IN.fire=false;g.BOT.f=0;g.BOT.s=0;return;}
      const L=(g.MP.on&&g.G.mode==='versus')?g.MP.rivals:g.foes;let tgt=null,bd=opts.range||70;
      for(const f of L){if(!f.alive)continue;const d=Math.hypot(f.x-P.x,f.z-P.z);if(d<bd&&g.los(P.x,P.y+1.6,P.z,f.x,g.chestY(f),f.z)){bd=d;tgt=f;}}
      if(tgt!==cur){cur=tgt;acq=0;}acq+=dt;et-=dt;if(et<=0&&H){et=.3;ey=(Math.random()-.5)*2*H.err;ep=(Math.random()-.5)*2*H.err;}
      if(tgt){const dx=tgt.x-P.x,dz=tgt.z-P.z,d=Math.hypot(dx,dz),wy=Math.atan2(-dx,-dz)+(H?ey:0),wp=Math.atan2(g.chestY(tgt)-(P.y+1.6),d)+(H?ep:0),sp=H?H.aim:(opts.aim||5);
        P.yaw+=cl(ad(wy,P.yaw),-sp*dt,sp*dt);P.pitch+=cl(wp-P.pitch,-sp*dt,sp*dt);g.BOT.f=0;g.BOT.s=0;g.BOT.sprint=false;
        const on=Math.abs(ad(wy,P.yaw))<.05&&Math.abs(wp-P.pitch)<.07&&(!H||(acq>H.react&&(acq%1)<.65));g.IN.fire=on;if(on)g.IN.firePressed=true;P.wantAds=d>25;if(opts.crouch&&!P.crouching)g.IN.crouchT=true;}
      else{g.IN.fire=false;P.wantAds=false;if(P.crouching)g.IN.crouchT=true;const away=g.MS.phase==='defend',hi=g.OBJ.y>3;let gx=away?12:hi?g.OBJ.x+6:g.OBJ.x,gz=away?-452:hi?g.OBJ.z+34:g.OBJ.z;
        if(opts.goal){gx=opts.goal[0];gz=opts.goal[1];}ft-=dt;if(ft<=0){ft=.5;g.flow(F,gx,gz,115);}
        const dO=Math.hypot(gx-P.x,gz-P.z),fd=g.flowDir(F,P.x,P.z),wy=Math.atan2(-fd.x,-fd.z);P.yaw+=cl(ad(wy,P.yaw),-5*dt,5*dt);P.pitch*=.9;
        g.BOT.f=dO>2.5?1:0;g.BOT.s=0;g.BOT.sprint=dO>40;g.IN.useHeld=!!g.G.prompt&&/plant/.test(g.G.prompt);if(g.G.prompt&&/swap/.test(g.G.prompt)&&opts.pick)g.IN.use=true;
        const w=P.slots[P.cur];if(w.mag===0&&w.res===0)g.IN.swap=true;}};
    const acc=opts.acc||0;this.t=setInterval(()=>{try{think();for(let k=0;k<acc;k++){g.sim(1,dt);think();}}catch(e){self.err=String(e&&e.stack||e);}},33);},
  stop(){clearInterval(this.t);this.t=0;const g=window.__game;g.BOT.on=false;g.IN.fire=false;g.IN.useHeld=false;g.BOT.f=0;}};1
