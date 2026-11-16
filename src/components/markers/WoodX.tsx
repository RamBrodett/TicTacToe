type Knot = readonly [cx: number, cy: number, rx: number, ry: number];

function Plank({ filter, knots }: { filter: string; knots: readonly Knot[] }) {
  return (
    <g filter={filter}>
      <rect x="7" y="39.5" width="86" height="21" rx="2.6" fill="url(#plank-shade)" />
      <rect x="7" y="39.5" width="86" height="21" rx="2.6" fill="url(#plank-ends)" />
      {knots.map(([cx, cy, rx, ry]) => (
        <ellipse key={`${cx}-${cy}`} cx={cx} cy={cy} rx={rx} ry={ry} fill="url(#knot)" />
      ))}
    </g>
  );
}

/** X marker: two crossed oak planks fixed with an iron nail. */
export default function WoodX({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" className={className} aria-hidden="true" focusable="false">
      <g filter="url(#piece-shadow)">
        <g transform="rotate(45 50 50)">
          <Plank filter="url(#wood-a)" knots={[[27, 46.5, 4.4, 2.1], [72, 54.5, 2.8, 1.5]]} />
        </g>
        <g filter="url(#plank-shadow)">
          <g transform="rotate(-45 50 50)">
            <Plank filter="url(#wood-b)" knots={[[34, 53.5, 3.4, 1.7], [78, 45.5, 4.6, 2.3]]} />
          </g>
        </g>
        <circle cx="50" cy="50" r="7.5" fill="url(#rust-stain)" />
        <g filter="url(#small-shadow)">
          <circle cx="50" cy="50" r="4.3" fill="url(#nail-head)" />
          <circle cx="50" cy="50" r="4.3" fill="none" stroke="#15181a" strokeWidth="0.6" opacity="0.7" />
          <path d="M47.6 48.6 Q50 47.4 52.4 48.6" fill="none" stroke="#ffffff" strokeOpacity="0.35" strokeWidth="0.6" />
        </g>
      </g>
    </svg>
  );
}
