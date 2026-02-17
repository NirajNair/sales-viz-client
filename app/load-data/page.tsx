"use client";

import { UploadProvider, useUpload } from "./context/UploadContext";
import { Stepper } from "./components/Stepper";
import { UploadPage } from "./components/UploadPage";
import { MappingPage } from "./components/MappingPage";

const STEPS = ["Upload Data", "Map Columns"];

function LoadDataContent() {
  const { currentStep } = useUpload();

  return (
    <div className="h-full">
      <div className="mx-auto max-w-7xl">
        <Stepper currentStep={currentStep} steps={STEPS} />

        <div className="mt-8">
          {currentStep === 1 && <UploadPage />}
          {currentStep === 2 && <MappingPage />}
        </div>
      </div>
    </div>
  );
}

export default function LoadDataPage() {
  return (
    <UploadProvider>
      <LoadDataContent />
    </UploadProvider>
  );
}
