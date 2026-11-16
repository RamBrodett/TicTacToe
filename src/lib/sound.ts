/**
 * Synthesised sound effects (Web Audio API): no audio files to load or license.
 * The AudioContext is created lazily on the first user gesture.
 */

let ctx: AudioContext | null = null;
let out: GainNode | null = null;
let noise: AudioBuffer | null = null;

function audio(): { c: AudioContext; out: GainNode } | null {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const AC =
      window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
    out = ctx.createGain();
    out.gain.value = 0.55;
    out.connect(ctx.destination);
  }
  if (ctx.state === "suspended") void ctx.resume();
  return { c: ctx, out: out! };
}

function noiseBuffer(c: AudioContext) {
  if (!noise) {
    noise = c.createBuffer(1, c.sampleRate, c.sampleRate);
    const data = noise.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
  }
  return noise;
}

function env(c: AudioContext, t: number, peak: number, decay: number, attack = 0.004) {
  const g = c.createGain();
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(peak, t + attack);
  g.gain.exponentialRampToValueAtTime(0.0001, t + attack + decay);
  return g;
}

function tone(c: AudioContext, dest: AudioNode, freq: number, t: number, peak: number, decay: number, type: OscillatorType = "sine") {
  const o = c.createOscillator();
  o.type = type;
  o.frequency.setValueAtTime(freq, t);
  const g = env(c, t, peak, decay);
  o.connect(g).connect(dest);
  o.start(t);
  o.stop(t + decay + 0.05);
  return o;
}

function burst(c: AudioContext, dest: AudioNode, t: number, filter: BiquadFilterType, freq: number, q: number, peak: number, decay: number) {
  const src = c.createBufferSource();
  src.buffer = noiseBuffer(c);
  const f = c.createBiquadFilter();
  f.type = filter;
  f.frequency.setValueAtTime(freq, t);
  f.Q.value = q;
  const g = env(c, t, peak, decay, 0.002);
  src.connect(f).connect(g).connect(dest);
  src.start(t);
  src.stop(t + decay + 0.05);
  return f;
}

/** Hollow wooden knock for X. */
export function woodKnock() {
  const a = audio();
  if (!a) return;
  const { c, out } = a;
  const t = c.currentTime;
  const body = tone(c, out, 210, t, 0.55, 0.16);
  body.frequency.exponentialRampToValueAtTime(110, t + 0.14);
  tone(c, out, 620, t, 0.12, 0.06, "triangle");
  burst(c, out, t, "bandpass", 1300, 2.2, 0.4, 0.06);
}

/** Inharmonic metallic clank for O. */
export function metalClank() {
  const a = audio();
  if (!a) return;
  const { c, out } = a;
  const t = c.currentTime;
  const partials: [number, number, number][] = [
    [392, 0.2, 0.55],
    [1013, 0.12, 0.38],
    [1687, 0.08, 0.28],
    [2610, 0.05, 0.2],
  ];
  for (const [f, g, d] of partials) tone(c, out, f, t, g, d);
  burst(c, out, t, "highpass", 3200, 0.7, 0.25, 0.035);
}

/** Dry crumble when the oldest piece vanishes. */
export function vanish() {
  const a = audio();
  if (!a) return;
  const { c, out } = a;
  const t = c.currentTime + 0.05;
  const f = burst(c, out, t, "bandpass", 2600, 1.4, 0.16, 0.38);
  f.frequency.exponentialRampToValueAtTime(380, t + 0.36);
}

/** Bright brass bell arpeggio for a win. */
export function winChime() {
  const a = audio();
  if (!a) return;
  const { c, out } = a;
  const t0 = c.currentTime + 0.12;
  [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => {
    const t = t0 + i * 0.11;
    tone(c, out, f, t, 0.16, 0.9);
    tone(c, out, f * 2.76, t, 0.04, 0.45);
  });
}

/** Low, neutral double thud for a draw. */
export function drawThud() {
  const a = audio();
  if (!a) return;
  const { c, out } = a;
  const t = c.currentTime + 0.1;
  tone(c, out, 146.8, t, 0.3, 0.35);
  tone(c, out, 110, t + 0.18, 0.3, 0.45);
}

export function haptic(pattern: number | number[]) {
  if (typeof navigator !== "undefined" && "vibrate" in navigator) {
    try {
      navigator.vibrate(pattern);
    } catch {
      /* unsupported */
    }
  }
}
