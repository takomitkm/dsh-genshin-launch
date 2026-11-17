# Patches applied to the upstream scene at build time

`scripts/build-scene.mjs` copies `upstream/` into `.build/scene/` and then applies every
`*.patch` file in this directory, in filename order, with:

```
git apply --verbose --directory=.build/scene patches/<name>.patch
```

So a patch must use upstream-relative paths, e.g. `a/src/core/states/StateMachine.ts`.

## 0001-loop-only.patch

Turns the upstream demo into the wallpaper this plugin ships: no menu, no preloader, no door, no
bloom transition, no audio, and no redirect away from the host app. The camera flies forward
forever while the road, clouds and columns recycle around it.

Touches:

```
index.html
src/App.tsx
src/pages/Canvas.tsx
src/core/Game.ts
src/core/GameManager.ts
src/core/components/Road.ts
src/core/components/ForwardCamera.ts
```

It is also the pull-request candidate for upstream, so keep it limited to upstream's own files
(no DSH glue) and regenerate it from the fork branch rather than editing it by hand.
