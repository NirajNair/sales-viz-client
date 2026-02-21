"use client";

import { DbFields } from "@/app/enums/db-fields.enum";
import { loadData } from "@/app/load-data/api";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { DATE_FIELDS, MANDATORY_FIELDS } from "@/lib/constants";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { useMutation } from "@tanstack/react-query";
import {
  AlertCircle,
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  FileSpreadsheet,
  GripVertical,
  Loader2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { useUpload } from "../context/UploadContext";
import { ColumnMapping, LoadDataResponse } from "../types/load-data";
import { ColumnMappingCard } from "./ColumnMappingCard";
import { FieldPool } from "./FieldPool";

// Get all mapped fields from current mappings
function getAllMappedFields(mappings: ColumnMapping[]): Set<string> {
  const mappedFields = new Set<string>();

  mappings.forEach((m) => {
    if (m.mappedTo) {
      mappedFields.add(m.mappedTo);
    }
    m.parts.forEach((part) => {
      if (part.mapTo) {
        mappedFields.add(part.mapTo);
      }
    });
  });

  return mappedFields;
}

// Get duplicate fields (mapped more than once)
function getDuplicateFields(mappings: ColumnMapping[]): string[] {
  const fieldCount = new Map<string, number>();

  mappings.forEach((m) => {
    if (m.mappedTo) {
      fieldCount.set(m.mappedTo, (fieldCount.get(m.mappedTo) || 0) + 1);
    }
    m.parts.forEach((part) => {
      if (part.mapTo) {
        fieldCount.set(part.mapTo, (fieldCount.get(part.mapTo) || 0) + 1);
      }
    });
  });

  return Array.from(fieldCount.entries())
    .filter(([_, count]) => count > 1)
    .map(([field]) => field);
}

// Get missing mandatory fields
function getMissingMandatoryFields(mappings: ColumnMapping[]): string[] {
  const mappedFields = getAllMappedFields(mappings);
  return MANDATORY_FIELDS.filter((field) => !mappedFields.has(field));
}

// Get mapped date fields that are missing format selection
function getMissingDateFormats(
  mappings: ColumnMapping[],
): Array<{ field: string; column: string; partIndex?: number }> {
  const missingFormats: Array<{
    field: string;
    column: string;
    partIndex?: number;
  }> = [];

  mappings.forEach((m) => {
    // Check main column mapping
    if (m.mappedTo && DATE_FIELDS.includes(m.mappedTo) && !m.dateFormat) {
      missingFormats.push({
        field: m.mappedTo,
        column: m.excelHeader,
      });
    }

    // Check split parts
    m.parts.forEach((part, idx) => {
      if (part.mapTo && DATE_FIELDS.includes(part.mapTo) && !part.dateFormat) {
        missingFormats.push({
          field: part.mapTo,
          column: m.excelHeader,
          partIndex: idx,
        });
      }
    });
  });

  return missingFormats;
}

export function MappingPage() {
  const router = useRouter();
  const { uploadedFile, mappings, setMappings, setCurrentStep } = useUpload();
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [activeDragField, setActiveDragField] = useState<string | null>(null);
  const [validationAttempted, setValidationAttempted] = useState(false);

  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 250,
        tolerance: 5,
      },
    }),
  );

  const loadMutation = useMutation({
    mutationFn: () => loadData(uploadedFile!, mappings),
    onSuccess: (data: LoadDataResponse) => {
      toast.success(`Successfully loaded ${data.recordsStoredCount} records!`);
      setShowConfirmDialog(false);
      router.push("/purchase-records");
    },
  });

  // Validation calculations
  const missingMandatoryFields = useMemo(
    () => getMissingMandatoryFields(mappings),
    [mappings],
  );

  const duplicateFields = useMemo(
    () => getDuplicateFields(mappings),
    [mappings],
  );

  const missingDateFormats = useMemo(
    () => getMissingDateFormats(mappings),
    [mappings],
  );

  const hasValidationErrors =
    missingMandatoryFields.length > 0 ||
    duplicateFields.length > 0 ||
    missingDateFormats.length > 0;

  const mandatoryFieldsMapped =
    MANDATORY_FIELDS.length - missingMandatoryFields.length;
  const allMandatoryFieldsMapped = missingMandatoryFields.length === 0;

  // Get unmapped non-mandatory fields for warning
  const unmappedNonMandatoryFields = useMemo(() => {
    const mappedFields = getAllMappedFields(mappings);
    const allFields = new Set([
      ...MANDATORY_FIELDS,
      DbFields.PURCHASE_INVOICE_NO,
      DbFields.PURCHASE_STATE,
      DbFields.PURCHASE_EWB_NO,
      DbFields.PURCHASE_EWB_DATE,
      DbFields.PURCHASE_TAX_VAL,
      DbFields.SELLER_PLACE,
      DbFields.SELLER_PIN,
      DbFields.BUYER_PLACE,
      DbFields.BUYER_PIN,
      DbFields.HSN_CHEMICAL_NAME,
    ]);

    return Array.from(allFields).filter(
      (field) =>
        !mappedFields.has(field) && !MANDATORY_FIELDS.includes(field as any),
    );
  }, [mappings]);

  const handleDragStart = useCallback((event: DragStartEvent) => {
    const field = event.active.data.current?.field as string;
    if (field) {
      setActiveDragField(field);
    }
  }, []);

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      setActiveDragField(null);
      const { active, over } = event;

      if (!over) return;

      const field = active.data.current?.field as string;
      const dropZoneId = over.id as string;

      if (!field || !dropZoneId) return;

      // Handle drop on main column drop zone (only for non-split columns)
      if (dropZoneId.startsWith("column-dropzone-")) {
        const columnIndex = parseInt(
          dropZoneId.replace("column-dropzone-", ""),
        );

        const newMappings = [...mappings];
        const mappingIndex = newMappings.findIndex(
          (m) => m.excelColumnIndex === columnIndex,
        );

        if (mappingIndex !== -1) {
          const currentMapping = newMappings[mappingIndex];
          // Only allow drop if not in split mode
          if (!currentMapping.shouldSplit) {
            newMappings[mappingIndex] = {
              ...currentMapping,
              mappedTo: field,
              shouldSplit: false,
              parts: [],
            };
            setMappings(newMappings);
          }
        }
      }

      // Handle drop on a part in split configuration
      if (dropZoneId.startsWith("part-")) {
        const parts = dropZoneId.split("-");
        const columnIndex = parseInt(parts[1]);
        const partIndex = parseInt(parts[2]);

        const newMappings = [...mappings];
        const mappingIndex = newMappings.findIndex(
          (m) => m.excelColumnIndex === columnIndex,
        );

        if (mappingIndex !== -1) {
          const newParts = [...newMappings[mappingIndex].parts];
          if (newParts[partIndex]) {
            newParts[partIndex] = {
              ...newParts[partIndex],
              mapTo: field,
            };
            newMappings[mappingIndex] = {
              ...newMappings[mappingIndex],
              parts: newParts,
            };
            setMappings(newMappings);
          }
        }
      }
    },
    [mappings, setMappings],
  );

  const handleUpdateMapping = (updatedMapping: ColumnMapping) => {
    const newMappings = mappings.map((m) =>
      m.excelColumnIndex === updatedMapping.excelColumnIndex
        ? updatedMapping
        : m,
    );
    setMappings(newMappings);
  };

  const handleRemoveMapping = (columnIndex: number) => {
    const newMappings = mappings.map((m) =>
      m.excelColumnIndex === columnIndex
        ? {
            ...m,
            mappedTo: null,
            shouldSplit: false,
            parts: [],
          }
        : m,
    );
    setMappings(newMappings);
  };

  const handleRemovePartMapping = (columnIndex: number, partIndex: number) => {
    const newMappings = mappings.map((m) => {
      if (m.excelColumnIndex === columnIndex) {
        const newParts = [...m.parts];
        newParts[partIndex] = { ...newParts[partIndex], mapTo: "" };
        return { ...m, parts: newParts };
      }
      return m;
    });
    setMappings(newMappings);
  };

  const getUsedFields = (): string[] => {
    const used: string[] = [];
    mappings.forEach((m) => {
      if (m.mappedTo) {
        used.push(m.mappedTo);
      }
      m.parts.forEach((part) => {
        if (part.mapTo) {
          used.push(part.mapTo);
        }
      });
    });
    return used;
  };

  const getMappedCount = () => {
    return mappings.filter(
      (m) => m.mappedTo || (m.shouldSplit && m.parts.some((p) => p.mapTo)),
    ).length;
  };

  const mappedCount = getMappedCount();
  const totalCount = mappings.length;
  const progressPercentage = (mappedCount / totalCount) * 100;

  const usedFields = getUsedFields();

  // Reset validation attempt when all validation errors are resolved
  useEffect(() => {
    if (!hasValidationErrors && validationAttempted) {
      setValidationAttempted(false);
    }
  }, [hasValidationErrors, validationAttempted]);

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-4">
        {/* Main Content - Scrollable */}
        <div className="flex flex-1 flex-col overflow-hidden rounded-xl border bg-card">
          {/* Header */}
          <div className="border-b border-border/50 bg-gradient-to-b from-muted/20 to-card px-6 py-5">
            <div className="flex flex-col items-start justify-between gap-4">
              <div>
                {uploadedFile && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex items-center gap-2 mb-2 text-sm text-muted-foreground">
                        <FileSpreadsheet className="h-4 w-4 shrink-0" />
                        <span className="truncate max-w-[600px] overflow-hidden whitespace-nowrap">
                          {uploadedFile.name}
                        </span>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{uploadedFile.name}</p>
                    </TooltipContent>
                  </Tooltip>
                )}
              </div>
              <div className="flex w-full justify-between items-center gap-4">
                <div className="flex flex-col">
                  <h2 className="text-xl font-semibold tracking-tight text-page-title">
                    Imported Columns
                  </h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Map your Excel headers to database fields
                  </p>
                </div>
                <div className="flex items-center gap-4 rounded-lg border border-border/50 bg-primary/5 px-4 py-2">
                  <div className="text-right">
                    <p className="text-sm font-medium text-foreground">
                      {mappedCount} of {totalCount} columns mapped
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-4">
              <Progress
                value={progressPercentage}
                className="h-2 bg-gray-200 [&>div]:bg-green-600/80"
              />
            </div>
          </div>

          {/* Columns List */}
          <ScrollArea className="flex-1">
            <div className="mx-auto max-w-4xl space-y-4 p-6">
              {mappings.map((mapping, index) => (
                <ColumnMappingCard
                  key={mapping.excelColumnIndex}
                  mapping={mapping}
                  index={index}
                  onUpdate={handleUpdateMapping}
                  onRemove={() => handleRemoveMapping(mapping.excelColumnIndex)}
                  onRemovePartMapping={(partIndex: number) =>
                    handleRemovePartMapping(mapping.excelColumnIndex, partIndex)
                  }
                  showValidationErrors={validationAttempted}
                />
              ))}
            </div>
          </ScrollArea>

          {/* Footer */}
          <div className="border-t border-border/50 bg-gradient-to-t from-muted/20 to-card px-6 py-4 space-y-3">
            {/* Error alert for missing mandatory fields - full width */}
            {validationAttempted && !allMandatoryFieldsMapped && (
              <Alert variant="destructive" className="w-full">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle className="text-sm">
                  Missing Mandatory Fields
                </AlertTitle>
                <AlertDescription className="text-xs mt-1">
                  <p className="text-xs">
                    The following required fields are not mapped:{" "}
                    <span className="font-mono text-xs">
                      {missingMandatoryFields.join(", ")}
                    </span>
                  </p>
                </AlertDescription>
              </Alert>
            )}

            {/* Error alert for duplicate fields - full width */}
            {validationAttempted && duplicateFields.length > 0 && (
              <Alert
                variant="destructive"
                className="w-full bg-red-300/10 border-red-500/30"
              >
                <AlertCircle className="h-4 w-4" />
                <AlertTitle className="text-sm">
                  Duplicate Field Mappings
                </AlertTitle>
                <AlertDescription className="text-xs mt-1">
                  <p className="text-xs">
                    The following fields are mapped multiple times:{" "}
                    <span className="font-mono text-xs">
                      {duplicateFields.join(", ")}
                    </span>
                  </p>
                </AlertDescription>
              </Alert>
            )}

            {/* Error alert for missing date formats - full width */}
            {validationAttempted && missingDateFormats.length > 0 && (
              <Alert
                variant="destructive"
                className="w-full bg-red-300/10 border-red-500/30"
              >
                <AlertCircle className="h-4 w-4" />
                <AlertTitle className="text-sm">
                  Missing Date Formats
                </AlertTitle>
                <AlertDescription className="text-xs mt-1">
                  <p className="text-xs">
                    Date format selection is required for the following
                    mappings:{" "}
                  </p>
                  <ul className="mt-1 space-y-0.5">
                    {missingDateFormats.map((item, idx) => (
                      <li key={idx} className="font-mono text-xs">
                        {item.field} in column "{item.column}"
                        {item.partIndex !== undefined
                          ? ` (part ${item.partIndex + 1})`
                          : ""}
                      </li>
                    ))}
                  </ul>
                </AlertDescription>
              </Alert>
            )}

            <div className="flex items-center justify-between">
              <Button variant="outline" onClick={() => setCurrentStep(1)}>
                <ArrowLeft className="w-4 h-4" />
                Back to Upload
              </Button>
              <div className="flex items-center gap-3">
                {allMandatoryFieldsMapped && mappedCount < totalCount && (
                  <div className="flex items-center gap-2 rounded-md border border-amber-200/50 bg-amber-50/50 px-3 py-1.5 text-sm text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-400">
                    <AlertCircle className="w-4 h-4" />
                    <span>
                      {totalCount - mappedCount} optional columns not mapped
                    </span>
                  </div>
                )}

                {allMandatoryFieldsMapped && mappedCount === totalCount && (
                  <div className="flex items-center gap-2 rounded-md border border-green-200/50 bg-green-50/50 px-3 py-1.5 text-sm text-green-700 dark:border-green-500/30 dark:bg-green-500/10 dark:text-green-400">
                    <CheckCircle className="w-4 h-4" />
                    <span>All columns mapped!</span>
                  </div>
                )}

                <Button
                  onClick={() => {
                    if (hasValidationErrors) {
                      setValidationAttempted(true);
                    } else {
                      setShowConfirmDialog(true);
                    }
                  }}
                  disabled={validationAttempted && hasValidationErrors}
                  className="gap-2"
                >
                  Finish Mapping
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Field Pool Sidebar - Fixed */}
        <div className="sticky top-0 h-[calc(100vh-220px)] w-80 shrink-0">
          <FieldPool usedFields={usedFields} />
        </div>
      </div>

      {/* DragOverlay - Renders dragged item above everything */}
      <DragOverlay dropAnimation={null}>
        {activeDragField ? (
          <div className="flex items-center gap-2 rounded-md border border-primary/50 bg-card px-3 py-2 text-sm shadow-xl cursor-grabbing w-[280px]">
            <GripVertical className="w-3.5 h-3.5 text-primary shrink-0" />
            <span className="font-mono text-xs truncate text-foreground">
              {activeDragField}
            </span>
          </div>
        ) : null}
      </DragOverlay>

      {/* Confirmation Dialog */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-primary" />
              Confirm Mapping
            </DialogTitle>
            <DialogDescription className="space-y-1 pt-2">
              <span className="block text-xs">
                Are you sure you want to proceed with the current column
                mappings?
              </span>
              <span className="block text-xs">
                Proceeding will load the data into the database.
              </span>
            </DialogDescription>
          </DialogHeader>

          <div className="pt-2 py-4 space-y-3">
            <div className="space-y-2 rounded-lg border bg-muted/40 p-4">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">File:</span>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="font-medium truncate max-w-[200px] overflow-hidden whitespace-nowrap">
                      {uploadedFile?.name}
                    </span>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{uploadedFile?.name}</p>
                  </TooltipContent>
                </Tooltip>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Columns mapped:</span>
                <span className="font-medium">
                  {mappedCount} of {totalCount}
                </span>
              </div>
            </div>

            {/* Warning for unmapped non-mandatory fields */}
            {unmappedNonMandatoryFields.length > 0 && (
              <div className="rounded-lg border border-amber-200 bg-amber-50/50 p-4">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-amber-800">
                      Warning: Optional fields not mapped
                    </p>
                    <p className="text-xs text-amber-700 mt-1">
                      The following fields will not be imported:
                    </p>
                    <p className="text-xs font-mono text-amber-700 mt-1">
                      {unmappedNonMandatoryFields.join(", ")}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowConfirmDialog(false)}
              disabled={loadMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              onClick={() => loadMutation.mutate()}
              disabled={loadMutation.isPending}
              className="gap-2"
            >
              {loadMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  Confirm and Proceed
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DndContext>
  );
}
