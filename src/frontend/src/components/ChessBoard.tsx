import { PIECE_SYMBOLS, isInCheck, sqOf } from "../lib/chess";
import type { GameState, Move } from "../lib/chess";

interface ChessBoardProps {
  gameState: GameState;
  selectedSquare: number | null;
  legalMoves: Move[];
  lastMove: Move | null;
  onSquareClick: (sq: number) => void;
  flipped?: boolean;
}

export function ChessBoard({
  gameState,
  selectedSquare,
  legalMoves,
  lastMove,
  onSquareClick,
  flipped = false,
}: ChessBoardProps) {
  const legalTargets = new Set(legalMoves.map((m) => m.to));
  const inCheckColor = isInCheck(gameState.board, gameState.turn)
    ? gameState.turn
    : null;
  const kingSquare = inCheckColor
    ? gameState.board.findIndex(
        (p) => p?.type === "K" && p.color === inCheckColor,
      )
    : -1;

  const ranks = flipped ? [0, 1, 2, 3, 4, 5, 6, 7] : [7, 6, 5, 4, 3, 2, 1, 0];
  const files = flipped ? [7, 6, 5, 4, 3, 2, 1, 0] : [0, 1, 2, 3, 4, 5, 6, 7];

  return (
    <div className="flex flex-col items-center">
      <div
        className="relative rounded-sm"
        style={{
          background: "var(--board-frame)",
          padding: "28px 28px 36px 36px",
          boxShadow:
            "0 8px 40px 0 rgba(0,0,0,0.70), inset 0 1px 0 rgba(255,255,255,0.08)",
        }}
      >
        {/* Rank labels */}
        <div
          className="absolute left-0 top-0 flex flex-col justify-around"
          style={{ bottom: 36, top: 28, width: 28 }}
        >
          {ranks.map((rank) => (
            <span
              key={rank}
              className="text-center text-xs font-semibold"
              style={{ color: "rgba(255,220,160,0.55)" }}
            >
              {rank + 1}
            </span>
          ))}
        </div>
        {/* File labels */}
        <div
          className="absolute bottom-0 left-0 flex flex-row justify-around"
          style={{ left: 36, right: 28, height: 28 }}
        >
          {files.map((file) => (
            <span
              key={file}
              className="text-center text-xs font-semibold"
              style={{ color: "rgba(255,220,160,0.55)" }}
            >
              {String.fromCharCode(97 + file)}
            </span>
          ))}
        </div>
        {/* Board grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(8, 1fr)",
            width: "min(480px, calc(100vw - 320px))",
            aspectRatio: "1/1",
            minWidth: 240,
          }}
        >
          {ranks.map((rank) =>
            files.map((file) => {
              const sq = sqOf(rank, file);
              const isLight = (rank + file) % 2 === 1;
              const piece = gameState.board[sq];
              const isSelected = selectedSquare === sq;
              const isLastMove =
                lastMove && (lastMove.from === sq || lastMove.to === sq);
              const isLegalTarget = legalTargets.has(sq);
              const isKingInCheck = sq === kingSquare;
              const hasPiece = !!piece;
              const bgColor = isLight ? "#C4A27A" : "#3B2E27";

              let extraClass = "";
              if (isKingInCheck) extraClass = "sq-check";
              else if (isSelected) extraClass = "sq-selected";
              else if (isLastMove) extraClass = "sq-lastmove";

              let dotClass = "";
              if (isLegalTarget && !hasPiece) dotClass = "move-dot";
              else if (isLegalTarget && hasPiece) dotClass = "move-dot-capture";

              return (
                <button
                  type="button"
                  key={`${rank}-${file}`}
                  data-ocid={`board.item.${sq + 1}`}
                  className={`relative flex items-center justify-center cursor-pointer ${extraClass} ${dotClass}`}
                  style={{
                    background: bgColor,
                    transition: "background 0.15s",
                    border: "none",
                    padding: 0,
                  }}
                  onClick={() => onSquareClick(sq)}
                >
                  {piece && (
                    <span
                      className="chess-piece select-none"
                      style={{
                        fontSize: "clamp(22px, 5vw, 44px)",
                        color: piece.color === "w" ? "#F5EDD8" : "#1A1008",
                        textShadow:
                          piece.color === "w"
                            ? "0 1px 3px rgba(0,0,0,0.8), 0 0 6px rgba(0,0,0,0.4)"
                            : "0 1px 2px rgba(255,255,255,0.15)",
                        lineHeight: 1,
                        zIndex: 2,
                      }}
                    >
                      {PIECE_SYMBOLS[piece.color + piece.type]}
                    </span>
                  )}
                </button>
              );
            }),
          )}
        </div>
      </div>
    </div>
  );
}
