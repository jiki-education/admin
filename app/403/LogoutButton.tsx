"use client";

import { useAuthStore } from "@/stores/authStore";
import { useRouter } from "next/navigation";

export function LogoutButton() {
  const { logout } = useAuthStore();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await logout();
      router.push("/signin");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <button
      type="button"
      onClick={handleLogout}
      className="inline-flex items-center justify-center rounded-lg bg-brand-500 px-5 py-3.5 text-sm font-medium text-white shadow-theme-xs hover:bg-brand-600"
    >
      Sign out
    </button>
  );
}
