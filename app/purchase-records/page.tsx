"use client";

import { getDefaultDateRange, toUtcIso } from "@/lib/date-utils";
import { useMutation } from "@tanstack/react-query";
import {
  parseAsArrayOf,
  parseAsInteger,
  parseAsString,
  useQueryState,
} from "nuqs";
import { Suspense, useEffect, useMemo } from "react";
import { exportPurchaseRecords } from "./api";
import { FilterBar } from "./components/FilterBar";
import { PurchaseRecordsTable } from "./components/PurchaseRecordsTable";
import { useFilterOptions } from "./hooks/useFilterOptions";
import { usePurchaseRecords } from "./hooks/usePurchaseRecords";

function PurchaseRecordsContent() {
  // URL state with nuqs
  const [sellers, setSellers] = useQueryState(
    "sellers",
    parseAsArrayOf(parseAsString).withDefault([]),
  );
  const [buyers, setBuyers] = useQueryState(
    "buyers",
    parseAsArrayOf(parseAsString).withDefault([]),
  );
  const [hsnCodes, setHsnCodes] = useQueryState(
    "hsn",
    parseAsArrayOf(parseAsString).withDefault([]),
  );
  const [chemicalNames, setChemicalNames] = useQueryState(
    "chemicals",
    parseAsArrayOf(parseAsString).withDefault([]),
  );
  const [fromDateStr, setFromDateStr] = useQueryState("from");
  const [toDateStr, setToDateStr] = useQueryState("to");
  const [page, setPage] = useQueryState("page", parseAsInteger.withDefault(1));
  const [pageSize, setPageSize] = useQueryState(
    "size",
    parseAsInteger.withDefault(25),
  );
  const [sortField, setSortField] = useQueryState(
    "sort",
    parseAsString.withDefault("invoiceDate"),
  );
  const [sortOrder, setSortOrder] = useQueryState(
    "order",
    parseAsString.withDefault("desc"),
  );

  // Convert string dates to Date objects for the date picker
  const fromDate = fromDateStr ? new Date(fromDateStr) : undefined;
  const toDate = toDateStr ? new Date(toDateStr) : undefined;

  // Set default dates on first load
  useEffect(() => {
    if (!fromDateStr && !toDateStr) {
      const { from, to } = getDefaultDateRange();
      setFromDateStr(toUtcIso(from));
      setToDateStr(toUtcIso(to));
    }
  }, [fromDateStr, toDateStr, setFromDateStr, setToDateStr]);

  // Fetch filter options FIRST
  const {
    data: filterOptions,
    isLoading: isFilterOptionsLoading,
    isSuccess: isFilterOptionsSuccess,
  } = useFilterOptions();

  // Fetch data ONLY if filter options succeeded
  const { data, isLoading } = usePurchaseRecords(
    {
      sellers,
      buyers,
      hsnCodes,
      chemicalNames,
      fromDate: fromDateStr,
      toDate: toDateStr,
      page,
      pageSize,
      sortField,
      sortOrder: sortOrder as "asc" | "desc",
    },
    isFilterOptionsSuccess,
  );

  // Filter available chemicals based on selected HSN
  const availableChemicals = useMemo(() => {
    if (!filterOptions) return [];
    if (hsnCodes.length === 0) {
      return [
        ...new Set(
          filterOptions.hsnChemicalMappings.map((m) => m.chemicalName),
        ),
      ];
    }
    return [
      ...new Set(
        filterOptions.hsnChemicalMappings
          .filter((m) => hsnCodes.includes(m.hsnCode))
          .map((m) => m.chemicalName),
      ),
    ];
  }, [filterOptions, hsnCodes]);

  // Reset chemical names when HSN changes
  useEffect(() => {
    if (hsnCodes.length > 0 && chemicalNames.length > 0) {
      // Filter out chemical names that are no longer valid for selected HSNs
      const validChemicals = new Set(availableChemicals);
      const filteredChemicals = chemicalNames.filter((c) =>
        validChemicals.has(c),
      );
      if (filteredChemicals.length !== chemicalNames.length) {
        setChemicalNames(filteredChemicals);
      }
    }
  }, [hsnCodes, availableChemicals, chemicalNames, setChemicalNames]);

  const handleReset = () => {
    setSellers([]);
    setBuyers([]);
    setHsnCodes([]);
    setChemicalNames([]);
    const { from, to } = getDefaultDateRange();
    setFromDateStr(toUtcIso(from));
    setToDateStr(toUtcIso(to));
    setPage(1);
    setSortField("invoiceDate");
    setSortOrder("desc");
  };

  // Export mutation
  const exportMutation = useMutation({
    mutationFn: exportPurchaseRecords,
    onSuccess: (blob) => {
      // Download the file
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `purchase-records-${new Date().toISOString().split("T")[0]}.csv`;
      link.click();
      URL.revokeObjectURL(url);
    },
    // Error toast is now handled globally by QueryClient
  });

  const handleExport = () => {
    exportMutation.mutate({
      sellers,
      buyers,
      hsnCodes,
      chemicalNames,
      fromDate: fromDateStr,
      toDate: toDateStr,
    });
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize);
    setPage(1); // Reset to first page when changing page size
  };

  return (
    <div className="space-y-6 w-full min-w-0">
      <div>
        <h1 className="text-2xl text-page-title font-bold tracking-tight">
          Purchase Records
        </h1>
        <p className="text-muted-foreground">
          View and filter purchase transaction records
        </p>
      </div>

      <FilterBar
        sellers={filterOptions?.sellers || []}
        selectedSellers={sellers}
        onSellersChange={setSellers}
        buyers={filterOptions?.buyers || []}
        selectedBuyers={buyers}
        onBuyersChange={setBuyers}
        hsnCodes={filterOptions?.hsnCodes || []}
        selectedHsnCodes={hsnCodes}
        onHsnCodesChange={setHsnCodes}
        chemicalNames={availableChemicals}
        selectedChemicalNames={chemicalNames}
        onChemicalNamesChange={setChemicalNames}
        fromDate={fromDate}
        toDate={toDate}
        onFromDateChange={(date) => date && setFromDateStr(toUtcIso(date))}
        onToDateChange={(date) => date && setToDateStr(toUtcIso(date))}
        onReset={handleReset}
        onExport={handleExport}
        isLoading={isFilterOptionsLoading}
      />

      <PurchaseRecordsTable
        data={data?.records || []}
        sorting={
          sortField ? [{ id: sortField, desc: sortOrder === "desc" }] : []
        }
        onSortingChange={(updater) => {
          const newSorting =
            typeof updater === "function"
              ? updater([{ id: sortField, desc: sortOrder === "desc" }])
              : updater;
          if (newSorting.length > 0) {
            setSortField(newSorting[0].id);
            setSortOrder(newSorting[0].desc ? "desc" : "asc");
          } else {
            setSortField("invoiceDate");
            setSortOrder("desc");
          }
        }}
        isLoading={isLoading}
        page={page}
        pageSize={pageSize}
        totalPages={data?.pagination.totalPages || 1}
        total={data?.pagination.total || 0}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
      />
    </div>
  );
}

export default function PurchaseRecordsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      }
    >
      <PurchaseRecordsContent />
    </Suspense>
  );
}
