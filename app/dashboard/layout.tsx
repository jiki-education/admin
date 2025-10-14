"use client";
import AppSidebar from "@/layout/AppSidebar";
import AppHeader from "@/layout/AppHeader";
import Backdrop from "@/layout/Backdrop";
import { useSidebar } from "@/context/SidebarContext";

export default function DashboardLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const { getSidebarWidth } = useSidebar();
  const sidebarWidth = getSidebarWidth();

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
        <main className="flex-grow p-4 md:p-6 2xl:p-10">
          {children}
        </main>
      </div>
      <Backdrop />
    </div>
  );
}