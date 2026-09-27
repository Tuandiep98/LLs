import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

// Detects the visitor's language (cookie, then Accept-Language) and
// redirects to the matching /<locale> prefix.
export default createMiddleware(routing);

export const config = {
  matcher: "/((?!api|_next|_vercel|content|.*\\..*).*)",
};
