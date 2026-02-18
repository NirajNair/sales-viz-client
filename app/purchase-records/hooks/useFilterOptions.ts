import { useQuery } from "@tanstack/react-query";
import { getFilterOptions } from "../api";

export function useFilterOptions() {
  return useQuery({
    queryKey: ["filter-options"],
    queryFn: getFilterOptions,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
