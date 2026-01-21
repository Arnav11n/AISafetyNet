import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, type ScamReportInput } from "@shared/routes";

export function useRadarStats() {
  return useQuery({
    queryKey: [api.radar.getStats.path],
    queryFn: async () => {
      const res = await fetch(api.radar.getStats.path);
      if (!res.ok) throw new Error("Failed to fetch radar stats");
      return api.radar.getStats.responses[200].parse(await res.json());
    },
  });
}

export function useSubmitScamReport() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: ScamReportInput) => {
      const res = await fetch(api.radar.submitReport.path, {
        method: api.radar.submitReport.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });

      if (!res.ok) {
        throw new Error("Failed to submit report");
      }

      return api.radar.submitReport.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.radar.getStats.path] });
    },
  });
}
