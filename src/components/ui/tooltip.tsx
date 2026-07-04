"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

function TooltipProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

function Tooltip({ children }: { children: React.ReactNode }) {
  return <div className="relative inline-flex">{children}</div>;
}

function TooltipTrigger({
  children,
  asChild,
}: {
  children: React.ReactNode;
  asChild?: boolean;
}) {
  if (asChild) return <>{children}</>;
  return <>{children}</>;
}

function TooltipContent({
  children,
  className,
  side = "top",
}: {
  children: React.ReactNode;
  className?: string;
  side?: "top" | "bottom" | "left" | "right";
}) {
  const sideClass = {
    top: "bottom-full left-1/2 -translate-x-1/2 mb-1",
    bottom: "top-full left-1/2 -translate-x-1/2 mt-1",
    left: "right-full top-1/2 -translate-y-1/2 mr-1",
    right: "left-full top-1/2 -translate-y-1/2 ml-1",
  }[side];

  return (
    <div
      className={cn(
        "absolute z-50 hidden whitespace-nowrap rounded-md bg-popover px-3 py-1.5 text-xs text-popover-foreground shadow-md group-hover:block",
        sideClass,
        className
      )}
    >
      {children}
    </div>
  );
}

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider };
