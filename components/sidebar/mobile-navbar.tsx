"use client";

import React from "react";
import { Menu, Search } from "lucide-react";
import { usegeneralStore } from "@/store/general-store";
import { useAppSettingsStore } from "@/store/app-settings-store";
import { Button } from "@/components/ui/button";
import Logo from "@/components/logo";
import { cn } from "@/lib/utils";

export default function MobileNavbar({ userName }: { userName: string }) {
  const setIsSidebarOpen = usegeneralStore((state) => state.setIsSidebarOpen);
  const appSettings = useAppSettingsStore((state) => state.settings);

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="md:hidden flex h-16 items-center justify-between px-4 border-b bg-card sticky top-0 left-0 right-0 z-40">
      <div className="flex items-center gap-2">
        <Logo settings={appSettings} isCollapsed={true} />
      </div>

      <div className="flex items-center gap-3">
        {/* User Avatar */}
        <div className="h-9 w-9 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-sm font-bold shadow-sm">
          {getInitials(userName)}
        </div>

        {/* Hamburger Menu Toggle */}
        <div className="h-10 w-10 border-ui-muted pl-3 flex items-center justify-center">
            <Button
            variant="ghost"
            size="icon"
            className="text-foreground"
            onClick={() => setIsSidebarOpen(true)}
            >
            <Menu className="h-6 w-6" />
            </Button>
        </div>
      </div>
    </div>
  );
}
