// Shared Content Security Policy. Sent as a header on Node hosts; on static
// hosting (GitHub Pages) it goes into a <meta> tag, where frame-ancestors is not allowed.
export function contentSecurityPolicy({ dev = false, frameAncestors = false } = {}) {
  return [
    "default-src 'self'",
    `script-src 'self' 'unsafe-inline'${dev ? " 'unsafe-eval'" : ""}`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob:",
    "font-src 'self'",
    "connect-src 'self'",
    "media-src 'self' blob:",
    "worker-src 'self' blob:",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    ...(frameAncestors ? ["frame-ancestors 'none'"] : []),
  ].join("; ");
}
