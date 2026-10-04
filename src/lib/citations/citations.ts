import fs from "node:fs/promises";

import { publicationsConfig } from "../../config/publications";
import { publicationLinks } from "../publications/formatPublication";
import { arxivUrl } from "../publications/identifierUrls";
import { parseBibtexWithIssues } from "../publications/parseBibtex";
import { UNDATED_YEAR, type Publication } from "../publications/types";

/** What a `<HoverNote cite="…">` shows for one bibliography entry. */
export type Citation = {
  key: string;
  title: string;
  authors: string;
  venue?: string;
  year?: string;
  link?: { label: string; href: string };
};

const bibliographies = new Map<string, Promise<Map<string, Publication>>>();

/**
 * Entries of one BibTeX file by key, parsed once per build. Malformed entries
 * are skipped with a warning, matching the publications page.
 */
export function loadBibliography(file: string): Promise<Map<string, Publication>> {
  let entries = bibliographies.get(file);
  if (!entries) {
    entries = fs.readFile(file, "utf8").then((bibtex) => {
      const { publications, issues } = parseBibtexWithIssues(bibtex);
      for (const issue of issues) {
        console.warn(`[citations] ${file}:${issue.line}: ${issue.message} This entry was skipped.`);
      }
      return new Map(publications.map((publication) => [publication.id, publication]));
    });
    bibliographies.set(file, entries);
  }
  return entries;
}

/**
 * Looks `key` up in the page's own bibliographies first, in order, then in the
 * site's publications file — so a post can cite outside work and the author's
 * own papers without copying either.
 */
export async function resolveCitation(key: string, pageBibliographies: string[] = []): Promise<Citation> {
  const files = [...pageBibliographies, publicationsConfig.source];
  for (const file of files) {
    const publication = (await loadBibliography(file)).get(key);
    if (publication) return formatCitation(publication);
  }
  throw new Error(`<HoverNote cite="${key}">: no entry with that key in ${files.join(", ")}.`);
}

export function formatCitation(publication: Publication): Citation {
  const fields = publication.fields ?? {};
  const eprintArxiv =
    fields.eprint && /arxiv/i.test(fields.archiveprefix ?? fields.eprinttype ?? "") ? fields.eprint : undefined;
  const link =
    publicationLinks(publication)[0] ??
    (eprintArxiv ? { label: "arXiv", href: arxivUrl(eprintArxiv) } : undefined);

  return {
    key: publication.id,
    title: cleanLatex(publication.title),
    authors: formatCitationAuthors(publication.authors.map(cleanLatex)),
    venue: publication.venue ? cleanLatex(publication.venue) : undefined,
    year: publication.year === UNDATED_YEAR ? undefined : publication.year,
    link
  };
}

/** "Ashish Vaswani, Noam Shazeer, et al." — BibTeX's "Last, First" flipped. */
export function formatCitationAuthors(authors: string[], max = 3): string {
  const names = authors.map((name) => {
    const [last, first] = name.split(/,\s*/, 2);
    return first ? `${first} ${last}` : name;
  });
  if (names.length <= max) return names.join(", ");
  return `${names.slice(0, max - 1).join(", ")}, et al.`;
}

const COMBINING_ACCENTS: Record<string, string> = {
  '"': "̈",
  "'": "́",
  "`": "̀",
  "^": "̂",
  "~": "̃",
  "=": "̄",
  ".": "̇",
  u: "̆",
  v: "̌",
  H: "̋",
  c: "̧"
};

const LETTER_COMMANDS: Record<string, string> = {
  ss: "ß",
  o: "ø",
  O: "Ø",
  aa: "å",
  AA: "Å",
  ae: "æ",
  AE: "Æ",
  oe: "œ",
  OE: "Œ",
  l: "ł",
  L: "Ł",
  i: "ı"
};

/**
 * Plain text from the LaTeX that real-world BibTeX carries: `{BERT}` case
 * protection, `{\"o}` accents, `\&`, `--`. Math (`$…$`) is left alone.
 */
export function cleanLatex(value: string): string {
  return value
    .replace(/\\([`'^"~=.uvHc])\s*\{?\s*([A-Za-z])\}?/g, (_, accent: string, letter: string) =>
      `${letter}${COMBINING_ACCENTS[accent]}`.normalize("NFC")
    )
    .replace(/\\(ss|aa|AA|ae|AE|oe|OE|[oOlLi])(?![A-Za-z])\s?/g, (_, command: string) => LETTER_COMMANDS[command])
    .replace(/\\([&%$#_])/g, "$1")
    .replace(/---/g, "—")
    .replace(/--/g, "–")
    .replace(/~/g, " ")
    .replace(/[{}]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}
