"use client";

import { createMappingsFromResponse, getMappings } from "@/lib/api/load-data";
import { useMutation } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useUpload } from "../context/UploadContext";
import { FileDropzone } from "./FileDropzone";

export function UploadPage() {
  const { setUploadedFile, setMappings, setCurrentStep, reset } = useUpload();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    reset();
  }, [reset]);

  const uploadMutation = useMutation({
    mutationFn: getMappings,
    onSuccess: (data, file) => {
      setUploadedFile(file);
      setMappings(createMappingsFromResponse(data));
      setCurrentStep(2);
    },
    onError: (err: Error) => {
      setError(err.message);
    },
  });

  const handleFileSelect = (file: File) => {
    setError(null);
    uploadMutation.mutate(file);
  };

  return (
    <section className="mx-auto max-w-4xl space-y-8">
      <div className="space-y-2 text-center">
        <h2 className="text-3xl font-semibold tracking-tight text-foreground">
          Upload Your Excel File
        </h2>
        <p className="mx-auto max-w-xl text-sm leading-6 text-muted-foreground sm:text-base">
          Upload your purchase data Excel file to begin the mapping process.
          We&apos;ll analyze the columns and suggest mappings automatically.
        </p>
      </div>

      <FileDropzone
        onFileSelect={handleFileSelect}
        isUploading={uploadMutation.isPending}
        error={error}
      />
    </section>
  );
}
