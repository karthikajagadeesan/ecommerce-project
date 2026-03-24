"use client";

import React from "react";
import { LogOut } from "lucide-react";
import { signOut } from "@/app/actions/auth-actions";
import { cn } from "@/lib/utils";
import { usegeneralStore } from "@/store/general-store";
import { useRouter } from "next/navigation";

interface SignoutFormProps {
  userName: string;
}

export default function SignoutForm({ userName }: SignoutFormProps) {
  const isCollapsed = usegeneralStore((state) => state.isCollapsed);
  const firstLetter = userName ? userName.charAt(0).toUpperCase() : "U";
  const router = useRouter();

  const handleSignout = async () => {
    await signOut();
    router.push("/login");
  };

  return (
    <div
      onClick={handleSignout}
      className={cn(
        "flex w-full cursor-pointer items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted",
        isCollapsed && "justify-center px-2"
      )}
    >
      {/* Avatar Circle */}
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
        {firstLetter}
      </div>

      {!isCollapsed && (
        <div className="flex flex-1 items-center justify-between overflow-hidden">
          <span className="truncate pr-2">{userName}</span>
          
          {/* Logout Icon with Hover Text - Exact Pattern Match */}
          {/* <div className="flex items-center gap-2 px-2 py-1.5 rounded-md text-sidebar-foreground transition-colors group-hover:text-primary">
            <span className="opacity-0 transition-opacity duration-300 group-hover:opacity-100 text-xs font-medium translate-x-2 group-hover:translate-x-0">
              Logout
            </span> */}
            <LogOut className="h-4 w-4 shrink-0 transition-transform duration-300 group-hover:scale-110" />
          {/* </div> */}
        </div>
      )}
    </div>
  );
}
