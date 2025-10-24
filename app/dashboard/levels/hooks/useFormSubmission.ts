"use client";
import { useState } from "react";
import { ApiError } from "@/lib/api/client";

interface UseFormSubmissionProps {
  onSave: (data: any) => Promise<void>;
  formData: Record<string, any>;
  validateForm: () => boolean;
  setFieldErrors: (errors: Record<string, string>) => void;
  errorParser?: (message: string) => Record<string, string>;
  dataTransform?: (data: Record<string, any>) => any;
}

export function useFormSubmission({
  onSave,
  formData,
  validateForm,
  setFieldErrors,
  errorParser,
  dataTransform
}: UseFormSubmissionProps) {
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      setSaving(true);
      
      let transformedData = formData;
      
      // Apply data transformation if provided
      if (dataTransform) {
        transformedData = dataTransform(formData);
      } else {
        // Default transformation - trim string fields
        transformedData = Object.keys(formData).reduce((acc, key) => {
          const value = formData[key];
          if (typeof value === 'string') {
            acc[key] = value.trim();
          } else {
            acc[key] = value;
          }
          return acc;
        }, {} as Record<string, any>);
      }

      await onSave(transformedData);
    } catch (error) {
      console.error("Failed to save:", error);
      
      // Handle API validation errors
      if (error instanceof ApiError && error.status === 422) {
        const errorData = error.data as { error?: { message?: string } };
        const errorMessage = errorData?.error?.message;
        
        if (errorMessage && errorParser) {
          // Parse backend validation errors using provided parser
          const fieldErrors = errorParser(errorMessage);
          setFieldErrors(fieldErrors);
        } else {
          setFieldErrors({ general: "Validation failed. Please check your input." });
        }
      } else if (error instanceof ApiError) {
        setFieldErrors({ general: `API Error: ${error.status} ${error.statusText}` });
      } else if (error instanceof Error) {
        setFieldErrors({ general: error.message });
      } else {
        setFieldErrors({ general: "Failed to save. Please try again." });
      }
    } finally {
      setSaving(false);
    }
  };

  return {
    saving,
    handleSubmit
  };
}