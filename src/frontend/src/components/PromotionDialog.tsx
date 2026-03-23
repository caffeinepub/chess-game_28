import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { PIECE_SYMBOLS } from "../lib/chess";
import type { Color, PieceType } from "../lib/chess";

interface PromotionDialogProps {
  open: boolean;
  color: Color;
  onSelect: (piece: PieceType) => void;
  onCancel: () => void;
}

const PROMOTION_PIECES: PieceType[] = ["Q", "R", "B", "N"];
const PIECE_NAMES: Partial<Record<PieceType, string>> = {
  Q: "Queen",
  R: "Rook",
  B: "Bishop",
  N: "Knight",
};

export function PromotionDialog({
  open,
  color,
  onSelect,
  onCancel,
}: PromotionDialogProps) {
  return (
    <Dialog open={open} onOpenChange={(o) => !o && onCancel()}>
      <DialogContent
        className="max-w-xs"
        style={{
          background: "oklch(0.20 0.025 232)",
          border: "1px solid oklch(0.70 0.12 70 / 0.5)",
        }}
        data-ocid="promotion.dialog"
      >
        <DialogHeader>
          <DialogTitle className="text-center text-primary">
            Pawn Promotion
          </DialogTitle>
        </DialogHeader>
        <p className="text-center text-sm text-muted-foreground mb-4">
          Choose a piece to promote to
        </p>
        <div className="grid grid-cols-4 gap-3">
          {PROMOTION_PIECES.map((pt) => (
            <button
              type="button"
              key={pt}
              className="flex flex-col items-center gap-1.5 p-3 rounded-lg border border-border hover:border-primary/60 hover:bg-primary/10 transition-all group"
              onClick={() => onSelect(pt)}
              data-ocid={`promotion.${pt.toLowerCase()}_button`}
            >
              <span
                className="text-4xl leading-none group-hover:scale-110 transition-transform"
                style={{
                  color: color === "w" ? "#F5EDD8" : "#1A1008",
                  filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.8))",
                  textShadow:
                    color === "w" ? "0 1px 3px rgba(0,0,0,0.9)" : "none",
                }}
              >
                {PIECE_SYMBOLS[color + pt]}
              </span>
              <span className="text-xs text-muted-foreground group-hover:text-foreground transition-colors">
                {PIECE_NAMES[pt]}
              </span>
            </button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
