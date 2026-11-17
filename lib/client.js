window.__ModuleLoader__.load({
	id: "@takomitkm/dsh-genshin-launch",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
		Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
		//#region src/client/index.ts
		const SOURCE = "@takomitkm/dsh-genshin-launch";
		// The DSH web-client AppFrame paints an OPAQUE background over the whole
		// viewport. A backdrop placed behind it would never be visible unless the
		// shell chrome is made translucent first. For a LIVE WebGL scene we cannot
		// use a CSS background-image, so we inject a fixed full-screen iframe layer
		// BEHIND the app and frost the shell chrome so the scene shows through.
		//
		// DSH's class names come from CSS modules: a per-build hash plus a stable
		// semantic suffix (`_frame`, `_sidebarCol`, `_centerCol`, `_mainPanel`,
		// `_headline`, `_composer*`). Only the suffix is stable — a DSH update that
		// reshuffles the hashes (observed: `mP3x-q_frame` -> `an3WzG_root` -> back)
		// would silently defeat a hardcoded selector and leave an opaque shell over
		// the backdrop. Match the suffix instead.
		//
		// User settings (no keyboard shortcut): the gear button in the bottom-right
		// opens an in-page panel with the visibility switch and the two frost
		// strengths. Values persist in localStorage per browser profile, so each
		// user keeps their own look, and they survive reloads and restarts.
		const STYLE = `
  :root {
    --genshin-bg-z: 0;
    --genshin-bg-panel: rgba(255, 255, 255, 0.55);
    --genshin-bg-card: rgba(255, 255, 255, 0.75);
    --genshin-bg-fallback: #000;
  }
  [data-genshin-bg] {
    position: fixed;
    inset: 0;
    z-index: var(--genshin-bg-z, 0);
    pointer-events: none;
    overflow: hidden;
    background: var(--genshin-bg-fallback, #000);
    transition: opacity 900ms ease;
  }
  /* Once a conversation has messages the wallpaper steps back: the scene fades
     out while the shell returns to the theme's own background. Triggered by the
     absence of the hero composer ("_composerHero"), which DSH only renders on an
     empty conversation — a hash-independent signal. */
  html[data-genshin-bg-faded] [data-genshin-bg] {
    opacity: 0;
  }
  [class*="_frame"],
  [class*="_sidebarCol"],
  [class*="_centerCol"],
  [class*="_mainPanel"] {
    transition: background-color 900ms ease;
  }
  html[data-genshin-bg-faded] [class*="_frame"],
  html[data-genshin-bg-faded] [class*="_sidebarCol"],
  html[data-genshin-bg-faded] [class*="_centerCol"],
  html[data-genshin-bg-faded] [class*="_mainPanel"] {
    background: var(--dsw-alias-bg-base, #fff) !important;
  }
  [data-genshin-bg] iframe {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    border: 0;
    display: block;
  }
  /* Shell chrome: hash-agnostic. The "_frame" class covers the layout frame that
     paints the opaque base colour; the two columns are cleared and then re-painted
     with the tunable frost so text stays legible over the scene. */
  [class*="_frame"],
  [class*="_sidebarCol"],
  [class*="_centerCol"] {
    background: transparent !important;
  }
  [class*="_sidebarCol"],
  [class*="_centerCol"],
  [class*="_mainPanel"] {
    background: var(--genshin-bg-panel, rgba(255, 255, 255, 0.55)) !important;
  }
  /* A single build can mix packages compiled at different times, so several
     module roots with their own opaque background coexist (observed: an3WzG_root
     rgb(255,255,255), wtg9ga_root rgb(249,250,251), _emptyTabHost_* white). Clear
     them inside the shell so the columns' frost is what shows through. */
  [class*="_sidebarCol"] [class*="_root"],
  [class*="_centerCol"] [class*="_root"],
  [class*="_mainPanel"] [class*="_root"],
  [class*="_emptyTabHost"] {
    background: transparent !important;
  }
  /* The hero title banner (DSH brand slogan + preview badge) is removed at
     runtime by hideHeroBanner(): its hashed class name is not stable, and it has
     no semantic suffix of its own beyond "_headline". */
  [data-genshin-bg-hidden] {
    display: none !important;
  }
  /* Backdrop hidden: restore the theme's own opaque backgrounds and drop the
     scene layer, so nothing leaks through and the app reads as unmodified. */
  html[data-genshin-bg-off] [data-genshin-bg] {
    display: none !important;
  }
  html[data-genshin-bg-off] [class*="_frame"],
  html[data-genshin-bg-off] [class*="_sidebarCol"],
  html[data-genshin-bg-off] [class*="_centerCol"],
  html[data-genshin-bg-off] [class*="_mainPanel"] {
    background: var(--dsw-alias-bg-base, #fff) !important;
  }
  /* Controls: two quiet round buttons in the bottom-right corner. */
  [data-genshin-bg-ui] {
    position: fixed;
    right: 14px;
    bottom: 14px;
    z-index: 2147483000;
    display: flex;
    align-items: center;
    gap: 6px;
    font: 12px/1.4 system-ui, -apple-system, "Segoe UI", sans-serif;
  }
  [data-genshin-bg-ui] .gb-btn {
    width: 26px;
    height: 26px;
    padding: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 1px solid rgba(128, 128, 128, 0.35);
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.55);
    color: rgba(60, 60, 60, 0.85);
    cursor: pointer;
    opacity: 0.35;
    transition: opacity 120ms ease;
    -webkit-backdrop-filter: blur(6px);
    backdrop-filter: blur(6px);
  }
  [data-genshin-bg-ui] .gb-btn:hover,
  [data-genshin-bg-ui] .gb-btn:focus-visible,
  [data-genshin-bg-ui][data-open] .gb-btn {
    opacity: 1;
  }
  [data-genshin-bg-ui] .gb-btn svg {
    width: 14px;
    height: 14px;
    display: block;
  }
  [data-genshin-bg-ui] .gb-eye-off {
    display: none;
  }
  html[data-genshin-bg-off] [data-genshin-bg-ui] .gb-eye {
    display: none;
  }
  html[data-genshin-bg-off] [data-genshin-bg-ui] .gb-eye-off {
    display: block;
  }
  /* The settings panel. */
  [data-genshin-bg-ui] .gb-settings {
    position: absolute;
    right: 0;
    bottom: 34px;
    width: 216px;
    padding: 12px 12px 10px;
    border: 1px solid rgba(128, 128, 128, 0.28);
    border-radius: 10px;
    background: rgba(255, 255, 255, 0.92);
    color: #1f2328;
    box-shadow: 0 6px 24px rgba(0, 0, 0, 0.16);
    -webkit-backdrop-filter: blur(10px);
    backdrop-filter: blur(10px);
    display: none;
  }
  [data-genshin-bg-ui][data-open] .gb-settings {
    display: block;
  }
  [data-genshin-bg-ui] .gb-title {
    font-weight: 600;
    font-size: 12px;
    margin-bottom: 8px;
    opacity: 0.9;
  }
  [data-genshin-bg-ui] .gb-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    margin: 7px 0;
  }
  [data-genshin-bg-ui] .gb-row label {
    flex: 1 1 auto;
    min-width: 0;
  }
  [data-genshin-bg-ui] .gb-row .gb-val {
    flex: 0 0 auto;
    font-variant-numeric: tabular-nums;
    opacity: 0.65;
    font-size: 11px;
  }
  [data-genshin-bg-ui] input[type="range"] {
    width: 100%;
    margin: 0;
    accent-color: #3b6fd4;
  }
  [data-genshin-bg-ui] input[type="checkbox"] {
    margin: 0;
    accent-color: #3b6fd4;
  }
  [data-genshin-bg-ui] .gb-slider {
    display: block;
    margin: 0 0 8px;
  }
  [data-genshin-bg-ui] .gb-actions {
    display: flex;
    justify-content: flex-end;
    gap: 8px;
    margin-top: 10px;
    padding-top: 8px;
    border-top: 1px solid rgba(128, 128, 128, 0.2);
  }
  [data-genshin-bg-ui] .gb-reset {
    font: inherit;
    padding: 3px 8px;
    border: 1px solid rgba(128, 128, 128, 0.35);
    border-radius: 6px;
    background: transparent;
    color: inherit;
    cursor: pointer;
  }
  [data-genshin-bg-ui] .gb-reset:hover {
    background: rgba(128, 128, 128, 0.12);
  }
  `;
		const STORAGE_KEY = "dsh-genshin-launch:settings";
		const OFF_ATTR = "data-genshin-bg-off";
		const FADED_ATTR = "data-genshin-bg-faded";
		// v2: the first build defaulted to a 55% frost, which washed the scene out on
		// a light theme. Existing stored settings are migrated once (see readSettings).
		const SETTINGS_VERSION = 2;
		const DEFAULTS = { visible: true, panel: 25, card: 70 };
		const EYE_ON = '<svg class="gb-eye" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8S1 12 1 12z"/><circle cx="12" cy="12" r="3"/></svg>';
		const EYE_OFF = '<svg class="gb-eye-off" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>';
		const GEAR = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.6a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>';
		const clampPct = (value, fallback) => {
			const n = Number(value);
			if (!Number.isFinite(n)) return fallback;
			return Math.max(0, Math.min(100, Math.round(n)));
		};
		function readSettings() {
			try {
				const raw = globalThis.localStorage?.getItem(STORAGE_KEY);
				if (!raw) {
					// Migrate what earlier builds stored under previous package names.
					const previousSettings = globalThis.localStorage?.getItem("dsh-genshin-wallpaper:settings")
						?? globalThis.localStorage?.getItem("dsh-genshin-bg:settings");
					if (previousSettings) return JSON.parse(previousSettings);
					const legacy = globalThis.localStorage?.getItem("dsh-genshin-bg:visible");
					return { ...DEFAULTS, visible: legacy === "0" ? false : DEFAULTS.visible };
				}
				const parsed = JSON.parse(raw);
				// Older builds stored no version; re-seed their frost with the new
				// defaults but keep the user's visibility choice.
				if (parsed?.v !== SETTINGS_VERSION) {
					return { ...DEFAULTS, visible: typeof parsed?.visible === "boolean" ? parsed.visible : DEFAULTS.visible };
				}
				return {
					visible: typeof parsed?.visible === "boolean" ? parsed.visible : DEFAULTS.visible,
					panel: clampPct(parsed?.panel, DEFAULTS.panel),
					card: clampPct(parsed?.card, DEFAULTS.card)
				};
			} catch {
				return { ...DEFAULTS };
			}
		}
		function writeSettings(settings) {
			try {
				globalThis.localStorage?.setItem(STORAGE_KEY, JSON.stringify({ ...settings, v: SETTINGS_VERSION }));
			} catch {
				/* storage unavailable: settings still apply for this session */
			}
		}
		function copy(settings) {
			const html = document.documentElement;
			if (settings.visible) html.removeAttribute(OFF_ATTR);
			else html.setAttribute(OFF_ATTR, "");
			html.style.setProperty("--genshin-bg-panel", `rgba(255, 255, 255, ${settings.panel / 100})`);
			html.style.setProperty("--genshin-bg-card", `rgba(255, 255, 255, ${settings.card / 100})`);
		}
		// The hero banner (DSH brand slogan + preview badge) has no stable class of
		// its own, so locate it structurally instead: the element carrying
		// `_headline` lives inside the composer hero stack, and the banner is the
		// direct child of that stack. Hiding the child keeps the composer itself.
		function hideHeroBanner() {
			const headline = document.querySelector('[class*="_headline"]');
			if (!headline) return false;
			let node = headline;
			while (node.parentElement) {
				const parentClass = String(node.parentElement.className || "");
				if (/_composer/.test(parentClass)) break;
				node = node.parentElement;
			}
			if (node === document.body || node === document.documentElement) return false;
			node.setAttribute("data-genshin-bg-hidden", "");
			return true;
		}
		// A conversation counts as "live" once DSH stops rendering the hero composer
		// (`_composerHero`): the empty/new-session screen has it, a conversation with
		// messages does not. `sawHeroComposer` guards the first frames, before the app
		// has mounted its UI — otherwise the wallpaper would fade out on boot.
		let sawHeroComposer = false;
		let fadeSleepTimer = 0;
		function syncAutoFade(layer) {
			const hero = !!document.querySelector('[class*="_composerHero"]');
			if (hero) sawHeroComposer = true;
			if (!sawHeroComposer) return;
			const html = document.documentElement;
			if (fadeSleepTimer) {
				clearTimeout(fadeSleepTimer);
				fadeSleepTimer = 0;
			}
			if (hero) {
				html.removeAttribute(FADED_ATTR);
				// Wake before the opacity transition starts, so the fade-in is visible.
				if (layer && layer.style.display === "none") {
					layer.style.display = "";
					layer.getBoundingClientRect();
				}
			} else {
				html.setAttribute(FADED_ATTR, "");
				// Once the fade has finished, stop the scene entirely: on a GPU-less
				// machine the WebGL loop is the most expensive thing on the page.
				fadeSleepTimer = setTimeout(() => {
					fadeSleepTimer = 0;
					if (layer && html.hasAttribute(FADED_ATTR)) layer.style.display = "none";
				}, 1000);
			}
		}
		function text() {
			const zh = (navigator.language || "").toLowerCase().startsWith("zh");
			return zh ? {
				backdrop: "原神背景",
				show: "显示背景",
				panel: "面板浓度",
				card: "输入卡浓度",
				reset: "恢复默认",
				settings: "背景设置",
				eyeOn: "隐藏原神背景",
				eyeOff: "显示原神背景",
				gear: "背景设置"
			} : {
				backdrop: "Genshin backdrop",
				show: "Show backdrop",
				panel: "Panel frost",
				card: "Composer frost",
				reset: "Reset",
				settings: "Backdrop settings",
				eyeOn: "Hide Genshin backdrop",
				eyeOff: "Show Genshin backdrop",
				gear: "Backdrop settings"
			};
		}
		const inject = [];
		function apply(ctx) {
			let styleEl;
			let root;
			let ui;
			ctx.effect(() => {
				const t = text();
				styleEl = document.createElement("style");
				styleEl.dataset.plugin = SOURCE;
				styleEl.textContent = STYLE;
				document.head.appendChild(styleEl);
				let settings = readSettings();
				copy(settings);
				root = document.createElement("div");
				root.dataset.genshinBg = "";
				root.setAttribute("aria-hidden", "true");
				const iframe = document.createElement("iframe");
				iframe.src = "/genshin-bg/index.html";
				iframe.setAttribute("frameborder", "0");
				iframe.setAttribute("scrolling", "no");
				iframe.title = "Genshin ambient background";
				root.appendChild(iframe);
				// Controls: eye (visibility) + gear (settings panel).
				ui = document.createElement("div");
				ui.dataset.genshinBgUi = "";
				ui.innerHTML = `<div class="gb-settings" role="dialog" aria-label="${t.settings}">` +
					`<div class="gb-title">${t.settings}</div>` +
					`<div class="gb-row"><label for="gb-show">${t.show}</label><input id="gb-show" type="checkbox"></div>` +
					`<label class="gb-row gb-slider"><span>${t.panel}</span><span class="gb-val" data-val="panel"></span></label>` +
					`<input type="range" min="0" max="100" step="1" data-input="panel">` +
					`<label class="gb-row gb-slider"><span>${t.card}</span><span class="gb-val" data-val="card"></span></label>` +
					`<input type="range" min="0" max="100" step="1" data-input="card">` +
					`<div class="gb-actions"><button type="button" class="gb-reset">${t.reset}</button></div>` +
					`</div>` +
					`<button type="button" class="gb-btn gb-eye-btn" aria-label="${t.eyeOn}" title="${t.eyeOn}">${EYE_ON}${EYE_OFF}</button>` +
					`<button type="button" class="gb-btn gb-gear-btn" aria-label="${t.gear}" title="${t.gear}" aria-expanded="false">${GEAR}</button>`;
				const settingsEl = ui.querySelector(".gb-settings");
				const eyeBtn = ui.querySelector(".gb-eye-btn");
				const gearBtn = ui.querySelector(".gb-gear-btn");
				const showBox = ui.querySelector("#gb-show");
				const ranges = Array.from(ui.querySelectorAll('input[type="range"]'));
				const values = {
					panel: ui.querySelector('[data-val="panel"]'),
					card: ui.querySelector('[data-val="card"]')
				};
				const resetBtn = ui.querySelector(".gb-reset");
				const sync = () => {
					copy(settings);
					showBox.checked = settings.visible;
					for (const range of ranges) range.value = String(settings[range.dataset.input]);
					values.panel.textContent = settings.panel + "%";
					values.card.textContent = settings.card + "%";
					eyeBtn.setAttribute("aria-label", settings.visible ? t.eyeOn : t.eyeOff);
					eyeBtn.title = settings.visible ? t.eyeOn : t.eyeOff;
				};
				const commit = (patch) => {
					settings = { ...settings, ...patch };
					writeSettings(settings);
					sync();
				};
				eyeBtn.addEventListener("click", (event) => {
					event.preventDefault();
					event.stopPropagation();
					commit({ visible: !settings.visible });
				});
				const setOpen = (open) => {
					if (open) ui.setAttribute("data-open", "");
					else ui.removeAttribute("data-open");
					gearBtn.setAttribute("aria-expanded", String(open));
				};
				gearBtn.addEventListener("click", (event) => {
					event.preventDefault();
					event.stopPropagation();
					setOpen(!ui.hasAttribute("data-open"));
				});
				showBox.addEventListener("change", () => commit({ visible: showBox.checked }));
				for (const range of ranges) {
					range.addEventListener("input", () => commit({ [range.dataset.input]: clampPct(range.value, DEFAULTS[range.dataset.input]) }));
				}
				resetBtn.addEventListener("click", (event) => {
					event.preventDefault();
					event.stopPropagation();
					commit({ ...DEFAULTS });
				});
				// Click outside closes the panel; Escape also closes it.
				const onPointerDown = (event) => {
					if (!ui.hasAttribute("data-open")) return;
					if (ui.contains(event.target)) return;
					setOpen(false);
				};
				const onKeyDown = (event) => {
					if (event.key === "Escape" && ui.hasAttribute("data-open")) setOpen(false);
				};
				document.addEventListener("pointerdown", onPointerDown, true);
				document.addEventListener("keydown", onKeyDown, true);
				settingsEl.addEventListener("pointerdown", (event) => event.stopPropagation());
				sync();
				(document.body ?? document.documentElement).prepend(root);
				(document.body ?? document.documentElement).appendChild(ui);
				// The banner may mount after this plugin runs, and may come back after a
				// route change, so keep looking — debounced, and cheap when it is absent.
				hideHeroBanner();
				syncAutoFade(root);
				let hideTimer = 0;
				const observer = new MutationObserver(() => {
					if (hideTimer) return;
					hideTimer = setTimeout(() => {
						hideTimer = 0;
						hideHeroBanner();
						syncAutoFade(root);
					}, 300);
				});
				observer.observe(document.body ?? document.documentElement, {
					childList: true,
					subtree: true,
					attributes: true,
					attributeFilter: ["class"]
				});
				return () => {
					observer.disconnect();
					if (hideTimer) clearTimeout(hideTimer);
					if (fadeSleepTimer) {
						clearTimeout(fadeSleepTimer);
						fadeSleepTimer = 0;
					}
					for (const el of document.querySelectorAll("[data-genshin-bg-hidden]")) el.removeAttribute("data-genshin-bg-hidden");
					document.documentElement.removeAttribute(FADED_ATTR);
					document.removeEventListener("pointerdown", onPointerDown, true);
					document.removeEventListener("keydown", onKeyDown, true);
					root?.remove();
					root = void 0;
					ui?.remove();
					ui = void 0;
					styleEl?.remove();
					styleEl = void 0;
					document.documentElement.removeAttribute(OFF_ATTR);
					document.documentElement.style.removeProperty("--genshin-bg-panel");
					document.documentElement.style.removeProperty("--genshin-bg-card");
				};
			}, "genshin-bg: ambient loop backdrop");
		}
		//#endregion
		exports.apply = apply;
		exports.inject = inject;
		return module.exports;
	}
});

//# sourceMappingURL=client.js.map
