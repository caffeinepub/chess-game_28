import { ScrollArea } from "@/components/ui/scroll-area";
import { useRef } from "react";

interface MoveHistoryProps {
  moves: string[];
  currentMoveIndex: number;
  onNavigate: (index: number) => void;
}

export function MoveHistory({
  moves,
  currentMoveIndex,
  onNavigate,
}: MoveHistoryProps) {
  const pairs: Array<[string, string | undefined]> = [];
  for (let i = 0; i < moves.length; i += 2) {
    pairs.push([moves[i], moves[i + 1]]);
  }

  // Scroll to bottom using a callback ref — runs whenever the end element mounts/updates
  const endRefCallback = (el: HTMLDivElement | null) => {
    el?.scrollIntoView({ behavior: "smooth" });
  };
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <div className="flex flex-col h-full" data-ocid="move_history.panel">
      <div className="text-xs font-semibold uppercase tracking-widest text-primary/70 mb-2">
        Move History
      </div>

      <ScrollArea
        className="flex-1 rounded-lg border border-border"
        style={{ background: "oklch(0.16 0.022 232)" }}
      >
        <div ref={containerRef} className="p-2">
          {pairs.length === 0 ? (
            <div
              className="text-xs text-muted-foreground text-center py-6"
              data-ocid="move_history.empty_state"
            >
              No moves yet
            </div>
          ) : (
            pairs.map(([white, black], idx) => (
              <div
                key={`move-${idx}-${white}`}
                className="flex items-center text-xs mb-0.5 rounded overflow-hidden"
                data-ocid={`move_history.item.${idx + 1}`}
              >
                <span className="w-7 text-right pr-2 text-muted-foreground/60 select-none flex-shrink-0">
                  {idx + 1}.
                </span>
                <button
                  type="button"
                  className={`flex-1 text-left px-2 py-1 rounded-sm transition-colors ${
                    currentMoveIndex === idx * 2
                      ? "bg-primary/20 text-primary"
                      : "hover:bg-muted/50 text-foreground/80"
                  }`}
                  onClick={() => onNavigate(idx * 2)}
                  data-ocid={`move_history.item.${idx + 1}`}
                >
                  {white}
                </button>
                {black !== undefined && (
                  <button
                    type="button"
                    className={`flex-1 text-left px-2 py-1 rounded-sm transition-colors ${
                      currentMoveIndex === idx * 2 + 1
                        ? "bg-primary/20 text-primary"
                        : "hover:bg-muted/50 text-foreground/80"
                    }`}
                    onClick={() => onNavigate(idx * 2 + 1)}
                    data-ocid={`move_history.item.${idx + 1}`}
                  >
                    {black}
                  </button>
                )}
              </div>
            ))
          )}
          {/* Scroll anchor — callback ref triggers smooth scroll on each render */}
          <div ref={endRefCallback} />
        </div>
      </ScrollArea>

      <div className="flex gap-1 mt-2">
        <button
          type="button"
          className="flex-1 py-1.5 text-xs rounded border border-border text-muted-foreground hover:border-primary/50 hover:text-primary transition-colors disabled:opacity-40"
          onClick={() => onNavigate(-1)}
          disabled={currentMoveIndex < 0}
          data-ocid="move_history.pagination_prev"
        >
          ◀◀ Start
        </button>
        <button
          type="button"
          className="flex-1 py-1.5 text-xs rounded border border-border text-muted-foreground hover:border-primary/50 hover:text-primary transition-colors disabled:opacity-40"
          onClick={() => onNavigate(Math.max(-1, currentMoveIndex - 1))}
          disabled={currentMoveIndex < 0}
          data-ocid="move_history.pagination_prev"
        >
          ◀ Prev
        </button>
        <button
          type="button"
          className="flex-1 py-1.5 text-xs rounded border border-border text-muted-foreground hover:border-primary/50 hover:text-primary transition-colors disabled:opacity-40"
          onClick={() => onNavigate(currentMoveIndex + 1)}
          disabled={currentMoveIndex >= moves.length - 1}
          data-ocid="move_history.pagination_next"
        >
          Next ▶
        </button>
        <button
          type="button"
          className="flex-1 py-1.5 text-xs rounded border border-border text-muted-foreground hover:border-primary/50 hover:text-primary transition-colors disabled:opacity-40"
          onClick={() => onNavigate(moves.length - 1)}
          disabled={currentMoveIndex >= moves.length - 1}
          data-ocid="move_history.pagination_next"
        >
          End ▶▶
        </button>
      </div>
    </div>
  );
}
