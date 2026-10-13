// =====================================================================
// 08b NET: rooms for multiplayer. Players connect browser to browser (WebRTC data channels, brokered by PeerJS).
// One player hosts; everyone else connects to the host only. The PeerJS library is bundled by the standalone page,
// so on a page without it (the Claude artifact) NET.ok is false and multiplayer stays hidden.
// =====================================================================
const PV=1; // protocol version: only players on the same version can share a room
const NET={ok:typeof window.Peer==='function',peer:null,host:false,code:'',up:null,state:'off',tries:0,onOpen:null,onFail:null,onData:null,onConn:null,onGone:null};
// state: off | opening | open (host: the room exists; guest: connected to the host) | failed
const CODE_CH='ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // no I, O, 0 or 1: codes get read out loud
function netCode(){let c='';for(let k=0;k<5;k++)c+=CODE_CH[Math.floor(R()*CODE_CH.length)];return c;}
const netId=c=>'opins'+PV+'-'+c;
// The public PeerJS service brokers the connections. "?ps=host:port" points the page at a PeerServer of your own (the tests do this).
function netOpts(){const o={debug:0};let m=null;try{m=/[?&]ps=([^&:]+):(\d+)/.exec(location.search);}catch(e){}
  if(m){o.host=m[1];o.port=+m[2];o.path='/';o.secure=false;o.config={iceServers:[]};}return o;}
const NET_ERR={'peer-unavailable':'No game with that code. Check the code, and that the host still has the game open.',
  'network':'Could not reach the connection service. Check your internet connection and try again.',
  'server-error':'The connection service is not answering. Try again in a minute.',
  'socket-error':'The connection service dropped the line. Try again.','socket-closed':'The connection service dropped the line. Try again.',
  'browser-incompatible':'This browser cannot make direct connections. Try a current version of Chrome or Safari.',
  'webrtc':'The direct connection failed. Another network often helps: Wi-Fi instead of mobile data, or the other way round.'};
const netMsg=(t,what)=>NET_ERR[t]||('Could not '+what+' ('+(t||'unknown error')+').');
function netClose(){const p=NET.peer;NET.peer=null;NET.up=null;NET.state='off';NET.code='';if(p){try{p.destroy();}catch(e){}}}
function netTx(c,msg){try{if(c&&c.open)c.send(msg);}catch(e){}}
// host: open a room under a fresh code (another code is tried if the first one is taken)
function netHost(){netClose();NET.host=true;NET.state='opening';NET.tries=0;netHostTry();}
function netHostTry(){const code=netCode(),p=new window.Peer(netId(code),netOpts());NET.peer=p;NET.code=code;
  p.on('open',()=>{if(NET.peer!==p||NET.state!=='opening')return;NET.state='open';if(NET.onOpen)NET.onOpen();}); // 'open' fires again after every reconnect to the broker
  p.on('connection',c=>{if(NET.peer!==p)return;
    c.on('data',d=>{if(NET.peer===p&&NET.onData)NET.onData(c,d);});
    c.on('close',()=>{if(NET.peer===p&&NET.onGone)NET.onGone(c);});
    c.on('error',()=>{});
    if(NET.onConn)NET.onConn(c);});
  // the broker is only needed for new arrivals; if its line drops, reconnect so that friends can still join
  p.on('disconnected',()=>{setTimeout(()=>{try{if(NET.peer===p&&!p.destroyed)p.reconnect();}catch(e){}},1500);});
  p.on('error',e=>{if(NET.peer!==p)return;const t=e&&e.type;
    if(NET.state==='opening'){if(t==='unavailable-id'&&NET.tries++<4){NET.peer=null;try{p.destroy();}catch(_){}netHostTry();return;}
      NET.state='failed';if(NET.onFail)NET.onFail(netMsg(t,'create the game'));}});}
// guest: connect to the host of the room with this code
function netJoin(code){netClose();NET.host=false;NET.state='opening';NET.code=code;const p=new window.Peer(netOpts());NET.peer=p;let done=false;
  const fail=m=>{if(done||NET.peer!==p)return;done=true;NET.state='failed';if(NET.onFail)NET.onFail(m);};
  p.on('open',()=>{if(NET.peer!==p)return;const c=p.connect(netId(code),{reliable:false,serialization:'json'});NET.up=c;
    c.on('open',()=>{if(done||NET.peer!==p)return;done=true;NET.state='open';if(NET.onOpen)NET.onOpen();});
    c.on('data',d=>{if(NET.peer===p&&NET.onData)NET.onData(c,d);});
    c.on('close',()=>{if(NET.peer===p&&NET.onGone)NET.onGone(c);});
    c.on('error',()=>{});});
  p.on('error',e=>fail(netMsg(e&&e.type,'join the game')));
  setTimeout(()=>fail('The connection took too long. Check the code, or try another network (Wi-Fi instead of mobile data, or the other way round).'),25000);}
