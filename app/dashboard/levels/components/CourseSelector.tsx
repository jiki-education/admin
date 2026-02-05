import { useCallback, useEffect, useState } from "react";
import type { Course } from "@/lib/api/courses";
import { getCourses } from "@/lib/api/courses";

interface CourseSelectorProps {
  selectedCourseSlug: string | undefined;
  onCourseChange: (courseSlug: string) => void;
}

export default function CourseSelector({ selectedCourseSlug, onCourseChange }: CourseSelectorProps) {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadCourses() {
      try {
        const data = await getCourses();
        setCourses(data);
        if (!selectedCourseSlug && data.length > 0) {
          onCourseChange(data[0].slug);
        }
      } catch (err) {
        console.error("Failed to load courses:", err);
      } finally {
        setLoading(false);
      }
    }
    void loadCourses();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      onCourseChange(e.target.value);
    },
    [onCourseChange]
  );

  if (loading) {
    return (
      <div className="w-48 h-11 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
    );
  }

  return (
    <select
      value={selectedCourseSlug || ""}
      onChange={handleChange}
      className="h-11 rounded-lg border border-gray-300 px-4 py-2.5 text-sm shadow-theme-xs focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
    >
      {courses.map((course) => (
        <option key={course.slug} value={course.slug}>
          {course.title}
        </option>
      ))}
    </select>
  );
}
