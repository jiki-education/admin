import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import TwoFactorVerifyForm from "@/components/auth/TwoFactorVerifyForm";

const mockVerify2FA = jest.fn();
const mockOnSuccess = jest.fn();
const mockOnCancel = jest.fn();

jest.mock("@/stores/authStore", () => ({
  useAuthStore: () => ({
    verify2FA: mockVerify2FA
  })
}));

describe("TwoFactorVerifyForm", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("renders heading and description", () => {
    render(<TwoFactorVerifyForm onSuccess={mockOnSuccess} onCancel={mockOnCancel} />);

    expect(screen.getByText("Two-Factor Authentication")).toBeInTheDocument();
    expect(screen.getByText(/enter the 6-digit code/i)).toBeInTheDocument();
  });

  test("renders OTP input and verify button", () => {
    render(<TwoFactorVerifyForm onSuccess={mockOnSuccess} onCancel={mockOnCancel} />);

    expect(screen.getAllByRole("textbox")).toHaveLength(6);
    expect(screen.getByRole("button", { name: /verify/i })).toBeInTheDocument();
  });

  test("verify button is disabled when code is incomplete", () => {
    render(<TwoFactorVerifyForm onSuccess={mockOnSuccess} onCancel={mockOnCancel} />);

    const verifyButton = screen.getByRole("button", { name: /verify/i });
    expect(verifyButton).toBeDisabled();
  });

  test("calls verify2FA and onSuccess on success", async () => {
    mockVerify2FA.mockResolvedValueOnce(undefined);
    render(<TwoFactorVerifyForm onSuccess={mockOnSuccess} onCancel={mockOnCancel} />);

    const inputs = screen.getAllByRole("textbox");
    inputs.forEach((input, i) => {
      fireEvent.change(input, { target: { value: String(i + 1) } });
    });

    const verifyButton = screen.getByRole("button", { name: /verify/i });
    fireEvent.click(verifyButton);

    await waitFor(() => {
      expect(mockVerify2FA).toHaveBeenCalledWith("123456");
    });

    await waitFor(() => {
      expect(mockOnSuccess).toHaveBeenCalled();
    });
  });

  test("displays error message on verification failure", async () => {
    mockVerify2FA.mockRejectedValueOnce(new Error("Invalid code"));
    render(<TwoFactorVerifyForm onSuccess={mockOnSuccess} onCancel={mockOnCancel} />);

    const inputs = screen.getAllByRole("textbox");
    inputs.forEach((input, i) => {
      fireEvent.change(input, { target: { value: String(i + 1) } });
    });

    const verifyButton = screen.getByRole("button", { name: /verify/i });
    fireEvent.click(verifyButton);

    await waitFor(() => {
      expect(screen.getByText("Invalid code")).toBeInTheDocument();
    });
  });

  test("cancel button calls onCancel", () => {
    render(<TwoFactorVerifyForm onSuccess={mockOnSuccess} onCancel={mockOnCancel} />);

    const cancelButton = screen.getByRole("button", { name: /cancel/i });
    fireEvent.click(cancelButton);

    expect(mockOnCancel).toHaveBeenCalled();
  });
});
