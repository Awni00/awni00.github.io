import type { MathMacros } from "../lib/math/macros";
import { cotInfoMathMacros } from "./math-packs/cot-info";

export const globalMathMacros: MathMacros = {};

export const mathMacroPacks = {
  "cot-info": cotInfoMathMacros
} satisfies Record<string, MathMacros>;
