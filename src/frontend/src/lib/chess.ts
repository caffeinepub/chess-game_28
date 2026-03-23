export type PieceType = "K" | "Q" | "R" | "B" | "N" | "P";
export type Color = "w" | "b";

export interface Piece {
  type: PieceType;
  color: Color;
}

export type Board = (Piece | null)[];

export interface CastlingRights {
  wK: boolean;
  wQ: boolean;
  bK: boolean;
  bQ: boolean;
}

export interface GameState {
  board: Board;
  turn: Color;
  castling: CastlingRights;
  enPassant: number | null;
  halfMoves: number;
  fullMoves: number;
}

export interface Move {
  from: number;
  to: number;
  promotion?: PieceType;
  isCapture: boolean;
  isEnPassant: boolean;
  isCastle?: "K" | "Q";
}

export const PIECE_SYMBOLS: Record<string, string> = {
  wK: "♔",
  wQ: "♕",
  wR: "♖",
  wB: "♗",
  wN: "♘",
  wP: "♙",
  bK: "♚",
  bQ: "♛",
  bR: "♜",
  bB: "♝",
  bN: "♞",
  bP: "♟",
};

export const INITIAL_FEN =
  "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";

export function rankOf(sq: number): number {
  return Math.floor(sq / 8);
}
export function fileOf(sq: number): number {
  return sq % 8;
}
export function sqOf(rank: number, file: number): number {
  return rank * 8 + file;
}

function inBounds(rank: number, file: number): boolean {
  return rank >= 0 && rank < 8 && file >= 0 && file < 8;
}

export function squareToAlg(sq: number): string {
  return String.fromCharCode(97 + fileOf(sq)) + (rankOf(sq) + 1);
}

export function algToSquare(alg: string): number {
  return (Number.parseInt(alg[1]) - 1) * 8 + (alg.charCodeAt(0) - 97);
}

const ROOK_DIRS: [number, number][] = [
  [0, 1],
  [0, -1],
  [1, 0],
  [-1, 0],
];
const BISHOP_DIRS: [number, number][] = [
  [1, 1],
  [1, -1],
  [-1, 1],
  [-1, -1],
];
const QUEEN_DIRS: [number, number][] = [
  [0, 1],
  [0, -1],
  [1, 0],
  [-1, 0],
  [1, 1],
  [1, -1],
  [-1, 1],
  [-1, -1],
];
const KNIGHT_OFFSETS: [number, number][] = [
  [2, 1],
  [2, -1],
  [-2, 1],
  [-2, -1],
  [1, 2],
  [1, -2],
  [-1, 2],
  [-1, -2],
];
const KING_OFFSETS: [number, number][] = [
  [0, 1],
  [0, -1],
  [1, 0],
  [-1, 0],
  [1, 1],
  [1, -1],
  [-1, 1],
  [-1, -1],
];

export function parseFen(fen: string): GameState {
  const parts = fen.split(" ");
  const board: Board = new Array(64).fill(null);
  const rows = parts[0].split("/");
  for (let r = 0; r < 8; r++) {
    const rank = 7 - r;
    let file = 0;
    for (const ch of rows[r]) {
      if ("12345678".includes(ch)) {
        file += Number.parseInt(ch);
      } else {
        const color: Color = ch === ch.toUpperCase() ? "w" : "b";
        const type = ch.toUpperCase() as PieceType;
        board[sqOf(rank, file)] = { type, color };
        file++;
      }
    }
  }
  const turn: Color = parts[1] === "w" ? "w" : "b";
  const castleStr = parts[2] || "-";
  const castling: CastlingRights = {
    wK: castleStr.includes("K"),
    wQ: castleStr.includes("Q"),
    bK: castleStr.includes("k"),
    bQ: castleStr.includes("q"),
  };
  const enPassant = parts[3] === "-" ? null : algToSquare(parts[3]);
  const halfMoves = Number.parseInt(parts[4]) || 0;
  const fullMoves = Number.parseInt(parts[5]) || 1;
  return { board, turn, castling, enPassant, halfMoves, fullMoves };
}

export function generateFen(state: GameState): string {
  let fen = "";
  for (let r = 7; r >= 0; r--) {
    let empty = 0;
    for (let f = 0; f < 8; f++) {
      const piece = state.board[sqOf(r, f)];
      if (!piece) {
        empty++;
      } else {
        if (empty > 0) {
          fen += empty;
          empty = 0;
        }
        const ch = piece.color === "w" ? piece.type : piece.type.toLowerCase();
        fen += ch;
      }
    }
    if (empty > 0) fen += empty;
    if (r > 0) fen += "/";
  }
  fen += ` ${state.turn}`;
  let castleStr = "";
  if (state.castling.wK) castleStr += "K";
  if (state.castling.wQ) castleStr += "Q";
  if (state.castling.bK) castleStr += "k";
  if (state.castling.bQ) castleStr += "q";
  fen += ` ${castleStr || "-"}`;
  fen += ` ${state.enPassant !== null ? squareToAlg(state.enPassant) : "-"}`;
  fen += ` ${state.halfMoves}`;
  fen += ` ${state.fullMoves}`;
  return fen;
}

function isAttackedBy(sq: number, byColor: Color, board: Board): boolean {
  const r = rankOf(sq);
  const f = fileOf(sq);
  const pawnDir = byColor === "w" ? -1 : 1;
  for (const df of [-1, 1]) {
    const pr = r + pawnDir;
    const pf = f + df;
    if (inBounds(pr, pf)) {
      const p = board[sqOf(pr, pf)];
      if (p && p.color === byColor && p.type === "P") return true;
    }
  }
  for (const [dr, df] of KNIGHT_OFFSETS) {
    const nr = r + dr;
    const nf = f + df;
    if (inBounds(nr, nf)) {
      const p = board[sqOf(nr, nf)];
      if (p && p.color === byColor && p.type === "N") return true;
    }
  }
  for (const [dr, df] of KING_OFFSETS) {
    const nr = r + dr;
    const nf = f + df;
    if (inBounds(nr, nf)) {
      const p = board[sqOf(nr, nf)];
      if (p && p.color === byColor && p.type === "K") return true;
    }
  }
  for (const [dr, df] of ROOK_DIRS) {
    let nr = r + dr;
    let nf = f + df;
    while (inBounds(nr, nf)) {
      const p = board[sqOf(nr, nf)];
      if (p) {
        if (p.color === byColor && (p.type === "R" || p.type === "Q"))
          return true;
        break;
      }
      nr += dr;
      nf += df;
    }
  }
  for (const [dr, df] of BISHOP_DIRS) {
    let nr = r + dr;
    let nf = f + df;
    while (inBounds(nr, nf)) {
      const p = board[sqOf(nr, nf)];
      if (p) {
        if (p.color === byColor && (p.type === "B" || p.type === "Q"))
          return true;
        break;
      }
      nr += dr;
      nf += df;
    }
  }
  return false;
}

function findKing(color: Color, board: Board): number {
  for (let i = 0; i < 64; i++) {
    const p = board[i];
    if (p && p.type === "K" && p.color === color) return i;
  }
  return -1;
}

export function isInCheck(board: Board, color: Color): boolean {
  const kingSq = findKing(color, board);
  if (kingSq === -1) return false;
  const opp: Color = color === "w" ? "b" : "w";
  return isAttackedBy(kingSq, opp, board);
}

function getPseudoLegalMoves(state: GameState, sq: number): Move[] {
  const piece = state.board[sq];
  if (!piece) return [];
  const moves: Move[] = [];
  const r = rankOf(sq);
  const f = fileOf(sq);
  const color = piece.color;
  const opp: Color = color === "w" ? "b" : "w";

  const add = (to: number, isCapture: boolean, extra?: Partial<Move>) => {
    moves.push({ from: sq, to, isCapture, isEnPassant: false, ...extra });
  };

  if (piece.type === "P") {
    const dir = color === "w" ? 1 : -1;
    const startRank = color === "w" ? 1 : 6;
    const promRank = color === "w" ? 7 : 0;
    const fwdR = r + dir;
    if (inBounds(fwdR, f) && !state.board[sqOf(fwdR, f)]) {
      const to = sqOf(fwdR, f);
      if (fwdR === promRank) {
        for (const pt of ["Q", "R", "B", "N"] as PieceType[])
          add(to, false, { promotion: pt });
      } else {
        add(to, false);
        if (r === startRank && !state.board[sqOf(fwdR + dir, f)]) {
          add(sqOf(fwdR + dir, f), false);
        }
      }
    }
    for (const df of [-1, 1]) {
      const nr = r + dir;
      const nf = f + df;
      if (!inBounds(nr, nf)) continue;
      const to = sqOf(nr, nf);
      const target = state.board[to];
      if (target && target.color === opp) {
        if (nr === promRank) {
          for (const pt of ["Q", "R", "B", "N"] as PieceType[])
            add(to, true, { promotion: pt });
        } else {
          add(to, true);
        }
      }
      if (state.enPassant === to) add(to, true, { isEnPassant: true });
    }
  } else if (piece.type === "N") {
    for (const [dr, df] of KNIGHT_OFFSETS) {
      const nr = r + dr;
      const nf = f + df;
      if (!inBounds(nr, nf)) continue;
      const to = sqOf(nr, nf);
      const target = state.board[to];
      if (!target || target.color === opp) add(to, !!target);
    }
  } else if (piece.type === "K") {
    for (const [dr, df] of KING_OFFSETS) {
      const nr = r + dr;
      const nf = f + df;
      if (!inBounds(nr, nf)) continue;
      const to = sqOf(nr, nf);
      const target = state.board[to];
      if (!target || target.color === opp) add(to, !!target);
    }
    const baseRank = color === "w" ? 0 : 7;
    if (r === baseRank && f === 4) {
      const canKS = color === "w" ? state.castling.wK : state.castling.bK;
      const canQS = color === "w" ? state.castling.wQ : state.castling.bQ;
      if (
        canKS &&
        !state.board[sqOf(baseRank, 5)] &&
        !state.board[sqOf(baseRank, 6)]
      ) {
        add(sqOf(baseRank, 6), false, { isCastle: "K" });
      }
      if (
        canQS &&
        !state.board[sqOf(baseRank, 3)] &&
        !state.board[sqOf(baseRank, 2)] &&
        !state.board[sqOf(baseRank, 1)]
      ) {
        add(sqOf(baseRank, 2), false, { isCastle: "Q" });
      }
    }
  } else {
    const dirs =
      piece.type === "R"
        ? ROOK_DIRS
        : piece.type === "B"
          ? BISHOP_DIRS
          : QUEEN_DIRS;
    for (const [dr, df] of dirs) {
      let nr = r + dr;
      let nf = f + df;
      while (inBounds(nr, nf)) {
        const to = sqOf(nr, nf);
        const target = state.board[to];
        if (target) {
          if (target.color === opp) add(to, true);
          break;
        }
        add(to, false);
        nr += dr;
        nf += df;
      }
    }
  }
  return moves;
}

export function applyMove(state: GameState, move: Move): GameState {
  const board = [...state.board];
  const piece = board[move.from]!;
  const color = piece.color;
  const newCastling = { ...state.castling };
  let newEnPassant: number | null = null;

  if (move.isCastle) {
    const rank = color === "w" ? 0 : 7;
    if (move.isCastle === "K") {
      board[sqOf(rank, 6)] = piece;
      board[sqOf(rank, 4)] = null;
      board[sqOf(rank, 5)] = board[sqOf(rank, 7)];
      board[sqOf(rank, 7)] = null;
    } else {
      board[sqOf(rank, 2)] = piece;
      board[sqOf(rank, 4)] = null;
      board[sqOf(rank, 3)] = board[sqOf(rank, 0)];
      board[sqOf(rank, 0)] = null;
    }
  } else {
    board[move.to] = move.promotion ? { type: move.promotion, color } : piece;
    board[move.from] = null;
    if (move.isEnPassant) {
      board[sqOf(rankOf(move.from), fileOf(move.to))] = null;
    }
    if (
      piece.type === "P" &&
      Math.abs(rankOf(move.to) - rankOf(move.from)) === 2
    ) {
      newEnPassant = sqOf(
        Math.floor((rankOf(move.from) + rankOf(move.to)) / 2),
        fileOf(move.from),
      );
    }
  }

  if (piece.type === "K") {
    if (color === "w") {
      newCastling.wK = false;
      newCastling.wQ = false;
    } else {
      newCastling.bK = false;
      newCastling.bQ = false;
    }
  }
  if (piece.type === "R") {
    if (move.from === sqOf(0, 0)) newCastling.wQ = false;
    if (move.from === sqOf(0, 7)) newCastling.wK = false;
    if (move.from === sqOf(7, 0)) newCastling.bQ = false;
    if (move.from === sqOf(7, 7)) newCastling.bK = false;
  }
  if (move.to === sqOf(0, 0)) newCastling.wQ = false;
  if (move.to === sqOf(0, 7)) newCastling.wK = false;
  if (move.to === sqOf(7, 0)) newCastling.bQ = false;
  if (move.to === sqOf(7, 7)) newCastling.bK = false;

  const newTurn: Color = color === "w" ? "b" : "w";
  const newHalfMoves =
    piece.type === "P" || move.isCapture ? 0 : state.halfMoves + 1;
  const newFullMoves = color === "b" ? state.fullMoves + 1 : state.fullMoves;

  return {
    board,
    turn: newTurn,
    castling: newCastling,
    enPassant: newEnPassant,
    halfMoves: newHalfMoves,
    fullMoves: newFullMoves,
  };
}

export function getLegalMoves(state: GameState, sq: number): Move[] {
  const piece = state.board[sq];
  if (!piece || piece.color !== state.turn) return [];
  const pseudo = getPseudoLegalMoves(state, sq);
  const color = piece.color;
  const opp: Color = color === "w" ? "b" : "w";
  return pseudo.filter((move) => {
    if (move.isCastle) {
      const rank = color === "w" ? 0 : 7;
      if (isAttackedBy(sqOf(rank, 4), opp, state.board)) return false;
      if (
        move.isCastle === "K" &&
        isAttackedBy(sqOf(rank, 5), opp, state.board)
      )
        return false;
      if (
        move.isCastle === "Q" &&
        isAttackedBy(sqOf(rank, 3), opp, state.board)
      )
        return false;
    }
    const next = applyMove(state, move);
    return !isInCheck(next.board, color);
  });
}

export function getAllLegalMoves(state: GameState): Move[] {
  const moves: Move[] = [];
  for (let i = 0; i < 64; i++) {
    const p = state.board[i];
    if (p && p.color === state.turn) moves.push(...getLegalMoves(state, i));
  }
  return moves;
}

export type ChessStatus =
  | "active"
  | "check"
  | "checkmate"
  | "stalemate"
  | "draw";

export function getChessStatus(state: GameState): ChessStatus {
  const legal = getAllLegalMoves(state);
  if (legal.length === 0)
    return isInCheck(state.board, state.turn) ? "checkmate" : "stalemate";
  if (isInCheck(state.board, state.turn)) return "check";
  if (state.halfMoves >= 100) return "draw";
  return "active";
}

export function moveToNotation(move: Move, stateBefore: GameState): string {
  if (move.isCastle === "K") return "O-O";
  if (move.isCastle === "Q") return "O-O-O";
  const piece = stateBefore.board[move.from]!;
  const toAlg = squareToAlg(move.to);
  let notation = "";
  if (piece.type !== "P") notation += piece.type;
  if (move.isCapture) {
    if (piece.type === "P") notation += squareToAlg(move.from)[0];
    notation += "x";
  }
  notation += toAlg;
  if (move.promotion) notation += `=${move.promotion}`;
  const next = applyMove(stateBefore, move);
  if (isInCheck(next.board, next.turn)) {
    notation += getAllLegalMoves(next).length === 0 ? "#" : "+";
  }
  return notation;
}

export function getCapturedPieces(
  originalFen: string,
  currentBoard: Board,
): { capturedByWhite: Piece[]; capturedByBlack: Piece[] } {
  const originalState = parseFen(originalFen);
  const pieceCounts = (
    board: Board,
    color: Color,
  ): Record<PieceType, number> => {
    const counts: Record<PieceType, number> = {
      K: 0,
      Q: 0,
      R: 0,
      B: 0,
      N: 0,
      P: 0,
    };
    for (const sq of board) {
      if (sq && sq.color === color) counts[sq.type]++;
    }
    return counts;
  };
  const origWhite = pieceCounts(originalState.board, "w");
  const origBlack = pieceCounts(originalState.board, "b");
  const currWhite = pieceCounts(currentBoard, "w");
  const currBlack = pieceCounts(currentBoard, "b");
  const capturedByWhite: Piece[] = [];
  const capturedByBlack: Piece[] = [];
  for (const t of ["Q", "R", "B", "N", "P"] as PieceType[]) {
    const lostBlack = origBlack[t] - currBlack[t];
    const lostWhite = origWhite[t] - currWhite[t];
    for (let i = 0; i < lostBlack; i++)
      capturedByWhite.push({ type: t, color: "b" });
    for (let i = 0; i < lostWhite; i++)
      capturedByBlack.push({ type: t, color: "w" });
  }
  return { capturedByWhite, capturedByBlack };
}
