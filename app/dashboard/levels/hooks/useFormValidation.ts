"use client";
import { useState, useEffect } from "react";
import { isValidSlug } from "@/lib/utils/slug";

interface ValidationRules {
  [fieldName: string]: {
    required?: boolean;
    validator?: (value: any) => string | null;
  };
}

interface UseFormValidationProps {
  initialData?: Record<string, any>;
  fields: string[];
  validationRules: ValidationRules;
}

export function useFormValidation({ initialData, fields, validationRules }: UseFormValidationProps) {
  const [formData, setFormData] = useState<Record<string, any>>(() => {
    const initial: Record<string, any> = {};
    fields.forEach((field) => {
      if (initialData && field === "data" && initialData[field]) {
        initial[field] =
          typeof initialData[field] === "string" ? initialData[field] : JSON.stringify(initialData[field], null, 2);
      } else {
        let defaultValue = "";
        if (field === "data") {
          defaultValue = "{}";
        } else if (field === "type") {
          defaultValue = "exercise";
        }
        initial[field] = (initialData && initialData[field]) || defaultValue;
      }
    });
    return initial;
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!initialData || Object.keys(initialData).length === 0) {
      return;
    }

    const newFormData: Record<string, any> = {};
    fields.forEach((field) => {
      if (field === "data" && initialData[field]) {
        newFormData[field] =
          typeof initialData[field] === "string" ? initialData[field] : JSON.stringify(initialData[field], null, 2);
      } else {
        newFormData[field] = initialData[field] || "";
      }
    });
    setFormData(newFormData);
  }, [initialData, fields]);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value
    }));

    // Clear field error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: ""
      }));
    }
  };

  const handleSlugChange = (value: string) => {
    handleInputChange("slug", value);
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    fields.forEach((field) => {
      const rules = validationRules[field];
      if (!rules) {
        return;
      }

      const value = formData[field];

      // Check required fields
      if (rules.required && (!value || (typeof value === "string" && !value.trim()))) {
        newErrors[field] = `${field.charAt(0).toUpperCase() + field.slice(1)} is required`;
        return;
      }

      // Special validation for slug
      if (field === "slug" && value && !isValidSlug(value)) {
        newErrors[field] = "Slug must contain only lowercase letters, numbers, and hyphens";
        return;
      }

      // Custom validation
      if (rules.validator && value) {
        const error = rules.validator(value);
        if (error) {
          newErrors[field] = error;
        }
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const setFieldErrors = (fieldErrors: Record<string, string>) => {
    setErrors(fieldErrors);
  };

  const clearErrors = () => {
    setErrors({});
  };

  return {
    formData,
    errors,
    handleInputChange,
    handleSlugChange,
    validateForm,
    setFieldErrors,
    clearErrors,
    setFormData
  };
}
