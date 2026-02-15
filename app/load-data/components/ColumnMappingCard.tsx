"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useDroppable } from "@dnd-kit/core";
import { ChevronDown, ChevronUp, Merge, Split, X } from "lucide-react";
import { useState } from "react";
import { ColumnMapping, MappingPart } from "../types/get-mappings";

interface ColumnMappingCardProps {
  mapping: ColumnMapping;
  index: number;
  onUpdate: (mapping: ColumnMapping) => void;
  onRemove: () => void;
  onRemovePartMapping: (partIndex: number) => void;
}

export function ColumnMappingCard({
  mapping,
  onUpdate,
  onRemove,
  onRemovePartMapping,
}: ColumnMappingCardProps) {
  const [isExpanded, setIsExpanded] = useState(mapping.shouldSplit);

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
      }));
    }

    onUpdate({
      ...mapping,
      delimiter,
      parts: newParts,
    });
  };

  return (
    <div
      className={cn("rounded-xl border bg-card transition-all border-border")}
    >
      <div className="p-4">
        <div className="flex items-center gap-4">
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
          </div>

          {/* Drop Zone - ONLY this area accepts drops for non-split columns */}
          {!mapping.shouldSplit ? (
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
}

function PartDropZone({
  part,
  partIndex,
  columnIndex,
  onRemoveMapping,
}: PartDropZoneProps) {
  const { isOver, setNodeRef } = useDroppable({
    id: `part-${columnIndex}-${partIndex}`,
    data: { columnIndex, partIndex },
  });

  const isMapped = !!part.mapTo;

  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-lg border bg-card p-3 transition-all",
      )}
    >
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
  );
}
