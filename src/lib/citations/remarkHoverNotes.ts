import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { visit } from "unist-util-visit";

/**
 * Page-level wiring for `<HoverNote>` and `<Term>`, done at build time because a
 * component cannot see its siblings or its page's frontmatter:
 *
 *   - Numbers every note without an explicit `mark` in document order, once
 *     per page. A `cite` key that was already numbered reuses its number.
 *   - Resolves frontmatter `bibliography:` (one path or a list, relative to the
 *     page file) to absolute paths and hands them to each citing note.
 *   - Applies frontmatter `hoverNotes:` defaults (`marker`, `appearance`) to
 *     notes that do not set their own.
 *   - Applies frontmatter `terms:` defaults (`underline`), and the shared
 *     `hoverNotes.appearance`, to `<Term>`s. Terms are never numbered.
 */

type JsxAttribute = { type: string; name?: string; value?: unknown };
type JsxNode = { type: string; name?: string | null; attributes?: JsxAttribute[] };
type VFileLike = { path?: string; data?: { astro?: { frontmatter?: Record<string, unknown> } } };

type HoverNoteFrontmatter = {
  bibliography?: string | string[];
  hoverNotes?: { marker?: string; appearance?: string };
  terms?: { underline?: string };
};

export function remarkHoverNotes() {
  return function transform(tree: unknown, file: VFileLike) {
    const notes: JsxNode[] = [];
    const terms: JsxNode[] = [];
    visit(tree as never, (node: JsxNode) => {
      if (node.type !== "mdxJsxTextElement" && node.type !== "mdxJsxFlowElement") return;
      if (node.name === "HoverNote") notes.push(node);
      else if (node.name === "Term") terms.push(node);
    });
    if (notes.length === 0 && terms.length === 0) return;

    const frontmatter = readFrontmatter(file);
    const noteDefaults = frontmatter.hoverNotes ?? {};
    const termDefaults = frontmatter.terms ?? {};
    const bibliography = notes.length > 0 ? resolveBibliography(frontmatter.bibliography, file.path) : [];
    const numberByCite = new Map<string, string>();
    let next = 1;

    for (const note of notes) {
      const { has, set, get } = attributesOf(note);
      const cite = get("cite");

      if (!has("mark")) {
        const reused = typeof cite === "string" ? numberByCite.get(cite) : undefined;
        const mark = reused ?? String(next++);
        if (typeof cite === "string") numberByCite.set(cite, mark);
        set("mark", mark);
      }
      if (cite !== undefined && bibliography.length > 0 && !has("bibliography")) {
        set("bibliography", JSON.stringify(bibliography));
      }
      if (noteDefaults.marker && !has("marker")) set("marker", noteDefaults.marker);
      if (noteDefaults.appearance && !has("appearance")) set("appearance", noteDefaults.appearance);
    }

    for (const term of terms) {
      const { has, set } = attributesOf(term);
      if (termDefaults.underline && !has("underline")) set("underline", termDefaults.underline);
      if (noteDefaults.appearance && !has("appearance")) set("appearance", noteDefaults.appearance);
    }
  };
}

function attributesOf(node: JsxNode) {
  const attributes = (node.attributes ??= []);
  return {
    has: (name: string) => attributes.some((attribute) => attribute.name === name),
    get: (name: string) => attributes.find((attribute) => attribute.name === name)?.value,
    set: (name: string, value: string) => attributes.push({ type: "mdxJsxAttribute", name, value })
  };
}

function readFrontmatter(file: VFileLike): HoverNoteFrontmatter {
  const fromAstro = file.data?.astro?.frontmatter;
  if (fromAstro) return fromAstro as HoverNoteFrontmatter;
  if (!file.path) return {};
  try {
    return matter(fs.readFileSync(file.path, "utf8")).data as HoverNoteFrontmatter;
  } catch {
    return {};
  }
}

function resolveBibliography(value: string | string[] | undefined, sourcePath: string | undefined): string[] {
  if (!value) return [];
  const base = sourcePath ? path.dirname(sourcePath) : process.cwd();
  return (Array.isArray(value) ? value : [value]).map((entry) => {
    const resolved = path.resolve(base, entry);
    if (!fs.existsSync(resolved)) {
      throw new Error(`bibliography: "${entry}" not found (looked for ${resolved}, from ${sourcePath ?? "?"}).`);
    }
    return resolved;
  });
}
