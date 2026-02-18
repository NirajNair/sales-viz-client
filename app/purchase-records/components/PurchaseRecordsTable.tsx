"use client";

import * as React from "react";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  ColumnDef,
  SortingState,
  Updater,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  GripVertical,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PurchaseRecord } from "../types";
import { toIstDisplay } from "@/lib/date-utils";
import { cn } from "@/lib/utils";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  horizontalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface PurchaseRecordsTableProps {
  data: PurchaseRecord[];
  sorting: SortingState;
  onSortingChange: (updater: Updater<SortingState>) => void;
  isLoading: boolean;
  page: number;
  pageSize: number;
  totalPages: number;
  total: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
}

const defaultColumns: ColumnDef<PurchaseRecord>[] = [
  {
    accessorKey: "sellerName",
    header: "Seller Name",
    enableSorting: true,
  },
  {
    accessorKey: "sellerGstin",
    header: "Seller GSTIN",
    enableSorting: true,
  },
  {
    accessorKey: "buyerName",
    header: "Buyer Name",
    enableSorting: true,
  },
  {
    accessorKey: "buyerGstin",
    header: "Buyer GSTIN",
    enableSorting: true,
  },
  {
    accessorKey: "assessValue",
    header: "Assess Value",
    cell: ({ row }) => {
      const value = row.getValue("assessValue") as number;
      return `₹${value.toLocaleString("en-IN")}`;
    },
    enableSorting: true,
  },
  {
    accessorKey: "invoiceDate",
    header: "Invoice Date",
    cell: ({ row }) => {
      const date = row.getValue("invoiceDate") as string;
      return toIstDisplay(date);
    },
    enableSorting: true,
  },
  {
    accessorKey: "hsnCode",
    header: "HSN Code",
    enableSorting: true,
  },
  {
    accessorKey: "chemicalName",
    header: "Chemical Name",
    enableSorting: true,
  },
];

// Sortable header cell component
function SortableHeader({
  header,
  sorting,
  onSortingChange,
}: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  header: any;
  sorting: SortingState;
  onSortingChange: (updater: Updater<SortingState>) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: header.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 1,
  };

  const getSortIcon = (columnId: string) => {
    const sort = sorting.find((s) => s.id === columnId);
    if (!sort) return <ArrowUpDown className="ml-2 h-4 w-4" />;
    return sort.desc ? (
      <ArrowDown className="ml-2 h-4 w-4" />
    ) : (
      <ArrowUp className="ml-2 h-4 w-4" />
    );
  };

  return (
    <TableHead
      ref={setNodeRef}
      style={style}
      className={cn(
        "select-none bg-muted/80 border-b-2 border-border font-bold text-sm",
        isDragging && "opacity-50 bg-muted cursor-grabbing",
      )}
    >
      <div className="flex items-center gap-1">
        <div className="flex-1">
          {header.column.getCanSort() ? (
            <Button
              variant="ghost"
              onClick={() => {
                const currentSort = sorting.find(
                  (s) => s.id === header.column.id,
                );
                if (!currentSort) {
                  onSortingChange([{ id: header.column.id, desc: false }]);
                } else if (!currentSort.desc) {
                  onSortingChange([{ id: header.column.id, desc: true }]);
                } else {
                  onSortingChange([]);
                }
              }}
              className="h-8 !px-2 -ml-2 font-bold"
            >
              {flexRender(header.column.columnDef.header, header.getContext())}
              {getSortIcon(header.column.id)}
            </Button>
          ) : (
            flexRender(header.column.columnDef.header, header.getContext())
          )}
        </div>
        <button
          className="cursor-grab hover:bg-muted-foreground/10 rounded p-0.5"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="h-4 w-4 text-muted-foreground" />
        </button>
      </div>
    </TableHead>
  );
}

export function PurchaseRecordsTable({
  data,
  sorting,
  onSortingChange,
  isLoading,
  page,
  pageSize,
  totalPages,
  total,
  onPageChange,
  onPageSizeChange,
}: PurchaseRecordsTableProps) {
  const [columnOrder, setColumnOrder] = React.useState<string[]>(
    defaultColumns.map((col) => (col as { accessorKey: string }).accessorKey),
  );

  const table = useReactTable({
    data,
    columns: defaultColumns,
    state: {
      sorting,
      columnOrder,
    },
    onSortingChange,
    onColumnOrderChange: setColumnOrder,
    getCoreRowModel: getCoreRowModel(),
    manualSorting: true,
    manualPagination: true,
    pageCount: totalPages,
  });

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setColumnOrder((items) => {
        const oldIndex = items.indexOf(active.id as string);
        const newIndex = items.indexOf(over.id as string);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const headers = table.getHeaderGroups()[0]?.headers || [];

  return (
    <div className="space-y-4 min-w-0">
      <div className="rounded-md border overflow-x-auto">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={columnOrder}
            strategy={horizontalListSortingStrategy}
          >
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  {headers.map((header) => (
                    <SortableHeader
                      key={header.id}
                      header={header}
                      sorting={sorting}
                      onSortingChange={onSortingChange}
                    />
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell
                      colSpan={defaultColumns.length}
                      className="h-24 text-center"
                    >
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : data.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={defaultColumns.length}
                      className="h-24 text-center text-muted-foreground"
                    >
                      No purchase records found
                    </TableCell>
                  </TableRow>
                ) : (
                  table.getRowModel().rows.map((row) => (
                    <TableRow key={row.id}>
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id}>
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext(),
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </SortableContext>
        </DndContext>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between flex-col lg:flex-row px-2 gap-2">
        <div className="flex-1 text-sm text-muted-foreground">
          {isLoading ? (
            "Loading..."
          ) : (
            <>
              Showing {(page - 1) * pageSize + 1} to{" "}
              {Math.min(page * pageSize, total)} of {total} records
            </>
          )}
        </div>
        <div className="flex items-center !space-x-4 lg:space-x-8">
          <div className="flex items-center space-x-2 mr-0">
            <p className="text-sm font-medium">Rows per page</p>
            <Select
              value={pageSize.toString()}
              onValueChange={(value) => onPageSizeChange(Number(value))}
            >
              <SelectTrigger className="h-8 w-[75px]">
                <SelectValue placeholder={pageSize} />
              </SelectTrigger>
              <SelectContent side="top">
                {[25, 50, 100].map((size) => (
                  <SelectItem key={size} value={size.toString()}>
                    {size}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex w-[100px] items-center justify-center text-sm font-medium mr-0">
            Page {page} of {totalPages}
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              className="hidden h-8 w-8 p-0 lg:flex"
              onClick={() => onPageChange(1)}
              disabled={page <= 1}
            >
              <span className="sr-only">Go to first page</span>
              <ChevronsLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              className="h-8 w-8 p-0"
              onClick={() => onPageChange(page - 1)}
              disabled={page <= 1}
            >
              <span className="sr-only">Go to previous page</span>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              className="h-8 w-8 p-0"
              onClick={() => onPageChange(page + 1)}
              disabled={page >= totalPages}
            >
              <span className="sr-only">Go to next page</span>
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              className="hidden h-8 w-8 p-0 lg:flex"
              onClick={() => onPageChange(totalPages)}
              disabled={page >= totalPages}
            >
              <span className="sr-only">Go to last page</span>
              <ChevronsRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
