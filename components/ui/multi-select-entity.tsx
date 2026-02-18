"use client";

import * as React from "react";
import { Check, X, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
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
import { Badge } from "@/components/ui/badge";

interface Entity {
  id: string;
  name: string;
  gstin: string;
}

interface MultiSelectEntityProps {
  options: Entity[];
  selected: string[];
  onChange: (selected: string[]) => void;
  placeholder: string;
  searchPlaceholder: string;
  isLoading?: boolean;
}

export function MultiSelectEntity({
  options,
  selected,
  onChange,
  placeholder,
  searchPlaceholder,
  isLoading,
}: MultiSelectEntityProps) {
  const [open, setOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");

  const selectedEntities = options.filter((opt) => selected.includes(opt.id));

  // Filter options based on search query (search by name OR gstin)
  const filteredOptions = React.useMemo(() => {
    if (!searchQuery) return options;
    const query = searchQuery.toLowerCase();
    return options.filter(
      (opt) =>
        opt.name.toLowerCase().includes(query) ||
        opt.gstin.toLowerCase().includes(query)
    );
  }, [options, searchQuery]);

  const toggleSelection = (entityId: string) => {
    if (selected.includes(entityId)) {
      onChange(selected.filter((id) => id !== entityId));
    } else {
      onChange([...selected, entityId]);
    }
  };

  const removeSelection = (entityId: string) => {
    onChange(selected.filter((id) => id !== entityId));
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
              <CommandEmpty>No entities found.</CommandEmpty>
              <CommandGroup>
                {filteredOptions.map((entity) => (
                  <CommandItem
                    key={entity.id}
                    onSelect={() => toggleSelection(entity.id)}
                    className="cursor-pointer"
                  >
                    <div className="flex flex-col flex-1">
                      <span className="font-medium">{entity.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {entity.gstin}
                      </span>
                    </div>
                    <Check
                      className={cn(
                        "ml-2 h-4 w-4",
                        selected.includes(entity.id)
                          ? "opacity-100"
                          : "opacity-0"
                      )}
                    />
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {/* Selected badges */}
      {selectedEntities.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {selectedEntities.map((entity) => (
            <Badge
              key={entity.id}
              variant="secondary"
              className="cursor-pointer hover:bg-secondary/80"
              onClick={() => removeSelection(entity.id)}
            >
              {entity.name}
              <X className="ml-1 h-3 w-3" />
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}
