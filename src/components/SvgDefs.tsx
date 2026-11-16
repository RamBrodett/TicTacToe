/**
 * Shared SVG paint servers and filters, rendered once and referenced by id
 * from every marker, the board and the backdrop.
 *
 * Realism comes from three ingredients:
 *  1. Procedural texture  – feTurbulence (wood grain, rust, brushed steel, grime)
 *  2. Fake relief         – a blurred alpha channel used as a height map for
 *                           feDiffuseLighting / feSpecularLighting (bevels, sheen)
 *  3. Contact shadows     – feDropShadow so pieces sit *on* the plate
 *
 * Not display:none on purpose: some browsers stop resolving gradients/filters
 * inside a hidden <svg>.
 */

const GRAY_FROM_R = "1 0 0 0 0  1 0 0 0 0  1 0 0 0 0  0 0 0 0 1";

/** Oak plank texture. `azimuth` compensates for the plank's own rotation so
 * both planks of the X appear lit from the same top-left light. */
function WoodFilter({ id, seed, azimuth }: { id: string; seed: number; azimuth: number }) {
  const bands = "0.22 0.88 0.42 1 0.3 0.94 0.5 0.82 0.28 1 0.45";
  return (
    <filter id={id} x="-6%" y="-25%" width="112%" height="150%" colorInterpolationFilters="sRGB">
      {/* Long, stretched noise → grain running along the plank */}
      <feTurbulence type="fractalNoise" baseFrequency="0.011 0.21" numOctaves={3} seed={seed} result="noise" />
      <feColorMatrix in="noise" type="matrix" values={GRAY_FROM_R} result="gray" />
      <feComponentTransfer in="gray" result="bands">
        <feFuncR type="table" tableValues={bands} />
        <feFuncG type="table" tableValues={bands} />
        <feFuncB type="table" tableValues={bands} />
      </feComponentTransfer>
      {/* Fine pores */}
      <feTurbulence type="fractalNoise" baseFrequency="0.07 1.3" numOctaves={2} seed={seed + 17} result="pores" />
      <feColorMatrix in="pores" type="matrix" values={GRAY_FROM_R} result="poresGray" />
      <feComposite in="bands" in2="poresGray" operator="arithmetic" k1="0.55" k2="0.55" k3="0" k4="0" result="grain" />
      {/* Map gray → honey oak */}
      <feColorMatrix
        in="grain"
        type="matrix"
        values="0.44 0 0 0 0.35  0.30 0 0 0 0.19  0.15 0 0 0 0.075  0 0 0 0 1"
        result="oak"
      />
      {/* Multiply by the source art (knots, end-grain shading); also clips to the plank */}
      <feComposite in="oak" in2="SourceGraphic" operator="arithmetic" k1="1" k2="0" k3="0" k4="0" result="tinted" />
      {/* Bevelled edges */}
      <feGaussianBlur in="SourceAlpha" stdDeviation="1.7" result="bump" />
      <feDiffuseLighting in="bump" surfaceScale="4" diffuseConstant="1.38" lightingColor="#fff3df" result="diffuse">
        <feDistantLight azimuth={azimuth} elevation={48} />
      </feDiffuseLighting>
      <feComposite in="tinted" in2="diffuse" operator="arithmetic" k1="1" k2="0" k3="0" k4="0" result="shaded" />
      <feSpecularLighting
        in="bump"
        surfaceScale="4"
        specularConstant="0.38"
        specularExponent="20"
        lightingColor="#ffe9c9"
        result="spec"
      >
        <feDistantLight azimuth={azimuth} elevation={48} />
      </feSpecularLighting>
      <feComposite in="spec" in2="SourceAlpha" operator="in" result="specIn" />
      <feComposite in="shaded" in2="specIn" operator="arithmetic" k1="0" k2="1" k3="0.55" k4="0" />
    </filter>
  );
}

export default function SvgDefs() {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      width="0"
      height="0"
      style={{ position: "absolute", width: 0, height: 0, overflow: "hidden" }}
    >
      <defs>
        {/* ───────────── Wood (X) ───────────── */}
        <WoodFilter id="wood-a" seed={4} azimuth={180} />
        <WoodFilter id="wood-b" seed={29} azimuth={270} />

        <linearGradient id="plank-shade" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#c9c9c9" />
          <stop offset="0.22" stopColor="#ffffff" />
          <stop offset="0.78" stopColor="#f1f1f1" />
          <stop offset="1" stopColor="#b5b5b5" />
        </linearGradient>
        <linearGradient id="plank-ends" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#000" stopOpacity="0.4" />
          <stop offset="0.05" stopColor="#000" stopOpacity="0" />
          <stop offset="0.95" stopColor="#000" stopOpacity="0" />
          <stop offset="1" stopColor="#000" stopOpacity="0.4" />
        </linearGradient>
        <radialGradient id="knot">
          <stop offset="0" stopColor="#2f2f2f" />
          <stop offset="0.3" stopColor="#5e5e5e" />
          <stop offset="0.55" stopColor="#9b9b9b" />
          <stop offset="0.8" stopColor="#d8d8d8" stopOpacity="0.6" />
          <stop offset="1" stopColor="#ffffff" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="rust-stain">
          <stop offset="0" stopColor="#3b1a08" stopOpacity="0.75" />
          <stop offset="0.55" stopColor="#6b2e10" stopOpacity="0.35" />
          <stop offset="1" stopColor="#6b2e10" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="nail-head" cx="0.38" cy="0.32" r="0.78">
          <stop offset="0" stopColor="#e3e7ea" />
          <stop offset="0.22" stopColor="#a3aaaf" />
          <stop offset="0.68" stopColor="#4d5358" />
          <stop offset="1" stopColor="#24282b" />
        </radialGradient>

        {/* ───────────── Rusty steel (O) ───────────── */}
        <radialGradient id="steel-base" cx="0.42" cy="0.38" r="0.7">
          <stop offset="0" stopColor="#9da6ab" />
          <stop offset="0.45" stopColor="#6d777d" />
          <stop offset="1" stopColor="#40484e" />
        </radialGradient>
        <radialGradient id="steel-dark" cx="0.4" cy="0.35" r="0.75">
          <stop offset="0" stopColor="#9aa3a8" />
          <stop offset="0.6" stopColor="#5f686e" />
          <stop offset="1" stopColor="#3b4247" />
        </radialGradient>
        {/* Concentric lathe marks via a tiny repeating radial gradient */}
        <radialGradient id="lathe" cx="50" cy="50" r="2.6" gradientUnits="userSpaceOnUse" spreadMethod="repeat">
          <stop offset="0" stopColor="#ffffff" stopOpacity="0" />
          <stop offset="0.5" stopColor="#ffffff" stopOpacity="0.09" />
          <stop offset="1" stopColor="#000000" stopOpacity="0.1" />
        </radialGradient>
        <radialGradient id="bolt-end" cx="0.4" cy="0.35" r="0.7">
          <stop offset="0" stopColor="#7d868c" />
          <stop offset="1" stopColor="#262b2e" />
        </radialGradient>

        <filter id="rusty-steel" colorInterpolationFilters="sRGB">
          {/* Rust patches: thresholded low-frequency noise */}
          <feTurbulence type="fractalNoise" baseFrequency="0.045" numOctaves={4} seed={8} result="rn" />
          <feColorMatrix in="rn" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  1 0 0 0 0" result="rA" />
          <feComponentTransfer in="rA" result="patches">
            <feFuncA type="linear" slope="5" intercept="-2.25" />
          </feComponentTransfer>
          {/* Rust creeps in from every edge */}
          <feMorphology in="SourceAlpha" operator="erode" radius="1.8" result="inner" />
          <feComposite in="SourceAlpha" in2="inner" operator="out" result="edge" />
          <feGaussianBlur in="edge" stdDeviation="1.3" result="edgeSoft" />
          <feComposite in="patches" in2="edgeSoft" operator="arithmetic" k1="0" k2="1" k3="0.55" k4="0" result="maskRaw" />
          <feComposite in="maskRaw" in2="SourceAlpha" operator="in" result="rustMask" />
          {/* Rust colour + crusty texture */}
          <feTurbulence type="turbulence" baseFrequency="0.19" numOctaves={3} seed={3} result="rt" />
          <feColorMatrix
            in="rt"
            type="matrix"
            values="0.55 0 0 0 0.3  0.3 0 0 0 0.1  0.1 0 0 0 0.03  0 0 0 0 1"
            result="rustColor"
          />
          <feComposite in="rustColor" in2="rustMask" operator="in" result="rust" />
          <feComposite in="rust" in2="SourceGraphic" operator="over" result="base" />
          {/* Height map: bevel + raised rust crust */}
          <feGaussianBlur in="SourceAlpha" stdDeviation="1.4" result="bump" />
          <feComposite in="rt" in2="rustMask" operator="in" result="pits" />
          <feComposite in="bump" in2="pits" operator="arithmetic" k1="0" k2="1" k3="0.45" k4="0" result="relief" />
          <feDiffuseLighting in="relief" surfaceScale="5" diffuseConstant="1.32" lightingColor="#ffffff" result="diffuse">
            <feDistantLight azimuth={225} elevation={50} />
          </feDiffuseLighting>
          <feComposite in="base" in2="diffuse" operator="arithmetic" k1="1" k2="0" k3="0" k4="0" result="shaded" />
          {/* Metallic highlight only where the steel is still bare */}
          <feSpecularLighting
            in="relief"
            surfaceScale="5"
            specularConstant="0.75"
            specularExponent="38"
            lightingColor="#ffffff"
            result="spec"
          >
            <fePointLight x="24" y="14" z="62" />
          </feSpecularLighting>
          <feComposite in="spec" in2="rustMask" operator="out" result="specBare" />
          <feComposite in="specBare" in2="SourceAlpha" operator="in" result="specClip" />
          <feComposite in="shaded" in2="specClip" operator="arithmetic" k1="0" k2="1" k3="0.8" k4="0" />
        </filter>

        {/* ───────────── Shadows ───────────── */}
        <filter id="piece-shadow" x="-20%" y="-20%" width="145%" height="150%" colorInterpolationFilters="sRGB">
          <feDropShadow dx="2.2" dy="4" stdDeviation="2.4" floodColor="#000" floodOpacity="0.7" />
        </filter>
        <filter id="plank-shadow" x="-10%" y="-10%" width="125%" height="125%" colorInterpolationFilters="sRGB">
          <feDropShadow dx="1.1" dy="2" stdDeviation="1.3" floodColor="#1a0d03" floodOpacity="0.6" />
        </filter>
        <filter id="small-shadow" x="-30%" y="-30%" width="170%" height="170%" colorInterpolationFilters="sRGB">
          <feDropShadow dx="0.7" dy="1.2" stdDeviation="0.8" floodColor="#000" floodOpacity="0.65" />
        </filter>

        {/* ───────────── Board ───────────── */}
        <linearGradient id="frame-steel" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#4b545b" />
          <stop offset="0.5" stopColor="#2c3338" />
          <stop offset="1" stopColor="#1b2024" />
        </linearGradient>
        <radialGradient id="field-steel" cx="0.38" cy="0.3" r="0.9">
          <stop offset="0" stopColor="#36414a" />
          <stop offset="0.6" stopColor="#222a31" />
          <stop offset="1" stopColor="#161b20" />
        </radialGradient>
        <linearGradient id="frame-bevel" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#ffffff" stopOpacity="0.35" />
          <stop offset="0.5" stopColor="#ffffff" stopOpacity="0.04" />
          <stop offset="1" stopColor="#000000" stopOpacity="0.6" />
        </linearGradient>
        <linearGradient id="rod-v" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#14171a" />
          <stop offset="0.28" stopColor="#5d666c" />
          <stop offset="0.42" stopColor="#a9b2b7" />
          <stop offset="0.62" stopColor="#4b545a" />
          <stop offset="1" stopColor="#111416" />
        </linearGradient>
        <linearGradient id="rod-h" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#14171a" />
          <stop offset="0.28" stopColor="#5d666c" />
          <stop offset="0.42" stopColor="#a9b2b7" />
          <stop offset="0.62" stopColor="#4b545a" />
          <stop offset="1" stopColor="#111416" />
        </linearGradient>
        <radialGradient id="brass-dome" cx="0.36" cy="0.3" r="0.8">
          <stop offset="0" stopColor="#fff4c9" />
          <stop offset="0.25" stopColor="#e2b45a" />
          <stop offset="0.7" stopColor="#9a6a22" />
          <stop offset="1" stopColor="#4a3210" />
        </radialGradient>

        <filter id="brushed" x="0" y="0" width="100%" height="100%" colorInterpolationFilters="sRGB">
          <feTurbulence type="fractalNoise" baseFrequency="0.0025 0.6" numOctaves={2} seed={2} result="n" />
          <feColorMatrix in="n" type="matrix" values={GRAY_FROM_R} result="g" />
          <feComposite in="SourceGraphic" in2="g" operator="arithmetic" k1="0.95" k2="0.52" k3="0" k4="0" result="t" />
          <feComposite in="t" in2="SourceAlpha" operator="in" />
        </filter>

        <filter id="field" x="0" y="0" width="100%" height="100%" colorInterpolationFilters="sRGB">
          <feTurbulence type="fractalNoise" baseFrequency="0.003 0.7" numOctaves={2} seed={5} result="n" />
          <feColorMatrix in="n" type="matrix" values={GRAY_FROM_R} result="g" />
          <feComposite in="SourceGraphic" in2="g" operator="arithmetic" k1="0.9" k2="0.55" k3="0" k4="0" result="t" />
          <feComposite in="t" in2="SourceAlpha" operator="in" result="tex" />
          {/* Recessed: inner shadow along the top-left edge */}
          <feFlood floodColor="#000" floodOpacity="0.85" />
          <feComposite in2="SourceAlpha" operator="out" />
          <feGaussianBlur stdDeviation="5" />
          <feOffset dx="3" dy="4" />
          <feComposite in2="SourceAlpha" operator="in" result="inset" />
          <feMerge>
            <feMergeNode in="tex" />
            <feMergeNode in="inset" />
          </feMerge>
        </filter>

        <filter id="grime" x="0" y="0" width="100%" height="100%" colorInterpolationFilters="sRGB">
          <feTurbulence type="fractalNoise" baseFrequency="0.011" numOctaves={4} seed={11} result="n" />
          <feColorMatrix in="n" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  -2.6 0 0 0 1.45" result="a" />
          <feComposite in="a" in2="SourceAlpha" operator="in" />
        </filter>

        <filter id="rod-shadow" x="-30%" y="-10%" width="160%" height="125%" colorInterpolationFilters="sRGB">
          <feDropShadow dx="2" dy="3" stdDeviation="2" floodColor="#000" floodOpacity="0.75" />
        </filter>

        {/* ───────────── Win line: glowing hot metal ───────────── */}
        <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="5" />
        </filter>
      </defs>
    </svg>
  );
}
