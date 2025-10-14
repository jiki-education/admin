"use client";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { useAuthStore } from "@/stores/authStore";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import type { User, UserFilters as UserFiltersType } from "./types";
import { getUsers } from "@/lib/api/users";
import UserFilters from "./components/UserFilters";
import UserTable from "./components/UserTable";
import UserPagination from "./components/UserPagination";
import DeleteUserModal from "./components/DeleteUserModal";

export default function Users() {
  const { isAuthenticated, hasCheckedAuth, checkAuth } = useAuthStore();
  const router = useRouter();

  const [users, setUsers] = useState<User[]>([]);
  const [filters, setFilters] = useState<UserFiltersType>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [meta, setMeta] = useState<{
    current_page: number;
    total_count: number;
    total_pages: number;
  }>({
    current_page: 1,
    total_count: 0,
    total_pages: 0
  });

  // Delete modal state
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    if (!hasCheckedAuth) {
      void checkAuth();
    }
  }, [hasCheckedAuth, checkAuth]);

  useEffect(() => {
    if (hasCheckedAuth && !isAuthenticated) {
      router.push("/signin");
    }
  }, [isAuthenticated, hasCheckedAuth, router]);

  const loadUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getUsers(filters);
      setUsers(response.results);
      setMeta(response.meta);
    } catch (err) {
      console.error("Failed to load users:", err);
      setError(err instanceof Error ? err.message : "Failed to load users");
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    if (isAuthenticated) {
      void loadUsers();
    }
  }, [isAuthenticated, loadUsers]);

  const handleFiltersChange = useCallback((newFilters: UserFiltersType) => {
    // Reset to page 1 when filters change
    setFilters({ ...newFilters, page: 1 });
  }, []);

  const handleClearFilters = useCallback(() => {
    setFilters({});
  }, []);

  const handlePageChange = useCallback((page: number) => {
    setFilters(prevFilters => ({ ...prevFilters, page }));
  }, []);

  const handleDeleteUser = useCallback((user: User) => {
    setSelectedUser(user);
    setIsDeleteModalOpen(true);
  }, []);

  const handleCloseDeleteModal = useCallback(() => {
    setIsDeleteModalOpen(false);
    setSelectedUser(null);
    setDeleteLoading(false);
  }, []);

  const handleConfirmDelete = useCallback(async () => {
    if (!selectedUser) return;

    setDeleteLoading(true);
    try {
      // TODO: Implement actual delete API call when endpoint is available
      // await deleteUser(selectedUser.id);
      
      // For now, just simulate a successful delete with a delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log(`User ${selectedUser.email} would be deleted (endpoint not implemented yet)`);
      
      // Reload users after successful delete
      await loadUsers();
      handleCloseDeleteModal();
    } catch (err) {
      console.error("Failed to delete user:", err);
      setError(err instanceof Error ? err.message : "Failed to delete user");
      setDeleteLoading(false);
    }
  }, [selectedUser, loadUsers, handleCloseDeleteModal]);

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
    <div>
      <PageBreadcrumb pageTitle="Users" />

      <div className="space-y-6">
        <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-xl font-semibold text-gray-800 dark:text-white/90">
              User Management
            </h1>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg dark:bg-red-900/20 dark:border-red-800">
              <p className="text-red-700 dark:text-red-400">{error}</p>
            </div>
          )}

          <UserFilters
            filters={filters}
            onFiltersChange={handleFiltersChange}
            onClearFilters={handleClearFilters}
          />

          <UserTable
            users={users}
            loading={loading}
            onDelete={handleDeleteUser}
          />

          <UserPagination
            currentPage={meta.current_page}
            totalPages={meta.total_pages}
            totalCount={meta.total_count}
            onPageChange={handlePageChange}
          />
        </div>
      </div>

      {/* Delete User Modal */}
      <DeleteUserModal
        isOpen={isDeleteModalOpen}
        onClose={handleCloseDeleteModal}
        onConfirm={handleConfirmDelete}
        user={selectedUser}
        loading={deleteLoading}
      />
    </div>
  );
}