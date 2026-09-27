import { basePath } from "@/lib/basePath";

// Requests outside any locale fall back here (also exported as 404.html on static hosting).
export default function RootNotFound() {
  return (
    <html lang="en">
      <body style={{ fontFamily: "sans-serif", textAlign: "center", padding: "4rem", background: "#fff7e8" }}>
        <h1>404</h1>
        <a href={`${basePath}/`}>LLs</a>
      </body>
    </html>
  );
}
