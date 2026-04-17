"use client"

import Link from 'next/link'
import Image from 'next/image'
import { cn } from '@/lib/utils'
import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'
import { AppSettings } from '@/store/app-settings-store'

interface LogoProps {
  settings?: AppSettings
  isCollapsed?: boolean
}

export default function Logo({ settings, isCollapsed }: LogoProps) {
  const { theme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Use dark logo for dark mode, light logo for light mode
  const logoSrc = mounted && theme === 'dark' ? '/s22_logo.svg' : '/solution22-logo.png'

  return (
    <Link href="/" className="flex items-center gap-2">
      <Image
        src={logoSrc}
        alt="Solution22 Logo"
        width={40}
        height={40}
        priority
        className={cn(
          "w-auto transition-all duration-300 mt-3",
          isCollapsed ? "h-9" : "h-14"
        )}
      />
      {!settings?.logo && !isCollapsed && (
        <span className="text-xl font-black tracking-tighter text-foreground">
          {settings?.name || "Solution22"}
        </span>
      )}
    </Link>
  )
}
