import { defaultMathMacros, type MathMacros } from "./macros";

export type MathMacroRegistry = Record<string, MathMacros>;

type ResolveMathMacrosOptions = {
  defaultMacros?: MathMacros;
  globalMacros?: MathMacros;
  macroPacks?: MathMacroRegistry;
  selectedPacks?: readonly string[];
  sourceLabel?: string;
};

export function resolveMathMacros({
  defaultMacros = defaultMathMacros,
  globalMacros = {},
  macroPacks = {},
  selectedPacks = [],
  sourceLabel = "current entry"
}: ResolveMathMacrosOptions = {}): MathMacros {
  const resolved = { ...defaultMacros, ...globalMacros };

  for (const packName of selectedPacks) {
    const pack = macroPacks[packName];
    if (!pack) {
      const available = Object.keys(macroPacks).sort();
      const suffix = available.length > 0 ? ` Available packs: ${available.join(", ")}.` : "";
      throw new Error(`Unknown math macro pack "${packName}" in ${sourceLabel}.${suffix}`);
    }
    Object.assign(resolved, pack);
  }

  return resolved;
}

export function selectedMathMacroPacks(frontmatter: unknown): string[] {
  if (!isRecord(frontmatter)) return [];
  const math = frontmatter.math;
  if (!isRecord(math)) return [];
  const macros = math.macros;
  return Array.isArray(macros) ? macros.filter((macro): macro is string => typeof macro === "string") : [];
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
