// Downloads sticker images for concepts whose image source is "fluent-emoji"
// (Microsoft Fluent Emoji, MIT license) into public/content/images.
// The image path comes from src/content/data/fluent-catalog.json.
// Usage: npm run images
import fs from "node:fs";
import path from "node:path";

const BASE = "https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets";
const concepts = JSON.parse(fs.readFileSync("src/content/data/concepts.json", "utf8"));
const catalog = new Map(
  JSON.parse(fs.readFileSync("src/content/data/fluent-catalog.json", "utf8")).map((e) => [e.name, e.path]),
);

let failed = 0;
for (const concept of concepts) {
  for (const image of concept.images) {
    if (image.source !== "fluent-emoji") continue;
    const target = path.join("public", image.src);
    if (fs.existsSync(target)) continue;
    const assetPath = catalog.get(image.sourceRef);
    if (!assetPath) {
      failed++;
      console.error(`✗ ${concept.id}: "${image.sourceRef}" is not in the Fluent catalog`);
      continue;
    }
    const res = await fetch(`${BASE}/${assetPath.split("/").map(encodeURIComponent).join("/")}`);
    if (!res.ok) {
      failed++;
      console.error(`✗ ${concept.id}: download failed (${res.status})`);
      continue;
    }
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.writeFileSync(target, Buffer.from(await res.arrayBuffer()));
    console.log(`✓ ${concept.id}`);
  }
}
console.log(failed ? `${failed} image(s) failed` : "All images present");
process.exit(failed ? 1 : 0);
