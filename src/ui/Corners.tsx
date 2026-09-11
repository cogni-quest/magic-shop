/**
 * The four corner vignettes of a lacquer box.
 *
 * One drawing, turned four ways by CSS — a scaleX for the top right, a scaleY
 * for the bottom left, both for the bottom right. Drawn rather than fetched:
 * four inline paths cost less than one image request, and they take their colour
 * from whatever they sit in, so a card that is out of reach dims its own
 * ornament without a second asset.
 */
const PATHS = (
  <>
    <path d="M0 21 C 10 21, 13 17, 13 8 C 13 2, 17 0, 21 0" />
    <path d="M0 29 C 15 29, 21 23, 21 10" />
    <circle cx="13" cy="13" r="2.5" />
    <path d="M27 6 C 33 6, 35 4, 35 0 M6 27 C 6 33, 4 35, 0 35" />
  </>
)

export function Corners() {
  return (
    <>
      {(['tl', 'tr', 'bl', 'br'] as const).map((where) => (
        <svg
          key={where}
          className={`corner corner--${where}`}
          viewBox="0 0 54 54"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.2"
          aria-hidden="true"
        >
          {PATHS}
        </svg>
      ))}
    </>
  )
}
