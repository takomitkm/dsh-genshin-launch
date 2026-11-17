# Provenance and attribution

## Upstream

- Repository: <https://github.com/gamemcu/www-genshin>
- Author: gamemcu (Copyright (c) 2023)
- License: MIT (see `LICENSE`)
- Snapshot vendored here: commit `090cb905a53a078fb192fc7e3da2a7a679d35ff4` (`main`), copied verbatim into `upstream/`
- Mirror fork used for upstream tracking and future pull requests: <https://github.com/takomitkm/www-genshin>

## What is upstream's and what is ours

| Path | Origin |
| --- | --- |
| `upstream/**` | Verbatim snapshot of gamemcu/www-genshin at the commit above. Never edited in place. |
| `public/genshin-bg/**` | Build output of the upstream scene (see the note below), served by the host half. |
| `vendor/draco/**` | Draco decoder needed by the scene assets. |
| `lib/index.js` | Ours: host plugin that serves `/genshin-bg` from `public/genshin-bg`. |
| `lib/client.js` | Ours: browser module that injects the backdrop layer, the shell-chrome overrides, and the settings panel. |
| `cordis.patch.yml`, `package.json`, `locale/**`, `icon.svg`, `docs/**` | Ours: DSH packaging and documentation. |
| `scripts/build-scene.mjs` | Ours: builds the scene from `upstream/` into `public/genshin-bg/`. |

## Note on the shipped scene bundle

`public/genshin-bg/` is built from `upstream/` by `scripts/build-scene.mjs`, with
`patches/0001-loop-only.patch` applied. The patch strips the demo's menu, preloader, door sequence,
bloom transition, audio and the redirect to an external video, leaving the loop this wallpaper
shows. Rebuilding is deterministic: the same inputs produce the same hashed asset names.

Two prunings happen after the build, both reflected in the patch and the script: the menu artwork
and the ~4 MB of mp3 audio are dropped (the wallpaper is silent and has no UI), and the Draco
decoder from `vendor/draco` is copied beside the scene because it decodes the GLB geometry.

## Scope of pull requests

Changes to the **scene** (`upstream/src/**`) are legitimate pull-request material for
gamemcu/www-genshin; they are made on a branch in the fork above so the diff stays limited to
upstream's own files.

The **DSH halves** (`lib/**`, `cordis.patch.yml`, `package.json`'s `dsh` section, the shell-chrome
overrides and settings panel) are not: they target the DeepSeek Harness client, which upstream does
not depend on, and would be rejected as out of scope there.
