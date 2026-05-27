import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

import { entryTypeIds } from "./config";

const entryTypes = entryTypeIds as [string, ...string[]];

const dateString = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Expected YYYY-MM-DD")
  .optional();

const tocDepth = z.number().int().min(2).max(6);

const tocConfig = z
  .object({
    minDepth: tocDepth.optional(),
    maxDepth: tocDepth.optional()
  })
  .refine(
    (value) =>
      value.minDepth === undefined ||
      value.maxDepth === undefined ||
      value.minDepth <= value.maxDepth,
    {
      message: "minDepth must be less than or equal to maxDepth",
      path: ["maxDepth"]
    }
  );

const mathConfig = z.object({
  macros: z.array(z.string()).default([])
});

const externalLinks = z
  .object({
    paper: z.string().url().or(z.string().startsWith("/")).optional(),
    arxiv: z.string().optional(),
    doi: z.string().optional(),
    code: z.string().url().or(z.string().startsWith("/")).optional(),
    slides: z.string().url().or(z.string().startsWith("/")).optional(),
    poster: z.string().url().or(z.string().startsWith("/")).optional(),
    website: z.string().url().or(z.string().startsWith("/")).optional(),
    video: z.string().url().or(z.string().startsWith("/")).optional()
  })
  .partial()
  .optional();

const writing = defineCollection({
  loader: glob({
    base: "./src/content/writing",
    pattern: "**/*.{md,mdx}",
    retainBody: true
  }),
  schema: z.object({
    title: z.string(),
    type: z.enum(entryTypes),
    slug: z.string().optional(),
    aliases: z.array(z.string()).default([]),
    date: dateString,
    updated: dateString,
    summary: z.string().optional(),
    venue: z.string().optional(),
    tags: z.array(z.string()).default([]),
    links: z.array(z.string()).default([]),
    authors: z
      .array(
        z.union([
          z.string(),
          z.object({
            name: z.string(),
            affiliation: z.string().optional(),
            url: z.string().url().optional(),
            note: z.string().optional()
          })
        ])
      )
      .default([]),
    featured: z.boolean().default(false),
    draft: z.boolean().default(false),
    theme: z.enum(["global", "system", "light", "dark"]).default("global"),
    math: mathConfig.optional(),
    external: externalLinks,
    bibtex: z.string().optional(),
    layout: z
      .object({
        // Override the article body width for this entry.
        width: z.enum(["reading", "flex"]).optional(),
        // Override aside placement: "margin" floats <Aside> blocks into
        // the right gutter; "inline" renders them as left-bordered blocks.
        asides: z.enum(["margin", "inline"]).optional(),
        // Override which heading depths appear in the article TOC.
        // Depths are h2-h6; h1 is reserved for the article title.
        toc: tocConfig.optional(),
        // Structured placement overrides — partial; fields you omit fall
        // through to the type-level or global default. Legacy "sidebar"
        // value is accepted and silently mapped to "right".
        placement: z
          .object({
            toc: z
              .object({ where: z.enum(["left", "right", "sidebar", "none"]).optional() })
              .optional(),
            localGraph: z
              .object({ where: z.enum(["header", "footer", "none"]).optional() })
              .optional(),
            backlinks: z
              .object({ where: z.enum(["left", "right", "footer", "sidebar", "none"]).optional() })
              .optional(),
            related: z
              .object({ where: z.enum(["left", "right", "footer", "sidebar", "none"]).optional() })
              .optional()
          })
          .optional()
      })
      .optional()
  })
});

const pages = defineCollection({
  loader: glob({
    base: "./src/content/pages",
    pattern: "**/*.{md,mdx}",
    retainBody: true
  }),
  schema: z.object({
    title: z.string(),
    description: z.string().optional(),
    draft: z.boolean().default(false),
    math: mathConfig.optional(),
    navTitle: z.string().optional()
  })
});

export const collections = { pages, writing };
