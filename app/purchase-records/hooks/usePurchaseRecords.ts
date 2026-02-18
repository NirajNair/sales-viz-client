import { useQuery } from "@tanstack/react-query";
import { getPurchaseRecords } from "../api";
import { PurchaseRecordsQueryState } from "../types";

export function usePurchaseRecords(params: PurchaseRecordsQueryState) {
  return useQuery({
    queryKey: ["purchase-records", params],
    queryFn: () => getPurchaseRecords(params),
  });
}
