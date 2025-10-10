"use client";

import { useAuthStore } from "@/stores/authStore";
import { useEffect, ReactNode } from "react";

interface AuthProviderProps {
  children: ReactNode;
}

export default function AuthProvider({ children }: AuthProviderProps) {
  const { checkAuth, hasCheckedAuth } = useAuthStore();

  useEffect(() => {
    // Only check auth if we haven't checked yet
    if (!hasCheckedAuth) {
      checkAuth();
    }
  }, [checkAuth, hasCheckedAuth]);

  return <>{children}</>;
}
