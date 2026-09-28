"use client";

// Inline script that runs before paint on hard navigations (see Next.js docs:
// "Preventing flash before hydration"). The type swap avoids React's dev warning;
// it only works in a Client Component, where `window` exists when rendering in the browser.
export function InlineScript({ html }: { html: string }) {
  return (
    <script
      type={typeof window === "undefined" ? "text/javascript" : "text/plain"}
      suppressHydrationWarning
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
