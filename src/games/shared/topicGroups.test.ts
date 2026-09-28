import { describe, expect, it } from "vitest";
import type { Topic } from "@/content/schema";
import { groupTopics } from "./topicGroups";

const topic = (id: string): Topic => ({ id, icon: "", color: "sky", names: { en: id, vi: id, "zh-Hans": id, ja: id } });
const all = ["a", "b", "c", "d", "e", "tiny"].map(topic);
const wordCount = (id: string) => (id === "tiny" ? 2 : 10);

describe("groupTopics", () => {
  it("puts seasonal, then recent, then the rest, each topic once", () => {
    const g = groupTopics(all, { featuredIds: ["c"], recentIds: ["c", "a", null, "a", "e"], wordCount });
    expect(g.season.map((t) => t.id)).toEqual(["c"]);
    expect(g.recent.map((t) => t.id)).toEqual(["a", "e"]);
    expect(g.rest.map((t) => t.id)).toEqual(["b", "d"]);
  });

  it("limits recent topics and hides topics too small to play", () => {
    const g = groupTopics(all, { featuredIds: [], recentIds: ["tiny", "a", "b", "c", "d"], wordCount, maxRecent: 2 });
    expect(g.recent.map((t) => t.id)).toEqual(["a", "b"]);
    expect([...g.season, ...g.recent, ...g.rest].some((t) => t.id === "tiny")).toBe(false);
  });
});
