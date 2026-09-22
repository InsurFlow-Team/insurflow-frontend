const PAGE_TITLES: Record<string, string> = {
  "/dashboard": "Overview",
  "/claims": "Claims Queue",
  "/adjusters": "Field Adjusters",
  "/map": "Map Dispatch",
  "/profile": "Profile",
  "/settings": "Settings",
  "/settings/users": "User Management",
};

export function pageTitle(pathname: string): string {
  return (
    PAGE_TITLES[pathname] ??
    (pathname.startsWith("/claims/")
      ? "Claim Details"
      : pathname.startsWith("/adjusters/")
        ? "Adjuster Profile"
        : "Overview")
  );
}