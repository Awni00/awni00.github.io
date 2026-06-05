import path from "node:path";

export type PlotlyFigureReference = {
  sourceFile: string;
  src: string;
  htmlPath: string;
};

const plotlyFigureTagPattern = /<PlotlyFigure\b[\s\S]*?>/g;
const staticSrcPattern =
  /\bsrc\s*=\s*(?:"([^"]+)"|'([^']+)'|{\s*["']([^"']+)["']\s*})/;
const mathJaxPattern = /mathjax/i;
const plotlyPattern =
  /(?:Plotly\.newPlot|window\.Plotly|plotly(?:\.js|-latest|-min)?)/i;
const dollarTexPattern = /(^|[^\\])\$[^$\n]{1,300}\$/;
const texCommandPattern =
  /\\(?:alpha|beta|gamma|delta|epsilon|zeta|eta|theta|lambda|mu|pi|rho|sigma|tau|phi|omega|sum|int|prod|frac|sqrt|left|right|mathrm|mathbf|mathbb|mathcal|text|hat|bar|tilde|cdot|times|leq|geq|neq)\b/;

export function extractPlotlyFigureSources(source: string): string[] {
  return [...source.matchAll(plotlyFigureTagPattern)]
    .map((match) => match[0].match(staticSrcPattern)?.slice(1).find(Boolean))
    .filter((src): src is string => Boolean(src));
}

export function resolveRootRelativePublicHtmlPath(
  src: string,
  publicDir = "public",
): string | null {
  const [pathname] = src.split(/[?#]/);
  if (!pathname.startsWith("/") || !pathname.toLowerCase().endsWith(".html"))
    return null;

  const publicRoot = path.resolve(publicDir);
  const htmlPath = path.resolve(publicRoot, pathname.replace(/^\/+/, ""));
  if (
    htmlPath === publicRoot ||
    !htmlPath.startsWith(`${publicRoot}${path.sep}`)
  )
    return null;
  return htmlPath;
}

export function findPlotlyFigureReferences(
  sourceFile: string,
  source: string,
  publicDir = "public",
): PlotlyFigureReference[] {
  return extractPlotlyFigureSources(source)
    .map((src) => {
      const htmlPath = resolveRootRelativePublicHtmlPath(src, publicDir);
      return htmlPath ? { sourceFile, src, htmlPath } : null;
    })
    .filter(
      (reference): reference is PlotlyFigureReference => reference !== null,
    );
}

export function plotlyHtmlNeedsMathJax(html: string): boolean {
  return (
    plotlyPattern.test(html) &&
    hasTexLikeMath(html) &&
    !mathJaxPattern.test(html)
  );
}

function hasTexLikeMath(html: string): boolean {
  return dollarTexPattern.test(html) || texCommandPattern.test(html);
}
