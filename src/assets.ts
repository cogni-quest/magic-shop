/**
 * Resolves a file from `public/` against the address the site is served from.
 *
 * Locally that address is the root, so `/army/orc-1.webp` would work as
 * written. On GitHub Pages the site lives under `/magic-shop/`, and an absolute
 * path would escape to the domain root — that is, to nothing. Vite puts the
 * prefix into `BASE_URL`, and everything built as a string at runtime has to
 * come through here.
 *
 * Assets imported by the bundler need none of this; Vite rewrites those itself.
 */
export function publicUrl(path: string): string {
  return `${import.meta.env.BASE_URL}${path.replace(/^\//, '')}`
}
