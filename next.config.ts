import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";
import { contentSecurityPolicy } from "./src/lib/csp";

// GITHUB_PAGES=true builds a fully static site under /LLs (see .github/workflows/pages.yml).
// Without it, the app builds normally for a Node host such as Vercel.
const isPages = process.env.GITHUB_PAGES === "true";
const basePath = isPages ? "/LLs" : "";
const isDev = process.env.NODE_ENV !== "production";

const nextConfig: NextConfig = {
  images: { unoptimized: true },
  env: { NEXT_PUBLIC_BASE_PATH: basePath, NEXT_PUBLIC_STATIC_EXPORT: isPages ? "true" : "" },
  ...(isPages
    ? { output: "export", basePath, trailingSlash: true }
    : {
        async headers() {
          return [
            {
              source: "/:path*",
              headers: [
                { key: "Content-Security-Policy", value: contentSecurityPolicy({ dev: isDev, frameAncestors: true }) },
                { key: "X-Content-Type-Options", value: "nosniff" },
                { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
                { key: "X-Frame-Options", value: "DENY" },
                {
                  key: "Permissions-Policy",
                  value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
                },
              ],
            },
          ];
        },
      }),
};

export default createNextIntlPlugin("./src/i18n/request.ts")(nextConfig);
