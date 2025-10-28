interface ValidationRule {
  required?: boolean;
  validator?: (value: any) => string | null;
}

interface ValidationRules {
  [fieldName: string]: ValidationRule;
}

export const LEVEL_VALIDATION_RULES: ValidationRules = {
  title: {
    required: true
  },
  slug: {
    required: true
  },
  description: {
    required: true
  }
};

export const LESSON_VALIDATION_RULES: ValidationRules = {
  title: {
    required: true
  },
  slug: {
    required: true
  },
  description: {
    required: true
  },
  type: {
    required: true
  },
  data: {
    required: true,
    validator: (value: string) => {
      if (!value || !value.trim()) {
        return "Lesson data is required";
      }

      try {
        JSON.parse(value);
        return null;
      } catch {
        return "Invalid JSON format. Please check your JSON data.";
      }
    }
  }
};

export const LESSON_TYPES = [
  { value: "exercise", label: "Exercise" },
  { value: "tutorial", label: "Tutorial" },
  { value: "video", label: "Video" },
  { value: "reading", label: "Reading" },
  { value: "quiz", label: "Quiz" },
  { value: "project", label: "Project" },
  { value: "assessment", label: "Assessment" }
];
