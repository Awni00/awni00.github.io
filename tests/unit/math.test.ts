import katex from "katex";
import { describe, expect, it } from "vitest";

import { defaultMathMacros } from "../../src/lib/math/macros";
import { resolveMathMacros, selectedMathMacroPacks } from "../../src/lib/math/resolve";

describe("math macros", () => {
  it("generates calligraphic and blackboard letter shortcuts", () => {
    for (const letter of "ABCDEFGHIJKLMNOPQRSTUVWXYZ") {
      expect(defaultMathMacros[`\\cal${letter}`]).toBe(`\\mathcal{${letter}}`);
      expect(defaultMathMacros[`\\bb${letter}`]).toBe(`\\mathbb{${letter}}`);
    }

    expect(defaultMathMacros["\\cal"]).toBe("\\mathcal{#1}");
    expect(defaultMathMacros["\\bb"]).toBe("\\mathbb{#1}");
  });

  it("defines common delimiters, probability, and expectation helpers", () => {
    expect(defaultMathMacros["\\paren"]).toBe("\\left(#1\\right)");
    expect(defaultMathMacros["\\bracket"]).toBe("\\left[#1\\right]");
    expect(defaultMathMacros["\\norm"]).toBe("\\left\\lVert#1\\right\\rVert");
    expect(defaultMathMacros["\\probunder"]).toBe("\\underset{#1}{\\mathbb{P}}\\left[#2\\right]");
    expect(defaultMathMacros["\\expectunder"]).toBe("\\underset{#1}{\\mathbb{E}}\\left[#2\\right]");
  });

  it("resolves macros in default, global, then selected pack order", () => {
    const macros = resolveMathMacros({
      defaultMacros: { "\\A": "default", "\\B": "default" },
      globalMacros: { "\\B": "global", "\\C": "global" },
      macroPacks: {
        first: { "\\C": "first", "\\D": "first" },
        second: { "\\D": "second", "\\E": "second" }
      },
      selectedPacks: ["first", "second"]
    });

    expect(macros).toEqual({
      "\\A": "default",
      "\\B": "global",
      "\\C": "first",
      "\\D": "second",
      "\\E": "second"
    });
  });

  it("extracts selected macro packs from frontmatter", () => {
    expect(selectedMathMacroPacks({ math: { macros: ["paper", "appendix"] } })).toEqual([
      "paper",
      "appendix"
    ]);
    expect(selectedMathMacroPacks({ math: { macros: ["paper", 1, false] } })).toEqual(["paper"]);
    expect(selectedMathMacroPacks({})).toEqual([]);
  });

  it("rejects unknown macro packs with available pack names", () => {
    expect(() =>
      resolveMathMacros({
        macroPacks: { paper: {} },
        selectedPacks: ["missing"],
        sourceLabel: "example.mdx"
      })
    ).toThrow(/Unknown math macro pack "missing" in example\.mdx\. Available packs: paper\./);
  });

  it("renders representative generic macros with strict KaTeX errors", () => {
    expect(() =>
      katex.renderToString(
        "\\probunder{x \\simiid \\calD}{\\norm{x}_2 > 1} + \\expect{\\inner{u}{v}} + \\bbR",
        { macros: { ...defaultMathMacros }, throwOnError: true }
      )
    ).not.toThrow();
  });
});
