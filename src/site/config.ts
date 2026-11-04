import type { SiteConfigOverrides } from "../config/types";

export const siteConfigOverrides: SiteConfigOverrides = {
  site: {
    title: "Awni Altabaa",
    name: "Awni Altabaa",
    role: "PhD Candidate",
    affiliation: "Yale Statistics & Data Science",
    description:
      "Academic website for Awni Altabaa, a PhD candidate studying the foundations of artificial intelligence.",
    url: "https://awni.xyz",
    profileImage: "/profile.webp",
    links: {
      email: "mailto:awni.altabaa@yale.edu",
      cv: "/cv.pdf",
      github: "https://github.com/awni00",
      scholar: "https://scholar.google.com/citations?user=SQ4FERQAAAAJ",
      x: "https://x.com/awni_altabaa",
      linkedin: "https://www.linkedin.com/in/awni-altabaa"
    },
    nav: [
      { label: "Home", href: "/", icon: "house" },
      { label: "Blog", href: "/blog", icon: "waypoints" },
      { label: "Publications", href: "/publications", icon: "book-open" },
      { label: "CV", href: "/cv.pdf", icon: "file-text" }
    ],
    homepage: {
      hero: {
        photo: { side: "left", width: 240, shape: "rounded", position: "50% 22%" },
        links: { style: { desktop: "pills", mobile: "pills" } },
        phone: { layout: "centered" }
      },
      researchSummary: { enabled: true, source: "home" },
      writingPreview: {
        title: "Research Writing",
        description:
          "Paper pages and research notes organized as a linked map of ideas and projects.",
        clickTarget: "/blog",
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
  graph: {
    layout: { forces: { hubHubRepulsion: 275, hubLinkLength: 57 } }
  },
  publications: {
    authorHighlight: ["Awni Altabaa", "Altabaa, Awni"],
    previews: {
      basePath: "/publications"
    }
  },
  writing: {
    route: "/blog",
    label: "Blog",
    rss: {
      route: "/blog/rss.xml"
    },
    entryLayout: {
      figureNumbers: true,
      toc: {
        default: {
          minDepth: 2,
          maxDepth: 2
        }
      }
    }
  },
  theme: {
    light: "claret-light",
    dark: "claret-dark",
    defaultMode: "light"
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
  //   // `icon` shows in the phone menu (names: src/config/navIcons.ts); give
  //   // every item one, or leave them all out for a text-only menu.
  //   nav: [
  //     { label: "Home", href: "/", icon: "house" },
  //     { label: "Writing", href: "/writing", icon: "waypoints" },
  //     { label: "Publications", href: "/publications", icon: "book-open" },
  //     { label: "Research", href: "/research", icon: "flask-conical" },
  //     { label: "Teaching", href: "/teaching", icon: "graduation-cap" },
  //     { label: "CV", href: "/cv.pdf", icon: "file-text" }
  //   ],
  //   // Homepage sections. Each can be switched off with `enabled: false`.
  //   homepage: {
  //     // Photo, caption, and links in a card beside the bio. Every option is
  //     // in docs/configuration.md#homepage-hero.
  //     hero: {
  //       photo: { side: "left", width: 240, position: "50% 22%" },
  //       links: {
  //         show: ["email", "cv", "scholar", "github", "x", "linkedin"],
  //         style: { desktop: "pills", mobile: "pills" }  // pills | icons | list | text | text-icons
  //       },
  //       phone: { layout: "centered" }                   // "centered" | "compact"
  //     },
  //     recentWriting: {
  //       title: "Recent writing",  // e.g. "Recent posts" if you rename Writing
  //       maxItems: 6,              // newest dated entries shown in the carousel
  //       select: "featured-first", // "featured-first" | "recent" | "featured"
  //       // The card that ends the row; `description` defaults to
  //       // "Browse {writing.label}", and "" hides it.
  //       viewAll: { enabled: true, label: "View all →" }
  //     }
  //   }
  // },

  // Which of the registered themes the site uses. Ten ship with the template
  // (see docs/theming.md, or run the dev server and open /fixtures/themes to
  // compare them); `src/site/themes.ts` is where you define your own.
  // theme: {
  //   light: "dawn",          // paper | dawn | everforest-light | latte | github-light
  //   dark: "rose-pine",      // ink | rose-pine | everforest-dark | mocha | github-dark
  //   defaultMode: "system",  // "light" | "dark" | "system"
  //   allowToggle: true,
  //   // Justified prose (default off); a page's `article.justify` overrides it.
  //   typography: {
  //     justify: { enabled: false, hyphenate: true, minWidth: "all" }
  //   },
  //   // Page width including gutters; the header, footer, and homepage share it.
  //   layout: { contentWidth: 1020 },
  //   // Default look of <HoverNote>; pages and notes can override it.
  //   hoverNotes: {
  //     marker: "superscript",  // "superscript" | "bracket"
  //     appearance: "card"      // "card" | "inverted"; <Term> uses it too
  //   },
  //   // Default look of <Term>; pages and terms can override it.
  //   terms: {
  //     underline: "dotted"     // "dotted" | "none"
  //   }
  // },

  // Your BibTeX file, and the name to highlight in author lists.
  // publications: {
  //   source: "src/data/publications.bib",
  //   authorHighlight: ["Your Name"]
  // }
};
