import React from 'react'
import { Loader2 } from 'lucide-react'

interface LoadingStateProps {
  message?: string;
}

export function LoadingState({ message }: LoadingStateProps) {
  return (
    <div className="flex h-full min-h-[calc(110vh-120px)] w-full flex-col items-center justify-center gap-2">
      <div className="relative flex items-center justify-center">
        {/* Outer pulse ring */}
        {/* <span className="absolute inline-flex h-16 w-16 rounded-full bg-primary/10 animate-ping opacity-75" /> */}
        {/* Inner spinner */}
        <div className="relative flex h-12 w-12 items-center justify-center rounded-full ">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
        </div>
      </div>
      {message && (
        <p className="text-md font-medium">
          {message}
        </p>
      )}
    </div>
  )
}
