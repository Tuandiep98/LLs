// Requests outside any locale (rare, the proxy redirects them) fall back here.
export default function RootNotFound() {
  return (
    <html lang="en">
      <body style={{ fontFamily: "sans-serif", textAlign: "center", padding: "4rem" }}>
        <h1>404</h1>
        {/* eslint-disable-next-line @next/next/no-html-link-for-pages -- outside the app layout */}
        <a href="/">LLs</a>
      </body>
    </html>
  );
}
