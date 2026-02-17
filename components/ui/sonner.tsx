"use client";
import {
  CircleCheckIcon,
  InfoIcon,
  Loader2Icon,
  OctagonXIcon,
  TriangleAlertIcon,
} from "lucide-react";
import { useTheme } from "next-themes";
import { Toaster as Sonner, type ToasterProps } from "sonner";

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      position="top-right"
      icons={{
        success: <CircleCheckIcon className="h-4 w-4" />,
        info: <InfoIcon className="h-4 w-4" />,
        warning: <TriangleAlertIcon className="h-4 w-4" />,
        error: <OctagonXIcon className="h-4 w-4" />,
        loading: <Loader2Icon className="h-4 w-4 animate-spin" />,
      }}
      toastOptions={{
        unstyled: false,
        classNames: {
          toast: "group toast",
          success:
            "!bg-green-50 !border-none !text-green-800 dark:!bg-green-950 dark:!border-green-800 dark:!text-green-400",
          error:
            "!bg-red-50 !border-none !text-red-800 dark:!bg-red-950 dark:!border-red-800 dark:!text-red-400",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
