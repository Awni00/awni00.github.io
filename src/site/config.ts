import type { SiteConfigOverrides } from "../config/types";

/**
 * Site-owned configuration overrides.
 *
 * Downstream websites should edit this file instead of changing template
 * defaults in `src/config/defaults/`. Objects merge into the defaults;
 * arrays, including `nav` and `entryTypes`, replace the default array.
 */
export const siteConfigOverrides: SiteConfigOverrides = {};
