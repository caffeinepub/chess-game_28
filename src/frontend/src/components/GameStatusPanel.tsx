import { PIECE_SYMBOLS } from "../lib/chess";
import type { Color, Piece } from "../lib/chess";

interface PlayerCardProps {
  name: string;
  color: Color;
  isCurrentTurn: boolean;
  capturedPieces: Piece[];
  timeSeconds: number;
  isInCheck: boolean;
  isGameOver: boolean;
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

function PlayerCard({
  name,
  color,
  isCurrentTurn,
  capturedPieces,
  timeSeconds,
  isInCheck,
  isGameOver,
}: PlayerCardProps) {
  const pieceGroups: Record<string, number> = {};
  for (const p of capturedPieces) {
    const key = p.color + p.type;
    pieceGroups[key] = (pieceGroups[key] || 0) + 1;
  }

  return (
    <div
      className={`rounded-lg p-3 transition-all duration-300 ${
        isCurrentTurn && !isGameOver
          ? "border border-primary/60 gold-pulse"
          : "border border-border"
      }`}
      style={{ background: "oklch(0.20 0.025 232)" }}
      data-ocid={`player_${color}.card`}
    >
      <div className="flex items-center gap-3 mb-2">
        <div
          className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${
            color === "w"
              ? "bg-amber-100 text-amber-900"
              : "bg-zinc-800 text-zinc-200"
          }`}
        >
          {color === "w" ? "♔" : "♚"}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-foreground truncate">
              {name}
            </span>
            {isInCheck && !isGameOver && (
              <span className="text-[10px] font-bold text-red-400 bg-red-900/30 px-1.5 py-0.5 rounded">
                CHECK
              </span>
            )}
          </div>
          <span className="text-xs text-muted-foreground">
            {color === "w" ? "White" : "Black"}
          </span>
        </div>
        <div
          className={`text-base font-mono font-bold tabular-nums px-2 py-1 rounded ${
            isCurrentTurn && !isGameOver
              ? "text-primary bg-primary/10"
              : "text-muted-foreground"
          }`}
        >
          {formatTime(timeSeconds)}
        </div>
      </div>
      <div className="flex flex-wrap gap-0.5 min-h-[20px]">
        {Object.entries(pieceGroups).map(([key, count]) => (
          <span
            key={key}
            className="text-base leading-none"
            style={{ filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.5))" }}
          >
            {PIECE_SYMBOLS[key]}
            {count > 1 ? (
              <sup className="text-[9px] text-muted-foreground">{count}</sup>
            ) : null}
          </span>
        ))}
      </div>
    </div>
  );
}

interface GameStatusPanelProps {
  whiteTime: number;
  blackTime: number;
  turn: Color;
  capturedByWhite: Piece[];
  capturedByBlack: Piece[];
  isInCheck: boolean;
  gameOverMessage: string | null;
  isGameOver: boolean;
}

export function GameStatusPanel({
  whiteTime,
  blackTime,
  turn,
  capturedByWhite,
  capturedByBlack,
  isInCheck,
  gameOverMessage,
  isGameOver,
}: GameStatusPanelProps) {
  return (
    <div className="flex flex-col gap-3 h-full" data-ocid="game_status.panel">
      <div className="text-xs font-semibold uppercase tracking-widest text-primary/70 mb-1">
        Game Status
      </div>

      <PlayerCard
        name="Black"
        color="b"
        isCurrentTurn={turn === "b"}
        capturedPieces={capturedByBlack}
        timeSeconds={blackTime}
        isInCheck={isInCheck && turn === "b"}
        isGameOver={isGameOver}
      />

      <div
        className="rounded-md px-3 py-2 text-center text-sm font-medium border"
        style={{
          background: "oklch(0.16 0.022 232)",
          borderColor: gameOverMessage
            ? "oklch(0.70 0.12 70 / 0.6)"
            : "oklch(0.28 0.025 232)",
          color: gameOverMessage
            ? "oklch(0.70 0.12 70)"
            : "oklch(0.62 0.018 232)",
        }}
      >
        {gameOverMessage ||
          (isInCheck
            ? `⚠ ${turn === "w" ? "White" : "Black"} is in check!`
            : `${turn === "w" ? "White" : "Black"}'s turn`)}
      </div>

      <PlayerCard
        name="White"
        color="w"
        isCurrentTurn={turn === "w"}
        capturedPieces={capturedByWhite}
        timeSeconds={whiteTime}
        isInCheck={isInCheck && turn === "w"}
        isGameOver={isGameOver}
      />

      <div className="mt-auto pt-2 border-t border-border">
        <div className="text-xs text-muted-foreground space-y-1">
          <div className="flex items-center gap-2">
            <span
              className="w-3 h-3 rounded-sm inline-block"
              style={{ background: "rgba(199,161,90,0.55)" }}
            />
            <span>Selected piece</span>
          </div>
          <div className="flex items-center gap-2">
            <span
              className="w-3 h-3 rounded-sm inline-block"
              style={{ background: "rgba(199,161,90,0.28)" }}
            />
            <span>Last move</span>
          </div>
          <div className="flex items-center gap-2">
            <span
              className="w-3 h-3 rounded-full inline-block"
              style={{ background: "rgba(199,161,90,0.65)" }}
            />
            <span>Legal moves</span>
          </div>
        </div>
      </div>
    </div>
  );
}
