"use client";

import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useState,
} from "react";
import { ColumnMapping } from "../types/get-mappings";

interface UploadContextType {
  uploadedFile: File | null;
  setUploadedFile: (file: File | null) => void;
  mappings: ColumnMapping[];
  setMappings: (mappings: ColumnMapping[]) => void;
  currentStep: number;
  setCurrentStep: (step: number) => void;
  reset: () => void;
}

const UploadContext = createContext<UploadContextType | undefined>(undefined);

export function UploadProvider({ children }: { children: ReactNode }) {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [mappings, setMappings] = useState<ColumnMapping[]>([]);
  const [currentStep, setCurrentStep] = useState(1);

  const reset = useCallback(() => {
    setUploadedFile(null);
    setMappings([]);
    setCurrentStep(1);
  }, []);

  return (
    <UploadContext.Provider
      value={{
        uploadedFile,
        setUploadedFile,
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
