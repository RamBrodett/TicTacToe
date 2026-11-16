import { describe, expect, it } from "vitest";
import {
  WIN_LINES,
  SHIFTING_MOVE_LIMIT,
  applyMove,
  boardOf,
  createGame,
  fragileCell,
  gameReducer,
  type GameState,
  type Mode,
} from "./game";

const play = (cells: number[], mode: Mode = "classic", start?: GameState) =>
  cells.reduce((s, c) => applyMove(s, c), start ?? createGame(mode));

describe("classic", () => {
  it.each(WIN_LINES.map((l) => [l]))("detects win on line %j", (line) => {
    // X takes the line; O plays in two cells not on it.
    const others = [0, 1, 2, 3, 4, 5, 6, 7, 8].filter((c) => !line.includes(c));
    const s = play([line[0], others[0], line[1], others[1], line[2]]);
    expect(s.winner).toBe("X");
    expect(s.winLine).toEqual(line);
    expect(s.isDraw).toBe(false);
  });

  it("detects a draw on a full board", () => {
    // X O X / X O O / O X X
    const s = play([0, 1, 2, 4, 3, 5, 7, 6, 8]);
    expect(s.winner).toBeNull();
    expect(s.isDraw).toBe(true);
  });

  it("ignores occupied cells and moves after the round ends", () => {
    let s = play([4]);
    expect(applyMove(s, 4)).toBe(s);
    s = play([0, 3, 1, 4, 2]); // X wins top row
    expect(s.winner).toBe("X");
    expect(applyMove(s, 8)).toBe(s);
  });

  it("alternates turns", () => {
    const s = play([0]);
    expect(s.current).toBe("O");
    expect(play([0, 1]).current).toBe("X");
  });
});

describe("shifting", () => {
  it("removes the mover's oldest piece on the 7th move; never more than 6 on the board", () => {
    // X:0 O:1 X:5 O:3 X:7 O:8  (no win)
    let s = play([0, 1, 5, 3, 7, 8], "shifting");
    expect(s.moves).toHaveLength(6);
    expect(s.winner).toBeNull();
    expect(fragileCell(s)).toBe(0); // X's first piece

    s = applyMove(s, 6); // X's 4th piece; cell 0 vanishes
    expect(s.moves).toHaveLength(6);
    expect(boardOf(s.moves)[0]).toBeNull();
    expect(boardOf(s.moves)[6]).toBe("X");
    expect(fragileCell(s)).toBe(1); // now O's oldest

    s = applyMove(s, 2); // O; cell 1 vanishes
    expect(s.moves).toHaveLength(6);
    expect(boardOf(s.moves)[1]).toBeNull();
  });

  it("does not allow playing on the fragile cell (it is still occupied)", () => {
    const s = play([0, 1, 5, 3, 7, 8], "shifting");
    expect(applyMove(s, 0)).toBe(s);
  });

  it("no fragile cell before the board holds 6 pieces", () => {
    expect(fragileCell(play([0, 1, 5, 3, 7], "shifting"))).toBeNull();
    expect(fragileCell(play([0, 1, 5, 3, 7, 8]))).toBeNull(); // classic
  });

  it("counts a win formed right after a removal", () => {
    // X:8 O:0 X:1 O:3 X:4 O:5 -> X plays 7: X's 8 vanishes, X has 1,4,7 = win.
    const s = play([8, 0, 1, 3, 4, 5, 7], "shifting");
    expect(boardOf(s.moves)[8]).toBeNull();
    expect(s.winner).toBe("X");
    expect(s.winLine).toEqual([1, 4, 7]);
    expect(fragileCell(s)).toBeNull();
  });

  it("removed piece does not count toward a win", () => {
    // X:0 O:4 X:1 O:8 X:5 O:3 -> X plays 2: X's 0 vanishes, so 0-1-2 is NOT a win.
    const s = play([0, 4, 1, 8, 5, 3, 2], "shifting");
    expect(boardOf(s.moves)[0]).toBeNull();
    expect(s.winner).toBeNull();
  });

  it(`is a draw after ${SHIFTING_MOVE_LIMIT} moves without a winner`, () => {
    // Both players avoid winning moves whenever possible.
    let s = createGame("shifting");
    const seq = [0, 1, 5, 3, 7, 8, 6, 2, 4]; // reused cyclically when free
    let i = 0;
    while (!s.winner && !s.isDraw && i < 500) {
      const free = [0, 1, 2, 3, 4, 5, 6, 7, 8].filter(
        (c) => !s.moves.some((m) => m.cell === c),
      );
      // pick first free cell from the sequence that doesn't hand a win to the mover
      const pick =
        seq.concat(free).find((c) => free.includes(c) && !applyMove(s, c).winner) ??
        free[0];
      s = applyMove(s, pick);
      i++;
    }
    expect(s.winner).toBeNull();
    expect(s.isDraw).toBe(true);
    expect(s.moveCount).toBe(SHIFTING_MOVE_LIMIT);
  });
});

describe("reducer", () => {
  it("alternates the starting player each round", () => {
    let s = createGame("classic", "X");
    s = gameReducer(s, { type: "PLACE", cell: 0 });
    s = gameReducer(s, { type: "NEW_ROUND" });
    expect(s.moves).toHaveLength(0);
    expect(s.starter).toBe("O");
    expect(s.current).toBe("O");
    s = gameReducer(s, { type: "NEW_ROUND" });
    expect(s.starter).toBe("X");
  });

  it("switching mode starts a fresh round; same mode is a no-op", () => {
    let s = gameReducer(createGame("classic"), { type: "PLACE", cell: 4 });
    expect(gameReducer(s, { type: "SET_MODE", mode: "classic" })).toBe(s);
    s = gameReducer(s, { type: "SET_MODE", mode: "shifting" });
    expect(s.mode).toBe("shifting");
    expect(s.moves).toHaveLength(0);
    expect(s.moveCount).toBe(0);
  });
});
