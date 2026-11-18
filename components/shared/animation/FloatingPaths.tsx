import type { CSSProperties } from "react"

/**
 * A fan of thin thread-lines sweeping the lower half of the login aside.
 * `d`, stroke width and peak alpha come from design/login-redesign/04.
 */
const PATHS = [
  {
    d: "M-20 600C140 470 320 560 470 470S700 260 760 200",
    width: 1.4,
    opacity: 0.16,
  },
  {
    d: "M-20 616C150 490 330 578 480 488S705 280 765 218",
    width: 1.2,
    opacity: 0.12,
  },
  {
    d: "M-20 632C160 510 340 596 490 506S710 300 770 236",
    width: 1,
    opacity: 0.09,
  },
  {
    d: "M-20 648C170 530 350 614 500 524S715 320 775 254",
    width: 1,
    opacity: 0.07,
  },
  {
    d: "M-20 664C180 550 360 632 510 542S720 340 780 272",
    width: 1,
    opacity: 0.05,
  },
  {
    d: "M-20 560C130 440 310 530 455 445S690 235 750 178",
    width: 1.2,
    opacity: 0.1,
  },
  {
    d: "M-20 522C120 412 300 500 440 420S680 215 740 158",
    width: 1,
    opacity: 0.07,
  },
  {
    d: "M-20 486C110 388 290 470 425 396S670 196 730 140",
    width: 1,
    opacity: 0.04,
  },
] as const

/**
 * Decorative flowing lines.
 *
 * Two rendering rules keep this cheap in every engine:
 *
 * 1. CSS keyframes, not a JS animation loop. The old motion/react version wrote
 *    3 attributes to 72 paths on every frame, so any other repaint on the page
 *    (hover, focus, scroll) collided with it and the frame flickered.
 * 2. Never animate `opacity` on an SVG child. Chrome has to render every
 *    translucent SVG element into its own offscreen transparency group the
 *    size of the element's bounds — here one near-full-column buffer per path
 *    per frame — which is what made Chrome flicker while Safari was fine.
 *    `stroke-opacity` is just alpha in the stroke paint, so we animate that.
 *
 * `position` mirrors the fan; both values are only ever decorative.
 */
export function FloatingPaths({ position }: { position: number }) {
  return (
    // `isolate` + `contain-strict` keep the per-frame stroke repaints from
    // invalidating anything outside this box.
    <div
      aria-hidden
      className="pointer-events-none absolute inset-x-0 bottom-0 isolate h-[74%] contain-strict"
    >
      <style href="floating-paths-keyframes" precedence="default">
        {
          "@keyframes floating-path{0%{stroke-dashoffset:1;stroke-opacity:0}15%,85%{stroke-opacity:var(--stroke-opacity)}100%{stroke-dashoffset:-1;stroke-opacity:0}}@keyframes floating-paths-in{from{opacity:.6;transform:translateX(-3%)}to{opacity:1;transform:none}}"
        }
      </style>
      <svg
        className={`h-full w-full text-foreground motion-safe:animate-[floating-paths-in_1.1s_cubic-bezier(.16,1,.3,1)_.1s_both] ${
          position < 0 ? "-scale-x-100" : ""
        }`}
        fill="none"
        preserveAspectRatio="none"
        viewBox="0 0 720 660"
      >
        {PATHS.map((path, index) => (
          <path
            className="motion-safe:animate-[floating-path_var(--duration)_linear_infinite]"
            d={path.d}
            key={path.d}
            // Normalise every path to length 1 so dash values are relative.
            pathLength={1}
            stroke="currentColor"
            strokeLinecap="round"
            // dash = full path, gap = full path; sweeping the offset from
            // 1 → -1 draws the line in from the start and then erases it,
            // ending invisible so the infinite loop has no seam.
            strokeDasharray="1 1"
            strokeOpacity={path.opacity}
            strokeWidth={path.width}
            style={
              {
                // Deterministic timing so SSR, hydration and re-renders agree.
                "--duration": `${26 + (index % 4) * 4}s`,
                "--stroke-opacity": path.opacity,
                animationDelay: `${-(index * 3.3).toFixed(1)}s`,
              } as CSSProperties
            }
          />
        ))}
      </svg>
      <div className="absolute bottom-[34%] left-[-6%] h-px w-[112%] origin-left -rotate-7 bg-linear-to-r from-transparent via-foreground/15 to-transparent" />
    </div>
  )
}
