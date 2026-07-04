"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  FileText,
  Plus,
  Sparkles,
  Mail,
  BarChart3,
  Palette,
  User,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  X,
  History,
  TrendingUp,
  Upload,
  Search,
} from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/hooks/use-auth";
import { useSidebar } from "@/components/layout/sidebar-context";
import { cn } from "@/lib/utils";

const navMain = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/resumes", icon: FileText, label: "My Resumes" },
  { href: "/resumes/new", icon: Plus, label: "Create Resume" },
  { href: "/import", icon: Upload, label: "Import Resume" },
  { href: "/search", icon: Search, label: "Search" },
];

const navTools = [
  { href: "/ai-studio", icon: Sparkles, label: "AI Studio" },
  { href: "/career", icon: TrendingUp, label: "Career Intel" },
  { href: "/cover-letters", icon: Mail, label: "Cover Letters" },
  { href: "/design", icon: Palette, label: "Design Studio" },
  { href: "/analytics", icon: BarChart3, label: "Analytics", soon: true },
];

const navAccount = [
  { href: "/profile", icon: User, label: "Profile" },
  { href: "/settings", icon: Settings, label: "Settings" },
];

interface NavItemProps {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  soon?: boolean;
  collapsed: boolean;
  active: boolean;
}

function NavItem({ href, icon: Icon, label, soon, collapsed, active }: NavItemProps) {
  return (
    <Link
      href={soon ? "#" : href}
      onClick={(e) => soon && e.preventDefault()}
      className={cn(
        "group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all",
        active
          ? "bg-sidebar-accent text-sidebar-primary"
          : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground",
        collapsed && "justify-center px-2",
        soon && "cursor-default opacity-50"
      )}
      title={collapsed ? label : undefined}
    >
      <Icon className="h-4 w-4 shrink-0" />
      {!collapsed && (
        <span className="truncate">{label}</span>
      )}
      {!collapsed && soon && (
        <span className="ml-auto rounded-full bg-muted px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-muted-foreground">
          Soon
        </span>
      )}
    </Link>
  );
}

function SidebarInner({
  collapsed,
  onClose,
}: {
  collapsed: boolean;
  onClose?: () => void;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    router.push("/");
  };

  return (
    <div className="flex h-full flex-col bg-sidebar">
      {/* Logo */}
      <div
        className={cn(
          "flex h-14 shrink-0 items-center border-b border-sidebar-border px-4",
          collapsed ? "justify-center" : "justify-between"
        )}
      >
        {!collapsed && (
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-purple-600 to-pink-600 text-white shadow-sm">
              <Sparkles className="h-4 w-4" />
            </div>
            <span className="font-bold text-sidebar-foreground">ResumeAI</span>
          </Link>
        )}
        {onClose && (
          <button
            onClick={onClose}
            className="rounded-md p-1 text-sidebar-foreground/60 hover:bg-sidebar-accent"
            aria-label="Close menu"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-0.5 overflow-y-auto p-3">
        {!collapsed && (
          <p className="mb-1 px-3 text-[10px] font-semibold uppercase tracking-widest text-sidebar-foreground/40">
            Main
          </p>
        )}
        {navMain.map((item) => (
          <NavItem
            key={item.href}
            {...item}
            collapsed={collapsed}
            active={pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href + "/"))}
          />
        ))}

        <div className="my-2">
          <Separator className="bg-sidebar-border" />
        </div>

        {!collapsed && (
          <p className="mb-1 px-3 text-[10px] font-semibold uppercase tracking-widest text-sidebar-foreground/40">
            AI Tools
          </p>
        )}
        {navTools.map((item) => (
          <NavItem
            key={item.href}
            {...item}
            collapsed={collapsed}
            active={pathname === item.href || pathname.startsWith(item.href + "/")}
          />
        ))}

        {/* AI History quick link */}
        <Link
          href="/ai-studio#history"
          onClick={() => {}}
          className={cn(
            "group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all",
            "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground",
            collapsed && "justify-center px-2"
          )}
          title={collapsed ? "AI History" : undefined}
        >
          <History className="h-4 w-4 shrink-0" />
          {!collapsed && <span className="truncate">AI History</span>}
        </Link>

        <div className="my-2">
          <Separator className="bg-sidebar-border" />
        </div>

        {!collapsed && (
          <p className="mb-1 px-3 text-[10px] font-semibold uppercase tracking-widest text-sidebar-foreground/40">
            Account
          </p>
        )}
        {navAccount.map((item) => (
          <NavItem
            key={item.href}
            {...item}
            collapsed={collapsed}
            active={pathname === item.href}
          />
        ))}
      </nav>

      {/* User section */}
      <div className="shrink-0 border-t border-sidebar-border p-3">
        <div className={cn("flex items-center gap-3", collapsed && "justify-center")}>
          <Avatar src={user?.image} name={user?.name ?? ""} size="sm" />
          {!collapsed && (
            <>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-sidebar-foreground">{user?.name}</p>
                <p className="truncate text-xs text-sidebar-foreground/50">{user?.email}</p>
              </div>
              <button
                onClick={handleSignOut}
                className="shrink-0 rounded-md p-1.5 text-sidebar-foreground/50 hover:bg-sidebar-accent hover:text-destructive"
                aria-label="Sign out"
                title="Sign out"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export function Sidebar() {
  const { collapsed, setCollapsed, mobileOpen, setMobileOpen } = useSidebar();

  return (
    <>
      {/* Desktop sidebar */}
      <motion.aside
        animate={{ width: collapsed ? 64 : 240 }}
        transition={{ duration: 0.2, ease: "easeInOut" }}
        className="relative hidden h-screen shrink-0 border-r border-sidebar-border lg:flex lg:flex-col"
      >
        <SidebarInner collapsed={collapsed} />
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3 top-16 z-10 flex h-6 w-6 items-center justify-center rounded-full border border-border bg-background text-muted-foreground shadow-sm hover:bg-accent"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <ChevronRight className="h-3 w-3" /> : <ChevronLeft className="h-3 w-3" />}
        </button>
      </motion.aside>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-40 bg-black/50 lg:hidden"
              onClick={() => setMobileOpen(false)}
            />
            <motion.aside
              key="drawer"
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="fixed inset-y-0 left-0 z-50 w-64 border-r border-sidebar-border lg:hidden"
            >
              <SidebarInner collapsed={false} onClose={() => setMobileOpen(false)} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
