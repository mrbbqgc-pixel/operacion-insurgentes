# Operación Insurgentes

A browser first-person shooter set in Ciudad Insurgentes, Baja California Sur. One page, three.js r128, no framework.
It is played mostly on phones (iPhone Safari first), so every change is checked at phone size as well as desktop.

## Where it is published

- **Public site:** https://mrbbqgc-pixel.github.io/operacion-insurgentes/. GitHub Pages serves the root of the **`gh-pages`** branch.
  `main` and `gh-pages` are kept on the same commit; publishing is `git push origin main main:gh-pages`.
- **Claude artifact:** the same game without the standalone wrapper. When the game changes, republish `src/operacion-insurgentes.html`
  to it as well (the Artifact tool's list action finds it; publish from a copy named `operacion-insurgentes.html`).

## Layout

- `index.html`, `manifest.webmanifest`, `preview.jpg`, `icon-*.png`, `.nojekyll`: the built site. `index.html` and the manifest are build
  products; never edit them by hand.
- `src/`: the game. `00-page.html` is the markup and CSS. The JS modules are concatenated, in the order given by `files.txt` followed by
  the list in `src/build.sh`, into one function, so they share one scope and order matters.
  `01*` core, materials and the facade atlas; `02a-02c` building, prop and vehicle builders; `02d-02f` landmark builders;
  `02g` street grid; `02h` cemetery and the block-to-landmark table; `02i` street dressing and checkpoints; `03*` baked props, street
  furniture, collision and navigation; `04` effects and audio; `05` soldiers; `06*` weapons and player; `07*` AI; `08` mission;
  `09a` HUD and map; `09b` input, menus and the frame loop.
- `web/`: `build.py` wraps the game page as a normal web page (document head, three.js and fonts inlined from `web/vendor/`, link preview
  tags, manifest) and appends `extras.js` (re-size after rotation, no pinch zoom on iOS, full screen and landscape on Android when play
  starts, an "Add to Home Screen" hint on iOS Safari). `icon.svg` and `mkicon.js` make the icons.
- `test/`: `play.js` (headless runner for the built site), `bot3.js` (a player bot), `static3.js` (static world only), `fmt.py`, scenarios.

## Build, test, publish

```sh
sh build.sh                                   # src -> src/operacion-insurgentes.html -> index.html + manifest
cd test && npm ci                             # once; Chromium path can be set with CHROME_PATH
node play.js w1.json | python3 fmt.py         # desktop smoke test
node play.js w2b.json --ios | python3 fmt.py  # iPhone-size menu fit;  w3.json --android: full screen on start
node play.js t16.json --mobile | python3 fmt.py   # touch controls;    t12.json: pause, map, restart, quit, survival
node play.js r1.json | python3 fmt.py         # the bot plays the whole mission: must end in state 'win' (4 to 8 deaths is normal)
sh ../src/build-test.sh && node static3.js "$(cat s3a.json)"   # static world: counts, build times, screenshots
git push origin main main:gh-pages            # publish; the Pages deploy takes about a minute
```

Every run must print `no console errors` and `no outside requests` (the built page may not load anything from another host).
`python3 web/build.py --single DIR` writes a one-file copy with the icons inlined, for hosts that take a single HTML file.

Checking the live site from a Claude cloud session: the shell usually cannot reach `github.io`, so use WebFetch on the URL, and
`gh api "repos/mrbbqgc-pixel/operacion-insurgentes/actions/runs?per_page=1"` for the deploy status. The Pages settings API is not
reachable through the session proxy; Pages was switched on by pushing the `gh-pages` branch.

## Things to keep true

- **Shape of `src/00-page.html`:** no doctype, html, head or body tags. First come the title, the Google Fonts link and one style block;
  the last line is the cdnjs three.js r128 script tag. The Claude artifact needs this shape, and `web/build.py` asserts it before
  replacing the link and the script with inlined copies. Saves use `localStorage` key `opInsurgentes2`, always inside try/catch.
- **Test hooks:** `window.__game` (state, `sim(n,dt)`, bot inputs) is used by every scenario.
- **Phone budget:** about 120k to 185k triangles and 100 to 155 draw calls in play, up to about 265k triangles in the menu flyover
  (view distance 430, no shadows). The whole town is about 916k vertices in about 500 chunk meshes: static geometry and props are
  baked into 128 m chunks, and there is one skinned mesh per soldier. The script that builds the town runs in under a second in the
  headless test (`static3.js` prints the per-module times).
- **Map:** the real street grid at about 60% scale. Origin is the Glorieta, Blvd. Benito Juárez is the z axis (north is -z), the Loreto
  highway is +x. Street names are shown only where a real address or street position supported them. Guesses: what the Glorieta
  statue depicts (it is a generic figure), and where the stadium, the water tower and the cotton gin stand (the map note tells players
  about those three).
- **Content:** the enemy is a fictional mercenary force. Schools and kindergartens are scenery. The Panteón Municipal is a quiet
  landmark: no objectives, no spawns (`freeSpot` excludes it). Shop names are generic.
- **Place data** came from Google Maps lookups. Keep the "place data: Google Maps" note on the menu, and keep ratings, reviews and
  business details out of the game and out of this repository.
