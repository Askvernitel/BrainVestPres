// Renders tools/demo-video/scene.html frame by frame via the Chrome DevTools Protocol (no npm deps).
import { spawn } from "node:child_process";
import { writeFileSync } from "node:fs";
const [chrome, sceneUrl, outDir] = process.argv.slice(2);
const FPS = 30, PORT = 9333;
const proc = spawn(chrome, ["--no-sandbox", "--hide-scrollbars", `--remote-debugging-port=${PORT}`, "--window-size=1920,1080", "about:blank"], { stdio: "ignore" });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let targets;
for (let i = 0; i < 50; i++) { try { targets = await (await fetch(`http://127.0.0.1:${PORT}/json/list`)).json(); break; } catch { await sleep(200); } }
const ws = new WebSocket(targets.find((t) => t.type === "page").webSocketDebuggerUrl);
await new Promise((r) => ws.addEventListener("open", r, { once: true }));
let id = 0; const pending = new Map();
ws.addEventListener("message", (e) => { const m = JSON.parse(e.data); if (m.id && pending.has(m.id)) { pending.get(m.id)(m); pending.delete(m.id); } });
const send = (method, params = {}) => new Promise((r) => { const i = ++id; pending.set(i, r); ws.send(JSON.stringify({ id: i, method, params })); });
const ev = async (expr) => { const r = await send("Runtime.evaluate", { expression: expr, awaitPromise: true, returnByValue: true }); if (r.result.exceptionDetails) throw new Error(JSON.stringify(r.result.exceptionDetails)); return r.result.result.value; };
await send("Emulation.setDeviceMetricsOverride", { width: 1920, height: 1080, deviceScaleFactor: 1, mobile: false });
await send("Page.navigate", { url: sceneUrl });
for (let i = 0; i < 100 && !(await ev("typeof window.renderAt === 'function' && document.readyState === 'complete'").catch(() => false)); i++) await sleep(100);
await ev("document.fonts.ready.then(() => true)");
await sleep(500);
const n = Math.round((await ev("window.DURATION")) * FPS);
for (let i = 0; i < n; i++) {
  await ev(`renderAt(${i / FPS}); true`);
  const { result } = await send("Page.captureScreenshot", { format: "jpeg", quality: 95 });
  writeFileSync(`${outDir}/f${String(i).padStart(4, "0")}.jpg`, Buffer.from(result.data, "base64"));
}
console.log("frames:", n);
ws.close(); proc.kill();
