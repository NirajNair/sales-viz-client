"use client";

import * as React from "react";
import { Download, Filter, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { SellerFilter } from "./SellerFilter";
import { BuyerFilter } from "./BuyerFilter";
import { HsnFilter } from "./HsnFilter";
import { ChemicalNameFilter } from "./ChemicalNameFilter";
import { DateRangeFilter } from "./DateRangeFilter";
import { Entity, HsnCode } from "../types";

interface FilterBarProps {
  sellers: Entity[];
  selectedSellers: string[];
  onSellersChange: (selected: string[]) => void;
  buyers: Entity[];
  selectedBuyers: string[];
  onBuyersChange: (selected: string[]) => void;
  hsnCodes: HsnCode[];
  selectedHsnCodes: string[];
  onHsnCodesChange: (selected: string[]) => void;
  chemicalNames: string[];
  selectedChemicalNames: string[];
  onChemicalNamesChange: (selected: string[]) => void;
  fromDate: Date | undefined;
  toDate: Date | undefined;
  onFromDateChange: (date: Date | undefined) => void;
  onToDateChange: (date: Date | undefined) => void;
  onReset: () => void;
  onExport: () => void;
  isLoading?: boolean;
}

export function FilterBar({
  sellers,
  selectedSellers,
  onSellersChange,
  buyers,
  selectedBuyers,
  onBuyersChange,
  hsnCodes,
  selectedHsnCodes,
  onHsnCodesChange,
  chemicalNames,
  selectedChemicalNames,
  onChemicalNamesChange,
  fromDate,
  toDate,
  onFromDateChange,
  onToDateChange,
  onReset,
  onExport,
  isLoading,
}: FilterBarProps) {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <div className="space-y-3 min-w-0 w-full mb-4">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <div className="flex items-center justify-between">
          <CollapsibleTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className={isOpen ? "bg-muted" : ""}
            >
              <Filter className="mr-2 h-4 w-4" />
              Filters
            </Button>
          </CollapsibleTrigger>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={onReset}>
              <RotateCcw className="mr-2 h-4 w-4" />
              Reset
            </Button>
            <Button size="sm" onClick={onExport} className="bg-zinc-900">
              <Download className="mr-2 h-4 w-4" />
              Export CSV
            </Button>
          </div>
        </div>

        <CollapsibleContent className="pt-3">
          <div className="grid grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-4 min-w-0 w-full">
            <div className="space-y-2">
              <label className="text-sm font-medium">Invoice Date Range</label>
              <DateRangeFilter
                from={fromDate}
                to={toDate}
                onFromChange={onFromDateChange}
                onToChange={onToDateChange}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Sellers</label>
              <SellerFilter
                sellers={sellers}
                selected={selectedSellers}
                onChange={onSellersChange}
                isLoading={isLoading}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Buyers</label>
              <BuyerFilter
                buyers={buyers}
                selected={selectedBuyers}
                onChange={onBuyersChange}
                isLoading={isLoading}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">HSN Codes</label>
              <HsnFilter
                hsnCodes={hsnCodes}
                selected={selectedHsnCodes}
                onChange={onHsnCodesChange}
                isLoading={isLoading}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Chemical Names</label>
              <ChemicalNameFilter
                chemicals={chemicalNames}
                selected={selectedChemicalNames}
                onChange={onChemicalNamesChange}
                isLoading={isLoading}
              />
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}
