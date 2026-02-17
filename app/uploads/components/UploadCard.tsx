"use client";

import { Upload } from "@/app/uploads/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { formatDateToIST } from "@/lib/date-utils";
import { formatFileSize } from "@/lib/utils";
import { FileSpreadsheet, Loader2, Undo2 } from "lucide-react";
import { useState } from "react";

interface UploadCardProps {
  upload: Upload;
  onRevert: (uploadId: string) => void;
  isReverting: boolean;
}

export function UploadCard({ upload, onRevert, isReverting }: UploadCardProps) {
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  const handleRevertClick = () => {
    setShowConfirmDialog(true);
  };

  const handleConfirmRevert = () => {
    onRevert(upload.uploadId);
    setShowConfirmDialog(false);
  };

  const handleCancelRevert = () => {
    setShowConfirmDialog(false);
  };

  return (
    <>
      <div className="flex items-center justify-between p-4 border rounded-lg bg-card hover:bg-accent/50 transition-colors">
        <div className="flex col-8 items-start gap-3">
          <div className="mt-1">
            <FileSpreadsheet className="h-8 w-8 text-muted-foreground" />
          </div>
          <div className="space-y-1">
            <h3 className="font-medium text-sm">{upload.fileName}</h3>
            <p className="text-xs text-muted-foreground">
              {formatFileSize(upload.fileSize)}
            </p>
          </div>
        </div>

        <div className="flex flex-col-reverse col-4 items-end gap-2">
          <span className="text-xs text-muted-foreground">
            {formatDateToIST(upload.createdAt)}
          </span>

          {upload.reverted ? (
            <Badge
              variant="secondary"
              className="text-muted-foreground text-xs py-1 w-22"
            >
              Reverted
            </Badge>
          ) : (
            <Button
              variant="outline"
              className="w-22"
              size="sm"
              onClick={handleRevertClick}
              disabled={isReverting}
            >
              {isReverting ? (
                <Loader2 className="h-4 w-4 mr-1 animate-spin" />
              ) : (
                <Undo2 className="h-4 w-4 mr-1" />
              )}
              {isReverting ? "Reverting" : "Revert"}
            </Button>
          )}
        </div>
      </div>

      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              Confirm Revert
            </DialogTitle>
            <DialogDescription>
              <div className="flex flex-col gap-1 py-2">
                <span>
                  Are you sure you want to revert the upload of this file?
                </span>
                <span className="font-semibold">"{upload.fileName}"</span>
                <span className="mt-2">*This action cannot be undone.</span>
              </div>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={handleCancelRevert}>
              Cancel
            </Button>
            <Button variant="default" onClick={handleConfirmRevert}>
              Yes, Revert
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
