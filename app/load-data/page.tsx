"use client";

import { UploadProvider, useUpload } from "./context/UploadContext";
import { Stepper } from "./components/Stepper";
import { UploadPage } from "./components/UploadPage";
import { MappingPage } from "./components/MappingPage";

const STEPS = ["Upload Data", "Map Columns"];

function LoadDataContent() {
  const { currentStep } = useUpload();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/70 backdrop-blur supports-[backdrop-filter]:bg-card/60">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary">
                <span className="text-primary-foreground font-bold text-sm">
                  L
                </span>
              </div>
              <h1 className="text-lg font-semibold tracking-tight text-foreground">
                Load Data
              </h1>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <Stepper currentStep={currentStep} steps={STEPS} />

        <div className="mt-8">
          {currentStep === 1 && <UploadPage />}
          {currentStep === 2 && <MappingPage />}
        </div>
      </main>
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
