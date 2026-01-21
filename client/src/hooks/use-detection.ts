import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@shared/routes";

export function useDetectionHistory() {
  return useQuery({
    queryKey: [api.detection.history.path],
    queryFn: async () => {
      const res = await fetch(api.detection.history.path, { credentials: "include" });
      if (res.status === 401) return null;
      if (!res.ok) throw new Error("Failed to fetch history");
      return api.detection.history.responses[200].parse(await res.json());
    },
  });
}

export function useAnalyzeMedia() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (formData: FormData) => {
      // Note: We don't set Content-Type header for FormData, browser does it with boundary
      const res = await fetch(api.detection.analyze.path, {
        method: api.detection.analyze.method,
        body: formData,
        credentials: "include",
      });

      if (!res.ok) {
        const error = await res.json().catch(() => ({}));
        throw new Error(error.message || "Analysis failed");
      }

      return api.detection.analyze.responses[200].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.detection.history.path] });
    },
  });
}
