export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Dashboard</h1>
        </div>
      </header>
      <main>
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="rounded-lg bg-white px-5 py-6 shadow sm:px-6">
            <h2 className="text-xl font-semibold mb-4">Welcome to the Admin Dashboard</h2>
            <p className="text-gray-600">This is a minimal dashboard page for the Jiki admin application.</p>
          </div>
        </div>
      </main>
    </div>
  );
}
