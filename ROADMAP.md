# Roadmap

## 1. Source-level "loop only, no transitions" build

The backdrop is supposed to show one continuous loop of the login scene: no intro, no scene cuts,
no transitions. The shipped `public/genshin-bg/` already behaves that way, but it came from a
modified build whose source edits were not kept (see `NOTICE.md`), so the behaviour is not
reproducible from this repository yet.

To close it:

1. Branch from the fork (<https://github.com/takomitkm/www-genshin>) at the pinned commit.
2. Strip the intro/transition path in the scene source — the relevant files are
   `src/core/components/BloomTransition.ts`, `src/core/states/StateMachine.ts`,
   `src/pages/Preloader.tsx`, and the menu mount in `src/main.tsx` / `src/App.tsx`.
3. Keep only the camera/scene loop, with `LoopRepeat` on the animation action.
4. Export the diff as `patches/0001-loop-only.patch` so `scripts/build-scene.mjs` reproduces it.
5. Rebuild, then verify inside DSH: one uninterrupted loop, no transition frames.

That same branch is the pull-request candidate for upstream: it touches only upstream's own files.

## 2. Upstream pull request

Once step 1 exists as a clean branch limited to `src/**`, open a PR against
gamemcu/www-genshin describing the change (loop-only mode). The DSH halves stay out of it.

## 3. Hash-independent shell selectors

`lib/client.js` targets DSH's shell by CSS class hash (`an3WzG_root`, `GRgSLq_card`,
`WOwLGG_root`). Those hashes change when DSH rebuilds its web client. A more durable selector —
for example matching on the composer's structural position or on a stable data attribute — would
survive DSH upgrades without edits.
