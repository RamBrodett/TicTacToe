/** Hairline fractures drawn over a piece that is about to vanish (Shifting mode). */
export default function Cracks({ className }: { className?: string }) {
  const d =
    "M50 50 L41 38 L37 27 L30 19 M41 38 L33 40 M50 50 L63 44 L72 31 L79 27 M63 44 L70 50 " +
    "M50 50 L56 63 L54 74 L60 84 M56 63 L64 67 M50 50 L38 58 L26 60 L18 68 M38 58 L37 66";
  return (
    <svg viewBox="0 0 100 100" className={className} aria-hidden="true" focusable="false">
      <path d={d} fill="none" stroke="#ffffff" strokeOpacity="0.22" strokeWidth="1.6" transform="translate(0.6 0.8)" />
      <path d={d} fill="none" stroke="#0b0a09" strokeOpacity="0.85" strokeWidth="1.3" strokeLinejoin="round" />
    </svg>
  );
}
