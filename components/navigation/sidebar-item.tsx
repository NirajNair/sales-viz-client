"use client";

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

interface SidebarItemProps {
  href: string;
  icon: LucideIcon;
  label: string;
  collapsed?: boolean;
  onMobileNavClick?: () => void;
}

export function SidebarItem({
  href,
  icon: Icon,
  label,
  collapsed = false,
  onMobileNavClick,
}: SidebarItemProps) {
  const pathname = usePathname();
  const router = useRouter();
  const isActive = pathname === href || pathname.startsWith(`${href}/`);

  const handleClick = (e: React.MouseEvent) => {
    if (!onMobileNavClick) return;
    e.preventDefault();
    onMobileNavClick();
    router.push(href);
  };

  const linkContent = (
    <Link
      href={href}
      onClick={handleClick}
      className={cn(
        "flex items-center gap-3 rounded-lg py-2.5 text-sm font-medium transition-all duration-200",
        collapsed ? "justify-center px-0" : "px-3",
        "hover:bg-accent hover:text-accent-foreground",
        isActive && "bg-primary/10 hover:bg-primary/10 text-primary",
      )}
    >
      <Icon className={cn("h-4 w-4 shrink-0", isActive && "text-primary")} />
      {!collapsed && (
        <span className="whitespace-nowrap overflow-hidden text-ellipsis min-w-0">
          {label}
        </span>
      )}
    </Link>
  );

  if (collapsed) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>{linkContent}</TooltipTrigger>
        <TooltipContent side="right">{label}</TooltipContent>
      </Tooltip>
    );
  }

  return linkContent;
}
