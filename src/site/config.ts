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
};
