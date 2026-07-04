"use client";

import { createContext, useContext, useState } from "react";

interface SidebarContextValue {
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
  commandOpen: boolean;
  setCommandOpen: (open: boolean) => void;
}

const SidebarContext = createContext<SidebarContextValue>({
  mobileOpen: false,
  setMobileOpen: () => {},
  collapsed: false,
  setCollapsed: () => {},
  commandOpen: false,
  setCommandOpen: () => {},
});

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [commandOpen, setCommandOpen] = useState(false);

  return (
    <SidebarContext.Provider
      value={{ mobileOpen, setMobileOpen, collapsed, setCollapsed, commandOpen, setCommandOpen }}
    >
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebar() {
  return useContext(SidebarContext);
}
