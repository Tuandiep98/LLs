import { describe, expect, it } from "vitest";
import { concepts, getConcept } from "@/content";
import { seededRng } from "@/lib/core/random";
import {
  buildRound,
  buildSummary,
  canBuild,
  createBuild,
  EXTRA_TILES,
  nextTile,
  reduceBuild,
  splitWord,
  wordLayout,
  type BuildState,
} from "./engine";

const cat = getConcept("cat")!;

/** Taps the tile whose text is `text` (first unused one). */
const tapText = (s: BuildState, text: string) =>
  reduceBuild(s, { type: "tap", tile: s.rounds[s.index].tiles.findIndex((t) => !t.used && t.text === text) });

describe("splitWord", () => {
  it("keeps accents with their letter and skips spaces", () => {
    expect(splitWord("con mèo", "vi")).toEqual(["c", "o", "n", "m", "è", "o"]);
    expect(wordLayout("con mèo", "vi")).toEqual([["c", "o", "n"], ["m", "è", "o"]]);
  });

  it("splits Chinese into characters and Japanese into kana syllables", () => {
    expect(splitWord("苹果", "zh-Hans")).toEqual(["苹", "果"]);
    expect(splitWord("きゅう", "ja")).toEqual(["きゅ", "う"]);
    expect(splitWord("ケーキ", "ja")).toEqual(["ケ", "ー", "キ"]);
  });

  it("only builds words of a playable length", () => {
    expect(canBuild(cat, "en")).toBe(true);
    expect(canBuild(cat, "zh-Hans")).toBe(false); // 猫: a single character
    expect(canBuild(getConcept("teddy-bear")!, "en")).toBe(false); // too long
  });
});

describe("word builder", () => {
  it("adds distractor tiles that are not in the word", () => {
    const round = buildRound(cat, concepts, "en", seededRng(1));
    expect(round.pieces).toEqual(["c", "a", "t"]);
    expect(round.tiles).toHaveLength(3 + EXTRA_TILES);
    const extra = round.tiles.map((t) => t.text).filter((x) => !round.pieces.includes(x));
    expect(extra).toHaveLength(EXTRA_TILES);
  });

  it("fills pieces in order, counts mistakes and scores the word", () => {
    let s = createBuild([buildRound(cat, concepts, "en", seededRng(2))]);
    s = tapText(s, "c");
    const wrong = s.rounds[0].tiles.findIndex((t) => t.text !== "a" && !t.used);
    s = reduceBuild(s, { type: "tap", tile: wrong });
    expect(s.phase).toBe("wrong");
    expect(s.mistakes).toBe(1);
    s = reduceBuild(s, { type: "hide" });
    expect(s.rounds[0].tiles[nextTile(s)].text).toBe("a");
    s = tapText(tapText(s, "a"), "t");
    expect(s.phase).toBe("solved");
    expect(s.results[0]).toMatchObject({ conceptId: "cat", mistakes: 1, points: 70 });
    s = reduceBuild(s, { type: "next" });
    expect(s.phase).toBe("done");
    expect(buildSummary(s)).toMatchObject({ total: 1, correct: 0, wrongIds: ["cat"] });
  });

  it("accepts either copy of a repeated letter", () => {
    const tree = { ...cat, id: "x", terms: { en: { text: "bee" } } };
    let s = createBuild([buildRound(tree, [], "en", seededRng(3))]);
    for (const p of ["b", "e", "e"]) s = tapText(s, p);
    expect(s.phase).toBe("solved");
    expect(buildSummary(reduceBuild(s, { type: "next" }))).toMatchObject({ correct: 1, stars: 3 });
  });
});
