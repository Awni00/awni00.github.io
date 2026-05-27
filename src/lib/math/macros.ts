export type MathMacros = Record<string, string>;

const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

export const defaultMathMacros: MathMacros = {
  "\\epsilon": "\\varepsilon",

  "\\E": "\\mathbb{E}",
  "\\P": "\\mathbb{P}",
  "\\R": "\\mathbb{R}",
  "\\N": "\\mathbb{N}",
  "\\Z": "\\mathbb{Z}",
  "\\Q": "\\mathbb{Q}",
  "\\C": "\\mathbb{C}",

  "\\KL": "\\mathrm{KL}",
  "\\Var": "\\operatorname{Var}",
  "\\Cov": "\\operatorname{Cov}",
  "\\Tr": "\\operatorname{Tr}",
  "\\diag": "\\operatorname{diag}",
  "\\rank": "\\operatorname{rank}",
  "\\argmax": "\\operatorname*{arg\\,max}",
  "\\argmin": "\\operatorname*{arg\\,min}",
  "\\bigO": "\\mathcal{O}",
  "\\bigOtilde": "\\widetilde{\\mathcal{O}}",
  "\\VC": "\\mathrm{VC}",

  "\\paren": "\\left(#1\\right)",
  "\\bracket": "\\left[#1\\right]",
  "\\set": "\\left\\{#1\\right\\}",
  "\\abs": "\\left|#1\\right|",
  "\\norm": "\\left\\lVert#1\\right\\rVert",
  "\\inner": "\\left\\langle #1, #2 \\right\\rangle",

  "\\prob": "\\mathbb{P}\\left[#1\\right]",
  "\\probunder": "\\underset{#1}{\\mathbb{P}}\\left[#2\\right]",
  "\\expect": "\\mathbb{E}\\left[#1\\right]",
  "\\expectunder": "\\underset{#1}{\\mathbb{E}}\\left[#2\\right]",
  "\\Ind": "\\mathbf{1}\\left\\{#1\\right\\}",
  "\\simiid": "\\overset{\\mathrm{i.i.d.}}{\\sim}",

  "\\cal": "\\mathcal{#1}",
  "\\bb": "\\mathbb{#1}",
  ...letterMacros("\\cal", "\\mathcal"),
  ...letterMacros("\\bb", "\\mathbb")
};

export const mathMacros = defaultMathMacros;

function letterMacros(prefix: string, command: string): MathMacros {
  return Object.fromEntries(
    LETTERS.map((letter) => [`${prefix}${letter}`, `${command}{${letter}}`])
  );
}
