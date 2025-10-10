"use client";
import { EcommerceMetrics } from "@/components/ecommerce/EcommerceMetrics";
import LineChartOne from "@/components/charts/line/LineChartOne";
import BarChartOne from "@/components/charts/bar/BarChartOne";
import BasicTableOne from "@/components/tables/BasicTableOne";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { useAuthStore } from "@/stores/authStore";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Dashboard() {
  const { isAuthenticated, hasCheckedAuth, checkAuth } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!hasCheckedAuth) {
      checkAuth();
    }
  }, [hasCheckedAuth, checkAuth]);

  useEffect(() => {
    if (hasCheckedAuth && !isAuthenticated) {
      router.push("/signin");
    }
  }, [isAuthenticated, hasCheckedAuth, router]);

  if (!hasCheckedAuth) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Will redirect to signin
  }

  return (
    <div className="mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10">
      <PageBreadcrumb pageTitle="Dashboard" />

      <div className="grid grid-cols-1 gap-4 md:gap-6">
        {/* Metrics Overview */}
        <div>
          <h3 className="mb-4 text-lg font-semibold text-gray-800 dark:text-white/90">
            Overview
          </h3>
          <EcommerceMetrics />
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 gap-4 md:gap-6 lg:grid-cols-2">
          <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
            <div className="mb-4 flex items-center justify-between">
              <h4 className="text-lg font-semibold text-gray-800 dark:text-white/90">
                Sales Analytics
              </h4>
              <div className="flex gap-2">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded bg-[#465FFF]"></div>
                  <span className="text-sm text-gray-500 dark:text-gray-400">Sales</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded bg-[#9CB9FF]"></div>
                  <span className="text-sm text-gray-500 dark:text-gray-400">Revenue</span>
                </div>
              </div>
            </div>
            <LineChartOne />
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
            <div className="mb-4">
              <h4 className="text-lg font-semibold text-gray-800 dark:text-white/90">
                Monthly Performance
              </h4>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Comparison of quarterly results
              </p>
            </div>
            <BarChartOne />
          </div>
        </div>

        {/* Recent Activity Table */}
        <div>
          <div className="mb-4">
            <h4 className="text-lg font-semibold text-gray-800 dark:text-white/90">
              Recent Projects
            </h4>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Latest project activity and team assignments
            </p>
          </div>
          <BasicTableOne />
        </div>

        {/* Additional Stats Cards */}
        <div className="grid grid-cols-1 gap-4 md:gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Total Users</p>
                <p className="text-2xl font-bold text-gray-800 dark:text-white/90">2,847</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-50 dark:bg-blue-900/20">
                <svg className="h-6 w-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
              </div>
            </div>
            <div className="mt-3 flex items-center gap-1 text-sm">
              <span className="text-green-600 dark:text-green-400">+12%</span>
              <span className="text-gray-500 dark:text-gray-400">from last month</span>
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Revenue</p>
                <p className="text-2xl font-bold text-gray-800 dark:text-white/90">$45,2K</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-50 dark:bg-green-900/20">
                <svg className="h-6 w-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
            </div>
            <div className="mt-3 flex items-center gap-1 text-sm">
              <span className="text-green-600 dark:text-green-400">+8.5%</span>
              <span className="text-gray-500 dark:text-gray-400">from last month</span>
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Active Projects</p>
                <p className="text-2xl font-bold text-gray-800 dark:text-white/90">127</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-50 dark:bg-purple-900/20">
                <svg className="h-6 w-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
            </div>
            <div className="mt-3 flex items-center gap-1 text-sm">
              <span className="text-red-600 dark:text-red-400">-3%</span>
              <span className="text-gray-500 dark:text-gray-400">from last month</span>
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Conversion Rate</p>
                <p className="text-2xl font-bold text-gray-800 dark:text-white/90">3.21%</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-orange-50 dark:bg-orange-900/20">
                <svg className="h-6 w-6 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
            </div>
            <div className="mt-3 flex items-center gap-1 text-sm">
              <span className="text-green-600 dark:text-green-400">+1.2%</span>
              <span className="text-gray-500 dark:text-gray-400">from last month</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}