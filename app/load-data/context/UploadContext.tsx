"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";
import { GetMappingsResponse, ColumnMapping } from "../types/get-mappings";

interface UploadContextType {
  uploadedFile: File | null;
  setUploadedFile: (file: File | null) => void;
  uploadResponse: GetMappingsResponse | null;
  setUploadResponse: (response: GetMappingsResponse | null) => void;
  mappings: ColumnMapping[];
  setMappings: (mappings: ColumnMapping[]) => void;
  currentStep: number;
  setCurrentStep: (step: number) => void;
  reset: () => void;
}

const UploadContext = createContext<UploadContextType | undefined>(undefined);

export function UploadProvider({ children }: { children: ReactNode }) {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploadResponse, setUploadResponse] =
    useState<GetMappingsResponse | null>(null);
  const [mappings, setMappings] = useState<ColumnMapping[]>([]);
  const [currentStep, setCurrentStep] = useState(1);

  const reset = () => {
    setUploadedFile(null);
    setUploadResponse(null);
    setMappings([]);
    setCurrentStep(1);
  };

  return (
    <UploadContext.Provider
      value={{
        uploadedFile,
        setUploadedFile,
        uploadResponse,
        setUploadResponse,
        mappings,
        setMappings,
        currentStep,
        setCurrentStep,
        reset,
      }}
    >
      {children}
    </UploadContext.Provider>
  );
}

export function useUpload() {
  const context = useContext(UploadContext);
  if (context === undefined) {
    throw new Error("useUpload must be used within an UploadProvider");
  }
  return context;
}
