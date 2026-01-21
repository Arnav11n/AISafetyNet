import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, type GameScoreInput } from "@shared/routes";

export function useLeaderboard() {
  return useQuery({
    queryKey: [api.game.getLeaderboard.path],
    queryFn: async () => {
      const res = await fetch(api.game.getLeaderboard.path);
      if (!res.ok) throw new Error("Failed to fetch leaderboard");
      return api.game.getLeaderboard.responses[200].parse(await res.json());
    },
  });
}

export function useSubmitScore() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: GameScoreInput) => {
      const res = await fetch(api.game.submitScore.path, {
        method: api.game.submitScore.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      
      if (!res.ok) {
        if (res.status === 400) {
          const error = await res.json();
          throw new Error(error.message || "Validation failed");
        }
        throw new Error("Failed to submit score");
      }
      
      return api.game.submitScore.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.game.getLeaderboard.path] });
    },
  });
}
