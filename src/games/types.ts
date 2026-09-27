import type { TopicColor } from "@/content/schema";

/**
 * Every mini game describes itself with a manifest. The home page lists games
 * from the registry, so a new game = new folder + manifest + registry entry.
 * Display name/description live in messages under `games.<id>`.
 */
export type GameManifest = {
  id: string;
  icon: string;
  color: TopicColor;
  href: `/games/${string}`;
  modes: readonly string[];
  status: "ready" | "soon";
};
