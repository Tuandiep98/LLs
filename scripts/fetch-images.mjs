// Downloads sticker images for concepts whose image source is "fluent-emoji"
// (Microsoft Fluent Emoji, MIT license) into public/content/images.
// Usage: node scripts/fetch-images.mjs
import fs from "node:fs";
import path from "node:path";

const BASE = "https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets";
const concepts = JSON.parse(fs.readFileSync("src/content/data/concepts.json", "utf8"));

function candidates(name) {
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "_");
  const dir = encodeURIComponent(name);
  return [
    `${BASE}/${dir}/3D/${slug}_3d.png`,
    `${BASE}/${dir}/Default/3D/${slug}_3d_default.png`,
  ];
}

let failed = 0;
for (const concept of concepts) {
  for (const image of concept.images) {
    if (image.source !== "fluent-emoji") continue;
    const target = path.join("public", image.src);
    if (fs.existsSync(target)) continue;
    let ok = false;
    for (const url of candidates(image.sourceRef)) {
      const res = await fetch(url);
      if (res.ok) {
        fs.mkdirSync(path.dirname(target), { recursive: true });
        fs.writeFileSync(target, Buffer.from(await res.arrayBuffer()));
        ok = true;
        break;
      }
    }
    if (!ok) {
      failed++;
      console.error(`✗ ${concept.id} (${image.sourceRef})`);
    }
  }
}
console.log(failed ? `${failed} image(s) failed` : "All images downloaded");
process.exit(failed ? 1 : 0);
