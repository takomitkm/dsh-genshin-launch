# Genshin ambient backdrop

A passive, infinite-loop Genshin login scene rendered as a fixed, non-interactive
backdrop behind the DSH desktop client's web UI.

## What it does

- Host half (`lib/index.js`) registers a static route `/genshin-bg` on the DSH
  web server and serves the prebuilt scene from `public/genshin-bg` (HTML, JS,
  CSS, the Genshin GLB models, textures, and the bundled Draco decoder). The
  route injects `<base href="/genshin-bg/">` into the HTML so relative asset
  URLs resolve correctly.
- Client half (`lib/client.js`) registers a DSH web client module that prepends a
  full-screen, fixed layer (`position: fixed; inset: 0; z-index: 0;
  pointer-events: none`) containing an `<iframe src="/genshin-bg/index.html">` to
  the document body. The layer is the lowest paint layer of the page, so the app
  content renders above it and the backdrop never intercepts input.

  The DSH web-client AppFrame paints an **opaque** background
  (`.mP3x-q_frame { background: var(--dsw-alias-bg-base) }`, plus opaque sidebar
  and center columns) over the whole viewport. A scene placed behind that frame
  would be invisible, so the client also flips those shell-chrome backgrounds to
  `transparent` and paints a tunable legibility scrim over the content panels.
  This is the same "plugin-owned fixed backdrop" model `dsh-image-theme` uses:
  the plugin owns the app's background, the layout renders it. (For a static
  image that is just the `--dsw-alias-bg-base` variable; for a live WebGL scene
  it has to be a DOM iframe layer plus the transparent-chrome override.)
- The scene is loaded with `dsh.client.immediately: true` so the backdrop appears
  as soon as the web client boots.

## Loop behavior

The fork keeps only the loop segment of the original `gamemcu/www-genshin`
animation: no intro and no scene cuts. The Three.js camera animation uses the
default `AnimationAction` loop mode (`LoopRepeat`), so it plays continuously and
forever with no transition.

## Offline and self-contained

Every asset the scene needs ships inside this plugin package
(`public/genshin-bg/**`, `vendor/draco/**`). Nothing is fetched from the network,
so the backdrop works with DSH fully offline.

## Tuning

The backdrop is intentionally low-risk and fully tunable via CSS custom
properties. Override them on `:root` (browser console, or a user stylesheet) —
no plugin edit required:

| Variable | Default | Effect |
| --- | --- | --- |
| `--genshin-bg-z` | `0` | Stacking level of the scene layer. `0` keeps it behind app content. |
| `--genshin-bg-scrim` | `rgba(8,10,20,0.42)` | Legibility scrim over the content panels; raise toward `rgba(0,0,0,0.7)` for more contrast, `rgba(0,0,0,0)` to show the raw scene. |
| `--genshin-bg-fallback` | `#000` | Colour shown for the instant before the iframe paints. |

## Limitations

- Renders only in the DSH web/desktop client; it is not a system wallpaper.
- The backdrop sits behind app content (`z-index: 0`) and ignores pointer events,
  so it cannot be clicked or focused.
- It overrides the DSH shell-chrome background to `transparent` so the scene shows
  through; if a future DSH release renames the frame classes, re-apply that rule
  against the new markup.
- If the scene assets fail to load, the layer stays a plain black panel (the
  fallback colour) and the app UI is unaffected.

## User settings

Two round buttons sit in the bottom-right corner, at 35% opacity until hovered:

- **Eye** hides or shows the backdrop.
- **Gear** opens a small settings panel with the same switch plus two sliders:

| Setting | Effect | Default |
| --- | --- | --- |
| Show backdrop | Hides the scene layer entirely | on |
| Panel frost | Opacity of the frost over the scene on the app panels | 55% |
| Composer frost | Opacity of the frost on the composer input card | 75% |

`Reset` returns all three to their defaults. The panel closes on `Escape`, on a
click outside it, or by pressing the gear again. Values apply live, with no
reload and no restart, and are stored per browser profile in `localStorage`
under `dsh-genshin-launch:settings` as `{"visible":boolean,"panel":0-100,"card":0-100}`.
A value written by an earlier build under `dsh-genshin-bg:visible` is migrated
on first load.

While the backdrop is hidden, the frosted shell backgrounds return to the theme
variable `--dsw-alias-bg-base`, so the app looks exactly as it would without
this plugin, and the WebGL scene stops rendering because Chromium does not paint
a `display: none` frame.

Both frost strengths are also plain CSS variables, so a user stylesheet can
override them without the panel: `--genshin-bg-panel` and `--genshin-bg-card`.

Disabling the plugin itself in Settings -> Plugins is a separate, stronger
switch that also removes the host route.
