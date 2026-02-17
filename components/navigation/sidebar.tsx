"use client";

import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { Clock, PanelLeft, PanelLeftClose, Plus } from "lucide-react";
import { useState } from "react";
import { MobileHeader } from "./mobile-header";
import { useSidebar } from "./sidebar-context";
import { SidebarItem } from "./sidebar-item";

const navigation = [
  {
    href: "/load-data",
    icon: Plus,
    label: "Load Data",
  },
  {
    href: "/uploads",
    icon: Clock,
    label: "Upload History",
  },
];

export function Sidebar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { isCollapsed, toggleCollapsed } = useSidebar();

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

  return (
    <>
      <MobileHeader isOpen={isMobileMenuOpen} onToggle={toggleMobileMenu} />

      {/* Mobile Overlay */}
      <div
        className={cn(
          "fixed inset-0 z-40 bg-black/50 md:hidden transition-opacity duration-300 ease-in-out",
          isMobileMenuOpen ? "opacity-100" : "opacity-0 pointer-events-none",
        )}
        onClick={() => setIsMobileMenuOpen(false)}
        aria-hidden={!isMobileMenuOpen}
      />

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 z-50 h-full border-r bg-sidebar",
          "transition-[transform,width] duration-300 ease-in-out will-change-transform",
          "md:translate-x-0",
          !isMobileMenuOpen && "-translate-x-full md:translate-x-0",
          isCollapsed ? "w-16 md:w-16" : "w-[240px]",
        )}
      >
        <div className="flex h-full flex-col">
          {/* Logo/Brand */}
          <div
            className={cn(
              "flex h-14 items-center border-b px-4",
              isCollapsed ? "justify-center" : "justify-between",
            )}
          >
            <span
              className={cn("font-semibold truncate", isCollapsed && "hidden")}
            >
              Purchase Data Tool
            </span>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={toggleCollapsed}
                  className="shrink-0 hidden md:inline-flex"
                  aria-label={
                    isCollapsed ? "Expand sidebar" : "Collapse sidebar"
                  }
                >
                  {isCollapsed ? (
                    <PanelLeft className="size-5" />
                  ) : (
                    <PanelLeftClose className="size-5" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">
                {isCollapsed ? "Expand" : "Collapse"}
              </TooltipContent>
            </Tooltip>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 p-3">
            {navigation.map((item) => (
              <SidebarItem
                key={item.href}
                href={item.href}
                icon={item.icon}
                label={item.label}
                collapsed={isCollapsed}
                onMobileNavClick={() => setIsMobileMenuOpen(false)}
              />
            ))}
          </nav>
        </div>
      </aside>
    </>
  );
}
