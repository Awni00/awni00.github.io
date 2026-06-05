import path from "node:path";
import { describe, expect, it } from "vitest";

import {
  extractPlotlyFigureSources,
  findPlotlyFigureReferences,
  plotlyHtmlNeedsMathJax,
  resolveRootRelativePublicHtmlPath,
} from "../../src/lib/article/plotlyValidation";

describe("Plotly figure validation", () => {
  it("extracts static PlotlyFigure sources", () => {
    expect(
      extractPlotlyFigureSources(`
        <PlotlyFigure src="/figures/a.html" iframeTitle="A" />
        <PlotlyFigure src={'/figures/b.html'} iframeTitle="B" />
        <PlotlyFigure src={dynamicSrc} iframeTitle="C" />
      `),
    ).toEqual(["/figures/a.html", "/figures/b.html"]);
  });

  it("resolves root-relative public HTML paths safely", () => {
    expect(
      resolveRootRelativePublicHtmlPath("/writing/foo/plot.html?cache=1"),
    ).toBe(path.resolve("public/writing/foo/plot.html"));
    expect(
      resolveRootRelativePublicHtmlPath("https://example.com/plot.html"),
    ).toBeNull();
    expect(
      resolveRootRelativePublicHtmlPath("/writing/foo/plot.svg"),
    ).toBeNull();
    expect(resolveRootRelativePublicHtmlPath("/../secret.html")).toBeNull();
  });

  it("finds only local PlotlyFigure references", () => {
    expect(
      findPlotlyFigureReferences(
        "src/content/writing/example.mdx",
        `
          <PlotlyFigure src="/figures/a.html" iframeTitle="A" />
          <PlotlyFigure src="https://example.com/b.html" iframeTitle="B" />
        `,
      ),
    ).toEqual([
      {
        sourceFile: "src/content/writing/example.mdx",
        src: "/figures/a.html",
        htmlPath: path.resolve("public/figures/a.html"),
      },
    ]);
  });

  it("warns for Plotly TeX HTML without MathJax", () => {
    expect(
      plotlyHtmlNeedsMathJax(`
        <script src="https://cdn.plot.ly/plotly-latest.min.js"></script>
        <script>Plotly.newPlot("plot", [{name: "$\\alpha$"}]);</script>
      `),
    ).toBe(true);
  });

  it("does not warn when MathJax is present or the HTML is not Plotly", () => {
    expect(
      plotlyHtmlNeedsMathJax(`
        <script src="https://cdn.plot.ly/plotly-latest.min.js"></script>
        <script src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-svg.js"></script>
        <script>Plotly.newPlot("plot", [{name: "$\\alpha$"}]);</script>
      `),
    ).toBe(false);
    expect(plotlyHtmlNeedsMathJax(`<p>$\\alpha$</p>`)).toBe(false);
  });
});
