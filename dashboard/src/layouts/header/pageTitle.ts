import type { MessageKey } from "../../i18n/messages.en";

const PAGE_TITLES: Record<string, MessageKey> = {
  "/dashboard": "nav.overview",
  "/claims": "claims.header.queue",
  "/adjusters": "nav.fieldAdjusters",
  "/map": "map.title",
  "/profile": "nav.profile",
  "/settings": "nav.settings",
  "/settings/users": "nav.userManagement",
};

export function pageTitle(pathname: string): MessageKey {
  return (
    PAGE_TITLES[pathname] ??
    (pathname.startsWith("/claims/")
      ? "nav.claimDetails"
      : pathname.startsWith("/adjusters/")
        ? "nav.adjusterProfile"
        : "nav.overview")
  );
}
