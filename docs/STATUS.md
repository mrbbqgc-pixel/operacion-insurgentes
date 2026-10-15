# Project status and history

Read this together with `CLAUDE.md` (how the game is built, tested and published) when picking the project up in a new conversation.

## What exists

- **Live game:** https://mrbbqgc-pixel.github.io/operacion-insurgentes/ (branch `gh-pages`, same commit as `main`).
- **Source:** this repository, `mrbbqgc-pixel/operacion-insurgentes` on GitHub. `main` is the released game.
- **Claude artifact:** https://claude.ai/artifact/Rdt3w4Ku1MPAkiod8souLF, the same game without multiplayer.

## How it got here

1. A Call of Duty-style shooter set in the owner's hometown, Ciudad Insurgentes, BCS: the real street grid at about 60% scale,
   landmarks on their real blocks (place data from Google Maps), the Glorieta statue, the cemetery, a story mission up
   Blvd. Benito Juárez to the Plaza Principal, survival mode, phone and desktop controls.
2. Published as a normal web page on GitHub Pages so people can play without a Claude login.
3. Multiplayer (released): Versus (free-for-all and two teams), co-op survival and the co-op story mission, up to 8 players,
   invite link or room code. Not yet tried by real players on real phones over the internet.

## In progress: the realism pass (not released)

Goal: make the town look and feel more like a real place (owner's reference: GTA / Call of Duty), within what a phone browser can draw.
Four jobs ran in parallel from `docs/realism-brief.md` (the shared brief; each job's own instructions are summarised below). All four
were cut off by a usage limit before finishing. Their unfinished work is saved on these branches, each one commit on top of `main`
at 8bf0eea; none has been fully tested or looked at by a person yet.

| Branch | Job | Modules touched |
|---|---|---|
| `realism-lighting` | Tone mapping, desert light, sky gradient and haze, baked ambient occlusion, vignette/grade, sun glare | 00-page, 01-core, 01b/01c atlas, 02a-build, 03a/03b, 09b, zz-test |
| `realism-life` | Civilians who walk and flee gunfire (penalty for hurting them), street dogs, a few cars driving, birds, ambient sound. Single-player only | new 07c-life.js, build.sh, 06a/06b, 07a, 08-mission, 09b, CLAUDE.md |
| `realism-clutter` | Rebar, block walls, fences, trash, tires, laundry, bougainvillea, topes, crosswalks, vendor carts, grime, graffiti | 01c-atlas2, 02b-props, 02i-dressing, 03a-props, 03b-street |
| `realism-soldiers` | More detailed soldiers with variants, better animation and deaths, detailed weapons, first-person arms and hands | 05-soldiers, 06a-weapons, 06b-player, 07b-ai-behave |

To finish: for each branch, build, run the tests in `CLAUDE.md`, look at screenshots (desktop and phone), fix what is broken or
ugly, then merge the four into `main` (they overlap in 03a/03b, 06a/06b and 09b, so merge one at a time and rebuild and test after
each), check the phone budget with `static3.js`, publish with `git push origin main main:gh-pages`, and republish the artifact.

## Ideas discussed but not started

- Photos of the real town from someone who lives there, to match colours, shops, houses and landmarks (public photo sources have
  almost nothing on Ciudad Insurgentes; Google Street View imagery cannot be used to build the game).
- Free CC0 3D models and animations (Kenney, Quaternius, Poly Haven, Mixamo) for soldiers, weapons and cars, bundled in the repo.
- OpenStreetMap building footprints for the town, if someone has traced them.
- A photoreal version would need Unreal Engine 5 and would be a separate PC game, not the phone link.
