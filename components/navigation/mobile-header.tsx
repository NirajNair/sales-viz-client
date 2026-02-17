"use client";

import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";

interface MobileHeaderProps {
  isOpen: boolean;
  onToggle: () => void;
}

export function MobileHeader({ isOpen, onToggle }: MobileHeaderProps) {
  return (
    <header className="md:hidden fixed inset-x-0 top-0 z-40 w-full border-b bg-background">
      <div className="flex flex-row-reverse h-14 items-center justify-between px-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggle}
          className="mr-4"
          aria-label={isOpen ? "Close menu" : "Open menu"}
        >
          {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
        <span className="font-semibold">Purchase Data Tool</span>
      </div>
    </header>
  );
}
