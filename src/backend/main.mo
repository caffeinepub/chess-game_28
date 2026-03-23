import Nat "mo:core/Nat";
import Text "mo:core/Text";
import Array "mo:core/Array";
import Map "mo:core/Map";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";

actor {
  type GameStatus = {
    #whiteTurn;
    #blackTurn;
    #check;
    #checkmate;
    #stalemate;
    #draw;
  };

  type ChessGame = {
    fen : Text;
    moveHistory : [Text];
    status : GameStatus;
    capturedWhite : Text;
    capturedBlack : Text;
  };

  let games = Map.empty<Nat, ChessGame>();
  var nextGameId = 0;

  func getGameInternal(id : Nat) : ChessGame {
    switch (games.get(id)) {
      case (null) { Runtime.trap("Game does not exist") };
      case (?game) { game };
    };
  };

  public shared ({ caller }) func startNewGame() : async Nat {
    let gameId = nextGameId;
    let initialGame : ChessGame = {
      fen = "rn1qkb1r/pb1p2pp/1p4n1/2ppN1N1/3P1P2/4P1P1/PPP4P/R1BQKB1R w KQkq - 0 1";
      moveHistory = [];
      status = #whiteTurn;
      capturedWhite = "";
      capturedBlack = "";
    };
    games.add(gameId, initialGame);
    nextGameId += 1;
    gameId;
  };

  public query ({ caller }) func getGame(id : Nat) : async ChessGame {
    getGameInternal(id);
  };

  public shared ({ caller }) func makeMove(gameId : Nat, fen : Text, move : Text, newStatus : GameStatus, capturedWhite : Text, capturedBlack : Text) : async () {
    let game = getGameInternal(gameId);

    let updatedMoves = game.moveHistory.concat([move]);

    let updatedGame : ChessGame = {
      fen;
      moveHistory = updatedMoves;
      status = newStatus;
      capturedWhite;
      capturedBlack;
    };

    games.add(gameId, updatedGame);
  };

  public shared ({ caller }) func resign(gameId : Nat, winner : Text) : async () {
    let game = getGameInternal(gameId);
    if (winner == "white") {
      games.add(gameId, { game with status = #checkmate });
    } else if (winner == "black") {
      games.add(gameId, { game with status = #checkmate });
    };
  };

  public shared ({ caller }) func offerDraw(gameId : Nat) : async () {
    let game = getGameInternal(gameId);
    games.add(gameId, { game with status = #draw });
  };

  public query ({ caller }) func getAllGames() : async [ChessGame] {
    games.values().toArray();
  };
};
