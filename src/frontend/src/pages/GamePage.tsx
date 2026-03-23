import { Button } from "@/components/ui/button";
import { Flag, Handshake, Lightbulb, RotateCcw, Swords } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import type { GameStatus } from "../backend";
import { ChessBoard } from "../components/ChessBoard";
import { GameStatusPanel } from "../components/GameStatusPanel";
import { MoveHistory } from "../components/MoveHistory";
import { PromotionDialog } from "../components/PromotionDialog";
import {
  useGetAllGames,
  useMakeMove,
  useOfferDraw,
  useResign,
  useStartNewGame,
} from "../hooks/useQueries";
import {
  INITIAL_FEN,
  applyMove,
  generateFen,
  getAllLegalMoves,
  getCapturedPieces,
  getChessStatus,
  getLegalMoves,
  moveToNotation,
  parseFen,
  squareToAlg,
} from "../lib/chess";
import type { Color, GameState, Move, Piece, PieceType } from "../lib/chess";

function toBackendStatus(
  chessStatus: ReturnType<typeof getChessStatus>,
  turn: Color,
): GameStatus {
  if (chessStatus === "checkmate") return "checkmate" as GameStatus;
  if (chessStatus === "stalemate") return "stalemate" as GameStatus;
  if (chessStatus === "draw") return "draw" as GameStatus;
  if (chessStatus === "check") return "check" as GameStatus;
  return (turn === "w" ? "whiteTurn" : "blackTurn") as GameStatus;
}

function piecesToString(pieces: Piece[]): string {
  return pieces.map((p) => p.type).join(",");
}

interface GameHistoryEntry {
  gameState: GameState;
  capturedByWhite: Piece[];
  capturedByBlack: Piece[];
}

interface GamePageProps {
  onHome: () => void;
}

export function GamePage({ onHome }: GamePageProps) {
  const { data: allGames, isLoading: gamesLoading } = useGetAllGames();
  const startNewGameMut = useStartNewGame();
  const makeMoveMut = useMakeMove();
  const resignMut = useResign();
  const offerDrawMut = useOfferDraw();

  const [gameId, setGameId] = useState<bigint | null>(null);
  const [history, setHistory] = useState<GameHistoryEntry[]>([
    {
      gameState: parseFen(INITIAL_FEN),
      capturedByWhite: [],
      capturedByBlack: [],
    },
  ]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [moveNotations, setMoveNotations] = useState<string[]>([]);
  const [selectedSquare, setSelectedSquare] = useState<number | null>(null);
  const [legalMovesForSel, setLegalMovesForSel] = useState<Move[]>([]);
  const [lastMove, setLastMove] = useState<Move | null>(null);
  const [pendingPromotion, setPendingPromotion] = useState<{
    from: number;
    to: number;
  } | null>(null);
  const [gameOverMessage, setGameOverMessage] = useState<string | null>(null);
  const [whiteTime, setWhiteTime] = useState(0);
  const [blackTime, setBlackTime] = useState(0);
  const [drawOffered, setDrawOffered] = useState(false);

  const currentEntry = history[historyIndex];
  const gameState = currentEntry.gameState;
  const capturedByWhite = currentEntry.capturedByWhite;
  const capturedByBlack = currentEntry.capturedByBlack;
  const isGameOver = !!gameOverMessage;
  const chessStatus = getChessStatus(gameState);
  const isInCheck = chessStatus === "check" || chessStatus === "checkmate";

  // Restore from backend on load
  useEffect(() => {
    if (allGames && allGames.length > 0 && gameId === null) {
      const last = allGames[allGames.length - 1];
      const idx = allGames.length - 1;
      setGameId(BigInt(idx));
      const restored = parseFen(last.fen);
      const { capturedByWhite: cw, capturedByBlack: cb } = getCapturedPieces(
        INITIAL_FEN,
        restored.board,
      );
      setHistory([
        { gameState: restored, capturedByWhite: cw, capturedByBlack: cb },
      ]);
      setHistoryIndex(0);
      if (last.moveHistory?.length > 0) setMoveNotations(last.moveHistory);
      const s = getChessStatus(restored);
      if (s === "checkmate")
        setGameOverMessage(
          `Checkmate! ${restored.turn === "w" ? "Black" : "White"} wins!`,
        );
      else if (s === "stalemate") setGameOverMessage("Stalemate! It's a draw.");
      else if (s === "draw") setGameOverMessage("Draw by 50-move rule.");
    }
  }, [allGames, gameId]);

  // Timer
  useEffect(() => {
    if (isGameOver) return;
    const id = setInterval(() => {
      if (gameState.turn === "w") setWhiteTime((t) => t + 1);
      else setBlackTime((t) => t + 1);
    }, 1000);
    return () => clearInterval(id);
  }, [gameState.turn, isGameOver]);

  const executeMove = useCallback(
    async (move: Move, promotionPiece?: PieceType) => {
      const resolvedMove: Move = promotionPiece
        ? { ...move, promotion: promotionPiece }
        : move;
      const notation = moveToNotation(resolvedMove, gameState);
      const nextState = applyMove(gameState, resolvedMove);
      const { capturedByWhite: cw, capturedByBlack: cb } = getCapturedPieces(
        INITIAL_FEN,
        nextState.board,
      );
      const newEntry: GameHistoryEntry = {
        gameState: nextState,
        capturedByWhite: cw,
        capturedByBlack: cb,
      };
      const newHistory = history.slice(0, historyIndex + 1).concat(newEntry);
      const newNotations = [...moveNotations, notation];

      setHistory(newHistory);
      setHistoryIndex(newHistory.length - 1);
      setMoveNotations(newNotations);
      setLastMove(resolvedMove);
      setSelectedSquare(null);
      setLegalMovesForSel([]);

      const status = getChessStatus(nextState);
      if (status === "checkmate") {
        setGameOverMessage(
          `Checkmate! ${gameState.turn === "w" ? "White" : "Black"} wins!`,
        );
        toast.success(
          `Checkmate! ${gameState.turn === "w" ? "White" : "Black"} wins!`,
        );
      } else if (status === "stalemate") {
        setGameOverMessage("Stalemate! It's a draw.");
        toast("Stalemate! Draw.");
      } else if (status === "draw") {
        setGameOverMessage("Draw by 50-move rule.");
        toast("Draw!");
      }

      if (gameId !== null) {
        const fen = generateFen(nextState);
        const moveStr =
          squareToAlg(resolvedMove.from) +
          squareToAlg(resolvedMove.to) +
          (resolvedMove.promotion ? resolvedMove.promotion.toLowerCase() : "");
        await makeMoveMut
          .mutateAsync({
            gameId,
            fen,
            move: moveStr,
            status: toBackendStatus(status, nextState.turn),
            capturedWhite: piecesToString(cw),
            capturedBlack: piecesToString(cb),
          })
          .catch(() => {});
      }
    },
    [gameState, history, historyIndex, moveNotations, gameId, makeMoveMut],
  );

  const handleSquareClick = useCallback(
    (sq: number) => {
      if (isGameOver) return;
      if (historyIndex < history.length - 1) {
        setHistoryIndex(history.length - 1);
        setSelectedSquare(null);
        setLegalMovesForSel([]);
        return;
      }
      if (selectedSquare !== null) {
        const movesToSq = legalMovesForSel.filter((m) => m.to === sq);
        if (movesToSq.length > 0) {
          if (movesToSq.some((m) => m.promotion)) {
            setPendingPromotion({ from: selectedSquare, to: sq });
            setSelectedSquare(null);
            setLegalMovesForSel([]);
          } else {
            executeMove(movesToSq[0]);
          }
          return;
        }
      }
      const piece = gameState.board[sq];
      if (piece && piece.color === gameState.turn) {
        setSelectedSquare(sq);
        setLegalMovesForSel(getLegalMoves(gameState, sq));
      } else {
        setSelectedSquare(null);
        setLegalMovesForSel([]);
      }
    },
    [
      isGameOver,
      historyIndex,
      history.length,
      selectedSquare,
      legalMovesForSel,
      gameState,
      executeMove,
    ],
  );

  const handlePromotion = (pt: PieceType) => {
    if (!pendingPromotion) return;
    const moves = getAllLegalMoves(gameState);
    const move = moves.find(
      (m) =>
        m.from === pendingPromotion.from &&
        m.to === pendingPromotion.to &&
        m.promotion === pt,
    );
    if (move) executeMove(move);
    setPendingPromotion(null);
  };

  const handleNewGame = async () => {
    try {
      const id = await startNewGameMut.mutateAsync();
      setGameId(id);
    } catch {
      setGameId(BigInt(0));
    }
    const fresh = parseFen(INITIAL_FEN);
    setHistory([
      { gameState: fresh, capturedByWhite: [], capturedByBlack: [] },
    ]);
    setHistoryIndex(0);
    setMoveNotations([]);
    setLastMove(null);
    setSelectedSquare(null);
    setLegalMovesForSel([]);
    setGameOverMessage(null);
    setWhiteTime(0);
    setBlackTime(0);
    setDrawOffered(false);
    toast.success("New game started!");
  };

  const handleResign = async () => {
    if (isGameOver) return;
    const winner = gameState.turn === "w" ? "Black" : "White";
    setGameOverMessage(
      `${gameState.turn === "w" ? "White" : "Black"} resigned. ${winner} wins!`,
    );
    toast(`Resigned. ${winner} wins.`);
    if (gameId !== null)
      await resignMut.mutateAsync({ gameId, winner }).catch(() => {});
  };

  const handleDrawOffer = async () => {
    if (isGameOver || drawOffered) return;
    setDrawOffered(true);
    toast("Draw offered!", {
      action: {
        label: "Accept",
        onClick: () => {
          setGameOverMessage("Draw agreed.");
          toast("Draw agreed.");
        },
      },
    });
    if (gameId !== null) await offerDrawMut.mutateAsync(gameId).catch(() => {});
  };

  const handleNavigate = (index: number) => {
    const clampedIdx = Math.max(0, Math.min(history.length - 1, index + 1));
    setHistoryIndex(clampedIdx);
    setSelectedSquare(null);
    setLegalMovesForSel([]);
  };

  const displayedGameState = history[historyIndex]?.gameState || gameState;
  const displayedLastMove =
    historyIndex === history.length - 1 ? lastMove : null;
  const isLive = historyIndex === history.length - 1;

  if (gamesLoading) {
    return (
      <div
        className="flex items-center justify-center h-64"
        data-ocid="game.loading_state"
      >
        <div className="text-muted-foreground text-sm">Loading game...</div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col gap-4 px-4 pb-8"
    >
      {/* Back to home */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          className="text-xs text-muted-foreground hover:text-primary transition-colors"
          onClick={onHome}
          data-ocid="game.home_link"
        >
          ← Back to Home
        </button>
      </div>

      <AnimatePresence>
        {gameOverMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="rounded-lg px-6 py-3 text-center font-semibold text-lg border gold-pulse"
            style={{
              background: "oklch(0.18 0.025 232)",
              borderColor: "oklch(0.70 0.12 70 / 0.7)",
              color: "oklch(0.70 0.12 70)",
            }}
            data-ocid="game.success_state"
          >
            {gameOverMessage}
          </motion.div>
        )}
      </AnimatePresence>

      <div
        className="grid gap-4"
        style={{ gridTemplateColumns: "220px 1fr 180px" }}
      >
        {/* Left: Game Status */}
        <div
          className="rounded-xl p-4 border border-border shadow-panel"
          style={{ background: "oklch(0.17 0.024 232)" }}
        >
          <GameStatusPanel
            whiteTime={whiteTime}
            blackTime={blackTime}
            turn={gameState.turn}
            capturedByWhite={capturedByWhite}
            capturedByBlack={capturedByBlack}
            isInCheck={isInCheck}
            gameOverMessage={gameOverMessage}
            isGameOver={isGameOver}
          />
        </div>

        {/* Center: Board */}
        <div className="flex flex-col items-center justify-start gap-4">
          <ChessBoard
            gameState={displayedGameState}
            selectedSquare={isLive ? selectedSquare : null}
            legalMoves={isLive ? legalMovesForSel : []}
            lastMove={displayedLastMove}
            onSquareClick={handleSquareClick}
          />

          <div className="flex flex-wrap gap-2 justify-center">
            <Button
              variant="outline"
              size="sm"
              className="gap-2 border-border text-muted-foreground hover:border-primary/50 hover:text-primary"
              onClick={handleNewGame}
              disabled={startNewGameMut.isPending}
              data-ocid="game.new_game_button"
            >
              <RotateCcw className="w-3.5 h-3.5" /> New Game
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="gap-2 border-border text-muted-foreground hover:border-destructive/50 hover:text-destructive"
              onClick={handleResign}
              disabled={isGameOver}
              data-ocid="game.resign_button"
            >
              <Flag className="w-3.5 h-3.5" /> Resign
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="gap-2 border-border text-muted-foreground hover:border-primary/50 hover:text-primary"
              onClick={handleDrawOffer}
              disabled={isGameOver || drawOffered}
              data-ocid="game.draw_button"
            >
              <Handshake className="w-3.5 h-3.5" /> Draw
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="gap-2 border-border text-muted-foreground hover:border-primary/50 hover:text-primary"
              onClick={() => {
                const legal = getAllLegalMoves(gameState);
                if (legal.length > 0) {
                  const move = legal[Math.floor(Math.random() * legal.length)];
                  setSelectedSquare(move.from);
                  setLegalMovesForSel(getLegalMoves(gameState, move.from));
                  toast("Hint: try moving the highlighted piece");
                }
              }}
              disabled={isGameOver}
              data-ocid="game.hint_button"
            >
              <Lightbulb className="w-3.5 h-3.5" /> Hint
            </Button>
          </div>
        </div>

        {/* Right: Move History */}
        <div
          className="rounded-xl p-4 border border-border shadow-panel"
          style={{ background: "oklch(0.17 0.024 232)", minHeight: 400 }}
        >
          <MoveHistory
            moves={moveNotations}
            currentMoveIndex={historyIndex - 1}
            onNavigate={handleNavigate}
          />
        </div>
      </div>

      <PromotionDialog
        open={pendingPromotion !== null}
        color={gameState.turn}
        onSelect={handlePromotion}
        onCancel={() => setPendingPromotion(null)}
      />

      {isGameOver && (
        <div className="flex justify-center">
          <Swords className="w-6 h-6 text-primary/40" />
        </div>
      )}
    </motion.div>
  );
}
