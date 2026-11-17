# dsh-genshin-launch

A Genshin Impact login-scene wallpaper for the **DeepSeek Harness (DSH)** desktop client: the
scene plays behind the app as a fixed, non-interactive layer, with a small settings panel for the
backdrop itself.

Built on [gamemcu/www-genshin](https://github.com/gamemcu/www-genshin) (MIT, Copyright (c) 2023
gamemcu). See [NOTICE.md](NOTICE.md) for exactly what is upstream's and what is this project's.

## What it does

- **Host half** (`lib/index.js`) serves the scene from `public/genshin-bg/` at the route
  `/genshin-bg`, injecting `<base href="/genshin-bg/">` so relative asset URLs resolve.
- **Client half** (`lib/client.js`) prepends a fixed full-viewport layer containing an
  `<iframe src="/genshin-bg/index.html">`, then makes DSH's own shell chrome translucent so the
  scene shows through behind the app instead of being covered by an opaque frame.
- It also hides DSH's hero banner (the "探索未至之境 / preview" headline) and frosts the content
  panels so text stays legible over the scene.

## Requirements

- DSH 0.2.x desktop client.
- The plugin must be installed into the profile the desktop app actually boots
  (`~/.dsh/profiles/desktop`). The desktop app always loads that profile; it ignores `--profile`.

## Install

Link the checkout into the profile and list it as a bundle, or use **Settings → Plugins → Add
plugin** and pick this directory.

```jsonc
// ~/.dsh/profiles/desktop/package.json
{
  "dependencies": { "@takomitkm/dsh-genshin-launch": "link:/absolute/path/to/this/checkout" },
  "dsh": { "profile": { "bundles": ["@deepseek-ai/dsh-base", "@deepseek-ai/dsh-web-app",
                                   "@takomitkm/dsh-genshin-launch"] } }
}
```

`node_modules/@takomitkm/dsh-genshin-launch` must resolve to the checkout (a junction on Windows,
a symlink elsewhere). Restart the app afterwards.

## Settings

Two round buttons sit in the bottom-right corner, at 35% opacity until hovered:

- **Eye** — hide or show the backdrop.
- **Gear** — open the settings panel:

| Setting | Effect | Default |
| --- | --- | --- |
| Show backdrop | Hides the scene layer entirely | on |
| Panel frost | Opacity of the frost over the scene on the app panels | 55% |
| Composer frost | Opacity of the frost on the composer input card | 75% |

`Reset` restores the defaults. Values apply live (no reload, no restart) and persist per browser
profile in `localStorage` under `dsh-genshin-launch:settings`. Earlier keys
(`dsh-genshin-wallpaper:settings`, `dsh-genshin-bg:settings`, `dsh-genshin-bg:visible`) are migrated
on first load.

Both frost strengths are also plain CSS variables, so a user stylesheet can override them without
the panel: `--genshin-bg-panel` and `--genshin-bg-card`.

## Repository layout

```
lib/                 DSH plugin halves — hand-written ESM, no build step
public/genshin-bg/   the scene bundle served by the host half
vendor/draco/        Draco decoder used by the scene assets
upstream/            verbatim snapshot of gamemcu/www-genshin @ 090cb905 (scene source, assets)
patches/             build-time patches applied to upstream/ (currently none)
scripts/             build-scene.mjs
cordis.patch.yml     loader insert row
locale/, icon.svg    plugin metadata
docs/DETAIL.md       plugin detail page
```

## Building the scene

```sh
npm run build:scene
```

Copies `upstream/` to `.build/scene/`, applies `patches/*.patch`, installs dependencies, builds
with Vite (`--base=./`), and replaces `public/genshin-bg/`. Requires Node 22+ and network access for
the upstream dev dependencies.

**Heads-up:** with an empty `patches/` this reproduces *upstream's own app* (menu, preloader, intro
transitions), not the stripped loop-only backdrop shipped here. See [ROADMAP.md](ROADMAP.md) and
the note in [NOTICE.md](NOTICE.md).

## Known limitations

- The shell selectors (`an3WzG_root`, `GRgSLq_card`, `WOwLGG_root`) are DSH's hashed class names.
  A DSH update that reshuffles them needs the selectors re-probed (tracked in `ROADMAP.md`).
- Chromium does not paint a hidden window, so the WebGL scene pauses whenever the app window is
  occluded or the session is disconnected. It resumes as soon as the window is visible.
- The backdrop is decorative: it never receives pointer events.

## License

MIT. Upstream scene and assets: Copyright (c) 2023 gamemcu. DSH plugin halves, packaging and build
scripts: Copyright (c) 2026 takomitkm. See [LICENSE](LICENSE).

## Upstream and pull requests

<https://github.com/takomitkm/www-genshin> is a clean fork of the upstream project, kept pristine so
its `main` can be diffed against `gamemcu/www-genshin`. Scene-level changes belong on a branch there
(and are PR-able upstream); the DSH halves in this repository are not.
