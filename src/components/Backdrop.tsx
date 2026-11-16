/**
 * Full-screen workshop wall: riveted, brushed-steel plates under a warm work lamp.
 * Kept dark and low-contrast so it never competes with the board (HCI: figure/ground).
 */

const W = 1600;
const H = 1000;
const COLS = [400, 800, 1200];
const ROWS = [500];

function rivetsAlongX(y: number) {
  return Array.from({ length: Math.floor(W / 50) + 1 }, (_, i) => ({ x: i * 50 + 25, y }));
}
function rivetsAlongY(x: number) {
  return Array.from({ length: Math.floor(H / 50) + 1 }, (_, i) => ({ x, y: i * 50 + 25 }));
}

const RIVETS = [
  ...ROWS.flatMap((y) => [...rivetsAlongX(y - 14), ...rivetsAlongX(y + 14)]),
  ...COLS.flatMap((x) => [...rivetsAlongY(x - 14), ...rivetsAlongY(x + 14)]),
];

export default function Backdrop() {
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-0 [transform:translateZ(0)]">
      <svg
        className="h-full w-full"
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="xMidYMid slice"
        focusable="false"
      >
        <defs>
          <linearGradient id="wall" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#262b30" />
            <stop offset="1" stopColor="#131619" />
          </linearGradient>
          <radialGradient id="lamp" cx="0.5" cy="0.02" r="0.75">
            <stop offset="0" stopColor="#ffcf8a" stopOpacity="0.2" />
            <stop offset="0.45" stopColor="#ffb766" stopOpacity="0.06" />
            <stop offset="1" stopColor="#ffb766" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="vignette" cx="0.5" cy="0.45" r="0.75">
            <stop offset="0.45" stopColor="#000" stopOpacity="0" />
            <stop offset="1" stopColor="#000" stopOpacity="0.8" />
          </radialGradient>
          <radialGradient id="rivet" cx="0.35" cy="0.3" r="0.8">
            <stop offset="0" stopColor="#6f787e" />
            <stop offset="0.5" stopColor="#353c41" />
            <stop offset="1" stopColor="#15181b" />
          </radialGradient>
        </defs>

        <rect width={W} height={H} fill="url(#wall)" filter="url(#brushed)" />
        <rect width={W} height={H} fill="#000" opacity="0.55" filter="url(#grime)" />

        {/* Plate seams: dark groove + light lip */}
        {COLS.map((x) => (
          <g key={`c${x}`}>
            <line x1={x} y1="0" x2={x} y2={H} stroke="#07090a" strokeWidth="3" />
            <line x1={x + 2} y1="0" x2={x + 2} y2={H} stroke="#ffffff" strokeOpacity="0.06" strokeWidth="1.5" />
          </g>
        ))}
        {ROWS.map((y) => (
          <g key={`r${y}`}>
            <line x1="0" y1={y} x2={W} y2={y} stroke="#07090a" strokeWidth="3" />
            <line x1="0" y1={y + 2} x2={W} y2={y + 2} stroke="#ffffff" strokeOpacity="0.06" strokeWidth="1.5" />
          </g>
        ))}

        <g opacity="0.85">
          {RIVETS.map(({ x, y }) => (
            <g key={`${x}-${y}`}>
              <circle cx={x + 1.5} cy={y + 2.5} r="6" fill="#000" opacity="0.45" />
              <circle cx={x} cy={y} r="5.5" fill="url(#rivet)" />
            </g>
          ))}
        </g>

        <rect width={W} height={H} fill="url(#lamp)" />
        <rect width={W} height={H} fill="url(#vignette)" />
      </svg>
    </div>
  );
}
