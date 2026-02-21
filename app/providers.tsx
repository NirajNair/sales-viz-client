"use client";

import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import {
  MutationCache,
  QueryCache,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { ReactNode, useState } from "react";
import { toast } from "sonner";

interface QueryMeta {
  skipToast?: boolean;
  errorMessage?: string;
  onError?: (error: Error) => void;
}

// Helper function to check if error is a network/server unavailable error
function isNetworkError(error: unknown): boolean {
  if (error instanceof TypeError) return true;
  if (error instanceof Error) {
    return (
      error.message === "Failed to fetch" ||
      error.message.includes("NetworkError") ||
      error.message.includes("Network request failed") ||
      error.message.includes("ERR_CONNECTION_REFUSED") ||
      error.message.includes("ERR_NAME_NOT_RESOLVED")
    );
  }
  return false;
}

// Helper function to get user-friendly error message
function getErrorMessage(
  error: unknown,
  customMessage?: string
): string {
  if (customMessage) return customMessage;
  if (isNetworkError(error)) {
    return "Server is unavailable. Please check your connection.";
  }
  if (error instanceof Error) {
    return error.message;
  }
  return "An error occurred";
}

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => {
    return new QueryClient({
      queryCache: new QueryCache({
        onError: (error, query) => {
          const meta = query.meta as QueryMeta | undefined;

          // Skip if explicitly disabled
          if (meta?.skipToast) return;

          const message = getErrorMessage(error, meta?.errorMessage);
          toast.error(message);

          // Call custom handler if provided
          if (meta?.onError && error instanceof Error) {
            meta.onError(error);
          }
        },
      }),
      mutationCache: new MutationCache({
        onError: (error, variables, context, mutation) => {
          const meta = mutation.meta as QueryMeta | undefined;

          // Skip if explicitly disabled
          if (meta?.skipToast) return;

          const message = getErrorMessage(error, meta?.errorMessage);
          toast.error(message);

          // Call custom handler if provided
          if (meta?.onError && error instanceof Error) {
            meta.onError(error);
          }
        },
      }),
      defaultOptions: {
        queries: {
          staleTime: 60 * 1000,
          retry: 0,
        },
        mutations: {
          retry: 0,
        },
      },
    });
  });

  return (
    <NuqsAdapter>
      <TooltipProvider>
        <QueryClientProvider client={queryClient}>
          {children}
          <Toaster position="top-right" />
        </QueryClientProvider>
      </TooltipProvider>
    </NuqsAdapter>
  );
}
