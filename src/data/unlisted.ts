/** Pages kept out of search results and the sitemap: they only make sense mid-task, or for a missing page. */
export const SIGNED_IN_HREF = "/signed-in";
export const SIGN_IN_FAILED_HREF = "/sign-in-failed";
export const UNLISTED = ["/404", SIGNED_IN_HREF, SIGN_IN_FAILED_HREF];
/** Routes that only redirect elsewhere, so they're neither in the sitemap nor prerendered. */
export const REDIRECTS = ["/donate", "/downloads", "/community/guidelines"];
