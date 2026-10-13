// Standalone-page extras: things a normal web page has to do for itself on a phone.
(function(){
  var d=document,nav=navigator,touch=('ontouchstart' in window)||nav.maxTouchPoints>0;
  var ios=/iPhone|iPad|iPod/.test(nav.userAgent)||(nav.platform==='MacIntel'&&nav.maxTouchPoints>1);
  // some phones report the old size when they fire "resize" after a rotation, so size the view again a moment later
  function again(){try{window.dispatchEvent(new Event('resize'));}catch(e){}}
  window.addEventListener('orientationchange',function(){setTimeout(again,160);setTimeout(again,650);});
  // no pinch zoom of the page itself on iPhone and iPad
  d.addEventListener('gesturestart',function(e){e.preventDefault();},{passive:false});
  // Android and other touch browsers: full screen, turned sideways, as soon as play starts
  function full(){
    if(!touch||ios)return;
    var el=d.documentElement,rf=el.requestFullscreen||el.webkitRequestFullscreen;
    if(!rf||d.fullscreenElement||d.webkitFullscreenElement)return;
    var turn=function(){try{var o=screen.orientation;if(o&&o.lock){var q=o.lock('landscape');if(q&&q.catch)q.catch(function(){});}}catch(e){}};
    try{var p=rf.call(el,{navigationUI:'hide'});if(p&&p.then)p.then(turn,function(){});else turn();}catch(e){}
  }
  ['btnStart','btnSurvival','btnMpCreate','btnMpJoin','btnMpStart'].forEach(function(id){var b=d.getElementById(id);if(b)b.addEventListener('click',full);});
  // iPhone and iPad have no full-screen button for web pages: the Home Screen icon is how to get one
  if(ios&&!nav.standalone){
    var opts=d.getElementById('opts');
    if(opts&&opts.parentNode){var t=d.createElement('p');t.className='tip';t.id='iosTip';
      t.textContent='iPhone or iPad: for full screen, tap Share, then Add to Home Screen.';
      opts.parentNode.insertBefore(t,opts.nextSibling);d.body.classList.add('iostip');}
  }
})();
