/**
 * Only allow redirects to paths inside this app, so a crafted link like
 * /login?redirect=https://evil.example cannot send users to another site after login.
 */
export function safeRedirect(value: string | null | undefined, fallback = "/dashboard") {
  if (!value || !value.startsWith("/") || value.startsWith("//") || value.startsWith("/\\")) {
    return fallback;
  }
  return value;
}
