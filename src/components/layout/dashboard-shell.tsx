"use client";

import { SidebarProvider } from "@/components/layout/sidebar-context";
import { Sidebar } from "@/components/layout/sidebar";
import { DashboardNavbar } from "@/components/layout/dashboard-navbar";
import { CommandPalette } from "@/components/layout/command-palette";

interface DashboardShellProps {
  children: React.ReactNode;
}

export function DashboardShell({ children }: DashboardShellProps) {
  return (
    <SidebarProvider>
      <div className="flex h-screen overflow-hidden bg-background">
        <Sidebar />
        <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
          <DashboardNavbar />
          <main className="flex-1 overflow-y-auto">
            <div className="mx-auto max-w-6xl p-6">{children}</div>
          </main>
        </div>
      </div>
      <CommandPalette />
    </SidebarProvider>
  );
}
