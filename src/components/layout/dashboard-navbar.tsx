"use client";

import { useRouter } from "next/navigation";
import { Menu, Search, Sun, Moon, Monitor, ChevronDown, User, Settings, LogOut, CreditCard } from "lucide-react";
import { useTheme } from "next-themes";
import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { Avatar } from "@/components/ui/avatar";
import { NotificationCenter } from "@/components/layout/notification-center";
import { useSidebar } from "@/components/layout/sidebar-context";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";

function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return <div className="h-9 w-9" />;

  const next = theme === "dark" ? "light" : theme === "light" ? "system" : "dark";
  const icon =
    theme === "dark" ? <Moon className="h-4 w-4" /> :
    theme === "light" ? <Sun className="h-4 w-4" /> :
    <Monitor className="h-4 w-4" />;

  return (
    <button
      onClick={() => setTheme(next)}
      className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
      aria-label="Toggle theme"
      title={`Switch to ${next} mode`}
    >
      {icon}
    </button>
  );
}

function ProfileMenu() {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    if (open) document.addEventListener("mousedown", onOutside);
    return () => document.removeEventListener("mousedown", onOutside);
  }, [open]);

  const handleSignOut = async () => {
    setOpen(false);
    await signOut();
    router.push("/");
  };

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm transition-colors hover:bg-accent"
        aria-expanded={open}
      >
        <Avatar src={user?.image} name={user?.name ?? ""} size="sm" />
        <div className="hidden text-left sm:block">
          <p className="max-w-[120px] truncate text-sm font-medium">{user?.name}</p>
        </div>
        <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-56 overflow-hidden rounded-xl border border-border bg-background shadow-xl">
          <div className="border-b border-border px-4 py-3">
            <p className="truncate text-sm font-semibold">{user?.name}</p>
            <p className="truncate text-xs text-muted-foreground">{user?.email}</p>
          </div>
          <div className="p-1">
            {[
              { label: "Profile", icon: User, href: "/profile" },
              { label: "Settings", icon: Settings, href: "/settings" },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm hover:bg-accent"
                >
                  <Icon className="h-4 w-4 text-muted-foreground" />
                  {item.label}
                </Link>
              );
            })}
            <div className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-muted-foreground">
              <CreditCard className="h-4 w-4" />
              Billing
              <span className="ml-auto rounded-full bg-muted px-1.5 py-0.5 text-[9px] font-bold uppercase">Soon</span>
            </div>
          </div>
          <div className="border-t border-border p-1">
            <button
              onClick={handleSignOut}
              className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-destructive hover:bg-destructive/10"
            >
              <LogOut className="h-4 w-4" />
              Sign out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export function DashboardNavbar() {
  const { setMobileOpen, setCommandOpen } = useSidebar();

  return (
    <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center border-b border-border bg-background/80 px-4 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
      {/* Mobile hamburger */}
      <button
        onClick={() => setMobileOpen(true)}
        className="mr-3 flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground lg:hidden"
        aria-label="Open menu"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Right actions */}
      <div className="flex items-center gap-1">
        {/* Command palette button */}
        <button
          onClick={() => setCommandOpen(true)}
          className={cn(
            "hidden items-center gap-2 rounded-lg border border-border px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground sm:flex"
          )}
          aria-label="Open command palette"
        >
          <Search className="h-3.5 w-3.5" />
          <span className="text-xs">Search...</span>
          <kbd className="ml-2 rounded bg-muted px-1.5 py-0.5 font-mono text-[10px]">⌘K</kbd>
        </button>

        {/* Mobile search */}
        <button
          onClick={() => setCommandOpen(true)}
          className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground hover:bg-accent sm:hidden"
          aria-label="Search"
        >
          <Search className="h-4 w-4" />
        </button>

        <NotificationCenter />
        <ThemeToggle />
        <div className="ml-1">
          <ProfileMenu />
        </div>
      </div>
    </header>
  );
}
