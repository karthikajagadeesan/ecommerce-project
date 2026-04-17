"use client";

import React from "react";
import { LucideIcon, Home, ChevronLeft, MoveLeft, ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import Link from "next/link";
import { useRouter } from "next/navigation";

export interface BreadcrumbItemType {
  label: string;
  href?: string;
}

interface HeaderProps {
  icon?: React.ElementType | React.ReactNode;
  heading: string;
  description?: string;
  breadcrumbs?: BreadcrumbItemType[];
  className?: string;
  specialButtons?: React.ReactNode;
}

export default function Header({
  icon: Icon,
  heading,
  description,
  breadcrumbs,
  className,
  specialButtons,
}: HeaderProps) {

  const router = useRouter()

  return (
    <div className={cn("flex flex-col", className)}>

      {/* Header Content */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-4 md:gap-6 shrink-0">
            <ArrowLeft className="h-4 w-4 text-current cursor-pointer hover:opacity-70 transition-opacity" onClick={() => router.back()} />

            {Icon && (
              <div className="flex h-10 w-10 md:h-10 md:w-10 items-center justify-center rounded-lg bg-primary/10 text-primary shrink-0">
                {React.isValidElement(Icon) ? (
                  Icon
                ) : typeof Icon === 'function' || typeof Icon === 'object' ? (
                  // @ts-ignore
                  <Icon className="h-5 w-5 md:h-5 md:w-5 text-current" />
                ) : (
                  Icon
                )}
              </div>
            )}
          </div>
          <div className="flex flex-col min-w-0">
            <h1 className="text-2xl font-semibold tracking-tight">{heading}</h1>
            {description && (
              <p className="text-xs text-muted-foreground">{description}</p>
            )}
          </div>
        </div>
        <div className="flex items-center justify-center md:justify-end gap-3 w-full md:w-auto overflow-x-auto no-scrollbar pb-1 md:pb-0">
          {specialButtons}
        </div>
      </div>

      {/* Breadcrumb */}
      {breadcrumbs && breadcrumbs.length > 0 && (
        <Breadcrumb className="my-3 mx-2">
          <BreadcrumbList className="text-xs">
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/dashboard" className="text-xs hover:text-foreground">
                  <Home className="h-3.5 w-3.5" />
                </Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            {breadcrumbs.map((item, index) => {
              const isLast = index === breadcrumbs.length - 1;
              return (
                <React.Fragment key={index}>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    {isLast || !item.href ? (
                      <BreadcrumbPage className="text-xs text-gray-500">{item.label}</BreadcrumbPage>
                    ) : (
                      <BreadcrumbLink asChild>
                        <Link href={item.href} className="text-xs hover:text-foreground">
                          {item.label}
                        </Link>
                      </BreadcrumbLink>
                    )}
                  </BreadcrumbItem>
                </React.Fragment>
              );
            })}
          </BreadcrumbList>
        </Breadcrumb>
      )}

    </div>
  );
}

