// Lists Fluent Emoji images that content may use (allowed by the blocklist).
// Usage:
//   npm run content:catalog                      unused images, grouped
//   npm run content:catalog -- --search moon     search names/keywords
//   npm run content:catalog -- --group "Food & Drink"
//   npm run content:catalog -- --all             include images already used
import fs from "node:fs";

const args = process.argv.slice(2);
const arg = (name) => {
  const i = args.indexOf(name);
  return i >= 0 ? args[i + 1] : undefined;
};
const catalog = JSON.parse(fs.readFileSync("src/content/data/fluent-catalog.json", "utf8"));
const used = new Set(
  JSON.parse(fs.readFileSync("src/content/data/concepts.json", "utf8")).flatMap((c) =>
    c.images.map((i) => i.sourceRef),
  ),
);

const search = arg("--search")?.toLowerCase();
const group = arg("--group");
const rows = catalog.filter(
  (e) =>
    (args.includes("--all") || !used.has(e.name)) &&
    (!group || e.group === group) &&
    (!search || e.name.toLowerCase().includes(search) || e.keywords.some((k) => k.toLowerCase().includes(search))),
);

const byGroup = new Map();
for (const e of rows) byGroup.set(e.group, [...(byGroup.get(e.group) ?? []), e]);
for (const [g, list] of byGroup) {
  console.log(`\n## ${g} (${list.length})`);
  for (const e of list) console.log(`${e.name}${used.has(e.name) ? "  [used]" : ""}  — ${e.keywords.join(", ")}`);
}
console.log(`\n${rows.length} image(s). ${used.size} used of ${catalog.length} allowed.`);
