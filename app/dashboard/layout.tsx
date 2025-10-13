import AppSidebar from "@/layout/AppSidebar";
import AppHeader from "@/layout/AppHeader";
import Backdrop from "@/layout/Backdrop";

export default function DashboardLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen overflow-hidden">
      <AppSidebar />
      <div className="relative flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
        <AppHeader />
        <main className="flex-grow p-4 md:p-6 2xl:p-10">
          {children}
        </main>
      </div>
      <Backdrop />
    </div>
  );
}