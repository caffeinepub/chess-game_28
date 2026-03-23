import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { GameStatus } from "../backend";
import { useActor } from "./useActor";

export function useGetAllGames() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["allGames"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllGames();
    },
    enabled: !!actor && !isFetching,
    staleTime: 30000,
  });
}

export function useStartNewGame() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("No actor");
      return actor.startNewGame();
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["allGames"] }),
  });
}

export function useMakeMove() {
  const { actor } = useActor();
  return useMutation({
    mutationFn: async (params: {
      gameId: bigint;
      fen: string;
      move: string;
      status: GameStatus;
      capturedWhite: string;
      capturedBlack: string;
    }) => {
      if (!actor) return;
      await actor.makeMove(
        params.gameId,
        params.fen,
        params.move,
        params.status,
        params.capturedWhite,
        params.capturedBlack,
      );
    },
  });
}

export function useResign() {
  const { actor } = useActor();
  return useMutation({
    mutationFn: async (params: { gameId: bigint; winner: string }) => {
      if (!actor) return;
      await actor.resign(params.gameId, params.winner);
    },
  });
}

export function useOfferDraw() {
  const { actor } = useActor();
  return useMutation({
    mutationFn: async (gameId: bigint) => {
      if (!actor) return;
      await actor.offerDraw(gameId);
    },
  });
}
