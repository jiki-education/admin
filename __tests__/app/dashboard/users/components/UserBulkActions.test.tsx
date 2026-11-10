import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import UserBulkActions from "@/app/dashboard/users/components/UserBulkActions";

describe("UserBulkActions", () => {
  test("renders nothing when no users are selected", () => {
    const { container } = render(
      <UserBulkActions selectedCount={0} onApply={jest.fn()} onClearSelection={jest.fn()} />
    );
    expect(container).toBeEmptyDOMElement();
  });

  test("applies the chosen action", () => {
    const onApply = jest.fn();
    render(<UserBulkActions selectedCount={3} onApply={onApply} onClearSelection={jest.fn()} />);

    expect(screen.getByText("3 users selected")).toBeInTheDocument();
    const applyButton = screen.getByRole("button", { name: "Apply" });
    expect(applyButton).toBeDisabled();

    fireEvent.change(screen.getByRole("combobox"), { target: { value: "set_internal" } });
    expect(applyButton).toBeEnabled();

    fireEvent.click(applyButton);
    expect(onApply).toHaveBeenCalledWith("set_internal");
  });

  test("clears the selection", () => {
    const onClearSelection = jest.fn();
    render(<UserBulkActions selectedCount={1} onApply={jest.fn()} onClearSelection={onClearSelection} />);

    expect(screen.getByText("1 user selected")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Clear selection" }));
    expect(onClearSelection).toHaveBeenCalled();
  });
});
