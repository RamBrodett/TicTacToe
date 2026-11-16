import { gearPath, hexPoints } from "@/lib/gear";

const GEAR = gearPath();
const NUT = hexPoints(50, 50, 8.8);

/** O marker: a weathered, rusting steel gear with a hex-nut hub. */
export default function GearO({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" className={className} aria-hidden="true" focusable="false">
      <g filter="url(#piece-shadow)">
        <g filter="url(#rusty-steel)">
          <path d={GEAR} fill="url(#steel-base)" fillRule="evenodd" />
          <path d={GEAR} fill="url(#lathe)" fillRule="evenodd" />
        </g>
        <g filter="url(#small-shadow)">
          <circle cx="50" cy="50" r="13.6" fill="url(#steel-dark)" filter="url(#rusty-steel)" />
          <polygon points={NUT} fill="url(#steel-base)" filter="url(#rusty-steel)" />
          <circle cx="50" cy="50" r="3.6" fill="url(#bolt-end)" />
        </g>
      </g>
    </svg>
  );
}
