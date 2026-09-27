/** Prefix for static files referenced by plain URLs (<img src>, manifest). "" or "/LLs". */
export const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export function asset(src: string) {
  return `${basePath}${src}`;
}
