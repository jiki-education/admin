import PageBreadcrumb from "@/components/common/PageBreadCrumb";

export default function Dashboard() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Dashboard" />

      <div className="rounded-xl border border-gray-200 bg-white p-8 text-center dark:border-gray-800 dark:bg-white/[0.03]">
        <h1 className="mb-4 text-2xl font-bold text-gray-800 dark:text-white/90">Welcome to Jiki Admin</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Administrative dashboard for platform management, user administration, content moderation, and system
          monitoring.
        </p>
      </div>
    </div>
  );
}
