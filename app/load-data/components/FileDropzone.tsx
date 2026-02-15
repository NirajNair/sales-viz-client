"use client";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { cn } from "@/lib/utils";
import { AlertCircle, FileSpreadsheet, Loader2, Upload } from "lucide-react";
import { useCallback, useState } from "react";
import { useDropzone, type FileRejection } from "react-dropzone";

interface FileDropzoneProps {
  onFileSelect: (file: File) => void;
  isUploading: boolean;
  error: string | null;
}

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ACCEPTED_TYPES = {
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [
    ".xlsx",
  ],
  "application/vnd.ms-excel": [".xls"],
  "text/csv": [".csv"],
};

export function FileDropzone({
  onFileSelect,
  isUploading,
  error,
}: FileDropzoneProps) {
  const [fileError, setFileError] = useState<string | null>(null);

  const onDrop = useCallback(
    (acceptedFiles: File[], rejectedFiles: FileRejection[]) => {
      setFileError(null);

      if (rejectedFiles.length > 0) {
        const rejection = rejectedFiles[0];
        if (rejection.errors[0]?.code === "file-too-large") {
          setFileError("File size exceeds 10MB limit");
        } else if (rejection.errors[0]?.code === "file-invalid-type") {
          setFileError("Please upload only Excel files (.xlsx, .xls, .csv)");
        } else {
          setFileError("Invalid file. Please try again.");
        }
        return;
      }

      if (acceptedFiles.length > 0) {
        const file = acceptedFiles[0];
        if (file.size > MAX_FILE_SIZE) {
          setFileError("File size exceeds 10MB limit");
          return;
        }
        onFileSelect(file);
      }
    },
    [onFileSelect],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: ACCEPTED_TYPES,
    maxFiles: 1,
    maxSize: MAX_FILE_SIZE,
    disabled: isUploading,
  });

  const displayError = error || fileError;

  return (
    <div className="mx-auto w-full max-w-3xl">
      <div
        {...getRootProps()}
        className={cn(
          "relative cursor-pointer rounded-xl border border-dashed border-border bg-card px-6 py-14 transition-colors duration-200 sm:px-8",
          "hover:border-primary/50 hover:bg-muted/50",
          isDragActive && "border-primary bg-primary/5",
          isUploading && "opacity-50 cursor-not-allowed",
        )}
      >
        <input {...getInputProps()} />

        <div className="flex flex-col items-center space-y-5 text-center">
          {isUploading ? (
            <>
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
              <div>
                <p className="text-base font-medium text-foreground sm:text-lg">
                  Uploading file...
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  Please wait while we process your file
                </p>
              </div>
            </>
          ) : (
            <>
              <div
                className={cn(
                  "flex h-12 w-12 items-center justify-center rounded-full border",
                  isDragActive
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted",
                )}
              >
                {isDragActive ? (
                  <Upload className="h-6 w-6" />
                ) : (
                  <FileSpreadsheet className="h-6 w-6 text-muted-foreground" />
                )}
              </div>

              <div>
                <p className="text-base font-medium text-foreground sm:text-lg">
                  Drop the Excel file here
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  or click to browse files
                </p>
              </div>

              <div className="inline-flex items-center gap-2 rounded-full border bg-muted/60 px-3 py-1.5 text-xs text-muted-foreground">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>Upload Excel files up to 10MB only</span>
              </div>
            </>
          )}
        </div>
      </div>

      {displayError && (
        <Alert
          variant="destructive"
          className="w-full bg-red-300/10 border-red-500/30 mt-5"
        >
          <AlertCircle className="h-4 w-4" />
          <AlertTitle className="text-sm">Upload Error</AlertTitle>
          <AlertDescription className="text-xs mt-1">
            <p className="text-xs">{displayError}</p>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
