"use client";

import { Button } from "@/components/ui/button";
import { useSidebar } from "@/components/ui/sidebar";
import { Menu } from "lucide-react";

export function MobileHeader() {
  const { toggleSidebar } = useSidebar();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex h-14 items-center justify-between bg-zinc-900 px-4 md:hidden">
      <span className="text-lg font-semibold text-zinc-50">Purchase Viz</span>
      <Button
        variant="ghost"
        size="icon"
        className="size-9 text-zinc-50 hover:bg-zinc-800 hover:text-zinc-50"
        onClick={toggleSidebar}
        aria-label="Open menu"
      >
        <Menu className="size-5" />
      </Button>
    </header>
  );
}
