import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import TwoFactorVerifyForm from "@/app/verify-2fa/components/TwoFactorVerifyForm";

const mockPush = jest.fn();
const mockVerify2FA = jest.fn();
const mockClear2FAState = jest.fn();

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush })
}));

jest.mock("@/stores/authStore", () => ({
  useAuthStore: () => ({
    verify2FA: mockVerify2FA,
    clear2FAState: mockClear2FAState
  })
}));

describe("TwoFactorVerifyForm", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("renders heading and description", () => {
    render(<TwoFactorVerifyForm />);

    expect(screen.getByText("Two-Factor Authentication")).toBeInTheDocument();
    expect(screen.getByText(/enter the 6-digit code/i)).toBeInTheDocument();
  });

  test("renders OTP input and verify button", () => {
    render(<TwoFactorVerifyForm />);

    expect(screen.getAllByRole("textbox")).toHaveLength(6);
    expect(screen.getByRole("button", { name: /verify/i })).toBeInTheDocument();
  });

  test("verify button is disabled when code is incomplete", () => {
    render(<TwoFactorVerifyForm />);

    const verifyButton = screen.getByRole("button", { name: /verify/i });
    expect(verifyButton).toBeDisabled();
  });

  test("calls verify2FA and redirects on success", async () => {
    mockVerify2FA.mockResolvedValueOnce(undefined);
    render(<TwoFactorVerifyForm />);

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
      expect(mockPush).toHaveBeenCalledWith("/dashboard");
    });
  });

  test("displays error message on verification failure", async () => {
    mockVerify2FA.mockRejectedValueOnce(new Error("Invalid code"));
    render(<TwoFactorVerifyForm />);

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

  test("cancel button clears state and redirects to signin", () => {
    render(<TwoFactorVerifyForm />);

    const cancelButton = screen.getByRole("button", { name: /cancel/i });
    fireEvent.click(cancelButton);

    expect(mockClear2FAState).toHaveBeenCalled();
    expect(mockPush).toHaveBeenCalledWith("/signin");
  });
});
