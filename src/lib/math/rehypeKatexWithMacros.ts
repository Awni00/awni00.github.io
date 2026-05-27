import fs from "node:fs";
import matter from "gray-matter";
import rehypeKatex from "rehype-katex";

import { defaultMathMacros, type MathMacros } from "./macros";
import { resolveMathMacros, selectedMathMacroPacks, type MathMacroRegistry } from "./resolve";

type RehypeKatexWithMacrosOptions = {
  defaultMacros?: MathMacros;
  globalMacros?: MathMacros;
  macroPacks?: MathMacroRegistry;
  throwOnError?: boolean;
};

type VFileLike = {
  path?: string;
  history?: string[];
  data?: Record<string, unknown>;
};

const frontmatterCache = new Map<string, unknown>();

export function rehypeKatexWithMacros({
  defaultMacros = defaultMathMacros,
  globalMacros = {},
  macroPacks = {},
  throwOnError = false
}: RehypeKatexWithMacrosOptions = {}) {
  return function transform(tree: unknown, file: VFileLike) {
    const sourcePath = sourceFilePath(file);
    const frontmatter = frontmatterFromFile(file, sourcePath);
    const selectedPacks = selectedMathMacroPacks(frontmatter);
    const macros = resolveMathMacros({
      defaultMacros,
      globalMacros,
      macroPacks,
      selectedPacks,
      sourceLabel: sourcePath ?? "current entry"
    });
    const katexTransform = rehypeKatex({ macros: { ...macros }, throwOnError } as any);
    return (katexTransform as (tree: unknown, file: VFileLike) => unknown)(tree, file);
  };
}

function frontmatterFromFile(file: VFileLike | undefined, sourcePath: string | undefined): unknown {
  const fromData = frontmatterFromData(file?.data);
  if (fromData) return fromData;

  if (!sourcePath || !fs.existsSync(sourcePath)) return undefined;
  const cached = frontmatterCache.get(sourcePath);
  if (cached) return cached;

  const parsed = matter(fs.readFileSync(sourcePath, "utf8")).data;
  frontmatterCache.set(sourcePath, parsed);
  return parsed;
}

function frontmatterFromData(data: Record<string, unknown> | undefined): unknown {
  if (!data) return undefined;
  const astro = data.astro;
  if (isRecord(astro) && isRecord(astro.frontmatter)) return astro.frontmatter;
  if (isRecord(data.frontmatter)) return data.frontmatter;
  if (isRecord(data.matter)) return data.matter;
  return undefined;
}

function sourceFilePath(file: VFileLike | undefined): string | undefined {
  return file?.path ?? file?.history?.[0];
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
