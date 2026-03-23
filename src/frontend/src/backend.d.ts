import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface ChessGame {
    fen: string;
    status: GameStatus;
    capturedWhite: string;
    moveHistory: Array<string>;
    capturedBlack: string;
}
export enum GameStatus {
    blackTurn = "blackTurn",
    stalemate = "stalemate",
    whiteTurn = "whiteTurn",
    draw = "draw",
    check = "check",
    checkmate = "checkmate"
}
export interface backendInterface {
    getAllGames(): Promise<Array<ChessGame>>;
    getGame(id: bigint): Promise<ChessGame>;
    makeMove(gameId: bigint, fen: string, move: string, newStatus: GameStatus, capturedWhite: string, capturedBlack: string): Promise<void>;
    offerDraw(gameId: bigint): Promise<void>;
    resign(gameId: bigint, winner: string): Promise<void>;
    startNewGame(): Promise<bigint>;
}
