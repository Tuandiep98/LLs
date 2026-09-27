import type { MetadataRoute } from "next";
import { asset } from "@/lib/basePath";

export const dynamic = "force-static";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "LLs – Play & Learn Languages",
    short_name: "LLs",
    description: "Simple mini games that help kids learn languages with pictures and sounds.",
    start_url: asset("/"),
    display: "standalone",
    orientation: "any",
    background_color: "#fff7e8",
    theme_color: "#ffd23f",
    icons: [
      { src: asset("/icon-192.png"), sizes: "192x192", type: "image/png" },
      { src: asset("/icon-512.png"), sizes: "512x512", type: "image/png" },
      { src: asset("/icon-512.png"), sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
