// Builds src/content/data/fluent-catalog.json: every Fluent Emoji (MIT) that is allowed
// for LLs, with its 3D image path, group and keywords. Content may only use images from
// this catalog. Re-run when the upstream emoji set changes: node scripts/build-fluent-catalog.mjs
import fs from "node:fs";

const REPO = "microsoft/fluentui-emoji";
const blocklist = JSON.parse(fs.readFileSync("src/content/data/blocklist.json", "utf8"));

const treeRes = await fetch(`https://api.github.com/repos/${REPO}/git/trees/main?recursive=1`, {
  headers: { Accept: "application/vnd.github+json" },
});
if (!treeRes.ok) throw new Error(`GitHub API ${treeRes.status}`);
const tree = (await treeRes.json()).tree.map((t) => t.path);

const pngs = new Map();
for (const p of tree) {
  const m = p.match(/^assets\/([^/]+)\/(?:Default\/)?3D\/[^/]+_3d(?:_default)?\.png$/);
  if (m) pngs.set(m[1], p.slice("assets/".length));
}

const names = [...pngs.keys()];
const entries = [];
let next = 0;
async function worker() {
  while (next < names.length) {
    const name = names[next++];
    const res = await fetch(
      `https://raw.githubusercontent.com/${REPO}/main/assets/${encodeURIComponent(name)}/metadata.json`,
    );
    const meta = res.ok ? await res.json() : {};
    entries.push({ name, path: pngs.get(name), group: meta.group ?? "", keywords: meta.keywords ?? [] });
  }
}
await Promise.all(Array.from({ length: 24 }, worker));

export function isAllowedImage(entry) {
  const name = entry.name.toLowerCase();
  if (blocklist.imageGroups.includes(entry.group)) return false;
  if (entry.group === "Symbols" && !blocklist.symbolAllow.some((w) => name.includes(w))) return false;
  return !blocklist.images.some((w) => new RegExp(`\\b${w}\\b`).test(name));
}

const allowed = entries.filter(isAllowedImage).sort((a, b) => a.name.localeCompare(b.name));
fs.writeFileSync("src/content/data/fluent-catalog.json", JSON.stringify(allowed, null, 0).replace(/\},\{/g, "},\n{") + "\n");
console.log(`${allowed.length} of ${entries.length} emoji allowed`);
