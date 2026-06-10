export type MediaFit = "contain" | "cover" | "fill" | "none" | "scale-down";
export type MediaAlign = "start" | "center" | "end" | "stretch";

export type MediaLayoutProps = {
  width?: string;
  maxWidth?: string;
  mediaWidth?: string;
  mediaMaxWidth?: string;
  mediaHeight?: string;
  mediaMaxHeight?: string;
  mediaAspectRatio?: string;
  mediaFit?: MediaFit;
  mediaInset?: string;
  mediaAlign?: MediaAlign;
};

type LayoutStyleOptions = {
  style?: string;
  directMedia?: boolean;
  defaults?: Partial<MediaLayoutProps>;
  extraVars?: Record<string, string | number | boolean | undefined>;
};

type LayoutStyleObjectOptions = Omit<LayoutStyleOptions, "style">;

const mediaVarNames = {
  mediaWidth: "--article-media-width",
  mediaMaxWidth: "--article-media-max-width",
  mediaHeight: "--article-media-height",
  mediaMaxHeight: "--article-media-max-height",
  mediaAspectRatio: "--article-media-aspect-ratio",
  mediaFit: "--article-media-fit",
  mediaInset: "--article-media-inset",
  mediaAlign: "--article-media-align"
} as const;

const directMediaVarNames = {
  mediaWidth: "--article-direct-media-width",
  mediaMaxWidth: "--article-direct-media-max-width",
  mediaHeight: "--article-direct-media-height",
  mediaMaxHeight: "--article-direct-media-max-height",
  mediaAspectRatio: "--article-direct-media-aspect-ratio",
  mediaFit: "--article-direct-media-fit",
  mediaInset: "--article-direct-media-inset",
  mediaAlign: "--article-direct-media-align"
} as const;

export function buildMediaLayoutStyle(
  props: MediaLayoutProps,
  options: LayoutStyleOptions = {}
): string | undefined {
  const declarations = Object.entries(buildMediaLayoutVars(props, options)).map(
    ([name, value]) => `${name}: ${value};`
  );
  const authoredStyle = normalizeStyle(options.style);
  return [...declarations, authoredStyle].filter(Boolean).join(" ") || undefined;
}

export function buildMediaLayoutStyleObject(
  props: MediaLayoutProps,
  options: LayoutStyleObjectOptions = {}
): Record<string, string> {
  return buildMediaLayoutVars(props, options);
}

function buildMediaLayoutVars(
  props: MediaLayoutProps,
  options: LayoutStyleObjectOptions
): Record<string, string> {
  const values = { ...options.defaults, ...definedEntries(props) };
  const vars: Record<string, string> = {};
  const widthVar = options.directMedia ? "--article-direct-media-width" : "--article-layout-width";
  const maxWidthVar = options.directMedia
    ? "--article-direct-media-max-width"
    : "--article-layout-max-width";
  const mediaVars = options.directMedia ? directMediaVarNames : mediaVarNames;

  setVar(vars, widthVar, values.width);
  setVar(vars, maxWidthVar, values.maxWidth);

  for (const [propName, varName] of Object.entries(mediaVars)) {
    setVar(vars, varName, values[propName as keyof typeof mediaVars]);
  }

  if (options.extraVars) {
    for (const [name, value] of Object.entries(options.extraVars)) {
      setVar(vars, name, value);
    }
  }

  return vars;
}

function setVar(
  vars: Record<string, string>,
  name: string,
  value: string | number | boolean | undefined
) {
  if (value === undefined || value === "") return;
  vars[name] = String(value);
}

function definedEntries(props: MediaLayoutProps): Partial<MediaLayoutProps> {
  return Object.fromEntries(
    Object.entries(props).filter(([, value]) => value !== undefined)
  ) as Partial<MediaLayoutProps>;
}

function normalizeStyle(style?: string): string {
  const trimmed = style?.trim();
  if (!trimmed) return "";
  return trimmed.endsWith(";") ? trimmed : `${trimmed};`;
}
