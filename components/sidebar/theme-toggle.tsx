"use client"

import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { usegeneralStore } from "@/store/general-store"
import { cn } from "@/lib/utils"
import { useEffect, useState } from "react"

export function ThemeToggle() {
    const { setTheme, theme } = useTheme()
    const isCollapsed = usegeneralStore((state) => state.isCollapsed)
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    const toggleTheme = () => {
        setTheme(theme === "dark" ? "light" : "dark")
    }

    if (!mounted) {
        return (
            <Button
                variant="ghost"
                disabled
                className={cn(
                    "flex w-full items-center gap-3 px-3 py-2 text-sm font-medium text-sidebar-foreground",
                    isCollapsed ? "justify-center" : "justify-start"
                )}
            >
                <div className="h-5 w-5 shrink-0" />
                {!isCollapsed && <span className="opacity-0">Toggle Theme</span>}
            </Button>
        )
    }

    return (
        <Button
            variant="ghost"
            onClick={toggleTheme}
            className={cn(
                "flex w-full items-center gap-2 px-3 py-2 text-sm font-medium text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                "justify-start"
            )}
            title="Toggle theme"
        >
            <div className="relative h-5 w-5 shrink-0 overflow-hidden">
                <Sun
                    className={cn(
                        "absolute inset-0 h-5 w-5 transition-all duration-300 ease-in-out",
                        theme === "dark"
                            ? "translate-y-full opacity-0 rotate-90"
                            : "translate-y-0 opacity-100 rotate-0"
                    )}
                />
                <Moon
                    className={cn(
                        "absolute inset-0 h-5 w-5 transition-all duration-300 ease-in-out",
                        theme === "dark"
                            ? "translate-y-0 opacity-100 rotate-0"
                            : "-translate-y-full opacity-0 -rotate-90"
                    )}
                />
            </div>
            {!isCollapsed && (
                <span className="font-medium tracking-tight transition-opacity duration-300">
                    {theme === "dark" ? "Light Mode" : "Dark Mode"}
                </span>
            )}
        </Button>
    )
}
