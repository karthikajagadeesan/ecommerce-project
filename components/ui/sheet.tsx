'use client';

import * as React from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SheetProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  contentClassName?: string;
}

export function Sheet({ isOpen, onClose, title, description, children, contentClassName }: SheetProps) {
  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black/50 animate-in fade-in duration-300" 
        onClick={onClose}
      />
      
      {/* Sheet Content */}
      <div 
        className={cn(
          "relative p-5 w-full max-w-md h-full bg-card border-l border-border shadow-2xl flex flex-col animate-in slide-in-from-right duration-500 ease-out",
          "bg-white dark:bg-slate-950" // Fallback colors but globals should handle card token
        )}
      >
        {/* Header */}
        <div className=" flex items-center justify-between">
          <div>
            {title && <h2 className="text-xl font-semibold text-foreground">{title}</h2>}
            {description && <p className="text-sm text-muted-foreground mt-1">{description}</p>}
          </div>
          <button 
            onClick={onClose}
            className="h-6 w-7 mb-9  rounded-md bg-muted/50 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className={cn("flex-1", contentClassName || "overflow-y-auto pt-5")}>
          {children}
        </div>
      </div>
    </div>
  );
}
