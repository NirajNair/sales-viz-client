"use client";

import { getNexusDefaultDateRange, toUtcIso } from "@/lib/date-utils";
import {
  parseAsArrayOf,
  parseAsString,
  useQueryState,
} from "nuqs";
import { Suspense, useEffect, useMemo } from "react";
import { FilterBar } from "./components/FilterBar";
import { NexusGraph } from "./components/NexusGraph";
import { useNexusGraph } from "./hooks/useNexusGraph";
import { useNexusFilterOptions } from "./hooks/useNexusFilterOptions";

function NexusContent() {
  // URL state with nuqs
  const [entities, setEntities] = useQueryState(
    "entities",
    parseAsArrayOf(parseAsString).withDefault([])
  );
  const [hsnCodes, setHsnCodes] = useQueryState(
    "hsnCodes",
    parseAsArrayOf(parseAsString).withDefault([])
  );
  const [fromDateStr, setFromDateStr] = useQueryState("from");
  const [toDateStr, setToDateStr] = useQueryState("to");

  // Convert string dates to Date objects for the date picker
  const fromDate = fromDateStr ? new Date(fromDateStr) : undefined;
  const toDate = toDateStr ? new Date(toDateStr) : undefined;

  // Set default dates on first load (last 6 months)
  useEffect(() => {
    if (!fromDateStr && !toDateStr) {
      const { from, to } = getNexusDefaultDateRange();
      setFromDateStr(toUtcIso(from));
      setToDateStr(toUtcIso(to));
    }
  }, [fromDateStr, toDateStr, setFromDateStr, setToDateStr]);

  // Fetch filter options
  const { data: filterOptions, isLoading: isFilterOptionsLoading } =
    useNexusFilterOptions();

  // Fetch graph data - only when entities or hsn codes are selected
  const shouldFetchGraph = entities.length > 0 || hsnCodes.length > 0;

  const { data: graphData, isLoading: isGraphLoading } = useNexusGraph(
    {
      entities,
      hsnCodes,
      fromDate: fromDateStr,
      toDate: toDateStr,
    },
    shouldFetchGraph
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
