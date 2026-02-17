"use client";

import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface StepperProps {
  currentStep: number;
  steps: string[];
  className?: string;
}

export function Stepper({ currentStep, steps, className }: StepperProps) {
  return (
    <div className={cn("w-full", className)}>
      <div className="flex items-center justify-center">
        {steps.map((step, index) => {
          const stepNumber = index + 1;
          const isActive = stepNumber === currentStep;
          const isCompleted = stepNumber < currentStep;
          const isLast = index === steps.length - 1;

          return (
            <div key={step} className="flex items-center">
              {/* Step Circle + Label */}
              <div className="flex flex-col items-center">
                <div
                  className={cn(
                    "flex h-10 w-10 items-center justify-center rounded-full border text-sm font-semibold transition-colors",
                    isActive && "border-zinc-900 bg-zinc-900 text-primary-foreground",
                    isCompleted && "border-green-600/60 bg-green-600/10 text-green-600",
                    !isActive && !isCompleted && "border-border bg-muted text-muted-foreground"
                  )}
                >
                  {isCompleted ? <Check className="w-5 h-5 text-green-500" /> : stepNumber}
                </div>
                <span
                  className={cn(
                    "mt-2 text-sm font-medium whitespace-nowrap",
                    isActive && "text-zinc-900",
                    isCompleted && "text-foreground",
                    !isActive && !isCompleted && "text-muted-foreground"
                  )}
                >
                  {step}
                </span>
              </div>

              {/* Connector Line */}
              {!isLast && (
                <div
                  className={cn(
                    "w-24 md:w-32 lg:w-48 h-0.5 mx-4 transition-colors",
                    stepNumber < currentStep ? "bg-primary/40" : "bg-border"
                  )}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
