"use client";

import { MotionConfig } from "motion/react";
import { useEffect, useRef, useState } from "react";
import {
  SHIFTING_MAX_PIECES,
  applyMove,
  createGame,
  fragileCell,
  gameReducer,
  isOver,
  type Mode,
} from "@/lib/game";
import { mutedStore, recordResult, resetScores, scoresStore } from "@/lib/persistent";
import { drawThud, haptic, metalClank, vanish, winChime, woodKnock } from "@/lib/sound";
import Backdrop from "./Backdrop";
import Board from "./Board";
import SvgDefs from "./SvgDefs";
import { ModeToggle, PlayerCard, ScoreRow, StatusBar } from "./Hud";

function SoundToggle({ muted, onToggle }: { muted: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={!muted}
      aria-label={muted ? "Sound off. Turn sound on" : "Sound on. Turn sound off"}
      className="plaque flex h-11 w-11 items-center justify-center text-ink-muted hover:text-ink"
    >
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M11 5 6 9H3v6h3l5 4V5z" fill="currentColor" stroke="none" />
        {muted ? (
          <path d="m22 9-6 6M16 9l6 6" />
        ) : (
          <path d="M15.5 8.5a5 5 0 0 1 0 7M18.5 5.5a9 9 0 0 1 0 13" />
        )}
      </svg>
    </button>
  );
}

export default function Game() {
  const [game, setGame] = useState(() => createGame("classic", "X"));
  const scores = scoresStore.useValue();
  const muted = mutedStore.useValue();
  const [confirmReset, setConfirmReset] = useState(false);
  const resetTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const againRef = useRef<HTMLButtonElement>(null);

  const over = isOver(game);
  const fragile = fragileCell(game);

  // Move focus to the primary action when a round ends (keyboard & screen-reader friendly).
  useEffect(() => {
    if (over) againRef.current?.focus({ preventScroll: true });
  }, [over]);

  useEffect(() => () => {
    if (resetTimer.current) clearTimeout(resetTimer.current);
  }, []);

  const place = (cell: number) => {
    const next = applyMove(game, cell);
    if (next === game) return;
    const vanished = game.mode === "shifting" && game.moves.length >= SHIFTING_MAX_PIECES;
    setGame(next);

    if (next.winner) recordResult(next.winner);
    else if (next.isDraw) recordResult("draw");

    if (!muted) {
      if (game.current === "X") woodKnock();
      else metalClank();
      if (vanished) vanish();
      if (next.winner) winChime();
      else if (next.isDraw) drawThud();
      haptic(next.winner ? [18, 60, 28] : 10);
    }
  };

  const newRound = () => setGame((g) => gameReducer(g, { type: "NEW_ROUND" }));
  const setMode = (mode: Mode) => setGame((g) => gameReducer(g, { type: "SET_MODE", mode }));

  const onReset = () => {
    if (resetTimer.current) clearTimeout(resetTimer.current);
    if (confirmReset) {
      resetScores();
      setConfirmReset(false);
      return;
    }
    setConfirmReset(true);
    resetTimer.current = setTimeout(() => setConfirmReset(false), 3500);
  };

  return (
    <MotionConfig reducedMotion="user">
      <SvgDefs />
      <Backdrop />
      <main className="relative z-10 mx-auto flex min-h-svh w-full max-w-6xl flex-col items-center gap-3 px-4 pb-5 pt-3 sm:gap-4 lg:justify-center lg:gap-5">
        <header className="grid w-full max-w-[520px] grid-cols-[2.75rem_1fr_2.75rem] items-center gap-y-3 lg:max-w-5xl lg:grid-cols-[1fr_auto_1fr]">
          <div className="lg:hidden" aria-hidden="true" />
          <div className="col-start-2 row-start-1 text-center lg:col-start-1 lg:text-left">
            <h1 className="engraved font-display text-2xl uppercase tracking-[0.22em] sm:text-3xl">
              Wood <span className="text-brass">&amp;</span> Gear
            </h1>
            <p className="text-[11px] uppercase tracking-[0.3em] text-ink-muted">Tic-Tac-Toe · 2 Players</p>
          </div>
          <div className="col-span-3 row-start-2 lg:col-span-1 lg:col-start-2 lg:row-start-1">
            <ModeToggle mode={game.mode} onChange={setMode} />
          </div>
          <div className="col-start-3 row-start-1 flex items-center gap-3 justify-self-end">
            <div className="plaque hidden h-11 items-center gap-3 px-4 lg:flex" aria-label={`Draws: ${scores.draws}`}>
              <span className="text-xs uppercase tracking-[0.25em] text-ink-muted">Draws</span>
              <span className="engraved font-display text-2xl tabular-nums">{scores.draws}</span>
            </div>
            <SoundToggle muted={muted} onToggle={() => mutedStore.set((m) => !m)} />
          </div>
        </header>

        <div className="grid w-full items-center justify-items-center gap-3 sm:gap-4 lg:grid-cols-[1fr_auto_1fr] lg:gap-10">
          <PlayerCard
            player="X"
            wins={scores.X}
            active={!over && game.current === "X"}
            winner={game.winner === "X"}
            className="hidden lg:flex lg:justify-self-end"
          />

          <div className="flex w-full flex-col items-center gap-3 sm:gap-4">
            <ScoreRow
              className="max-w-[520px] lg:hidden"
              scores={scores}
              current={game.current}
              winner={game.winner}
              over={over}
            />

            <Board game={game} fragile={fragile} onPlace={place} />

            <StatusBar
              mode={game.mode}
              current={game.current}
              winner={game.winner}
              isDraw={game.isDraw}
              moveCount={game.moveCount}
              hasFragile={fragile !== null}
            />

            <div className="flex flex-wrap items-center justify-center gap-3">
              <button
                ref={againRef}
                type="button"
                onClick={newRound}
                className={`btn ${over ? "btn-brass beckon" : "btn-steel"}`}
              >
                {over ? "Play again" : "Restart round"}
              </button>
              <button
                type="button"
                onClick={onReset}
                className={`min-h-12 px-3 text-sm underline-offset-4 hover:underline ${confirmReset ? "text-rust" : "text-ink-muted"}`}
              >
                {confirmReset ? "Tap again to reset" : "Reset scores"}
              </button>
            </div>
          </div>

          <PlayerCard
            player="O"
            wins={scores.O}
            active={!over && game.current === "O"}
            winner={game.winner === "O"}
            className="hidden lg:flex lg:justify-self-start"
          />
        </div>
      </main>
    </MotionConfig>
  );
}
