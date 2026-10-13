#!/bin/sh
cd "$(dirname "$0")"
JS="$(cat files.txt) 04-fx-audio.js 05-soldiers.js 06a-weapons.js 06b-player.js 07a-ai-core.js 07b-ai-behave.js 08-mission.js 08b-net.js 08c-mp-session.js 08d-mp-sync.js 08e-mp-versus.js 08f-mp-ui.js 08g-mp-coop.js 09a-hud.js 09b-input-loop.js"
{ cat 00-page.html; echo '<script>setTimeout(function(){'; cat $JS; echo '},60);</script>'; } > operacion-insurgentes.html
cat $JS > all.js && node --check all.js && wc -c operacion-insurgentes.html
