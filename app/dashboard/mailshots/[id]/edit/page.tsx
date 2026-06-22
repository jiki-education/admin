"use client";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import Button from "@/components/ui/button/Button";
import { useRouter, useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { getMailshot } from "@/lib/api/mailshots";
import { extractErrorMessage } from "../../errors";
import MailshotForm from "../../components/MailshotForm";
import MailshotActions from "../../components/MailshotActions";
import type { Mailshot } from "../../types";

export default function EditMailshot() {
  const router = useRouter();
  const params = useParams();
  const mailshotId = parseInt(params.id as string);

  const [mailshot, setMailshot] = useState<Mailshot | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadMailshot = useCallback(async () => {
    if (!mailshotId || isNaN(mailshotId)) {
      setError("Invalid mailshot ID");
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setError(null);
      setMailshot(await getMailshot(mailshotId));
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [mailshotId]);

  useEffect(() => {
    void loadMailshot();
  }, [loadMailshot]);

  const handleBack = () => router.push("/dashboard/mailshots");

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div>
      <PageBreadcrumb pageTitle="Edit Mailshot" />

      <div className="space-y-6">
        <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
          <div className="mb-6 flex items-center justify-between">
            <h1 className="text-xl font-semibold text-gray-800 dark:text-white/90">Edit Mailshot</h1>
            <Button variant="outline" onClick={handleBack}>
              Back to Mailshots
            </Button>
          </div>

          {error || !mailshot ? (
            <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/20">
              <p className="text-red-700 dark:text-red-400">{error || "Mailshot not found"}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              <div className="lg:col-span-2">
                <MailshotForm mailshot={mailshot} onSaved={setMailshot} />
              </div>
              <div>
                <MailshotActions mailshot={mailshot} onUpdated={setMailshot} />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
