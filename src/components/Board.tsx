"use client";

import { AnimatePresence, motion, type TargetAndTransition } from "motion/react";
import { useRef, useState, type KeyboardEvent } from "react";
import type { GameState, Move, Player } from "@/lib/game";
import { isOver } from "@/lib/game";
import Cracks from "./markers/Cracks";
import { Marker } from "./Hud";

/* Board geometry in a 300×300 viewBox: 12-unit frame, 3 cells of 92. */
const FRAME = 12;
const CELL = 92;
const center = (i: number) => FRAME + CELL * (i + 0.5);
const RODS = [FRAME + CELL, FRAME + CELL * 2];
const CORNER_RIVETS = [
  [6.5, 6.5],
  [150, 6.5],
  [293.5, 6.5],
  [6.5, 150],
  [293.5, 150],
  [6.5, 293.5],
  [150, 293.5],
  [293.5, 293.5],
];
const SCRATCHES = [
  "M40 70 l46 -9",
  "M188 60 l38 12",
  "M60 230 l30 -26",
  "M210 214 l44 6",
  "M120 160 l22 18",
  "M230 120 l-14 30",
];

const NAMES: Record<Player, string> = { X: "wood X", O: "gear O" };

function Plate() {
  return (
    <svg viewBox="0 0 300 300" className="absolute inset-0 h-full w-full" aria-hidden="true" focusable="false">
      {/* Drop shadow of the whole plate onto the wall */}
      <rect x="6" y="12" width="292" height="292" rx="18" fill="#000" opacity="0.55" filter="url(#glow)" />
      {/* Frame */}
      <rect width="300" height="300" rx="16" fill="url(#frame-steel)" filter="url(#brushed)" />
      <rect x="1" y="1" width="298" height="298" rx="15" fill="none" stroke="url(#frame-bevel)" strokeWidth="2" />
      {/* Recessed playfield */}
      <rect x={FRAME} y={FRAME} width={300 - FRAME * 2} height={300 - FRAME * 2} rx="7" fill="url(#field-steel)" filter="url(#field)" />
      <rect x={FRAME} y={FRAME} width={300 - FRAME * 2} height={300 - FRAME * 2} rx="7" fill="#000" opacity="0.45" filter="url(#grime)" />
      <rect
        x={FRAME - 0.5}
        y={FRAME - 0.5}
        width={300 - FRAME * 2 + 1}
        height={300 - FRAME * 2 + 1}
        rx="7.5"
        fill="none"
        stroke="#ffffff"
        strokeOpacity="0.07"
      />
      <g stroke="#ffffff" strokeOpacity="0.06" strokeWidth="0.7" strokeLinecap="round">
        {SCRATCHES.map((d) => (
          <path key={d} d={d} />
        ))}
      </g>
      {/* Iron grid rods */}
      <g filter="url(#rod-shadow)">
        {RODS.map((x) => (
          <rect key={`v${x}`} x={x - 4} y={FRAME + 5} width="8" height={300 - FRAME * 2 - 10} rx="4" fill="url(#rod-v)" />
        ))}
        {RODS.map((y) => (
          <rect key={`h${y}`} x={FRAME + 5} y={y - 4} width={300 - FRAME * 2 - 10} height="8" rx="4" fill="url(#rod-h)" />
        ))}
      </g>
      {/* Brass rivets: rod crossings + frame */}
      <g filter="url(#small-shadow)">
        {RODS.flatMap((x) => RODS.map((y) => <circle key={`b${x}-${y}`} cx={x} cy={y} r="6.5" fill="url(#brass-dome)" />))}
        {CORNER_RIVETS.map(([x, y]) => (
          <circle key={`r${x}-${y}`} cx={x} cy={y} r="3.6" fill="url(#brass-dome)" />
        ))}
      </g>
    </svg>
  );
}

function WinLine({ line }: { line: readonly number[] }) {
  const [a, , c] = line;
  let x1 = center(a % 3);
  let y1 = center(Math.floor(a / 3));
  let x2 = center(c % 3);
  let y2 = center(Math.floor(c / 3));
  const len = Math.hypot(x2 - x1, y2 - y1);
  const ext = 30;
  const ux = (x2 - x1) / len;
  const uy = (y2 - y1) / len;
  x1 -= ux * ext;
  y1 -= uy * ext;
  x2 += ux * ext;
  y2 += uy * ext;
  const d = `M ${x1} ${y1} L ${x2} ${y2}`;
  const draw = { pathLength: 1, opacity: 1 };
  const t = { duration: 0.45, ease: "easeOut" as const, delay: 0.15 };
  return (
    <svg viewBox="0 0 300 300" className="pointer-events-none absolute inset-0 h-full w-full" aria-hidden="true">
      <motion.path d={d} stroke="#ff6a14" strokeWidth="16" strokeLinecap="round" fill="none" filter="url(#glow)"
        initial={{ pathLength: 0, opacity: 0 }} animate={{ pathLength: 1, opacity: 0.75 }} transition={t} />
      <motion.path d={d} stroke="#ffae42" strokeWidth="8" strokeLinecap="round" fill="none"
        initial={{ pathLength: 0, opacity: 0 }} animate={draw} transition={t} />
      <motion.path d={d} stroke="#fff4cf" strokeWidth="3" strokeLinecap="round" fill="none"
        initial={{ pathLength: 0, opacity: 0 }} animate={draw} transition={t} />
    </svg>
  );
}

type PieceState = "idle" | "fragile" | "dim";

function pieceAnimate(state: PieceState): TargetAndTransition {
  switch (state) {
    case "fragile":
      return {
        opacity: [0.85, 0.4, 0.85],
        scale: 0.94,
        rotate: 0,
        transition: { opacity: { repeat: Infinity, duration: 1.6, ease: "easeInOut" }, scale: { duration: 0.3 } },
      };
    case "dim":
      return { opacity: 0.32, scale: 0.96, rotate: 0, transition: { duration: 0.4 } };
    default:
      return { opacity: 1, scale: 1, rotate: 0, transition: { type: "spring", stiffness: 520, damping: 26 } };
  }
}

function Piece({ move, state }: { move: Move; state: PieceState }) {
  const isX = move.player === "X";
  return (
    <motion.div
      className="absolute inset-[5%] will-change-transform"
      initial={isX ? { opacity: 0, scale: 1.4, rotate: -10 } : { opacity: 0, scale: 0.55, rotate: -140 }}
      animate={pieceAnimate(state)}
      exit={{ opacity: 0, scale: 0.6, rotate: isX ? 8 : 90, transition: { duration: 0.35, ease: "easeIn" } }}
    >
      <Marker player={move.player} className="h-full w-full" />
      {state === "fragile" && <Cracks className="absolute inset-0 h-full w-full" />}
    </motion.div>
  );
}

interface BoardProps {
  game: GameState;
  fragile: number | null;
  onPlace: (cell: number) => void;
}

const KEY_DELTA: Record<string, [number, number]> = {
  ArrowUp: [-1, 0],
  ArrowDown: [1, 0],
  ArrowLeft: [0, -1],
  ArrowRight: [0, 1],
};

export default function Board({ game, fragile, onPlace }: BoardProps) {
  const [focusIdx, setFocusIdx] = useState(4);
  const cellRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const over = isOver(game);
  const byCell = new Map(game.moves.map((m) => [m.cell, m]));

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const delta = KEY_DELTA[e.key];
    if (!delta) return;
    e.preventDefault();
    // Derive the origin from the element that actually has focus, not from state,
    // so a mouse click or Tab just before the key press can never desync it.
    const fromTarget = cellRefs.current.indexOf(e.target as HTMLButtonElement);
    const from = fromTarget >= 0 ? fromTarget : focusIdx;
    const r = (Math.floor(from / 3) + delta[0] + 3) % 3;
    const c = ((from % 3) + delta[1] + 3) % 3;
    const next = r * 3 + c;
    setFocusIdx(next);
    cellRefs.current[next]?.focus();
  };

  return (
    <div className="board-size relative aspect-square select-none">
      <Plate />
      <div
        role="group"
        aria-label="Game board"
        onKeyDown={onKeyDown}
        className="absolute inset-[4%] grid grid-cols-3 grid-rows-3"
      >
        {Array.from({ length: 9 }, (_, i) => {
          const move = byCell.get(i);
          const isFragile = fragile === i;
          const isWinning = game.winLine?.includes(i) ?? false;
          const playable = !move && !over;
          const state: PieceState = isFragile
            ? "fragile"
            : over && game.winner && !isWinning
              ? "dim"
              : "idle";
          const label =
            `Row ${Math.floor(i / 3) + 1}, column ${(i % 3) + 1}, ` +
            (move ? NAMES[move.player] : "empty") +
            (isFragile ? ", vanishes next" : "") +
            (isWinning ? ", winning line" : "");
          return (
            <button
              key={i}
              ref={(el) => {
                cellRefs.current[i] = el;
              }}
              type="button"
              tabIndex={focusIdx === i ? 0 : -1}
              aria-label={label}
              aria-disabled={!playable}
              onFocus={() => setFocusIdx(i)}
              onClick={() => playable && onPlace(i)}
              className={`cell group relative rounded-md outline-none ${playable ? "cursor-pointer" : "cursor-default"}`}
            >
              <AnimatePresence>{move && <Piece key={move.id} move={move} state={state} />}</AnimatePresence>
              {playable && (
                <div className="absolute inset-[5%] hidden opacity-25 group-hover:block">
                  <Marker player={game.current} className="h-full w-full" />
                </div>
              )}
            </button>
          );
        })}
      </div>
      {game.winLine && <WinLine key={game.winLine.join("")} line={game.winLine} />}
    </div>
  );
}
