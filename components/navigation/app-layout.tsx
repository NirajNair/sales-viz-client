"use client";

import { cn } from "@/lib/utils";
import { Sidebar } from "./sidebar";
import { useSidebar } from "./sidebar-context";

export function AppLayout({ children }: { children: React.ReactNode }) {
  const { isCollapsed } = useSidebar();

  return (
    <div className="relative flex min-h-screen">
      <Sidebar />
      <main
        className={cn(
          "flex-1 transition-[margin-left] duration-300 ease-in-out",
          isCollapsed ? "md:ml-16" : "md:ml-[240px]",
        )}
      >
        <div className="h-full pt-20 px-6 pb-6 md:pt-8 md:px-8 md:pb-8">
          {children}
        </div>
      </main>
    </div>
  );
}
