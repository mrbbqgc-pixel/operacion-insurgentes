#!/bin/sh
cd "$(dirname "$0")"
JS="$(cat files.txt) zz-test.js"
{ cat 00-page.html; echo '<script>'; for f in $JS; do cat $f; echo ";(window.__tm=window.__tm||[]).push(['$f',Math.round(performance.now()),typeof chunks==='undefined'?0:(()=>{const o={};chunks.forEach(m=>m.forEach((b,mat)=>{const k=mat===M.wall?'wall':mat===M.flat?'flat':mat===M.paint?'paint':mat===M.shade?'shade':'frond';if(b.p)o[k]=(o[k]||0)+b.p.length/3;}));return o;})()]);"; done; echo '</script>'; } > test-static.html
cat $JS > all-test.js && node --check all-test.js && echo syntax-ok
