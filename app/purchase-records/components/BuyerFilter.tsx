"use client";

import { MultiSelectEntity } from "@/components/ui/multi-select-entity";
import { Entity } from "../types";

interface BuyerFilterProps {
  buyers: Entity[];
  selected: string[];
  onChange: (selected: string[]) => void;
  isLoading?: boolean;
}

export function BuyerFilter({
  buyers,
  selected,
  onChange,
  isLoading,
}: BuyerFilterProps) {
  return (
    <MultiSelectEntity
      options={buyers}
      selected={selected}
      onChange={onChange}
      placeholder="Select buyers..."
      searchPlaceholder="Search by name or GSTIN..."
      isLoading={isLoading}
    />
  );
}
