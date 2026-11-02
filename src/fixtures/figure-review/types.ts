/**
 * One paper's section of the figure review page (`/fixtures/figures`).
 * Each paper has its own file next to this one, so people working on
 * different papers never edit the same file.
 */

/** How the post shows the figure today. Mirror the post's own markup. */
export type ReviewBefore =
  | { kind: "image"; src: string; invertInDarkMode?: boolean }
  | { kind: "pdf"; src: string; invertInDarkMode?: boolean }
  | { kind: "plotly"; src: string; height?: string }
  | { kind: "embed"; src: string; height?: string }
  | { kind: "none"; reason: string };

export type ReviewEntry = {
  /**
   * `<Chart figure>` id (path under src/site/figures without `.ts`), or with
   * `kind: "diagram"` a `<Diagram figure>` id under src/site/diagrams.
   */
  figure: string;
  kind?: "chart" | "diagram";
  /** Short label for the comparison, e.g. "Learning curves, pairwise order". */
  label: string;
  alt: string;
  before: ReviewBefore;
  /** Shown under the pair: data fidelity, layout changes, open questions. */
  note?: string;
};

export type PaperReview = {
  /** Post slug, matching src/content/writing/<post>.mdx and src/data/figures/<post>/. */
  post: string;
  paper: string;
  /** Section order on the page. */
  order: number;
  entries: ReviewEntry[];
};

export const definePaperReview = (review: PaperReview) => review;
