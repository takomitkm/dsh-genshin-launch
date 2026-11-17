# Patches applied to the upstream scene at build time

`scripts/build-scene.mjs` copies `upstream/` into `.build/scene/` and then applies every
`*.patch` file in this directory, in filename order, with:

```
git apply --verbose --directory=.build/scene patches/<name>.patch
```

So a patch must use upstream-relative paths, e.g. `a/src/core/states/StateMachine.ts`.

There are no patches yet. `patches/0001-loop-only.patch` is the planned one: it strips the
intro/transition path so the scene plays one continuous loop, matching what this plugin ships.
See `ROADMAP.md` for the file list and the verification steps.

Keep the patch identical to the branch in the upstream fork, so the same change can be proposed
upstream as a pull request.
