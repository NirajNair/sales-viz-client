"use client";

import { Input } from "@/components/ui/input";
import { FIELD_POOL, MANDATORY_FIELDS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { useDraggable } from "@dnd-kit/core";
import { Database, GripVertical, Search } from "lucide-react";
import { useState } from "react";
interface DraggableFieldProps {
  field: string;
  isUsed: boolean;
  isMandatory: boolean;
}

function DraggableField({ field, isUsed, isMandatory }: DraggableFieldProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: field,
      data: { field },
      disabled: isUsed,
    });

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
        transition: "none",
      }
    : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={cn(
        "flex items-center gap-1 rounded-md border bg-card px-3 py-2 text-sm",
        isDragging && "opacity-0", // Hide original when dragging (overlay shows instead)
        isUsed
          ? "cursor-not-allowed border-border opacity-50"
          : "cursor-grab border-border hover:border-primary/40 hover:bg-muted/50 active:cursor-grabbing",
      )}
      title={field}
    >
      <GripVertical className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
      <span className="font-mono text-xs truncate text-foreground flex-1">
        {field}
      </span>
      {isMandatory && !isUsed && (
        <span className="text-red-500 font-bold text-sm">*</span>
      )}
    </div>
  );
}

function getAllFields(): string[] {
  return FIELD_POOL.flatMap((group) => group.fields);
}

interface FieldPoolProps {
  usedFields: string[];
}

export function FieldPool({ usedFields }: FieldPoolProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const allFields = getAllFields();
  const availableFields = allFields.filter(
    (field) => !usedFields.includes(field),
  );

  const filteredGroups = FIELD_POOL.map((group) => ({
    ...group,
    fields: group.fields.filter(
      (field) =>
        !usedFields.includes(field) &&
        field.toLowerCase().includes(searchQuery.toLowerCase()),
    ),
  })).filter((group) => group.fields.length > 0);

  return (
    <aside className="flex h-[96vh] w-80 flex-col overflow-hidden rounded-xl border border-border bg-card">
      <div className="border-b bg-card px-4 py-4">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-muted-foreground" />
            <h3 className="text-sm font-semibold uppercase tracking-wider text-foreground">
              Field Pool
            </h3>
          </div>
          <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
            {availableFields.length} fields
          </span>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search fields..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 text-sm"
          />
        </div>
      </div>

      <div className="flex-1 space-y-5 overflow-y-auto p-4">
        {filteredGroups.length === 0 ? (
          <div className="text-center text-muted-foreground py-8">
            <p className="text-sm">All fields mapped!</p>
          </div>
        ) : (
          filteredGroups.map((group) => (
            <div key={group.name}>
              <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {group.name}
              </h4>
              <div className="space-y-2">
                {group.fields.map((field) => (
                  <DraggableField
                    key={field}
                    field={field}
                    isUsed={usedFields.includes(field)}
                    isMandatory={MANDATORY_FIELDS.includes(field as any)}
                  />
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      <div className="border-t bg-card px-4 py-4">
        <p className="text-xs text-muted-foreground">
          Drag fields to map them to Excel columns. Used fields are grayed out.
          <span className="block mt-1">
            <span className="text-red-500 font-bold">*</span> indicates
            mandatory fields
          </span>
        </p>
      </div>
    </aside>
  );
}
