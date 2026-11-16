import type { Mode, Player } from "@/lib/game";
import { SHIFTING_MOVE_LIMIT } from "@/lib/game";
import type { Scores } from "@/lib/persistent";
import WoodX from "./markers/WoodX";
import GearO from "./markers/GearO";

export const NAME: Record<Player, string> = { X: "Wood", O: "Gear" };

export function Marker({ player, className }: { player: Player; className?: string }) {
  return player === "X" ? <WoodX className={className} /> : <GearO className={className} />;
}

/* ───────── Player cards (desktop side panels) ───────── */

export function PlayerCard({
  player,
  wins,
  active,
  winner,
  className = "",
}: {
  player: Player;
  wins: number;
  active: boolean;
  winner: boolean;
  className?: string;
}) {
  return (
    <section
      aria-label={`${NAME[player]}, player ${player}`}
      className={`plaque w-48 flex-col items-center gap-1 px-5 pb-5 pt-6 ${active || winner ? "plaque-active" : ""} ${className}`}
    >
      <Marker player={player} className="h-24 w-24" />
      <h2 className="engraved mt-2 font-display text-2xl uppercase tracking-[0.22em]">{NAME[player]}</h2>
      <p className="text-xs uppercase tracking-[0.25em] text-ink-muted">Player {player}</p>
      <p className="engraved mt-3 font-display text-6xl tabular-nums leading-none" aria-label={`${wins} wins`}>
        {wins}
      </p>
      <p className="text-xs uppercase tracking-[0.25em] text-ink-muted">Wins</p>
      <p className="mt-3 h-6 font-display text-sm uppercase tracking-[0.2em] text-brass-bright">
        {winner ? "Winner" : active ? "Your turn" : ""}
      </p>
    </section>
  );
}

/* ───────── Compact score row (phones / tablets) ───────── */

function Tally({
  label,
  value,
  icon,
  highlight,
  tag,
}: {
  label: string;
  value: number;
  icon?: React.ReactNode;
  highlight?: boolean;
  tag?: string;
}) {
  return (
    <div className={`plaque flex min-w-0 flex-1 items-center justify-center gap-2 px-2 py-2 ${highlight ? "plaque-active" : ""}`}>
      {icon}
      <div className="flex min-w-0 flex-col leading-tight">
        <span className={`truncate text-[11px] uppercase tracking-[0.18em] ${highlight ? "text-brass-bright" : "text-ink-muted"}`}>
          {tag ?? label}
        </span>
        <span className="engraved font-display text-2xl tabular-nums" aria-label={`${label}: ${value}`}>
          {value}
        </span>
      </div>
    </div>
  );
}

export function ScoreRow({
  scores,
  current,
  winner,
  over,
  className = "",
}: {
  scores: Scores;
  current: Player;
  winner: Player | null;
  over: boolean;
  className?: string;
}) {
  const tagFor = (p: Player) => (winner === p ? "Winner" : NAME[p]);
  return (
    <div className={`flex w-full gap-2 ${className}`} aria-label="Scoreboard">
      <Tally
        label={`${NAME.X} wins`}
        tag={tagFor("X")}
        value={scores.X}
        highlight={winner === "X" || (!over && current === "X")}
        icon={<WoodX className="h-9 w-9 shrink-0" />}
      />
      <Tally label="Draws" value={scores.draws} />
      <Tally
        label={`${NAME.O} wins`}
        tag={tagFor("O")}
        value={scores.O}
        highlight={winner === "O" || (!over && current === "O")}
        icon={<GearO className="h-9 w-9 shrink-0" />}
      />
    </div>
  );
}

/* ───────── Mode toggle ───────── */

const MODE_HINT: Record<Mode, string> = {
  classic: "Get three in a row to win.",
  shifting: "Only 3 pieces each: placing a 4th removes your oldest.",
};

export function ModeToggle({ mode, onChange }: { mode: Mode; onChange: (m: Mode) => void }) {
  return (
    <div className="flex flex-col items-center gap-1.5">
      <div role="group" aria-label="Game mode" className="plaque inline-flex gap-1 p-1">
        {(["classic", "shifting"] as const).map((m) => (
          <button key={m} type="button" className="seg" aria-pressed={mode === m} onClick={() => onChange(m)}>
            {m === "classic" ? "Classic" : "Shifting"}
          </button>
        ))}
      </div>
      <p className="text-center text-xs text-ink-muted">{MODE_HINT[mode]}</p>
    </div>
  );
}

/* ───────── Status line ───────── */

export function StatusBar({
  mode,
  current,
  winner,
  isDraw,
  moveCount,
  hasFragile,
}: {
  mode: Mode;
  current: Player;
  winner: Player | null;
  isDraw: boolean;
  moveCount: number;
  hasFragile: boolean;
}) {
  let sub = "";
  if (winner) sub = "Three in a row.";
  else if (isDraw) sub = mode === "shifting" ? `No winner after ${SHIFTING_MOVE_LIMIT} moves.` : "The board is full.";
  else if (moveCount === 0) sub = `${NAME[current]} starts this round.`;
  else if (hasFragile) sub = "Your cracked piece vanishes next.";

  return (
    <div className="flex min-h-[4.25rem] w-full flex-col items-center justify-center gap-0.5 text-center">
      <div aria-live="polite" aria-atomic="true" className="flex items-center gap-2.5">
        {winner ? (
          <>
            <Marker player={winner} className="h-10 w-10" />
            <span className="engraved font-display text-3xl uppercase tracking-[0.12em] text-brass-bright">
              {NAME[winner]} wins!
            </span>
          </>
        ) : isDraw ? (
          <span className="engraved font-display text-3xl uppercase tracking-[0.12em] text-ink">It&apos;s a draw</span>
        ) : (
          <>
            <Marker player={current} className="h-8 w-8" />
            <span className="engraved font-display text-2xl uppercase tracking-[0.12em]">{NAME[current]}&apos;s turn</span>
          </>
        )}
        <span className="sr-only">{sub}</span>
      </div>
      <p aria-hidden="true" className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-sm text-ink-muted">
        {sub && <span>{sub}</span>}
        {mode === "shifting" && !winner && !isDraw && (
          <span className="whitespace-nowrap rounded-md border border-white/10 bg-black/30 px-2 py-0.5 font-display text-xs uppercase tracking-[0.15em] tabular-nums">
            Move {moveCount + 1} / {SHIFTING_MOVE_LIMIT}
          </span>
        )}
      </p>
    </div>
  );
}
