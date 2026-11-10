import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import UserTable from "@/app/dashboard/users/components/UserTable";
import type { User } from "@/app/dashboard/users/types";

const users: User[] = [
  { id: 1, name: "Ada", email: "ada@example.com", locale: "en", admin: false },
  { id: 2, name: "Bea", email: "bea@example.com", locale: "hu", admin: true }
];

describe("UserTable selection", () => {
  test("selects a single user", () => {
    const onSelectionChange = jest.fn();
    render(<UserTable users={users} selectedIds={new Set()} onSelectionChange={onSelectionChange} />);

    fireEvent.click(screen.getByLabelText("Select user: bea@example.com"));

    expect(onSelectionChange).toHaveBeenCalledWith(new Set([2]));
  });

  test("deselects a selected user", () => {
    const onSelectionChange = jest.fn();
    render(<UserTable users={users} selectedIds={new Set([1, 2])} onSelectionChange={onSelectionChange} />);

    fireEvent.click(screen.getByLabelText("Select user: ada@example.com"));

    expect(onSelectionChange).toHaveBeenCalledWith(new Set([2]));
  });

  test("select all toggles every user on the page", () => {
    const onSelectionChange = jest.fn();
    const { rerender } = render(
      <UserTable users={users} selectedIds={new Set()} onSelectionChange={onSelectionChange} />
    );

    fireEvent.click(screen.getByLabelText("Select all users"));
    expect(onSelectionChange).toHaveBeenLastCalledWith(new Set([1, 2]));

    rerender(<UserTable users={users} selectedIds={new Set([1, 2])} onSelectionChange={onSelectionChange} />);
    expect(screen.getByLabelText("Select all users")).toBeChecked();

    fireEvent.click(screen.getByLabelText("Select all users"));
    expect(onSelectionChange).toHaveBeenLastCalledWith(new Set());
  });
});
