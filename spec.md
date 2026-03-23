# Chess Game

## Current State
New project. Empty backend and frontend scaffolding.

## Requested Changes (Diff)

### Add
- Fully playable chess game with standard rules (legal move validation, check, checkmate, stalemate, en passant, castling, pawn promotion)
- Game state persisted on the backend (current board position, move history, game status)
- Two-player local game (both players take turns on same screen)
- Game status panel: player cards (Black / White) with timers, captured pieces
- Move history sidebar showing PGN-style move list
- Action buttons: New Game, Resign, Draw Offer
- Move highlighting: valid move indicators, last move highlight
- Pawn promotion dialog

### Modify
- N/A (new project)

### Remove
- N/A (new project)

## Implementation Plan
1. Backend: game state storage (board, turn, moves, status), new game, make move, get game state
2. Frontend: chess board component with piece rendering, move logic (legal move generation), drag or click-to-move, game status panel, move history, action buttons, promotion modal
