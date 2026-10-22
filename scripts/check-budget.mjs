import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

const limits = { initialJavaScript: 250 * 1024, asyncChunk: 300 * 1024, css: 80 * 1024 };
const index = readFileSync("dist/index.html", "utf8");
const initialScripts = new Set([...index.matchAll(/assets\/([^"']+\.js)/g)].map((match) => match[1]));
const totals = readdirSync("dist/assets").reduce((result, file) => {
  const size = statSync(join("dist/assets", file)).size;
  if (file.endsWith(".js") && initialScripts.has(file)) result.initialJavaScript += size;
  if (file.endsWith(".js") && !initialScripts.has(file)) result.asyncChunk = Math.max(result.asyncChunk, size);
  if (file.endsWith(".css")) result.css += size;
  return result;
}, { initialJavaScript: 0, asyncChunk: 0, css: 0 });

for (const [type, size] of Object.entries(totals)) {
  const limit = limits[type];
  console.log(`${type}: ${(size / 1024).toFixed(1)} KiB / ${(limit / 1024).toFixed(0)} KiB`);
  if (size > limit) process.exitCode = 1;
}
