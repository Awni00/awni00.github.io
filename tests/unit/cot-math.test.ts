import katex from "katex";
import { describe, expect, it } from "vitest";

import { defaultMathMacros } from "../../src/lib/math/macros";
import { resolveMathMacros } from "../../src/lib/math/resolve";
import { mathMacroPacks } from "../../src/site/math";

describe("CoT math macros", () => {
  const macros = resolveMathMacros({
    defaultMacros: defaultMathMacros,
    macroPacks: mathMacroPacks,
    selectedPacks: ["cot-info"]
  });

  it("keeps CoT-specific notation in the cot-info macro pack", () => {
    expect(mathMacroPacks["cot-info"]["\\CoT"]).toBe("\\mathrm{CoT}");
    expect(mathMacroPacks["cot-info"]["\\cotinfodomain"]).toBe("\\mathcal{I}_{#1}^{\\CoT}");
    expect(defaultMathMacros["\\CoT"]).toBeUndefined();
  });

  it("renders representative CoT formulas with strict KaTeX errors", () => {
    const formulas = [
      "\\cotinfodomain{\\calD}(\\epsilon; \\calH) := \\inf_{h \\in \\Deltaete_{\\calD}(\\epsilon; \\calH)} \\set{- \\log \\probunder{x,y,z \\sim \\calD}{(\\hcot{h}(x), \\hete{h}(x)) = (y, z)}}",
      "\\CoTCons(S; \\calH) := \\set{h \\in \\calH : \\hete{h}(x_i) = y_i, \\hcot{h}(x_i) = z_i}",
      "\\forall h \\in \\CoTCons(S; \\calH), \\ \\eterisk{\\calD}(h) \\leq \\epsilon",
      "m(\\epsilon, \\delta) = \\bigO\\!\\paren{\\frac{\\VC(\\calLCoT(\\calH)) + \\log(1 / \\delta)}{\\cotinfodomain{\\calD}(\\epsilon; \\calH)}}"
    ];

    for (const formula of formulas) {
      expect(() => katex.renderToString(formula, { macros: { ...macros }, throwOnError: true })).not.toThrow();
    }
  });
});
