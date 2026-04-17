"use client";
import { cn } from "@/lib/utils";
import { usegeneralStore } from "@/store/general-store";
import { useAuthStore } from "@/store/user/authStore";
import { useAppSettingsStore } from "@/store/app-settings-store";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import {
  XIcon,
  LayoutDashboardIcon,
  BadgeCheck,
  LogOutIcon,
  PanelLeftIcon,
  LucideIcon,
  UserStarIcon,
  ShieldCheck
} from "lucide-react";
import Link from "next/link";
import { usePathname, useSearchParams, useRouter } from "next/navigation";
import { signOut } from "@/app/actions/auth-actions";
import { ThemeToggle } from "./theme-toggle";
import Logo from "@/components/logo";
import SignoutForm from "@/components/auth/SignoutForm";

interface MenuItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

const menuItems: MenuItem[] = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboardIcon,
  },
  {
    label: "Membership",
    href: "/upgrade-membership",
    icon: BadgeCheck,
  },
  {
    label: "Site Access",
    href: "/site-access",
    icon: ShieldCheck,
  },
   {
    label: "Profile",
    href: "/profile",
    icon: UserStarIcon,
  },
];

const SidebarMenuItem = ({
  item,
  pathname,
  isCollapsed,
  setIsSidebarOpen,
}: {
  item: MenuItem;
  pathname: string;
  isCollapsed: boolean;
  setIsSidebarOpen: (open: boolean) => void;
}) => {
  const Icon = item.icon;
  const searchParams = useSearchParams();

  // Helper function to check if an item is active
  const checkIsActive = (href: string) => {
    if (href === "#") return false;

    // Split href into pathname and search params
    const [itemPath, itemQuery] = href.split("?");
    const isPathMatch =
      pathname === itemPath || pathname.startsWith(itemPath + "/");

    if (!itemQuery) return isPathMatch;

    // If there's a query, both path and query must match
    const itemSearchParams = new URLSearchParams(itemQuery);
    const isQueryMatch = Array.from(itemSearchParams.entries()).every(
      ([key, value]) => searchParams.get(key) === value
    );

    return isPathMatch && isQueryMatch;
  };

  const isActive = checkIsActive(item.href);
  return (
    <li key={item.href}>
      <Link
        href={item.href}
        onClick={() => setIsSidebarOpen(false)}
        className={cn(
          "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
          isActive
            ? "bg-primary text-primary-foreground shadow-sm"
            : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
        )}
        title={isCollapsed ? item.label : undefined}
      >
        <Icon className="h-5 w-5 shrink-0" />
        {!isCollapsed && <span>{item.label}</span>}
      </Link>
    </li>
  );
};

export default function Sidebar({ userName }: { userName: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const isSidebarOpen = usegeneralStore((state) => state.isSidebarOpen);
  const isCollapsed = usegeneralStore((state) => state.isCollapsed);
  const setIsSidebarOpen = usegeneralStore((state) => state.setIsSidebarOpen);
  const setIsCollapsed = usegeneralStore((state) => state.setIsCollapsed);
  const appSettings = useAppSettingsStore((state) => state.settings);

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success("Signed out successfully");
      router.push("/login");
    } catch (error) {
      toast.error("Logout failed");
    }
  };

  if (pathname === "/onboarding") {
    return null;
  }

  return (
    <>
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed z-50 flex flex-col bg-ui-bg-blue border border-ui-border-shade transition-all duration-300 ease-in-out",
          "md:sticky md:top-2 md:m-2 md:rounded-lg md:h-[calc(100vh-16px)] h-full",
          isCollapsed ? "w-[62px]" : "w-[280px] md:w-[232px]",
          isSidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        )}
      >
        {/* Header */}
        <div className={cn(
          "flex h-[67px] items-center transition-all duration-300 relative",
          isCollapsed ? "justify-start" : "justify-center px-8"
        )}>
          <Logo settings={appSettings} isCollapsed={isCollapsed} />
          
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 md:hidden absolute right-4"
            onClick={() => setIsSidebarOpen(false)}
          >
            <XIcon className="h-4 w-4" />
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-2">
          <Separator className="border border-ui-border-shade mb-3 opacity-50" />
          <ul className="space-y-2">
            {menuItems.map((item) => (
              <SidebarMenuItem
                key={item.label}
                item={item}
                pathname={pathname}
                isCollapsed={isCollapsed}
                setIsSidebarOpen={setIsSidebarOpen}
              />
            ))}
          </ul>
        </nav>

        {/* Footer */}
        <div className=" p-2 bg-sidebar-accent/5">
          {/* Theme Toggle */}
          <div className="mb-2">
            <ThemeToggle />
          </div>

          {/* Collapse Button */}
          <Button
            onClick={() => setIsCollapsed(!isCollapsed)}
            variant="ghost"
            className={cn(
              "flex w-full items-center gap-3 px-3 py-2 text-sm font-medium text-sidebar-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
              "justify-start"
            )}
          >
            <PanelLeftIcon className={cn("h-5 w-5 shrink-0 transition-transform duration-300", isCollapsed ? "rotate-180" : "")} />
            {!isCollapsed && <span>Collapse Sidebar</span>}
          </Button>

          {/* Separator */}
          <Separator className="border border-ui-border-shade my-4 opacity-50" />

          {/* User Profile & Sign Out */}
          <SignoutForm userName={userName} />
        </div>
      </aside>
    </>
  );
}
