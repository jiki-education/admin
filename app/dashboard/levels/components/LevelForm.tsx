"use client";
import { useFormValidation } from "../hooks/useFormValidation";
import { useFormSubmission } from "../hooks/useFormSubmission";
import { LEVEL_VALIDATION_RULES } from "../constants/validationRules";
import RequiredFieldsNotice from "./shared/RequiredFieldsNotice";
import FormErrorSummary from "./shared/FormErrorSummary";
import FormField from "./shared/FormField";
import FormActions from "./shared/FormActions";
import { isValidSlug } from "@/lib/utils/slug";
import type { AdminLevel, CreateLevelData } from "../types";

interface LevelFormProps {
  initialData?: Partial<AdminLevel>;
  onSave: (data: CreateLevelData) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
  mode: "create" | "edit";
}

export default function LevelForm({ initialData, onSave, onCancel, loading = false, mode }: LevelFormProps) {
  const { formData, errors, handleInputChange, handleSlugChange, validateForm, setFieldErrors } = useFormValidation({
    initialData,
    fields: ["slug"],
    validationRules: LEVEL_VALIDATION_RULES
  });

  const { saving, handleSubmit } = useFormSubmission({
    onSave,
    formData,
    validateForm,
    setFieldErrors,
    dataTransform: (data) => ({
      slug: data.slug.trim()
    })
  });

  const isFormValid = () => {
    return formData.slug.trim().length > 0 && isValidSlug(formData.slug);
  };

  const handleSlugInputChange = (_field: string, value: string) => {
    handleSlugChange(value);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <RequiredFieldsNotice />
      <FormErrorSummary errors={errors} />

      <FormField
        type="text"
        name="slug"
        label="Slug"
        value={formData.slug}
        onChange={handleSlugInputChange}
        error={errors.slug}
        placeholder="level-slug"
        className="font-mono text-sm"
        helpText="URL-friendly identifier for this level."
        required
      />

      <FormActions
        onCancel={onCancel}
        submitLabel={mode === "create" ? "Create Level" : "Save Changes"}
        loading={saving || loading}
        disabled={!isFormValid()}
      />
    </form>
  );
}
