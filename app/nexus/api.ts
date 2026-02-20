import { config } from "@/lib/config";
import {
  NexusGraphResponse,
  NexusFilterOptionsResponse,
  NexusQueryState,
} from "./types";

export async function getNexusGraph(
  params: NexusQueryState
): Promise<NexusGraphResponse> {
  const queryParams = new URLSearchParams();

  params.entities.forEach((id) => queryParams.append("entityIds", id));
  params.hsnCodes.forEach((code) => queryParams.append("hsnCodes", code));

  if (params.fromDate) queryParams.set("fromDate", params.fromDate);
  if (params.toDate) queryParams.set("toDate", params.toDate);

  const response = await fetch(
    `${config.apiBaseUrl}/api/nexus/graph?${queryParams}`,
    { headers: { "Content-Type": "application/json" } }
  );

  if (!response.ok) throw new Error("Failed to fetch nexus graph");
  return response.json();
}

export async function getNexusFilterOptions(): Promise<NexusFilterOptionsResponse> {
  const response = await fetch(
    `${config.apiBaseUrl}/api/nexus/filter-options`,
    { headers: { "Content-Type": "application/json" } }
  );

  if (!response.ok) throw new Error("Failed to fetch filter options");
  return response.json();
}
