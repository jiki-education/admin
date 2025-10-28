"use client";
import { useRequireAuth } from "@/lib/auth/hooks";
import AppSidebar from "@/layout/AppSidebar";
import AppHeader from "@/layout/AppHeader";
import Backdrop from "@/layout/Backdrop";
import { useSidebar } from "@/context/SidebarContext";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading, isReady } = useRequireAuth({
    redirectTo: "/signin" // Consistent redirect to signin page
  });
  const { getSidebarWidth } = useSidebar();
  const sidebarWidth = getSidebarWidth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !isReady) {
    return null; // Will redirect via useRequireAuth
  }

  return (
    <div className="h-screen overflow-hidden">
      <AppSidebar />
      <div
        className="relative flex flex-col h-full overflow-y-auto overflow-x-hidden transition-all duration-300 ease-in-out"
        style={{
          marginLeft: `${sidebarWidth}px`
        }}
      >
        <AppHeader />
        <main className="flex-grow p-4 md:p-6 2xl:p-10">{children}</main>
      </div>
      <Backdrop />
    </div>
  );
}
