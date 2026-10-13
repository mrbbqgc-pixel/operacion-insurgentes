# Operación Insurgentes

A first-person shooter set in Ciudad Insurgentes, Baja California Sur, that runs in the browser on a phone or a computer. Nothing to install.

**Play it:** https://mrbbqgc-pixel.github.io/operacion-insurgentes/

## Controls

- **Phone or tablet:** turn it sideways. Left thumb moves, right thumb aims, FIRE shoots. On Android the game goes full screen when you start. On iPhone or iPad, use Share, then Add to Home Screen, and open the game from its icon to play full screen.
- **Computer:** WASD to move, mouse to aim and fire. Shift sprint, C crouch, Space jump, R reload, Q swap, G grenade, V knife, F pick up or use, M map, Esc pause.

## Multiplayer

Up to 8 players, phones and computers together: **Versus** (free-for-all or two teams, in one part of the town), **co-op survival**, and the
**co-op mission**.

1. One player taps **Multiplayer**, then **Create a game**, and sends the invite link (or reads out the five-character room code).
2. The others open the link, enter a name and tap **Join**.
3. The player who created the game picks the mode and taps **Start**. That player has to keep the game open until the end.

The players' devices connect to each other directly, with the free public [PeerJS](https://peerjs.com/) service making the introduction, so
play with people you know. Some networks block direct connections; if joining fails, switching between Wi-Fi and mobile data often helps.

## About the map

The street grid, street names and landmarks follow the real town at about 60% scale (place data: Google Maps). Houses and shops are generated, and a few landmarks are placed by guess. The enemy force is fictional.

## Building

The game's source is in `src/`. `sh build.sh` rebuilds `index.html`; `git push origin main main:gh-pages` publishes it. `CLAUDE.md` has the details and the tests.

## Credits

Built with [three.js](https://threejs.org/) r128 and [PeerJS](https://peerjs.com/) 1.5.5 (both MIT licence). Fonts: Saira Stencil One and Saira Condensed (SIL Open Font Licence 1.1). Licence texts are in `web/vendor/`.
