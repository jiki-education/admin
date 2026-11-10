import { useState } from "react";
import { updateUser } from "@/lib/api/users";
import type { UpdateUserData, UserBulkAction } from "../types";

const ACTION_DATA: Record<UserBulkAction, UpdateUserData> = {
  set_internal: { internal: true }
};

interface UseUserBulkActionsOptions {
  onComplete: () => Promise<void>;
  onError: (message: string) => void;
}

export function useUserBulkActions({ onComplete, onError }: UseUserBulkActionsOptions) {
  const [bulkLoading, setBulkLoading] = useState(false);

  async function applyBulkAction(action: UserBulkAction, userIds: number[]) {
    setBulkLoading(true);
    try {
      const results = await Promise.allSettled(userIds.map((id) => updateUser(id, ACTION_DATA[action])));
      const failedIds = userIds.filter((_, index) => results[index].status === "rejected");

      // Reload first, because reloading clears any existing error message.
      await onComplete();
      if (failedIds.length > 0) {
        onError(`Failed to update ${failedIds.length} of ${userIds.length} users (IDs: ${failedIds.join(", ")})`);
      }
    } finally {
      setBulkLoading(false);
    }
  }

  return { bulkLoading, applyBulkAction };
}
