"use client";

import { UploadCard } from "@/app/uploads/components/UploadCard";
import { FilterStatus } from "@/app/uploads/types";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getUploads, revertUpload } from "@/lib/api/uploads";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Search } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { UploadFilters } from "../enums/upload-filters.enum";

export default function UploadsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("all");
  const queryClient = useQueryClient();

  const {
    data: uploadsData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["uploads"],
    queryFn: getUploads,
  });

  const revertMutation = useMutation({
    mutationFn: revertUpload,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["uploads"] });
      const count = data.deletedRecordsCount;
      toast.success(
        `Upload reverted successfully. ${count} record${count === 1 ? "" : "s"} deleted.`,
      );
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to revert upload");
    },
  });

  const filteredUploads = uploadsData?.uploads.filter((upload) => {
    const matchesSearch = upload.fileName
      .toLowerCase()
      .includes(searchQuery.toLowerCase());

    const matchesFilter =
      filterStatus === "all"
        ? true
        : filterStatus === "reverted"
          ? upload.reverted
          : !upload.reverted;

    return matchesSearch && matchesFilter;
  });

  const handleRevert = (uploadId: string) => {
    revertMutation.mutate(uploadId);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <h1 className="text-2xl font-bold mb-6">Uploads</h1>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-20 border rounded-lg animate-pulse bg-muted"
            />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-8 px-4">
        <h1 className="text-2xl font-bold mb-6">Uploads</h1>
        <div className="text-red-500">
          Failed to load uploads: {error.message}
        </div>
      </div>
    );
  }

  return (
    <div className="container w-full">
      <div className="flex items-center gap-4 mb-6">
        <h1 className="flex-1 text-2xl font-bold">Upload History</h1>
        <div className="relative w-[30%]">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search uploads..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        <Select
          value={filterStatus}
          onValueChange={(value) => setFilterStatus(value as FilterStatus)}
        >
          <SelectTrigger className="w-[180px] capitalize">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            {Object.values(UploadFilters).map((value) => (
              <SelectItem className="capitalize" value={value}>
                {value}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-3">
        {filteredUploads && filteredUploads.length > 0 ? (
          filteredUploads.map((upload) => (
            <UploadCard
              key={upload.uploadId}
              upload={upload}
              onRevert={handleRevert}
              isReverting={
                revertMutation.variables === upload.uploadId &&
                revertMutation.isPending
              }
            />
          ))
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            {searchQuery || filterStatus !== "all"
              ? "No uploads match your filters"
              : "No uploads found"}
          </div>
        )}
      </div>
    </div>
  );
}
