"use client";

import { Button } from "@/components/ui/button";
import { MultiSelectEntity } from "@/components/ui/multi-select-entity";
import { Entity, HsnCode } from "../types";
import { DateRangeFilter } from "./DateRangeFilter";

interface FilterBarProps {
  entities: Entity[];
  selectedEntities: string[];
  onEntitiesChange: (selected: string[]) => void;
  hsnCodes: HsnCode[];
  selectedHsnCodes: string[];
  onHsnCodesChange: (selected: string[]) => void;
  fromDate: Date | undefined;
  toDate: Date | undefined;
  onFromDateChange: (date: Date | undefined) => void;
  onToDateChange: (date: Date | undefined) => void;
  onReset: () => void;
  isLoading: boolean;
}

export function FilterBar({
  entities,
  selectedEntities,
  onEntitiesChange,
  hsnCodes,
  selectedHsnCodes,
  onHsnCodesChange,
  fromDate,
  toDate,
  onFromDateChange,
  onToDateChange,
  onReset,
  isLoading,
}: FilterBarProps) {
  return (
    <div className="rounded-md border bg-card p-4 space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <DateRangeFilter
          from={fromDate}
          to={toDate}
          onFromChange={onFromDateChange}
          onToChange={onToDateChange}
        />
        <MultiSelectEntity
          options={entities}
          selected={selectedEntities}
          onChange={onEntitiesChange}
          placeholder="Select entities..."
          searchPlaceholder="Search by name or GSTIN..."
          isLoading={isLoading}
        />
        <HsnCodeFilter
          options={hsnCodes}
          selected={selectedHsnCodes}
          onChange={onHsnCodesChange}
          placeholder="Select HSN codes..."
          searchPlaceholder="Search HSN codes..."
          isLoading={isLoading}
        />
      </div>
      <div className="flex justify-end">
        <Button variant="outline" onClick={onReset} size="sm">
          Reset
        </Button>
      </div>
    </div>
  );
}

import { Badge } from "@/components/ui/badge";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Check, ChevronsUpDown, X } from "lucide-react";
import * as React from "react";

interface HsnCodeFilterProps {
  options: HsnCode[];
  selected: string[];
  onChange: (selected: string[]) => void;
  placeholder: string;
  searchPlaceholder: string;
  isLoading?: boolean;
}

function HsnCodeFilter({
  options,
  selected,
  onChange,
  placeholder,
  searchPlaceholder,
  isLoading,
}: HsnCodeFilterProps) {
  const [open, setOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");

  const selectedHsnCodes = options.filter((opt) => selected.includes(opt.code));

  const filteredOptions = React.useMemo(() => {
    if (!searchQuery) return options;
    const query = searchQuery.toLowerCase();
    return options.filter((opt) => opt.code.toLowerCase().includes(query));
  }, [options, searchQuery]);

  const toggleSelection = (hsnCode: string) => {
    if (selected.includes(hsnCode)) {
      onChange(selected.filter((code) => code !== hsnCode));
    } else {
      onChange([...selected, hsnCode]);
    }
  };

  const removeSelection = (hsnCode: string) => {
    onChange(selected.filter((code) => code !== hsnCode));
  };

  return (
    <div className="flex flex-col gap-2 w-full">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between h-auto min-h-10 py-2"
            disabled={isLoading}
          >
            <span className="truncate">
              {isLoading
                ? "Loading..."
                : selected.length === 0
                  ? placeholder
                  : `${selected.length} selected`}
            </span>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[350px] p-0" align="start">
          <Command>
            <CommandInput
              placeholder={searchPlaceholder}
              value={searchQuery}
              onValueChange={setSearchQuery}
            />
            <CommandList>
              <CommandEmpty>No HSN codes found.</CommandEmpty>
              <CommandGroup>
                {filteredOptions.map((hsn) => (
                  <CommandItem
                    key={hsn.code}
                    onSelect={() => toggleSelection(hsn.code)}
                    className="cursor-pointer"
                  >
                    <div className="flex flex-col flex-1">
                      <span className="font-medium">{hsn.code}</span>
                    </div>
                    <Check
                      className={cn(
                        "ml-2 h-4 w-4",
                        selected.includes(hsn.code)
                          ? "opacity-100"
                          : "opacity-0",
                      )}
                    />
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {selectedHsnCodes.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {selectedHsnCodes.map((hsn) => (
            <Badge
              key={hsn.code}
              variant="secondary"
              className="cursor-pointer hover:bg-secondary/80"
              onClick={() => removeSelection(hsn.code)}
            >
              {hsn.code}
              <X className="ml-1 h-3 w-3" />
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}
