# dsh-genshin-launch
<img width="1280" height="686" alt="image_2026-11-18_13-18-42" src="https://github.com/user-attachments/assets/7027349e-df01-4315-aaf7-65dc7cb10622" />

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
- **The wallpaper steps back once you start chatting.** DSH only renders the hero composer on an
  empty conversation, so the plugin watches for it: sending the first message fades the scene out
  over 2.7 s, returns the shell to the theme's own background, and then stops the WebGL loop
  entirely. Opening a new (empty) conversation fades it back in.

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
| Panel frost | Opacity of the frost over the scene on the app panels | 25% |
| Composer frost | Opacity of the frost on the composer input card | 70% |
| Quality | Auto / High / Low; Auto picks Low on a software renderer | Auto |

**Quality.** `High` renders at the display's pixel ratio with bloom and FXAA. `Low` renders at half
resolution and skips both passes, which is where a software rasteriser spends its time; tone mapping
stays because it carries the look. `Auto` probes a throwaway canvas for the WebGL renderer string and
chooses `Low` when it sees `Basic Render Driver` (Windows WARP), `SwiftShader` or `llvmpipe`. Changing
the value reloads only the scene iframe.

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
the upstream dev dependencies. The committed `patches/0001-loop-only.patch` is what turns the demo
into this wallpaper, so a rebuild reproduces the shipped bundle.

`tsc` is skipped on purpose: the upstream snapshot's `src/core/components/ShaderTest.ts` imports a
module that does not exist, so upstream's own `npm run build` fails at the type-check step while
`vite build` succeeds.

## Known limitations

- The shell override matches DSH's semantic class suffixes (`_frame`, `_sidebarCol`, `_centerCol`,
  `_mainPanel`) rather than its per-build hashes, so ordinary DSH updates keep working. A build that
  drops those suffixes would need re-probing; the symptom is an opaque shell hiding a working scene.
- Chromium does not paint a hidden window, so the WebGL scene pauses whenever the app window is
  occluded or the session is disconnected. It resumes as soon as the window is visible.
- Without a GPU the scene runs on Chromium's software rasteriser at roughly 13 fps. It still plays;
  lower `--genshin-bg-panel` if you want the wallpaper to read more strongly.
- The backdrop is decorative: it never receives pointer events.

## License

MIT. Upstream scene and assets: Copyright (c) 2023 gamemcu. DSH plugin halves, packaging and build
scripts: Copyright (c) 2026 takomitkm. See [LICENSE](LICENSE).

## Upstream and pull requests

<https://github.com/takomitkm/www-genshin> is a clean fork of the upstream project, kept pristine so
its `main` can be diffed against `gamemcu/www-genshin`. Scene-level changes belong on a branch there
(and are PR-able upstream); the DSH halves in this repository are not.
