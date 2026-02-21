import { useQuery } from "@tanstack/react-query";
import { getNexusGraph } from "../api";
import { NexusQueryState } from "../types";

export function useNexusGraph(
  params: NexusQueryState,
  enabled: boolean = true,
) {
  return useQuery({
    queryKey: ["nexus-graph", params],
    queryFn: () => getNexusGraph(params),
    enabled,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
