// Preview-art runtime: palette derivation + sketch registry + renderer.
// A sketch file calls PreviewArt.register({...}); the harness renders it.
(function () {
  // bg / fg / accent of the template's built-in themes. The art palette is
  // derived from exactly these three inputs, like the site themes themselves.
  const THEMES = {
    paper: { bg: "#ffffff", fg: "#15161a", accent: "#2c5cc5", dark: false },
    ink: { bg: "#0c0d10", fg: "#f1f0ec", accent: "#8ea7ff", dark: true },
    dawn: { bg: "#faf4ed", fg: "#534f74", accent: "#286983", dark: false },
    "rose-pine": { bg: "#191724", fg: "#e0def4", accent: "#c4a7e7", dark: true },
    "everforest-light": { bg: "#fdf6e3", fg: "#4a565c", accent: "#2f78a0", dark: false },
    "everforest-dark": { bg: "#2d353b", fg: "#d3c6aa", accent: "#a7c080", dark: true },
    latte: { bg: "#eff1f5", fg: "#4c4f69", accent: "#1962f5", dark: false },
    mocha: { bg: "#1e1e2e", fg: "#cdd6f4", accent: "#89b4fa", dark: true },
    "github-light": { bg: "#ffffff", fg: "#1f2328", accent: "#0969da", dark: false },
    "github-dark": { bg: "#0d1117", fg: "#e6edf3", accent: "#4493f8", dark: true },
  };

  const hex = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
  const toHex = (c) => "#" + c.map((v) => Math.round(v).toString(16).padStart(2, "0")).join("");
  // mix(a, b, t): t = 0 → a, t = 1 → b (sRGB, same as CSS color-mix in srgb).
  const mix = (a, b, t) => toHex(hex(a).map((v, i) => v + (hex(b)[i] - v) * t));

  // The six tokens every sketch draws with. Nothing else.
  function palette(theme) {
    const t = typeof theme === "string" ? THEMES[theme] : theme;
    const bg = mix(t.bg, t.fg, t.dark ? 0.06 : 0.035); // tile, a hair off the page
    const C = {
      bg,
      ink: mix(t.fg, bg, 0.06), // primary structure
      ink2: mix(t.fg, bg, 0.45), // secondary structure
      faint: mix(t.fg, bg, 0.8), // scaffolding / texture
      accent: t.accent, // the one key idea
      accentSoft: mix(t.accent, bg, 0.62), // halo / fill behind the accent
      // Second accent, only for papers whose idea is two kinds of thing (e.g.
      // sensory vs relational). Themes may set accent2; otherwise a red tuned
      // to sit at the accent's weight on light / dark tiles.
      accent2: t.accent2 ?? (t.dark ? "#ff8a7a" : "#c8402f"),
      dark: !!t.dark,
    };
    C.accent2Soft = mix(C.accent2, bg, 0.62);
    // Categorical set, only for figures whose idea is several distinct
    // categories (e.g. one colour per latent strategy z). accent first.
    C.cat = [C.accent, C.accent2, ...(t.cat ?? (t.dark ? ["#6fcf97", "#f2c14e", "#b69cff"] : ["#2f8a5f", "#c88a1c", "#7b52b9"]))];
    // C.alpha("ink", 0.3) → rgba string, for overlap/density effects.
    C.alpha = (name, a) => {
      const [r, g, b] = hex(C[name]);
      return `rgba(${r},${g},${b},${a})`;
    };
    C.mix = (n1, n2, tt) => mix(C[n1] ?? n1, C[n2] ?? n2, tt);
    return C;
  }

  let registered = null;
  function register(art) {
    registered = art;
  }
  function load(src) {
    return new Promise((resolve, reject) => {
      const s = document.createElement("script");
      s.src = src;
      s.onload = () => resolve(registered);
      s.onerror = reject;
      document.head.appendChild(s);
    });
  }

  const W = 1200, H = 900;
  // Labels: math-italic, LaTeX-like. STIX Two Text ships with macOS. (p5 quotes
  // the family name itself, so this must be a single bare family, no fallbacks.)
  const FONT = "STIX Two Text";
  const fontReady = () =>
    document.fonts ? Promise.all([document.fonts.load('italic 60px "STIX Two Text"'), document.fonts.load('60px "STIX Two Text"')]).catch(() => {}) : Promise.resolve();

  // Split "s_j", "h^{(t)}", "I^†_h" into normal / sub / sup runs.
  function parseLabel(str) {
    const segs = [];
    let i = 0, buf = "";
    while (i < str.length) {
      const ch = str[i];
      if ((ch === "_" || ch === "^") && i + 1 < str.length) {
        if (buf) segs.push({ text: buf, kind: "n" }), (buf = "");
        let t;
        if (str[i + 1] === "{") { const k = str.indexOf("}", i + 2); t = str.slice(i + 2, k); i = k + 1; }
        else { t = str[i + 1]; i += 2; }
        segs.push({ text: t, kind: ch === "_" ? "sub" : "sup" });
      } else { buf += ch; i++; }
    }
    if (buf) segs.push({ text: buf, kind: "n" });
    return segs;
  }

  // Helpers handed to every sketch as ctx.label / ctx.check / ctx.cross.
  function helpers(p, C) {
    // label(str, x, y, {size=60, color=C.ink2, align="center"|"left"|"right", upright=false, halo=false})
    // x,y = anchor at the text's vertical centre. Returns the drawn width.
    function label(str, x, y, o = {}) {
      const size = o.size ?? 60, col = o.color ?? C.ink2, align = o.align ?? "center";
      // Math spacing, as TeX does it: thin spaces around "|" and after ",".
      const math = (s) => (o.upright ? s : s.replace(/\s*\|\s*/g, "\u2009|\u2009").replace(/,(?=\S)/g, ",\u2009"));
      const segs = parseLabel(math(String(str)));
      p.push();
      p.textFont(FONT);
      p.textStyle(o.upright ? p.NORMAL : p.ITALIC);
      p.textAlign(p.LEFT, p.CENTER);
      const sz = (s) => (s.kind === "n" ? size : size * 0.62);
      const gap = size * 0.04;
      const ws = segs.map((s) => (p.textSize(sz(s)), p.textWidth(s.text) + (s.kind === "n" ? 0 : gap)));
      // A sup directly followed by a sub (I^†_h) stacks at the same x.
      const xs = [];
      let run = 0;
      segs.forEach((s, k) => {
        const prev = segs[k - 1];
        const stacked = prev && s.kind !== "n" && prev.kind !== "n" && prev.kind !== s.kind;
        if (stacked) { xs.push(xs[k - 1]); run = Math.max(run, xs[k - 1] + ws[k]); }
        else { xs.push(run); run += ws[k]; }
      });
      const total = run;
      const x0 = align === "center" ? x - total / 2 : align === "right" ? x - total : x;
      if (o.halo) { p.noStroke(); p.fill(C.bg); p.rect(x0 - size * 0.15, y - size * 0.62, total + size * 0.3, size * 1.24, size * 0.2); }
      p.noStroke();
      p.fill(col);
      segs.forEach((s, k) => {
        p.textSize(sz(s));
        const dy = s.kind === "sub" ? size * 0.3 : s.kind === "sup" ? -size * 0.34 : 0;
        p.text(s.text, x0 + xs[k] + (s.kind === "n" ? 0 : gap), y + dy);
      });
      p.pop();
      return total;
    }
    // Drawn tick / cross marks (consistent across sketches; not font glyphs).
    function check(x, y, s = 56, col = C.ink2, w = 9) {
      p.push(); p.noFill(); p.stroke(col); p.strokeWeight(w);
      p.beginShape(); p.vertex(x - 0.5 * s, y + 0.02 * s); p.vertex(x - 0.14 * s, y + 0.36 * s); p.vertex(x + 0.5 * s, y - 0.38 * s); p.endShape();
      p.pop();
    }
    function cross(x, y, s = 48, col = C.ink2, w = 9) {
      p.push(); p.stroke(col); p.strokeWeight(w);
      p.line(x - s / 2, y - s / 2, x + s / 2, y + s / 2); p.line(x - s / 2, y + s / 2, x + s / 2, y - s / 2);
      p.pop();
    }
    // Arrowhead at (x, y) pointing along angle a (radians). Filled, slightly rounded.
    function arrowHead(x, y, a, o = {}) {
      const s = o.size ?? 30, col = o.color ?? C.ink2;
      p.push(); p.translate(x, y); p.rotate(a);
      p.fill(col); p.stroke(col); p.strokeWeight(o.round ?? 4);
      p.triangle(0, 0, -s, -s * 0.5, -s, s * 0.5);
      p.pop();
    }
    // Straight arrow from (x1, y1) to (x2, y2); the shaft stops at the head's base.
    function arrow(x1, y1, x2, y2, o = {}) {
      const a = Math.atan2(y2 - y1, x2 - x1), s = o.size ?? 30, col = o.color ?? C.ink2;
      p.push(); p.stroke(col); p.strokeWeight(o.weight ?? 8);
      p.line(x1, y1, x2 - Math.cos(a) * s * 0.9, y2 - Math.sin(a) * s * 0.9);
      p.pop();
      arrowHead(x2, y2, a, { ...o, size: s, color: col });
    }
    return { label, check, cross, arrow, arrowHead };
  }

  // Render one sketch. Static sketches draw once. Animated sketches (art.anim =
  // {duration, fps}) can be re-drawn at any loop phase via the returned frame(t, still).
  function render(art, { theme = "paper", seed, parent, t } = {}) {
    const C = palette(theme);
    const sd = seed != null && seed !== "" ? Number(seed) : art.seed;
    return fontReady().then(() => new Promise((resolve) => {
      new p5((p) => {
        const h = () => helpers(p, C);
        // Every frame starts from identical state: same seed, fresh background,
        // so random() calls in draw() return the same values on every frame.
        const frame = (tt = 0, isStill = false) => {
          p.push();
          p.randomSeed(sd);
          p.noiseSeed(sd);
          p.strokeCap(p.ROUND);
          p.strokeJoin(p.ROUND);
          p.background(C.bg);
          art.draw(p, C, { W, H, seed: sd, params: { ...(art.params || {}) }, t: tt, still: isStill, anim: !!art.anim, ...h() });
          p.pop();
        };
        p.setup = () => {
          p.pixelDensity(1);
          p.createCanvas(W, H);
          p.noLoop();
          // Default: the still (what ships as the static image). ?t=0.25 renders a loop frame instead.
          if (t != null && t !== "") frame(Number(t), false);
          else frame(art.anim ? art.anim.stillPhase ?? 0 : 0, true);
          window.__frame = frame;
          window.__done = true;
          resolve(p);
        };
      }, parent || document.body);
    }));
  }

  window.PreviewArt = { THEMES, palette, mix, register, load, render, W, H };
})();
