/** Geometry helpers for the SVG gear marker. All values are in a 100×100 viewBox. */

const f = (n: number) => n.toFixed(2);

function circle(cx: number, cy: number, r: number) {
  return `M ${f(cx + r)} ${f(cy)} A ${r} ${r} 0 1 0 ${f(cx - r)} ${f(cy)} A ${r} ${r} 0 1 0 ${f(cx + r)} ${f(cy)} Z`;
}

export interface GearOptions {
  teeth?: number;
  outer?: number;
  root?: number;
  cx?: number;
  cy?: number;
  /** Fraction of each tooth pitch occupied by the tooth at its base / tip. */
  baseFrac?: number;
  tipFrac?: number;
  /** Lightening holes: count, ring radius, hole radius. */
  holes?: { count: number; ring: number; r: number };
}

/** Closed gear outline (trapezoid teeth) plus round holes. Use with fill-rule="evenodd". */
export function gearPath({
  teeth = 10,
  outer = 46,
  root = 37.5,
  cx = 50,
  cy = 50,
  baseFrac = 0.58,
  tipFrac = 0.34,
  holes = { count: 5, ring: 23.5, r: 7.4 },
}: GearOptions = {}): string {
  const step = (Math.PI * 2) / teeth;
  const b = (step * baseFrac) / 2;
  const t = (step * tipFrac) / 2;
  const pt = (r: number, a: number) => `${f(cx + r * Math.cos(a))} ${f(cy + r * Math.sin(a))}`;

  let d = "";
  for (let i = 0; i < teeth; i++) {
    const c = i * step - Math.PI / 2;
    if (i === 0) d += `M ${pt(root, c - b)}`;
    d +=
      ` L ${pt(outer, c - t)}` +
      ` A ${outer} ${outer} 0 0 1 ${pt(outer, c + t)}` +
      ` L ${pt(root, c + b)}` +
      ` A ${root} ${root} 0 0 1 ${pt(root, c + step - b)}`;
  }
  d += " Z";

  for (let i = 0; i < holes.count; i++) {
    const a = (i / holes.count) * Math.PI * 2 - Math.PI / 2 + Math.PI / holes.count;
    d += " " + circle(cx + holes.ring * Math.cos(a), cy + holes.ring * Math.sin(a), holes.r);
  }
  return d;
}

/** Regular hexagon points string for a nut. */
export function hexPoints(cx: number, cy: number, r: number): string {
  return Array.from({ length: 6 }, (_, i) => {
    const a = (Math.PI / 3) * i + Math.PI / 6;
    return `${f(cx + r * Math.cos(a))},${f(cy + r * Math.sin(a))}`;
  }).join(" ");
}
