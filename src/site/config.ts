import type { SiteConfigOverrides } from "../config/types";

export const siteConfigOverrides: SiteConfigOverrides = {
  site: {
    title: "Awni Altabaa",
    name: "Awni Altabaa",
    role: "PhD Student",
    affiliation: "Yale Statistics & Data Science",
    description:
      "Academic website for Awni Altabaa, a PhD student studying the foundations of machine intelligence.",
    url: "https://awni.xyz",
    profileImage: "/profile.jpg",
    links: {
      email: "mailto:awni.altabaa@yale.edu",
      cv: "/cv.pdf",
      github: "https://github.com/awni00",
      scholar: "https://scholar.google.com/citations?user=SQ4FERQAAAAJ",
      x: "https://x.com/awni_altabaa",
      linkedin: "https://www.linkedin.com/in/awni-altabaa"
    },
    nav: [
      { label: "Home", href: "/" },
      { label: "Writing", href: "/writing" },
      { label: "Research", href: "/writing/research" },
      { label: "Publications", href: "/publications" },
      { label: "Teaching", href: "/teaching" },
      { label: "CV", href: "/cv.pdf" }
    ],
    homepage: {
      researchSummary: { enabled: true, source: "home" },
      writingPreview: {
        title: "Research Writing",
        description:
          "Paper pages and research notes organized as a linked map of ideas and projects.",
        clickTarget: "/writing",
        previewHeight: 380
      },
      selectedPublications: {
        maxItems: 6
      },
      recentWriting: {
        maxItems: 4
      },
      news: {
        enabled: false
      }
    }
  },
  publications: {
    authorHighlight: ["Awni Altabaa", "Altabaa, Awni"],
    previews: {
      basePath: "/publications"
    }
  },
  writing: {
    entryLayout: {
      toc: {
        default: {
          minDepth: 2,
          maxDepth: 2
        }
      }
    }
  },
  theme: {
    defaultMode: "system"
  }

  // Reference: the template's documented options (commented out).
  // Who the site is about. Shown in the header, the homepage hero, and page
  // metadata. `url` is also what absolute links and the sitemap are built from.
  // site: {
  //   title: "Academic Website",
  //   name: "Your Name",
  //   role: "PhD Student",
  //   affiliation: "Your University",
  //   description: "Academic website and linked research writing.",
  //   url: "https://example.com",
  //   profileImage: "/profile.svg",
  //   ogImage: "/og-image.svg",
  //   links: {
  //     email: "mailto:you@example.com",
  //     cv: "/cv.pdf",
  //     github: "https://github.com/example",
  //     scholar: "https://scholar.google.com/"
  //   },
  //   // Replaces the default nav entirely — list every item you want.
  //   nav: [
  //     { label: "Home", href: "/" },
  //     { label: "Writing", href: "/writing" },
  //     { label: "Publications", href: "/publications" },
  //     { label: "Research", href: "/research" },
  //     { label: "Teaching", href: "/teaching" },
  //     { label: "CV", href: "/cv.pdf" }
  //   ]
  // },

  // Which of the registered themes the site uses. Ten ship with the template
  // (see docs/theming.md, or run the dev server and open /fixtures/themes to
  // compare them); `src/site/themes.ts` is where you define your own.
  // theme: {
  //   light: "dawn",          // paper | dawn | everforest-light | latte | github-light
  //   dark: "rose-pine",      // ink | rose-pine | everforest-dark | mocha | github-dark
  //   defaultMode: "system",  // "light" | "dark" | "system"
  //   allowToggle: true,
  //   // Default look of <HoverNote>; pages and notes can override it.
  //   hoverNotes: {
  //     marker: "superscript",  // "superscript" | "bracket"
  //     appearance: "card"      // "card" | "inverted"
  //   }
  // },

  // Your BibTeX file, and the name to highlight in author lists.
  // publications: {
  //   source: "src/data/publications.bib",
  //   authorHighlight: ["Your Name"]
  // }
};
