import Button from "@/components/ui/button/Button";

interface FormActionsProps {
  onCancel: () => void;
  submitLabel: string;
  loading?: boolean;
  disabled?: boolean;
  cancelLabel?: string;
}

export default function FormActions({
  onCancel,
  submitLabel,
  loading = false,
  disabled = false,
  cancelLabel = "Cancel"
}: FormActionsProps) {
  return (
    <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
      <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
        {cancelLabel}
      </Button>
      <Button type="submit" disabled={disabled || loading}>
        {loading ? "Saving..." : submitLabel}
      </Button>
    </div>
  );
}
