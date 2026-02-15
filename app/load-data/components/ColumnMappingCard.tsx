"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DATE_FIELDS,
  DATE_FORMATS,
  DateFormat,
  DATETIME_FORMATS,
  MONTH_NAME_FORMATS,
  SPECIAL_FORMATS,
} from "@/lib/constants";
import { cn } from "@/lib/utils";
import { useDroppable } from "@dnd-kit/core";
import { ChevronDown, ChevronUp, Merge, Split, X } from "lucide-react";
import { useState } from "react";
import { ColumnMapping, MappingPart } from "../types/get-mappings";

const isDateField = (fieldName: string | null): boolean => {
  if (!fieldName) return false;
  return DATE_FIELDS.includes(fieldName);
};

interface FormatGroup {
  label: string;
  formats: DateFormat[];
}

const DROPDOWN_FORMAT_GROUPS: FormatGroup[] = [
  {
    label: "Common Formats",
    formats: DATE_FORMATS.slice(0, 6),
  },
  {
    label: "With Time",
    formats: DATETIME_FORMATS,
  },
  {
    label: "Other Formats",
    formats: [...MONTH_NAME_FORMATS, ...SPECIAL_FORMATS],
  },
];

interface ColumnMappingCardProps {
  mapping: ColumnMapping;
  index: number;
  onUpdate: (mapping: ColumnMapping) => void;
  onRemove: () => void;
  onRemovePartMapping: (partIndex: number) => void;
  showValidationErrors?: boolean;
}

export function ColumnMappingCard({
  mapping,
  onUpdate,
  onRemove,
  onRemovePartMapping,
  showValidationErrors = false,
}: ColumnMappingCardProps) {
  const [isExpanded, setIsExpanded] = useState(mapping.shouldSplit);
  const [searchQuery, setSearchQuery] = useState("");

  // Only the drop zone area should be droppable
  const { isOver, setNodeRef } = useDroppable({
    id: `column-dropzone-${mapping.excelColumnIndex}`,
    data: { columnIndex: mapping.excelColumnIndex },
    disabled: mapping.shouldSplit, // Disable when in split mode
  });

  const isMapped = mapping.mappedTo || mapping.parts.some((p) => p.mapTo);
  const mappedPartsCount = mapping.parts.filter((p) => p.mapTo).length;

  const handleToggleSplit = () => {
    const newShouldSplit = !mapping.shouldSplit;
    onUpdate({
      ...mapping,
      shouldSplit: newShouldSplit,
      // When splitting: clear the single mappedTo, start with empty parts
      // When unsplitting: clear all parts, mappedTo, and delimiter
      mappedTo: null,
      parts: [],
      delimiter: null,
    });
    setIsExpanded(newShouldSplit);
  };

  const handleDelimiterChange = (delimiter: string) => {
    // Auto-generate parts based on delimiter
    let newParts: MappingPart[] = [];

    // Only split if delimiter is not empty and not just whitespace
    if (delimiter && delimiter.trim() && mapping.sampleValue) {
      const splitValues = mapping.sampleValue.split(delimiter);
      newParts = splitValues.map((value, idx) => ({
        index: idx,
        name: value.trim(),
        mapTo: "",
        dateFormat: null,
      }));
    }

    onUpdate({
      ...mapping,
      delimiter,
      parts: newParts,
    });
  };

  const handleDateFormatChange = (format: string) => {
    onUpdate({
      ...mapping,
      dateFormat: format,
    });
  };

  const handlePartDateFormatChange = (partIndex: number, format: string) => {
    const newParts = [...mapping.parts];
    newParts[partIndex] = {
      ...newParts[partIndex],
      dateFormat: format,
    };
    onUpdate({
      ...mapping,
      parts: newParts,
    });
  };

  const isMappedToDateField = isDateField(mapping.mappedTo);

  return (
    <div
      className={cn("rounded-xl border bg-card transition-all border-border")}
    >
      <div className="p-4">
        <div className="flex items-start gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h4 className="text-base font-semibold">{mapping.excelHeader}</h4>
              {isMapped && !mapping.shouldSplit && (
                <Badge
                  variant="secondary"
                  className="bg-green-600/10 text-green-600/80"
                >
                  Mapped
                </Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              <span className="font-mono text-xs">{mapping.sampleValue}</span>
            </p>

            {/* Date Format Selector - Option C placement */}
            {isMappedToDateField && (
              <div className="mt-3">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-muted-foreground">
                    Format:
                  </span>
                  <Select
                    value={mapping.dateFormat || ""}
                    onValueChange={handleDateFormatChange}
                  >
                    <SelectTrigger
                      className={cn(
                        "w-75 h-8 text-xs",
                        showValidationErrors &&
                          !mapping.dateFormat &&
                          "border-red-500 focus:ring-red-500",
                      )}
                    >
                      <SelectValue placeholder="Select date format..." />
                    </SelectTrigger>
                    <SelectContent
                      className="max-h-[400px] w-75"
                      position="popper"
                      sideOffset={4}
                      align="start"
                    >
                      {/* Search Input */}
                      <div className="p-2 pb-1 sticky top-0 bg-popover z-10">
                        <Input
                          placeholder="Search"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="h-8 text-xs"
                          onKeyDown={(e) => e.stopPropagation()}
                        />
                      </div>
                      {/* Filtered Groups */}
                      {DROPDOWN_FORMAT_GROUPS.map((group) => {
                        const filteredFormats = group.formats.filter((f) =>
                          f.label
                            .toLowerCase()
                            .includes(searchQuery.toLowerCase()),
                        );
                        if (filteredFormats.length === 0) return null;
                        return (
                          <SelectGroup key={group.label}>
                            <div className="flex items-center">
                              <SelectLabel className="text-xs font-bold uppercase text-muted-foreground py-1.5 whitespace-nowrap">
                                {group.label}
                              </SelectLabel>
                              <div className="w-full border-b border-dashed border-muted-foreground/30"></div>
                            </div>
                            {filteredFormats.map((format) => (
                              <SelectItem
                                key={format.value}
                                value={format.value}
                                className="text-xs"
                              >
                                {format.label}
                              </SelectItem>
                            ))}
                          </SelectGroup>
                        );
                      })}
                      {/* No results message */}
                      {DROPDOWN_FORMAT_GROUPS.every((group) =>
                        group.formats.every(
                          (f) =>
                            !f.label
                              .toLowerCase()
                              .includes(searchQuery.toLowerCase()),
                        ),
                      ) && (
                        <div className="px-2 py-3 text-xs text-muted-foreground text-center">
                          No results found
                        </div>
                      )}
                    </SelectContent>
                  </Select>
                </div>
                {/* Validation Error Message */}
                {showValidationErrors && !mapping.dateFormat && (
                  <p className="text-xs text-red-500 mt-1">
                    Selection of a format is required
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Drop Zone - ONLY this area accepts drops for non-split columns */}
          {!mapping.shouldSplit ? (
            <div className="flex flex-col gap-2">
              <div
                ref={setNodeRef}
                className={cn(
                  "w-75 min-h-[40px] rounded-lg border-2 border-dashed flex items-center transition-all",
                  isOver
                    ? "border-primary bg-primary/5"
                    : isMapped
                      ? "border-border bg-muted/30"
                      : "border-border bg-muted/20",
                )}
              >
                {mapping.mappedTo ? (
                  <div className="flex items-center gap-2 px-3 w-full justify-between">
                    <code className="truncate text-sm font-mono">
                      {mapping.mappedTo}
                    </code>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 shrink-0 justify-end"
                      onClick={onRemove}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ) : (
                  <span className="text-sm text-muted-foreground text-center w-full">
                    {isOver ? "Drop here!" : "Drop field here"}
                  </span>
                )}
              </div>
            </div>
          ) : (
            /* For split mode, show split indicator */
            <div className="w-fit rounded-lg border border-border bg-muted/20 flex items-center justify-center">
              <div className="p-2 px-4 text-center">
                <p className="text-xs text-muted-foreground">
                  {mapping.parts.length > 0
                    ? `${mappedPartsCount} of ${mapping.parts.length} parts mapped`
                    : "Enter a delimiter to split"}
                </p>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={handleToggleSplit}>
              {mapping.shouldSplit ? (
                <>
                  <Merge className="w-4 h-4 mr-1" />
                  Unsplit
                </>
              ) : (
                <>
                  <Split className="w-4 h-4 mr-1" />
                  Split
                </>
              )}
            </Button>
            {mapping.shouldSplit && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsExpanded(!isExpanded)}
              >
                {isExpanded ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </Button>
            )}
          </div>
        </div>

        {/* Split Configuration */}
        {mapping.shouldSplit && isExpanded && (
          <div className="mt-4 border-t border-dashed pt-4">
            <div className="space-y-4">
              {/* Delimiter Input */}
              <div className="flex items-center gap-4">
                <label className="w-24 text-sm font-medium">Delimiter:</label>
                <Input
                  value={mapping.delimiter || ""}
                  onChange={(e) => handleDelimiterChange(e.target.value)}
                  placeholder="e.g., / or -"
                  className="w-32"
                />
                <span className="text-xs text-muted-foreground">
                  Values will be split using this delimiter
                </span>
              </div>

              {/* Parts Configuration with drop zones */}
              {mapping.parts.length > 0 && (
                <div className="space-y-1">
                  <div className="text-sm font-medium">Split Parts:</div>
                  <div className="space-y-2">
                    {mapping.parts.map((part, idx) => (
                      <PartDropZone
                        key={idx}
                        part={part}
                        partIndex={idx}
                        columnIndex={mapping.excelColumnIndex}
                        onRemoveMapping={() => onRemovePartMapping(idx)}
                        onDateFormatChange={(format) =>
                          handlePartDateFormatChange(idx, format)
                        }
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Separate component for part drop zones
interface PartDropZoneProps {
  part: MappingPart;
  partIndex: number;
  columnIndex: number;
  onRemoveMapping: () => void;
  onDateFormatChange?: (format: string) => void;
}

function PartDropZone({
  part,
  partIndex,
  columnIndex,
  onRemoveMapping,
  onDateFormatChange,
}: PartDropZoneProps) {
  const { isOver, setNodeRef } = useDroppable({
    id: `part-${columnIndex}-${partIndex}`,
    data: { columnIndex, partIndex },
  });

  const isMapped = !!part.mapTo;
  const isPartDateField = isDateField(part.mapTo);

  const handlePartDateFormatChange = (format: string) => {
    onDateFormatChange?.(format);
  };

  return (
    <div
      className={cn(
        "flex flex-col gap-2 rounded-lg border bg-card p-3 transition-all",
      )}
    >
      <div className="flex items-center gap-3">
        <div className="flex-1 justify-start shrink-0 text-sm font-medium truncate">
          {part.name}
        </div>

        {/* Drop zone for each part */}
        <div
          ref={setNodeRef}
          className={cn(
            "w-75 min-h-[40px] rounded-md border-2 border-dashed flex items-center justify-center transition-all",
            isOver
              ? "border-primary bg-primary/5"
              : isMapped
                ? "border-border bg-muted/30"
                : "border-border bg-muted/20",
          )}
        >
          {part.mapTo ? (
            <div className="flex items-center gap-2 px-3 w-full justify-between">
              <code className="text-sm font-mono truncate">{part.mapTo}</code>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 shrink-0"
                onClick={onRemoveMapping}
              >
                <X className="w-3 h-3" />
              </Button>
            </div>
          ) : (
            <span
              className={cn(
                "text-sm",
                isOver ? "text-primary" : "text-muted-foreground",
              )}
            >
              {isOver ? "Drop field!" : "Drop field here"}
            </span>
          )}
        </div>
      </div>

      {/* Date Format Selector for Parts */}
      {isPartDateField && onDateFormatChange && (
        <div className=" w-90">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-muted-foreground">
              Format:
            </span>
            <PartDateFormatSelect
              value={part.dateFormat || ""}
              onValueChange={handlePartDateFormatChange}
            />
          </div>
        </div>
      )}
    </div>
  );
}

// Separate component for part date format selection with search
interface PartDateFormatSelectProps {
  value: string;
  onValueChange: (value: string) => void;
}

function PartDateFormatSelect({
  value,
  onValueChange,
}: PartDateFormatSelectProps) {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger className="w-full h-8 text-xs">
        <SelectValue placeholder="Select date format..." />
      </SelectTrigger>
      <SelectContent
        className="max-h-[400px] w-75"
        position="popper"
        sideOffset={4}
        align="start"
      >
        {/* Search Input */}
        <div className="p-2 pb-1 sticky top-0 bg-popover z-10">
          <Input
            placeholder="Search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-8 text-xs"
            onKeyDown={(e) => e.stopPropagation()}
          />
        </div>
        {/* Filtered Groups */}
        {DROPDOWN_FORMAT_GROUPS.map((group) => {
          const filteredFormats = group.formats.filter((f) =>
            f.label.toLowerCase().includes(searchQuery.toLowerCase()),
          );
          if (filteredFormats.length === 0) return null;
          return (
            <SelectGroup key={group.label}>
              <div className="flex items-center space-x-1">
                <SelectLabel className="text-xs font-semibold uppercase text-foreground py-1.5 whitespace-nowrap">
                  {group.label}
                </SelectLabel>
                <div className="border-b border-foreground/30 flex-1"></div>
              </div>
              {filteredFormats.map((format) => (
                <SelectItem
                  key={format.value}
                  value={format.value}
                  className="text-xs text-muted-foreground"
                >
                  {format.label}
                </SelectItem>
              ))}
            </SelectGroup>
          );
        })}
        {/* No results message */}
        {DROPDOWN_FORMAT_GROUPS.every((group) =>
          group.formats.every(
            (f) => !f.label.toLowerCase().includes(searchQuery.toLowerCase()),
          ),
        ) && (
          <div className="px-2 py-3 text-xs text-muted-foreground text-center">
            No results found
          </div>
        )}
      </SelectContent>
    </Select>
  );
}
