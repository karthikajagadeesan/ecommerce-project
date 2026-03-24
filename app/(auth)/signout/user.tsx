"use client";

import { useEffect } from "react";
import { signOut } from "@/app/actions/auth-actions";
import { LoadingState } from "@/components/loading-state";

export default function SignoutUser() {
  useEffect(() => {
    signOut();
  }, []);

  return (
    <div className="flex h-screen items-center justify-center">
      <div className="text-center">
        <LoadingState />
        <p className="mt-4 text-muted-foreground">Signing out User...</p>
      </div>
    </div>
  );
}
