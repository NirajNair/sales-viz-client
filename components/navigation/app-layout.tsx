"use client";

import { AppSidebar } from "@/components/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { MobileHeader } from "./mobile-header";

export function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <MobileHeader />
        <div className="h-full pt-20 px-6 pb-6 md:pt-8 md:px-8 md:pb-8">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
