"use client";

import { MultiSelect } from "@/components/ui/multi-select";
import { HsnCode } from "../types";

interface HsnFilterProps {
  hsnCodes: HsnCode[];
  selected: string[];
  onChange: (selected: string[]) => void;
  isLoading?: boolean;
}

export function HsnFilter({
  hsnCodes,
  selected,
  onChange,
  isLoading,
}: HsnFilterProps) {
  // Extract HSN code strings from objects
  const hsnCodeStrings = hsnCodes.map((h) => h.code);

  return (
    <MultiSelect
      options={hsnCodeStrings}
      selected={selected}
      onChange={onChange}
      placeholder="Select HSN codes..."
      searchPlaceholder="Search HSN codes..."
      isLoading={isLoading}
    />
  );
}
