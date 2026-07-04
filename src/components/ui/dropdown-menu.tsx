"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface DropdownMenuContextValue {
  open: boolean;
  setOpen: (open: boolean) => void;
}

const DropdownMenuContext = React.createContext<DropdownMenuContextValue>({
  open: false,
  setOpen: () => {},
});

function DropdownMenu({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  return (
    <DropdownMenuContext.Provider value={{ open, setOpen }}>
      <div ref={ref} className="relative inline-block">
        {children}
      </div>
    </DropdownMenuContext.Provider>
  );
}

function DropdownMenuTrigger({ children, asChild }: { children: React.ReactNode; asChild?: boolean }) {
  const { open, setOpen } = React.useContext(DropdownMenuContext);
  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children as React.ReactElement<React.HTMLAttributes<HTMLElement>>, {
      onClick: (e: React.MouseEvent) => {
        e.stopPropagation();
        setOpen(!open);
      },
    });
  }
  return (
    <button onClick={() => setOpen(!open)} type="button">
      {children}
    </button>
  );
}

function DropdownMenuContent({
  children,
  className,
  align = "start",
  sideOffset = 4,
}: {
  children: React.ReactNode;
  className?: string;
  align?: "start" | "end" | "center";
  sideOffset?: number;
}) {
  const { open } = React.useContext(DropdownMenuContext);
  if (!open) return null;

  const alignClass = align === "end" ? "right-0" : align === "center" ? "left-1/2 -translate-x-1/2" : "left-0";

  return (
    <div
      style={{ top: `calc(100% + ${sideOffset}px)` }}
      className={cn(
        "absolute z-50 min-w-[8rem] overflow-hidden rounded-md border border-border bg-background p-1 shadow-md animate-in fade-in-0 zoom-in-95",
        alignClass,
        className
      )}
    >
      {children}
    </div>
  );
}

function DropdownMenuItem({
  children,
  className,
  onClick,
  disabled,
  destructive,
  inset,
}: {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
  destructive?: boolean;
  inset?: boolean;
}) {
  const { setOpen } = React.useContext(DropdownMenuContext);
  return (
    <button
      type="button"
      disabled={disabled}
      className={cn(
        "relative flex w-full cursor-default select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none transition-colors",
        "hover:bg-accent hover:text-accent-foreground",
        "disabled:pointer-events-none disabled:opacity-50",
        destructive && "text-destructive hover:bg-destructive/10 hover:text-destructive",
        inset && "pl-8",
        className
      )}
      onClick={() => {
        onClick?.();
        setOpen(false);
      }}
    >
      {children}
    </button>
  );
}

function DropdownMenuSeparator({ className }: { className?: string }) {
  return <div className={cn("-mx-1 my-1 h-px bg-border", className)} />;
}

function DropdownMenuLabel({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("px-2 py-1.5 text-xs font-semibold text-muted-foreground", className)}>
      {children}
    </div>
  );
}

export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
};
