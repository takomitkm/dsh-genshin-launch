import { readFile, stat } from "node:fs/promises";
import { createReadStream } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, extname, join, normalize, sep } from "node:path";
//#region src/index.ts
const name = "genshin-launch";
const inject = ["webServer"];
const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "public", "genshin-bg");
const MIME = {
	".html": "text/html; charset=utf-8",
	".js": "text/javascript; charset=utf-8",
	".mjs": "text/javascript; charset=utf-8",
	".css": "text/css; charset=utf-8",
	".glb": "model/gltf-binary",
	".gltf": "model/gltf+json",
	".png": "image/png",
	".jpg": "image/jpeg",
	".jpeg": "image/jpeg",
	".ico": "image/x-icon",
	".svg": "image/svg+xml",
	".json": "application/json",
	".wasm": "application/wasm"
};
function apply(ctx) {
	return ctx.webServer.register({
		kind: "prefix",
		path: "/genshin-bg",
		async handler(req, res) {
			try {
				const rawUrl = req.url ?? "/";
				let rel = normalize(decodeURIComponent(new URL(rawUrl, "http://localhost").pathname).replace(/^\/genshin-bg\/?/, "").replace(/^[/\\]+/, ""));
				if (rel === "." || rel === "" || rel === "/") rel = "index.html";
				const file = normalize(join(ROOT, rel));
				if (file !== ROOT && !file.startsWith(ROOT + sep)) {
					res.writeHead(403);
					res.end("forbidden");
					return;
				}
				if ((await stat(file)).isDirectory()) {
					res.writeHead(404);
					res.end("not found");
					return;
				}
				const ext = extname(file).toLowerCase();
				if (ext === ".html") {
					let html = await readFile(file, "utf-8");
					if (!/<base[\s>]/i.test(html)) html = html.replace(/<head>/i, "<head>\n  <base href=\"/genshin-bg/\">");
					res.writeHead(200, {
						"content-type": MIME[".html"],
						"cache-control": "no-cache"
					});
					res.end(html);
					return;
				}
				res.writeHead(200, {
					"content-type": MIME[ext] ?? "application/octet-stream",
					"cache-control": "public, max-age=3600"
				});
				createReadStream(file).pipe(res);
			} catch {
				res.writeHead(404);
				res.end("not found");
			}
		}
	});
}
//#endregion
export { apply, inject, name };
