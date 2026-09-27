// Static build for GitHub Pages (served under /LLs). The request proxy (src/proxy.ts)
// can't run on static hosting, so it is moved aside during the build; "/" then detects
// the language in the browser instead (src/app/page.tsx).
import { execSync } from "node:child_process";
import fs from "node:fs";

const proxy = "src/proxy.ts";
const parked = "src/proxy.ts.pages-build";
fs.renameSync(proxy, parked);
try {
  execSync("next build", { stdio: "inherit", env: { ...process.env, GITHUB_PAGES: "true" } });
} finally {
  fs.renameSync(parked, proxy);
}
