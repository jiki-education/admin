"use client";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";
import { ApiError } from "@/lib/api";
import Label from "@/components/form/Label";
import Input from "@/components/form/input/InputField";
import Button from "@/components/ui/button/Button";
import { createMailshot } from "@/lib/api/mailshots";
import { useRequireAuth } from "@/lib/auth/hooks";
import { extractFieldErrors, extractErrorMessage } from "../errors";

export default function NewMailshot() {
  const { isAuthenticated, isLoading: authLoading } = useRequireAuth();
  const router = useRouter();

  const [slug, setSlug] = useState("");
  const [subject, setSubject] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<string, string[]>>>({});
  const [creating, setCreating] = useState(false);

  const handleCreate = async () => {
    setCreating(true);
    setFieldErrors({});
    try {
      const mailshot = await createMailshot({ slug, subject, body_markdown: "" });
      router.replace(`/dashboard/mailshots/${mailshot.id}/edit`);
    } catch (err) {
      if (err instanceof ApiError) {
        setFieldErrors(extractFieldErrors(err));
      }
      toast.error(extractErrorMessage(err));
      setCreating(false);
    }
  };

  if (authLoading || !isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div>
      <PageBreadcrumb pageTitle="New Mailshot" />

      <div className="space-y-6">
        <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
          <h1 className="mb-6 text-xl font-semibold text-gray-800 dark:text-white/90">New Mailshot</h1>

          <div className="max-w-xl space-y-5">
            <div>
              <Label htmlFor="new-slug">Slug</Label>
              <Input
                id="new-slug"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                error={Boolean(fieldErrors.slug)}
                hint={fieldErrors.slug?.join(", ")}
              />
            </div>

            <div>
              <Label htmlFor="new-subject">Subject</Label>
              <Input
                id="new-subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                error={Boolean(fieldErrors.subject)}
                hint={fieldErrors.subject?.join(", ")}
              />
            </div>

            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => router.push("/dashboard/mailshots")} disabled={creating}>
                Cancel
              </Button>
              <Button variant="primary" onClick={handleCreate} disabled={creating || !slug || !subject}>
                {creating ? "Creating..." : "Create & edit"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
