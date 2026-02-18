"use client";

import { MultiSelect } from "@/components/ui/multi-select";

interface ChemicalNameFilterProps {
  chemicals: string[];
  selected: string[];
  onChange: (selected: string[]) => void;
  isLoading?: boolean;
}

export function ChemicalNameFilter({
  chemicals,
  selected,
  onChange,
  isLoading,
}: ChemicalNameFilterProps) {
  return (
    <MultiSelect
      options={chemicals}
      selected={selected}
      onChange={onChange}
      placeholder="Select chemical names..."
      searchPlaceholder="Search chemical names..."
      isLoading={isLoading}
    />
  );
}
