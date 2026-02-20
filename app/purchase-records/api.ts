import { config } from "@/lib/config";
import {
  FilterOptionsResponse,
  GetPurchaseRecordsResponse,
  PurchaseRecordsQueryState,
} from "./types";

export async function getPurchaseRecords(
  params: PurchaseRecordsQueryState,
): Promise<GetPurchaseRecordsResponse> {
  const queryParams = new URLSearchParams();

  queryParams.set("sellerIds", params.sellers.join(","));
  queryParams.set("buyerIds", params.buyers.join(","));
  queryParams.set("hsnCodes", params.hsnCodes.join(","));
  queryParams.set("chemicalNames", params.chemicalNames.join(","));

  if (params.fromDate) queryParams.set("fromDate", params.fromDate);
  if (params.toDate) queryParams.set("toDate", params.toDate);
  queryParams.set("page", params.page.toString());
  queryParams.set("pageSize", params.pageSize.toString());
  queryParams.set("sortField", params.sortField);
  queryParams.set("sortOrder", params.sortOrder);

  const response = await fetch(
    `${config.apiBaseUrl}/api/purchase-records?${queryParams}`,
    { headers: { "Content-Type": "application/json" } },
  );

  if (!response.ok) throw new Error("Failed to fetch records");
  return response.json();
}

export async function getFilterOptions(): Promise<FilterOptionsResponse> {
  const response = await fetch(
    `${config.apiBaseUrl}/api/purchase-records/filter-options`,
    { headers: { "Content-Type": "application/json" } },
  );

  if (!response.ok) throw new Error("Failed to fetch filter options");
  return response.json();
}

export async function exportPurchaseRecords(
  params: Omit<
    PurchaseRecordsQueryState,
    "page" | "pageSize" | "sortField" | "sortOrder"
  >,
): Promise<Blob> {
  const queryParams = new URLSearchParams();

  queryParams.set("sellerIds", params.sellers.join(","));
  queryParams.set("buyerIds", params.buyers.join(","));
  queryParams.set("hsnCodes", params.hsnCodes.join(","));
  queryParams.set("chemicalNames", params.chemicalNames.join(","));

  if (params.fromDate) queryParams.set("fromDate", params.fromDate);
  if (params.toDate) queryParams.set("toDate", params.toDate);

  const response = await fetch(
    `${config.apiBaseUrl}/api/purchase-records/export?${queryParams}`,
    { headers: { "Content-Type": "application/json" } },
  );

  if (!response.ok) throw new Error("Failed to export records");
  return response.blob();
}
