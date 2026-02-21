"use client";

import { getNexusDefaultDateRange, toUtcIso } from "@/lib/date-utils";
import { parseAsArrayOf, parseAsString, useQueryState } from "nuqs";
import { Suspense, useEffect, useMemo } from "react";
import { FilterBar } from "./components/FilterBar";
import { NexusGraph } from "./components/NexusGraph";
import { useNexusFilterOptions } from "./hooks/useNexusFilterOptions";
import { useNexusGraph } from "./hooks/useNexusGraph";

const defaultDateRange = (() => {
  const { from, to } = getNexusDefaultDateRange();
  return { from: toUtcIso(from), to: toUtcIso(to) };
})();

function NexusContent() {
  // URL state with nuqs
  const [entities, setEntities] = useQueryState(
    "entities",
    parseAsArrayOf(parseAsString).withDefault([]),
  );
  const [hsnCodes, setHsnCodes] = useQueryState(
    "hsnCodes",
    parseAsArrayOf(parseAsString).withDefault([]),
  );
  const [fromDateStr, setFromDateStr] = useQueryState("from");
  const [toDateStr, setToDateStr] = useQueryState("to");

  // Set default dates on first load
  useEffect(() => {
    if (!fromDateStr && !toDateStr) {
      setFromDateStr(defaultDateRange.from);
      setToDateStr(defaultDateRange.to);
    }
  }, [fromDateStr, toDateStr, setFromDateStr, setToDateStr]);

  // Convert string dates to Date objects for the date picker
  const fromDate = fromDateStr
    ? new Date(fromDateStr)
    : new Date(defaultDateRange.from);
  const toDate = toDateStr
    ? new Date(toDateStr)
    : new Date(defaultDateRange.to);

  // Fetch filter options FIRST
  const {
    data: filterOptions,
    isLoading: isFilterOptionsLoading,
    isSuccess: isFilterOptionsSuccess,
  } = useNexusFilterOptions();

  // Fetch graph data ONLY if filter options succeeded AND entities or HSN codes are selected
  const shouldFetchGraph =
    isFilterOptionsSuccess && (entities.length > 0 || hsnCodes.length > 0);

  const { data: graphData, isLoading: isGraphLoading } = useNexusGraph(
    {
      entities,
      hsnCodes,
      fromDate: fromDateStr,
      toDate: toDateStr,
    },
    shouldFetchGraph,
  );

  // Transform entities for the filter (combine all entities from filter options)
  const availableEntities = useMemo(() => {
    if (!filterOptions) return [];
    // Remove duplicates based on id
    const uniqueEntities = new Map();
    filterOptions.entities.forEach((entity) => {
      uniqueEntities.set(entity.id, entity);
    });
    return Array.from(uniqueEntities.values());
  }, [filterOptions]);

  const handleReset = () => {
    setEntities([]);
    setHsnCodes([]);
    const { from, to } = getNexusDefaultDateRange();
    setFromDateStr(toUtcIso(from));
    setToDateStr(toUtcIso(to));
  };

  return (
    <div className="space-y-6 w-full min-w-0">
      <div>
        <h1 className="text-2xl text-page-title font-bold tracking-tight">
          Nexus
        </h1>
        <p className="text-muted-foreground">
          Visualize entity relationships and transaction networks
        </p>
      </div>

      <FilterBar
        entities={availableEntities}
        selectedEntities={entities}
        onEntitiesChange={setEntities}
        hsnCodes={filterOptions?.hsnCodes || []}
        selectedHsnCodes={hsnCodes}
        onHsnCodesChange={setHsnCodes}
        fromDate={fromDate}
        toDate={toDate}
        onFromDateChange={(date) => date && setFromDateStr(toUtcIso(date))}
        onToDateChange={(date) => date && setToDateStr(toUtcIso(date))}
        onReset={handleReset}
        isLoading={isFilterOptionsLoading}
      />

      <NexusGraph
        nodes={graphData?.nodes || []}
        links={graphData?.links || []}
        isLoading={isGraphLoading && shouldFetchGraph}
      />
    </div>
  );
}

export default function NexusPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      }
    >
      <NexusContent />
    </Suspense>
  );
}
