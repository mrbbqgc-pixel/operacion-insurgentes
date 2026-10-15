# Common brief for the realism pass (read fully before touching code)

The repo is `/home/claude/operacion-insurgentes` (you are working in your own git worktree of it; find your path with `pwd`).
Read its `CLAUDE.md` first: it explains the layout, the build, the tests and the rules. Highlights:

- The game is ONE page: `src/00-page.html` + the JS modules in `src/` concatenated in the order of `src/files.txt` and `src/build.sh`
  into a single function scope. Order matters: a module can use anything defined in earlier modules. The code style is dense,
  one statement per line is NOT required; match the existing style (short names, `const`/`function`, comments that say why).
- Build: `sh build.sh` (from the worktree root). It writes `src/operacion-insurgentes.html` and `index.html`.
- Tests need `test/node_modules`; it is not in the worktree, so first run
  `ln -s /home/claude/operacion-insurgentes/test/node_modules $(pwd)/test/node_modules` (from the worktree root).
  Then from `test/`: `node play.js w1.json | python3 fmt.py` (desktop smoke, writes `w1-menu.png` and `w1-play.png`),
  `node play.js t16.json --mobile | python3 fmt.py` (phone), `node play.js w2b.json --ios | python3 fmt.py`,
  `node play.js r1.json | python3 fmt.py` (bot plays the whole mission, ~1-3 min, must end `'state': 'win'`),
  `sh ../src/build-test.sh && node static3.js "$(cat s3a.json)"` (prints tris/calls/verts and the per-module build times).
  Every run must print `no console errors` and `no outside requests`.
  Multiplayer suites (`node mp-versus.js`, `node mp-coop.js`) must still pass if you touch anything they use.
- The game is played mostly on iPhones. Budget in play: about 120k-185k triangles, 100-155 draw calls (static3 prints `tris`
  and `calls`; the current build is ~132k tris / 114 calls in that view). Static geometry is baked into 128 m chunks by
  `bat()/quadC()/boxC()/put()/pushGeo()` (01-core) and `bake()` (03a); dynamic objects are separate meshes, each a draw call,
  so keep dynamic meshes few (merge geometry, share materials). `isTouch` tells a phone from a desktop; `Q` holds quality.
- Screenshots: `test/play.js` scenarios take PNGs (see `w1.json`), and `__game.cam(x,y,z,tx,ty,tz)` positions the camera.
  LOOK at your screenshots with the Read tool before and after. The point of this work is how it looks; judge it with your eyes.
  Write your own small scenario JSON in the scratchpad if you need other views (copy w1.json; steps are click/wait/eval/shot).
- Content rules (CLAUDE.md): fictional enemy; schools, kindergartens and the Panteón Municipal are quiet (no spawns, no
  objectives, nothing violent placed there: `freeSpot` and `inCemetery` help); shop names generic; no real business details.
- Do not edit `index.html`, `manifest.webmanifest`, or any `all*.js`/`operacion-insurgentes.html` by hand: they are build products.
- `web/build.py` asserts the shape of `src/00-page.html` (title, fonts link, one style block, three.js script tag last). Keep it.
- Keep edits localized to the modules named in your task; other agents are editing other modules at the same time, and the
  branches will be merged. Avoid reformatting lines you do not need to change. If you must touch a shared module (01-core,
  09b-input-loop, 08-mission), add a small hook rather than rewriting a function.
- When done: run the tests listed, commit on your worktree branch with a clear message (one commit is fine), and report:
  what you changed (modules, functions), the before/after numbers from static3 (tris, calls, buildMs), which tests passed,
  the paths of your before/after screenshots, and anything you could not do or are unsure of. Do not push.
  Commit messages end with:
  Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>
  Claude-Session: https://claude.ai/code/session_01FMPSMKqrtEpApmHWdrUwgJ

Goal of the whole pass: the town should look and feel more like a real place (the reference is GTA/Call of Duty, within what a
phone browser and code-drawn geometry can do). Current look: `test/w1-play.png` and `test/w1-menu.png` in the main checkout.
The town is Ciudad Insurgentes, BCS: a flat 1950s farm-colony grid in the desert, cinder-block and stucco houses, flat roofs with
water tanks (tinacos), rebar sticking out of unfinished walls, chain-link and block fences, bougainvillea, palms, dust, strong
afternoon sun, the Sierra de la Giganta on the eastern horizon.
