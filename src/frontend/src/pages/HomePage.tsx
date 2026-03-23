import { Button } from "@/components/ui/button";
import { Crown, Shield, Trophy, Zap } from "lucide-react";
import { motion } from "motion/react";
import type { ComponentType } from "react";

interface HomePageProps {
  onPlay: () => void;
}

const FEATURES: Array<{
  icon: ComponentType<{ className?: string }>;
  title: string;
  desc: string;
}> = [
  {
    icon: Crown,
    title: "Full Chess Rules",
    desc: "Castling, en passant, promotion — every rule implemented",
  },
  {
    icon: Shield,
    title: "Legal Move Hints",
    desc: "Click a piece to see all valid moves highlighted instantly",
  },
  {
    icon: Zap,
    title: "Move History",
    desc: "Review every move in PGN notation, navigate back & forward",
  },
  {
    icon: Trophy,
    title: "Game Persistence",
    desc: "Your game is saved on-chain and restored on your next visit",
  },
];

const DECORATIVE_PIECES = [
  { symbol: "♔", color: "#F5EDD8", x: "8%", y: "18%", size: 64, delay: 0 },
  { symbol: "♛", color: "#1A1008", x: "88%", y: "12%", size: 72, delay: 0.15 },
  { symbol: "♖", color: "#F5EDD8", x: "5%", y: "72%", size: 52, delay: 0.3 },
  { symbol: "♝", color: "#1A1008", x: "90%", y: "68%", size: 56, delay: 0.1 },
  { symbol: "♘", color: "#F5EDD8", x: "82%", y: "40%", size: 48, delay: 0.25 },
  { symbol: "♟", color: "#1A1008", x: "12%", y: "45%", size: 44, delay: 0.2 },
];

const MINI_BOARD_PIECES: Record<number, { symbol: string; isWhite: boolean }> =
  {
    0: { symbol: "♖", isWhite: true },
    1: { symbol: "♘", isWhite: true },
    2: { symbol: "♗", isWhite: true },
    3: { symbol: "♕", isWhite: true },
    4: { symbol: "♔", isWhite: true },
    5: { symbol: "♗", isWhite: true },
    6: { symbol: "♘", isWhite: true },
    7: { symbol: "♖", isWhite: true },
    8: { symbol: "♙", isWhite: true },
    9: { symbol: "♙", isWhite: true },
    10: { symbol: "♙", isWhite: true },
    11: { symbol: "♙", isWhite: true },
    12: { symbol: "♙", isWhite: true },
    13: { symbol: "♙", isWhite: true },
    14: { symbol: "♙", isWhite: true },
    15: { symbol: "♙", isWhite: true },
    48: { symbol: "♟", isWhite: false },
    49: { symbol: "♟", isWhite: false },
    50: { symbol: "♟", isWhite: false },
    51: { symbol: "♟", isWhite: false },
    52: { symbol: "♟", isWhite: false },
    53: { symbol: "♟", isWhite: false },
    54: { symbol: "♟", isWhite: false },
    55: { symbol: "♟", isWhite: false },
    56: { symbol: "♜", isWhite: false },
    57: { symbol: "♞", isWhite: false },
    58: { symbol: "♝", isWhite: false },
    59: { symbol: "♛", isWhite: false },
    60: { symbol: "♚", isWhite: false },
    61: { symbol: "♝", isWhite: false },
    62: { symbol: "♞", isWhite: false },
    63: { symbol: "♜", isWhite: false },
  };

export function HomePage({ onPlay }: HomePageProps) {
  return (
    <div className="relative min-h-[calc(100vh-80px)] flex flex-col items-center justify-center overflow-hidden px-4 py-16">
      {DECORATIVE_PIECES.map((p) => (
        <motion.span
          key={p.symbol}
          className="absolute select-none pointer-events-none"
          style={{
            left: p.x,
            top: p.y,
            fontSize: p.size,
            color: p.color,
            filter: "drop-shadow(0 4px 16px rgba(0,0,0,0.6))",
            opacity: 0.18,
          }}
          animate={{ y: [0, -12, 0] }}
          transition={{
            duration: 4 + p.delay * 6,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
            delay: p.delay,
          }}
        >
          {p.symbol}
        </motion.span>
      ))}

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center max-w-2xl z-10"
      >
        <div className="flex items-center justify-center gap-3 mb-6">
          <span
            className="text-5xl"
            style={{ filter: "drop-shadow(0 2px 8px rgba(199,161,90,0.5))" }}
          >
            ♛
          </span>
          <h1
            className="text-5xl font-bold tracking-[0.12em] uppercase"
            style={{
              color: "oklch(0.70 0.12 70)",
              textShadow: "0 2px 20px rgba(199,161,90,0.3)",
            }}
          >
            Onyx Chess
          </h1>
        </div>

        <p className="text-lg text-muted-foreground mb-10 leading-relaxed">
          A premium chess experience built on the Internet Computer.
          <br />
          <span className="text-foreground/70">
            Play, study, and master the royal game.
          </span>
        </p>

        <div className="flex gap-4 justify-center">
          <Button
            size="lg"
            className="gap-3 px-10 py-6 text-base font-semibold rounded-full"
            style={{
              background: "oklch(0.70 0.12 70)",
              color: "oklch(0.12 0.020 232)",
              boxShadow: "0 4px 24px rgba(199,161,90,0.4)",
            }}
            onClick={onPlay}
            data-ocid="home.play_button"
          >
            <span className="text-xl">♟</span>
            Play Now
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="gap-2 px-8 py-6 text-base rounded-full border-border text-muted-foreground hover:border-primary/50 hover:text-primary"
            onClick={onPlay}
            data-ocid="home.secondary_button"
          >
            Continue Game
          </Button>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-20 w-full max-w-4xl z-10"
      >
        {FEATURES.map((f) => (
          <motion.div
            key={f.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="rounded-xl p-5 border border-border hover:border-primary/30 transition-colors"
            style={{ background: "oklch(0.17 0.024 232)" }}
          >
            <f.icon className="w-6 h-6 text-primary mb-3" />
            <h3 className="text-sm font-semibold text-foreground mb-1">
              {f.title}
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {f.desc}
            </p>
          </motion.div>
        ))}
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-16 z-10 grid grid-cols-8 rounded-lg overflow-hidden shadow-board"
        style={{ width: 160, height: 160 }}
      >
        {Array.from({ length: 64 }).map((_, i) => {
          const r = Math.floor(i / 8);
          const f = i % 8;
          const isLight = (r + f) % 2 === 1;
          const entry = MINI_BOARD_PIECES[i];
          return (
            <div
              key={`mini-${r}-${f}`}
              className="flex items-center justify-center"
              style={{
                background: isLight ? "#C4A27A" : "#3B2E27",
                width: 20,
                height: 20,
              }}
            >
              {entry && (
                <span
                  style={{
                    fontSize: 12,
                    color: entry.isWhite ? "#F5EDD8" : "#1A1008",
                    lineHeight: 1,
                    filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.8))",
                  }}
                >
                  {entry.symbol}
                </span>
              )}
            </div>
          );
        })}
      </motion.div>
    </div>
  );
}
