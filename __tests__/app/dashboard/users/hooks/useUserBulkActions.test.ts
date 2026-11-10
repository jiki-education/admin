import { renderHook, act } from "@testing-library/react";
import { useUserBulkActions } from "@/app/dashboard/users/hooks/useUserBulkActions";
import { updateUser } from "@/lib/api/users";

jest.mock("@/lib/api/users", () => ({
  updateUser: jest.fn()
}));

const mockUpdateUser = updateUser as jest.MockedFunction<typeof updateUser>;

describe("useUserBulkActions", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("sets every selected user as internal and reloads", async () => {
    mockUpdateUser.mockResolvedValue({} as never);
    const onComplete = jest.fn().mockResolvedValue(undefined);
    const onError = jest.fn();
    const { result } = renderHook(() => useUserBulkActions({ onComplete, onError }));

    await act(() => result.current.applyBulkAction("set_internal", [1, 2]));

    expect(mockUpdateUser).toHaveBeenCalledWith(1, { internal: true });
    expect(mockUpdateUser).toHaveBeenCalledWith(2, { internal: true });
    expect(onComplete).toHaveBeenCalled();
    expect(onError).not.toHaveBeenCalled();
    expect(result.current.bulkLoading).toBe(false);
  });

  test("reports failed users after reloading", async () => {
    mockUpdateUser.mockImplementation((id) =>
      id === 2 ? Promise.reject(new Error("nope")) : Promise.resolve({} as never)
    );
    const calls: string[] = [];
    const onComplete = jest.fn(() => {
      calls.push("complete");
      return Promise.resolve();
    });
    const onError = jest.fn(() => calls.push("error"));
    const { result } = renderHook(() => useUserBulkActions({ onComplete, onError }));

    await act(() => result.current.applyBulkAction("set_internal", [1, 2, 3]));

    expect(onError).toHaveBeenCalledWith("Failed to update 1 of 3 users (IDs: 2)");
    expect(calls).toEqual(["complete", "error"]);
  });
});
