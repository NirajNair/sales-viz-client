import { useQuery } from "@tanstack/react-query";
import { getNexusFilterOptions } from "../api";

export function useNexusFilterOptions() {
  return useQuery({
    queryKey: ["nexus-filter-options"],
    queryFn: getNexusFilterOptions,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
