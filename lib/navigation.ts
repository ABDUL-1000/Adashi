/**
 * Whether a nav item is active for the current path. The most specific matching item wins,
 * so "/groups/create" highlights "Create" and not also "Groups".
 */
export function isNavItemActive(pathname: string, href: string, allHrefs: string[]) {
  const matches = (target: string) => pathname === target || pathname.startsWith(`${target}/`);
  if (!matches(href)) return false;
  return !allHrefs.some((other) => other !== href && other.length > href.length && other.startsWith(href) && matches(other));
}
