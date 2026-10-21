import { readdirSync, statSync } from "node:fs";
import { join } from "node:path";

const limits = { javascript: 250 * 1024, css: 80 * 1024 };
const totals = readdirSync("dist/assets").reduce((result, file) => {
  const size = statSync(join("dist/assets", file)).size;
  if (file.endsWith(".js")) result.javascript += size;
  if (file.endsWith(".css")) result.css += size;
  return result;
}, { javascript: 0, css: 0 });

for (const [type, size] of Object.entries(totals)) {
  const limit = limits[type];
  console.log(`${type}: ${(size / 1024).toFixed(1)} KiB / ${(limit / 1024).toFixed(0)} KiB`);
  if (size > limit) process.exitCode = 1;
}
