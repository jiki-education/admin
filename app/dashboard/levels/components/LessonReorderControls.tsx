import { useState } from "react";
import { updateLesson } from "@/lib/api/levels";
import type { AdminLesson } from "../types";

interface LessonReorderControlsProps {
  lessons: AdminLesson[];
  levelId: number;
  onLessonsUpdate: (lessons: AdminLesson[]) => void;
  onError: (error: string) => void;
}

export default function LessonReorderControls({
  lessons,
  levelId,
  onLessonsUpdate,
  onError
}: LessonReorderControlsProps) {
  const [isReordering, setIsReordering] = useState(false);

  const reorderLesson = async (lessonId: number, direction: "up" | "down"): Promise<void> => {
    if (isReordering) {return;}

    setIsReordering(true);
    try {
      // Create a sorted copy of lessons
      const sortedLessons = [...lessons].sort((a, b) => a.position - b.position);
      
      // Find the lesson to move
      const currentIndex = sortedLessons.findIndex(lesson => lesson.id === lessonId);
      if (currentIndex === -1) {
        throw new Error("Lesson not found");
      }

      const currentLesson = sortedLessons[currentIndex];
      let targetIndex: number;

      if (direction === "up") {
        if (currentIndex === 0) {
          return; // Already at top
        }
        targetIndex = currentIndex - 1;
      } else {
        if (currentIndex === sortedLessons.length - 1) {
          return; // Already at bottom
        }
        targetIndex = currentIndex + 1;
      }

      const targetLesson = sortedLessons[targetIndex];

      // Swap positions using a three-step process to avoid uniqueness conflicts
      const currentPosition = currentLesson.position;
      const targetPosition = targetLesson.position;
      
      // Use a temporary position that won't conflict (negative number)
      const tempPosition = -Math.max(currentPosition, targetPosition) - 1;

      // Step 1: Move current lesson to temporary position
      await updateLesson(levelId, currentLesson.id, { position: tempPosition });
      
      // Step 2: Move target lesson to current lesson's original position  
      await updateLesson(levelId, targetLesson.id, { position: currentPosition });
      
      // Step 3: Move current lesson to target lesson's original position
      await updateLesson(levelId, currentLesson.id, { position: targetPosition });

      // Update local state optimistically
      const updatedLessons = lessons.map(lesson => {
        if (lesson.id === currentLesson.id) {
          return { ...lesson, position: targetPosition };
        }
        if (lesson.id === targetLesson.id) {
          return { ...lesson, position: currentPosition };
        }
        return lesson;
      });

      onLessonsUpdate(updatedLessons);
    } catch (error) {
      console.error("Failed to reorder lesson:", error);
      onError(error instanceof Error ? error.message : "Failed to reorder lesson");
    } finally {
      setIsReordering(false);
    }
  };

  return {
    reorderLesson,
    isReordering
  };
}