# Roadmap

## 1. Source-level "loop only" build — done

`patches/0001-loop-only.patch` turns the upstream app into the wallpaper this plugin ships, and
`scripts/build-scene.mjs` reproduces `public/genshin-bg/` from `upstream/` + that patch.

What the patch removes:

| Removed | Where |
| --- | --- |
| Menu and preloader UI | `src/App.tsx` (renders only `Canvas`) |
| Click handling on the canvas | `src/pages/Canvas.tsx` |
| Door stop, door animation, white-plane backdrop | `src/core/components/Road.ts` |
| Camera stop and door rush | `src/core/components/ForwardCamera.ts` |
| Bloom flash transition | `src/core/Game.ts` (plugin no longer added) |
| Audio components and mp3 preloads | `src/core/Game.ts` |
| `restart()` redirect to an external video | `src/core/GameManager.ts` |
| Demo title/favicon/description | `index.html` |

What remains is the loop: the camera flies forward forever, and the road, clouds and columns
recycle around it (`Cloud`, `Column`, `BigColumn` key off `cameraCenter.z` and `zLength`), so the
scene never runs out and never stops.

Verified on a DSH desktop instance: entry chunk, DRACO decoder, road model and textures all load
(79 requests, 0 failures) and the WebGL canvas initialises at the window size. Motion cannot be
observed over CDP while the window is occluded — Chromium pauses `requestAnimationFrame` for a
hidden window, which is expected behaviour, not a scene fault.

## 2. Upstream pull request

The same change, limited to `src/**` plus `index.html`, is a reasonable upstream proposal: it adds
a "no UI, loop forever" mode to the demo.

It is already committed on the fork's `main` (<https://github.com/takomitkm/www-genshin>, commit
`d7775a8`), not on a side branch, so the fork's `main` is upstream `main` plus exactly this change:
`compare/main...takomitkm:main` reports ahead 1 / behind 0 across the seven files listed above.
Opening a pull request therefore needs no extra preparation — the head is `takomitkm:main`.

Note when proposing it: upstream's `npm run build` fails at `tsc` in this snapshot
(`src/core/components/ShaderTest.ts` imports a module that does not exist), so `vite build` is run
directly.

## 3. Hash-independent shell selectors

`lib/client.js` targets DSH's shell by CSS class hash (`an3WzG_root`, `GRgSLq_card`,
`WOwLGG_root`). Those hashes change when DSH rebuilds its web client. A more durable selector —
for example matching on the composer's structural position or on a stable data attribute — would
survive DSH upgrades without edits.
