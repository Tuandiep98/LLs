import { InlineScript } from "@/components/InlineScript";
import { localeMeta, locales } from "@/i18n/config";
import { localeRedirectScript } from "@/i18n/detect";
import { basePath } from "@/lib/basePath";
import { contentSecurityPolicy } from "@/lib/csp";

// "/" on static hosting: pick the visitor's language in the browser and redirect.
// (On a Node host the proxy redirects before this page is reached.)
export default function RootRedirect() {
  return (
    <html lang="en">
      <head>
        <meta httpEquiv="Content-Security-Policy" content={contentSecurityPolicy()} />
        <meta name="robots" content="noindex" />
        <title>LLs</title>
        <InlineScript html={localeRedirectScript(basePath)} />
      </head>
      <body style={{ fontFamily: "sans-serif", textAlign: "center", padding: "3rem", background: "#fff7e8" }}>
        <noscript>
          {locales.map((l) => (
            <p key={l}>
              <a href={`${basePath}/${l}/`}>
                {localeMeta[l].flag} {localeMeta[l].nativeName}
              </a>
            </p>
          ))}
        </noscript>
      </body>
    </html>
  );
}
