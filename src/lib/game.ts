/**
 * Pure tic-tac-toe rules for both modes. No React, no DOM: easy to unit test.
 *
 * Cells are numbered 0..8, left-to-right, top-to-bottom.
 */

export type Player = "X" | "O";
export type Mode = "classic" | "shifting";

export interface Move {
  cell: number;
  player: Player;
  /** Global move number in this round (1-based). Doubles as a stable React key. */
  id: number;
}

export interface GameState {
  mode: Mode;
  /** Pieces currently on the board, oldest first. Single source of truth. */
  moves: Move[];
  current: Player;
  /** Who made the first move this round. Alternates every round. */
  starter: Player;
  /** Total moves played this round (keeps counting after pieces vanish). */
  moveCount: number;
  winner: Player | null;
  winLine: readonly number[] | null;
  isDraw: boolean;
}

export type GameAction =
  | { type: "PLACE"; cell: number }
  | { type: "NEW_ROUND" }
  | { type: "SET_MODE"; mode: Mode };

/** Max pieces on the board in Shifting mode (3 per player). */
export const SHIFTING_MAX_PIECES = 6;
/** Shifting rounds with no winner after this many moves are a draw. */
export const SHIFTING_MOVE_LIMIT = 30;

export const WIN_LINES: readonly (readonly number[])[] = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
];

export const other = (p: Player): Player => (p === "X" ? "O" : "X");

export function createGame(mode: Mode = "classic", starter: Player = "X"): GameState {
  return {
    mode,
    moves: [],
    current: starter,
    starter,
    moveCount: 0,
    winner: null,
    winLine: null,
    isDraw: false,
  };
}

/** 9-cell view of the board derived from the move list. */
export function boardOf(moves: readonly Move[]): (Player | null)[] {
  const board: (Player | null)[] = Array(9).fill(null);
  for (const m of moves) board[m.cell] = m.player;
  return board;
}

export function findWin(
  board: readonly (Player | null)[],
): { winner: Player; line: readonly number[] } | null {
  for (const line of WIN_LINES) {
    const [a, b, c] = line;
    const p = board[a];
    if (p && p === board[b] && p === board[c]) return { winner: p, line };
  }
  return null;
}

export const isOver = (s: GameState) => s.winner !== null || s.isDraw;

/**
 * In Shifting mode, the cell whose piece will vanish when the current player
 * moves (always that player's own oldest piece). Null when nothing will vanish.
 */
export function fragileCell(s: GameState): number | null {
  if (s.mode !== "shifting" || isOver(s)) return null;
  return s.moves.length >= SHIFTING_MAX_PIECES ? s.moves[0].cell : null;
}

export function applyMove(s: GameState, cell: number): GameState {
  if (isOver(s) || !Number.isInteger(cell) || cell < 0 || cell > 8) return s;
  if (s.moves.some((m) => m.cell === cell)) return s;

  let moves = s.moves;
  if (s.mode === "shifting" && moves.length >= SHIFTING_MAX_PIECES) {
    // Oldest piece vanishes as the new one lands.
    moves = moves.slice(1);
  }

  const moveCount = s.moveCount + 1;
  moves = [...moves, { cell, player: s.current, id: moveCount }];

  const win = findWin(boardOf(moves));
  const isDraw =
    !win &&
    (s.mode === "classic" ? moves.length === 9 : moveCount >= SHIFTING_MOVE_LIMIT);

  return {
    ...s,
    moves,
    moveCount,
    winner: win?.winner ?? null,
    winLine: win?.line ?? null,
    isDraw,
    current: win || isDraw ? s.current : other(s.current),
  };
}

export function gameReducer(s: GameState, action: GameAction): GameState {
  switch (action.type) {
    case "PLACE":
      return applyMove(s, action.cell);
    case "NEW_ROUND":
      return createGame(s.mode, other(s.starter));
    case "SET_MODE":
      if (action.mode === s.mode) return s;
      return createGame(action.mode, other(s.starter));
  }
}
