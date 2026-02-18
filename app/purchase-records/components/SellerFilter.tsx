"use client";

import { MultiSelectEntity } from "@/components/ui/multi-select-entity";
import { Entity } from "../types";

interface SellerFilterProps {
  sellers: Entity[];
  selected: string[];
  onChange: (selected: string[]) => void;
  isLoading?: boolean;
}

export function SellerFilter({
  sellers,
  selected,
  onChange,
  isLoading,
}: SellerFilterProps) {
  return (
    <MultiSelectEntity
      options={sellers}
      selected={selected}
      onChange={onChange}
      placeholder="Select sellers..."
      searchPlaceholder="Search by name or GSTIN..."
      isLoading={isLoading}
    />
  );
}
