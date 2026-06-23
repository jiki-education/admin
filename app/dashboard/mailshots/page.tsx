"use client";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import Button from "@/components/ui/button/Button";
import { getMailshots, deleteMailshot } from "@/lib/api/mailshots";
import { extractErrorMessage } from "./errors";
import MailshotFilters from "./components/MailshotFilters";
import MailshotTable from "./components/MailshotTable";
import MailshotPagination from "./components/MailshotPagination";
import DeleteMailshotModal from "./components/DeleteMailshotModal";
import type { Mailshot, MailshotFilters as MailshotFiltersType } from "./types";

export default function Mailshots() {
  const [mailshots, setMailshots] = useState<Mailshot[]>([]);
  const [filters, setFilters] = useState<MailshotFiltersType>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [itemsPerPage, setItemsPerPage] = useState(25);
  const [meta, setMeta] = useState({ current_page: 1, total_count: 0, total_pages: 0 });

  const [selectedMailshot, setSelectedMailshot] = useState<Mailshot | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const loadMailshots = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getMailshots({ ...filters, per: itemsPerPage });
      setMailshots(response.results);
      setMeta(response.meta);
    } catch (err) {
      setError(extractErrorMessage(err));
      setMailshots([]);
    } finally {
      setLoading(false);
    }
  }, [filters, itemsPerPage]);

  useEffect(() => {
    void loadMailshots();
  }, [loadMailshots]);

  const handleFiltersChange = useCallback((newFilters: MailshotFiltersType) => {
    setFilters({ ...newFilters, page: 1 });
  }, []);

  const handleConfirmDelete = useCallback(async () => {
    if (!selectedMailshot) {
      return;
    }
    setDeleteLoading(true);
    setDeleteError(null);
    try {
      await deleteMailshot(selectedMailshot.id);
      await loadMailshots();
      setSelectedMailshot(null);
    } catch (err) {
      setDeleteError(extractErrorMessage(err));
    } finally {
      setDeleteLoading(false);
    }
  }, [selectedMailshot, loadMailshots]);

  return (
    <div>
      <PageBreadcrumb pageTitle="Mailshots" />

      <div className="space-y-6">
        <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
          <div className="mb-6 flex items-center justify-between">
            <h1 className="text-xl font-semibold text-gray-800 dark:text-white/90">Mailshots</h1>
            <Link href="/dashboard/mailshots/new">
              <Button variant="primary">New mailshot</Button>
            </Link>
          </div>

          {error && (
            <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/20">
              <p className="text-red-700 dark:text-red-400">{error}</p>
            </div>
          )}

          <MailshotFilters
            filters={filters}
            onFiltersChange={handleFiltersChange}
            onClearFilters={() => setFilters({})}
          />

          <MailshotTable mailshots={mailshots} loading={loading} onDelete={setSelectedMailshot} />

          <MailshotPagination
            currentPage={meta.current_page}
            totalPages={meta.total_pages}
            totalCount={meta.total_count}
            itemsPerPage={itemsPerPage}
            onPageChange={(page) => setFilters((prev) => ({ ...prev, page }))}
            onItemsPerPageChange={(per) => {
              setItemsPerPage(per);
              setFilters((prev) => ({ ...prev, page: 1 }));
            }}
          />
        </div>
      </div>

      <DeleteMailshotModal
        isOpen={selectedMailshot !== null}
        onClose={() => {
          setSelectedMailshot(null);
          setDeleteError(null);
        }}
        onConfirm={handleConfirmDelete}
        mailshot={selectedMailshot}
        loading={deleteLoading}
        error={deleteError}
      />
    </div>
  );
}
